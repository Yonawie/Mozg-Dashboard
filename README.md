# 🧠 Mozg: OS for AI Educators

**Mozg** (Russian for "Brain") is a fully customized, local-first dashboard and personal operating system designed specifically for AI educators. It integrates scheduling, student management, AI-powered knowledge retrieval, and direct PC control into a single seamless interface.

![Mozg Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E) ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)

## 🌟 Key Features

1. **Centralized Dashboard**
   - Real-time weather parsing (Open-Meteo API).
   - Global AI news feed (RSS2JSON integration).
   - Dynamic lesson countdowns and GitHub statistics tracking.

2. **Course & Student Management**
   - Manage educational tracks, track attendance, and log daily diaries.
   - Built-in "Showcase" gallery to grade and store student projects.

3. **"Second Brain" (Local & Cloud AI)**
   - **Khoj Integration (Docker + PostgreSQL):** Semantic, vector-based search across all local files on the PC.
   - **Gemini AI Assistant:** Chatbot built into the notes system for quick lesson planning and explanations.

4. **PC Control & Automation**
   - Direct integration with Node.js Express backend to launch local IDEs (Cursor) and terminal processes directly from the web interface.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Lucide Icons, Glassmorphism UI
- **Database:** IndexedDB (via Dexie.js) for ultra-fast local storage. PostgreSQL (pgvector) for AI embeddings.
- **Backend/System:** Node.js (Express) for local OS commands.
- **AI / Infrastructure:** Docker, Khoj AI, Gemini 2.0 API.

## 🚀 Getting Started

To run this project locally:

```bash
# 1. Clone the repository
git clone https://github.com/YourUsername/Mozg.git

# 2. Install dependencies
npm install

# 3. Start the Vite Frontend and Express PC-Control Backend
npm run dev
npm run server

# 4. (Optional) Start Khoj Local Vector Search Database
cd khoj-server
docker-compose up -d
```

## 📝 Concept

This project was built to solve the real-world organizational challenges of teaching AI and programming to children. Instead of juggling Notion, GitHub, ChatGPT, and local folders, **Mozg** unites them all into one beautifully designed, dark-themed control center.
