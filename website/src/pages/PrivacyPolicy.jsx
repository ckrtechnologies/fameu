import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="page-container page-padding">
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="section-title">Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: July 2026</p>

        <div className="policy-content" style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Fameuget (operated by ArgosMob Tech & AI Pvt Ltd). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share your personal data when you use our website, mobile application, and services (collectively, the "Services").
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>2. Information We Collect</h2>
            <p>We may collect personal information that you provide to us, including but not limited to:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li><strong>Contact Information:</strong> Name, email address, phone number.</li>
              <li><strong>Profile Information:</strong> Photographs, videos, portfolios, and professional experience.</li>
              <li><strong>Identity Verification:</strong> Aadhaar, PAN, GST details (for casting directors and agencies) as part of our anti-scam measures.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and app usage data.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for various purposes, including:</p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>To provide, operate, and maintain our Services.</li>
              <li>To verify user identity and ensure platform safety and security.</li>
              <li>To facilitate connections between artists and casting directors.</li>
              <li>To communicate with you, including sending updates, alerts, and promotional materials.</li>
              <li>To improve our platform and develop new features.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>4. Sharing Your Information</h2>
            <p>
              We do not sell your personal information. We may share your data in the following situations:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li><strong>With other users:</strong> Your public profile information will be visible to casting directors and relevant parties on the platform.</li>
              <li><strong>Service Providers:</strong> We may share data with third-party vendors who perform services on our behalf (e.g., payment processing, hosting).</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, update, or delete your personal information. You can manage your profile settings within the app or contact us directly to exercise these rights.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2>8. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may contact us at:
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>FAMEU</strong><br />
              Email: privacy@fameu.in<br />
              Website: <a href="#/contact" style={{ color: 'var(--primary)' }}>Contact Form</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
