import supabase from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  async verifyOtp(identifier, otp, role) {
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
      let authErr = null;
      let authUser = null;

      const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        email_confirm: true,
        phone_confirm: true,
      });

      if (createErr) {
        if (createErr.message.includes('already registered')) {
          // Find the user in auth.users
          const { data: listData } = await supabase.auth.admin.listUsers();
          const existingUser = listData?.users?.find(u => u.email === identifier || u.phone === identifier.replace('+', ''));
          
          if (existingUser) {
            authUser = existingUser;
            // Try to recreate their public.users row since it's missing
            const { data: publicUser, error: insertErr } = await supabase.from('users').insert({
              id: authUser.id,
              email: authUser.email,
              mobile: authUser.phone,
              role: 'artist' // default role
            }).select().single();
            
            if (insertErr) throw new Error(`Failed to restore public profile: ${insertErr.message}`);
            
            if (role && role !== 'artist') {
              await supabase.from('users').update({ role }).eq('id', authUser.id);
            }
            
            user = publicUser;
          } else {
            throw new Error(`Failed to create user: ${createErr.message}`);
          }
        } else {
          throw new Error(`Failed to create user: ${createErr.message}`);
        }
      } else {
        authUser = authData.user;
        
        // Update the role immediately if provided
        if (role) {
          await supabase.from('users').update({ role }).eq('id', authUser.id);
        }
        
        // Fetch the public.users row that was just created by the trigger
        const { data: publicUser } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        if (publicUser) user = publicUser;
      }

      isNewUser = true;
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
    // 1. Fetch user's profiles to get media URLs
    const { data: artistProfile } = await supabase
      .from('artist_profiles')
      .select('avatar_url, photo_urls, video_url, resume_url, audio_url')
      .eq('user_id', userId)
      .single();

    const { data: hiringProfile } = await supabase
      .from('hiring_profiles')
      .select('logo_url')
      .eq('user_id', userId)
      .single();

    const filesToDelete = [];
    
    if (artistProfile) {
      if (artistProfile.avatar_url) filesToDelete.push({ url: artistProfile.avatar_url, type: 'artist' });
      if (artistProfile.photo_urls && Array.isArray(artistProfile.photo_urls)) {
        artistProfile.photo_urls.forEach(url => filesToDelete.push({ url, type: 'artist' }));
      }
      if (artistProfile.video_url) filesToDelete.push({ url: artistProfile.video_url, type: 'artist' });
      if (artistProfile.resume_url) filesToDelete.push({ url: artistProfile.resume_url, type: 'artist' });
      if (artistProfile.audio_url) filesToDelete.push({ url: artistProfile.audio_url, type: 'artist' });
    }
    
    if (hiringProfile) {
      if (hiringProfile.logo_url) filesToDelete.push({ url: hiringProfile.logo_url, type: 'company' });
    }

    // 2. Try deleting the user from Supabase Auth (cascades to public.users)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Failed to delete user from auth.users:', error);
      // Fallback: manually delete from public.users if auth deletion fails
      const { error: publicError } = await supabase.from('users').delete().eq('id', userId);
      
      throw new Error(`Failed to delete account from auth schema. Error: ${error.message}. DB Fallback: ${publicError ? 'Failed' : 'Success'}`);
    }

    // 3. Delete physical files from disk
    filesToDelete.forEach(file => {
      try {
        const filename = file.url.split('/').pop();
        const filePath = path.join(__dirname, `../../../uploads/${file.type}`, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete file ${file.url}:`, err);
      }
    });

    return { success: true };
  }
}

export default new AuthService();
