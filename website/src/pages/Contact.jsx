import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    // Success simulation
    setSubmitted(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <>
      {/* PAGE HEADER */}
      <section className="section" style={{ paddingTop: '140px', paddingBottom: '3rem', background: 'linear-gradient(180deg, rgba(245, 166, 35, 0.05) 0%, rgba(6, 6, 9, 0) 100%)' }}>
        <div className="container text-center">
          <span className="badge badge-gold">Connect with Us</span>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Let's Start a <br /><span className="text-gradient-gold">Conversation</span></h1>
          <p className="subtitle" style={{ marginBottom: '0' }}>
            Have questions about verification? Need custom onboarding for your production team? We are here to help.
          </p>
        </div>
      </section>

      {/* CONTACT GRID SECTION */}
      <section className="section" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
        <div className="container">
          
          <div className="contact-grid">
            
            {/* Column 1: Info */}
            <div className="contact-info">
              
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-details">
                  <h4>Email Support</h4>
                  <p style={{ marginTop: '0.25rem' }}>support@fameuget.com</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Average response: &lt; 4 Hours</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">🏢</div>
                <div className="info-details">
                  <h4>Corporate HQ</h4>
                  <p style={{ marginTop: '0.25rem' }}>ArgosMob Tech & AI Pvt. Ltd.</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>SCO 44, Sector 17, Chandigarh, India</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📞</div>
                <div className="info-details">
                  <h4>Partner Inquiries</h4>
                  <p style={{ marginTop: '0.25rem' }}>+91 98765 43210</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mon - Sat, 10 AM to 6 PM IST</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '2rem', marginTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Are you an Artist?</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  If you have any questions regarding your verification status, uploading monologues, or profile customization, please access the Help Desk inside your Fameuget mobile application.
                </p>
              </div>

            </div>

            {/* Column 2: Form / Success Card */}
            <div>
              {!submitted ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Send a Message</h3>
                  
                  <div className="contact-form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name <span style={{ color: 'var(--accent-crimson)' }}>*</span></label>
                      <input 
                        type="text" 
                        id="name" 
                        className="form-control" 
                        placeholder="e.g. Harrsh Pandey" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address <span style={{ color: 'var(--accent-crimson)' }}>*</span></label>
                      <input 
                        type="email" 
                        id="email" 
                        className="form-control" 
                        placeholder="e.g. harrsh@example.com" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number <span style={{ color: 'var(--accent-crimson)' }}>*</span></label>
                      <input 
                        type="tel" 
                        id="phone" 
                        className="form-control" 
                        placeholder="e.g. 9876543210" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">I am a... <span style={{ color: 'var(--accent-crimson)' }}>*</span></label>
                      <select 
                        id="subject" 
                        className="form-control" 
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>Select Subject</option>
                        <option value="PH">Production House / Casting Director</option>
                        <option value="Artist">Artist (Actor, Singer, Model, Dancer)</option>
                        <option value="Advertiser">Brand Manager / Ad Agency</option>
                        <option value="Support">General Support Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message / Request Details <span style={{ color: 'var(--accent-crimson)' }}>*</span></label>
                    <textarea 
                      id="message" 
                      className="form-control" 
                      placeholder="Tell us how we can assist you..." 
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Submit Inquiry</button>
                </form>
              ) : (
                <div className="glass-card form-success" style={{ display: 'block' }}>
                  <div className="form-success-icon">✓</div>
                  <h3 className="form-success-title">Message Sent!</h3>
                  <p className="form-success-desc">
                    Thank you for contacting Fameuget. An onboarding representative from ArgosMob Tech & AI will reach out to you within the next 4 business hours.
                  </p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '2rem' }} onClick={() => setSubmitted(false)}>Send Another Message</button>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
