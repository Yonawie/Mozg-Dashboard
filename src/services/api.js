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

// ==================== GEMINI ====================
export async function askGemini(prompt, systemInstruction = '') {
  const apiKey = await getSetting('geminiApiKey', '');
  if (!apiKey) return { error: 'API ключ Gemini не настроен' };
  
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      }
    );
    const data = await res.json();
    if (data.error) {
      if (data.error.code === 429) {
        return { error: 'Превышен лимит запросов к Gemini (Ошибка 429: Quota Exceeded). Проверьте ваш биллинг.' };
      }
      return { error: data.error.message };
    }
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Нет ответа',
      error: null
    };
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchAINews() {
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/category/artificial-intelligence/feed/');
    const data = await res.json();
    const items = data.items.slice(0, 3);
    const engText = items.map(i => `Title: ${i.title}`).join('\n');
    
    const prompt = `Translate these 3 tech news headlines into Russian and format them nicely with a globe emoji at the start of each line. Keep it short:\n\n${engText}`;
    
    const geminiRes = await askGemini(prompt);
    
    if (geminiRes && !geminiRes.error) {
      return { text: geminiRes.text };
    } else {
      // Fallback
      const text = items.map(i => `🌐 ${i.title}`).join('\n\n');
      return { text };
    }
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
