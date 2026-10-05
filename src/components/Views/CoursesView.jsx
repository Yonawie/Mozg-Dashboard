import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Copy, BookOpen, Users, ChevronDown, ChevronUp, Trash2, Edit2, Check, X, FileText } from 'lucide-react';
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
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  
  const groups = useLiveQuery(() => db.groups.where({ courseId }).toArray(), [courseId]) || [];
  const diaries = useLiveQuery(() => db.diaryEntries.where({ courseId }).reverse().toArray(), [courseId]) || [];

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      await db.groups.add({ 
        courseId, 
        name: groupName, 
        students: '', 
        projectName: '', 
        notes: '',
        status: 'active' 
      });
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

  const handleDeleteGroup = async (e, id) => {
    e.stopPropagation();
    if(window.confirm('Удалить эту группу?')) {
      await db.groups.delete(id);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
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
              <GroupEditor 
                key={g.id} 
                group={g} 
                isExpanded={expandedGroupId === g.id}
                onToggle={() => setExpandedGroupId(expandedGroupId === g.id ? null : g.id)}
                onDelete={(e) => handleDeleteGroup(e, g.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Diary / Notes Section */}
      <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
          {diaries.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Дневник пуст.</div>
          ) : (
            diaries.map(d => (
              <div key={d.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                  {new Date(d.date).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{d.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function GroupEditor({ group, isExpanded, onToggle, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    projectName: group.projectName || '',
    students: group.students || '',
    notes: group.notes || ''
  });

  const handleSave = async (e) => {
    e.stopPropagation();
    await db.groups.update(group.id, formData);
    setIsEditing(false);
  };

  const studentList = group.students ? group.students.split('\n').filter(s => s.trim()) : [];

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Header */}
      <div 
        onClick={onToggle}
        style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer' }}
      >
        <div>
          <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '1.05rem' }}>{group.name}</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {group.projectName ? `Проект: ${group.projectName}` : 'Проект не выбран'} • Учеников: {studentList.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn" onClick={onDelete} style={{ color: 'var(--accent-red)', padding: '4px' }} title="Удалить группу">
            <Trash2 size={16} />
          </button>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
          {!isEditing ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn btn-secondary" 
                style={{ position: 'absolute', top: 0, right: 0, padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
              >
                <Edit2 size={14} /> Изменить
              </button>
              
              <div style={{ marginBottom: '16px', paddingRight: '100px' }}>
                <h5 style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Тема / Название проекта:</h5>
                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  {group.projectName || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Не указано</span>}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Список учеников:</h5>
                {studentList.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    {studentList.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.9rem' }}>Список пуст</span>
                )}
              </div>

              <div>
                <h5 style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Заметки по группе:</h5>
                <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px' }}>
                  {group.notes || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Заметок нет</span>}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Название проекта</label>
                <input 
                  type="text" className="input-field" placeholder="Пример: Чат-бот на Python"
                  value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ученики (каждый с новой строки)</label>
                <textarea 
                  className="input-field" placeholder="Иванов Иван&#10;Петров Петр" rows={4}
                  value={formData.students} onChange={e => setFormData({...formData, students: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Дополнительные заметки</label>
                <textarea 
                  className="input-field" placeholder="Особенности группы, идеи и т.д." rows={3}
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => {
                  setFormData({ projectName: group.projectName || '', students: group.students || '', notes: group.notes || '' });
                  setIsEditing(false);
                }}>Отмена</button>
                <button className="btn btn-primary" onClick={handleSave}>Сохранить</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
