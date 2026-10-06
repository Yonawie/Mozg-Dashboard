import { db } from '../db';

let pollingInterval = null;
let lastUpdateId = 0;
let currentToken = null;

export async function startTelegramBot(token) {
  if (!token) return;
  currentToken = token;
  
  if (pollingInterval) clearInterval(pollingInterval);
  
  db.telegramLogs.add({ timestamp: Date.now(), role: 'system', text: 'Бот запущен' });
  console.log('🤖 Starting Telegram Bot polling...');
  
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${currentToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
      const data = await res.json();
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message && update.message.text) {
            handleIncomingMessage(update.message);
          }
        }
      }
    } catch (e) {
      // ignore timeout errors
    }
  }, 3000);
}

export function stopTelegramBot() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = null;
  currentToken = null;
  db.telegramLogs.add({ timestamp: Date.now(), role: 'system', text: 'Бот остановлен' });
  console.log('🛑 Telegram Bot stopped.');
}

async function handleIncomingMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  
  db.telegramLogs.add({ timestamp: Date.now(), role: 'user', text });

  if (text.startsWith('/расписание')) {
    await sendMessage(chatId, '📅 Сегодня:\n\n09:45 — ИИ Лаборатория\n11:25 — ИИ Лаборатория\n14:35 — ИИ Лаборатория');
  } else if (text.startsWith('/заметка')) {
    const note = text.replace('/заметка', '').trim();
    if (!note) {
      await sendMessage(chatId, 'Пустая заметка. Напишите: /заметка текст');
      return;
    }
    await db.notes.add({
      title: 'Быстрая заметка (TG)',
      content: note,
      type: 'text',
      tags: ['telegram'],
      createdAt: new Date().toISOString()
    });
    await sendMessage(chatId, '✅ Заметка сохранена в базу!');
  } else if (text.startsWith('/курсы')) {
    const active = await db.courses.where({ status: 'active' }).toArray();
    if (active.length === 0) {
      await sendMessage(chatId, 'Нет активных курсов.');
    } else {
      const titles = active.map(c => `🎓 ${c.title}`).join('\n');
      await sendMessage(chatId, `Активные курсы:\n\n${titles}`);
    }
  } else if (text.startsWith('/start')) {
    await sendMessage(chatId, 'Привет! Я бот системы Mozg. Нажми /расписание или /курсы.');
  } else {
    await sendMessage(chatId, 'Я пока не знаю такую команду. 🤖');
  }
}

async function sendMessage(chatId, text) {
  db.telegramLogs.add({ timestamp: Date.now(), role: 'bot', text });
  if (!currentToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
  } catch (e) {
    console.error('Failed to send TG message:', e);
  }
}
