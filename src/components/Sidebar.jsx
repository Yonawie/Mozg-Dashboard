import { 
  LayoutDashboard, 
  GraduationCap, 
  FolderGit2, 
  Brain, 
  Calendar, 
  Monitor, 
  Bot, 
  BookOpen, 
  Trophy, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Обзор', key: 'dashboard' },
  { icon: GraduationCap, label: 'Курсы', key: 'courses' },
  { icon: FolderGit2, label: 'GitHub', key: 'github' },
  { icon: Brain, label: 'Мозг', key: 'brain' },
  { icon: Calendar, label: 'Расписание', key: 'schedule' },
  { icon: Monitor, label: 'ПК', key: 'pc' },
  { icon: Bot, label: 'Telegram', key: 'telegram' },
  { icon: BookOpen, label: 'Методичка', key: 'methods' },
  { icon: Trophy, label: 'Витрина', key: 'showcase' },
];

export default function Sidebar({ activeView, onNavigate, collapsed, onToggle }) {
  const width = collapsed ? '72px' : '260px';

  return (
    <aside className="glass-panel" style={{
      width,
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      borderRight: '1px solid var(--border-color)',
      padding: '20px 0',
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '0 20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          opacity: collapsed ? 0 : 1,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          width: collapsed ? '0' : 'auto'
        }}>
          {!collapsed && <Brain color="var(--primary)" size={28} />}
          <div style={{ display: collapsed ? 'none' : 'block' }}>
            <h1 style={{ margin: 0, fontSize: '20px', color: '#fff', letterSpacing: '1px' }}>MOZG</h1>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ИИ Лаборатория</span>
          </div>
        </div>
        
        {collapsed && (
          <div style={{ position: 'absolute', top: '20px' }}>
            <Brain color="var(--primary)" size={28} />
          </div>
        )}

        <button 
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            position: collapsed ? 'absolute' : 'relative',
            top: collapsed ? '65px' : 'auto'
          }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px', marginTop: collapsed ? '40px' : '0' }}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px',
                width: '100%',
                background: isActive ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'inset 2px 0 0 var(--primary)' : 'none',
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
              title={collapsed ? item.label : ''}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
              {!collapsed && <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '0 12px', marginTop: 'auto' }}>
        <button
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px',
            width: '100%',
            background: activeView === 'settings' ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: activeView === 'settings' ? 'var(--primary)' : 'var(--text-main)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeView === 'settings' ? 'inset 2px 0 0 var(--primary)' : 'none',
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}
          title={collapsed ? 'Настройки' : ''}
          onMouseEnter={(e) => {
            if (activeView !== 'settings') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'settings') e.currentTarget.style.background = 'transparent';
          }}
        >
          <Settings size={20} color={activeView === 'settings' ? 'var(--primary)' : 'currentColor'} />
          {!collapsed && <span style={{ fontSize: '14px' }}>Настройки</span>}
        </button>
      </div>
    </aside>
  );
}
