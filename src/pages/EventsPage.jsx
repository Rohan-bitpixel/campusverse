import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  ExternalLink,
  FileText,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './Events.css';

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const ONGOING_WINDOW_MS = 3 * 60 * 60 * 1000;

function isImageUrl(url) {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return /\.(png|jpg|jpeg|webp|gif|avif)$/.test(clean);
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'ongoing' | 'upcoming' | 'past'
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const cutoffIso = new Date(Date.now() - THREE_DAYS_MS).toISOString();

    supabase
      .from('events')
      .select('*')
      .gte('start_time', cutoffIso)
      .order('start_time', { ascending: true })
      .then(({ data }) => {
        if (data) setEvents(data);
        setLoading(false);
      });
  }, []);

  const handleDownloadFile = async (url, fallbackName = 'event-media') => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = url.split('?')[0].split('.').pop() || 'png';
      a.href = blobUrl;
      a.download = `${fallbackName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const now = Date.now();

  const ongoingEvents = events.filter((ev) => {
    const t = new Date(ev.start_time).getTime();
    return t <= now && now - t <= ONGOING_WINDOW_MS;
  });

  const upcomingEvents = events.filter((ev) => {
    const t = new Date(ev.start_time).getTime();
    return t > now;
  });

  const pastEvents = events
    .filter((ev) => {
      const t = new Date(ev.start_time).getTime();
      return now - t > ONGOING_WINDOW_MS && now - t <= THREE_DAYS_MS;
    })
    .reverse();

  const visibleList =
    activeTab === 'ongoing'
      ? ongoingEvents
      : activeTab === 'past'
      ? pastEvents
      : upcomingEvents;

  return (
    <div className="events-page">
      <div className="events-orb-green" />
      <div className="events-orb-blue" />

      <header className="topbar">
        <Link to="/" className="brand">
          CAMPUS<b>VERSE</b>
        </Link>
        <span>EVENTS RADAR</span>
        <Link to="/" className="outline-btn">
          Home
        </Link>
      </header>

      <div className="events-container">
        <div className="events-filter-bar">
          <button
            type="button"
            className={`event-tab-pill ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            ONGOING <span className="event-count-badge">{ongoingEvents.length}</span>
          </button>
          <button
            type="button"
            className={`event-tab-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            UPCOMING <span className="event-count-badge">{upcomingEvents.length}</span>
          </button>
          <button
            type="button"
            className={`event-tab-pill ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            PAST (3D) <span className="event-count-badge">{pastEvents.length}</span>
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>LOADING...</p>
        ) : visibleList.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
            NO {activeTab.toUpperCase()} EVENTS
          </p>
        ) : (
          <div className="events-accordion-stack">
            {visibleList.map((ev) => {
              const isOpen = expandedId === ev.id;
              const allMedia = Array.isArray(ev.media_urls) && ev.media_urls.length > 0
                ? ev.media_urls
                : [ev.banner_url, ev.media_url].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);

              const imageAttachments = allMedia.filter(isImageUrl);
              const docAttachments = allMedia.filter((u) => !isImageUrl(u));

              return (
                <div key={ev.id} className={`event-glass-item ${isOpen ? 'expanded' : ''}`}>
                  {/* FRONT: Title + Venue + Date & Time + Icon-only Expand Button */}
                  <div className="event-front-header">
                    <div className="event-title-left">
                      <div className="event-meta-pills">
                        <span className="event-cat-tag">{ev.category}</span>
                        <span className="event-club-tag">{ev.club_name}</span>
                        <span className="event-club-tag">
                          <Calendar size={13} color="#38d5e8" />
                          {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                          {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {ev.venue && (
                          <span className="event-club-tag">
                            <MapPin size={13} color="#38d5e8" />
                            {ev.venue}
                          </span>
                        )}
                        <span className="event-club-tag">
                          <Clock size={13} color="#38d5e8" />
                          {ev.entry_type || 'Free'}
                        </span>
                      </div>

                      <h2 className="event-main-heading">{ev.title}</h2>
                    </div>

                    <button
                      type="button"
                      className="event-icon-expand-btn"
                      onClick={() => setExpandedId(isOpen ? null : ev.id)}
                      aria-label="Toggle event details"
                    >
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* EXPANDED: Full Description + Inline Images (with Download) + Multiple Attachments */}
                  {isOpen && (
                    <div className="event-expand-body">
                      {ev.description && <p className="event-desc-copy">{ev.description}</p>}

                      {imageAttachments.length > 0 && (
                        <div className="event-media-gallery">
                          {imageAttachments.map((imgUrl, idx) => (
                            <div key={imgUrl} className="event-image-card">
                              <img
                                src={imgUrl}
                                alt={`${ev.title} ${idx + 1}`}
                                className="event-poster-preview"
                              />
                              <div className="event-image-footer">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(imgUrl, `${ev.title.replace(/\s+/g, '-')}-${idx + 1}`)}
                                  className="event-cta-btn"
                                >
                                  <Download size={14} /> DOWNLOAD
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {(ev.registration_link || docAttachments.length > 0) && (
                        <div className="event-action-links">
                          {ev.registration_link && (
                            <a
                              href={ev.registration_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="event-cta-btn"
                            >
                              REGISTER <ExternalLink size={14} />
                            </a>
                          )}

                          {docAttachments.map((docUrl, idx) => (
                            <button
                              key={docUrl}
                              type="button"
                              onClick={() => handleDownloadFile(docUrl, `${ev.title.replace(/\s+/g, '-')}-doc-${idx + 1}`)}
                              className="event-cta-btn"
                            >
                              <FileText size={14} /> ATTACHMENT {docAttachments.length > 1 ? idx + 1 : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}