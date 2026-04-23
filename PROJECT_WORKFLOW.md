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
*   **Status**: Advanced Charts, AI Daily Brief, Background SMS Sync, **Hevy-Style Workout Module**.

---

## ✅ Completed So Far

### Version 1 (Optimized)
- [x] **APK Size Reduction**: Enabled ProGuard and Resource Shrinking (Target: 20-30MB).
- [x] **Production Backend**: Deployed to Render with persistent MongoDB Atlas.
- [x] **Environment Security**: Moved all keys to `.env` files.
- [x] **Instant Build Script**: Created `scripts/fast-build.js` to build small APKs without manual deletion.

### Version 2 (Advanced Features)
- [x] **Hevy-Style Workout Module**:
    - [x] **Live Session Tracking**: Built-in workout timer and 90s rest timer.
    - [x] **Smart Coach**: Real-time rep-range warnings (2-4 rep range logic) and rest discipline alerts.
    - [x] **Safety System**: 5-second **Undo banner** for deleted sets.
    - [x] **Analytics**: Live Volume tracking (per exercise & session) and 1RM (Brzycki) estimation.
    - [x] **Exercise Library**: Seeded with Home/Gym/Yoga categories and **animated demo GIFs**.
    - [x] **UX Polishing**: Fixed "flicking" input lag using local state optimization.
- [x] **AI Daily Brief**: Smart dashboard greeting with personalized "Good Evening, [Name]" messaging.
- [x] **Finance Analytics**: Integrated Pie Charts and Line Graphs for spending trends.
- [x] **Background Automation**: Background SMS sync every 15 minutes.
- [x] **Health Profile**: Integrated BMI and TDEE calculations into the user profile.
- [x] **Black Theme Integration**: Fully migrated all modules (Auth, Tasks, Meetings, Finance, Health) to a consistent dark-mode aesthetic.
- [x] **Global Data Sync**: Implemented `useFocusEffect` on all primary screens to ensure real-time data refreshing and consistency.

---

## 🚀 Version 2 Roadmap (What's Next)

### 💡 Phase 1: Advanced Health Analytics
- [ ] **Muscle Distribution Heatmap**: Visualize which muscles you've trained this week.
- [ ] **Progression Graphs**: Visual charts for 1RM growth over months.
- [ ] **Meal Photo Logging**: Quick upload for nutrition tracking.

### 🔔 Phase 2: Actionable Dashboard
- [ ] **Meeting Countdown**: Real-time timer for your next meeting on the home screen.
- [ ] **Quick Action Tasks**: Swipe to complete or postpone tasks from the home screen.

### 🧘 Phase 3: Wellness Integration
- [ ] **Water Tracker**: Interactive widget to track hydration with reminders.
- [ ] **Daily Reflection**: A small evening prompt to summarize your day's achievements.

---

## 🛠️ Commands for You

| Action | Command |
| :--- | :--- |
| **Start Local Dev (V2)** | `npx expo start --go --clear` |
| **Start Backend** | `npm run dev` (in /backend) |
| **Seed Library** | `npx ts-node scripts/seedExercises.ts` |
| **Build Live APK (V1)** | `npm run build:v1` |
| **Push Progress** | `git add . && git commit -m "update progress" && git push` |

---

*Last Updated: April 24, 2026 (Theme & Sync Refinement Milestone)*
