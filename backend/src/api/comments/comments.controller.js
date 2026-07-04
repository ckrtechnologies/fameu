import commentsService from '../../services/comments.service.js';

export const getComments = async (req, res, next) => {
  try {
    const { type, targetId } = req.params;
    if (!['profile', 'artist_profile', 'audition'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }
    const comments = await commentsService.getComments(type, targetId);
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { type, targetId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    if (!['profile', 'artist_profile', 'audition'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const comment = await commentsService.addComment(type, targetId, userId, content, parentId);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { type, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!['profile', 'artist_profile', 'audition'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }

    const comment = await commentsService.updateComment(type, commentId, userId, content);
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { type, commentId } = req.params;
    const userId = req.user.id;

    if (!['profile', 'artist_profile', 'audition'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }

    await commentsService.deleteComment(type, commentId, userId);
    res.status(200).json({ success: true, data: { id: commentId } });
  } catch (error) {
    next(error);
  }
};
