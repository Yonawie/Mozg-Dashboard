import { db } from '../db';

let pollingInterval = null;
let lastUpdateId = 0;
let currentToken = null;

export async function startTelegramBot(token) {
  if (!token) return;
  currentToken = token;
  
  if (pollingInterval) clearInterval(pollingInterval);
  
  console.log('🤖 Starting Telegram Bot polling...');
  
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${currentToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
      const data = await res.json();
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          if (update.message && update.message.text) {
            handleMessage(update.message);
          }
        }
      }
    } catch (err) {
      console.error('Telegram bot polling error:', err);
    }
  }, 3000);
}

export function stopTelegramBot() {
  if (pollingInterval) clearInterval(pollingInterval);
  currentToken = null;
}

async function sendMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${currentToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (err) {
    console.error('Failed to send message', err);
  }
}

async function handleMessage(msg) {
  const text = msg.text.trim();
  const chatId = msg.chat.id;

  if (text === '/start' || text === '/help') {
    return sendMessage(chatId, `Привет! Я твой Мозг-ассистент.\n\nКоманды:\n/расписание - план на день\n/погода - погода Владивосток\n/заметка [текст] - сохранить заметку\n/запусти [имя] - открыть на ПК (например: cursor, chrome)\n/дети - кол-во курсов`);
  }

  if (text === '/погода') {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.1198&longitude=131.8869&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto');
      const data = await res.json();
      const t = data.current.temperature_2m;
      return sendMessage(chatId, `🌤 Владивосток: ${t}°C\nВетер: ${data.current.wind_speed_10m} м/с\nВлажность: ${data.current.relative_humidity_2m}%`);
    } catch {
      return sendMessage(chatId, 'Не удалось получить погоду 😔');
    }
  }

  if (text.startsWith('/заметка ')) {
    const content = text.replace('/заметка ', '').trim();
    if (!content) return sendMessage(chatId, 'Напишите текст заметки после команды /заметка');
    
    await db.notes.add({
      title: 'Из Telegram',
      content,
      type: 'Заметка',
      tags: ['telegram'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return sendMessage(chatId, '✅ Заметка успешно сохранена в Мозг!');
  }

  if (text.startsWith('/запусти ')) {
    const appName = text.replace('/запусти ', '').trim().toLowerCase();
    try {
      const res = await fetch('http://localhost:3777/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appName })
      });
      const data = await res.json();
      if (data.success) {
        return sendMessage(chatId, `🚀 Запускаю ${appName} на вашем компьютере!`);
      } else {
        return sendMessage(chatId, `❌ Ошибка: приложение не найдено в списке. Доступно: cursor, antigravity, chrome, telegram`);
      }
    } catch {
      return sendMessage(chatId, '❌ Сервер ПК управления выключен. Запустите npm run server.');
    }
  }

  if (text === '/курсы' || text === '/дети') {
    const courses = await db.courses.toArray();
    if (courses.length === 0) return sendMessage(chatId, '🎓 У вас пока нет созданных смен/курсов в базе.');
    const info = courses.map(c => `— ${c.title}`).join('\n');
    return sendMessage(chatId, `🎓 Ваши смены:\n${info}`);
  }

  if (text === '/расписание') {
    return sendMessage(chatId, '📅 Сегодня у вас:\n\n- Утром: проверка домашних проектов.\n- 14:00: Группа по нейросетям.\n(Для полной интеграции нужно привязать Google Sheets API).');
  }

  sendMessage(chatId, 'Я пока не знаю такую команду. Наберите /help');
}
