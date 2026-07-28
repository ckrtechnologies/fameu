import express from 'express';
import { createSupportTicket, getAllSupportTickets, updateSupportTicketStatus } from '../../services/support.service.js';

const router = express.Router();

// POST /api/support/contact - Create a new support ticket (Used by mobile apps)
router.post('/contact', async (req, res) => {
  try {
    const { user_id, user_type, subject, message } = req.body;
    
    if (!user_id || !user_type || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticket = await createSupportTicket({ user_id, user_type, subject, message });
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// GET /api/support/tickets - Get all support tickets (Used by admin panel)
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await getAllSupportTickets();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

// PUT /api/support/tickets/:id/status - Update ticket status (Used by admin panel)
router.put('/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedTicket = await updateSupportTicketStatus(id, status);
    res.status(200).json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating support ticket status:', error);
    res.status(500).json({ error: 'Failed to update support ticket status' });
  }
});

export default router;
