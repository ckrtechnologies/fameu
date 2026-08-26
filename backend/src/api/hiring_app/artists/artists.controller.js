import supabase from "../../../config/supabase.js";
import artistService from "../../../services/artist.service.js";
import notificationService from "../../../services/notification.service.js";
import chatService from "../../../services/chat.service.js";

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
          users!inner (
            display_name,
            email,
            username
          )
        `)
        .eq('users.is_blacklisted', false);

      if (category) {
        const rawCats = category.split(',').map(c => c.trim()).filter(Boolean);
        const expandedCats = [...new Set(rawCats.flatMap(c => [
          c,
          c.toLowerCase(),
          c.toUpperCase(),
          c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
          c.replace(/[-_]/g, ' '),
          c.replace(/\s+/g, '-'),
          c.replace(/\s+/g, '_')
        ]))];
        query = query.overlaps('categories', expandedCats);
      }
      if (req.query.language) {
        const rawLangs = req.query.language.split(',').map(l => l.trim()).filter(Boolean);
        const expandedLangs = [...new Set(rawLangs.flatMap(l => [
          l,
          l.toLowerCase(),
          l.toUpperCase(),
          l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()
        ]))];
        query = query.overlaps('languages', expandedLangs);
      }
      if (gender) query = query.eq('gender', gender);
      if (location) query = query.ilike('location', `%${location}%`);
      if (minAge) query = query.gte('age', minAge);
      if (maxAge) query = query.lte('age', maxAge);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      let results = data || [];
      if (q && q.trim()) {
        const queryTerm = q.trim().toLowerCase();
        results = results.filter(item => {
          const name = (item.users?.display_name || item.users?.name || item.full_name || '').toLowerCase();
          const username = (item.users?.username || '').toLowerCase();
          const email = (item.users?.email || '').toLowerCase();
          const bio = (item.bio || '').toLowerCase();
          const loc = (item.location || item.city || '').toLowerCase();
          const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : (item.skills || '').toLowerCase();
          const categories = Array.isArray(item.categories) ? item.categories.join(' ').toLowerCase() : (item.categories || '').toLowerCase();
          const languages = Array.isArray(item.languages) ? item.languages.join(' ').toLowerCase() : (item.languages || '').toLowerCase();
          
          return name.includes(queryTerm) ||
                 username.includes(queryTerm) ||
                 email.includes(queryTerm) ||
                 bio.includes(queryTerm) ||
                 loc.includes(queryTerm) ||
                 skills.includes(queryTerm) ||
                 categories.includes(queryTerm) ||
                 languages.includes(queryTerm);
        });
      }

      res.status(200).json({ success: true, data: results });
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
      const { audition_id, message } = req.body;

      // Get hiring profile id
      const { data: hiringProfile } = await supabase.from('hiring_profiles').select('id').eq('user_id', req.user.id).single();
      if (!hiringProfile) {
        return res.status(403).json({ success: false, error: 'Hiring profile not found' });
      }
      const hiringId = hiringProfile.id;

      // Ensure the audition belongs to the hiring company
      const { data: audition } = await supabase.from('auditions').select('hiring_id, title, thumbnail_url').eq('id', audition_id).single();
      if (!audition || audition.hiring_id != hiringId) {
        return res.status(403).json({ success: false, error: 'Not authorized to invite for this audition' });
      }

      // Get artist's user_id from artist_profiles
      const { data: artistProfile } = await supabase.from('artist_profiles').select('user_id').eq('id', artistId).single();
      if (!artistProfile) {
        return res.status(404).json({ success: false, error: 'Artist not found' });
      }

      // Send chat message (this automatically sends a chat push notification)
      const content = `I would like to invite you to audition for: ${audition.title}.${message ? `\n\nMessage: ${message}` : ''}\n\n[AUDITION_INVITE:${audition_id}|${audition.title}|${audition.thumbnail_url || ''}]`;
      const conversation = await chatService.getOrCreateConversation(req.user.id, artistProfile.user_id);
      await chatService.saveMessage(conversation.id, req.user.id, content);

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

      // Get artist's user_id from artist_profiles
      const { data: artistProfile } = await supabase.from('artist_profiles').select('user_id').eq('id', artistId).single();
      if (!artistProfile) {
        return res.status(404).json({ success: false, error: 'Artist not found' });
      }

      const { error } = await supabase.from('blacklist').insert([{
        user_id: artistProfile.user_id,
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

      // Get artist's user_id from artist_profiles
      const { data: artistProfile } = await supabase.from('artist_profiles').select('user_id').eq('id', artistId).single();
      if (!artistProfile) {
        return res.status(404).json({ success: false, error: 'Artist not found' });
      }

      const { error } = await supabase.from('fraud_reports').insert([{
        reported_by: hiringId,
        reported_user_id: artistProfile.user_id,
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
