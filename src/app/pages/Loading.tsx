import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Brain, Sparkles, Heart, Activity } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Loading() {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {

    // Visual animation progress
    const visualInterval = setInterval(() => {
      setCompletedSteps((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    // Backend polling
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:5000/api/check-status");
        const data = await response.json();

        // When AI finishes AND animations have progressed enough
        if (data.status === "complete" && completedSteps >= 3) {
          clearInterval(visualInterval);
          clearInterval(pollInterval);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking AI status:", error);
      }
    }, 1500);

    return () => {
      clearInterval(visualInterval);
      clearInterval(pollInterval);
    };

  }, [completedSteps, navigate]);

  const analysisSteps = [
    { icon: Brain, label: "Analyzing questionnaire responses", color: "from-[#0D9488] to-[#2DD4BF]" },
    { icon: Heart, label: "Processing journal sentiment", color: "from-[#2DD4BF] to-[#0891B2]" },
    { icon: Activity, label: "Evaluating typing patterns", color: "from-[#0891B2] to-[#0D9488]" },
    { icon: Sparkles, label: "Generating insights", color: "from-[#0D9488] to-[#0891B2]" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-4xl font-bold text-[#1E293B] mb-4">
            Analyzing Your Assessment
          </h2>

          <p className="text-lg text-[#475569]">
            Our AI is carefully processing your responses to provide personalized insights
          </p>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-[#0D9488]/10 mb-8">
          <div className="space-y-6">

            {analysisSteps.map((step, index) => (

              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-4 transition-opacity duration-500 ${
                  index > completedSteps ? "opacity-30" : "opacity-100"
                }`}
              >

                <motion.div
                  animate={index === completedSteps ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}
                >
                  <step.icon className="w-7 h-7 text-white" />
                </motion.div>

                <div className="flex-1">

                  <div className="font-medium text-[#1E293B] mb-2">
                    {step.label}
                  </div>

                  <div className="h-2 bg-[#E0F2FE] rounded-full overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: index <= completedSteps ? "100%" : "0%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className={`h-full bg-gradient-to-r ${step.color}`}
                    />

                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: index < completedSteps ? 1 : 0 }}
                  className="text-green-500 font-semibold text-xl"
                >
                  ✓
                </motion.div>

              </motion.div>

            ))}

          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="rounded-3xl overflow-hidden shadow-xl"
        >

          <div className="relative h-48">

            <ImageWithFallback
              src="https://images.unsplash.com/photo-1764428950465-51de19f3df69"
              alt="Calm water reflection"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0D9488]/40 to-transparent" />

            <div className="absolute inset-0 flex items-center justify-center">

              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white text-lg font-medium text-center px-6"
              >
                Take a deep breath... Your results will be ready shortly
              </motion.p>

            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
}