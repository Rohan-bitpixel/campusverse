import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react';
import './DailyVerse.css';

// Fallback if offline
const DEFAULT_VERSE = {
  quote: "The future belongs to those who prepare for it today.",
  author: "Malcolm X"
};

export default function DailyVerse() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [verse, setVerse] = useState(DEFAULT_VERSE);
  const [weather, setWeather] = useState({ temp: 26, condition: 'Sunny', code: 0 });

  // 1. Live Local Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Synchronized Daily Quote API
  // 2. High-Caliber Daily Wisdom via ZenQuotes (Proxied for CORS & Cached)
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const cached = localStorage.getItem('campusverse_quote_cache');

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === todayKey && parsed.quote) {
          setVerse(parsed);
          return;
        }
      } catch {
        localStorage.removeItem('campusverse_quote_cache');
      }
    }

    // Direct official daily quote via ZenQuotes
    const targetUrl = encodeURIComponent('https://zenquotes.io/api/today');
    fetch(`https://api.allorigins.win/get?url=${targetUrl}`)
      .then((res) => {
        if (!res.ok) throw new Error('Proxy network error');
        return res.json();
      })
      .then((data) => {
        const parsedList = JSON.parse(data.contents);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          const item = parsedList[0];
          const chosen = {
            quote: item.q,
            author: item.a,
            date: todayKey
          };
          setVerse(chosen);
          localStorage.setItem('campusverse_quote_cache', JSON.stringify(chosen));
        }
      })
      .catch(() => {
        // Fallback curated engineering wisdom
        const fallbackCatalog = [
          { quote: "The future belongs to those who prepare for it today.", author: "Malcolm X" },
          { quote: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
          { quote: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
          { quote: "First, solve the problem. Then, write the code.", author: "John Johnson" }
        ];
        const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % fallbackCatalog.length;
        setVerse(fallbackCatalog[dayIndex]);
      });
  }, []);


  
  // 3. Live Campus Weather API (Naya Raipur Coordinates)
  useEffect(() => {
    const LAT = 21.1255;
    const LON = 81.7692;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;

          let condition = 'Sunny';
          if (code === 0) condition = 'Clear';
          else if ([1, 2, 3].includes(code)) condition = 'Partly Cloudy';
          else if ([51, 53, 55, 61, 63, 65].includes(code)) condition = 'Rain';
          else if ([95, 96, 99].includes(code)) condition = 'Storm';

          setWeather({ temp, condition, code });
        }
      })
      .catch(() => {
        // Fallback default
        setWeather({ temp: 26, condition: 'Sunny', code: 0 });
      });
  }, []);

  const renderWeatherIcon = () => {
    if (weather.code === 0) return <Sun className="weather-icon sunny" size={26} />;
    if ([1, 2, 3].includes(weather.code)) return <Cloud className="weather-icon cloudy" size={26} />;
    if ([51, 53, 55, 61, 63, 65].includes(weather.code)) return <CloudRain className="weather-icon rainy" size={26} />;
    return <Sun className="weather-icon sunny" size={26} />;
  };

  return (
    <div className="top-widget-capsule">
      <div className="widget-col widget-time">
        <span className="live-clock">{timeStr || '10:15'}</span>
        <span className="live-date">{dateStr || 'Mon, Oct 28'}</span>
      </div>

      <div className="widget-col widget-quote">
        <span className="quote-label">Daily Verse</span>
        <p className="quote-body">
          "{verse.quote}" – {verse.author}
        </p>
      </div>

      <div className="widget-col widget-weather">
        {renderWeatherIcon()}
        <div className="weather-meta">
          <span className="weather-temp">{weather.temp}°C</span>
          <span className="weather-cond">{weather.condition}</span>
        </div>
      </div>
    </div>
  );
}