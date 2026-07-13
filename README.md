# LifePlanner OS 🧠

![LifePlanner OS Logo](public/logo.png)

**LifePlanner OS** is a premium, locally-hosted Personal Operating System designed to completely eliminate decision fatigue. It is not just a to-do list—it's an automated, offline-first productivity engine that calculates what you need to do, when you need to do it, and forces you to focus.

## 🚀 Core Philosophy
Every morning, you spend 5 minutes inputting your available hours, energy levels, and fixed appointments. 
The OS calculates a perfect, rule-based timeline for your day. After that, your only job is to execute the active task. **You never have to ask "What should I do next?"**

## ✨ Features
*   **Zero Decision Fatigue**: The OS tells you exactly what to do based on your input capacity.
*   **100% Offline & Private**: No cloud, no AI APIs, no tracking. Everything lives securely inside your browser's IndexedDB.
*   **Rule Engine Integration**: Automatically forces daily fitness, rotation of study subjects, and ensures no goal is ignored for more than 2 days.
*   **Live Time Calculator**: Continuously adjusts your estimated finish time and "Free Time Left" based on your current pace.
*   **Focus Mode**: A distraction-free timer for executing your active task.
*   **Installable PWA**: Works offline on iOS, Android, and Desktop as a standalone application.

---

## 💻 Installation & Local Usage

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repo-url>
   cd LIFE_BEING_EASY
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📱 How to Install on Mobile & Desktop (PWA)

LifePlanner OS is a Progressive Web App (PWA). You can install it directly to your home screen or dock without an App Store.

*   **iOS (iPhone/iPad)**: Open the app in Safari. Tap the `Share` icon at the bottom, scroll down, and select `Add to Home Screen`.
*   **Android**: Open the app in Chrome. Tap the 3-dot menu and select `Install App` or `Add to Home screen`.
*   **Desktop (Mac/Windows)**: Open the app in Chrome or Edge. Click the `Install` icon that appears on the right side of the URL address bar.

---

## 📖 Step-by-Step Usage Guide

### Phase 1: The Initial Boot (First Time Only)
When you launch LifePlanner OS for the first time, you will go through the OS Setup.
1. Set your **Wake-up and Sleep times**. This defines your absolute boundaries.
2. Define your **Learning Goals** (e.g., JavaScript, C++, DSA, etc.).
3. Define your **Fitness Goal** and **Study Session/Break Lengths**.

### Phase 2: The Morning Boot Sequence (Daily)
Every day, open the **Plan** tab:
1. Input your **Available Hours** for focused work today.
2. Select your **Energy Level** (High, Medium, Low). The engine adjusts session lengths based on this.
3. Add any **Fixed Events** (meetings, classes) and **Urgent Tasks** (bills, groceries).
4. Click **Generate Today's Plan**. The OS will weave your rules, goals, and events into a perfect timeline.

### Phase 3: The Execution (Throughout the day)
1. Go to the **Active** tab.
2. The screen locks onto your *Current Task*. 
3. Click the massive **Play** button to begin focus mode.
4. When finished, click **Complete**. The OS automatically saves your progress to Analytics and queues up the exact next task you need to do.

### Phase 4: The Review (End of Day)
1. Head to the **Dashboard** to watch your *Free Time* increase as you complete tasks.
2. Check the **Analytics** tab to view your weekly progress heatmaps and study hours.
3. Relax knowing the OS handled the planning.

---
*Built by a Senior Architect. Powered by React, Vite, Dexie, and TailwindCSS.*
