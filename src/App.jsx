import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/Views/DashboardView';
import CoursesView from './components/Views/CoursesView';
import GitHubView from './components/Views/GitHubView';
import BrainView from './components/Views/BrainView';
import ScheduleView from './components/Views/ScheduleView';
import PcControlView from './components/Views/PcControlView';
import TelegramView from './components/Views/TelegramView';
import MethodsView from './components/Views/MethodsView';
import ShowcaseView from './components/Views/ShowcaseView';
import SettingsView from './components/Views/SettingsView';
import { seedInitialData } from './db';
import { useEffect } from 'react';
import './App.css';

const VIEWS = {
  dashboard: DashboardView,
  courses: CoursesView,
  github: GitHubView,
  brain: BrainView,
  schedule: ScheduleView,
  pc: PcControlView,
  telegram: TelegramView,
  methods: MethodsView,
  showcase: ShowcaseView,
  settings: SettingsView,
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    if (typeof seedInitialData === 'function') {
      seedInitialData();
    }
  }, []);

  const ActiveComponent = VIEWS[activeView] || DashboardView;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-dark)'
    }}>
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? '72px' : '260px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header activeView={activeView} />
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto'
        }}>
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
