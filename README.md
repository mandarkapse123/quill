# 🪶 Quill — Writer's Studio

A full-featured writing platform for novelists. Write your book, build your characters, plot your story arc, capture ideas, and track your progress — all in one place.

---

## ✨ Features

- **📝 Write** — Distraction-free editor with chapter management, @character tagging, writing sprint timer
- **👥 Characters** — Full character profiles, bios, arcs, editable fields
- **🗺️ Story Map** — Visual arc diagram and chapter timeline
- **💡 Brainstorm** — Capture punchlines, plot ideas, research, world notes
- **📊 Analytics** — Word counts, daily writing streaks, character screen time
- **📖 Preview** — See your manuscript as a finished book
- **🌙/☀️ Dark & Light Mode** — Toggle with one click
- **🔤 Font Picker** — 6 literary fonts to match your writing mood
- **💾 Auto-save** — Every keystroke saved to your browser
- **📦 Backup/Restore** — Export your full project as a JSON backup file

---

## 🚀 How to Deploy (Free)

### Option 1 — Vercel (Recommended, Easiest)

1. Create a free account at https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. In your project folder, run:
   ```bash
   npm install
   vercel
   ```
4. Follow the prompts. Your app will be live at `https://your-app.vercel.app` in under 60 seconds.

To update after code changes:
```bash
vercel --prod
```

---

### Option 2 — Netlify (Also Free)

1. Create a free account at https://netlify.com
2. Build the app:
   ```bash
   npm install
   npm run build
   ```
3. Drag and drop the `/dist` folder onto https://app.netlify.com/drop
4. Done! Your app is live instantly.

Or use the Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

### Option 3 — GitHub Pages (Free Forever)

1. Push your project to a GitHub repository
2. Install the deploy tool:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add to `package.json` scripts:
   ```json
   "homepage": "https://yourusername.github.io/quill",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Also add `base: '/quill/'` to `vite.config.js`
5. Run:
   ```bash
   npm run deploy
   ```

---

### Running Locally (Development)

```bash
npm install
npm run dev
```
Then open http://localhost:5173

---

## 💾 Data Persistence — How It Works & How Not to Lose Your Work

### What's Built In: LocalStorage Auto-Save

Every time you write, your data is automatically saved to your **browser's localStorage**. This means:

- ✅ Works instantly, no account needed
- ✅ Survives page refreshes and browser restarts
- ⚠️ **Tied to a specific browser on a specific device**
- ⚠️ Clearing browser data / cache **will delete your work**
- ⚠️ Not accessible from another device or browser

### 🔐 Best Practices to Never Lose Your Work

#### 1. Use the Built-in Backup Feature (Most Important!)
Go to **Settings → Download Backup (.json)** regularly.
This exports your entire project (all chapters, characters, ideas) as a `.json` file you can save anywhere.

To restore: Settings → Restore from Backup → select your `.json` file.

**Recommended: backup after every writing session.**

#### 2. Export Your Manuscript as Text
In the **Preview** tab → Export .txt
This gives you a plain text copy of all your chapters.

---

## 🌐 Upgrading to Cloud Storage (So Users Never Lose Data)

For a hosted version where **users log in and sync across devices**, integrate one of these:

### Option A — Firebase Firestore (Free Tier: Generous)
```
https://firebase.google.com
```
- Free for up to 1GB storage and 50k reads/day
- Add Google/email login in minutes
- Replace `localStorage` calls with Firestore reads/writes

### Option B — Supabase (Free Tier: 500MB)
```
https://supabase.com
```
- Open-source Firebase alternative
- PostgreSQL database + auth
- Free tier more than sufficient for small user base

### Option C — PocketBase (Self-hosted, Free Forever)
```
https://pocketbase.io
```
- Single binary, runs on any server
- Host on Railway.app (free tier available)
- Full auth + database

### Option D — Simple: GitHub Gist API
Save JSON to a private GitHub Gist using the user's GitHub token.
No backend needed, free forever.

---

## 📁 Project Structure

```
quill-app/
├── index.html          # Entry HTML
├── package.json        # Dependencies
├── vite.config.js      # Build config
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Full application
```

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Recharts** — Data visualization
- **Lucide React** — Icons
- **Vite** — Build tool
- **Google Fonts** — Playfair Display, Crimson Text, EB Garamond, Lora, Cormorant, Special Elite, Libre Baskerville

---

## 📬 Questions?

Built with ❤️ using Claude (claude.ai). To extend this app with cloud sync, user accounts, or collaboration features, share your next requirements!
