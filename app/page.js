'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      router.push("/dashboard");
    }
  }, [router]);

  // Auto-focus username field
  useEffect(() => {
    const usernameInput = document.getElementById('username');
    if (usernameInput) usernameInput.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedUsername || !trimmedPassword) return;

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "✅ Login successful! Redirecting..." });
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setMessage({ type: "error", text: `❌ ${data.error}` });
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <>
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%);
          min-height: 100vh;
          margin: 0;
          overflow: hidden;
        }
        .heartbeat-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.8));
        }
        @keyframes dash {
          0% { stroke-dashoffset: 1000; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1000; }
        }
        .fade-in { animation: fadeIn 1s ease-in; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .toast-enter {
          animation: fadeIn 0.3s ease forwards;
        }
        .toast-exit {
          animation: fadeOut 0.5s ease forwards;
        }
      `}</style>

      {/* Toast Message */}
      {message && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-white z-50 backdrop-blur-md bg-opacity-70 transition-all duration-500 ${
            message.type === 'success' ? 'bg-green-500/80' : 'bg-red-500/80'
          } ${message ? 'toast-enter' : 'toast-exit'}`}
        >
          <div className="flex items-center gap-2">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-2 text-white hover:text-gray-200">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 fade-in">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <svg width="90" height="90" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100,170 C100,170 30,120 30,80 C30,60 45,45 65,45 C80,45 90,55 100,65 C110,55 120,45 135,45 C155,45 170,60 170,80 C170,120 100,170 100,170 Z"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="3"
              />
              <path
                className="heartbeat-line"
                d="M10,100 L50,100 L70,100 L80,80 L90,120 L100,90 L110,110 L120,100 L150,100 L190,100"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Welcome Back</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">Clinic Management System</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                placeholder="Enter your username"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={!username.trim() || !password.trim() || loading}
              className={`w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg ${
                loading ? 'opacity-90 cursor-not-allowed' : ''
              }`}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
