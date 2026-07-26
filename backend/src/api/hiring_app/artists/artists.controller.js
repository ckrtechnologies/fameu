import supabase from "../../../config/supabase.js";
import artistService from "../../../services/artist.service.js";

const artistsController = {
  // Search and Discover Artists
  searchArtists: async (req, res, next) => {
    try {
      const { category, minAge, maxAge, gender, location, q } = req.query;
      
      // We will query the artist_profiles table and join with users to get name/email
      let query = supabase
        .from('artist_profiles')
        .select(`
          *,
          users (
            display_name,
            email,
            username
          )
        `);

      if (category) {
        const cats = category.split(',').map(c => c.trim().toLowerCase());
        query = query.overlaps('categories', cats);
      }
      if (req.query.language) {
        const langs = req.query.language.split(',').map(l => l.trim().toLowerCase());
        query = query.overlaps('languages', langs);
      }
      if (gender) query = query.eq('gender', gender);
      if (location) query = query.ilike('location', `%${location}%`);
      if (minAge) query = query.gte('age', minAge);
      if (maxAge) query = query.lte('age', maxAge);

      // Simple keyword search across skills and bio if q is provided
      if (q) {
        query = query.or(`skills.ilike.%${q}%,bio.ilike.%${q}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // Get a specific artist's full profile
  getArtistDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await artistService.getFullProfileByArtistId(id);

      if (!data) return res.status(404).json({ success: false, error: 'Artist not found' });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  // Invite an artist to an audition
  inviteArtist: async (req, res, next) => {
    try {
      const { id: artistId } = req.params;
      const { audition_id } = req.body;
      const hiringId = req.user.id;

      // Ensure the audition belongs to the hiring company
      const { data: audition } = await supabase.from('auditions').select('hiring_id, title').eq('id', audition_id).single();
      if (!audition || audition.hiring_id !== hiringId) {
        return res.status(403).json({ success: false, error: 'Not authorized to invite for this audition' });
      }

      // Insert notification
      const { error } = await supabase.from('notifications').insert([{
        user_id: artistId,
        type: 'invite',
        message: `You have been invited to audition for: ${audition.title}`,
        related_id: audition_id
      }]);

      if (error) throw error;
      res.status(200).json({ success: true, message: 'Invitation sent' });
    } catch (error) {
      next(error);
    }
  },

  // Block an artist
  blockArtist: async (req, res, next) => {
    try {
      const { id: artistId } = req.params;
      const { reason } = req.body;
      const hiringId = req.user.id;

      const { error } = await supabase.from('blacklist').insert([{
        user_id: artistId,
        reason: reason || 'Blocked by hiring company',
        added_by: hiringId
      }]);

      if (error) throw error;
      res.status(200).json({ success: true, message: 'Artist blocked' });
    } catch (error) {
      next(error);
    }
  },

  // Report an artist profile
  reportArtist: async (req, res, next) => {
    try {
      const { id: artistId } = req.params;
      const { reason, description } = req.body;
      const hiringId = req.user.id;

      const { error } = await supabase.from('fraud_reports').insert([{
        reported_by: hiringId,
        reported_user_id: artistId,
        reason,
        description
      }]);

      if (error) throw error;
      res.status(200).json({ success: true, message: 'Report submitted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

export default artistsController;
