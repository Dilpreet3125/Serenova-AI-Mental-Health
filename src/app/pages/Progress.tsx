import { useState, useEffect } from "react";
import { millisecondsToSeconds, motion } from "framer-motion";
import { Brain, TrendingUp, Calendar, Filter, Home, Menu, Download, TicketsPlane } from "lucide-react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Image Imports
import streakIcon from "../../images/streak.png";
import bullseye from "../../images/bullseye.png";
import graph from "../../images/graph.png";
import star from "../../images/star.png";
import fire2 from "../../images/fire2.png";
import journal from "../../images/journal.png";
import RisingStreak from "../../images/RisingStreak.png";
import MomentumBuilder from "../../images/MomentumBuilder.png";
import streak from "../../images/streak.png";
import travel from "../../images/travel.png";
import mind from "../../images/mind.png";
import data from "../../images/data.png";
import zen from "../../images/zen.png";
import emotion from "../../images/emotion.png";
import deep from "../../images/deep.png";
import titan from "../../images/titan.png";

export function Progress() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState({
    totalJournals: 0,
    totalAssessments: 0,
    streak: 0,
    latestAssessment: null as any,
    avgPositivity: 0,
    journalHistory: [] as any[]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/progress-stats");
      const journalRes = await fetch("http://localhost:5000/api/journals");
      const statsData = await res.json();
      const journals = await journalRes.json();
      
      const avg = journals.length > 0 
        ? journals.reduce((acc: number, curr: any) => acc + (curr.positivity || 0), 0) / journals.length 
        : 0;

      setStats({
        ...statsData,
        avgPositivity: avg,
        journalHistory: journals
      });
    } catch (e) {
      console.error("Stats fetch error", e);
    }
  };

  const assessment = stats.latestAssessment?.data || {};
  
  const getScore = (val: string, highVal = 85, medVal = 55, lowVal = 30) => {
    if (val === "High" || val === "Yes") return highVal;
    if (val === "Maybe") return medVal;
    return lowVal;
  };

  const wellnessRadarData = [
    { category: "Mood", current: getScore(assessment.Mood_Swings, 35, 60, 85), average: 70 },
    { category: "Social", current: getScore(assessment.Social_Weakness, 30, 60, 85), average: 72 },
    { category: "Stress", current: getScore(assessment.Growing_Stress, 30, 55, 88), average: 65 },
    { category: "Focus", current: getScore(assessment.Work_Interest, 85, 50, 20), average: 70 },
    { category: "Coping", current: getScore(assessment.Coping_Struggles, 30, 50, 80), average: 75 },
    { category: "Habits", current: getScore(assessment.Changes_Habits, 40, 60, 85), average: 68 },
  ];

  // --- TRUTH-ONLY TIME RANGE MAPPING ---
  const getRealTrendData = () => {
    // 1. Weekly View: Actual days Mon-Sun
    if (timeRange === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.map(dayName => {
        // Find if any entry exists for this specific weekday
        const entry = stats.journalHistory.find(j => {
          const d = new Date(j.date);
          return days[d.getDay()] === dayName;
        });
        return { date: dayName, mood: entry ? entry.positivity / 10 : null };
      });
    }

    // 2. Yearly View: Actual months Jan-Dec
    if (timeRange === "year") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.map((monthName, index) => {
        // Find if any entry exists for this specific month
        const entriesInMonth = stats.journalHistory.filter(j => new Date(j.date).getMonth() === index);
        const avgInMonth = entriesInMonth.length > 0 
          ? entriesInMonth.reduce((a, b) => a + b.positivity, 0) / entriesInMonth.length / 10
          : null;
        return { date: monthName, mood: avgInMonth };
      });
    }

    // 3. Monthly View: Actual weeks of the current month
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
    return weeks.map((w, i) => {
      const entriesInWeek = stats.journalHistory.filter(j => {
        const date = new Date(j.date);
        const day = date.getDate();
        return Math.floor((day - 1) / 7) === i && date.getMonth() === new Date().getMonth();
      });
      const avg = entriesInWeek.length > 0 
        ? entriesInWeek.reduce((a, b) => a + b.positivity, 0) / entriesInWeek.length / 10
        : null;
      return { date: w, mood: avg };
    });
  };

  const trendData = getRealTrendData();

  const improvementAreas = [
    { area: "Stress Management", improvement: `${100 - wellnessRadarData[2].current}%`, color: "from-[#2DD4BF] to-[#0891B2]" },
    { area: "Emotional Stability", improvement: `${Math.round(stats.avgPositivity)}%`, color: "from-[#0891B2] to-[#0D9488]" },
    { area: "Journaling Growth", improvement: `${Math.min(stats.totalJournals * 10, 100)}%`, color: "from-[#0D9488] to-[#2DD4BF]" }
  ];

  const milestones = [
    { title: "The Pioneer", description: "Completed your first AI Wellness Assessment", icon: bullseye, unlocked: stats.totalAssessments >= 1 },
    { title: "Self-Reflector", description: "Penned your first deep-dive journal entry", icon: journal, unlocked: stats.totalJournals >= 1 },
    { title: "Rising Streak", description: "Maintained wellness for 2+ days", icon: RisingStreak, unlocked: stats.streak >= 2 },
    { title: "Momentum Builder", description: "Reached a 5-day journaling streak", icon: MomentumBuilder, unlocked: stats.streak >= 5 },
    { title: "Weekly Warrior", description: "Maintained a 7-day wellness streak", icon: streak, unlocked: stats.streak >= 7 },
    { title: "The Voyager", description: "Completed 10 total journal entries", icon: travel, unlocked: stats.totalJournals >= 10 },
    { title: "Mindful Master", description: "Completed 5 journal entries", icon: mind, unlocked: stats.totalJournals >= 5 },
    { title: "Data Pioneer", description: "Completed 3 wellness assessments", icon: data, unlocked: stats.totalAssessments >= 3 },
    { title: "Zen Master", description: "Stable mood patterns for 48 hours", icon: zen, unlocked: stats.streak >= 2 && wellnessRadarData[0].current > 70 },
    { title: "Emotional Architect", description: "High Coping management score", icon: emotion, unlocked: getScore(assessment.Coping_Struggles) < 40 },
    { title: "Deep Diver", description: "Entry exceeding 500 characters", icon: deep, unlocked: stats.journalHistory.some(j => j.text.length > 500) },
    { title: "Wellness Titan", description: "Completed 5 full AI Assessments", icon: titan, unlocked: stats.totalAssessments >= 5 },
  ].filter(m => m.unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E0F2FE] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center shadow-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] bg-clip-text text-transparent">Serenova</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-2 text-[#475569] hover:bg-[#F0F9FF] rounded-lg transition-colors font-medium">
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button className="p-2 text-[#475569] hover:bg-[#F0F9FF] rounded-lg transition-colors"><Menu className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[#1E293B] mb-2">Progress Tracking</h1>
              <p className="text-lg text-[#475569]">Monitor your mental wellness journey over time</p>
            </div>
          </div>

          <div className="flex gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl inline-flex shadow-lg border border-[#0D9488]/10">
            {["week", "month", "year"].map((range) => (
              <button key={range} onClick={() => setTimeRange(range)} className={`px-6 py-2 rounded-xl font-medium transition-all ${timeRange === range ? "bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white shadow-md" : "text-[#475569] hover:bg-[#F0F9FF]"}`}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-3xl overflow-hidden shadow-2xl mb-8">
          <ImageWithFallback src="https://images.unsplash.com/photo-1772869262129-32ba801f86fc?q=80&w=1080" alt="Serene" className="w-full h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/80 via-[#2DD4BF]/70 to-[#0891B2]/80" />
          <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Your Wellness Journey</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <TrendingUp className="w-8 h-8 text-white mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">+{Math.round(wellnessRadarData.reduce((a,b)=>a+b.current,0)/6)}%</div>
                  <div className="text-white/90 text-sm">Overall Wellness</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <Calendar className="w-8 h-8 text-white mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalJournals}</div>
                  <div className="text-white/90 text-sm">Total Entries</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <div className="w-10 h-10 mb-2"><img src={fire2} alt="fire" className="w-full h-full object-contain" /></div>
                  <div className="text-3xl font-bold text-white mb-1">{stats.streak}</div>
                  <div className="text-white/90 text-sm">Day Streak</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                  <div className="w-10 h-10 mb-2"><img src={star} alt="star" className="w-full h-full object-contain" /></div>
                  <div className="text-3xl font-bold text-white mb-1">{milestones.length}</div>
                  <div className="text-white/90 text-sm">Milestones</div>
                </div>
              </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6">Mood & Positivity Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/><stop offset="95%" stopColor="#0D9488" stopOpacity={0.1}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Area 
                  connectNulls={false} 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#0D9488" 
                  fill="url(#colorMood)" 
                  strokeWidth={3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6">AI Assessment Insights</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={wellnessRadarData}>
                <PolarGrid stroke="#E0F2FE" />
                <PolarAngleAxis dataKey="category" />
                <Radar name="Score" dataKey="current" stroke="#0D9488" fill="#0D9488" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6">Key Improvements</h3>
            <div className="space-y-6">
              {improvementAreas.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-[#475569]">{item.area}</span>
                    <span className="text-[#0D9488] font-bold">+{item.improvement}</span>
                  </div>
                  <div className="h-3 bg-[#E0F2FE] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: item.improvement }} transition={{ duration: 1.5 }} className={`h-full bg-gradient-to-r ${item.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <h3 className="text-xl font-semibold text-[#1E293B] mb-6">Milestones Achieved</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {milestones.length > 0 ? (
                milestones.map((m, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#0D9488]/5 to-[#2DD4BF]/10 border border-[#0D9488]/10 transition-all hover:shadow-md">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center p-1 bg-white rounded-xl shadow-sm border border-[#0D9488]/10">
                      <img src={m.icon} alt="icon" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1E293B]">{m.title}</div>
                      <div className="text-sm text-[#475569]">{m.description}</div>
                      <div className="text-[10px] text-[#0D9488] mt-1 font-bold uppercase tracking-wider">Achieved</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 italic">No milestones achieved yet. Keep going!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}