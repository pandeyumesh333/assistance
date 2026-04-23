# 🚀 Life Assistant - Project Workflow & Roadmap

This document outlines our professional development process and the status of Version 1 (Production) and Version 2 (Future).

---

## 🌳 Branch Management Strategy

We use a two-branch system to keep our live app small and stable while building powerful features in the background.

### 1. `life-assistance` (Version 1 - Production)
*   **Goal**: 20-30MB lightweight APK for users.
*   **Server**: Linked to Render Production (`https://assistance-q9p8.onrender.com`).
*   **Database**: Linked to MongoDB Atlas `life-assistant` database.
*   **Status**: Clean UI, Foreground SMS Sync only, No Dev-Tools.

### 2. `version-2` (Version 2 - Development)
*   **Goal**: Feature-rich, automated personal assistant.
*   **Tools**: Includes `expo-dev-client` for native module testing.
*   **Status**: Advanced Charts, AI Daily Brief, Background SMS Sync.

---

## ✅ Completed So Far

### Version 1 (Optimized)
- [x] **APK Size Reduction**: Enabled ProGuard and Resource Shrinking (Target: 20-30MB).
- [x] **Production Backend**: Deployed to Render with persistent MongoDB Atlas.
- [x] **Environment Security**: Moved all keys to `.env` files.
- [x] **Instant Build Script**: Created `scripts/fast-build.js` to build small APKs without manual deletion.

### Version 2 (In Progress)
- [x] **Finance Analytics**: Integrated Pie Charts and Line Graphs for spending trends.
- [x] **AI Daily Brief**: Smart dashboard greeting with today's summary.
- [x] **Background Automation**: Background SMS sync every 15 minutes.
- [x] **Hybrid Local Dev**: Configured app to talk to local machine IP for coding.

---

## 🚀 Version 2 Roadmap (What's Next)

### 💡 Phase 1: Smart Insights
- [ ] **AI Spending Tips**: Intelligent alerts when a category (e.g., Food) goes over budget.
- [ ] **Monthly Comparison**: Visualize how this month compares to last month.

### 🔔 Phase 2: Actionable Dashboard
- [ ] **Meeting Countdown**: Real-time timer for your next meeting.
- [ ] **Quick Action Tasks**: Swipe to complete or postpone tasks from the home screen.

### 🧘 Phase 3: Wellness Integration
- [ ] **Water Tracker**: Interactive widget to track hydration.
- [ ] **Daily Reflection**: A small evening prompt to summarize your day's achievements.

---

## 🛠️ Commands for You

| Action | Command |
| :--- | :--- |
| **Start Local Dev (V2)** | `npx expo start --go --clear` |
| **Build Live APK (V1)** | `npm run build:v1` |
| **Switch to Live Branch** | `git checkout life-assistance` |
| **Switch to V2 Branch** | `git checkout version-2` |

---

*Last Updated: April 23, 2026*
