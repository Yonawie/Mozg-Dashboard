import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { askGemini, searchKhoj } from '../../services/api';
import { Brain, Search, Plus, Save, Trash2, Send, CheckCircle2, XCircle, Loader2, HardDrive } from 'lucide-react';

export default function BrainView() {
  const [filterTag, setFilterTag] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteType, setNoteType] = useState('Заметка');

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [khojStatus, setKhojStatus] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  
  const [khojResults, setKhojResults] = useState([]);
  const [isKhojSearching, setIsKhojSearching] = useState(false);

  useEffect(() => {
    fetch('http://localhost:42110/api/health')
      .then(res => setKhojStatus(res.ok))
      .catch(() => setKhojStatus(false));
  }, []);

  const notes = useLiveQuery(() => db.notes.toArray(), []) || [];

  const TYPE_MAP = { 'Заметки': 'Заметка', 'Шаблоны': 'template', 'Статьи': 'Статья', 'Конспекты': 'Конспект' };

  const filteredNotes = notes.filter(n => {
    if (filterTag === 'ПК (Khoj)') return false; // Handled separately
    if (filterTag !== 'Все') {
      const mapped = TYPE_MAP[filterTag] || filterTag;
      if (n.type !== mapped && n.type !== filterTag) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (n.title?.toLowerCase().includes(q)) || (n.content?.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(q)));
    }
    return true;
  });

  async function handleSearchKhoj() {
    if (!searchQuery.trim()) return;
    setFilterTag('ПК (Khoj)');
    setIsKhojSearching(true);
    const results = await searchKhoj(searchQuery);
    // Khoj usually returns an array of objects or an object with results
    if (results && !results.error) {
      // Assuming array of chunks
      const items = Array.isArray(results) ? results : (results.results || results.entries || []);
      setKhojResults(items.map((item, i) => ({
        id: `khoj-${i}`,
        title: item.file || item.title || 'Найденный фрагмент',
        content: item.compiled || item.content || item.text || JSON.stringify(item),
        type: 'Файл',
        isReadOnly: true
      })));
    } else {
      setKhojResults([{ id: 'error', title: 'Ошибка', content: results?.error || 'Ничего не найдено', isReadOnly: true }]);
    }
    setIsKhojSearching(false);
  }

  function handleCreateNote() {
    setIsNew(true);
    setSelectedNote({});
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setNoteType('Заметка');
  }

  function handleSelectNote(n) {
    setIsNew(false);
    setSelectedNote(n);
    setNoteTitle(n.title || '');
    setNoteContent(n.content || '');
    setNoteTags(Array.isArray(n.tags) ? n.tags.join(', ') : '');
    setNoteType(n.type || 'Заметка');
  }

  async function handleSaveNote() {
    if (selectedNote?.isReadOnly) return;
    const noteData = {
      title: noteTitle,
      content: noteContent,
      tags: noteTags.split(',').map(t => t.trim()).filter(Boolean),
      type: noteType,
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      await db.notes.add({ ...noteData, createdAt: new Date().toISOString() });
    } else if (selectedNote?.id) {
      await db.notes.update(selectedNote.id, noteData);
    }
    setSaveMsg('✅ Сохранено');
    setTimeout(() => setSaveMsg(''), 2000);
    setSelectedNote(null);
    setIsNew(false);
  }

  async function handleDeleteNote() {
    if (selectedNote?.isReadOnly) return;
    if (selectedNote?.id) {
      await db.notes.delete(selectedNote.id);
      setSelectedNote(null);
      setIsNew(false);
    }
  }

  async function handleSendChat() {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);

    try {
      const result = await askGemini(msg, 'Ты — AI-ассистент педагога ВДЦ Океан, которая ведёт курс «ИИ Лаборатория» для детей. Отвечай на русском, кратко и по делу.');
      const reply = result?.text || result?.error || 'Нет ответа';
      setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'ai', text: '❌ Ошибка при обращении к Gemini' }]);
    }
    setIsChatLoading(false);
  }

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)' }}>
      {/* Left: Notes List */}
      <div style={{ width: '38%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <Brain size={22} color="var(--primary)" /> Второй Мозг
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Khoj: {khojStatus
              ? <CheckCircle2 size={13} color="var(--accent-green)" />
              : <XCircle size={13} color="var(--accent-red)" />}
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              className="input-field"
              type="text"
              placeholder="Поиск по заметкам и ПК..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchKhoj()}
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleSearchKhoj} title="Искать по всем файлам на ПК через Khoj">
            <HardDrive size={16} color="var(--primary)" />
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['Все', 'Заметки', 'Шаблоны', 'Статьи', 'ПК (Khoj)'].map(t => (
            <span
              key={t}
              onClick={() => setFilterTag(t)}
              style={{
                cursor: 'pointer', padding: '5px 12px', borderRadius: '20px',
                background: filterTag === t ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                color: filterTag === t ? '#050814' : 'var(--text-muted)',
                fontSize: '0.82rem', fontWeight: filterTag === t ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >{t}</span>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary" onClick={handleCreateNote} style={{ flex: 1, justifyContent: 'center' }}>
            <Plus size={16} /> Новая заметка
          </button>
        </div>

        {/* Notes list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filterTag === 'ПК (Khoj)' ? (
            isKhojSearching ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--primary)' }} className="pulsing">
                Ищем по всему ПК...
              </div>
            ) : khojResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
                Введите запрос и нажмите Enter для поиска по ПК
              </div>
            ) : khojResults.map(n => (
              <div key={n.id} className={selectedNote?.id === n.id ? 'glass-panel-glow' : 'glass-panel'} style={{ padding: '14px', cursor: 'pointer' }} onClick={() => handleSelectNote(n)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>{n.title}</strong>
                  <span className="tag tag-purple" style={{ fontSize: '0.68rem' }}>Khoj</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content || '...'}</p>
              </div>
            ))
          ) : filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              {notes.length === 0 ? 'Заметок пока нет. Создайте первую!' : 'Ничего не найдено'}
            </div>
          ) : filteredNotes.map(n => (
            <div key={n.id} className={selectedNote?.id === n.id ? 'glass-panel-glow' : 'glass-panel'} style={{ padding: '14px', cursor: 'pointer' }} onClick={() => handleSelectNote(n)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{n.title || 'Без названия'}</strong>
                <span className="tag tag-cyan" style={{ fontSize: '0.68rem' }}>{n.type}</span>
              </div>
              {n.tags && n.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  {n.tags.slice(0, 3).map(t => <span key={t} className="tag tag-purple" style={{ fontSize: '0.65rem' }}>{t}</span>)}
                </div>
              )}
              <p style={{
                margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{n.content || '...'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Chat + Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* AI Chat */}
        <div className="glass-panel" style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🧠 ИИ Ассистент (Gemini)
          </h4>
          <div style={{
            flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px',
            marginBottom: '10px', paddingRight: '4px'
          }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Спросите что угодно: «Помоги написать план урока», «Объясни 12-летнему что такое нейросеть»...
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #2AABEE, #1a8ad4)' : 'rgba(255,255,255,0.06)',
                color: msg.text?.includes('Ошибка 429') ? 'var(--accent-red)' : 'var(--text-main)', 
                fontSize: '0.87rem', lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
            ))}
            {isChatLoading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.85rem' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Думаю...
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="input-field"
              placeholder="Спросить Gemini..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleSendChat} disabled={isChatLoading}>
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Note Editor */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
          {selectedNote ? (
            <>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  placeholder="Заголовок заметки..."
                  disabled={selectedNote.isReadOnly}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)',
                    fontSize: '1.15rem', padding: '6px 0', outline: 'none', fontWeight: 600,
                    opacity: selectedNote.isReadOnly ? 0.7 : 1
                  }}
                />
                {!selectedNote.isReadOnly && (
                  <select
                    value={noteType}
                    onChange={e => setNoteType(e.target.value)}
                    style={{
                      background: 'var(--bg-dark)', border: '1px solid var(--border-color)',
                      color: 'var(--text-main)', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <option>Заметка</option>
                    <option>Шаблон</option>
                    <option>Статья</option>
                    <option>Конспект</option>
                  </select>
                )}
              </div>

              {!selectedNote.isReadOnly && (
                <input
                  type="text"
                  value={noteTags}
                  onChange={e => setNoteTags(e.target.value)}
                  placeholder="Теги через запятую..."
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)',
                    fontSize: '0.85rem', padding: '4px 0', outline: 'none'
                  }}
                />
              )}

              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Текст заметки (Markdown)..."
                readOnly={selectedNote.isReadOnly}
                style={{
                  flex: 1, background: 'rgba(10,14,28,0.7)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', padding: '14px',
                  resize: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                  lineHeight: '1.6'
                }}
              />

              {!selectedNote.isReadOnly && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-green)' }}>{saveMsg}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isNew && (
                      <button className="btn btn-secondary" style={{ color: 'var(--accent-red)' }} onClick={handleDeleteNote}>
                        <Trash2 size={15} /> Удалить
                      </button>
                    )}
                    <button className="btn btn-primary" onClick={handleSaveNote}>
                      <Save size={15} /> Сохранить
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Выберите заметку слева или создайте новую
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
