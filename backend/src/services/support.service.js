import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const createSupportTicket = async (ticketData) => {
  const { user_id, user_type, subject, message } = ticketData;
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([
      {
        user_id,
        user_type,
        subject,
        message,
        status: 'open'
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const getAllSupportTickets = async () => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      users:user_id (id, display_name, email, mobile, role)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const updateSupportTicketStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
