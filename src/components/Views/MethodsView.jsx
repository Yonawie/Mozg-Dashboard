import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { BookOpen, Lightbulb, Package, Bug, Search, Plus, Trash2, Copy, Save } from 'lucide-react';

const TABS = [
  { id: 'prompts', label: 'Промпты', icon: Lightbulb },
  { id: 'plans', label: 'Планы уроков', icon: BookOpen },
  { id: 'starters', label: 'Шаблоны', icon: Package },
  { id: 'errors', label: 'База ошибок', icon: Bug },
];

export default function MethodsView() {
  const [activeTab, setActiveTab] = useState('prompts');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [formData, setFormData] = useState({ title: '', content: '', category: '', type: 'prompts', tags: '' });

  // db.methods: ++id, title, type, content, category, tags
  const methods = useLiveQuery(() => db.methods?.toArray()) || [];

  const handleSave = async (e) => {
    e.preventDefault();
    if (db.methods) {
      await db.methods.add({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        type: formData.type,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowForm(false);
      setFormData({ title: '', content: '', category: '', type: activeTab, tags: '' });
    }
  };

  const handleDelete = async (id) => {
    if (db.methods) {
      await db.methods.delete(id);
    }
  };

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filtered = methods.filter(m => {
    if (m.type !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFormData(prev => ({ ...prev, type: tab.id }));
                  setShowForm(false);
                }}
                style={{ fontSize: '0.85rem' }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            className="input-field"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
            style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-main)' }}>Добавить запись ({TABS.find(t => t.id === activeTab)?.label})</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              required className="input-field" placeholder="Заголовок..." 
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
            <input 
              className="input-field" placeholder="Категория (например: Игры, Ошибки CSS)..." 
              value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} 
            />
            <textarea 
              required className="input-field" placeholder="Содержание (промпт, план, решение)..." rows="4" 
              value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} 
            />
            <input 
              className="input-field" placeholder="Теги (через запятую)..." 
              value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} 
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
              <button type="submit" className="btn btn-primary"><Save size={16} /> Сохранить</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 && !showForm ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
          <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <div>В этой категории пока ничего нет. Нажмите «Добавить», чтобы создать.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{item.title}</h4>
                <button className="btn" style={{ padding: '4px', color: 'var(--accent-red)' }} onClick={() => handleDelete(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              {item.category && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '8px' }}>Категория: {item.category}</div>}
              <pre style={{
                flex: 1, margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-muted)',
                lineHeight: '1.5', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
                background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-sm)'
              }}>
                {item.content}
              </pre>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {item.tags?.map(t => <span key={t} className="tag tag-cyan" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                </div>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => copyText(item.content, item.id)}>
                  {copiedIndex === item.id ? '✅ Скопировано' : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
