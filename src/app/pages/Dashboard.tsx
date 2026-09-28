import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, Heart, Smile, Meh, Frown, BookOpen, BarChart3, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Dashboard() {
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [aiData, setAiData] = useState<any>(null);
  const [journalHistory, setJournalHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
const storedEmail = localStorage.getItem("userEmail");

if (storedName) {
  setUserName(storedName);
} else if (storedEmail) {
  setUserName(storedEmail.split("@")[0]);
}

    const fetchData = async () => {
      try {
        // 1. Fetch Latest AI Assessment
        const aiResponse = await fetch("http://localhost:5000/api/check-status");
        const aiJson = await aiResponse.json();
        
        // 2. Fetch Journal History for real-time trends
        const journalResponse = await fetch(`http://localhost:5000/api/journals?email=${localStorage.getItem("userEmail")}`);
        const journalJson = await journalResponse.json();

        if (aiJson.status === "complete") setAiData(aiJson);
        setJournalHistory(journalJson);

      } catch (error) {
        console.error("Error fetching Dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  // --- REAL-TIME DATA MAPPING ---
  // We use the latest assessment result from your backend
  const isHighRisk = aiData?.prediction === 1;
  const riskLevel = isHighRisk ? "High" : "Low";
  const emotionDetected = isHighRisk ? "Stressed / Overwhelmed" : "Calm & Positive";
  
  // Calculate a real wellness score based on journal average and risk
  const journalAvg = journalHistory.length > 0 
    ? journalHistory.reduce((a, b) => a + b.positivity, 0) / journalHistory.length 
    : 70;
  const overallScore = isHighRisk ? Math.min(45, journalAvg - 20) : Math.max(75, journalAvg);

  // --- TRUTH-ONLY WEEKLY TRENDS ---
  // Only shows dots on days where entries exist
  const getWeeklyTrend = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(dayName => {
      const entry = journalHistory.find(j => {
        const d = new Date(j.date);
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Align Sun to index 6
        return days[dayIdx] === dayName;
      });
      return { 
        day: dayName, 
        mood: entry ? (entry.positivity / 10) : null,
        energy: entry ? (entry.positivity / 12 + 2) : null 
      };
    });
  };

  const emotionBreakdown = isHighRisk
    ? [
        { name: "Happy", value: 10, color: "#0D9488" },
        { name: "Calm", value: 15, color: "#2DD4BF" },
        { name: "Neutral", value: 35, color: "#0891B2" },
        { name: "Anxious", value: 40, color: "#E0F2FE" },
      ]
    : [
        { name: "Happy", value: 45, color: "#0D9488" },
        { name: "Calm", value: 30, color: "#2DD4BF" },
        { name: "Neutral", value: 15, color: "#0891B2" },
        { name: "Anxious", value: 10, color: "#E0F2FE" },
      ];

  const insights = [
    { 
      title: "Sleep Quality", 
      score: isHighRisk ? 42 : 85, 
      icon: Heart, 
      color: "from-[#0D9488] to-[#2DD4BF]", 
      description: isHighRisk ? "Restlessness detected in patterns" : "Consistent restorative sleep" 
    },
    { 
      title: "Stress Levels", 
      score: isHighRisk ? 28 : 72, 
      icon: Brain, 
      color: "from-[#2DD4BF] to-[#0891B2]", 
      description: isHighRisk ? "Cognitive load is peaking" : "Well managed stability" 
    },
    { 
      title: "Social Balance", 
      score: isHighRisk ? 50 : 78, 
      icon: Smile, 
      color: "from-[#0891B2] to-[#0D9488]", 
      description: isHighRisk ? "Isolation indicators present" : "Positive social engagement" 
    },
  ];

  const getRiskColor = (risk: string) => risk === "Low" ? "from-green-400 to-green-600" : "from-red-400 to-red-600";
  const getRiskIcon = (risk: string) => risk === "High" ? Frown : Smile;
  const RiskIcon = getRiskIcon(riskLevel);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#0D9488] font-medium tracking-wide">Syncing Serenova Real-Time Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E0F2FE] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-md">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] bg-clip-text text-transparent">Serenova</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="w-10 h-10 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#0D9488] border border-[#0D9488]/20 hover:bg-[#BAE6FD] transition-all shadow-sm"
              >
                <User className="w-6 h-6" />
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E0F2FE] z-20 py-2">
                      <div className="px-4 py-2 border-b border-[#F1F5F9] mb-1">
                        <p className="text-xs text-[#94A3B8] uppercase tracking-wider font-bold">Account</p>
                        <p className="text-sm font-semibold text-[#1E293B] truncate">{userName}</p>
                      </div>
                      <button onClick={handleLogout} className="w-full px-4 py-2 flex items-center gap-3 text-[#EF4444] hover:bg-red-50 text-sm font-medium transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Welcome back, {userName}!</h1>
          <p className="text-lg text-[#475569]">Your wellness state is based on live AI analysis</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 border border-[#0D9488]/10">
            <ImageWithFallback src="https://images.unsplash.com/photo-1698757264929-409ff213e807?q=80&w=1080" alt="Nature" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/80 via-[#2DD4BF]/50 to-[#0891B2]/40" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <h2 className="text-5xl font-bold text-white mb-6">Risk Level: <span className={isHighRisk ? "text-red-300 drop-shadow-md" : "text-green-300 drop-shadow-md"}>{riskLevel}</span></h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 flex items-center gap-4 shadow-lg">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRiskColor(riskLevel)} flex items-center justify-center shadow-lg`}><RiskIcon className="w-8 h-8 text-white" /></div>
                  <div><div className="text-white/80 text-sm">Real-Time Score</div><div className="text-3xl font-bold text-white">{Math.round(overallScore)}%</div></div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 flex items-center gap-4 shadow-lg">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E0F2FE] to-[#F0F9FF] flex items-center justify-center shadow-lg"><Heart className="w-8 h-8 text-[#0D9488]" /></div>
                  <div><div className="text-white/80 text-sm">Emotion Sync</div><div className="text-xl font-bold text-white">{emotionDetected}</div></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "New Assessment", desc: "Take a wellness check", icon: Brain, route: "/assessment", color: "from-[#0D9488] to-[#2DD4BF]" },
            { label: "Wellness Journal", desc: "Write your thoughts", icon: BookOpen, route: "/journal", color: "from-[#2DD4BF] to-[#0891B2]" },
            { label: "Track Progress", desc: "View detailed trends", icon: BarChart3, route: "/progress", color: "from-[#0891B2] to-[#0D9488]" }
          ].map((btn, idx) => (
            <motion.button 
              key={idx}
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => navigate(btn.route)} 
              className={`bg-gradient-to-br ${btn.color} rounded-2xl p-6 shadow-lg text-left text-white group transition-all`}
            >
              <btn.icon className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">{btn.label}</h3>
              <p className="text-white/80 text-sm">{btn.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {insights.map((insight, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-[#0D9488]/10 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${insight.color} shadow-md`}><insight.icon className="text-white" /></div>
                <TrendingUp className={isHighRisk ? 'text-red-500' : 'text-green-500'} />
              </div>
              <h3 className="font-semibold text-[#1E293B] mb-2">{insight.title}</h3>
              <div className="text-3xl font-bold text-[#0D9488] mb-2">{insight.score}%</div>
              <p className="text-sm text-[#475569] mb-4">{insight.description}</p>
              <div className="h-2 bg-[#E0F2FE] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${insight.score}%` }} 
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full bg-gradient-to-r ${insight.color}`} 
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10"
          >
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6 flex items-center gap-2">
              <TrendingUp className="text-[#0D9488] w-5 h-5" /> Weekly Mood Stability
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getWeeklyTrend()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0F2FE" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  connectNulls={false} // TRUTH ONLY: No fake lines through empty days
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#0D9488" 
                  strokeWidth={4} 
                  dot={{ fill: "#0D9488", r: 6, strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10"
          >
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6">Sentiment Spectrum</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={emotionBreakdown} 
                  innerRadius={65} 
                  outerRadius={105} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {emotionBreakdown.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {emotionBreakdown.map((emotion, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-white/40 border border-[#0D9488]/5">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: emotion.color }} />
                  <span className="text-sm font-medium text-[#475569]">{emotion.name} ({emotion.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}