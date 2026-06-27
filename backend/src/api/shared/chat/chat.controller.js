import chatService from '../../../services/chat.service.js';

class ChatController {
  
  /**
   * Get all conversations (Inbox)
   */
  async getInbox(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await chatService.getConversations(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get chat history for a specific conversation
   */
  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const result = await chatService.getMessages(conversationId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Initialize a new conversation (Usually called by Hiring app when shortlisting)
   */
  async startConversation(req, res, next) {
    try {
      const { targetUserId, auditionId } = req.body;
      const myId = req.user.id;

      if (!targetUserId) {
        return res.status(400).json({ success: false, error: 'targetUserId is required' });
      }

      const result = await chatService.getOrCreateConversation(myId, targetUserId, auditionId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export default new ChatController();
