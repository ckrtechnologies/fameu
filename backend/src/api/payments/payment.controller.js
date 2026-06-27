import { Cashfree, CFEnvironment } from "cashfree-pg";
import supabase from '../../config/supabase.js';
import { v4 as uuidv4 } from "uuid";

// Configure Cashfree
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.CASHFREE_ENV === "PRODUCTION" 
  ? CFEnvironment.PRODUCTION 
  : CFEnvironment.SANDBOX;

const paymentController = {
  // Initiate Payment
  initiatePayment: async (req, res, next) => {
    try {
      const { amount, currency = "INR", type = "credits", phone, email, name } = req.body;
      const userId = req.user.id;

      // 1. Get Hiring Profile ID
      const { data: hiringProfile } = await supabase
        .from('hiring_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      const hiringId = hiringProfile ? hiringProfile.id : null;

      // 2. Create Order in Cashfree
      const orderId = `order_${uuidv4().replace(/-/g, '')}`;
      
      const request = {
        order_amount: amount,
        order_currency: currency,
        order_id: orderId,
        customer_details: {
          customer_id: userId,
          customer_phone: phone || "9999999999",
          customer_name: name || "User",
          customer_email: email || "test@fameu.in"
        },
        order_meta: {
          // Use a dummy return url for now
          return_url: `https://fameu.in/payment/status?order_id=${orderId}`
        }
      };

      const response = await Cashfree.PGCreateOrder("2023-08-01", request);
      
      // 3. Save pending payment to DB
      await supabase.from('payments').insert([{
        hiring_id: hiringId,
        order_id: orderId,
        amount,
        currency,
        type,
        status: 'pending'
      }]);

      res.status(200).json({
        success: true,
        data: {
          order_id: orderId,
          payment_session_id: response.data.payment_session_id,
          order_status: response.data.order_status
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Handle Webhook
  webhook: async (req, res, next) => {
    try {
      // Basic webhook handling. 
      // In production, we must verify the Cashfree signature here.
      const { data } = req.body;
      
      if (data && data.order && data.payment) {
        const orderId = data.order.order_id;
        const status = data.payment.payment_status; // "SUCCESS" or "FAILED"
        const gatewayRef = data.payment.cf_payment_id;

        const dbStatus = status === "SUCCESS" ? "success" : "failed";

        // Update payment record
        await supabase
          .from('payments')
          .update({ status: dbStatus, gateway_ref: gatewayRef })
          .eq('order_id', orderId);

        // If success, increment credits for the hiring company
        if (dbStatus === 'success') {
          const { data: paymentRecord } = await supabase
            .from('payments')
            .select('hiring_id, type')
            .eq('order_id', orderId)
            .single();

          if (paymentRecord && paymentRecord.hiring_id && paymentRecord.type === 'credits') {
            await supabase.rpc('increment_credits', { company_id: paymentRecord.hiring_id });
          }
        }
      }

      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).send('Webhook Error');
    }
  },

  // Get User's Transactions
  getTransactions: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { data: hiringProfile } = await supabase.from('hiring_profiles').select('id').eq('user_id', userId).single();
      
      if (!hiringProfile) {
        return res.status(404).json({ success: false, error: 'Hiring profile not found' });
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('hiring_id', hiringProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};

export default paymentController;
