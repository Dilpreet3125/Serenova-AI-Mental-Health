import { motion } from "motion/react";
import { Brain, Sparkles, Heart, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import heroOcean from "../../images/mental-health-day.jpg";
import { useState, useEffect } from "react"; // Added useEffect for the backend call

export function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Stats state: only accuracy and users come from backend
  const [projectStats, setProjectStats] = useState({
    accuracy: "...",
    users: "..."
  });

  // NEW: Fetch only necessary variables from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/stats")
      .then((response) => response.json())
      .then((data) => {
        setProjectStats({
          accuracy: data.accuracy,
          users: data.users
        });
      })
      .catch((error) => console.error("Error fetching stats:", error));
  }, []);

  // NEW: Scroll watcher for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("serenova-features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9]">
      {/* Header: Fixed and dynamic background */}
      <header className={`px-6 fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/70 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-6"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex items-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] bg-clip-text text-transparent">
            Serenova
          </span>
        </motion.div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-[#1E293B]">
                Your Journey to{" "}
                <span className="bg-gradient-to-r from-[#0D9488] via-[#2DD4BF] to-[#0891B2] bg-clip-text text-transparent">
                  Mental Wellness
                </span>
              </h1>
              <p className="text-lg text-[#475569] leading-relaxed">
                Serenova uses advanced AI to analyze your emotional well-being through questionnaires, 
                journal sentiment analysis, typing behavior, and optional facial emotion detection. 
                Get personalized insights and track your mental health journey.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-full bg-[#0F172A] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Assessment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToFeatures}
                className="px-8 py-4 rounded-full border-2 border-[#0D9488] text-[#0D9488] font-semibold hover:bg-[#0D9488]/5 transition-colors"
              >
                Learn More
              </motion.button>
            </div>

            {/* Stats Section with dynamic accuracy/users and hardcoded support */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0891B2]">{projectStats.accuracy}</div>
                <div className="text-sm text-[#475569]">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0D9488]">{projectStats.users}</div>
                <div className="text-sm text-[#475569]">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#2DD4BF]">24/7</div>
                <div className="text-sm text-[#475569]">Support</div>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
           <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={heroOcean}
                alt="Serene ocean waves"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          id="serenova-features"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center mb-4">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#1E293B]">
              Advanced AI Analysis
            </h3>
            <p className="text-[#475569] leading-relaxed">
              Our AI analyzes multiple data points including text sentiment, typing patterns, 
              and facial expressions to provide comprehensive insights.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#0891B2] flex items-center justify-center mb-4">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#1E293B]">
              Personalized Care
            </h3>
            <p className="text-[#475569] leading-relaxed">
              Receive tailored recommendations and insights based on your unique emotional 
              patterns and behavioral data.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-[#0D9488]/10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0891B2] to-[#0D9488] flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-[#1E293B]">
              Privacy Protected
            </h3>
            <p className="text-[#475569] leading-relaxed">
              Your data is encrypted and secure. We prioritize your privacy with 
              industry-leading security measures.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}