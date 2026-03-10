import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import {
  BookOpen, Users, Map, Lightbulb, BarChart2, Eye, Feather,
  Plus, Search, Sun, Moon, Play, Pause, AlignLeft, Zap,
  Star, Globe, Swords, ChevronRight, TrendingUp, Coffee,
  Tag as TagIcon, Settings, Download, Type, Save, CheckCircle,
  AlertCircle, Sparkles
} from "lucide-react";

// ─── GOOGLE FONTS ────────────────────────────────────────────
const injectFonts = () => {
  if (document.getElementById("quill-fonts")) return;
  const link = document.createElement("link");
  link.id = "quill-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,600&family=Special+Elite&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap";
  document.head.appendChild(link);
};
injectFonts();

// ─── THEME DEFINITIONS ───────────────────────────────────────
const THEMES = {
  dark: {
    name: "dark",
    bg: "#0f0c08",
    surface: "#1a1510",
    card: "#221d16",
    border: "#3a2e22",
    gold: "#c9a84c",
    goldLight: "#e8c878",
    amber: "#d4833a",
    cream: "#f2e8d5",
    muted: "#8a7a65",
    text: "#e8dcc8",
    accent: "#7c4a2d",
    green: "#5a8a5f",
    red: "#8a3a3a",
    blue: "#3a5a8a",
    purple: "#6a3a8a",
    editorBg: "#0f0c08",
    editorText: "#e8dcc8",
    previewBg: "#1a1510",
    previewText: "#e8dcc8",
    previewAccent: "#c9a84c",
  },
  light: {
    name: "light",
    bg: "#f5f0e8",
    surface: "#ede6d8",
    card: "#e8e0cf",
    border: "#c8bca8",
    gold: "#8a6820",
    goldLight: "#b08030",
    amber: "#9a5a1a",
    cream: "#2a1e10",
    muted: "#7a6a55",
    text: "#3a2e1e",
    accent: "#7c4a2d",
    green: "#2a6a30",
    red: "#8a2a2a",
    blue: "#1a3a6a",
    purple: "#4a1a6a",
    editorBg: "#faf6ee",
    editorText: "#2a1e10",
    previewBg: "#faf6ee",
    previewText: "#2a1e10",
    previewAccent: "#8a6820",
  },
};

const FONT_OPTIONS = [
  { label: "Crimson Text", value: "'Crimson Text', Georgia, serif", preview: "The story begins..." },
  { label: "EB Garamond", value: "'EB Garamond', Georgia, serif", preview: "The story begins..." },
  { label: "Lora", value: "'Lora', Georgia, serif", preview: "The story begins..." },
  { label: "Cormorant", value: "'Cormorant Garamond', Georgia, serif", preview: "The story begins..." },
  { label: "Special Elite", value: "'Special Elite', Courier, monospace", preview: "The story begins..." },
  { label: "Libre Baskerville", value: "'Libre Baskerville', Georgia, serif", preview: "The story begins..." },
];

const MOTIVATIONAL_QUOTES = [
  { text: "The first draft is just you telling yourself the story.", author: "Terry Pratchett" },
  { text: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
  { text: "A writer only begins a book. A reader finishes it.", author: "Samuel Johnson" },
  { text: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
  { text: "Write drunk, edit sober.", author: "Ernest Hemingway" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "Either write something worth reading or do something worth writing.", author: "Benjamin Franklin" },
  { text: "The scariest moment is always just before you start.", author: "Stephen King" },
];

// ─── CONTEXT ─────────────────────────────────────────────────
const ThemeContext = createContext(null);
const useTheme = () => useContext(ThemeContext);

// ─── PERSISTENCE HELPERS ─────────────────────────────────────
const STORAGE_KEY = "quill_data_v1";

const defaultData = {
  projectTitle: "My Novel",
  projectGenre: "Literary Fiction",
  wordGoal: 80000,
  dailyGoal: 1000,
  chapters: [
    { id: 1, title: "The Beginning", words: 0, status: "outline", pov: "Narrator", arc: "Setup", content: "Start writing your first chapter here...\n\n" },
  ],
  characters: [
    { id: 1, name: "Your Hero", role: "Protagonist", age: 28, trait: "Brave, conflicted", color: "#c9a84c", appearances: 0, arc: "Redemption", emoji: "⭐", bio: "Write your character's biography here." },
  ],
  ideas: [
    { id: 1, type: "punchline", text: "Your first great line goes here.", chapter: null },
  ],
  settings: { font: FONT_OPTIONS[0].value, fontSize: 20, lineHeight: 1.9, theme: "dark" },
  dailyWords: { [new Date().toDateString()]: 0 },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch { return defaultData; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── SMALL SHARED COMPONENTS ─────────────────────────────────
function Badge({ label, color, small }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 4, padding: small ? "1px 6px" : "2px 10px",
      fontSize: small ? 10 : 11, fontFamily: "'Courier Prime', monospace",
      letterSpacing: 1, display: "inline-block", fontWeight: 600,
      textTransform: "uppercase", whiteSpace: "nowrap"
    }}>{label}</span>
  );
}

function SaveIndicator({ saved }) {
  const T = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Courier Prime', monospace", fontSize: 10, color: saved ? T.green : T.amber, transition: "color 0.3s" }}>
      {saved ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
      {saved ? "Saved" : "Saving..."}
    </div>
  );
}

const STATUS_COLORS = (T) => ({
  done: T.green, "in-progress": T.gold, draft: T.amber, outline: T.muted
});
const TYPE_COLORS = (T) => ({
  punchline: T.gold, plot: T.amber, research: T.blue, world: T.green, character: T.purple
});

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ data, setView }) {
  const T = useTheme();
  const { chapters, characters, projectTitle, projectGenre, wordGoal, dailyGoal, dailyWords } = data;
  const totalWords = chapters.reduce((s, c) => s + (c.words || 0), 0);
  const pct = Math.min(100, Math.round((totalWords / wordGoal) * 100));
  const today = new Date().toDateString();
  const todayWords = dailyWords?.[today] || 0;
  const dailyPct = Math.min(100, Math.round((todayWords / dailyGoal) * 100));
  const SC = STATUS_COLORS(T);
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Date.now() / 86400000) % MOTIVATIONAL_QUOTES.length];

  return (
    <div style={{ padding: "32px 40px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: T.muted, fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 6px" }}>Current Project</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: T.cream, margin: 0, lineHeight: 1.1 }}>{projectTitle}</h1>
        <p style={{ color: T.muted, fontFamily: "'Crimson Text', serif", fontSize: 16, marginTop: 6, fontStyle: "italic" }}>{projectGenre} · First Draft</p>
      </div>

      {/* Motivational quote */}
      <div style={{ background: `linear-gradient(135deg, ${T.gold}18, ${T.card})`, border: `1px solid ${T.gold}33`, borderRadius: 12, padding: "18px 24px", marginBottom: 24 }}>
        <Sparkles size={14} color={T.gold} style={{ marginBottom: 8 }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: T.text, fontSize: 16, margin: "0 0 6px", lineHeight: 1.5 }}>"{quote.text}"</p>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: T.muted, margin: 0 }}>— {quote.author}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Words", value: totalWords.toLocaleString(), sub: `of ${(wordGoal/1000).toFixed(0)}k goal`, icon: AlignLeft, color: T.gold },
          { label: "Chapters", value: `${chapters.filter(c=>c.status==="done").length}/${chapters.length}`, sub: "done", icon: BookOpen, color: T.amber },
          { label: "Characters", value: characters.length, sub: "in cast", icon: Users, color: T.purple },
          { label: "Today", value: `${todayWords}w`, sub: `of ${dailyGoal} goal`, icon: Zap, color: T.green },
        ].map((s, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <s.icon size={14} color={s.color} />
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2 }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: T.cream, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 13, color: T.muted, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px 26px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: "'Crimson Text', serif", color: T.text, fontSize: 15 }}>Manuscript Progress</span>
          <span style={{ fontFamily: "'Playfair Display', serif", color: T.gold, fontSize: 18 }}>{pct}%</span>
        </div>
        <div style={{ background: T.border, borderRadius: 999, height: 8, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${T.amber}, ${T.gold})`, borderRadius: 999, transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {chapters.map(ch => (
            <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: SC[ch.status] }} />
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted }}>{ch.title.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chapters list + actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px 24px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 18, margin: "0 0 14px" }}>Chapters</h3>
          {chapters.map(ch => (
            <div key={ch.id} onClick={() => setView("write")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: SC[ch.status], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Crimson Text', serif", color: T.text, fontSize: 15 }}>Ch.{ch.id} — {ch.title}</div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, marginTop: 2 }}>POV: {ch.pov} · {ch.arc}</div>
              </div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: T.muted }}>{ch.words > 0 ? ch.words.toLocaleString()+"w" : "—"}</div>
              <Badge label={ch.status} color={SC[ch.status]} small />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 16, margin: "0 0 12px" }}>Quick Actions</h3>
            {[
              { label: "Continue Writing", icon: Feather, view: "write", color: T.gold },
              { label: "Add Idea", icon: Lightbulb, view: "brainstorm", color: T.amber },
              { label: "New Character", icon: Users, view: "characters", color: T.purple },
              { label: "View Analytics", icon: TrendingUp, view: "analytics", color: T.green },
            ].map((a, i) => (
              <button key={i} onClick={() => setView(a.view)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px",
                background: "transparent", border: `1px solid ${T.border}`, borderRadius: 7, cursor: "pointer",
                marginBottom: 7, color: T.text, fontFamily: "'Crimson Text', serif", fontSize: 14, textAlign: "left", transition: "all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + "11"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
              ><a.icon size={14} color={a.color} /> {a.label}</button>
            ))}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${T.accent}33, ${T.card})`, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Coffee size={13} color={T.gold} />
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: 2 }}>Today's Goal</span>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 26 }}>{dailyGoal.toLocaleString()} words</div>
            <div style={{ background: T.border, borderRadius: 999, height: 5, margin: "10px 0 6px", overflow: "hidden" }}>
              <div style={{ width: `${dailyPct}%`, height: "100%", background: T.green, transition: "width 1s" }} />
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", color: T.muted, fontSize: 13 }}>{todayWords} / {dailyGoal} written today</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WRITE ───────────────────────────────────────────────────
function Write({ data, updateData }) {
  const T = useTheme();
  const [selectedChapId, setSelectedChapId] = useState(data.chapters[0]?.id);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const timerRef = useRef(null);
  const saveRef = useRef(null);

  const selectedChap = data.chapters.find(c => c.id === selectedChapId) || data.chapters[0];
  const SC = STATUS_COLORS(T);
  const font = data.settings?.font || FONT_OPTIONS[0].value;
  const fontSize = data.settings?.fontSize || 20;

  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;
    const oldWords = selectedChap.words || 0;
    const diff = wordCount - oldWords;

    setSaved(false);
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      const today = new Date().toDateString();
      const updatedChapters = data.chapters.map(c =>
        c.id === selectedChapId ? { ...c, content: newContent, words: wordCount } : c
      );
      const updatedDaily = { ...data.dailyWords, [today]: Math.max(0, (data.dailyWords?.[today] || 0) + diff) };
      updateData({ chapters: updatedChapters, dailyWords: updatedDaily });
      setSaved(true);
    }, 800);
  };

  const addChapter = () => {
    const newChap = {
      id: Date.now(), title: `Chapter ${data.chapters.length + 1}`,
      words: 0, status: "outline", pov: "Narrator", arc: "Setup", content: ""
    };
    updateData({ chapters: [...data.chapters, newChap] });
    setSelectedChapId(newChap.id);
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Chapter list */}
      <div style={{ width: 210, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${T.border}` }}>
          <button onClick={addChapter} style={{ display: "flex", alignItems: "center", gap: 6, background: T.gold + "22", border: `1px dashed ${T.gold}55`, borderRadius: 7, padding: "8px 12px", cursor: "pointer", color: T.gold, fontFamily: "'Crimson Text', serif", fontSize: 13, width: "100%" }}>
            <Plus size={13} /> New Chapter
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {data.chapters.map(ch => (
            <div key={ch.id} onClick={() => setSelectedChapId(ch.id)} style={{
              padding: "11px 14px", cursor: "pointer",
              borderLeft: selectedChapId === ch.id ? `3px solid ${T.gold}` : "3px solid transparent",
              background: selectedChapId === ch.id ? T.card : "transparent", transition: "all 0.15s"
            }}>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: selectedChapId === ch.id ? T.gold : T.muted, marginBottom: 3 }}>Ch.{ch.id}</div>
              <div style={{ fontFamily: "'Crimson Text', serif", color: selectedChapId === ch.id ? T.cream : T.text, fontSize: 13, lineHeight: 1.3 }}>{ch.title}</div>
              <div style={{ marginTop: 5 }}><Badge label={ch.status} color={SC[ch.status]} small /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "12px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14, flexShrink: 0, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 18 }}>
              Ch.{selectedChap?.id} — {selectedChap?.title}
            </div>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: T.muted, marginTop: 2 }}>
              POV: {selectedChap?.pov} · {(selectedChap?.words || 0).toLocaleString()} words
            </div>
          </div>
          <SaveIndicator saved={saved} />
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 12px", fontFamily: "'Courier Prime', monospace", fontSize: 12, color: T.gold }}>{fmt(timer)}</div>
          <button onClick={() => setRunning(r => !r)} style={{ background: running ? T.red + "33" : T.green + "33", border: `1px solid ${running ? T.red : T.green}55`, borderRadius: 7, padding: "6px 14px", cursor: "pointer", color: running ? T.red : T.green, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Crimson Text', serif", fontSize: 13 }}>
            {running ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Sprint</>}
          </button>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowFontPicker(p => !p)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Crimson Text', serif", fontSize: 13 }}>
              <Type size={12} /> Font
            </button>
            {showFontPicker && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 8, zIndex: 50, minWidth: 220, boxShadow: "0 8px 32px #0006" }}>
                {FONT_OPTIONS.map(fo => (
                  <button key={fo.value} onClick={() => { updateData({ settings: { ...data.settings, font: fo.value } }); setShowFontPicker(false); }} style={{
                    display: "block", width: "100%", padding: "10px 14px", background: data.settings?.font === fo.value ? T.gold + "22" : "transparent",
                    border: `1px solid ${data.settings?.font === fo.value ? T.gold + "66" : "transparent"}`, borderRadius: 7, cursor: "pointer",
                    textAlign: "left", marginBottom: 4
                  }}>
                    <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>{fo.label}</div>
                    <div style={{ fontFamily: fo.value, fontSize: 15, color: T.text }}>{fo.preview}</div>
                  </button>
                ))}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8, marginTop: 4 }}>
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, marginBottom: 6, paddingLeft: 4 }}>FONT SIZE</div>
                  <input type="range" min="14" max="26" value={fontSize} onChange={e => updateData({ settings: { ...data.settings, fontSize: Number(e.target.value) } })} style={{ width: "100%" }} />
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: T.gold, textAlign: "center" }}>{fontSize}px</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Character tags bar */}
        <div style={{ padding: "7px 28px", background: T.gold + "11", borderBottom: `1px solid ${T.gold}22`, display: "flex", gap: 8, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
          <TagIcon size={11} color={T.gold} />
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.gold, letterSpacing: 1 }}>Tag with @Name:</span>
          {data.characters.map(c => (
            <span key={c.id} style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: c.color, background: c.color + "22", padding: "2px 8px", borderRadius: 4 }}>@{c.name.split(" ")[0]}</span>
          ))}
        </div>

        {/* Text area */}
        <div style={{ flex: 1, overflow: "auto", background: T.editorBg }}>
          <textarea
            value={selectedChap?.content || ""}
            onChange={handleContentChange}
            placeholder={`Begin Chapter ${selectedChap?.id}…\n\nUse @CharacterName to tag characters.`}
            style={{
              width: "100%", minHeight: "100%", height: "100%", background: "transparent",
              border: "none", outline: "none", fontFamily: font,
              fontSize: fontSize, lineHeight: 1.9, color: T.editorText,
              resize: "none", padding: "48px 15%", boxSizing: "border-box",
              letterSpacing: 0.3,
            }}
            spellCheck
          />
        </div>
      </div>

      {/* Scene sidebar */}
      <div style={{ width: 220, borderLeft: `1px solid ${T.border}`, padding: "20px 14px", overflowY: "auto", flexShrink: 0 }}>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Scene Notes</p>
        {[
          { label: "Arc", value: selectedChap?.arc, color: T.amber },
          { label: "POV", value: selectedChap?.pov, color: T.blue },
          { label: "Status", value: selectedChap?.status, color: SC[selectedChap?.status] },
        ].map((item, i) => (
          <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 11px", marginBottom: 7 }}>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontFamily: "'Crimson Text', serif", color: item.color, fontSize: 13 }}>{item.value}</div>
          </div>
        ))}
        <div style={{ height: 1, background: T.border, margin: "14px 0" }} />
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Characters</p>
        {data.characters.slice(0, 3).map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{c.emoji}</span>
            <div>
              <div style={{ fontFamily: "'Crimson Text', serif", color: c.color, fontSize: 13 }}>{c.name.split(" ")[0]}</div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: T.muted }}>{c.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHARACTERS ──────────────────────────────────────────────
function Characters({ data, updateData }) {
  const T = useTheme();
  const [selected, setSelected] = useState(data.characters[0]);
  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { setSelected(data.characters.find(c => c.id === selected?.id) || data.characters[0]); }, [data.characters]);

  const addChar = () => {
    const newC = { id: Date.now(), name: "New Character", role: "Supporting", age: 30, trait: "TBD", color: "#c9a84c", appearances: 0, arc: "TBD", emoji: "👤", bio: "" };
    updateData({ characters: [...data.characters, newC] });
    setSelected(newC);
  };

  const saveEdit = () => {
    updateData({ characters: data.characters.map(c => c.id === selected.id ? { ...c, ...form } : c) });
    setEditing(false);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div style={{ width: 250, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "14px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2 }}>Cast</span>
          <button onClick={addChar} style={{ background: T.gold + "22", border: `1px dashed ${T.gold}55`, borderRadius: 5, padding: "4px 10px", cursor: "pointer", color: T.gold, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontFamily: "'Crimson Text', serif" }}>
            <Plus size={11} /> Add
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {data.characters.map(c => (
            <div key={c.id} onClick={() => { setSelected(c); setEditing(false); setTab("profile"); }} style={{
              padding: "12px", borderRadius: 9, cursor: "pointer", marginBottom: 6,
              background: selected?.id === c.id ? c.color + "22" : T.card,
              border: `1px solid ${selected?.id === c.id ? c.color + "66" : T.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{c.emoji}</span>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", color: c.color, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, marginTop: 1 }}>{c.role} · Age {c.age}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "28px 40px", overflowY: "auto" }}>
        {selected && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
              <span style={{ fontSize: 48 }}>{selected.emoji}</span>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: selected.color, fontSize: 32, margin: 0 }}>{selected.name}</h2>
                <div style={{ display: "flex", gap: 8, marginTop: 7 }}>
                  <Badge label={selected.role} color={selected.color} />
                  <Badge label={`Arc: ${selected.arc}`} color={T.amber} />
                </div>
              </div>
              <button onClick={() => { setEditing(!editing); setForm({ ...selected }); }} style={{ marginLeft: "auto", background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 14px", cursor: "pointer", color: T.muted, fontFamily: "'Crimson Text', serif", fontSize: 13 }}>
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
              {["profile", "story"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: "7px 18px", borderRadius: 7, border: `1px solid ${tab === t ? selected.color : T.border}`,
                  background: tab === t ? selected.color + "22" : "transparent", cursor: "pointer",
                  color: tab === t ? selected.color : T.muted, fontFamily: "'Courier Prime', monospace",
                  fontSize: 10, textTransform: "uppercase", letterSpacing: 1
                }}>{t}</button>
              ))}
            </div>

            {tab === "profile" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {editing ? (
                  <>
                    {[["name","Name"],["role","Role"],["age","Age"],["trait","Core Trait"],["arc","Arc"],["emoji","Emoji"],["bio","Biography"]].map(([key, label]) => (
                      <div key={key} style={{ gridColumn: key === "bio" ? "1/-1" : undefined }}>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{label}</div>
                        {key === "bio"
                          ? <textarea value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: "10px", color: T.text, fontFamily: "'Crimson Text', serif", fontSize: 15, outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box" }} />
                          : <input value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 12px", color: T.text, fontFamily: "'Crimson Text', serif", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
                        }
                      </div>
                    ))}
                    <div style={{ gridColumn: "1/-1" }}>
                      <button onClick={saveEdit} style={{ background: T.gold, color: T.bg, border: "none", borderRadius: 7, padding: "10px 24px", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>Save Character</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ gridColumn: "1/-1", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 22px" }}>
                      <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Biography</p>
                      <p style={{ fontFamily: "'Crimson Text', serif", color: T.text, fontSize: 17, lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>{selected.bio || "No biography written yet."}</p>
                    </div>
                    {[["Core Trait", selected.trait],["Age", selected.age],["Arc", selected.arc],["Role", selected.role]].map(([l, v]) => (
                      <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, padding: "14px 18px" }}>
                        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{l}</div>
                        <div style={{ fontFamily: "'Crimson Text', serif", color: T.cream, fontSize: 15 }}>{v}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            {tab === "story" && (
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "22px 26px" }}>
                <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>Appears in</p>
                {data.chapters.length === 0 && <p style={{ fontFamily: "'Crimson Text', serif", color: T.muted, fontStyle: "italic" }}>No chapters yet.</p>}
                {data.chapters.map(ch => (
                  <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: selected.color }} />
                    <span style={{ fontFamily: "'Crimson Text', serif", color: T.text, fontSize: 15, flex: 1 }}>Ch.{ch.id} — {ch.title}</span>
                    <Badge label={ch.arc} color={T.amber} small />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── STORY MAP ───────────────────────────────────────────────
function StoryMap({ data }) {
  const T = useTheme();
  const arcColors = { Setup: T.blue, "Rising Action": T.amber, Climax: T.red, Resolution: T.green };
  const arcs = ["Setup", "Rising Action", "Climax", "Resolution"];
  return (
    <div style={{ padding: "28px 36px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 26, margin: "0 0 6px" }}>Story Map</h2>
      <p style={{ fontFamily: "'Crimson Text', serif", color: T.muted, fontSize: 15, fontStyle: "italic", marginBottom: 28 }}>The architecture of your narrative</p>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "28px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
          {data.chapters.map((ch, i) => {
            const arc = arcs.indexOf(ch.arc);
            const h = arc === -1 ? 40 : [40, 70, 110, 80][arc];
            const col = arcColors[ch.arc] || T.muted;
            return (
              <div key={ch.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ background: col + "33", border: `2px solid ${col}`, borderRadius: 7, width: "80%", height: h, position: "relative", overflow: "hidden" }}>
                  {ch.words > 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: col + "55" }} />}
                </div>
                <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted }}>Ch.{ch.id}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
          {arcs.map(arc => (
            <div key={arc} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: arcColors[arc] }} />
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted }}>{arc}</span>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 19, marginBottom: 16 }}>Timeline</h3>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 2, background: T.border }} />
        {data.chapters.map((ch) => {
          const col = arcColors[ch.arc] || T.muted;
          return (
            <div key={ch.id} style={{ display: "flex", gap: 20, marginBottom: 16 }}>
              <div style={{ width: 46, flexShrink: 0, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 13, height: 13, borderRadius: "50%", background: col, border: `3px solid ${T.bg}`, marginTop: 4, zIndex: 1 }} />
              </div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, padding: "12px 16px", flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 15 }}>Ch.{ch.id} — {ch.title}</span>
                  <Badge label={ch.arc} color={col} small />
                  <Badge label={`POV: ${ch.pov}`} color={T.muted} small />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: T.muted }}>{ch.words > 0 ? ch.words.toLocaleString() + " words" : "Not started"}</span>
                  <Badge label={ch.status} color={STATUS_COLORS(T)[ch.status]} small />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BRAINSTORM ──────────────────────────────────────────────
function Brainstorm({ data, updateData }) {
  const T = useTheme();
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("punchline");
  const TC = TYPE_COLORS(T);
  const TypeIcons = { punchline: Star, plot: Swords, research: BookOpen, world: Globe, character: Users };

  const add = () => {
    if (!newText.trim()) return;
    updateData({ ideas: [...data.ideas, { id: Date.now(), type: newType, text: newText, chapter: null }] });
    setNewText("");
  };

  const remove = (id) => updateData({ ideas: data.ideas.filter(i => i.id !== id) });

  return (
    <div style={{ padding: "28px 36px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 26, margin: "0 0 6px" }}>Ideas & Brainstorm</h2>
      <p style={{ fontFamily: "'Crimson Text', serif", color: T.muted, fontSize: 15, fontStyle: "italic", marginBottom: 24 }}>Capture every spark before it fades</p>

      <div style={{ background: T.card, border: `1px solid ${T.gold}44`, borderRadius: 12, padding: "18px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
          {Object.keys(TC).map(type => (
            <button key={type} onClick={() => setNewType(type)} style={{
              padding: "5px 12px", borderRadius: 5, border: `1px solid ${newType === type ? TC[type] : T.border}`,
              background: newType === type ? TC[type] + "22" : "transparent", cursor: "pointer",
              color: newType === type ? TC[type] : T.muted, fontFamily: "'Courier Prime', monospace",
              fontSize: 9, textTransform: "capitalize", letterSpacing: 1
            }}>{type}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Write your idea, punchline, plot twist, research note…"
            style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 7, padding: "11px 14px", color: T.text, fontFamily: "'Crimson Text', serif", fontSize: 15, outline: "none", resize: "none", height: 70 }} />
          <button onClick={add} style={{ background: T.gold, color: T.bg, border: "none", borderRadius: 7, padding: "0 18px", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, alignSelf: "stretch" }}>+ Add</button>
        </div>
      </div>

      <div style={{ columns: 3, gap: 14 }}>
        {data.ideas.map(idea => {
          const color = TC[idea.type] || T.muted;
          const Icon = TypeIcons[idea.type] || Star;
          return (
            <div key={idea.id} style={{ breakInside: "avoid", background: T.card, border: `1px solid ${color}44`, borderRadius: 11, padding: "14px 16px", marginBottom: 14, borderLeft: `4px solid ${color}`, position: "relative" }}>
              <button onClick={() => remove(idea.id)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: T.muted, lineHeight: 1, fontSize: 14 }}>×</button>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <Icon size={12} color={color} />
                <Badge label={idea.type} color={color} small />
              </div>
              <p style={{ fontFamily: idea.type === "punchline" ? "'Playfair Display', serif" : "'Crimson Text', serif", fontStyle: idea.type === "punchline" ? "italic" : "normal", color: T.text, fontSize: idea.type === "punchline" ? 16 : 14, lineHeight: 1.6, margin: 0 }}>{idea.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ANALYTICS ───────────────────────────────────────────────
function Analytics({ data }) {
  const T = useTheme();
  const chapData = data.chapters.map(ch => ({ chapter: `Ch.${ch.id}`, words: ch.words || 0, target: Math.round(data.wordGoal / data.chapters.length) }));
  const dailyData = Object.entries(data.dailyWords || {}).slice(-7).map(([day, words]) => ({ day: day.slice(0, 3), words }));

  return (
    <div style={{ padding: "28px 36px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 26, margin: "0 0 24px" }}>Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 17, margin: "0 0 18px" }}>Words per Chapter</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chapData}>
              <XAxis dataKey="chapter" tick={{ fill: T.muted, fontSize: 10, fontFamily: "'Courier Prime', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: "'Courier Prime', monospace", fontSize: 11 }} />
              <Bar dataKey="target" fill={T.border} radius={[4, 4, 0, 0]} />
              <Bar dataKey="words" fill={T.gold} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 17, margin: "0 0 18px" }}>Daily Writing</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dailyData.length ? dailyData : [{ day: "Today", words: 0 }]}>
              <XAxis dataKey="day" tick={{ fill: T.muted, fontSize: 10, fontFamily: "'Courier Prime', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: "'Courier Prime', monospace", fontSize: 11 }} />
              <Line type="monotone" dataKey="words" stroke={T.amber} strokeWidth={2.5} dot={{ fill: T.amber, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 17, margin: "0 0 16px" }}>Character Screen Time</h3>
          {data.characters.map(c => (
            <div key={c.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Crimson Text', serif", color: c.color, fontSize: 14 }}>{c.emoji} {c.name}</span>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: T.muted }}>{c.appearances} scenes</span>
              </div>
              <div style={{ background: T.border, borderRadius: 999, height: 5, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (c.appearances / 20) * 100)}%`, height: "100%", background: c.color }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 17, margin: "0 0 16px" }}>Project Summary</h3>
          {[
            ["Total Words", data.chapters.reduce((s, c) => s + (c.words || 0), 0).toLocaleString(), T.gold],
            ["Chapters", `${data.chapters.filter(c => c.status === "done").length} done / ${data.chapters.length} total`, T.amber],
            ["Characters", data.characters.length, T.purple],
            ["Ideas Captured", data.ideas.length, T.green],
            ["Goal", `${Math.min(100, Math.round((data.chapters.reduce((s, c) => s + (c.words || 0), 0) / data.wordGoal) * 100))}% complete`, T.blue],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", color, fontSize: 16 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PREVIEW ─────────────────────────────────────────────────
function Preview({ data }) {
  const T = useTheme();
  const [chapIdx, setChapIdx] = useState(0);
  const ch = data.chapters[chapIdx];
  const font = data.settings?.font || FONT_OPTIONS[0].value;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", background: T.previewBg, display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 620, padding: "72px 56px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 64, borderBottom: `2px solid ${T.previewAccent}55`, paddingBottom: 52 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: T.muted, letterSpacing: 6, textTransform: "uppercase", marginBottom: 16 }}>A Novel by</p>
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: 16, color: T.muted, fontStyle: "italic", marginBottom: 32 }}>Your Name</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, color: T.cream, fontWeight: 900, lineHeight: 1.1, marginBottom: 14 }}>{data.projectTitle}</h1>
            <div style={{ width: 50, height: 3, background: T.previewAccent, margin: "0 auto 16px" }} />
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: T.muted, fontStyle: "italic" }}>{data.projectGenre}</p>
          </div>

          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 12, color: T.muted, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Chapter {chapIdx + 1}</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: T.cream, fontWeight: 700 }}>{ch?.title}</h2>
            <div style={{ width: 32, height: 2, background: T.previewAccent, margin: "16px auto 0" }} />
          </div>

          <div style={{ fontFamily: font, fontSize: 19, lineHeight: 1.9, color: T.previewText }}>
            {(ch?.content || "No content written yet.").split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: 22, textIndent: i === 0 ? 0 : "2em" }}>{para}</p>
            ))}
          </div>

          <div style={{ textAlign: "center", margin: "48px 0" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", color: T.previewAccent, fontSize: 22 }}>⁂</span>
          </div>
        </div>
      </div>

      <div style={{ width: 210, borderLeft: `1px solid ${T.border}`, padding: "22px 14px", overflowY: "auto", flexShrink: 0 }}>
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Chapters</p>
        {data.chapters.map((c, i) => (
          <button key={c.id} onClick={() => setChapIdx(i)} style={{ display: "block", width: "100%", padding: "9px 11px", background: chapIdx === i ? T.gold + "22" : "transparent", border: `1px solid ${chapIdx === i ? T.gold : T.border}`, borderRadius: 7, cursor: "pointer", textAlign: "left", marginBottom: 6, color: chapIdx === i ? T.gold : T.muted, fontFamily: "'Crimson Text', serif", fontSize: 13 }}>
            Ch.{i + 1} — {c.title}
          </button>
        ))}
        <div style={{ height: 1, background: T.border, margin: "14px 0" }} />
        <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Export</p>
        <button onClick={() => {
          const text = data.chapters.map(c => `CHAPTER ${c.id}: ${c.title}\n\n${c.content || ""}`).join("\n\n---\n\n");
          const blob = new Blob([text], { type: "text/plain" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
          a.download = `${data.projectTitle.replace(/\s+/g, "_")}.txt`; a.click();
        }} style={{ width: "100%", padding: "9px", background: T.gold + "22", border: `1px solid ${T.gold}55`, borderRadius: 7, cursor: "pointer", color: T.gold, fontFamily: "'Crimson Text', serif", fontSize: 13, marginBottom: 7, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Download size={13} /> Export .txt
        </button>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────
function SettingsPanel({ data, updateData }) {
  const T = useTheme();
  const [form, setForm] = useState({ projectTitle: data.projectTitle, projectGenre: data.projectGenre, wordGoal: data.wordGoal, dailyGoal: data.dailyGoal });

  const save = () => updateData(form);

  const exportBackup = () => {
    const blob = new Blob([localStorage.getItem("quill_data_v1") || "{}"], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `quill_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { const parsed = JSON.parse(ev.target.result); updateData(parsed); alert("Backup restored!"); } catch { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: "28px 36px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 26, margin: "0 0 24px" }}>Settings</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700 }}>
        {[["Project Title", "projectTitle", "text"],["Genre", "projectGenre", "text"],["Word Goal", "wordGoal", "number"],["Daily Goal", "dailyGoal", "number"]].map(([label, key, type]) => (
          <div key={key}>
            <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>{label}</div>
            <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
              style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, padding: "10px 14px", color: T.text, fontFamily: "'Crimson Text', serif", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ gridColumn: "1/-1" }}>
          <button onClick={save} style={{ background: T.gold, color: T.bg, border: "none", borderRadius: 7, padding: "11px 28px", cursor: "pointer", fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700 }}>Save Settings</button>
        </div>
      </div>

      <div style={{ height: 1, background: T.border, margin: "28px 0", maxWidth: 700 }} />
      <h3 style={{ fontFamily: "'Playfair Display', serif", color: T.cream, fontSize: 20, marginBottom: 16 }}>Data & Backup</h3>
      <p style={{ fontFamily: "'Crimson Text', serif", color: T.muted, fontSize: 15, marginBottom: 18 }}>Your work is automatically saved to your browser's local storage. Export a backup regularly to avoid any loss.</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={exportBackup} style={{ background: T.green + "22", border: `1px solid ${T.green}55`, borderRadius: 7, padding: "10px 20px", cursor: "pointer", color: T.green, fontFamily: "'Crimson Text', serif", fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>
          <Download size={14} /> Download Backup (.json)
        </button>
        <label style={{ background: T.blue + "22", border: `1px solid ${T.blue}55`, borderRadius: 7, padding: "10px 20px", cursor: "pointer", color: T.blue, fontFamily: "'Crimson Text', serif", fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>
          <Save size={14} /> Restore from Backup
          <input type="file" accept=".json" onChange={importBackup} style={{ display: "none" }} />
        </label>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: BookOpen, label: "Overview" },
  { id: "write", icon: Feather, label: "Write" },
  { id: "characters", icon: Users, label: "Characters" },
  { id: "storymap", icon: Map, label: "Story Map" },
  { id: "brainstorm", icon: Lightbulb, label: "Ideas" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "preview", icon: Eye, label: "Preview" },
  { id: "settings", icon: Settings, label: "Settings" },
];

// ─── ROOT APP ────────────────────────────────────────────────
export default function App() {
  const [themeName, setThemeName] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.settings?.theme || "dark"; } catch { return "dark"; }
  });
  const T = THEMES[themeName];

  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(() => loadData());
  const [search, setSearch] = useState("");

  const updateData = useCallback((patch) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      saveData(next);
      return next;
    });
  }, []);

  const toggleTheme = () => {
    const next = themeName === "dark" ? "light" : "dark";
    setThemeName(next);
    updateData({ settings: { ...data.settings, theme: next } });
  };

  const totalWords = data.chapters.reduce((s, c) => s + (c.words || 0), 0);
  const pct = Math.min(100, Math.round((totalWords / (data.wordGoal || 80000)) * 100));

  const views = {
    dashboard: <Dashboard data={data} setView={setView} />,
    write: <Write data={data} updateData={updateData} />,
    characters: <Characters data={data} updateData={updateData} />,
    storymap: <StoryMap data={data} />,
    brainstorm: <Brainstorm data={data} updateData={updateData} />,
    analytics: <Analytics data={data} />,
    preview: <Preview data={data} />,
    settings: <SettingsPanel data={data} updateData={updateData} />,
  };

  return (
    <ThemeContext.Provider value={T}>
      <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, overflow: "hidden", fontFamily: "'Crimson Text', serif" }}>
        {/* Sidebar */}
        <div style={{ width: 195, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: "22px 18px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Feather size={18} color={T.gold} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: T.gold, fontWeight: 700 }}>Quill</span>
              </div>
              <button onClick={toggleTheme} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 7px", cursor: "pointer", color: T.muted, display: "flex", alignItems: "center" }} title="Toggle theme">
                {themeName === "dark" ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
            <p style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: T.muted, letterSpacing: 2, textTransform: "uppercase", margin: "5px 0 0" }}>Writer's Studio</p>
          </div>

          {/* Search */}
          <div style={{ padding: "10px 10px 6px" }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 7, display: "flex", alignItems: "center", gap: 7, padding: "6px 10px" }}>
              <Search size={11} color={T.muted} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ background: "none", border: "none", outline: "none", color: T.text, fontFamily: "'Crimson Text', serif", fontSize: 13, width: "100%" }} />
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "6px 7px", overflowY: "auto" }}>
            {NAV.map(item => {
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => setView(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 11px",
                  borderRadius: 7, border: "none", cursor: "pointer", marginBottom: 2,
                  background: active ? T.gold + "22" : "transparent",
                  color: active ? T.gold : T.muted,
                  fontFamily: "'Crimson Text', serif", fontSize: 14, textAlign: "left", transition: "all 0.15s"
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = T.card; e.currentTarget.style.color = T.text; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.muted; } }}
                >
                  <item.icon size={14} />
                  {item.label}
                  {active && <ChevronRight size={11} style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}
          </nav>

          {/* Progress bar */}
          <div style={{ padding: "12px 10px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ background: T.card, borderRadius: 7, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Progress</span>
                <span style={{ fontFamily: "'Courier Prime', monospace", color: T.gold, fontSize: 10 }}>{pct}%</span>
              </div>
              <div style={{ background: T.border, borderRadius: 999, height: 4 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${T.amber}, ${T.gold})`, borderRadius: 999, transition: "width 1s" }} />
              </div>
              <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: T.muted, marginTop: 4 }}>{totalWords.toLocaleString()} / {(data.wordGoal || 80000).toLocaleString()}w</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {views[view]}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
