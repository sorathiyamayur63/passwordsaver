import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, ChevronDown } from "lucide-react";

const T = {
  bg: '#F7F4EE',
  card: '#FFFFFF',
  cardHover: '#F8F5F0',

  border: '#E7DDD0',
  borderAccent: '#E7DDD0',

  textPrimary: '#242424',
  textHeading: '#29231E',
  textSec: '#756C63',

  accent: '#7C5C3B'
};

const faqs = [
  {
    category: "Security & Cryptography",
    questions: [
      { q: "What does zero-knowledge mean exactly?", a: "It means the server never receives the information needed to decrypt your vault. Your password derives an encryption key entirely on your local device. Only the resulting AES-256-GCM ciphertext is sent to the server. Even if our databases are breached, your data remains mathematically secure." },
      { q: "What encryption algorithms are used?", a: "We use PBKDF2-HMAC-SHA256 with 600,000 iterations to stretch your Password into a cryptographic key. The actual data is encrypted using AES-256-GCM. User authentication hashes are stored using Argon2id." },
      { q: "Is the code open source?", a: "Because this is designed to be self-hostable and locally runnable, the entirety of the client-side encryption logic can be inspected in your browser's developer tools. The architecture relies on standard, un-modified Web Crypto APIs." }
    ]
  },
  {
    category: "Account & Recovery",
    questions: [
      { q: "What happens if I forget my Password?", a: "Because of our strict zero-knowledge model, there is absolutely no password reset feature. We do not know your password, so we cannot send you a temporary one. If you lose your Password, your vault data is permanently inaccessible. We highly recommend downloading a local backup." },
      { q: "Can I change my Password?", a: "Yes. When you change your Password, your device downloads your entire vault, decrypts it with the old key, re-encrypts it with a new key derived from the new password, and syncs the newly encrypted blob back to the server." }
    ]
  },
  {
    category: "Features & Usage",
    questions: [
      { q: "Does this work offline?", a: "Yes. Once the web app is loaded, the cryptographic operations happen locally. If you lose internet, you can still decrypt and read your vault using cached data. Syncing will resume when your connection is restored." },
      { q: "Can I host this myself?", a: "Yes, passwordsaver is built to be easily containerized and run locally or on your own VPS. The separation of the frontend UI and the blind-storage backend makes self-hosting incredibly secure." }
    ]
  }
];

export default function QnAPage() {
  const [openId, setOpenId] = useState("0-0");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: T.bg, color: T.textPrimary, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: T.textPrimary }}>
            <ShieldCheck size={24} color={T.accent} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>passwordsaver</span>
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: T.textSec, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px' }}>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24 }}>Questions & Answers</h1>
        <p style={{ fontSize: 18, color: T.textSec, marginBottom: 64, lineHeight: 1.6 }}>
          Everything you need to know about how we handle your data, the cryptography we use, and managing your account.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {faqs.map((category, catIdx) => (
            <div key={category.category}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 24, borderBottom: `1px solid ${T.border}`, paddingBottom: 12 }}>
                {category.category}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {category.questions.map((faq, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openId === id;
                  return (
                    <div key={id} style={{
                      background: isOpen ? T.cardHover : T.card,
                      border: `1px solid ${isOpen ? T.borderAccent : T.border}`,
                      borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s ease',boxShadow: isOpen ? '0 8px 32px rgba(80,60,40,0.08)' : 'none',
                    }}>
                      <button
                        onClick={() => setOpenId(isOpen ? null : id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          padding: '24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16
                        }}
                      >
                        <span style={{ fontSize: 17, fontWeight: 600, color: isOpen ? T.textPrimary : T.textSec, lineHeight: 1.4 }}>{faq.q}</span>
                        <ChevronDown size={20} color={isOpen ? T.textPrimary : T.textSec} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
                      </button>
                      <div style={{
                        maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0,
                        overflow: 'hidden', transition: 'all 0.3s ease', padding: isOpen ? '0 24px 24px' : '0 24px 0',
                      }}>
                        <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.7 }}>{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}