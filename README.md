# AuraBrain AI 🧠⚡
> The Autonomous Epistemic Engine & Context-Aware Actionable Second Brain.

[![Deploy status](https://img.shields.io/badge/Deploy-Vercel-success?logo=vercel&logoColor=white)](https://vercel.com)
[![AI Framework](https://img.shields.io/badge/Orchestrator-Gemini%20API-blue?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Tech Stack](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-cyan?logo=react&logoColor=white)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20pgvector-green?logo=postgresql&logoColor=white)](https://supabase.com)

Most note-taking applications act as digital graveyards—places where ideas, bookmarks, and logs go to be stored, forgotten, and never acted upon. **AuraBrain AI** changes the note-taking paradigm from passive retrieval to agentic execution. It functions as an autonomous, background layer on top of your files, link captures, and notes, predicting the context you need, extracting actionable tasks, and generating draft assets.

---

## 🚀 Key Features

*   **Epistemic Knowledge Graph:** Renders a gorgeous, custom force-directed HTML5 canvas physics graph of notes, links, and documents connected via semantic weights. Includes live particle pulses along active paths.
*   **Automatic Node Wiring:** As you type, the engine extracts entities and concepts in real-time, automatically wiring notes to related items in the database without manual tagging.
*   **AI Auto-Task Extraction:** Scans notes and outputs structured, priority-ranked checkboxes in the co-pilot sidebar, converting chaotic thoughts into SMART actions.
*   **Serendipity Engine (Forgotten Gems):** Employs decay rate calculations to resurface critical ideas from weeks or months ago that relate semantically to your current cursor position.
*   **Concept Synthesizer:** Compiles ideas from multiple nodes to output product requirement docs (PRDs), summary digests, or email templates with a streaming AI typewriter effect.
*   **Cognitive Growth Index (Analytics):** Visualizes your interests via cluster weight metrics and displays interest drifts over time.

---

## 🛠️ Modern Tech Stack

*   **Frontend:** React 19 (Vite powered), Lucide React (Icons), Vanilla CSS (Glassmorphism design system)
*   **Graph Engine:** Pure HTML5 Canvas Physics Engine (Optimized for 60fps rendering)
*   **AI Layer:** Google Gemini 1.5 Flash (API Key configured in settings)
*   **Database:** Supabase PostgreSQL + `pgvector` extension

---

## 📂 Project Structure

```text
aurabrain/
├── src/
│   ├── components/
│   │   ├── GraphView.jsx      # Physics graph component
│   │   ├── KnowledgeBase.jsx  # Notes, categories, ingestion panel
│   │   ├── NoteEditor.jsx     # Concept editor & tag manager
│   │   └── ContextPanel.jsx   # AI Auto-tasks, synthesis workbench
│   ├── context/
│   │   └── BrainContext.jsx   # Relational state, auto-wiring logic
│   ├── assets/                # Glow assets & SVG definitions
│   ├── App.jsx                # Main assembly (Tab Router)
│   ├── index.css              # Glassmorphic tokens & style layouts
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚙️ Quick Start

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configure Gemini Key
Create a `.env` file in the root directory (optional, settings page handles it directly):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Dev Server
Launch Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏆 Hackathon Winning Presentation Strategy

### The 2-Minute Pitch
1.  **The Hook (0-30s):** "We hoard links and notes we never read. AuraBrain turns information storage into agentic execution."
2.  **The Magic (30s-1m15s):** Paste raw feedback. Watch the canvas graph auto-wire and pulse. Showcase the auto-tasks and the Concept Synthesizer streaming a project spec.
3.  **The Close (1m15s-2m00s):** Show Cognitive Analytics. Demonstrate that AuraBrain isn't just a chatbot; it's a cognitive operating system.

---

## 📜 License
MIT License. Created for the Hackathon Demo.
