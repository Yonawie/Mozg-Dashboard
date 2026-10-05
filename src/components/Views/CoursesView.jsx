import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Copy, Star, BookOpen, Users, CalendarCheck, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { db } from '../../db';

export default function CoursesView() {
  const [showForm, setShowForm] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const courses = useLiveQuery(() => db.courses?.toArray()) || [];
  
  const [formData, setFormData] = useState({ title: '', startDate: '', endDate: '', description: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    if(db.courses) {
      await db.courses.add({ ...formData, status: 'planning', createdAt: new Date() });
    }
    setShowForm(false);
    setFormData({ title: '', startDate: '', endDate: '', description: '' });
  };

  const handleClone = async (course, e) => {
    e.stopPropagation();
    if(db.courses) {
      const { id, ...rest } = course;
      await db.courses.add({ ...rest, title: `${rest.title} (Копия)`, status: 'planning' });
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Удалить смену?')) {
      await db.courses.delete(id);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span className="tag tag-green">Активно</span>;
      case 'completed': return <span className="tag tag-purple">Завершено</span>;
      default: return <span className="tag tag-orange">Планируется</span>;
    }
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--primary)' }}>ИИ Лаборатория: Смены</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Новая смена
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Создать смену</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <input 
              type="text" className="input-field" placeholder="Название (например: 9 смена)" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <input 
              type="text" className="input-field" placeholder="Описание"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <input 
              type="date" className="input-field" required
              value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
            />
            <input 
              type="date" className="input-field" required
              value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
            />
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Отмена</button>
              <button type="submit" className="btn btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 && !showForm ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
          Список смен пуст. Нажмите «Новая смена», чтобы добавить.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {courses.map(course => (
            <div key={course.id} className="glass-panel" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '20px', margin: 0 }}>{course.title}</h3>
                  {getStatusBadge(course.status)}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={(e) => handleClone(course, e)} style={{ padding: '6px' }} title="Клонировать">
                    <Copy size={16} />
                  </button>
                  <button className="btn" onClick={(e) => handleDelete(course.id, e)} style={{ padding: '6px', color: 'var(--accent-red)' }} title="Удалить">
                    <Trash2 size={16} />
                  </button>
                  {expandedCourse === course.id ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                <span>📅 {course.startDate} - {course.endDate}</span>
                <span>📍 ВДЦ Океан</span>
                <span>ℹ️ {course.description || 'Нет описания'}</span>
              </div>

              {expandedCourse === course.id && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} onClick={e => e.stopPropagation()}>
                  
                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                    <BookOpen size={32} style={{ opacity: 0.5, marginBottom: '10px' }} />
                    <p>Функции дневника и посещаемости будут активированы после добавления групп.</p>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
