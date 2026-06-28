import supabase from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

class AuthService {
  /**
   * Request OTP via MSG91
   */
  async sendOtp(identifier) {
    // Generate a random 4 digit OTP for dev (Replace with actual generation)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 min expiry

    // Save to otp_store in Supabase
    const { error } = await supabase
      .from('otp_store')
      .upsert(
        { identifier, otp, expires_at: expiresAt.toISOString() },
        { onConflict: 'identifier' }
      );

    if (error) throw new Error(`Failed to store OTP: ${error.message}`);

    // Call MSG91 API (Mocked if MSG91_AUTH_KEY is not present)
    let isMocked = false;
    if (process.env.MSG91_AUTH_KEY && !identifier.includes('@')) {
      try {
        await axios.get(`https://api.msg91.com/api/v5/otp`, {
          params: {
            authkey: process.env.MSG91_AUTH_KEY,
            template_id: process.env.MSG91_TEMPLATE_ID,
            mobile: identifier,
            otp: otp
          }
        });
        console.log(`MSG91 OTP sent to ${identifier}`);
      } catch (err) {
        console.error('MSG91 Error:', err.response?.data || err.message);
        throw new Error('Failed to send SMS via MSG91');
      }
    } else {
      console.log(`🔧 [DEV MODE] OTP for ${identifier} is ${otp}`);
      isMocked = true;
    }

    return { message: 'OTP sent successfully', devOtp: isMocked ? otp : undefined };
  }

  /**
   * Verify OTP and issue JWT
   */
  async verifyOtp(identifier, otp) {
    // 1. Check OTP in DB
    const { data, error } = await supabase
      .from('otp_store')
      .select('*')
      .eq('identifier', identifier)
      .single();

    if (error || !data) throw new Error('Invalid or expired OTP');
    
    // 2. Verify match and expiry
    if (data.otp !== otp) throw new Error('Incorrect OTP');
    if (new Date(data.expires_at) < new Date()) throw new Error('OTP has expired');

    // 3. Clear OTP
    await supabase.from('otp_store').delete().eq('identifier', identifier);

    // 4. Find or Create User
    let user = await this.findUserByIdentifier(identifier);
    let isNewUser = false;

    if (!user) {
      // If user doesn't exist, we create them via Supabase Admin API
      // so they exist in auth.users and the trigger handles public.users
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        email_confirm: true,
        phone_confirm: true,
      });

      if (authErr) throw new Error(`Failed to create user: ${authErr.message}`);
      user = authData.user;
      isNewUser = true;
      
      // Fetch the public.users row that was just created by the trigger
      const { data: publicUser } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (publicUser) user = publicUser;
    }

    // 5. Generate JWT for the Express API
    const token = this.generateToken(user);
    return { token, user, isNewUser };
  }

  /**
   * Social Login (Verifies Supabase token and returns API JWT)
   */
  async socialLogin(supabaseToken) {
    // 1. Verify the Supabase token using their API
    const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
    if (error || !user) throw new Error('Invalid Supabase token');

    // 2. Get public user
    const { data: publicUser } = await supabase.from('users').select('*').eq('id', user.id).single();

    // 3. Generate our Express API JWT
    const token = this.generateToken(publicUser || user);
    return { token, user: publicUser || user, isNewUser: !publicUser };
  }

  // --- Helper Methods ---

  async findUserByIdentifier(identifier) {
    const isEmail = identifier.includes('@');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq(isEmail ? 'email' : 'mobile', identifier)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
    return data;
  }

  generateToken(user) {
    // We use the Supabase JWT secret so the token is compatible
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'super-secret-dev-key';
    return jwt.sign(
      { 
        sub: user.id, 
        role: user.role || 'artist', 
        aud: 'authenticated' 
      }, 
      secret, 
      { expiresIn: '7d' }
    );
  }

  async deleteAccount(userId) {
    // Deleting the user from Supabase Auth will cascade delete their profile in public.users
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(`Failed to delete account: ${error.message}`);
    }
    return { success: true };
  }
}

export default new AuthService();
