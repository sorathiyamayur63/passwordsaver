import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Lock, KeyRound, Globe, CreditCard,
  Building2, IdCard, BookUser, User, FileText, Code2,
  LayoutTemplate, Database, Settings, ChevronDown,
  ArrowRight, Check, Fingerprint, Cpu, EyeOff, Activity,
  Layers, Shield, Menu, X
} from "lucide-react";

// ─── Theme Constants (Warm Ivory Light Theme) ──────────────
const T = {
  bg: '#F7F4EE',           // Warm Ivory
  card: '#FFFFFF',         // White
  textPrimary: '#242424',  // Charcoal
  textHeading: '#29231E',  // Espresso
  textSec: '#756C63',      // Warm Gray
  accent: '#7C5C3B',       // Coffee Brown
  border: '#E7DDD0',       // Sand Beige
  shadow: '0 8px 32px rgba(80,60,40,0.08)', // Soft Brown Shadow
  iconBg: '#F1E7DA',       // Soft Almond
  inputBg: '#F8F5F0',      // Linen
};

// ─── Corrected Safe Animation Hooks ──────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(el);
          }
        },
        { threshold }
      );

      observer.observe(el);
      return () => {
        try { observer.unobserve(el); } catch (e) { }
      };
    } else {
      setVisible(true);
    }
  }, [threshold]);

  return [ref, visible];
}

function FadeIn({ children, delay = 0, y = 24 }) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : `translateY(${y}px)`,
        transition: `opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        width: '100%'
      }}
    >
      {children}
    </div>
  );
}

// ─── Reusable UI Components ───────────────────────────────────────────
function Pill({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      color: T.accent, background: T.iconBg,
      border: `1px solid ${T.border}`,
      borderRadius: 100, padding: '6px 16px',
    }}>
      {children}
    </span>
  );
}

function SectionHeading({ children, style }) {
  return (
    <h2 style={{
      fontSize: 'clamp(28px, 4.5vw, 44px)',
      fontWeight: 800, letterSpacing: '-0.03em',
      lineHeight: 1.15, color: T.textHeading,
      textAlign: 'center',
      ...style,
    }}>
      {children}
    </h2>
  );
}

// ─── Feature Box Animated SVG Illustrations ─────────────────────────
function EncryptionVisual() {
  return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', height: 120 }}>
      <style>{`
        @keyframes orbit1 { 0% { transform: rotate(0deg) translateX(40px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); } }
        @keyframes orbit2 { 0% { transform: rotate(120deg) translateX(40px) rotate(-120deg); } 100% { transform: rotate(480deg) translateX(40px) rotate(-480deg); } }
        @keyframes orbit3 { 0% { transform: rotate(240deg) translateX(40px) rotate(-240deg); } 100% { transform: rotate(600deg) translateX(40px) rotate(-600deg); } }
        @keyframes lockPulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        .orb1 { animation: orbit1 6s linear infinite; transform-origin: 100px 60px; }
        .orb2 { animation: orbit2 6s linear infinite; transform-origin: 100px 60px; }
        .orb3 { animation: orbit3 6s linear infinite; transform-origin: 100px 60px; }
        .lock-glow { animation: lockPulse 3s ease-in-out infinite; }
      `}</style>
      {/* Orbit ring */}
      <ellipse cx="100" cy="60" rx="44" ry="44" stroke="#7C5C3B" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
      {/* Center lock */}
      <g className="lock-glow">
        <rect x="88" y="56" width="24" height="18" rx="3" fill="#7C5C3B" opacity="0.15" />
        <rect x="90" y="58" width="20" height="14" rx="2" fill="#7C5C3B" opacity="0.9" />
        <path d="M96 52 V56 H104 V52 A4 4 0 0 0 96 52Z" fill="none" stroke="#7C5C3B" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="65" r="2" fill="#FFFFFF" />
      </g>
      {/* Orbiting particles */}
      <circle className="orb1" cx="100" cy="60" r="4" fill="#7C5C3B" opacity="0.6" />
      <circle className="orb2" cx="100" cy="60" r="3" fill="#7C5C3B" opacity="0.4" />
      <circle className="orb3" cx="100" cy="60" r="3.5" fill="#7C5C3B" opacity="0.5" />
    </svg>
  );
}

function PasswordGenVisual() {
  return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', height: 120 }}>
      <style>{`
        @keyframes charCycle1 { 0%,20% { opacity:1; } 25%,100% { opacity:0; } }
        @keyframes charCycle2 { 0%,20% { opacity:0; } 25%,45% { opacity:1; } 50%,100% { opacity:0; } }
        @keyframes charCycle3 { 0%,45% { opacity:0; } 50%,70% { opacity:1; } 75%,100% { opacity:0; } }
        @keyframes charCycle4 { 0%,70% { opacity:0; } 75%,95% { opacity:1; } 100% { opacity:0; } }
        @keyframes cursorBlink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
        .c1 { animation: charCycle1 3s ease infinite; }
        .c2 { animation: charCycle2 3s ease infinite; }
        .c3 { animation: charCycle3 3s ease infinite; }
        .c4 { animation: charCycle4 3s ease infinite; }
        .cursor { animation: cursorBlink 1s step-end infinite; }
      `}</style>
      {/* Terminal-style password display */}
      <rect x="20" y="20" width="160" height="80" rx="12" fill="#29231E" opacity="0.95" />
      <rect x="20" y="20" width="160" height="24" rx="12" fill="#29231E" />
      <circle cx="36" cy="32" r="4" fill="#EF4444" opacity="0.7" />
      <circle cx="50" cy="32" r="4" fill="#F59E0B" opacity="0.7" />
      <circle cx="64" cy="32" r="4" fill="#22C55E" opacity="0.7" />
      {/* Cycling password characters */}
      <text x="38" y="72" fontFamily="'Fira Code', monospace" fontSize="16" fontWeight="700" fill="#E7DDD0" className="c1">x#9kP!mZ</text>
      <text x="38" y="72" fontFamily="'Fira Code', monospace" fontSize="16" fontWeight="700" fill="#E7DDD0" className="c2">Qv$2nR@w</text>
      <text x="38" y="72" fontFamily="'Fira Code', monospace" fontSize="16" fontWeight="700" fill="#E7DDD0" className="c3">Lm7&amp;fYs!</text>
      <text x="38" y="72" fontFamily="'Fira Code', monospace" fontSize="16" fontWeight="700" fill="#E7DDD0" className="c4">Bz5^tK#J</text>
      <rect className="cursor" x="148" y="60" width="2" height="18" rx="1" fill="#7C5C3B" />
      {/* Strength bar */}
      <rect x="38" y="84" width="124" height="4" rx="2" fill="#FFFFFF" opacity="0.1" />
      <rect x="38" y="84" width="110" height="4" rx="2" fill="#22C55E" opacity="0.6">
        <animate attributeName="width" values="30;70;110;90;110" dur="3s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

function TemplatesVisual() {
  return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', height: 120 }}>
      <style>{`
        @keyframes fan1 { 0%,100% { transform: rotate(-6deg) translateY(0); } 50% { transform: rotate(-12deg) translateY(-4px); } }
        @keyframes fan2 { 0%,100% { transform: rotate(0deg) translateY(0); } 50% { transform: rotate(0deg) translateY(-2px); } }
        @keyframes fan3 { 0%,100% { transform: rotate(6deg) translateY(0); } 50% { transform: rotate(12deg) translateY(-4px); } }
        .card1 { animation: fan1 4s ease-in-out infinite; transform-origin: 100px 110px; }
        .card2 { animation: fan2 4s ease-in-out infinite; transform-origin: 100px 110px; }
        .card3 { animation: fan3 4s ease-in-out infinite; transform-origin: 100px 110px; }
      `}</style>
      {/* Fanning card stack */}
      <g className="card1">
        <rect x="60" y="18" width="80" height="92" rx="10" fill="#FFFFFF" stroke="#E7DDD0" strokeWidth="1.5" />
        <rect x="70" y="30" width="28" height="4" rx="2" fill="#E7DDD0" />
        <rect x="70" y="40" width="60" height="3" rx="1.5" fill="#F1E7DA" />
        <rect x="70" y="48" width="48" height="3" rx="1.5" fill="#F1E7DA" />
        <circle cx="72" cy="70" r="6" fill="#EAF3EC" stroke="#7C5C3B" strokeWidth="1" />
        <text x="82" y="73" fontSize="8" fill="#7C5C3B" fontWeight="600">Credit Card</text>
      </g>
      <g className="card2">
        <rect x="60" y="18" width="80" height="92" rx="10" fill="#FFFFFF" stroke="#E7DDD0" strokeWidth="1.5" />
        <rect x="70" y="30" width="32" height="4" rx="2" fill="#E7DDD0" />
        <rect x="70" y="40" width="55" height="3" rx="1.5" fill="#F1E7DA" />
        <rect x="70" y="48" width="40" height="3" rx="1.5" fill="#F1E7DA" />
        <circle cx="72" cy="70" r="6" fill="#EAF0F8" stroke="#7C5C3B" strokeWidth="1" />
        <text x="82" y="73" fontSize="8" fill="#7C5C3B" fontWeight="600">Bank Account</text>
      </g>
      <g className="card3">
        <rect x="60" y="18" width="80" height="92" rx="10" fill="#FFFFFF" stroke="#E7DDD0" strokeWidth="1.5" />
        <rect x="70" y="30" width="24" height="4" rx="2" fill="#E7DDD0" />
        <rect x="70" y="40" width="50" height="3" rx="1.5" fill="#F1E7DA" />
        <rect x="70" y="48" width="44" height="3" rx="1.5" fill="#F1E7DA" />
        <circle cx="72" cy="70" r="6" fill="#ECE8F1" stroke="#7C5C3B" strokeWidth="1" />
        <text x="82" y="73" fontSize="8" fill="#7C5C3B" fontWeight="600">Passport</text>
      </g>
    </svg>
  );
}

function DeviceManagementVisual() {
  return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', height: 120 }}>
      <style>{`
        @keyframes pulse1 { 0%,100% { r: 3; opacity: 0.6; } 50% { r: 5; opacity: 1; } }
        @keyframes pulse2 { 0%,100% { r: 3; opacity: 0.4; } 50% { r: 5; opacity: 0.8; } }
        @keyframes scanLine { 0% { y1: 20; y2: 20; } 100% { y1: 100; y2: 100; } }
        .dp1 { animation: pulse1 2s ease-in-out infinite; }
        .dp2 { animation: pulse2 2.5s ease-in-out infinite 0.5s; }
      `}</style>
      {/* Desktop monitor */}
      <rect x="30" y="20" width="60" height="42" rx="6" fill="#FFFFFF" stroke="#E7DDD0" strokeWidth="1.5" />
      <rect x="34" y="24" width="52" height="30" rx="2" fill="#F7F4EE" />
      <rect x="50" y="62" width="20" height="4" rx="1" fill="#E7DDD0" />
      <rect x="44" y="66" width="32" height="3" rx="1.5" fill="#E7DDD0" />
      {/* Mobile phone */}
      <rect x="110" y="30" width="28" height="48" rx="5" fill="#FFFFFF" stroke="#E7DDD0" strokeWidth="1.5" />
      <rect x="114" y="38" width="20" height="28" rx="1" fill="#F7F4EE" />
      <circle cx="124" cy="72" r="2" fill="#E7DDD0" />
      {/* Tablet */}
      <rect x="150" y="24" width="36" height="50" rx="5" fill="#FFFFFF" stroke="#E7DDD0" strokeWidth="1.5" />
      <rect x="154" y="30" width="28" height="36" rx="1" fill="#F7F4EE" />
      {/* Active connection dots */}
      <circle className="dp1" cx="60" cy="39" r="3" fill="#22C55E" />
      <circle className="dp2" cx="124" cy="52" r="3" fill="#22C55E" />
      <circle className="dp1" cx="168" cy="48" r="3" fill="#7C5C3B" />
      {/* Connection lines */}
      <line x1="90" y1="42" x2="110" y2="52" stroke="#E7DDD0" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" from="0" to="12" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="138" y1="48" x2="150" y2="48" stroke="#E7DDD0" strokeWidth="1" strokeDasharray="3 3">
        <animate attributeName="stroke-dashoffset" from="0" to="12" dur="2s" repeatCount="indefinite" />
      </line>
      {/* Status bar */}
      <rect x="30" y="92" width="156" height="14" rx="7" fill="#F1E7DA" />
      <rect x="34" y="95" width="40" height="8" rx="4" fill="#22C55E" opacity="0.5" />
      <text x="80" y="102" fontSize="7" fill="#756C63" fontWeight="600">3 devices connected</text>
    </svg>
  );
}

function SecurityCenterVisual() {
  // Circle circumference = 2 * PI * r = 2 * 3.14159 * 42 ≈ 264
  // 3/4 fill → dashoffset = 264 * 0.25 = 66
  return (
    <svg viewBox="0 0 200 130" fill="none" style={{ width: '100%', height: 130 }}>
      <style>{`
        @keyframes gaugeRotate { 0% { stroke-dashoffset: 264; } 100% { stroke-dashoffset: 66; } }
        @keyframes scoreCount { 0% { opacity: 0; } 30% { opacity: 1; } }
        .gauge-fill { animation: gaugeRotate 2s ease-out forwards; }
        .score-text { animation: scoreCount 2s ease-out forwards; }
      `}</style>
      {/* Circular gauge background */}
      <circle cx="100" cy="56" r="42" fill="none" stroke="#E7DDD0" strokeWidth="8" strokeLinecap="round" strokeDasharray="264" transform="rotate(-90 100 56)" opacity="0.4" />
      {/* Gauge fill arc - 3/4 */}
      <circle className="gauge-fill" cx="100" cy="56" r="42" fill="none" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="264" transform="rotate(-90 100 56)" opacity="0.8" />
      {/* Inner circle */}
      <circle cx="100" cy="56" r="32" fill="#FFFFFF" />
      {/* Score - 75 */}
      <text className="score-text" x="100" y="52" textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="800" fill="#29231E">75</text>
      <text x="100" y="73" textAnchor="middle" fontSize="8" fontWeight="700" fill="#756C63" letterSpacing="1">HEALTH</text>      {/* Legend - spaced out properly below gauge */}
      <circle cx="30" cy="116" r="4" fill="#22C55E" opacity="0.6" />
      <text x="38" y="119" fontSize="8" fill="#756C63" fontWeight="600">Strong</text>
      <circle cx="88" cy="116" r="4" fill="#F59E0B" opacity="0.6" />
      <text x="96" y="119" fontSize="8" fill="#756C63" fontWeight="600">Reused</text>
      <circle cx="146" cy="116" r="4" fill="#EF4444" opacity="0.6" />
      <text x="154" y="119" fontSize="8" fill="#756C63" fontWeight="600">Weak</text>
    </svg>
  );
}

function BackupsVisual() {
  return (
    <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', height: 120 }}>
      <style>{`
        @keyframes dbPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes downloadBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .db-glow { animation: dbPulse 3s ease-in-out infinite; }
        .dl-arrow { animation: downloadBounce 1.5s ease-in-out infinite; }
      `}</style>
      {/* Database cylinder */}
      <ellipse cx="80" cy="30" rx="32" ry="10" fill="#F1E7DA" stroke="#E7DDD0" strokeWidth="1.5" />
      <rect x="48" y="30" width="64" height="50" fill="#F1E7DA" stroke="none" />
      <line x1="48" y1="30" x2="48" y2="80" stroke="#E7DDD0" strokeWidth="1.5" />
      <line x1="112" y1="30" x2="112" y2="80" stroke="#E7DDD0" strokeWidth="1.5" />
      <ellipse cx="80" cy="50" rx="32" ry="10" fill="none" stroke="#E7DDD0" strokeWidth="1" opacity="0.5" />
      <ellipse cx="80" cy="80" rx="32" ry="10" fill="#F1E7DA" stroke="#E7DDD0" strokeWidth="1.5" />
      {/* Data rows */}
      <rect x="58" y="36" width="44" height="3" rx="1.5" fill="#7C5C3B" opacity="0.2" />
      <rect x="58" y="43" width="36" height="3" rx="1.5" fill="#7C5C3B" opacity="0.15" />
      <rect x="58" y="56" width="40" height="3" rx="1.5" fill="#7C5C3B" opacity="0.2" />
      <rect x="58" y="63" width="32" height="3" rx="1.5" fill="#7C5C3B" opacity="0.15" />
      {/* Lock on database */}
      <circle className="db-glow" cx="80" cy="78" r="6" fill="#7C5C3B" opacity="0.5" />
      <rect x="77" y="76" width="6" height="5" rx="1" fill="#FFFFFF" opacity="0.8" />
      {/* Download arrow */}
      <g className="dl-arrow">
        <line x1="152" y1="38" x2="152" y2="66" stroke="#7C5C3B" strokeWidth="2.5" strokeLinecap="round" />
        <polyline points="142,58 152,70 162,58" fill="none" stroke="#7C5C3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Download base */}
      <path d="M138 78 L138 84 Q138 88 142 88 L162 88 Q166 88 166 84 L166 78" fill="none" stroke="#7C5C3B" strokeWidth="2" strokeLinecap="round" />
      {/* File icon */}
      <rect x="138" y="96" width="28" height="6" rx="3" fill="#22C55E" opacity="0.3" />
      <text x="152" y="101" textAnchor="middle" fontSize="5" fill="#22C55E" fontWeight="700">.enc</text>
    </svg>
  );
}

const FEATURE_VISUALS = {
  'Zero-Knowledge Encryption': EncryptionVisual,
  'Password Generation': PasswordGenVisual,
  'Dynamic Templates': TemplatesVisual,
  'Device Management': DeviceManagementVisual,
  'Security Center': SecurityCenterVisual,
  'Encrypted Backups': BackupsVisual,
};

function FeatureBox({ icon: Icon, title, desc, bg, delay }) {
  const [hovered, setHovered] = useState(false);
  const Visual = FEATURE_VISUALS[title];

  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: bg,
          border: `1px solid ${T.border}`,
          borderRadius: 20, padding: '32px 24px',
          transition: 'all 0.3s ease', cursor: 'default', height: '100%',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? T.shadow : 'none'
        }}
      >
        {/* Animated SVG illustration */}
        {Visual ? (
          <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden' }}>
            <Visual />
          </div>
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: T.card, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
            boxShadow: '0 4px 12px rgba(80,60,40,0.04)'
          }}>
            <Icon size={24} color={T.accent} />
          </div>
        )}
        <div style={{ fontSize: 18, fontWeight: 800, color: T.textHeading, marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 15, color: T.textSec, lineHeight: 1.6, fontWeight: 500 }}>{desc}</div>
      </div>
    </FadeIn>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled || mobileMenuOpen ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'none',
      borderBottom: scrolled || mobileMenuOpen ? `1px solid ${T.border}` : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', zIndex: 101 }} onClick={() => setMobileMenuOpen(false)}>
          <img src="/logo.svg" alt="Passwordsaver Logo" style={{ width: 40, height: 40 }} />
          <span style={{ fontSize: 18, fontWeight: 800, color: T.textHeading, letterSpacing: '-0.5px' }}>passwordsaver</span>
        </Link>

        {/* Center Nav Links - Desktop only */}
        <div className="desktop-nav" style={{ gap: 32 }}>
          <Link to="/features" style={{ fontSize: 15, fontWeight: 600, color: T.textSec, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = T.textHeading} onMouseOut={e => e.target.style.color = T.textSec}>Features</Link>

          <a href="#about" style={{ fontSize: 15, fontWeight: 600, color: T.textSec, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = T.textHeading} onMouseOut={e => e.target.style.color = T.textSec}>About Us</a>

          <Link to="/faq" style={{ fontSize: 15, fontWeight: 600, color: T.textSec, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseOver={e => e.target.style.color = T.textHeading} onMouseOut={e => e.target.style.color = T.textSec}>Q & A</Link>
        </div>

        {/* Right CTA - Desktop only */}
        <div className="desktop-nav" style={{ gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: 15, fontWeight: 700, color: T.textHeading, textDecoration: 'none', padding: '8px 16px', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = T.accent} onMouseOut={e => e.currentTarget.style.color = T.textHeading}>
            Sign In
          </Link>
          <Link to="/register" style={{
            fontSize: 15, fontWeight: 700, color: '#fff', background: T.accent, textDecoration: 'none',
            borderRadius: 12, padding: '10px 24px', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(124,92,59,0.2)'
          }}
            onMouseOver={e => { e.currentTarget.style.background = '#5E4429'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = 'none'; }}>
            Get Started
          </Link>
        </div>

        {/* Hamburger Menu Icon - Mobile only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-nav-btn"
          style={{ background: 'transparent', border: 'none', color: T.textHeading, cursor: 'pointer', padding: 4, zIndex: 101 }}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Responsive Mobile Overlay Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute', top: 72, left: 0, right: 0,
          background: T.card, borderBottom: `1px solid ${T.border}`, padding: '24px 24px 32px',
          flexDirection: 'column', gap: 24, zIndex: 100,
          boxShadow: T.shadow
        }}>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: 16, fontWeight: 500, color: T.textPrimary, textDecoration: 'none', padding: '6px 0' }}>Features</Link>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: 16, fontWeight: 500, color: T.textPrimary, textDecoration: 'none', padding: '6px 0' }}>About Us</a>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: 16, fontWeight: 500, color: T.textPrimary, textDecoration: 'none', padding: '6px 0' }}>Q & A</Link>

          <div style={{ height: '1px', background: T.border, margin: '4px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{
              fontSize: 15, fontWeight: 700, color: T.textHeading, textDecoration: 'none',
              textAlign: 'center', padding: '12px', border: `1px solid ${T.border}`, borderRadius: 12, background: T.bg
            }}>
              Sign In
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{
              fontSize: 15, fontWeight: 700, color: '#fff', background: T.accent, textDecoration: 'none',
              textAlign: 'center', padding: '12px', borderRadius: 12
            }}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────
function Hero() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 88, pb: 40, position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1000, width: '100%', padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FadeIn delay={0}>
          <div style={{ marginBottom: 24 }}>
            <Pill><Lock size={14} /> Zero-Knowledge Architecture</Pill>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 style={{
            fontSize: 'clamp(40px, 7vw, 84px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.05,
            color: T.textHeading, marginBottom: 24,
          }}>
            The secure front door<br />
            to your digital life.
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p style={{ fontSize: 'clamp(16px, 3vw, 20px)', color: T.textSec, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 40px', textAlign: 'center', fontWeight: 400 }}>
            Passwordsaver encrypts everything on your device before it leaves the browser. Keep all your credentials secure in a single place.
          </p>
        </FadeIn>
        <FadeIn delay={300}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 56, width: '100%' }}>
            <Link to="/register" style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#fff',
              background: T.accent, textDecoration: 'none', borderRadius: 14, padding: '16px 32px', transition: 'all 0.2s',
              justifyContent: 'center', minWidth: '180px', boxShadow: '0 4px 14px rgba(124,92,59,0.2)'
            }}
              onMouseOver={e => { e.currentTarget.style.background = '#5E4429'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseOut={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = 'scale(1)'; }}>
              Create Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: T.textHeading,
              background: T.card, border: `1px solid ${T.border}`, textDecoration: 'none', borderRadius: 14, padding: '16px 32px', transition: 'all 0.2s',
              justifyContent: 'center', minWidth: '180px'
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = T.shadow; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}>
              Sign In to Vault
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div style={{
            display: 'flex', gap: '20px 32px', flexWrap: 'wrap', justifyContent: 'center',
            padding: '20px 32px', background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, boxShadow: '0 8px 24px rgba(80,60,40,0.04)'
          }}>
            {[
              { icon: Lock, text: 'AES-256-GCM' },
              { icon: Cpu, text: 'PBKDF2 · 600k' },
              { icon: Shield, text: 'Argon2id' },
              { icon: EyeOff, text: 'Zero-knowledge' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={16} color={T.accent} />
                <span style={{ fontSize: 14, fontWeight: 700, color: T.textSec, fontFamily: "'Fira Code', monospace" }}>{text}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

// ─── Features (Strict 3x2 Grid) ──────────────────────────────────────
function FeaturesGrid() {
  const features = [
    { bg: '#EAF3EC', icon: Lock, title: 'Zero-Knowledge Encryption', desc: 'Your password derives an encryption key locally via PBKDF2. Data is encrypted via AES-256-GCM before it ever touches the network.' },
    { bg: '#F4ECE2', icon: KeyRound, title: 'Password Generation', desc: 'Cryptographically random passwords using rejection sampling for zero bias. Custom lengths, exact character sets, and passphrases.' },
    { bg: '#ECE8F1', icon: LayoutTemplate, title: 'Dynamic Templates', desc: 'Beyond basic passwords. Store credit cards, bank accounts, Aadhaar, Passports, API keys, or build entirely custom templates.' },
    { bg: '#EAF0F8', icon: Settings, title: 'Device Management', desc: 'Complete visibility over your vault. See the exact browser, OS, and IP of every active session. Revoke unrecognized devices instantly.' },
    { bg: '#F9EFE8', icon: Activity, title: 'Security Center', desc: 'Client-side vault health scoring. We analyze weak, reused, and old passwords entirely within your browser memory so data stays private.' },
    { bg: '#EEF4E8', icon: Database, title: 'Encrypted Backups', desc: 'Own your data. Export your entire vault as an AES-256-GCM encrypted file that only your specific password can ever decrypt.' },
  ];

  return (
    <div id="features" style={{ padding: '80px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Pill>Capabilities</Pill>
            <SectionHeading style={{ marginTop: 24 }}>Everything you need.<br />Nothing you don't.</SectionHeading>
          </div>
        </FadeIn>

        {/* CSS grid class handles 3x2 structure via injected media queries at the bottom */}
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureBox key={f.title} bg={f.bg} icon={f.icon} title={f.title} desc={f.desc} delay={i * 60} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── About Us ─────────────────────────────────────────────────────────
function AboutUs() {
  const items = [
    { icon: EyeOff, text: 'Zero server visibility' },
    { icon: ShieldCheck, text: 'No recovery backdoors' },
    { icon: Lock, text: 'No plaintext stored' },
    { icon: Fingerprint, text: 'You hold the only keys' },
  ];

  return (
    <div id="about" style={{ padding: '80px 24px', background: T.card, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <Pill>About Us</Pill>

          <SectionHeading style={{ marginTop: 24, marginBottom: 32 }}>
            Privacy is not a feature.<br />It's the architecture.
          </SectionHeading>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: T.textSec, lineHeight: 1.7, marginBottom: 48, fontWeight: 500 }}>
            Passwordsaver was built on a single, uncompromising rule:
            <strong style={{ color: T.textHeading, fontWeight: 800 }}>
              {' '}the server should never be able to read your data, even if it wanted to.
            </strong>
          </p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.text} delay={i * 60}>
                <div style={{
                  background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, padding: '24px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14
                }}>
                  <Icon size={26} color={T.accent} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: T.textHeading, textAlign: 'center' }}>
                    {item.text}
                  </span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Q & A (FAQ) ──────────────────────────────────────────────────────
function QAndA() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: 'What does zero-knowledge mean exactly?', a: 'It means the server never has the information needed to decrypt your vault. Your password derives an encryption key on your device. Only the resulting AES-256-GCM ciphertext is sent to the server — never the plaintext.' },
    { q: 'What happens if I forget my password?', a: 'There is no recovery option, and this is intentional. If there were a way to recover it, someone other than you would have the ability to derive your encryption key, breaking the zero-knowledge guarantee.' },
    { q: 'What encryption algorithm is used?', a: 'We use AES-256-GCM. GCM is an authenticated encryption mode, meaning any tampering with the ciphertext is detected before decryption even begins. A fresh 96-bit IV is generated for every vault item.' },
    { q: 'Can I export my vault data?', a: 'Yes. You can export your entire vault as an AES-256-GCM encrypted backup file. The export is re-encrypted with your vault key before downloading, so even the file is safe.' },
  ];

  return (
    <div id="faq" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Pill>Q & A</Pill>
            <SectionHeading style={{ marginTop: 24 }}>Answers to your questions</SectionHeading>
          </div>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{
                background: open === i ? T.inputBg : T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 16, overflow: 'hidden', transition: 'all 0.3s ease',
              }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left', gap: 16
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color: T.textHeading }}>{faq.q}</span>
                  <ChevronDown size={20} color={T.accent} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
                </button>
                <div style={{
                  maxHeight: open === i ? '240px' : '0', opacity: open === i ? 1 : 0,
                  overflow: 'hidden', transition: 'all 0.3s ease',
                  padding: open === i ? '0 24px 20px' : '0 24px 0',
                }}>
                  <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.6, fontWeight: 500 }}>{faq.a}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, padding: '64px 24px 40px', background: T.card }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px 64px', justifyContent: 'space-between', marginBottom: 64 }}>

          <div style={{ maxWidth: 300 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <img src="/logo.svg" alt="Passwordsaver Logo" style={{ width: 40, height: 40 }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: T.textHeading, letterSpacing: '-0.5px' }}>passwordsaver</span>
            </Link>
            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, fontWeight: 500 }}>
              Zero-knowledge password management. Built on cryptographic trust and uncompromising privacy standards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '32px 64px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textHeading, marginBottom: 20 }}>Product</div>
              <div style={{ marginBottom: 12 }}><Link to="/features" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Features</Link></div>
              <div style={{ marginBottom: 12 }}><a href="#about" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Security Model</a></div>
              <div style={{ marginBottom: 12 }}><Link to="/login" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Download Backup</Link></div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textHeading, marginBottom: 20 }}>Company</div>
              <div style={{ marginBottom: 12 }}><a href="#about" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>About Us</a></div>
              <div style={{ marginBottom: 12 }}><Link to="/faq" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Q & A</Link></div>
              <div style={{ marginBottom: 12 }}><Link to="/contact" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Contact Us</Link></div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textHeading, marginBottom: 20 }}>Legal</div>
              <div style={{ marginBottom: 12 }}><Link to="/privacy" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link></div>
              <div style={{ marginBottom: 12 }}><Link to="/terms" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link></div>
              <div style={{ marginBottom: 12 }}><Link to="/features" style={{ fontSize: 14, color: T.textSec, textDecoration: 'none', fontWeight: 500 }}>Security Policy</Link></div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 13, color: T.textSec, fontWeight: 500 }}>© {new Date().getFullYear()} passwordsaver. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page Assembly ───────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  return (
    <div style={{
      background: T.bg, color: T.textPrimary, minHeight: '100vh', overflowX: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* PURE CSS INJECTION FOR RESPONSIVENESS AND STRICT GRID 
        This is what ensures the 3x2 grid works and the mobile menu fixes itself.
      */}
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav-btn { display: none; }
        .mobile-menu { display: none; }
        .features-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); /* Enforces exactly 3 columns (2 rows) */
          gap: 24px; 
        }

        /* Mobile Breakpoints */
        @media (max-width: 850px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: flex !important; }
          .mobile-menu { display: flex !important; }
          .features-grid { 
            grid-template-columns: 1fr !important; /* Stacks vertically on phones */
            gap: 16px !important; 
          }
        }
      `}</style>

      <Navbar />
      <Hero />
      <FeaturesGrid />
      <AboutUs />
      <QAndA />
      <Footer />
    </div>
  );
}