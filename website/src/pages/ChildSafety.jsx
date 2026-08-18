import React from 'react';

export default function ChildSafety() {
  const handleEmailClick = () => {
    window.location.href = 'mailto:childsafety@fameu.in?subject=Child%20Safety%20Concern%20Report';
  };

  return (
    <div className="page-container page-padding" style={{ paddingTop: '120px', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HERO SECTION */}
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            🛡️ Child Safety & Protection Policy
          </span>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem', lineHeight: '1.2' }}>
            Fameu <span className="text-gradient">Child Safety Standards</span>
          </h1>
          <p className="subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
            Our absolute zero-tolerance commitment to protecting children and minors from Child Sexual Abuse and Exploitation (CSAE) and Child Sexual Abuse Material (CSAM).
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Last Updated: August 2026 | Compliant with Google Play Developer Policy & Global Child Protection Regulations
          </p>
        </div>

        {/* CORE POLICY HIGHLIGHT BOX */}
        <div 
          className="glass-card" 
          style={{ 
            padding: '2rem', 
            marginBottom: '2.5rem', 
            borderLeft: '4px solid var(--accent-crimson)',
            background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.06) 0%, rgba(124, 58, 237, 0.04) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.75rem' }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--accent-crimson)' }}>
              Official Zero Tolerance Declaration
            </h3>
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.75', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            <strong>Fameu</strong>, operated by <strong>ArgosMob Tech & AI Pvt Ltd</strong>, has zero tolerance for Child Sexual Abuse and Exploitation (CSAE) and Child Sexual Abuse Material (CSAM). Users must not create, upload, share, solicit, or distribute any content or behavior that exploits, abuses, sexualizes, or endangers minors.
          </p>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            We remove violating content and accounts immediately when identified or reported, and take appropriate action under applicable law. Where required, we report confirmed CSAM to the appropriate authority, including law enforcement and relevant national/international reporting bodies.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <strong>Child-Safety Contact:</strong>
            <span style={{ color: 'var(--accent-crimson)', fontWeight: 600 }}>ArgosMob Trust & Safety Team</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <a href="mailto:childsafety@fameu.in" style={{ color: 'var(--accent-purple)', fontWeight: 600, textDecoration: 'underline' }}>
              childsafety@fameu.in
            </a>
          </div>
        </div>

        {/* DETAILED POLICY CONTENT */}
        <div className="policy-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION 1 */}
          <section className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-purple)' }}>1.</span> Scope & Prohibited Content and Behaviors
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.7' }}>
              This Child Safety Policy applies to all users of Fameu, including artists, child actors, parents/guardians, casting directors, production houses, model scouts, and general visitors across our mobile applications, web portals, and related services.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              The following content and activities are strictly prohibited on Fameu:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Child Sexual Abuse Material (CSAM):</strong> Any visual depiction, image, video, audio recording, illustration, animation, or digital generation of explicit sexual conduct involving a minor.
              </li>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Child Sexual Exploitation and Abuse (CSAE):</strong> Any solicitation, grooming, coercing, enticing, or sexualizing of a child or minor performer.
              </li>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Inappropriate Casting Requests:</strong> Any casting call, audition brief, or direct message requesting nudity, suggestive attire, adult themes, or intimate poses from minors.
              </li>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Unsolicited Direct Contact:</strong> Direct private messaging to minors without verified parental or legal guardian presence and consent.
              </li>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Commercial Exploitation:</strong> Child labor violations or exploitation of minors without statutory legal permits and parental supervision.
              </li>
            </ul>
          </section>

          {/* SECTION 2 */}
          <section className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-purple)' }}>2.</span> Minor Performer Safeguards in Auditions & Casting
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.7' }}>
              Because Fameu is a professional talent discovery and audition platform that caters to young performers, actors, and models, we implement stringent protective guardrails:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>👨‍👩‍👧 Parental / Guardian Control</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Accounts representing performers under the age of 18 must be created and managed under the direct supervision of a verified parent or legal guardian.
                </p>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🔒 Verified Recruiter Filter</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Only casting directors and agencies who have completed government identity audits (PAN, Aadhaar/corporate registration) are authorized to post child-oriented casting calls.
                </p>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>🛡️ Supervised Auditions</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Private one-on-one unsupervised auditions are prohibited. Physical or digital auditions must allow parent/guardian accompaniment at all times.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-purple)' }}>3.</span> Detection, Moderation & Immediate Removal
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.7' }}>
              ArgosMob Tech & AI maintains active automated screening and a human moderation team to monitor content submitted across the platform:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Automated Pre-Screening:</strong> Media uploads and text descriptions are analyzed for prohibited keywords, suspicious prompts, and unsafe media.
              </li>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Immediate Content Takedown:</strong> Any content flagged as potential CSAE or CSAM is quarantined and deleted immediately from active feeds and databases.
              </li>
              <li style={{ listStyleType: 'disc' }}>
                <strong>Account Banning & Permanent Blacklisting:</strong> Offenders are permanently banned. Identity documents, phone numbers, and device fingerprints are permanently blacklisted to prevent re-entry.
              </li>
            </ul>
          </section>

          {/* SECTION 4 */}
          <section className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-purple)' }}>4.</span> Law Enforcement & Statutory Reporting
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.7' }}>
              In strict accordance with global child protection regulations, Google Play Child Safety guidelines, and local statutory legislation (including the Protection of Children from Sexual Offences [POCSO] Act and Information Technology Act):
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li style={{ listStyleType: 'disc' }}>
                Where required, we report confirmed CSAM/CSAE immediately to relevant national law enforcement agencies, cybercrime investigation divisions, and authorized child protection organizations such as the National Center for Missing & Exploited Children (NCMEC).
              </li>
              <li style={{ listStyleType: 'disc' }}>
                We preserve forensic audit logs and metadata to fully cooperate with official legal requests and law enforcement investigations.
              </li>
            </ul>
          </section>

          {/* SECTION 5: HOW TO REPORT */}
          <section className="glass-card" style={{ padding: '2rem', background: 'rgba(124, 58, 237, 0.04)', borderColor: 'var(--accent-purple)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-crimson)' }}>5.</span> How to Report a Child Safety Violation
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.7' }}>
              If you encounter any content, profile, casting call, message, or behavior on Fameu that endangers, exploits, or sexualizes a minor, please report it immediately:
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>🚩 In-App Flagging</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Click the three-dot menu icon on any profile, audition post, or chat message and select <strong>"Report Child Safety / Inappropriate Content"</strong>.
                </p>
              </div>
              <div style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>📧 Dedicated Safety Email</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Send an email directly with details, screenshots, and usernames to our priority queue: <br />
                  <a href="mailto:childsafety@fameu.in" style={{ color: 'var(--accent-crimson)', fontWeight: 600 }}>childsafety@fameu.in</a>
                </p>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleEmailClick}
              style={{ width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>✉️</span> Report a Violation Directly
            </button>
          </section>

          {/* SECTION 6: CONTACT INFORMATION */}
          <section className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              6. Designated Child Safety Point of Contact
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.7' }}>
              For all regulatory inquiries, law enforcement requests, or urgent child safety escalation matters, reach our dedicated Trust & Safety officer:
            </p>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', lineHeight: '1.8' }}>
              <p><strong>Entity Name:</strong> ArgosMob Tech & AI Pvt Ltd</p>
              <p><strong>Platform:</strong> Fameu (Fameuget Mobile Application & Web Services)</p>
              <p><strong>Designated Officer / Team:</strong> ArgosMob Child Protection & Safety Response Team</p>
              <p>
                <strong>Child-Safety Email:</strong>{' '}
                <a href="mailto:childsafety@fameu.in" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>childsafety@fameu.in</a>
              </p>
              <p>
                <strong>General Support:</strong>{' '}
                <a href="mailto:support@fameu.in" style={{ color: 'var(--text-secondary)' }}>support@fameu.in</a>
              </p>
              <p>
                <strong>Official Website:</strong>{' '}
                <a href="https://fameu.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-purple)' }}>https://fameu.in</a>
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
