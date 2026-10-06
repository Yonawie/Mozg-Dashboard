import Dexie from 'dexie';

export const db = new Dexie('MozgDatabase');

db.version(4).stores({
  courses: '++id, title, status, startDate, endDate',
  diaryEntries: '++id, courseId, date, dayNumber',
  attendance: '++id, courseId, groupName, date',
  groups: '++id, courseId, name',
  notes: '++id, title, type, tags, courseId, createdAt, updatedAt',
  methods: '++id, title, type, ageGroup, tags',
  showcase: '++id, title, studentName, courseId, type, rating',
  settings: 'key',
  telegramLogs: '++id, timestamp, role'
});

// Seed only essential settings, NO stub data
export async function seedInitialData() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.bulkPut([
      { key: 'geminiApiKey', value: '' },
      { key: 'githubUsername', value: 'Yonawie' },
      { key: 'githubToken', value: '' },
      { key: 'city', value: 'Владивосток, Емар' },
      { key: 'weatherCity', value: 'Vladivostok' },
      { key: 'userName', value: 'Даша' },
      { key: 'khojUrl', value: 'http://localhost:42110' },
      { key: 'mozgDataPath', value: 'C:\\Users\\Dasha\\MOZG' },
      { key: 'telegramBotToken', value: '' },
      { key: 'googleSheetsUrl', value: 'https://docs.google.com/spreadsheets/d/19WvSwCWgagUdhk6IQd-_q8_qU3F0P_8UyBClwhqJ07U/edit?usp=sharing' }
    ]);
  }
}
