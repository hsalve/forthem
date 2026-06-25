# ForThem 👨‍👩‍👧‍👦

> A co-parenting mobile app — custody schedules, swap requests, expenses, and shared documents.

Built with **Expo React Native + TypeScript + Supabase**.

---

## Phase 1 Status

| Feature | Status |
|---|---|
| Navigation (Stack + Bottom Tabs) | ✅ Done |
| Supabase client setup | ✅ Done |
| Login screen (placeholder) | ✅ Done |
| Home, Calendar, Swaps, Expenses, Documents | ✅ Done |
| Google Auth | 🔜 Phase 2 |
| Real data from Supabase | 🔜 Phase 3 |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your phone (iOS or Android)
- A [Supabase](https://supabase.com) project

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ForThem.git
cd ForThem
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these at: **Supabase Dashboard → Your Project → Settings → API**

### 4. Run the app

```bash
npx expo start
```

Then scan the QR code with **Expo Go** on your phone.

---

## Project Structure

```
ForThem/
├── App.tsx                        # Entry point
├── app.json                       # Expo config
├── .env.example                   # Environment variable template
│
└── src/
    ├── lib/
    │   └── supabase.ts            # Supabase client (singleton)
    ├── navigation/
    │   └── RootNavigator.tsx      # All navigation logic
    └── screens/
        ├── LoginScreen.tsx
        ├── HomeScreen.tsx
        ├── CalendarScreen.tsx
        ├── SwapsScreen.tsx
        ├── ExpensesScreen.tsx
        └── DocumentsScreen.tsx
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Expo](https://expo.dev) | React Native framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Supabase](https://supabase.com) | Backend (Auth + DB + Storage) |
| [React Navigation](https://reactnavigation.org) | Screen navigation |

---

## Roadmap

- **Phase 2** — Google Authentication via Supabase OAuth
- **Phase 3** — Custody calendar with real schedule data
- **Phase 4** — Swap request flow (propose / approve / reject)
- **Phase 5** — Shared expenses tracking & splitting
- **Phase 6** — Document upload & storage via Supabase Storage
