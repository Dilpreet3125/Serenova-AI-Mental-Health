import { useState } from "react";
import { motion } from "motion/react";
import { Brain, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // --- NEW: Added state for form inputs and feedback messages ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
const [loading, setLoading] = useState(false);
  // --- UPDATED: HandleSubmit now talks to your backend ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

  setLoading(true);
    setMessage({ text: "", type: "" }); // Clear old messages

    // Determine which backend endpoint to call
    const endpoint = isLogin ? "/api/login" : "/api/register";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password,
          name: !isLogin ? fullName : undefined // Only send name if registering
        }),
      });

      const data = await response.json();

      if (response.ok) {
  setMessage({ text: "Success! Redirecting...", type: "success" });
  localStorage.setItem("userEmail", email);
  if (!isLogin) {
    localStorage.setItem("userName", fullName);
   setTimeout(() => {
          navigate("/assessment");
        }, 1000);

        return;
      }

      if (data.name) {
        localStorage.setItem("userName", data.name);
      }

      localStorage.setItem("isNewUser", String(data.isNew));
 setTimeout(() => {
  if (data.isNew) {
    navigate("/dashboard");
  } else {
    navigate("/assessment");
  }
}, 1000);
} else {
        // Show error message from backend (e.g., "User already exists")
        setMessage({ text: data.message || "Something went wrong", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Cannot connect to server. Check your backend.", type: "error" });
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9FF] via-[#E0F2FE] to-[#F1F5F9] flex items-center justify-center p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#475569] hover:text-[#0D9488] transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1760509337548-67d533cecb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFjZWZ1bCUyMHNreSUyMGNsb3VkcyUyMHRyYW5xdWlsfGVufDF8fHx8MTc3NDQxMDk3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Peaceful sky and clouds"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/50 to-[#2DD4BF]/50" />
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-white text-center space-y-4">
                <h2 className="text-4xl font-bold">Welcome to Serenova</h2>
                <p className="text-lg opacity-90">
                  Your mental wellness companion powered by AI
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-[#0D9488]/10">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2DD4BF] flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] bg-clip-text text-transparent">
                Serenova
              </span>
            </div>

            {/* Title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1E293B] mb-2">
                {isLogin ? "Welcome Back" : "Get Started"}
              </h2>
              <p className="text-[#475569]">
                {isLogin
                  ? "Continue your wellness journey"
                  : "Begin your path to mental wellness"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1E293B]">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E0F2FE] focus:border-[#0D9488] focus:outline-none transition-colors bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E0F2FE] focus:border-[#0D9488] focus:outline-none transition-colors bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E293B]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E0F2FE] focus:border-[#0D9488] focus:outline-none transition-colors bg-white"
                    required
                  />
                </div>
              </div>

              {/* Status Message Display */}
              {message.text && (
                <p className={`text-sm text-center font-medium ${
                  message.type === "success" ? "text-green-600" : "text-red-500"
                }`}>
                  {message.text}
                </p>
              )}

              {/* {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#475569]">
                    <input
                      type="checkbox"
                      className="rounded border-[#E0F2FE] text-[#0D9488] focus:ring-[#0D9488]"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-[#0D9488] hover:text-[#2DD4BF] font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )} */}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </motion.button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <span className="text-[#475569]">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#0D9488] hover:text-[#2DD4BF] font-semibold"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {/* Divider
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E0F2FE]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-[#475569]">Or continue with</span>
              </div>
            </div> */}

            {/* Social Login */}
            {/* <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="py-3 rounded-xl border-2 border-[#E0F2FE] hover:border-[#0D9488] hover:bg-[#F0F9FF] transition-colors font-medium text-[#1E293B]"
              >
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="py-3 rounded-xl border-2 border-[#E0F2FE] hover:border-[#0D9488] hover:bg-[#F0F9FF] transition-colors font-medium text-[#1E293B]"
              >
                Facebook
              </motion.button>
            </div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}