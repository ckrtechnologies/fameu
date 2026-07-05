import supabase from "../../../config/supabase.js";

const dashboardController = {
  getDashboardData: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // 1. Get Hiring Profile
      const { data: profile } = await supabase
        .from('hiring_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
         return res.status(200).json({ success: true, data: { profile: null } });
      }

      // 2. Get Auditions
      const { data: auditions, error: auditionsError } = await supabase
        .from('auditions')
        .select('*, applications(id, status, created_at, artist_profiles(id, full_name, categories, avatar_url, users(id, display_name, username)))')
        .eq('hiring_id', profile.id)
        .order('created_at', { ascending: false });

      const allAuditions = auditions || [];
      const activeAuditions = allAuditions.filter(a => a.status === 'active');
      const draftAuditions = allAuditions.filter(a => a.status === 'draft');

      // 3. Process Applicants & Stats
      let allApplicants = [];
      allAuditions.forEach(aud => {
        if (aud.applications) {
          allApplicants = [...allApplicants, ...aud.applications.map(app => {
            const artist = app.artist_profiles || {};
            const user = artist.users || {};
            return {
              ...app,
              audition_title: aud.title,
              users: {
                id: artist.id,
                display_name: user.display_name,
                username: user.username,
                avatar_url: artist.avatar_url,
                artist_profiles: [{
                  full_name: artist.full_name,
                  category: artist.categories && artist.categories.length > 0 ? artist.categories[0] : 'Artist'
                }]
              }
            };
          })];
        }
      });

      // Sort by newest first
      allApplicants.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const recentApplicants = allApplicants.slice(0, 5);
      
      const stats = {
        totalApplicants: allApplicants.length,
        pending: allApplicants.filter(a => a.status === 'pending').length,
        shortlisted: allApplicants.filter(a => a.status === 'shortlisted').length,
        hired: allApplicants.filter(a => a.status === 'hired').length,
        rejected: allApplicants.filter(a => a.status === 'rejected').length,
        followers: 0
      };

      // 4. Followers Count
      const { count: followersCount } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      stats.followers = followersCount || 0;

      // 5. Unread Messages Count
      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false);

      // 6. Recommended Talent (Trending or random artists)
      const { data: recommendedTalent } = await supabase
        .from('artist_profiles')
        .select('id, full_name, category, photo_urls, city, user_id, users(avatar_url, username)')
        .limit(10)
        .order('created_at', { ascending: false });

      // 7. Upcoming Interviews (Using shortlisted applicants as a proxy for interviews for now)
      const upcomingInterviews = allApplicants
        .filter(a => a.status === 'shortlisted')
        .slice(0, 3); // top 3 upcoming

      res.status(200).json({
        success: true,
        data: {
          profile,
          stats,
          activeAuditions,
          draftAuditions,
          recentApplicants,
          recommendedTalent: recommendedTalent || [],
          upcomingInterviews,
          unreadMessagesCount: unreadCount || 0,
          allApplicants // Include for charts
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default dashboardController;
