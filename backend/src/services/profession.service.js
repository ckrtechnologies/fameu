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
      .order('priority', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Get all professions (including inactive)
   */
  async getAllProfessionsAdmin() {
    const { data, error } = await supabase
      .from('artist_professions')
      .select('*')
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
