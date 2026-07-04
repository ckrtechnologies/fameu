import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Try to import notification service if it exists
let NotificationService;
try {
  const NotificationServiceModule = await import('./notification.service.js');
  NotificationService = NotificationServiceModule.default || NotificationServiceModule;
} catch (e) {
  console.warn("NotificationService not found, push notifications will be skipped.", e);
}

class CommentsService {
  async getComments(type, targetId) {
    let tableName, targetColumn;
    if (type === 'profile') {
      tableName = 'profile_comments';
      targetColumn = 'profile_id';
    } else if (type === 'artist_profile') {
      tableName = 'artist_profile_comments';
      targetColumn = 'profile_id';
    } else {
      tableName = 'audition_comments';
      targetColumn = 'audition_id';
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(`
        *,
        user:users!user_id (id, display_name, avatar_url, role, artist_profiles(full_name), hiring_profiles(company_name))
      `)
      .eq(targetColumn, targetId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return this._buildCommentTree(data);
  }

  async addComment(type, targetId, userId, content, parentId = null) {
    let tableName, targetColumn;
    if (type === 'profile') {
      tableName = 'profile_comments';
      targetColumn = 'profile_id';
    } else if (type === 'artist_profile') {
      tableName = 'artist_profile_comments';
      targetColumn = 'profile_id';
    } else {
      tableName = 'audition_comments';
      targetColumn = 'audition_id';
    }

    const insertData = {
      [targetColumn]: targetId,
      user_id: userId,
      content,
      parent_id: parentId,
    };

    const { data, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select(`*, user:users!user_id (id, display_name, avatar_url, role, artist_profiles(full_name), hiring_profiles(company_name))`)
      .single();

    if (error) throw error;

    await this._notifyStakeholders(type, targetId, userId, parentId, content);

    return data;
  }

  async updateComment(type, commentId, userId, content) {
    let tableName;
    if (type === 'profile') tableName = 'profile_comments';
    else if (type === 'artist_profile') tableName = 'artist_profile_comments';
    else tableName = 'audition_comments';

    // Verify ownership
    const { data: existing } = await supabase.from(tableName).select('user_id').eq('id', commentId).single();
    if (!existing) throw new Error('Comment not found');
    if (existing.user_id !== userId) throw new Error('Unauthorized to edit this comment');

    const { data, error } = await supabase
      .from(tableName)
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .select(`*, user:users!user_id (id, display_name, avatar_url, role, artist_profiles(full_name), hiring_profiles(company_name))`)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComment(type, commentId, userId) {
    let tableName;
    if (type === 'profile') tableName = 'profile_comments';
    else if (type === 'artist_profile') tableName = 'artist_profile_comments';
    else tableName = 'audition_comments';

    // Verify ownership
    const { data: existing } = await supabase.from(tableName).select('user_id').eq('id', commentId).single();
    if (!existing) throw new Error('Comment not found');
    
    // allow deletion only by owner
    if (existing.user_id !== userId) throw new Error('Unauthorized to delete this comment');

    const { error } = await supabase.from(tableName).delete().eq('id', commentId);
    if (error) throw error;
    
    return { success: true };
  }

  _buildCommentTree(comments) {
    const map = new Map();
    const roots = [];

    comments.forEach(comment => {
      map.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const node = map.get(comment.id);
      if (comment.parent_id) {
        const parent = map.get(comment.parent_id);
        if (parent) {
          parent.replies.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async _notifyStakeholders(type, targetId, commenterId, parentId, content) {
    try {
      if (!NotificationService) return;

      const commenterRes = await supabase.from('users').select('display_name, artist_profiles(full_name), hiring_profiles(company_name)').eq('id', commenterId).single();
      const commenterName = commenterRes.data?.display_name || commenterRes.data?.artist_profiles?.[0]?.full_name || commenterRes.data?.artist_profiles?.full_name || commenterRes.data?.hiring_profiles?.[0]?.company_name || commenterRes.data?.hiring_profiles?.company_name || 'Someone';

      let ownerId = null;
      let targetName = '';
      if (type === 'profile') {
        const { data } = await supabase.from('hiring_profiles').select('user_id, company_name').eq('id', targetId).single();
        if (data) {
          ownerId = data.user_id;
          targetName = data.company_name;
        }
      } else if (type === 'audition') {
        const { data } = await supabase.from('auditions').select('hiring_id, title').eq('id', targetId).single();
        if (data) {
          const hiringRes = await supabase.from('hiring_profiles').select('user_id').eq('id', data.hiring_id).single();
          if (hiringRes.data) {
            ownerId = hiringRes.data.user_id;
            targetName = data.title;
          }
        }
      }

      let parentAuthorId = null;
      if (parentId) {
        const tableName = type === 'profile' ? 'profile_comments' : 'audition_comments';
        const { data } = await supabase.from(tableName).select('user_id').eq('id', parentId).single();
        if (data) {
          parentAuthorId = data.user_id;
        }
      }

      // Notify the author of the parent comment if it's a reply
      if (parentAuthorId && parentAuthorId !== commenterId) {
        const body = `${commenterName} replied to your comment`;
        if (typeof NotificationService.sendPushNotification === 'function') {
           await NotificationService.sendPushNotification(parentAuthorId, 'New Reply', body, { type: 'comment_reply', targetId, targetType: type });
        } else if (typeof NotificationService.sendNotification === 'function') {
           await NotificationService.sendNotification(parentAuthorId, 'New Reply', body, { type: 'comment_reply', targetId, targetType: type });
        }
      }

      // Notify the owner of the profile or audition, as long as they are not the commenter AND not the parent author (who already got a reply notification)
      if (ownerId && ownerId !== commenterId && ownerId !== parentAuthorId) {
        const body = `${commenterName} commented on ${type === 'profile' ? 'your profile' : `your audition "${targetName}"`}`;
        if (typeof NotificationService.sendPushNotification === 'function') {
           await NotificationService.sendPushNotification(ownerId, 'New Comment', body, { type: 'comment', targetId, targetType: type });
        } else if (typeof NotificationService.sendNotification === 'function') {
           await NotificationService.sendNotification(ownerId, 'New Comment', body, { type: 'comment', targetId, targetType: type });
        }
      }
    } catch (error) {
      console.error("Failed to send comment notifications:", error);
    }
  }
}

export default new CommentsService();
