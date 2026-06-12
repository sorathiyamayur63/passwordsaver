import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Lock, LayoutTemplate, Settings } from "lucide-react";
// The color theme object must be defined here so FeatureDetail can use it
const T = {
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#E7DDD0',
  borderAccent: '#E7DDD0',
  textPrimary: '#242424',
  textHeading: '#29231E',
  textSec: '#756C63',
  accent: '#7C5C3B',
  accentHover: '#5E4429',
  accentBg: '#F8F5F0',
  iconBg: '#FFFFFF'
};
function EncryptionVisual() {
  return (
    <svg viewBox="0 0 500 350" fill="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="encBg" x1="0" y1="0" x2="500" y2="350">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="100%" stopColor="#f3eae0" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a3876a" />
          <stop offset="100%" stopColor="#7c5c3b" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#7c5c3b" floodOpacity="0.15" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <style>{`
          .rotate { animation: spin 20s linear infinite; transform-origin: 250px 175px; }
          .rotate-reverse { animation: spin-reverse 25s linear infinite; transform-origin: 250px 175px; }
          .float1 { animation: float 6s ease-in-out infinite; }
          .float2 { animation: float 5s ease-in-out infinite 1s; }
          .pulse-lock { animation: pulseLock 3s ease-in-out infinite; transform-origin: 250px 175px; }
          .data-stream { stroke-dasharray: 8 8; animation: stream 2s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes pulseLock { 0%, 100% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(124,92,59,0.2)); } 50% { transform: scale(1.02); filter: drop-shadow(0 15px 25px rgba(124,92,59,0.3)); } }
          @keyframes stream { 100% { stroke-dashoffset: -16; } }
        `}</style>
      </defs>

      <rect width="500" height="350" rx="32" fill="url(#encBg)" />

      <circle cx="250" cy="175" r="120" stroke="#e8ddd0" strokeWidth="2" className="data-stream" />
      <g className="rotate">
        <circle cx="250" cy="175" r="140" stroke="url(#gold)" strokeWidth="1" strokeDasharray="10 20" opacity="0.5" />
      </g>
      <g className="rotate-reverse">
        <circle cx="250" cy="175" r="160" stroke="#b09b85" strokeWidth="1.5" strokeDasharray="4 12" opacity="0.4" />
      </g>
      <g className="float1">
        <rect x="40" y="60" width="100" height="40" rx="8" fill="#fff" filter="url(#shadow)" />
        <rect x="50" y="75" width="20" height="10" rx="4" fill="#6cd38d" />
        <rect x="80" y="75" width="50" height="4" rx="2" fill="#e8ddd0" />
        <rect x="80" y="83" width="30" height="4" rx="2" fill="#e8ddd0" />
      </g>
      <g className="float2">
        <rect x="340" y="255" width="120" height="40" rx="8" fill="#fff" filter="url(#shadow)" />
        <rect x="350" y="270" width="20" height="10" rx="4" fill="#d86a6a" />
        <rect x="380" y="268" width="70" height="4" rx="2" fill="#e8ddd0" />
        <rect x="380" y="278" width="40" height="4" rx="2" fill="#e8ddd0" />
      </g>
      <path d="M140 90 L215 125" stroke="#6cd38d" strokeWidth="2" strokeDasharray="4 4" className="data-stream" />
      <path d="M340 255 L285 225" stroke="#6cd38d" strokeWidth="2" strokeDasharray="4 4" className="data-stream" />
      <g className="pulse-lock">
        <path d="M250 80 C300 80 330 100 330 100 L330 170 C330 230 250 270 250 270 C250 270 170 230 170 170 L170 100 C170 100 200 80 250 80 Z" fill="#fff" filter="url(#shadow)" />
        <path d="M250 90 C290 90 315 107 315 107 L315 168 C315 218 250 253 250 253 C250 253 185 218 185 168 L185 107 C185 107 210 90 250 90 Z" fill="#faf6f0" />

        <rect x="220" y="145" width="60" height="50" rx="10" fill="url(#gold)" />
        <path d="M232 145 V130 C232 118 268 118 268 130 V145" fill="none" stroke="url(#gold)" strokeWidth="12" strokeLinecap="round" />
        <circle cx="250" cy="165" r="6" fill="#fff" />
        <rect x="248" y="168" width="4" height="10" rx="2" fill="#fff" />
      </g>
      <g filter="url(#shadow)">
        <rect x="200" y="300" width="100" height="24" rx="12" fill="#7c5c3b" />
        <text x="250" y="316" fill="#fff" fontSize="12" fontWeight="600" textAnchor="middle" letterSpacing="1">AES-256-GCM</text>
      </g>
    </svg>
  );
}
function TemplatesVisual() {
  return (
    <svg viewBox="0 0 500 350" fill="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="tmpBg" x1="0" y1="0" x2="500" y2="350">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="100%" stopColor="#f3eae0" />
        </linearGradient>
        <filter id="cardShadow1" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-10" dy="15" stdDeviation="15" floodColor="#7c5c3b" floodOpacity="0.12" />
        </filter>
        <filter id="cardShadow2" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="20" stdDeviation="20" floodColor="#7c5c3b" floodOpacity="0.18" />
        </filter>
        <filter id="cardShadow3" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="10" dy="15" stdDeviation="15" floodColor="#7c5c3b" floodOpacity="0.12" />
        </filter>
        <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f9f7f3" />
        </linearGradient>
        <linearGradient id="cardGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#faf0e6" />
        </linearGradient>
        <linearGradient id="cardGrad3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f5f1" />
        </linearGradient>
        <style>{`
          .hover-card1 { animation: float-c1 7s ease-in-out infinite; transform-origin: 150px 175px; }
          .hover-card2 { animation: float-c2 6s ease-in-out infinite; transform-origin: 250px 175px; }
          .hover-card3 { animation: float-c3 7.5s ease-in-out infinite; transform-origin: 350px 175px; }
          @keyframes float-c1 { 0%, 100% { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(-12px) rotate(-14deg); } }
          @keyframes float-c2 { 0%, 100% { transform: translateY(0) scale(1.05); } 50% { transform: translateY(-8px) scale(1.07); } }
          @keyframes float-c3 { 0%, 100% { transform: translateY(0) rotate(12deg); } 50% { transform: translateY(-12px) rotate(14deg); } }
        `}</style>
      </defs>
      <rect width="500" height="350" rx="32" fill="url(#tmpBg)" />
      <g stroke="#e8ddd0" strokeWidth="1" opacity="0.5">
        <path d="M 0 50 L 500 50 M 0 100 L 500 100 M 0 150 L 500 150 M 0 200 L 500 200 M 0 250 L 500 250 M 0 300 L 500 300" strokeDasharray="4 4" />
        <path d="M 50 0 L 50 350 M 100 0 L 100 350 M 150 0 L 150 350 M 200 0 L 200 350 M 250 0 L 250 350 M 300 0 L 300 350 M 350 0 L 350 350 M 400 0 L 400 350 M 450 0 L 450 350" strokeDasharray="4 4" />
      </g>
      <g className="hover-card1" filter="url(#cardShadow1)">
        <rect x="60" y="80" width="140" height="180" rx="16" fill="url(#cardGrad1)" stroke="#eae0d5" />
        <rect x="80" y="105" width="36" height="36" rx="8" fill="#f4eee5" />
        <rect x="88" y="113" width="20" height="20" rx="8" fill="#d1c5b5" />
        <rect x="125" y="110" width="55" height="8" rx="4" fill="#eae0d5" />
        <rect x="125" y="125" width="40" height="6" rx="3" fill="#f4eee5" />
        <rect x="80" y="160" width="100" height="6" rx="3" fill="#eae0d5" />
        <rect x="80" y="175" width="70" height="6" rx="3" fill="#f4eee5" />
        <rect x="80" y="190" width="85" height="6" rx="3" fill="#f4eee5" />
        <rect x="80" y="220" width="100" height="20" rx="6" fill="#f4eee5" />
        <circle cx="93" cy="230" r="5" fill="#a3876a" opacity="0.6" />

      </g>
      <g className="hover-card3" filter="url(#cardShadow3)">
        <rect x="300" y="80" width="140" height="180" rx="16" fill="url(#cardGrad3)" stroke="#d5eadd" />
        <rect x="320" y="105" width="36" height="36" rx="8" fill="#e8f4ec" />
        <rect x="328" y="113" width="20" height="20" rx="8" fill="#6cd38d" />
        <rect x="365" y="110" width="55" height="8" rx="4" fill="#d5eadd" />
        <rect x="365" y="125" width="40" height="6" rx="3" fill="#e8f4ec" />
        <rect x="320" y="160" width="100" height="6" rx="3" fill="#d5eadd" />
        <rect x="320" y="175" width="80" height="6" rx="3" fill="#e8f4ec" />
        <rect x="320" y="190" width="60" height="6" rx="3" fill="#e8f4ec" />
        <rect x="320" y="205" width="70" height="6" rx="3" fill="#e8f4ec" />
        <rect x="320" y="225" width="100" height="20" rx="6" fill="#e8f4ec" />
      </g>
      <g className="hover-card2" filter="url(#cardShadow2)">
        <rect x="170" y="60" width="160" height="210" rx="20" fill="url(#cardGrad2)" stroke="#eae0d5" />
        <rect x="195" y="85" width="40" height="40" rx="10" fill="#faf0e6" />
        <rect x="203" y="93" width="24" height="24" rx="10" fill="#e1a3a3" />
        <rect x="245" y="92" width="60" height="10" rx="5" fill="#eae0d5" />
        <rect x="245" y="110" width="40" height="6" rx="3" fill="#faf0e6" />
        <rect x="195" y="145" width="110" height="8" rx="4" fill="#eae0d5" />
        <rect x="195" y="165" width="90" height="6" rx="3" fill="#faf0e6" />
        <rect x="195" y="180" width="60" height="6" rx="3" fill="#faf0e6" />
        <rect x="195" y="215" width="110" height="30" rx="8" fill="#faf0e6" />
        <circle cx="210" cy="230" r="6" fill="#d86a6a" opacity="0.6" />
      </g>
    </svg>
  );
}
function DeviceManagementVisual() {
  return (
    <svg viewBox="0 0 500 350" fill="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="devBg" x1="0" y1="0" x2="500" y2="350">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="100%" stopColor="#f3eae0" />
        </linearGradient>
        <filter id="devShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#7c5c3b" floodOpacity="0.15" />
        </filter>
        <linearGradient id="laptopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0ede6" />
        </linearGradient>
        <linearGradient id="phoneGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8f4ec" />
        </linearGradient>
        <linearGradient id="tabletGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f7e9e9" />
        </linearGradient>
        <style>{`
          .data-line { stroke-dasharray: 6 6; animation: dataFlow 2s linear infinite; }
          .data-line-reverse { stroke-dasharray: 6 6; animation: dataFlowRev 2s linear infinite; }
          .ping1 { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; transform-origin: center; }
          .ping2 { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite 1s; transform-origin: center; }
          .ping3 { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite 2s; transform-origin: center; }
          .float-dev { animation: float-dev 5s ease-in-out infinite; }
          @keyframes dataFlow { to { stroke-dashoffset: -12; } }
          @keyframes dataFlowRev { to { stroke-dashoffset: 12; } }
          @keyframes ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }
          @keyframes float-dev { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        `}</style>
      </defs>
      <rect width="500" height="350" rx="32" fill="url(#devBg)" />
      <path d="M250 195 C235 110 130 60 80 195" fill="none" stroke="#6cd38d" strokeWidth="3" className="data-line" />
      <path d="M250 165 C250 100 380 100 380 145" fill="none" stroke="#d86a6a" strokeWidth="3" className="data-line-reverse" />
      <path d="M250 165 C250 250 350 250 350 210" fill="none" stroke="#a3876a" strokeWidth="3" className="data-line" />
      <g filter="url(#devShadow)" className="float-dev" style={{ animationDelay: '0s' }}>
        <circle cx="250" cy="170" r="45" fill="#fff" stroke="#eae0d5" strokeWidth="2" />
        <circle cx="250" cy="170" r="30" fill="#f4eee5" />
        <path d="M242 165 V155 C242 148 258 148 258 155 V165" fill="none" stroke="#7c5c3b" strokeWidth="4" strokeLinecap="round" />
        <rect x="236" y="165" width="28" height="22" rx="4" fill="#7c5c3b" />
        <circle cx="250" cy="176" r="3" fill="#fff" />
      </g>
      <g filter="url(#devShadow)" className="float-dev" style={{ animationDelay: '1s' }}>
        <rect x="40" y="145" width="140" height="90" rx="8" fill="url(#laptopGrad)" stroke="#eae0d5" strokeWidth="2" />
        <rect x="50" y="155" width="120" height="50" rx="4" fill="#fff" />
        <rect x="55" y="162" width="40" height="6" rx="3" fill="#e8ddd0" />
        <rect x="55" y="175" width="110" height="4" rx="2" fill="#f4eee5" />
        <rect x="55" y="185" width="90" height="4" rx="2" fill="#f4eee5" />
        <circle cx="110" cy="220" r="12" fill="#e8f4ec" />
        <circle cx="110" cy="220" r="6" fill="#6cd38d" />
        <circle cx="110" cy="220" r="6" fill="#6cd38d" className="ping1" />
        <path d="M20 235 L200 235 L190 245 L30 245 Z" fill="#e8ddd0" />
        <path d="M80 235 L140 235 L135 238 L85 238 Z" fill="#d1c4b4" />

      </g>
      <g filter="url(#devShadow)" className="float-dev" style={{ animationDelay: '0.5s' }}>
        <rect x="310" y="210" width="110" height="80" rx="10" fill="url(#tabletGrad)" stroke="#eae0d5" strokeWidth="2" />
        <rect x="320" y="220" width="90" height="60" rx="4" fill="#fff" />
        <rect x="400" y="215" width="10" height="2" rx="1" fill="#e8ddd0" />
        <rect x="330" y="230" width="30" height="30" rx="6" fill="#f4eee5" />
        <rect x="370" y="230" width="30" height="6" rx="3" fill="#e8ddd0" />
        <rect x="370" y="245" width="20" height="4" rx="2" fill="#f4eee5" />
        <circle cx="390" cy="265" r="10" fill="#f4eee5" />
        <circle cx="390" cy="265" r="4" fill="#a3876a" />
        <circle cx="390" cy="265" r="4" fill="#a3876a" className="ping3" />
      </g>
      <g filter="url(#devShadow)" className="float-dev" style={{ animationDelay: '2s' }}>
        <rect x="350" y="50" width="70" height="140" rx="14" fill="url(#phoneGrad)" stroke="#eae0d5" strokeWidth="2" />
        <rect x="358" y="60" width="54" height="110" rx="6" fill="#fff" />
        <rect x="375" y="55" width="20" height="3" rx="1.5" fill="#e8ddd0" />
        <rect x="365" y="70" width="40" height="8" rx="4" fill="#f7e9e9" />
        <rect x="365" y="90" width="40" height="30" rx="6" fill="#f7e9e9" />
        <circle cx="385" cy="150" r="14" fill="#f7e9e9" />
        <circle cx="385" cy="150" r="6" fill="#d86a6a" />
        <circle cx="385" cy="150" r="6" fill="#d86a6a" className="ping2" />
      </g>
      <g filter="url(#devShadow)">
        <rect x="70" y="250" width="80" height="24" rx="12" fill="#e8f4ec" />
        <text x="110" y="266" fill="#44c27b" fontSize="11" fontWeight="700" textAnchor="middle">CURRENT</text>
      </g>
      <g filter="url(#devShadow)">
        <rect x="325" y="300" width="80" height="24" rx="12" fill="#e8f4ec" />
        <text x="365" y="316" fill="#44c27b" fontSize="11" fontWeight="700" textAnchor="middle">SECURE</text>
      </g>
      <g filter="url(#devShadow)">
        <rect x="345" y="5" width="80" height="24" rx="12" fill="#f7e9e9" />
        <text x="385" y="21" fill="#d86a6a" fontSize="11" fontWeight="700" textAnchor="middle">REVOKED</text>
      </g>
    </svg>
  );
}
function FeatureDetail({ icon: Icon, title, description, points, reverse, visual: Visual }) {
  return (
    <div style={{
      display: 'flex', flexDirection: reverse ? 'row-reverse' : 'row',
      gap: 64, alignItems: 'center', flexWrap: 'wrap', marginBottom: 120
    }}>
      <div style={{ flex: '1 1 400px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: T.accentBg, border: `1px solid ${T.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Icon size={28} color={T.accent} />
        </div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: T.textPrimary, marginBottom: 16, lineHeight: 1.1 }}>{title}</h2>
        <p style={{ fontSize: 18, color: T.textSec, lineHeight: 1.6, marginBottom: 32 }}>{description}</p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {points.map((point, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <ShieldCheck size={20} color={T.accent} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 16, color: T.textPrimary, lineHeight: 1.5 }}>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: '1 1 400px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: 32, boxShadow: '0 12px 48px rgba(124,92,59,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(124,92,59,0.08) 0%, rgba(247,244,238,0) 70%)', filter: 'blur(40px)' }} />
        {Visual && <Visual />}
      </div>
    </div>
  );
}
export default function FeaturesPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ background: T.bg, color: T.textPrimary, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ borderBottom: `1px solid ${T.border}`, padding: '24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: T.textPrimary }}>
            <ShieldCheck size={24} color={T.accent} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>passwordsaver</span>
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: T.textSec, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 120, maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 24, lineHeight: 1.1 }}>
            Engineered for <span style={{ color: T.accent }}>absolute privacy.</span>
          </h1>
          <p style={{ fontSize: 20, color: T.textSec, lineHeight: 1.6 }}>
            Explore the deep technical features that make passwordsaver fundamentally different from traditional password managers.
          </p>
        </div>
        <FeatureDetail
          icon={Lock}
          title="Strict Zero-Knowledge Architecture"
          description="Your vault is encrypted before it ever leaves your browser. We never see your passwords, your notes, or your templates. The server acts merely as a blind storage locker."
          points={[
            "Data is encrypted using AES-256-GCM, the gold standard in symmetric encryption.",
            "Encryption keys are derived locally using PBKDF2 with 600,000 iterations to thwart brute-force attacks.",
            "A unique 96-bit Initialization Vector (IV) is generated for every single item you save."
          ]}
          visual={EncryptionVisual}
        />
        <FeatureDetail
          icon={LayoutTemplate}
          title="Dynamic Custom Templates"
          description="Don't restrict yourself to just 'Username' and 'Password'. Build custom data structures that fit exactly what you need to store."
          points={[
            "Store Credit Cards, Passports, API Tokens, or Crypto Seed Phrases.",
            "Create unlimited custom fields with specific data types (hidden text, dates, large text areas).",
            "Everything inside a template, including field labels, is fully encrypted."
          ]}
          reverse={true}
          visual={TemplatesVisual}
        />
        <FeatureDetail
          icon={Settings}
          title="Advanced Device & Session Management"
          description="Total visibility over where your vault is currently unlocked. If you leave a session open on a public computer, terminate it instantly from your phone."
          points={[
            "View real-time active sessions with browser, OS, and location data.",
            "Cryptographic session tokens are instantly invalidated upon remote termination.",
            "Auto-lock timers ensure your vault secures itself if you step away."
          ]}
          visual={DeviceManagementVisual}
        />
      </main>
    </div>
  );
}