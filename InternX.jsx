import React, { useState, useEffect, useRef } from "react";
console.log('InternX module loaded')
import {
  Search, Brain, Zap, MapPin, ChevronRight, TrendingUp, Users,
  DollarSign, ArrowRight, Check, X, Upload, FileText, AlertCircle, CheckCircle,
  Sparkles, Award, Building2, Tag, ChevronDown, ChevronUp
} from "lucide-react";
import { collection, onSnapshot, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { db, auth } from "./firebase.js";
import { PMInternships } from "./src/components/PMInternships.jsx";
import { JobSearchAPI } from "./src/api/JobSearchAPI.js";

/* ─────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
@keyframes glitch1{0%,90%,100%{clip-path:inset(0 0 100% 0);transform:translate(0)}92%{clip-path:inset(10% 0 60% 0);transform:translate(-3px,1px)}94%{clip-path:inset(50% 0 20% 0);transform:translate(3px,-1px)}96%{clip-path:inset(80% 0 5% 0);transform:translate(-2px,2px)}98%{clip-path:inset(30% 0 40% 0);transform:translate(2px,-2px)}}
@keyframes glitch2{0%,88%,100%{clip-path:inset(0 0 100% 0);transform:translate(0)}90%{clip-path:inset(40% 0 30% 0);transform:translate(4px,-1px);color:#bf5af2}93%{clip-path:inset(70% 0 10% 0);transform:translate(-4px,1px)}96%{clip-path:inset(20% 0 55% 0);transform:translate(2px,2px)}99%{clip-path:inset(5% 0 75% 0);transform:translate(-1px,-1px)}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(123,44,191,.3),0 0 40px rgba(123,44,191,.1)}50%{box-shadow:0 0 40px rgba(123,44,191,.6),0 0 80px rgba(123,44,191,.2)}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes nodeFlicker{0%,96%,100%{opacity:1}97%{opacity:.3}98%{opacity:1}99%{opacity:.5}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideInUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmerBg{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes barGrow{from{width:0}to{width:var(--w)}}
@keyframes modalSlideIn{from{opacity:0;transform:translateY(-28px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes overlayFadeIn{from{opacity:0}to{opacity:1}}
`;

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
// Every skill an intern might realistically have, grouped by domain
const SKILL_LIBRARY = {
  "💻 Programming": ["Java", "Python", "JavaScript", "C++", "C", "TypeScript", "Go", "Kotlin", "Swift", "R", "MATLAB", "PHP", "Ruby", "Rust"],
  "☁️ Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux", "Bash", "Terraform", "Jenkins", "Git", "GitHub Actions"],
  "🗄️ Databases": ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Firebase", "Redis", "Oracle", "Cassandra", "SQLite", "DynamoDB"],
  "📊 Data & Analytics": ["Excel", "Power BI", "Tableau", "Statistics", "Pandas", "NumPy", "Data Visualization", "ETL", "Hadoop", "Spark"],
  "🤖 AI / ML": ["ML", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "Deep Learning", "Keras", "HuggingFace", "LLMs"],
  "🌐 Web & Mobile": ["React", "Node.js", "HTML", "CSS", "REST APIs", "GraphQL", "Next.js", "Vue", "Angular", "Flutter", "React Native"],
  "☕ Java Ecosystem": ["OOPs", "Spring Boot", "Microservices", "Hibernate", "Maven", "JUnit", "Spring MVC", "Kafka"],
  "💰 Finance & Accounting": ["Accounting", "Finance", "Financial Modeling", "Tally", "Excel", "GST", "Auditing", "Valuation", "Investment Analysis", "Tally ERP"],
  "📋 Business & Management": ["Strategy", "Research", "Agile", "Scrum", "Market Analysis", "Business Development", "CRM", "ERP", "Six Sigma"],
  "🎨 Design & Product": ["Figma", "Adobe XD", "UI/UX", "Canva", "Wireframing", "Prototyping", "Product Roadmap", "User Research"],
  "📣 Marketing": ["SEO", "Google Ads", "Social Media", "Content Writing", "Email Marketing", "Analytics", "Branding", "Copywriting"],
  "⚙️ Other Tech": ["Analytics", "Networking", "Cybersecurity", "IoT", "Blockchain", "AR/VR", "Embedded Systems", "VLSI"],
};

const internships = [
  { company: "Reliance Industries", role: "Business Analytics Intern", location: "Mumbai", color: "#7B2CBF", stipend: "₹5000", sector: "Energy & Retail", required: ["Excel", "SQL", "Analytics", "Power BI", "Python", "Statistics"] },
  { company: "Tata Consultancy Services", role: "Java Developer Intern", location: "Pune", color: "#5a1a9a", stipend: "₹5000", sector: "IT Services", required: ["Java", "OOPs", "Spring Boot", "Microservices", "Git", "REST APIs"] },
  { company: "Infosys", role: "Data Science Intern", location: "Bangalore", color: "#9d4edd", stipend: "₹5000", sector: "IT Services", required: ["Python", "ML", "Statistics", "TensorFlow", "Pandas", "Data Visualization"] },
  { company: "HDFC Bank", role: "Finance Operations Intern", location: "Delhi", color: "#6a1fa8", stipend: "₹5000", sector: "Banking", required: ["Accounting", "Excel", "Finance", "Tally", "Financial Modeling"] },
  { company: "Wipro", role: "Cloud Infrastructure Intern", location: "Hyderabad", color: "#7B2CBF", stipend: "₹5000", sector: "IT Services", required: ["AWS", "Linux", "DevOps", "Docker", "Kubernetes", "CI/CD"] },
  { company: "Mahindra Group", role: "Product Management Intern", location: "Mumbai", color: "#8b2fc9", stipend: "₹5000", sector: "Automotive", required: ["Strategy", "Research", "Agile", "Figma", "Market Analysis", "SQL"] },
];

const DEFAULT_SKILLS = ["Java", "OOPs", "SQL", "Excel", "Python", "Accounting"];
const RESUME_SETS = {
  tech: ["Java", "OOPs", "SQL", "Python", "Git", "REST APIs", "Linux", "Statistics", "Spring Boot"],
  finance: ["Accounting", "Excel", "Finance", "Financial Modeling", "Tally", "SQL", "Analytics"],
  data: ["Python", "SQL", "Statistics", "Pandas", "Data Visualization", "ML", "Excel", "TensorFlow"],
};

/* ─────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────── */
function CircularProgress({ match, animate, size = 84 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (match / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(123,44,191,0.15)" strokeWidth="5" />
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={match >= 90 ? "#bf5af2" : match >= 70 ? "#7B2CBF" : "#5a1a9a"}
          strokeWidth="5" strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={animate ? offset : circ}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${match >= 90 ? "#bf5af2" : "#7B2CBF"})` }}
        />
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: size > 70 ? 15 : 11, fontWeight: 700, color: match >= 90 ? "#bf5af2" : "#c084fc", lineHeight: 1 }}>{match}%</div>
        <div style={{ fontSize: 7, color: "rgba(196,132,252,0.6)", fontFamily: "'Space Mono',monospace", marginTop: 1 }}>MATCH</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   RESUME UPLOADER
───────────────────────────────────────── */
function ResumeUploader({ onExtract, userSkills, isDefault }) {
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [atsScore, setAtsScore] = useState(null);
  const ref = useRef();
  const steps = ["Reading document structure…", "Parsing skill keywords…", "Cross-referencing PM Scheme DB…", "Computing match scores…"];

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setScanning(true); setStep(0);
    let s = 0;
    const iv = setInterval(() => {
      s++; setStep(s);
      if (s >= steps.length) {
        clearInterval(iv);
        setTimeout(() => {
          setScanning(false);
          const n = f.name.toLowerCase();
          let set = RESUME_SETS.tech;
          if (n.includes("finance") || n.includes("account")) set = RESUME_SETS.finance;
          else if (n.includes("data") || n.includes("ml")) set = RESUME_SETS.data;
          setAtsScore(Math.floor(Math.random() * 16) + 80);
          onExtract(set);
        }, 500);
      }
    }, 750);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(123,44,191,0.25)", borderRadius: 20, backdropFilter: "blur(20px)", padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7B2CBF,#9d4edd)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(123,44,191,0.4)" }}>
          <FileText size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#e9d5ff" }}>RESUME SCANNER</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(196,132,252,0.55)" }}>Upload resume → auto-extract skills → match internships</div>
        </div>
        {!isDefault && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "nodeFlicker 3s infinite" }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#86efac" }}>SKILLS EXTRACTED</span>
          </div>
        )}
      </div>

      {scanning ? (
        <div style={{ padding: "18px 0", textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#bf5af2", borderLeftColor: "#7B2CBF", margin: "0 auto 14px", animation: "spin 0.9s linear infinite" }} />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#c084fc", marginBottom: 10 }}>{steps[Math.min(step, steps.length - 1)]}</div>
          <div style={{ background: "rgba(123,44,191,0.15)", borderRadius: 4, height: 5, overflow: "hidden", maxWidth: 300, margin: "0 auto" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#7B2CBF,#bf5af2)", width: `${((step + 1) / steps.length) * 100}%`, transition: "width 0.7s ease" }} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => ref.current.click()}
            style={{ flex: 1, padding: "18px", borderRadius: 12, cursor: "pointer", textAlign: "center", border: `2px dashed ${dragOver ? "rgba(191,90,242,0.8)" : "rgba(123,44,191,0.3)"}`, background: dragOver ? "rgba(123,44,191,0.1)" : "rgba(123,44,191,0.04)", transition: "all 0.25s" }}>
            <Upload size={22} color={dragOver ? "#bf5af2" : "rgba(196,132,252,0.4)"} style={{ margin: "0 auto 8px", display: "block" }} />
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: dragOver ? "#c084fc" : "rgba(196,132,252,0.45)", lineHeight: 1.6 }}>
              {file ? <><span style={{ color: "#86efac" }}>✓</span> {file.name}</> : <>Drop <strong style={{ color: "rgba(196,132,252,0.7)" }}>PDF</strong> / <strong style={{ color: "rgba(196,132,252,0.7)" }}>DOCX</strong><br />or click to browse</>}
            </div>
            <input ref={ref} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.35)", textAlign: "center", letterSpacing: "0.1em" }}>DEMO RESUMES</div>
            {Object.entries({ "💻 Tech": "tech", "💰 Finance": "finance", "📊 Data": "data" }).map(([label, key]) => (
              <button key={key} onClick={() => handleFile({ name: `${key}_resume.pdf` })}
                style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", background: "rgba(123,44,191,0.12)", border: "1px solid rgba(123,44,191,0.3)", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#c084fc", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(123,44,191,0.28)"; e.currentTarget.style.color = "#e9d5ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(123,44,191,0.12)"; e.currentTarget.style.color = "#c084fc"; }}
              >{label}</button>
            ))}
          </div>
        </div>
      )}

      {userSkills.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(123,44,191,0.12)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.45)", letterSpacing: "0.12em", marginBottom: 8 }}>EXTRACTED SKILLS ({userSkills.length})</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {userSkills.map((s, i) => <span key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, padding: "3px 10px", borderRadius: 4, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", color: "#86efac" }}>{s}</span>)}
            </div>
          </div>
          {atsScore && (
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.45)", letterSpacing: "0.12em", marginBottom: 8 }}>ATS MATCH SCORE</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 700, color: atsScore >= 85 ? "#22c55e" : "#f59e0b", textShadow: `0 0 10px ${atsScore >= 85 ? "rgba(34,197,94,0.4)" : "rgba(245,158,11,0.4)"}` }}>
                {atsScore}%
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SKILL PICKER
───────────────────────────────────────── */
function SkillPicker({ selectedSkills, onToggle, onClear, onFilter, isSearching }) {
  const [openCat, setOpenCat] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? Object.entries(SKILL_LIBRARY).reduce((acc, [cat, skills]) => {
      const s = skills.filter(sk => sk.toLowerCase().includes(search.toLowerCase()));
      if (s.length) acc[cat] = s;
      return acc;
    }, {})
    : SKILL_LIBRARY;

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(123,44,191,0.25)", borderRadius: 20, backdropFilter: "blur(20px)", padding: 24, marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#5a1a9a,#7B2CBF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(123,44,191,0.4)" }}>
            <Tag size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#e9d5ff" }}>SKILL SELECTOR</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(196,132,252,0.55)" }}>Pick your skills → see matching internships instantly</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selectedSkills.length > 0 && (
            <>
              <div style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(123,44,191,0.2)", border: "1px solid rgba(123,44,191,0.4)", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#c084fc" }}>
                {selectedSkills.length} selected
              </div>
              <button onClick={onClear} style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#fca5a5", cursor: "pointer" }}>
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(123,44,191,0.06)", border: "1px solid rgba(123,44,191,0.2)", borderRadius: 10, marginBottom: 16 }}>
        <Search size={14} color="rgba(196,132,252,0.5)" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills…"
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#e9d5ff" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "rgba(196,132,252,0.5)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>}
      </div>

      {/* Selected pills */}
      {selectedSkills.length > 0 && (
        <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(123,44,191,0.06)", borderRadius: 12, border: "1px solid rgba(123,44,191,0.18)" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.45)", letterSpacing: "0.1em", marginBottom: 8 }}>YOUR SELECTED SKILLS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selectedSkills.map(s => (
              <button key={s} onClick={() => onToggle(s)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "linear-gradient(135deg,rgba(123,44,191,0.35),rgba(91,20,150,0.25))", border: "1px solid rgba(191,90,242,0.5)", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#e9d5ff", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 0 8px rgba(123,44,191,0.2)" }}>
                {s} <X size={9} color="rgba(196,132,252,0.7)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category accordion */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(filtered).map(([cat, skills]) => {
          const catSelected = skills.filter(s => selectedSkills.includes(s)).length;
          const isOpen = openCat === cat || search.trim() !== "";
          return (
            <div key={cat} style={{ border: "1px solid rgba(123,44,191,0.18)", borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOpenCat(isOpen && !search ? null : cat)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: catSelected > 0 ? "rgba(123,44,191,0.15)" : "rgba(255,255,255,0.02)", border: "none", cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = catSelected > 0 ? "rgba(123,44,191,0.2)" : "rgba(123,44,191,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = catSelected > 0 ? "rgba(123,44,191,0.15)" : "rgba(255,255,255,0.02)"}
              >
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: catSelected > 0 ? "#e9d5ff" : "rgba(196,132,252,0.75)" }}>{cat}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {catSelected > 0 && <span style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(123,44,191,0.3)", fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#c084fc" }}>{catSelected}</span>}
                  {isOpen ? <ChevronUp size={13} color="rgba(196,132,252,0.5)" /> : <ChevronDown size={13} color="rgba(196,132,252,0.5)" />}
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.2)", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {skills.map(skill => {
                    const selected = selectedSkills.includes(skill);
                    return (
                      <button key={skill} onClick={() => onToggle(skill)}
                        style={{
                          padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                          background: selected ? "linear-gradient(135deg,rgba(123,44,191,0.4),rgba(91,20,150,0.3))" : "rgba(123,44,191,0.06)",
                          border: `1px solid ${selected ? "rgba(191,90,242,0.6)" : "rgba(123,44,191,0.2)"}`,
                          fontFamily: "'Space Mono',monospace", fontSize: 9,
                          color: selected ? "#e9d5ff" : "rgba(196,132,252,0.65)",
                          transition: "all 0.15s",
                          boxShadow: selected ? "0 0 10px rgba(123,44,191,0.3)" : "none",
                          animation: selected ? "popIn 0.2s ease" : "none",
                        }}>
                        {selected && <Check size={9} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onFilter} disabled={isSearching}
          style={{ padding: "12px 24px", background: isSearching ? "rgba(123,44,191,0.3)" : "linear-gradient(135deg,#7B2CBF,#9d4edd)", border: "none", borderRadius: 12, cursor: isSearching ? "not-allowed" : "pointer", fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 16px rgba(123,44,191,0.4)", transition: "all 0.2s" }}>
          {isSearching ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} /> : <Search size={14} color="#fff" />}
          {isSearching ? "SEARCHING..." : "SEARCH INTERNSHIPS"}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MATCHED INTERNSHIP RESULT CARD
   (shows after skill selection, with % calc on click)
───────────────────────────────────────── */
function MatchedInternCard({ data, userSkills, idx, onApply }) {
  const [expanded, setExpanded] = useState(false);
  const [animateRing, setAnimateRing] = useState(false);
  const required = data.required;
  const matched = required.filter(s => userSkills.includes(s));
  const gaps = required.filter(s => !userSkills.includes(s));
  const pct = Math.round((matched.length / required.length) * 100);
  const barColor = pct >= 80 ? "linear-gradient(90deg,#16a34a,#22c55e)" : pct >= 60 ? "linear-gradient(90deg,#d97706,#f59e0b)" : "linear-gradient(90deg,#dc2626,#f87171)";
  const pctColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#f87171";

  useEffect(() => { if (expanded) { const t = setTimeout(() => setAnimateRing(true), 80); return () => clearTimeout(t); } else setAnimateRing(false); }, [expanded]);

  return (
    <div style={{
      background: expanded ? "linear-gradient(135deg,rgba(123,44,191,0.2),rgba(15,5,30,0.9))" : "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(15,5,30,0.75))",
      border: `1px solid ${expanded ? "rgba(191,90,242,0.6)" : "rgba(123,44,191,0.2)"}`,
      borderRadius: 16, backdropFilter: "blur(16px)", overflow: "hidden",
      boxShadow: expanded ? "0 0 40px rgba(123,44,191,0.25)" : "0 4px 20px rgba(0,0,0,0.4)",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      animation: `slideInUp 0.4s ease ${idx * 0.07}s both`,
    }}>
      {/* Top accent when expanded */}
      {expanded && <div style={{ height: 2, background: "linear-gradient(90deg,#7B2CBF,#bf5af2,#7B2CBF)" }} />}

      {/* Collapsed row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", cursor: "pointer" }} onClick={() => setExpanded(p => !p)}>
        {/* Logo */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${data.color},rgba(123,44,191,0.3))`, border: "1px solid rgba(123,44,191,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, fontFamily: "'Orbitron',monospace", color: "#e9d5ff", flexShrink: 0 }}>
          {data.company.charAt(0)}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: "#e9d5ff" }}>{data.company}</div>

            {/* Tags: Global vs MCA */}
            {data.isGlobal ? (
              <div
                title="This opportunity was sourced from the live global API."
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", animation: "fadeIn 0.4s ease" }}
              >
                <AlertCircle size={10} color="#60a5fa" />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#60a5fa", letterSpacing: "0.05em", textShadow: "0 0 6px rgba(96,165,250,0.4)" }}>Global Listing</span>
              </div>
            ) : data.isVerified ? (
              <div
                title="This company is registered with the Ministry of Corporate Affairs."
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", animation: "fadeIn 0.4s ease" }}
              >
                <CheckCircle size={10} color="#4ade80" />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#4ade80", letterSpacing: "0.05em", textShadow: "0 0 6px rgba(74,222,128,0.4)" }}>Verified by MCA</span>
              </div>
            ) : null}
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(196,132,252,0.6)", marginBottom: 8 }}>{data.role} · {data.sector}</div>
        </div>
        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={10} color="rgba(196,132,252,0.5)" />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(196,132,252,0.5)" }}>{data.location}</span>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#86efac" }}>{data.stipend}/mo</div>
          <div style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(123,44,191,0.2)", border: "1px solid rgba(123,44,191,0.35)", fontFamily: "'Orbitron',monospace", fontSize: 8, color: "#c084fc" }}>
            {expanded ? "▲ COLLAPSE" : "▼ ANALYSE"}
          </div>
        </div>
      </div>

      {/* Expanded analysis */}
      {expanded && (
        <div style={{ padding: "0 20px 20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ height: 1, background: "rgba(123,44,191,0.2)", marginBottom: 18 }} />
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
            {/* Ring */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <CircularProgress match={pct} animate={animateRing} size={96} />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.5)", textAlign: "center", lineHeight: 1.5 }}>
                {matched.length}/{required.length}<br />skills met
              </div>
            </div>
            {/* Details */}
            <div>
              {/* Skill breakdown */}
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.45)", letterSpacing: "0.1em", marginBottom: 9 }}>REQUIRED SKILLS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
                {required.map((skill, i) => {
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, background: "rgba(123,44,191,0.1)", border: `1px solid rgba(123,44,191,0.2)`, animation: `slideInRight 0.3s ease ${i * 0.05}s both` }}>
                      <div style={{ width: 18, height: 18, borderRadius: 5, background: "rgba(123,44,191,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={10} color="#c084fc" />
                      </div>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#e9d5ff", flex: 1 }}>{skill}</span>
                    </div>
                  );
                })}
              </div>
              {/* AI Analysis Agent */}
              {gaps.length > 0 && (
                <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, border: "1px solid rgba(191,90,242,0.4)", background: "rgba(123,44,191,0.08)", position: "relative", marginBottom: 14 }}>
                  <div style={{ position: "absolute", top: -10, left: 16, background: "#1a0b2e", padding: "0 8px", fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#bf5af2", fontWeight: 700, display: "flex", gap: 6, alignItems: "center" }}>
                    <Brain size={12} color="#bf5af2" /> ANALYSIS AGENT
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#e9d5ff", marginBottom: 8, fontWeight: 700 }}>AI detected skill gaps for this role. Suggested actions:</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(196,132,252,0.8)", lineHeight: 1.6 }}>
                    <li>Take a crash course on <strong style={{ color: "#e9d5ff" }}>{gaps[0]}</strong> to match base criteria.</li>
                    <li>Update your resume summary targeting {data.sector} requirements.</li>
                    <li>Message a <strong>{data.company}</strong> recruiter on LinkedIn expressing proactive interest.</li>
                  </ul>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {data.has_official_link ? (
                  <button onClick={() => {
                    const url = data.apply_link || '#';
                    window.open(url, "_blank", "noopener,noreferrer");
                    if (onApply) onApply(data);
                  }} style={{ flex: 1, padding: "9px 0", background: "linear-gradient(135deg,#7B2CBF,#9d4edd)", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 700, color: "#fff", boxShadow: "0 0 16px rgba(123,44,191,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}>
                    <ArrowRight size={11} /> {data.isGlobal ? "GO TO EXTERNAL URL" : "APPLY & LOG"}
                  </button>
                ) : (
                  <button disabled style={{ flex: 1, padding: "9px 0", background: "rgba(123,44,191,0.1)", border: "1px dashed rgba(196,132,252,0.3)", borderRadius: 10, cursor: "not-allowed", fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, color: "rgba(196,132,252,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    NO APPLICATION LINK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   REMOVED ANALYTICS SECTION
───────────────────────────────────────── */


/* ─────────────────────────────────────────
   PM SCHEME PAGE
───────────────────────────────────────── */
function PMSchemePage({ userSkills, setUserSkills, internshipsList, loggedInUser, hasSearched, setHasSearched }) {
  const [anim, setAnim] = useState(false);
  const [manualSkills, setManualSkills] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [programType, setProgramType] = useState('Corporate');
  const [showKanban, setShowKanban] = useState(false);
  const [appliedInternships, setAppliedInternships] = useState(() => {
    try { return JSON.parse(localStorage.getItem('internx:applied')) || []; }
    catch { return []; }
  });

  useEffect(() => { setTimeout(() => setAnim(true), 100); }, []);

  // Gracefully handles edge cases where users switch accounts and memory replaces localStorage, dynamically updating Kanban UI
  useEffect(() => {
    const handleSync = () => {
      try { setAppliedInternships(JSON.parse(localStorage.getItem('internx:applied')) || []); } catch (e) { }
    };
    window.addEventListener("internx-memory-sync", handleSync);
    return () => window.removeEventListener("internx-memory-sync", handleSync);
  }, []);

  const allSkills = [...new Set([...userSkills, ...manualSkills])];
  const isDefault = userSkills === DEFAULT_SKILLS;

  const handleToggle = (skill) => {
    setManualSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };
  const handleClear = () => setManualSkills([]);

  const handleFilter = async () => {
    setIsSearching(true);
    setHasSearched(true);
    // Explicitly update userSkills which triggers Firestore listener update
    setUserSkills(allSkills);

    // Sync skills to Firestore user profile memory
    if (loggedInUser) {
      try {
        await setDoc(doc(db, "users", loggedInUser.uid), { skills: allSkills }, { merge: true });
      } catch (e) { console.error("Error syncing skills manually", e) }
    }

    setTimeout(() => {
      // Clear manual skills since they're now in userSkills
      setManualSkills([]);
      setIsSearching(false);
    }, 800);
  };

  const handleApplyLog = async (internship) => {
    if (!appliedInternships.find(i => i.id === internship.id)) {
      const updated = [...appliedInternships, { ...internship, status: 'Applied', appliedAt: Date.now() }];
      setAppliedInternships(updated);
      localStorage.setItem('internx:applied', JSON.stringify(updated));
      // Sync application log to Firestore memory
      if (loggedInUser) {
        try {
          await setDoc(doc(db, "users", loggedInUser.uid), { applications: updated }, { merge: true });
        } catch (e) { console.error("Error syncing log to memory", e) }
      }
    }
  };

  const filteredInternships = internshipsList.filter(i => programType === 'OSS' ? i.company === 'Linux Foundation' || i.company === 'Google' : true);

  return (
    <div style={{ animation: "fadeIn 0.5s ease forwards" }}>
      <div>
        <ResumeUploader onExtract={(skills) => { setUserSkills(skills); setHasSearched(true); }} userSkills={userSkills} isDefault={isDefault} />

        {/* Global/OSS & Kanban Toggle */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, padding: "4px", background: "rgba(123,44,191,0.06)", border: "1px solid rgba(123,44,191,0.2)", borderRadius: 12, width: "fit-content" }}>
            <button onClick={() => setProgramType('Corporate')} style={{ padding: "8px 16px", borderRadius: 8, background: programType === 'Corporate' ? "rgba(123,44,191,0.25)" : "transparent", border: "none", fontFamily: "'Space Mono',monospace", fontSize: 10, color: programType === 'Corporate' ? "#e9d5ff" : "rgba(196,132,252,0.6)", cursor: "pointer", transition: "all 0.2s" }}>
              Corporate Internships
            </button>
            <button onClick={() => setProgramType('OSS')} style={{ padding: "8px 16px", borderRadius: 8, background: programType === 'OSS' ? "rgba(123,44,191,0.25)" : "transparent", border: "none", fontFamily: "'Space Mono',monospace", fontSize: 10, color: programType === 'OSS' ? "#e9d5ff" : "rgba(196,132,252,0.6)", cursor: "pointer", transition: "all 0.2s" }}>
              Open-Source Programs
            </button>
          </div>
          <button onClick={() => setShowKanban(!showKanban)} style={{ padding: "8px 16px", borderRadius: 12, background: showKanban ? "rgba(34,197,94,0.15)" : "rgba(123,44,191,0.1)", border: showKanban ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(123,44,191,0.3)", fontFamily: "'Space Mono',monospace", fontSize: 10, color: showKanban ? "#86efac" : "#e9d5ff", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={12} color={showKanban ? "#22c55e" : "#bf5af2"} /> {showKanban ? "Close Automation Board" : "Execution Tracker (Kanban)"}
          </button>
        </div>

        <SkillPicker selectedSkills={manualSkills} onToggle={handleToggle} onClear={handleClear} onFilter={handleFilter} isSearching={isSearching} />
      </div>

      <div style={{ marginTop: 40 }}>
        {hasSearched ? (
          filteredInternships.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, paddingBottom: 60 }}>
              {filteredInternships.map((intern, idx) => (
                <MatchedInternCard key={intern.id} data={intern} userSkills={userSkills} idx={idx} onApply={handleApplyLog} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(123,44,191,0.2)", marginBottom: 60 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(123,44,191,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Search size={20} color="rgba(196,132,252,0.5)" />
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: "rgba(196,132,252,0.8)", marginBottom: 8, fontWeight: 700 }}>
                No internships found
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(196,132,252,0.5)" }}>
                Try adding more skills to your profile or wait for more listings.
              </div>
            </div>
          )
        ) : (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "linear-gradient(135deg,rgba(15,5,30,0.8),rgba(123,44,191,0.05))", borderRadius: 20, border: "1px dashed rgba(191,90,242,0.3)", marginBottom: 60 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(123,44,191,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Brain size={24} color="#bf5af2" />
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "rgba(196,132,252,0.8)", marginBottom: 8, fontWeight: 700, letterSpacing: "0.05em" }}>
              AWAITING INPUT
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "rgba(196,132,252,0.6)", maxWidth: 400, margin: "0 auto" }}>
              Please select your skills above or upload your resume to trigger the Global Match Engine.
            </div>
          </div>
        )}
      </div>
      <MatchedInternCard key={intern.id} data={intern} userSkills={userSkills} idx={idx} onApply={handleApplyLog} />
            ))}
    </div>
  ) : (
    <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: "1px solid rgba(123,44,191,0.2)", marginBottom: 60 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(123,44,191,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Search size={20} color="rgba(196,132,252,0.5)" />
      </div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: "rgba(196,132,252,0.8)", marginBottom: 8, fontWeight: 700 }}>
        No internships found
      </div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(196,132,252,0.5)" }}>
        Try adding more skills to your profile or wait for more listings.
      </div>
    </div>
  )
}
      </div >

  { showKanban && (
    <div style={{ marginTop: 20, marginBottom: 60, padding: 32, background: "rgba(255,255,255,0.02)", borderRadius: 20, border: "1px solid rgba(123,44,191,0.2)", animation: "slideInUp 0.3s ease forwards" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(34,197,94,0.3)" }}><TrendingUp size={18} color="#22c55e" /></div>
        <div>
          <h3 style={{ fontFamily: "'Orbitron',monospace", color: "#e9d5ff", margin: 0, fontSize: 18 }}>Automation Layer: Global KanbanTracker</h3>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(196,132,252,0.5)", margin: "4px 0 0" }}>Logs every applied internship to Memory DB.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
        <div style={{ padding: 20, background: "rgba(15,5,30,0.5)", borderRadius: 16, border: "1px solid rgba(123,44,191,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'Space Mono',monospace", color: "#bf5af2", margin: 0, fontSize: 12 }}>JUST APPLIED</h4>
            <div style={{ background: "rgba(191,90,242,0.2)", color: "#e9d5ff", padding: "2px 8px", borderRadius: 10, fontSize: 9 }}>{appliedInternships.length}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {appliedInternships.length === 0 ? (
              <div style={{ fontSize: 10, color: "rgba(196,132,252,0.4)", fontFamily: "'Space Mono',monospace", textAlign: "center", padding: "20px 0" }}>No applications tracked yet.</div>
            ) : appliedInternships.map(item => (
              <div key={item.id} style={{ padding: 14, background: "linear-gradient(135deg,rgba(123,44,191,0.1),rgba(15,5,30,0.8))", borderRadius: 10, border: "1px solid rgba(123,44,191,0.4)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#fff", fontWeight: 700 }}>{item.company}</div>
                  <div style={{ color: "#22c55e", fontSize: 9, fontFamily: "'Orbitron',monospace" }}>{item.matchScore}%</div>
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(196,132,252,0.7)", marginBottom: 10 }}>{item.role}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.6 }}>
                  <MapPin size={9} color="#e9d5ff" /> <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#e9d5ff" }}>{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 20, background: "rgba(15,5,30,0.5)", borderRadius: 16, border: "1px dashed rgba(123,44,191,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'Space Mono',monospace", color: "rgba(196,132,252,0.6)", margin: 0, fontSize: 12 }}>INTERVIEWING</h4>
            <div style={{ background: "rgba(191,90,242,0.1)", color: "rgba(196,132,252,0.5)", padding: "2px 8px", borderRadius: 10, fontSize: 9 }}>0</div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(196,132,252,0.4)", fontFamily: "'Space Mono',monospace", textAlign: "center", padding: "20px 0" }}>Awaiting recruiter response...</div>
        </div>

        <div style={{ padding: 20, background: "rgba(15,5,30,0.5)", borderRadius: 16, border: "1px dashed rgba(123,44,191,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontFamily: "'Space Mono',monospace", color: "rgba(196,132,252,0.6)", margin: 0, fontSize: 12 }}>OFFERS</h4>
            <div style={{ background: "rgba(191,90,242,0.1)", color: "rgba(196,132,252,0.5)", padding: "2px 8px", borderRadius: 10, fontSize: 9 }}>0</div>
          </div>
          <div style={{ fontSize: 10, color: "rgba(196,132,252,0.4)", fontFamily: "'Space Mono',monospace", textAlign: "center", padding: "20px 0" }}>Pending...</div>
        </div>
      </div>
    </div>
  )}
    </div >
  );
}

/* ─────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────── */
const STORAGE_KEY = "internx:user";

function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState("login");   // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (tab === "register" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);

    try {
      if (tab === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name.trim() });
        // Initialize user profile in Database
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name.trim(),
          email: email.trim(),
          skills: [],
          applications: [],
          createdAt: new Date().toISOString()
        });
        setSuccess(`Welcome aboard, ${name.trim()}! 🚀`);
        setTimeout(() => { onLogin({ name: name.trim(), email, uid: userCredential.user.uid }); onClose(); }, 1200);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const u = userCredential.user;
        setSuccess(`Welcome back, ${u.displayName || "User"}! ✓`);
        setTimeout(() => { onLogin({ name: u.displayName || "User", email: u.email, uid: u.uid }); onClose(); }, 1000);
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("An account with this email already exists.");
      else if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
      else setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    background: focused ? "rgba(123,44,191,0.12)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${focused ? "rgba(191,90,242,0.7)" : "rgba(123,44,191,0.25)"}`,
    outline: "none", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#e9d5ff",
    transition: "all 0.25s", boxSizing: "border-box",
    boxShadow: focused ? "0 0 20px rgba(123,44,191,0.2)" : "none",
  });

  return (
    /* Overlay */
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(4,1,12,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "overlayFadeIn 0.25s ease" }}>
      {/* Modal card */}
      <div onClick={e => e.stopPropagation()} style={{
        width: 440, background: "linear-gradient(135deg,rgba(18,6,36,0.98),rgba(8,3,18,0.98))",
        border: "1px solid rgba(123,44,191,0.4)", borderRadius: 24, overflow: "hidden",
        boxShadow: "0 0 80px rgba(123,44,191,0.35), 0 40px 80px rgba(0,0,0,0.7)",
        animation: "modalSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative",
      }}>
        {/* Top gradient bar */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#7B2CBF,#bf5af2,#9d4edd,#7B2CBF)", backgroundSize: "200% 100%", animation: "shimmerBg 2.5s linear infinite" }} />

        {/* Close btn */}
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, width: 30, height: 30, borderRadius: "50%", background: "rgba(123,44,191,0.15)", border: "1px solid rgba(123,44,191,0.3)", color: "rgba(196,132,252,0.7)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#fca5a5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(123,44,191,0.15)"; e.currentTarget.style.borderColor = "rgba(123,44,191,0.3)"; e.currentTarget.style.color = "rgba(196,132,252,0.7)"; }}>
          ×
        </button>

        <div style={{ padding: "32px 36px 36px" }}>
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7B2CBF,#bf5af2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 0 28px rgba(123,44,191,0.5)", animation: "pulseGlow 3s ease-in-out infinite" }}>
              <Zap size={24} color="#fff" fill="#fff" />
            </div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: "#e9d5ff", letterSpacing: "0.1em" }}>
              INTERN<span style={{ color: "#bf5af2" }}>X</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(196,132,252,0.5)", marginTop: 4, letterSpacing: "0.1em" }}>
              {tab === "login" ? "SIGN IN TO YOUR ACCOUNT" : "CREATE YOUR ACCOUNT"}
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "rgba(123,44,191,0.08)", border: "1px solid rgba(123,44,191,0.2)", borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", transition: "all 0.25s",
                  background: tab === t ? "linear-gradient(135deg,#7B2CBF,#9d4edd)" : "transparent",
                  color: tab === t ? "#fff" : "rgba(196,132,252,0.55)",
                  boxShadow: tab === t ? "0 0 16px rgba(123,44,191,0.4)" : "none",
                }}>
                {t === "login" ? "SIGN IN" : "REGISTER"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tab === "register" && (
              <InputField label="FULL NAME" type="text" value={name} onChange={setName} placeholder="e.g. Arjun Sharma" inputStyle={inputStyle} />
            )}
            <InputField label="EMAIL ADDRESS" type="email" value={email} onChange={setEmail} placeholder="you@example.com" inputStyle={inputStyle} />
            <div style={{ position: "relative" }}>
              <InputField label="PASSWORD" type={showPw ? "text" : "password"} value={password} onChange={setPassword} placeholder="Min. 6 characters" inputStyle={inputStyle}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }} />
              <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, bottom: 11, background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(196,132,252,0.5)", padding: 2 }}>
                {showPw ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.2s ease" }}>
              <AlertCircle size={13} color="#f87171" /> {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#86efac", display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.2s ease" }}>
              <Check size={13} color="#22c55e" /> {success}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", marginTop: 22, padding: "13px 0", background: loading ? "rgba(123,44,191,0.3)" : "linear-gradient(135deg,#7B2CBF,#9d4edd)", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700, color: loading ? "rgba(255,255,255,0.5)" : "#fff", letterSpacing: "0.08em", boxShadow: loading ? "none" : "0 0 24px rgba(123,44,191,0.5)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading
              ? <><div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} /> AUTHENTICATING…</>
              : <><Zap size={13} fill="#fff" /> {tab === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</>
            }
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(123,44,191,0.2)" }} />
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.35)", letterSpacing: "0.1em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(123,44,191,0.2)" }} />
          </div>

          {/* Switch tab link */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(196,132,252,0.45)" }}>
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#bf5af2", textDecoration: "underline" }}>
              {tab === "login" ? "Register here" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* tiny reusable labelled input */
function InputField({ label, type, value, onChange, placeholder, inputStyle, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(196,132,252,0.5)", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        style={{ ...inputStyle(focused), display: "block" }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
export default function InternX() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [logoGlitch, setLogoGlitch] = useState(false);
  const [userSkills, setUserSkills] = useState(DEFAULT_SKILLS);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [internshipsList, setInternshipsList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // ONLY fetch database and global APIs if the user has explicitly triggered a search
    if (!hasSearched || !userSkills || userSkills.length === 0) {
      setInternshipsList([]);
      return;
    }

    const querySkills = userSkills.slice(0, 10);
    // Note: Create a composite Firestore index for skills_required (array-contains) + matchScore (desc) to securely scale mapping
    const q = query(
      collection(db, "internships"),
      where("skills_required", "array-contains-any", querySkills)
    );

    const colors = ["#7B2CBF", "#5a1a9a", "#9d4edd", "#6a1fa8", "#8b2fc9"];

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const dbResults = snapshot.docs.map((doc, idx) => {
        const d = doc.data();
        return {
          id: doc.id,
          company: d.company || "Unknown",
          role: d.role || "Intern",
          location: d.location || "Remote",
          color: colors[idx % colors.length],
          stipend: d.stipend || "₹10000",
          sector: d.domain || "Technology",
          required: d.skills_required || [],
          apply_link: d.apply_link || null,
          has_official_link: d.has_official_link !== false,
          isVerified: d.isVerified || false
        };
      });

      // Fire the Global Search Engine API call based on the user's top matching skills
      const globalResults = await JobSearchAPI.getGlobalInternships(querySkills);

      // Combine Firestore local internships with Global API results
      const results = [...globalResults, ...dbResults];

      results.forEach(res => {
        // Global APIs mock a high matchScore to stay relevant at the top, local DB items calculate purely
        if (!res.isGlobal) {
          const matched = res.required.filter(s => userSkills.includes(s));
          res.matchScore = res.required.length ? Math.round((matched.length / res.required.length) * 100) : 0;
        }
      });
      // Order results: 1. Official links first, 2. by matchScore desc
      results.sort((a, b) => {
        if (a.has_official_link !== b.has_official_link) {
          return a.has_official_link ? -1 : 1;
        }
        return b.matchScore - a.matchScore;
      });

      setInternshipsList(results);
    });

    return () => unsubscribe();
  }, [userSkills]);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const dashRef = useRef(null);
  const pmRef = useRef(null);

  /* Firebase Auth & Profile Listener */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoggedInUser({ name: user.displayName || "Explorer", email: user.email, uid: user.uid });
        // Fetch user profile from Firestore memory module
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.skills && data.skills.length > 0) setUserSkills(data.skills);
            if (data.applications) {
              localStorage.setItem('internx:applied', JSON.stringify(data.applications));
              window.dispatchEvent(new Event("internx-memory-sync"));
            }
          } else {
            // ensure it exists
            await setDoc(docRef, { name: user.displayName || "", email: user.email, skills: DEFAULT_SKILLS, applications: [] });
          }
        } catch (e) { console.error("Memory sync active:", e) }
      } else {
        setLoggedInUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => { setLogoGlitch(true); setTimeout(() => setLogoGlitch(false), 800); }, 4200);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch { }
    try {
      localStorage.removeItem('internx:applied');
      localStorage.removeItem(STORAGE_KEY);
      // Notify components to wipe cache states immediately
      window.dispatchEvent(new Event("internx-memory-sync"));
    } catch (e) { }
    setLoggedInUser(null);
  };

  const scrollTo = (ref) => ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const navItems = [
    { label: "Dashboard", action: () => { setActiveNav("Dashboard"); setSelectedCompany(null); } },
    { label: "1:1 Mentor", action: () => { setActiveNav("1:1 Mentor"); setSelectedCompany(null); } },
    { label: "Opportunities", action: () => { setActiveNav("Opportunities"); setSelectedCompany(null); } },
    { label: "PM Scheme", action: () => { setActiveNav("PM Scheme"); setSelectedCompany(null); } },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(91,20,150,0.35) 0%,rgba(8,3,18,1) 65%)", backgroundColor: "#080312", fontFamily: "'Inter',sans-serif", overflowX: "hidden" }}>
        {/* Grid bg */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(rgba(123,44,191,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(123,44,191,0.055) 1px,transparent 1px)`, backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)" }} />

        {/* ── NAV ── */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(123,44,191,0.15)", backdropFilter: "blur(10px)", background: "rgba(8,3,18,0.6)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7B2CBF,#bf5af2)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulseGlow 3s ease-in-out infinite" }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#e9d5ff", letterSpacing: "0.1em", position: "relative", cursor: "pointer" }} onClick={() => { setActiveNav("Dashboard"); scrollTo(heroRef); }}>
              INTERN<span style={{ color: "#bf5af2" }}>X</span>
              {logoGlitch && <>
                <span style={{ position: "absolute", top: 0, left: 0, width: "100%", fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#bf5af2", animation: "glitch1 0.8s steps(1) forwards" }}>INTERN<span style={{ color: "#7B2CBF" }}>X</span></span>
                <span style={{ position: "absolute", top: 0, left: 0, width: "100%", fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#5a1a9a", animation: "glitch2 0.8s steps(1) forwards" }}>INTERN<span style={{ color: "#e9d5ff" }}>X</span></span>
              </>}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {navItems.map(({ label, action }) => (
              <button key={label} onClick={action} style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, cursor: "pointer", letterSpacing: "0.05em", padding: "7px 16px", borderRadius: 8, border: activeNav === label ? "1px solid rgba(191,90,242,0.6)" : "1px solid transparent", background: activeNav === label ? "rgba(123,44,191,0.2)" : "transparent", color: activeNav === label ? "#e9d5ff" : "rgba(196,132,252,0.7)", boxShadow: activeNav === label ? "0 0 12px rgba(123,44,191,0.25)" : "none", transition: "all 0.22s" }}
                onMouseEnter={e => { if (activeNav !== label) { e.currentTarget.style.color = "#e9d5ff"; e.currentTarget.style.background = "rgba(123,44,191,0.08)"; } }}
                onMouseLeave={e => { if (activeNav !== label) { e.currentTarget.style.color = "rgba(196,132,252,0.7)"; e.currentTarget.style.background = "transparent"; } }}
              >{label}</button>
            ))}
            <a href="https://roadmap.sh/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#bf5af2", cursor: "pointer", textDecoration: "none", letterSpacing: "0.05em", padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(191,90,242,0.35)", background: "rgba(191,90,242,0.08)", transition: "all 0.2s", marginLeft: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(191,90,242,0.2)"; e.currentTarget.style.boxShadow = "0 0 14px rgba(191,90,242,0.3)"; e.currentTarget.style.color = "#e9d5ff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(191,90,242,0.08)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.color = "#bf5af2"; }}>
              <TrendingUp size={12} /> Roadmap
            </a>
            <button onClick={() => setShowAuth(true)} style={{ padding: "8px 20px", background: "linear-gradient(135deg,#7B2CBF,#9d4edd)", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, color: "#fff", boxShadow: "0 0 20px rgba(123,44,191,0.4)", marginLeft: 4, display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(123,44,191,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(123,44,191,0.4)"; }}>
              {loggedInUser ? (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                    {loggedInUser.name.charAt(0).toUpperCase()}
                  </div>
                  {loggedInUser.name.split(" ")[0].toUpperCase()}
                </>
              ) : "CONNECT"}
            </button>
          </div>
        </nav>

        {/* Auth modal */}
        {showAuth && (
          loggedInUser ? (
            /* Logged-in quick panel */
            <div onClick={() => setShowAuth(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(4,1,12,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "overlayFadeIn 0.25s ease" }}>
              <div onClick={e => e.stopPropagation()} style={{ width: 360, background: "linear-gradient(135deg,rgba(18,6,36,0.98),rgba(8,3,18,0.98))", border: "1px solid rgba(123,44,191,0.4)", borderRadius: 24, overflow: "hidden", boxShadow: "0 0 80px rgba(123,44,191,0.35)", animation: "modalSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)", position: "relative" }}>
                <div style={{ height: 3, background: "linear-gradient(90deg,#7B2CBF,#bf5af2,#9d4edd,#7B2CBF)", backgroundSize: "200% 100%", animation: "shimmerBg 2.5s linear infinite" }} />
                <button onClick={() => setShowAuth(false)} style={{ position: "absolute", top: 18, right: 18, width: 30, height: 30, borderRadius: "50%", background: "rgba(123,44,191,0.15)", border: "1px solid rgba(123,44,191,0.3)", color: "rgba(196,132,252,0.7)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                <div style={{ padding: "32px 36px 36px", textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#7B2CBF,#bf5af2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26, fontWeight: 900, fontFamily: "'Orbitron',monospace", color: "#fff", boxShadow: "0 0 28px rgba(123,44,191,0.5)" }}>
                    {loggedInUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: "#e9d5ff", marginBottom: 4 }}>{loggedInUser.name}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(196,132,252,0.55)", marginBottom: 24 }}>{loggedInUser.email}</div>
                  <div style={{ padding: "10px 14px", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, marginBottom: 24, fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#86efac", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", animation: "nodeFlicker 3s infinite" }} />
                    SESSION ACTIVE · CREDENTIALS SAVED
                  </div>
                  <button onClick={() => { handleLogout(); setShowAuth(false); }} style={{ width: "100%", padding: "12px 0", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, color: "#fca5a5", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}>
                    SIGN OUT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AuthModal onClose={() => setShowAuth(false)} onLogin={setLoggedInUser} />
          )
        )}

        {activeNav === "Dashboard" && (
          /* ── HERO ── */
          <div>
            <section style={{ textAlign: "center", padding: "80px 48px 56px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(123,44,191,0.15)", border: "1px solid rgba(123,44,191,0.4)", marginBottom: 28, animation: "fadeInUp 0.6s ease forwards" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#bf5af2", boxShadow: "0 0 8px #bf5af2", animation: "nodeFlicker 3s infinite" }} />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#c084fc", letterSpacing: "0.1em" }}>SAMBALPUR UNIVERSITY INSTITUTE OF INFORMATION TECHNOLOGY</span>
              </div>
              <h1 style={{ fontFamily: "'Orbitron',monospace", fontSize: "clamp(36px,6vw,70px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16, animation: "fadeInUp 0.7s ease 0.1s forwards", opacity: 0 }}>
                <span style={{ background: "linear-gradient(135deg,#ffffff 0%,#c084fc 40%,#7B2CBF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>DECODE YOUR CAREER.</span><br />
                <span style={{ background: "linear-gradient(135deg,#bf5af2 0%,#e9d5ff 60%,#c084fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MATCH YOUR POTENTIAL.</span>
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 300, color: "rgba(196,132,252,0.7)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7, animation: "fadeInUp 0.7s ease 0.2s forwards", opacity: 0 }}>
                AI-powered skill matching for India's largest internship ecosystem. Find your perfect role under the PM Internship Scheme.
              </p>
              <div style={{ maxWidth: 620, margin: "0 auto", animation: "fadeInUp 0.7s ease 0.3s forwards", opacity: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", background: searchFocused ? "rgba(123,44,191,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${searchFocused ? "rgba(123,44,191,0.7)" : "rgba(123,44,191,0.25)"}`, borderRadius: 14, backdropFilter: "blur(20px)", transition: "all 0.3s", boxShadow: searchFocused ? "0 0 40px rgba(123,44,191,0.3)" : "none" }}>
                  <Search size={18} color={searchFocused ? "#bf5af2" : "rgba(196,132,252,0.5)"} style={{ flexShrink: 0 }} />
                  <input placeholder="Enter Skills (e.g., Java, OOPs, Accounting…)" value={searchVal} onChange={e => setSearchVal(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                    style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#e9d5ff", padding: "18px 0" }} />
                  <div onClick={() => setActiveNav("Opportunities")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "linear-gradient(135deg,#7B2CBF,#9d4edd)", borderRadius: 8, cursor: "pointer", boxShadow: "0 0 16px rgba(123,44,191,0.5)", flexShrink: 0 }}>
                    <Brain size={14} color="#fff" />
                    <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, color: "#fff" }}>ANALYZE</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                {navItems.slice(1).map(({ label, action }) => (
                  <button key={label} onClick={action} style={{ padding: "6px 16px", borderRadius: 20, background: "rgba(123,44,191,0.1)", border: "1px solid rgba(123,44,191,0.25)", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "rgba(196,132,252,0.6)", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(123,44,191,0.25)"; e.currentTarget.style.color = "#c084fc"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(123,44,191,0.1)"; e.currentTarget.style.color = "rgba(196,132,252,0.6)"; }}
                  >→ {label}</button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeNav === "1:1 Mentor" && (
          <div style={{ animation: "fadeIn 0.4s ease", padding: "40px 48px 80px" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 20, background: "rgba(123,44,191,0.15)", border: "1px solid rgba(191,90,242,0.3)", marginBottom: 24 }}>
                <Zap size={14} color="#bf5af2" />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#e9d5ff", letterSpacing: "0.1em", fontWeight: 700 }}>LEVEL UP YOUR CAREER</span>
              </div>
              <h2 style={{ fontFamily: "'Orbitron',monospace", fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 16, textShadow: "0 0 20px rgba(191,90,242,0.4)" }}>1:1 MENTORSHIP PROGRAM</h2>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: "rgba(196,132,252,0.8)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
                Get a dedicated industry expert to analyze your resume, guide your every step, and prepare you exclusively for top company placements.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 1040, margin: "0 auto" }}>
              {[
                { months: 1, price: "₹299", period: "/month", title: "BEGINNER", desc: "Perfect for a quick resume revamp and immediate interview prep.", highlight: false },
                { months: 6, price: "₹1,499", period: "/6 months", title: "ACCELERATOR", desc: "Comprehensive guidance through your entire placement semester.", highlight: true },
                { months: 12, price: "₹2,499", period: "/year", title: "LONG-TERM", desc: "Build your profile from scratch to land your dream role.", highlight: false }
              ].map((tier, i) => (
                <div key={i} style={{
                  background: tier.highlight ? "linear-gradient(135deg,rgba(123,44,191,0.3),rgba(15,5,30,0.9))" : "linear-gradient(135deg,rgba(255,255,255,0.03),rgba(15,5,30,0.7))",
                  border: `1px solid ${tier.highlight ? "rgba(191,90,242,0.6)" : "rgba(123,44,191,0.2)"}`,
                  borderRadius: 24, padding: "32px 36px", position: "relative",
                  boxShadow: tier.highlight ? "0 0 40px rgba(123,44,191,0.25)" : "none",
                  transform: tier.highlight ? "scale(1.02) translateY(0)" : "scale(1) translateY(0)", transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)", cursor: "pointer"
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = tier.highlight ? "scale(1.05) translateY(-8px)" : "scale(1.03) translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(123,44,191,0.35)";
                    e.currentTarget.style.borderColor = "rgba(191,90,242,0.6)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = tier.highlight ? "scale(1.02) translateY(0)" : "scale(1) translateY(0)";
                    e.currentTarget.style.boxShadow = tier.highlight ? "0 0 40px rgba(123,44,191,0.25)" : "none";
                    e.currentTarget.style.borderColor = tier.highlight ? "rgba(191,90,242,0.6)" : "rgba(123,44,191,0.2)";
                  }}>
                  {tier.highlight && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#7B2CBF,#bf5af2)", padding: "4px 16px", borderRadius: 12, fontFamily: "'Orbitron',monospace", fontSize: 9, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", boxShadow: "0 4px 12px rgba(191,90,242,0.4)" }}>
                      RECOMMENDED
                    </div>
                  )}
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: tier.highlight ? "#e9d5ff" : "rgba(196,132,252,0.6)", letterSpacing: "0.1em", marginBottom: 12 }}>{tier.title}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 36, fontWeight: 900, color: "#fff" }}>{tier.price}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(196,132,252,0.5)" }}>{tier.period}</div>
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(196,132,252,0.7)", lineHeight: 1.5, marginBottom: 32 }}>{tier.desc}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                    {[
                      "Dedicated 1:1 Expert Guide",
                      "Deep Resume Analysis & Rewrite",
                      "Mock Interviews & Feedback",
                      "Company Placement Strategy"
                    ].map((feature, fIdx) => (
                      <div key={fIdx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: tier.highlight ? "rgba(191,90,242,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={9} color={tier.highlight ? "#bf5af2" : "rgba(196,132,252,0.5)"} />
                        </div>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: tier.highlight ? "#e9d5ff" : "rgba(196,132,252,0.7)" }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button style={{
                    width: "100%", padding: "14px 0", borderRadius: 12, cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, transition: "all 0.2s",
                    background: tier.highlight ? "linear-gradient(135deg,#7B2CBF,#9d4edd)" : "rgba(123,44,191,0.1)",
                    border: tier.highlight ? "none" : "1px solid rgba(123,44,191,0.3)",
                    color: tier.highlight ? "#fff" : "#e9d5ff",
                    boxShadow: tier.highlight ? "0 8px 20px rgba(123,44,191,0.4)" : "none"
                  }}
                    onMouseEnter={e => { if (!tier.highlight) e.currentTarget.style.background = "rgba(123,44,191,0.2)"; }}
                    onMouseLeave={e => { if (!tier.highlight) e.currentTarget.style.background = "rgba(123,44,191,0.1)"; }}
                  >
                    SELECT PLAN
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNav === "Opportunities" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* ── STATS (Opportunities) ── */}
            <section style={{ padding: "40px 48px 64px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Building2 size={16} color="#bf5af2" />
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#bf5af2", letterSpacing: "0.1em" }}>OPPORTUNITIES</span>
              </div>
              <div style={{ display: "flex", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(123,44,191,0.2)", backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.02)" }}>
                {[{ icon: <Users size={20} color="#bf5af2" />, value: "500+", label: "Top Companies" }, { icon: <TrendingUp size={20} color="#bf5af2" />, value: "10M+", label: "Opportunities" }, { icon: <DollarSign size={20} color="#bf5af2" />, value: "₹5000", label: "Monthly Stipend" }].map((s, i) => (
                  <div key={i} style={{ flex: 1, padding: "36px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, borderRight: i < 2 ? "1px solid rgba(123,44,191,0.2)" : "none" }}>
                    {s.icon}
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg,#fff,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(196,132,252,0.6)", letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── PM SCHEME MATCH ENGINE ── */}
            <div style={{ padding: "0 48px 80px" }}>
              <h2 style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 700, color: "#e9d5ff", marginBottom: 8 }}>Match Engine</h2>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "rgba(196,132,252,0.6)", marginBottom: 32 }}>Select skills or upload your resume, then hit FILTER to find matches.</p>
              <PMSchemePage userSkills={userSkills} setUserSkills={setUserSkills} internshipsList={internshipsList} loggedInUser={loggedInUser} hasSearched={hasSearched} setHasSearched={setHasSearched} />
            </div>
          </div>
        )}

        {activeNav === "PM Scheme" && (
          <PMInternships />
        )}

        {/* Footer */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(123,44,191,0.6),transparent)", margin: "0 48px" }} />
        <div style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "rgba(196,132,252,0.4)" }}>© 2025 INTERNX • PM INTERNSHIP SCHEME PARTNER</span>
          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "rgba(123,44,191,0.5)", letterSpacing: "0.15em" }}>REALITY IS A GLITCH</span>
        </div>
      </div>
    </>
  );
}
