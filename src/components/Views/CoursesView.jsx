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
      await db.courses.add({ ...rest, title: `${rest.title} (РљРѕРїРёСЏ)`, status: 'planning' });
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('РЈРґР°Р»РёС‚СЊ СЃРјРµРЅСѓ?')) {
      await db.courses.delete(id);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span className="tag tag-green">РђРєС‚РёРІРЅРѕ</span>;
      case 'completed': return <span className="tag tag-purple">Р—Р°РІРµСЂС€РµРЅРѕ</span>;
      default: return <span className="tag tag-orange">РџР»Р°РЅРёСЂСѓРµС‚СЃСЏ</span>;
    }
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--primary)' }}>РР Р›Р°Р±РѕСЂР°С‚РѕСЂРёСЏ: РЎРјРµРЅС‹</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> РќРѕРІР°СЏ СЃРјРµРЅР°
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>РЎРѕР·РґР°С‚СЊ СЃРјРµРЅСѓ</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <input 
              type="text" className="input-field" placeholder="РќР°Р·РІР°РЅРёРµ (РЅР°РїСЂРёРјРµСЂ: 9 СЃРјРµРЅР°)" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
            <input 
              type="text" className="input-field" placeholder="РћРїРёСЃР°РЅРёРµ"
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
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>РћС‚РјРµРЅР°</button>
              <button type="submit" className="btn btn-primary">РЎРѕС…СЂР°РЅРёС‚СЊ</button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 && !showForm ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-dim)' }}>
          РЎРїРёСЃРѕРє СЃРјРµРЅ РїСѓСЃС‚. РќР°Р¶РјРёС‚Рµ В«РќРѕРІР°СЏ СЃРјРµРЅР°В», С‡С‚РѕР±С‹ РґРѕР±Р°РІРёС‚СЊ.
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
                  <button className="btn" onClick={(e) => handleClone(course, e)} style={{ padding: '6px' }} title="РљР»РѕРЅРёСЂРѕРІР°С‚СЊ">
                    <Copy size={16} />
                  </button>
                  <button className="btn" onClick={(e) => handleDelete(course.id, e)} style={{ padding: '6px', color: 'var(--accent-red)' }} title="РЈРґР°Р»РёС‚СЊ">
                    <Trash2 size={16} />
                  </button>
                  {expandedCourse === course.id ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '24px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                <span>рџ“… {course.startDate} - {course.endDate}</span>
                <span>рџ“Ќ Р’Р”Р¦ РћРєРµР°РЅ</span>
                <span>в„№пёЏ {course.description || 'РќРµС‚ РѕРїРёСЃР°РЅРёСЏ'}</span>
              </div>

              {expandedCourse === course.id && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} onClick={e => e.stopPropagation()}>
                  
                  <CourseDetails courseId={course.id} />

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseDetails({ courseId }) {
  const [groupName, setGroupName] = useState('');
  const [diaryText, setDiaryText] = useState('');
  const groups = useLiveQuery(() => db.groups.where({ courseId }).toArray(), [courseId]) || [];
  const diaries = useLiveQuery(() => db.diaryEntries.where({ courseId }).reverse().toArray(), [courseId]) || [];

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      await db.groups.add({ courseId, name: groupName, studentCount: 0, status: 'active' });
      setGroupName('');
    }
  };

  const handleAddDiary = async (e) => {
    e.preventDefault();
    if (diaryText.trim()) {
      await db.diaryEntries.add({ courseId, date: new Date().toISOString(), content: diaryText, tags: [] });
      setDiaryText('');
    }
  };

  const handleDeleteGroup = async (id) => {
    await db.groups.delete(id);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Groups / Projects Section */}
      <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', marginTop: 0 }}>
          <Users size={18} /> Группы и Проекты
        </h4>
        
        <form onSubmit={handleAddGroup} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input 
            type="text" className="input-field" placeholder="Название группы (напр. Группа 3)" 
            value={groupName} onChange={e => setGroupName(e.target.value)} required style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary"><Plus size={16} /></button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {groups.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Групп пока нет.</div>
          ) : (
            groups.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div>
                  <strong style={{ color: 'var(--text-main)', display: 'block' }}>{g.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Проекты/Посещаемость: 0/0</span>
                </div>
                <button className="btn" onClick={() => handleDeleteGroup(g.id)} style={{ color: 'var(--accent-red)', padding: '4px' }}><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Diary / Notes Section */}
      <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '16px', marginTop: 0 }}>
          <BookOpen size={18} /> Дневник смены
        </h4>
        
        <form onSubmit={handleAddDiary} style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexDirection: 'column' }}>
          <textarea 
            className="input-field" placeholder="Что сегодня прошли? Как успехи?" 
            value={diaryText} onChange={e => setDiaryText(e.target.value)} required rows={2}
          />
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Сохранить запись</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
          {diaries.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Дневник пуст.</div>
          ) : (
            diaries.map(d => (
              <div key={d.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  {new Date(d.date).toLocaleString('ru-RU')}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{d.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
