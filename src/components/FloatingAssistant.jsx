import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { askGemini } from '../../services/api';
import { db } from '../../db';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Привет! Я твой персональный ИИ-ассистент. Я могу помочь добавить смену, посмотреть расписание или ответить на вопросы.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isExpanded]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Very basic "Tool Use" logic baked into prompt
      const systemPrompt = `You are Jarvis, a helpful AI assistant built into a dashboard for Dasha, an AI teacher. 
      You can execute actions on the dashboard by outputting JSON. 
      If she asks to "add a course" or "добавь смену", reply EXACTLY with a JSON block like:
      \`\`\`json
      {
        "action": "CREATE_COURSE",
        "title": "Название смены",
        "startDate": "2026-10-01",
        "endDate": "2026-10-21"
      }
      \`\`\`
      Otherwise, just answer normally in Russian. Do not invent Google Sheets parsing yet, just create dummy dates if she asks.`;

      const response = await askGemini(userText, systemPrompt);
      
      let replyText = response.text || 'Ошибка API';

      // Check for JSON action
      const jsonMatch = replyText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const actionData = JSON.parse(jsonMatch[1]);
          if (actionData.action === 'CREATE_COURSE') {
            await db.courses.add({
              title: actionData.title || 'Новая смена',
              startDate: actionData.startDate || new Date().toISOString().split('T')[0],
              endDate: actionData.endDate || new Date().toISOString().split('T')[0],
              description: 'Создано ИИ ассистентом',
              status: 'planning',
              createdAt: new Date()
            });
            replyText = `✅ Я автоматически добавил новую смену "${actionData.title}" в базу данных! Можете проверить на вкладке "Курсы".`;
          }
        } catch (e) {
          console.error('Failed to parse AI action', e);
        }
      }

      setMessages(prev => [...prev, { role: 'ai', text: replyText.replace(/```json[\s\S]*?```/, '').trim() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Произошла ошибка при обращении к мозгу.' }]);
    }
    
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'var(--primary)', color: 'black', border: 'none',
          boxShadow: '0 4px 20px rgba(0,240,255,0.4)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 2s infinite'
        }}
      >
        <Bot size={32} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', 
      bottom: isExpanded ? '0' : '24px', 
      right: isExpanded ? '0' : '24px',
      width: isExpanded ? '400px' : '350px', 
      height: isExpanded ? '100vh' : '500px',
      background: 'rgba(10, 15, 30, 0.95)',
      backdropFilter: 'blur(16px)',
      border: isExpanded ? 'none' : '1px solid var(--border-color)',
      borderRadius: isExpanded ? '0' : '16px',
      zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,240,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold' }}>
          <Bot size={20} /> Jarvis AI
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => setIsExpanded(!isExpanded)} style={{ padding: '4px' }}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button className="btn" onClick={() => setIsOpen(false)} style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '10px 14px',
            borderRadius: '12px',
            background: msg.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: msg.role === 'user' ? '#000' : 'var(--text-main)',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--primary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Jarvis думает...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Скажите, что сделать..."
          style={{ 
            flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)',
            color: 'white', padding: '10px 14px', borderRadius: '8px', outline: 'none'
          }}
        />
        <button type="submit" disabled={isLoading} style={{
          background: 'var(--primary)', color: 'black', border: 'none',
          padding: '0 16px', borderRadius: '8px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
