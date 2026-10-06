import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cloud, Calendar, GraduationCap, Users, FolderGit2, Clock, Sparkles, Terminal, Book, Brain, Loader2, Wind, Droplets } from 'lucide-react';
import { fetchWeather, fetchAINews, launchApp, fetchGitHubRepos } from '../../services/api';
import { db } from '../../db';

export default function DashboardView() {
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [aiNews, setAiNews] = useState('');
  const [newsLoading, setNewsLoading] = useState(true);
  const [repoCount, setRepoCount] = useState(0);

  const activeCourses = useLiveQuery(() => db.courses?.where({ status: 'active' }).toArray()) || [];
  const groups = useLiveQuery(() => db.groups?.toArray()) || [];

  const activeCoursesCount = activeCourses.length;
  // Sum up all students in all projects across all groups
  const studentsCount = groups.reduce((total, group) => {
    const groupProjects = group.projects || [];
    const groupStudents = groupProjects.reduce((pTotal, p) => pTotal + (p.students ? p.students.split('\n').filter(s => s.trim()).length : 0), 0);
    return total + groupStudents;
  }, 0);

  useEffect(() => {
    // Weather
    fetchWeather()
      .then(w => setWeather(w))
      .catch(() => {})
      .finally(() => setWeatherLoading(false));

    // AI News (Will be translated in api.js)
    fetchAINews()
      .then(result => {
        if (result && result.text) setAiNews(result.text);
        else if (result && result.error) setAiNews('⚠️ ' + result.error);
        else setAiNews('Новости недоступны');
      })
      .catch(() => setAiNews('Не удалось загрузить новости.'))
      .finally(() => setNewsLoading(false));

    // GitHub repo count
    fetchGitHubRepos()
      .then(repos => setRepoCount(Array.isArray(repos) ? repos.length : 0))
      .catch(() => {});
  }, []);

  // Next lesson countdown
  const [countdown, setCountdown] = useState('—');
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const nowMin = h * 60 + m;
      
      // Lessons: 9:45-11:05, 11:25-12:45, 14:35-16:00, 16:40-18:00
      const lessons = [
        { start: 9*60+45, end: 11*60+5 },
        { start: 11*60+25, end: 12*60+45 },
        { start: 14*60+35, end: 16*60 },
        { start: 16*60+40, end: 18*60 }
      ];
      
      const currentLesson = lessons.find(l => nowMin >= l.start && nowMin <= l.end);
      if (currentLesson) {
        const diff = currentLesson.end - nowMin;
        setCountdown(`Идёт урок (ост. ${diff}м)`);
      } else {
        const next = lessons.find(l => l.start > nowMin);
        if (next) {
          const diff = next.start - nowMin;
          const hrs = Math.floor(diff / 60);
          const mins = diff % 60;
          setCountdown(hrs > 0 ? `До урока ${hrs}ч ${mins}м` : `До урока ${mins}м`);
        } else {
          setCountdown('Уроки окончены');
        }
      }
    }
    updateCountdown();
    const timer = setInterval(updateCountdown, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { icon: GraduationCap, label: 'Активные курсы', value: activeCoursesCount, color: 'var(--primary)' },
          { icon: Users, label: 'Детей записано', value: studentsCount, color: 'var(--secondary)' },
          { icon: FolderGit2, label: 'Проектов в GitHub', value: repoCount, color: 'var(--accent-green)' },
          { icon: Clock, label: 'До урока', value: countdown, color: 'var(--accent-orange)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Icon size={32} color={stat.color} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weather + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Weather */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={18} /> Погода — Владивосток
          </h3>
          {weatherLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Loader2 size={28} color="var(--primary)" className="pulsing" />
            </div>
          ) : weather ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2.2rem' }}>{weather.icon}</span>
                <span style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  {weather.temp}°C
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px' }}>{weather.description}</div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={14} /> {weather.humidity}%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wind size={14} /> {weather.wind} км/ч</span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)' }}>Данные о погоде недоступны</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            ⚡ Быстрые действия
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => launchApp('cursor')} style={{ width: '100%', justifyContent: 'center' }}>
              <Terminal size={18} /> Открыть Cursor IDE
            </button>
            <button className="btn btn-purple" onClick={() => launchApp('chrome')} style={{ width: '100%', justifyContent: 'center' }}>
              🌐 Открыть Chrome
            </button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Brain size={18} /> Спросить Мозг
            </button>
          </div>
        </div>
      </div>

      {/* AI News */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--secondary)" /> 🗞️ AI-новости дня
        </h3>
        {newsLoading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Loader2 size={24} color="var(--secondary)" className="pulsing" />
            <div style={{ color: 'var(--text-dim)', marginTop: '8px', fontSize: '0.85rem' }}>
              Gemini подбирает новости...
            </div>
          </div>
        ) : (
          <div style={{ lineHeight: '1.7', fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
            {aiNews}
          </div>
        )}
      </div>
    </div>
  );
}
