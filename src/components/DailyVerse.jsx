import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import './DailyVerse.css';

const DAILY_QUOTES = [
  { quote: 'The future belongs to those who prepare for it today.', author: 'Malcolm X' },
  { quote: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
  { quote: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { quote: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { quote: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
  { quote: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { quote: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { quote: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
  { quote: 'Engineering is the closest thing to magic that exists in the world.', author: 'Elon Musk' },
  { quote: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', author: 'Antoine de Saint-Exupery' },
  { quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { quote: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { quote: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { quote: 'What we know is a drop, what we don’t know is an ocean.', author: 'Isaac Newton' }
];

function getTodayQuote() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % DAILY_QUOTES.length;
  return DAILY_QUOTES[dayIndex];
}

export default function DailyVerse() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [verse] = useState(getTodayQuote);
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

  // 2. Live Campus Weather API (Naya Raipur Coordinates)
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