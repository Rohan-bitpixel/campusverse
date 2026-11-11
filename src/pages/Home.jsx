import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Fingerprint, 
  CreditCard, 
  Calendar,
  Compass,
  UserPlus,
  GitPullRequest,
  Bus,
  ExternalLink,
  Globe,
  GraduationCap,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import KineticRibbon from '../components/KineticRibbon.jsx';
import DailyVerse from '../components/DailyVerse.jsx';
import TransitMap from './TransitMap.jsx';
import './Home.css';

export default function Home() {
  const [droneOffset, setDroneOffset] = useState(0);
  const droneSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!droneSectionRef.current) return;
      const rect = droneSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const relativeScroll = rect.top - (windowHeight / 2);
        setDroneOffset(relativeScroll * -0.18);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const videoRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;

    if (t < 1.0) {
      setActiveSlide(0);
    } else if (t < 7.0) {
      setActiveSlide(1);
    } else {
      setActiveSlide(2);
    }
  };

  const slides = [
    {
      metric: "50+ ACRES",
      title: "WORLD-CLASS INFRASTRUCTURE",
      subtitle: "Smart sustainable architecture built for research and collegiate living."
    },
    {
      metric: "NEXT-GEN TECH",
      title: "ADVANCED AI & ROBOTICS LABS",
      subtitle: "High-compute clusters and testbeds powering breakthrough engineering."
    },
    {
      metric: "ELECTRIC ATMOSPHERE",
      title: "FLAGSHIP FESTS & ARENAS",
      subtitle: "High-energy national hackathons, cultural festivals, and competitive sports."
    }
  ];

  return (
    <div className="experience-wrapper">
      <KineticRibbon />

      {/* --- HERO SECTION --- */}
      <section className="dark-hero-section">
        <DailyVerse />

        <div className="hero-center-brand">
          <h1 className="hero-display-title">CAMPUS VERSE</h1>
          <div className="hero-subline">
            <span className="subline-text">IIIT NAYA RAIPUR METAVERSE</span>
          </div>
        </div>

        <div className="tile-grid">
          <Link to="/collab" className="tile-card tile-collab">
            <div className="tile-inner">
              <div className="icon-stage">
                <span className="radar-ring" />
                <Users className="tile-icon icon-collab" size={28} />
              </div>
              <span className="tile-title">COLLAB</span>
            </div>
          </Link>

          {/* Clean route to the dedicated map page */}
          <Link to="/map" className="tile-card tile-map">
            <div className="tile-inner">
              <div className="icon-stage">
                <MapPin className="tile-icon icon-map" size={28} />
              </div>
              <span className="tile-title">CAMPUS MAP</span>
            </div>
          </Link>

      <Link to="/profile" className="tile-card tile-profile">
  <div className="tile-inner">
    <div className="icon-stage">
      <span className="biometric-beam" />
      <Fingerprint className="tile-icon icon-profile" size={28} />
    </div>
    <span className="tile-title">MY PROFILE</span>
  </div>
</Link>

          <div className="tile-card tile-id">
            <div className="tile-inner">
              <div className="icon-stage">
                <CreditCard className="tile-icon icon-id" size={28} />
              </div>
              <span className="tile-title">STUDENT ID</span>
            </div>
          </div>

          <div className="tile-card tile-events">
            <div className="tile-inner">
              <div className="icon-stage">
                <Calendar className="tile-icon icon-events" size={28} />
              </div>
              <span className="tile-title">EVENTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- AMBIENT VIDEO HERO REEL --- */}
      <section className="ambient-video-hero">
        <video
          ref={videoRef}
          className="ambient-video-player"
          src="/campus-reel.mp4"
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
        />

        <div className="video-scrim-top" />
        <div className="video-scrim-bottom" />
        <div className="video-ambient-overlay" />

        <div className="video-floating-container">
          <div className="video-text-column">
            <div key={activeSlide} className="open-stat-content">
              <span className="stat-metric-tag">{slides[activeSlide].metric}</span>
              <h2 className="stat-giant-title">{slides[activeSlide].title}</h2>
              <p className="stat-clean-sub">{slides[activeSlide].subtitle}</p>
            </div>

            <div className="sync-dots">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`sync-dot ${activeSlide === idx ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="portal-buttons-dock">
            <a
              href="https://www.iiitnr.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-rect-btn"
            >
              <Globe size={18} className="btn-glyph" />
              <div className="btn-text-block">
                <span className="btn-label">OFFICIAL SITE</span>
                <span className="btn-dest">iiitnr.ac.in</span>
              </div>
              <ExternalLink size={14} className="arrow-glyph" />
            </a>

            <a
              href="https://erp.iiitnr.edu.in/studentCourseRegistration.action?module.id=1024622592"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-rect-btn highlighted"
            >
              <GraduationCap size={18} className="btn-glyph" />
              <div className="btn-text-block">
                <span className="btn-label">ERP PORTAL</span>
                <span className="btn-dest">Academic Login</span>
              </div>
              <ExternalLink size={14} className="arrow-glyph" />
            </a>

            <a
              href="https://www.google.com/maps/place/International+Institute+of+Information+Technology,+Naya+Raipur/@21.1284644,81.7661654,17z/data=!3m1!4b1!4m6!3m5!1s0x3a28c434ac2ae871:0x4e3568497a7e1d7e!8m2!3d21.1284644!4d81.7661654!16s%2Fg%2F11dxm6nvnl?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="portal-rect-btn"
            >
              <Navigation size={18} className="btn-glyph" />
              <div className="btn-text-block">
                <span className="btn-label">CAMPUS MAP</span>
                <span className="btn-dest">Google Maps</span>
              </div>
              <ExternalLink size={14} className="arrow-glyph" />
            </a>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: 3D PARALLAX DRONE FEATURES --- */}
      <section ref={droneSectionRef} className="drone-features-section">
        <div 
          className="drone-parallax-bg" 
          style={{ transform: `translate3d(0, ${droneOffset}px, 0)` }}
        />
        <div className="drone-features-overlay" />

        <div className="section-container relative-content">
          <div className="drone-features-header">
            <span className="badge-drone">ECOSYSTEM HIGHLIGHTS</span>
            <h2>CampusVerse Features</h2>
            <p>Essential utilities designed for everyday collegiate life at IIIT Naya Raipur</p>
          </div>

          <div className="features-quad-grid">
            <Link to="/map" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="drone-card" style={{ cursor: 'pointer' }}>
                <div className="drone-icon-box">
                  <Compass size={24} />
                </div>
                <div className="drone-card-text">
                  <h3>Campus Map</h3>
                  <p>Navigate academic blocks, research labs, hostels, mess facilities, and open grounds with marked campus pathways.</p>
                </div>
              </div>
            </Link>

            <div className="drone-card">
              <div className="drone-icon-box">
                <GitPullRequest size={24} />
              </div>
              <div className="drone-card-text">
                <h3>Collab Board</h3>
                <p>Form hackathon rosters, coordinate group assignments, and post open collaboration calls across engineering batches.</p>
              </div>
            </div>

            <div className="drone-card">
              <div className="drone-icon-box">
                <Calendar size={24} />
              </div>
              <div className="drone-card-text">
                <h3>Know the Events</h3>
                <p>Stay updated on technical fests, cultural celebrations, competitive club meets, and guest speaker sessions.</p>
              </div>
            </div>

            <div className="drone-card">
              <div className="drone-icon-box">
                <UserPlus size={24} />
              </div>
              <div className="drone-card-text">
                <h3>Find a Teammate</h3>
                <p>Discover student peers by programming skills, project domain interests, tech stacks, and academic years.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: BUS ROUTE TRANSIT & DOWNLOAD CENTER --- */}
      <section className="transit-section">
        <div className="section-container">
          <div className="transit-header">
            <div className="transit-badge">
              <Bus size={16} />
              <span>TRANSIT RADAR</span>
            </div>
            <h2>BRTS Transit</h2>
          </div>

          <TransitMap />
        </div>
      </section>

      {/* --- SECTION 3: ACTION, SUPPORT & CAMPUS FOOTER --- */}
      <footer className="campus-footer-section">
        <div className="footer-container">
          <div className="footer-action-banner">
            <div className="action-banner-text">
              <h3>Campus Assistance & Portal Desk</h3>
              <p>Submit campus inquiries, institutional feedback, or portal issue tickets</p>
            </div>
            <div className="action-buttons-group">
              <a href="#" className="footer-btn btn-report" onClick={(e) => e.preventDefault()}>
                Report Issue
              </a>
              <a href="#" className="footer-btn btn-feedback" onClick={(e) => e.preventDefault()}>
                Feedback
              </a>
              <a href="#" className="footer-btn btn-contact" onClick={(e) => e.preventDefault()}>
                Contact Us
              </a>
            </div>
          </div>

          <div className="footer-nav-grid">
            <div className="footer-col brand-col">
              <div className="footer-brand-title">CampusVerse</div>
              <p className="footer-brand-desc">
                Unified student hub and navigation radar engineered for Dr. SPM IIIT Naya Raipur.
              </p>
              <div className="footer-tagline">Naya Raipur, Chhattisgarh 493661</div>
            </div>

            <div className="footer-col">
              <h4>Academics</h4>
              <ul className="footer-link-list">
                <li><a href="#" onClick={(e) => e.preventDefault()}>B.Tech Curriculum</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Academic Calendar 2026-27</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Course Registration ERP</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Examination Cell</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Campus Life</h4>
              <ul className="footer-link-list">
                <li><a href="#" onClick={(e) => e.preventDefault()}>Hostel Regulations</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Mess Committee & Menu</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>SAC & Technical Clubs</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Sports Complex Access</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Institutional</h4>
              <ul className="footer-link-list">
                <li><a href="#" onClick={(e) => e.preventDefault()}>Anti-Ragging Helpline</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Internal Complaints Committee</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Library Repository</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Network & IT Policies</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>&copy; {new Date().getFullYear()} CampusVerse • IIIT Naya Raipur. All rights reserved.</span>
            <span className="footer-status-pill">System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}