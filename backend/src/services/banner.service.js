import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const getAllBanners = async (includeInactive = false) => {
  let query = supabase.from('banners').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const createBanner = async (bannerData) => {
  const { data, error } = await supabase
    .from('banners')
    .insert([bannerData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateBanner = async (id, bannerData) => {
  const { data, error } = await supabase
    .from('banners')
    .update(bannerData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteBanner = async (id) => {
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};
