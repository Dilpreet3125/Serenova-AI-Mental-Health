import { useState } from "react";
import { motion } from "motion/react";
import { Brain, FileText, Keyboard, Camera, ArrowRight, Home, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Assessment() {
  const navigate = useNavigate();
  const [showCameraMsg, setShowCameraMsg] = useState(false);

  // --- PHASE & STEP STATE ---
  const [phase, setPhase] = useState(0); // 0: Questions, 1: Journal, 2: Camera
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // --- TYPING ANALYTICS STATE ---
  const [startTime, setStartTime] = useState<number | null>(null);
  const [metrics, setMetrics] = useState({
    wpm: 0,
    backspaces: 0,
  });

  // Updated to full 15 ML variables in exact XGBoost order
  const questions = [
    { id: "Gender", question: "What is your gender?", options: ["Female", "Male"] },
    { id: "Country", question: "Which country do you reside in?", options: ["United States", "United Kingdom", "Canada", "Poland", "Australia", "India", "Other"] },
    { id: "Occupation", question: "What is your current occupation?", options: ["Corporate", "Student", "Business", "Housewife", "Others"] },
    { id: "self_employed", question: "Are you self-employed?", options: ["Yes", "No"] },
    { id: "family_history", question: "Do you have a family history of mental illness?", options: ["Yes", "No"] },
    { id: "Days_Indoors", question: "How many days have you been indoors recently?", options: ["1-14 days", "15-30 days", "31-60 days", "Go out Every day", "More than 2 months"] },
    { id: "Growing_Stress", question: "Have you noticed your stress levels increasing?", options: ["Yes", "No", "Maybe"] },
    { id: "Changes_Habits", question: "Have you noticed changes in your daily habits?", options: ["Yes", "No", "Maybe"] },
    { id: "Mental_Health_History", question: "Do you have a personal history of mental health issues?", options: ["Yes", "No", "Maybe"] },
    { id: "Mood_Swings", question: "How would you describe your mood swings?", options: ["Low", "Medium", "High"] },
    { id: "Coping_Struggles", question: "Do you find it hard to deal with stress or problems?", options: ["Yes", "No"] },
    { id: "Work_Interest", question: "Have you felt a loss of interest in work or activities?", options: ["Yes", "No", "Maybe"] },
    { id: "Social_Weakness", question: "Have you felt any social weakness recently?", options: ["Yes", "No", "Maybe"] },
    { id: "mental_health_interview", question: "Would you bring up mental health in a job interview?", options: ["Yes", "No", "Maybe"] },
    { id: "care_options", question: "Are you aware of local care options available to you?", options: ["Yes", "No", "Not sure"] },
  ];

  // --- NAVIGATION HANDLERS ---
  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setPhase(1); // Move to Journal
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- TYPING TRACKER LOGIC ---
  const handleJournalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const now = Date.now();

    if (!startTime && text.length > 0) setStartTime(now);

    if (startTime) {
      const timeElapsedMinutes = (now - startTime) / 60000;
      const wordCount = text.trim().split(/\s+/).length;
      setMetrics((prev) => ({
        ...prev,
        wpm: timeElapsedMinutes > 0 ? Math.round(wordCount / timeElapsedMinutes) : 0,
      }));
    }
    handleAnswer("journal", text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      setMetrics((prev) => ({ ...prev, backspaces: prev.backspaces + 1 }));
    }
  };

  const handleSubmit = async () => {
  const finalAnswers = {
    ...answers,
    typing_wpm: metrics.wpm,
    backspaces: metrics.backspaces
  };

  try {
    // 1️⃣ Save assessment
    await fetch("http://localhost:5000/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalAnswers),
    });

    // 2️⃣ 🔥 MARK USER AS NOT NEW (THIS IS THE IMPORTANT PART)
    await fetch("http://localhost:5000/api/complete-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: localStorage.getItem("userEmail")
      })
    });

    // 3️⃣ Update localStorage
    localStorage.setItem("isNewUser", "false");

    // 4️⃣ Go to loading (your existing flow)
    navigate("/loading");

  } catch (error) {
    console.error("Error sending assessment:", error);
    navigate("/loading");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#E0F2FE] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] bg-clip-text text-transparent">
              Serenova
            </span>
          </div>
          {/* <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 px-4 py-2 text-[#475569] hover:bg-[#F0F9FF] rounded-lg transition-colors">
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button className="p-2 text-[#475569] hover:bg-[#F0F9FF] rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div> */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-[#0D9488]/10">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Assessment Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#475569]">Step {phase === 0 ? currentStep + 1 : (phase === 1 ? questions.length + 1 : questions.length + 2)} of {questions.length + 2}</span>
                    <span className="text-[#0891B2] font-medium">{Math.round(((phase === 0 ? currentStep + 1 : (phase === 1 ? questions.length + 1 : questions.length + 2)) / (questions.length + 2)) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-[#E0F2FE] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${((phase === 0 ? currentStep + 1 : (phase === 1 ? questions.length + 1 : questions.length + 2)) / (questions.length + 2)) * 100}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF]" />
                  </div>
                </div>
                <div className="space-y-3 pt-4">
                  <div className={`flex items-center gap-3 ${phase >= 0 ? "text-[#0D9488]" : "opacity-50"}`}><FileText className="w-5 h-5" /> Questionnaire</div>
                  <div className={`flex items-center gap-3 ${phase >= 1 ? "text-[#0D9488]" : "opacity-50"}`}><Keyboard className="w-5 h-5" /> Journal Entry</div>
                  <div className={`flex items-center gap-3 ${phase >= 2 ? "text-[#0D9488]" : "opacity-50"}`}><Camera className="w-5 h-5" /> Facial Analysis</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block rounded-3xl overflow-hidden shadow-lg">
              <ImageWithFallback src="https://images.unsplash.com/photo-1764192114257-ae9ecf97eb6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwbWluZGZ1bG5lc3MlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NzQ0MTA5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Meditation" className="w-full h-64 object-cover" />
            </div>
          </motion.div>

          {/* Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-lg border border-[#0D9488]/10 min-h-[600px] flex flex-col">
              
              {/* PHASE 0: QUESTIONNAIRE */}
              {phase === 0 && (
                <motion.div key="phase0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                  <div className="mb-8">
                    <div className="inline-block px-4 py-2 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-medium mb-4 border border-[#0D9488]/20">Question {currentStep + 1} of {questions.length}</div>
                    <h2 className="text-3xl font-bold text-[#1E293B] mb-4">{questions[currentStep].question}</h2>
                  </div>
                  <div className="space-y-3">
                    {questions[currentStep].options.map((option, index) => (
                      <motion.button key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(questions[currentStep].id, option)} className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${answers[questions[currentStep].id] === option ? "border-[#0D9488] bg-[#0D9488]/5" : "border-[#E0F2FE] hover:border-[#2DD4BF] bg-white"}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#1E293B]">{option}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[questions[currentStep].id] === option ? "border-[#0D9488] bg-[#0D9488]" : "border-gray-300"}`}>{answers[questions[currentStep].id] === option && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-8">
                    {currentStep > 0 && <button onClick={handlePrev} className="px-6 py-3 rounded-xl border-2 border-[#0D9488] text-[#0D9488] font-semibold hover:bg-[#0D9488]/5 transition-colors">Previous</button>}
                    <button onClick={handleNext} disabled={!answers[questions[currentStep].id]} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">{currentStep === questions.length - 1 ? "Continue to Journal" : "Next Question"} <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              )}

              {/* PHASE 1: JOURNAL */}
              {phase === 1 && (
                <motion.div key="phase1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                  <div className="mb-8 flex justify-between items-start">
                    <div>
                      <div className="inline-block px-4 py-2 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-medium mb-4 border border-[#0D9488]/20">Final Step</div>
                      <h2 className="text-3xl font-bold text-[#1E293B] mb-4">Share Your Thoughts</h2>
                      <p className="text-[#475569]">Write about how you're feeling today. AI will analyze typing patterns (WPM: {metrics.wpm}).</p>
                    </div>
                  </div>
                  <textarea placeholder="Today I'm feeling..." rows={12} className="w-full p-6 rounded-2xl border-2 border-[#E0F2FE] focus:border-[#0D9488] focus:outline-none resize-none bg-white text-[#1E293B]" onChange={handleJournalChange} onKeyDown={handleKeyDown} />
                  <div className="flex gap-4 mt-6">
                    <button onClick={() => setPhase(0)} className="px-6 py-3 rounded-xl border-2 border-[#0D9488] text-[#0D9488] font-semibold">Back</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setPhase(2)} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">Continue to Facial Analysis <ArrowRight className="w-5 h-5" /></motion.button>
                  </div>
                </motion.div>
              )}

              {/* PHASE 2: CAMERA */}
              {phase === 2 && (
                <motion.div key="phase2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                  <div className="mb-8">
                    <div className="inline-block px-4 py-2 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-medium mb-4 border border-[#0D9488]/20">Final Step</div>
                    <h2 className="text-3xl font-bold text-[#1E293B] mb-4">Facial Emotion Detection</h2>
                    <p className="text-[#475569]">Enable your camera for micro-expression analysis to provide insights.</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#E0F2FE] rounded-3xl bg-[#F8FAFC] p-8">
                    <Camera className="w-16 h-16 text-[#475569] mb-4 opacity-20" />
                    <button 
  onClick={() => setShowCameraMsg(true)}
  className="px-8 py-3 rounded-xl bg-[#1E293B] text-white font-medium hover:bg-[#334155] transition-colors"
>
  Optional: Enable Camera Detection
</button>
{showCameraMsg && (
  <div className="mt-6 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium">
    Facial detection feature coming soon. Please proceed to complete your assessment.
  </div>
)}
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={() => setPhase(1)} className="px-6 py-3 rounded-xl border-2 border-[#0D9488] text-[#0D9488] font-semibold">Back</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">Complete Assessment <ArrowRight className="w-5 h-5" /></motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}