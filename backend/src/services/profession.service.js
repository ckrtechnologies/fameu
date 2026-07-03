import supabase from '../config/supabase.js';

export const professionService = {
  /**
   * Get all active professions along with their dynamic fields
   */
  async getProfessions() {
    const { data, error } = await supabase
      .from('artist_professions')
      .select(`
        *,
        profession_fields (*)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Get all professions (including inactive)
   */
  async getAllProfessionsAdmin() {
    const { data, error } = await supabase
      .from('artist_professions')
      .select(`
        *,
        profession_fields (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Create a new profession
   */
  async createProfession(payload) {
    const { data, error } = await supabase
      .from('artist_professions')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Update profession
   */
  async updateProfession(id, payload) {
    const { data, error } = await supabase
      .from('artist_professions')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Hard Delete a profession
   */
  async deleteProfession(id) {
    const { data, error } = await supabase
      .from('artist_professions')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Add a field to a profession
   */
  async addProfessionField(professionId, fieldPayload) {
    const { data, error } = await supabase
      .from('profession_fields')
      .insert({ ...fieldPayload, profession_id: professionId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Update a profession field
   */
  async updateProfessionField(fieldId, fieldPayload) {
    const { data, error } = await supabase
      .from('profession_fields')
      .update({ ...fieldPayload, updated_at: new Date().toISOString() })
      .eq('id', fieldId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  /**
   * Admin: Delete a profession field
   */
  async deleteProfessionField(fieldId) {
    const { error } = await supabase
      .from('profession_fields')
      .delete()
      .eq('id', fieldId);

    if (error) throw error;
    return true;
  }
};
