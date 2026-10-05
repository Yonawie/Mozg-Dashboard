import { Search, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const VIEW_TITLES = {
  dashboard: 'Обзор дня',
  courses: 'Курсы ИИ Лаборатории',
  github: 'GitHub Проекты',
  brain: 'Мозг — База знаний',
  schedule: 'Расписание',
  pc: 'Управление ПК',
  telegram: 'Telegram-бот',
  methods: 'Методичка',
  showcase: 'Витрина & Достижения',
  settings: 'Настройки'
};

export default function Header({ activeView }) {
  const [greeting, setGreeting] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 5 && hour < 12) setGreeting('Доброе утро, Даша!');
      else if (hour >= 12 && hour < 18) setGreeting('Добрый день, Даша!');
      else if (hour >= 18 && hour < 23) setGreeting('Добрый вечер, Даша!');
      else setGreeting('Доброй ночи, Даша!');
      
      const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' };
      let formattedDate = now.toLocaleDateString('ru-RU', options);
      setDateStr(formattedDate);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-panel" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 32px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(12px)'
    }}>
      <div>
        <h2 style={{ 
          margin: 0, 
          fontSize: '24px', 
          color: 'var(--text-main)',
          fontWeight: 600,
          marginBottom: '4px'
        }}>
          {VIEW_TITLES[activeView] || 'MOZG'}
        </h2>
        <div style={{ 
          fontSize: '14px', 
          color: 'var(--text-muted)' 
        }}>
          <span style={{ color: 'var(--primary)' }}>{greeting}</span> • {dateStr}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <Search size={20} />
        </button>
        <button style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <Bell size={20} />
          <span className="pulsing" style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            width: '8px',
            height: '8px',
            background: 'var(--accent-red)',
            borderRadius: '50%',
            boxShadow: '0 0 5px var(--accent-red)'
          }}></span>
        </button>
      </div>
    </header>
  );
}
