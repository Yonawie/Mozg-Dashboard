import React, { useState, useEffect } from 'react';
import { FolderGit2, Search, Star, GitFork, Lock, Globe, Code } from 'lucide-react';
import { fetchGitHubRepos, launchApp, getSetting } from '../../services/api';

const LANG_COLORS = {
  JavaScript: '#f1e05a', Python: '#3572A5', TypeScript: '#3178c6', 
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 
  'C++': '#f34b7d', C: '#555555', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00'
};

export default function GitHubView() {
  const [activeTab, setActiveTab] = useState('my');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = await getSetting('githubToken');
        setHasToken(!!token);
        const data = await fetchGitHubRepos();
        if (data && Array.isArray(data)) {
          setRepos(data);
        }
      } catch (err) {
        console.error('Error fetching repos:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredRepos = repos.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'updated') return new Date(b.updated_at) - new Date(a.updated_at);
      if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('my')}
        >
          Мои проекты
        </button>
        <button 
          className={`btn ${activeTab === 'kids' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('kids')}
        >
          Детские проекты 🎒
        </button>
      </div>

      {!hasToken && (
        <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderColor: 'var(--accent-orange)' }}>
          <span style={{ color: 'var(--accent-orange)' }}>⚠️ Токен GitHub не настроен. Отображаются только публичные репозитории. Добавьте PAT в Настройках для доступа к приватным.</span>
        </div>
      )}

      {activeTab === 'my' ? (
        <>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Поиск репозиториев..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
              />
            </div>
            <select 
              className="input-field" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px' }}
            >
              <option value="updated">Недавно обновленные</option>
              <option value="stars">Звезды</option>
              <option value="name">Название</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Загрузка...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredRepos.map(repo => (
                <div key={repo.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderGit2 size={20} color="var(--primary)" />
                      {repo.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {repo.private ? (
                        <span className="tag tag-purple" title="Private"><Lock size={12}/></span>
                      ) : (
                        <span className="tag tag-green" title="Public"><Globe size={12}/></span>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {repo.description || 'Нет описания'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {repo.language && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: LANG_COLORS[repo.language] || '#ccc', display: 'inline-block' }}></span>
                        {repo.language}
                      </span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} /> {repo.stargazers_count}
                      </span>
                    )}
                    {repo.forks_count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitFork size={14} /> {repo.forks_count}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                    Обновлено: {new Date(repo.updated_at).toLocaleDateString()}
                  </div>

                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', padding: '8px' }}
                    onClick={() => launchApp('cursor', { args: repo.clone_url })}
                  >
                    <Code size={16} /> Открыть в Cursor
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)' }}>Детские проекты 🎒</h2>
          <p style={{ color: 'var(--text-muted)' }}>Здесь будут проекты учеников ИИ Лаборатории</p>
          <div style={{ maxWidth: '400px', margin: '30px auto' }}>
            <div className="input-field" style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <label style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Добавить URL репозитория вручную:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="https://github.com/..." style={{ flex: 1, padding: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }} />
                <button className="btn btn-primary">Добавить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
