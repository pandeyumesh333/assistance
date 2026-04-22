# Personal Life Assistant

A cross-platform personal life assistant mobile application built with React Native (Expo) and a Node.js/MongoDB backend. This application serves as a centralized hub for managing your daily life, offering features like task and meeting management, an automated personal finance tracker (via SMS parsing), and intelligent daily summary notifications.

## 🚀 Features

- **User Authentication:** Secure login and registration.
- **Task Management:** Create, update, delete, and organize daily tasks.
- **Meeting Management:** Keep track of your meetings and schedule.
- **Personal Finance Tracking:** 
  - Manage accounts and transactions.
  - Automated expense tracking through intelligent SMS parsing (Android).
- **Smart Notifications & Summaries:** Receive intelligent daily summary notifications, automated tasks, and reminders.
- **Cross-Platform:** Works seamlessly on both iOS and Android (via Expo).

## 🛠 Tech Stack

**Frontend:**
- React Native (Expo)
- TypeScript
- React Navigation
- State Management (Zustand)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- TypeScript
- JWT Authentication
- Node-Cron (Scheduled summaries and jobs)

## 📁 Project Structure

The repository is structured to contain both the frontend and backend applications in their respective directories.

```text
life-assistant/
├── backend/                # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/    # API route controllers
│   │   ├── models/         # MongoDB schemas (User, Task, Transaction, etc.)
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Core business logic (Summaries, Notifications)
│   │   ├── jobs/           # Scheduled tasks and cron jobs
│   │   └── server.ts       # Backend entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── src/                    # React Native Frontend
│   ├── components/         # Reusable UI components (Button, Card, Input)
│   ├── screens/            # Application screens (Auth, Dashboard, Finance, etc.)
│   ├── navigation/         # React Navigation setup
│   ├── stores/             # Global state management (Zustand stores)
│   ├── services/           # API integration clients
│   └── utils/              # Helper functions & SMS parsing logic
├── App.tsx                 # Frontend entry point
└── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB instance (Local or MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your physical device (or iOS Simulator / Android Emulator)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pandeyumesh333/assistance.git
   cd life-assistant
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Environment Variables

**Backend (`backend/.env`):**
Create a `.env` file in the `backend` directory based on `backend/.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Frontend:**
Ensure the API base URL in `src/services/api.ts` is pointing to your local backend server's IP address or `localhost` (e.g., `http://<YOUR_IP_ADDRESS>:5000/api`).

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Expo Development Server:**
   Open a new terminal window in the project root:
   ```bash
   npm start
   ```
   
   Scan the QR code shown in the terminal using the Expo Go app on your physical device, or press `i` for iOS Simulator / `a` for Android Emulator.

## ✍️ Author
**pandeyumesh333** (<pumesh8943@gmail.com>)
