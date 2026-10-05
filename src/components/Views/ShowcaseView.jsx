import React, { useState } from 'react';
import { Trophy, Award, Image, BarChart3, Plus, Star, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';

const BADGES = [
  { name: 'Лучший проект', icon: '🥇', color: '#ffd700', desc: 'За самый качественный проект смены' },
  { name: 'Самый креативный', icon: '🧠', color: '#7c3aed', desc: 'За оригинальную идею и подход' },
  { name: 'Лучший дизайн', icon: '🎨', color: '#ff6b9d', desc: 'За красивый и продуманный UI' },
  { name: 'Быстрый старт', icon: '⚡', color: '#00f0ff', desc: 'Быстрее всех начал кодить' },
  { name: 'Помощник', icon: '🤝', color: '#00ff88', desc: 'Помогал другим ученикам' },
  { name: 'Продвинутый промпт', icon: '💬', color: '#ff9900', desc: 'Писал самые подробные промпты' },
];

export default function ShowcaseView() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', studentName: '', courseId: '', type: 'Игра', description: '', rating: 5 });

  const showcase = useLiveQuery(() => db.showcase?.toArray()) || [];
  
  const handleSave = async (e) => {
    e.preventDefault();
    if (db.showcase) {
      await db.showcase.add({
        title: formData.title,
        studentName: formData.studentName,
        courseId: formData.courseId,
        type: formData.type,
        description: formData.description,
        rating: formData.rating,
        badges: []
      });
      setShowForm(false);
      setFormData({ title: '', studentName: '', courseId: '', type: 'Игра', description: '', rating: 5 });
    }
  };

  const handleDelete = async (id) => {
    if (db.showcase) {
      await db.showcase.delete(id);
    }
  };

  const starRating = (rating) => {
    return Array(5).fill(null).map((_, i) => (
      <Star key={i} size={14} fill={i < rating ? '#ffd700' : 'transparent'} color={i < rating ? '#ffd700' : 'var(--text-dim)'} />
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Проектов', value: showcase.length, icon: '🏆', color: '#ffd700' },
          { label: 'Учеников отмечено', value: new Set(showcase.map(s => s.studentName)).size, icon: '👦', color: '#00f0ff' },
          { label: 'Доступно бейджей', value: BADGES.length, icon: '🎖️', color: '#7c3aed' },
          { label: 'Средний рейтинг', value: (showcase.reduce((a,b)=>a+b.rating,0)/(showcase.length||1)).toFixed(1), icon: '⭐', color: '#00ff88' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'gallery', label: 'Галерея проектов', icon: Image },
            { id: 'badges', label: 'Бейджи и награды', icon: Award },
            { id: 'infographic', label: 'Инфографика', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
        {activeTab === 'gallery' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Добавить проект
          </button>
        )}
      </div>

      {showForm && activeTab === 'gallery' && (
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px' }}>Новый проект</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input required className="input-field" placeholder="Название проекта" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <input required className="input-field" placeholder="Имя ученика" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
            <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option>Игра</option>
              <option>Сайт</option>
              <option>Бот</option>
              <option>Другое</option>
            </select>
            <input type="number" min="1" max="5" className="input-field" placeholder="Оценка (1-5)" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} />
            <textarea className="input-field" placeholder="Описание" style={{ gridColumn: 'span 2' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
              <button type="submit" className="btn btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          {showcase.length === 0 && !showForm ? (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
              Добавьте первый проект учеников для витрины!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
              {showcase.map(project => (
                <div key={project.id} className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
                  <button 
                    className="btn" 
                    style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px', color: 'var(--accent-red)' }} 
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', paddingRight: '24px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{project.title}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>{starRating(project.rating || 5)}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px' }}>👤 {project.studentName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{project.description}</div>
                  <div style={{ marginTop: '12px' }}><span className="tag tag-cyan">{project.type}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {BADGES.map((badge, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderColor: `${badge.color}44` }}>
              <div style={{
                width: '64px', height: '64px', margin: '0 auto 14px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${badge.color}15`, border: `2px solid ${badge.color}55`, fontSize: '28px'
              }}>
                {badge.icon}
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: badge.color }}>{badge.name}</h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-dim)' }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'infographic' && (
        <div className="glass-panel-glow" style={{ padding: '32px', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: 'var(--text-main)' }}>📊 Статистика проектов</h2>
          <p style={{ color: 'var(--text-muted)' }}>В разработке (требует реальных данных по сменам)</p>
        </div>
      )}
    </div>
  );
}
