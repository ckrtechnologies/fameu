import supabase from "../../../config/supabase.js";

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
          user:users (
            name,
            email
          )
        `);

      if (category) query = query.eq('category', category);
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
      const { data, error } = await supabase
        .from('artist_profiles')
        .select(`
          *,
          user:users (
            name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, error: 'Artist not found' });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

export default artistsController;
