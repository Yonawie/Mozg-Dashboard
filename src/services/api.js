// API service for Mozg Dashboard

const AGENT_URL = 'http://localhost:3777';
const KHOJ_URL = 'http://localhost:42110';

// Settings helper - reads from IndexedDB via Dexie
import { db } from '../db.js';

export async function getSetting(key, fallback = '') {
  try {
    const setting = await db.settings.get(key);
    return setting?.value || fallback;
  } catch {
    return fallback;
  }
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

// ==================== WEATHER ====================
export async function fetchWeather() {
  try {
    // Open-Meteo API for Vladivostok (no API key required, highly reliable)
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.1198&longitude=131.8869&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto');
    const data = await res.json();
    const current = data.current;
    
    let desc = 'Ясно';
    let icon = '☀️';
    if (current.weather_code >= 1 && current.weather_code <= 3) { desc = 'Облачно'; icon = '⛅'; }
    if (current.weather_code >= 45 && current.weather_code <= 48) { desc = 'Туман'; icon = '🌫️'; }
    if (current.weather_code >= 51 && current.weather_code <= 67) { desc = 'Дождь'; icon = '🌧️'; }
    if (current.weather_code >= 71 && current.weather_code <= 77) { desc = 'Снег'; icon = '🌨️'; }
    if (current.weather_code >= 95) { desc = 'Гроза'; icon = '⛈️'; }

    return {
      temp: Math.round(current.temperature_2m),
      description: desc,
      humidity: current.relative_humidity_2m,
      wind: Math.round(current.wind_speed_10m),
      icon: icon,
      city: 'Владивосток'
    };
  } catch (err) {
    console.error('Weather fetch failed:', err);
    return null;
  }
}

// ==================== GITHUB ====================
export async function fetchGitHubRepos() {
  const username = await getSetting('githubUsername', 'Yonawie');
  const token = await getSetting('githubToken', '');
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers.Authorization = `token ${token}`;
  
  try {
    const url = token
      ? 'https://api.github.com/user/repos?per_page=100&sort=updated&type=all'
      : `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
    const res = await fetch(url, { headers });
    const repos = await res.json();
    return Array.isArray(repos) ? repos : [];
  } catch (err) {
    console.error('GitHub fetch failed:', err);
    return [];
  }
}

// ==================== LOCAL AI (LM Studio / Ollama) ====================
export async function askGemini(prompt, systemInstruction = '') {
  try {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-model', // LM studio uses whatever is loaded
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    if (!res.ok) {
      return { error: `Сервер LM Studio вернул ошибку: ${res.status}. Убедитесь, что Local Server запущен.` };
    }
    
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || 'Нет ответа',
      error: null
    };
  } catch (err) {
    return { error: 'Не удалось подключиться к LM Studio. Проверьте, что Local Server запущен на порту 1234.' };
  }
}

export async function fetchAINews() {
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://habr.com/ru/rss/hubs/artificial_intelligence/all/?fl=ru');
    const data = await res.json();
    const items = data.items.slice(0, 3);
    const text = items.map(i => `🌐 ${i.title}`).join('\n\n');
    return { text };
  } catch (err) {
    return { error: 'Не удалось загрузить новости' };
  }
}

// ==================== KHOJ ====================
export async function searchKhoj(query) {
  const khojUrl = await getSetting('khojUrl', KHOJ_URL);
  try {
    const res = await fetch(`${khojUrl}/api/search?q=${encodeURIComponent(query)}&n=5`);
    return await res.json();
  } catch (err) {
    return { error: 'Khoj недоступен: ' + err.message };
  }
}

export async function chatKhoj(message) {
  const khojUrl = await getSetting('khojUrl', KHOJ_URL);
  try {
    const res = await fetch(`${khojUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: message })
    });
    return await res.json();
  } catch (err) {
    return { error: 'Khoj недоступен: ' + err.message };
  }
}

// ==================== PC CONTROL ====================
export async function launchApp(appName) {
  try {
    const res = await fetch(`${AGENT_URL}/api/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: appName })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function runCommand(command) {
  try {
    const res = await fetch(`${AGENT_URL}/api/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getSystemInfo() {
  try {
    const res = await fetch(`${AGENT_URL}/api/system`);
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}
