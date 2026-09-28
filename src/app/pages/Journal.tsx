import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, BookOpen, Send, Sparkles, Home, Menu, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import journalimg from "../../images/journal.jpg";

export function Journal() {
  const navigate = useNavigate();
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAdvice, setActiveAdvice] = useState<string>("");
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchEntries();
    const closeAll = () => setShowMenu(false);
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/journals?email=${localStorage.getItem("userEmail")}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (journalText.length < 5) return;
    const res = await fetch("http://localhost:5000/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: journalText, email: localStorage.getItem("userEmail") }),
    });
    const data = await res.json();
    setEntries([data, ...entries]);
    setActiveAdvice(data.advice); // Show new random advice
    setIsModalOpen(true);
    setJournalText("");
  };

  // Function to show advice for an OLD entry
  const openEntryAdvice = (entry: any) => {
    setActiveAdvice(entry.advice || "Your reflection is a step toward wellness.");
    setIsModalOpen(true);
  };

  const handleRightClick = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setSelectedId(id);
    setShowMenu(true);
  };

  const deleteEntry = async () => {
    if (!selectedId) return;
    await fetch(`http://localhost:5000/api/journals/${selectedId}`, { method: "DELETE" });
    setEntries(entries.filter(e => e.id !== selectedId));
    setShowMenu(false);
  };

  // --- REAL-TIME STREAK LOGIC ---
  const calculateStreak = () => {
    if (entries.length === 0) return 0;

    // Extract unique dates and sort them newest to oldest
    const uniqueDates = Array.from(new Set(entries.map(e => {
        const d = new Date(e.date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))).sort((a, b) => b - a);

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentCheckDate = uniqueDates[0];
    
    // If the most recent entry isn't today or yesterday, streak is 0
    const oneDayInMs = 86400000;
    if (today.getTime() - currentCheckDate > oneDayInMs) {
        return 0;
    }

    streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        if (uniqueDates[i] - uniqueDates[i + 1] === oneDayInMs) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
  };

  const totalEntries = entries.length;
  const dayStreak = calculateStreak();
  const avgPos = totalEntries > 0 
    ? Math.round(entries.reduce((acc, curr) => acc + (curr.positivity || 0), 0) / totalEntries) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9]">
      
      {/* AI Advice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#1E293B]/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full border border-[#0D9488]/20 text-center">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center mb-6 mx-auto shadow-lg shadow-[#0D9488]/20"><Sparkles className="w-8 h-8 text-white" /></div>
              <h3 className="text-2xl font-bold text-[#1E293B] mb-4">Serenova AI Reflection</h3>
              <p className="text-[#475569] text-lg italic leading-relaxed mb-8">"{activeAdvice}"</p>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-bold hover:shadow-lg transition-all">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ top: menuPos.y, left: menuPos.x, position: 'fixed', zIndex: 1001 }} className="bg-white shadow-2xl rounded-xl border border-red-50 py-1 overflow-hidden">
            <button onClick={deleteEntry} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 text-sm font-bold transition-colors"><Trash2 className="w-4 h-4" /> Delete Entry</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/80 backdrop-blur-md border-b border-[#E0F2FE] sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center"><Brain className="w-6 h-6 text-white" /></div>
          <span className="text-xl font-semibold bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] bg-clip-text text-transparent">Serenova</span>
        </div>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-2 text-[#475569] hover:bg-[#F0F9FF] rounded-lg font-medium"><Home className="w-5 h-5" /> Dashboard</button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Wellness Journal</h1>
            <p className="text-lg text-[#475569]">Personalized AI feedback for your daily reflections</p>
          </motion.div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl h-64">
            <ImageWithFallback src={journalimg} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/40 to-[#2DD4BF]/40 flex items-center justify-center text-center text-white p-8">
              <div><BookOpen className="w-16 h-16 mx-auto mb-4" /><h2 className="text-3xl font-bold mb-2">Today's Entry</h2><p className="text-white/90">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Start writing your thoughts here..." rows={12} className="w-full p-6 rounded-2xl border-2 border-[#E0F2FE] focus:border-[#0D9488] focus:outline-none bg-white text-lg leading-relaxed shadow-inner mb-4 transition-all" />
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400 font-medium">{journalText.length} characters</div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={journalText.length < 5} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-semibold shadow-lg">
                <Send className="w-5 h-5" /> Get AI Feedback
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-[#0D9488]/10 text-center">
            <h3 className="font-semibold text-[#1E293B] mb-4">Journaling Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-[#0D9488]/10 to-[#2DD4BF]/10 rounded-2xl border border-[#0D9488]/20">
                <div className="text-3xl font-bold text-[#0D9488] mb-1">{dayStreak}</div>
                <div className="text-sm text-[#475569]">Day Streak</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#2DD4BF]/10 to-[#0891B2]/10 rounded-2xl border border-[#2DD4BF]/20">
                <div className="text-3xl font-bold text-[#2DD4BF] mb-1">{totalEntries}</div>
                <div className="text-sm text-[#475569]">Total Entries</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#0891B2]/10 to-[#0D9488]/10 rounded-2xl border border-[#0891B2]/20">
                <div className="text-3xl font-bold text-[#0891B2] mb-1">{avgPos}%</div>
                <div className="text-sm text-[#475569]">Avg Positivity</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg shadow-[#0D9488]/10">
            <ImageWithFallback src="https://images.unsplash.com/photo-1764428950465-51de19f3df69?q=80&w=1080" alt="Sidebar" className="w-full h-56 object-cover" />
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-[#0D9488]/10">
            <h3 className="font-semibold text-[#1E293B] mb-4">Previous Entries</h3>
            <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold italic">Right-click to delete</p>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {entries.map((entry) => (
                <button key={entry.id} onClick={() => openEntryAdvice(entry)} onContextMenu={(e) => handleRightClick(e, entry.id)} className="w-full text-left p-4 rounded-xl bg-white hover:bg-[#F0F9FF] border border-[#E0F2FE] hover:border-[#0D9488]/30 transition-all shadow-sm group">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs font-bold text-slate-400">{entry.date}</div>
                    <Sparkles className="w-3 h-3 text-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-sm text-[#475569] line-clamp-2 leading-relaxed">{entry.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}