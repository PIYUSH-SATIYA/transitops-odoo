import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { LoaderCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.session?.access_token || "");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user?.role || "");
        navigate("/app");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Network error. Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-24 py-16 border-r border-slate-200">
        <h1 className="text-5xl xl:text-6xl font-bold text-[#071b4a] leading-tight mb-8">
          Simplify Transport.<br />
          Optimize <span className="text-[#19c7bb]">Operations.</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-lg mb-14">
          TransitOps helps transport and logistics teams manage drivers, trips, maintenance and expenses in one centralized platform.
        </p>

        <div>
          <h3 className="text-lg font-bold text-[#071b4a] mb-6">One platform, four roles:</h3>
          <ul className="space-y-5 text-lg text-slate-500">
            {["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"].map((role, idx) => (
              <li key={idx} className="flex items-center gap-4">
                <span className="w-7 h-7 rounded-full border-2 border-[#19c7bb] text-[#19c7bb] flex items-center justify-center text-sm font-bold">
                  ✓
                </span>
                {role}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex justify-center items-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-[560px]">
          <h2 className="text-3xl font-bold text-[#071b4a] mb-2">Sign in to your account</h2>
          <p className="text-[17px] text-slate-500 mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
                {error}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-[#071b4a] text-base font-semibold mb-2">Email</label>
              <div className="h-14 border border-slate-300 rounded-xl flex items-center px-4 transition-all focus-within:border-[#19c7bb] focus-within:ring-4 focus-within:ring-[#19c7bb]/10 hover:border-[#19c7bb]">
                <FiMail className="text-slate-400 text-xl" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 h-full bg-transparent border-none outline-none px-3 text-base text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[#071b4a] text-base font-semibold mb-2">Password</label>
              <div className="h-14 border border-slate-300 rounded-xl flex items-center px-4 transition-all focus-within:border-[#19c7bb] focus-within:ring-4 focus-within:ring-[#19c7bb]/10 hover:border-[#19c7bb]">
                <FiLock className="text-slate-400 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 h-full bg-transparent border-none outline-none px-3 text-base text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 outline-none"
                >
                  {showPassword ? <FiEyeOff className="text-xl" /> : <FiEye className="text-xl" />}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="flex items-center justify-between pt-2 pb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="w-[18px] h-[18px] accent-[#18c7bc] cursor-pointer"
                />
                <span className="text-[15px] text-slate-500 select-none">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[15px] font-medium text-[#18c7bc] hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#19d1c3] to-[#13b4b2] text-white text-lg font-semibold flex items-center justify-center gap-3 transition-transform active:scale-[0.98] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(24,199,188,0.25)] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? (
                <LoaderCircle className="animate-spin text-xl" />
              ) : (
                <>
                  <FiLogIn className="text-xl" />
                  Sign In
                </>
              )}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[15px] text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* REGISTER LINK */}
            <div className="text-center text-[17px] text-slate-500 pb-6">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-[#18c7bc] hover:underline">
                Register
              </Link>
            </div>

            {/* ROLE INFO */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-base font-bold text-[#071b4a] mb-4">
                Access is scoped by role after login:
              </h4>
              <ul className="pl-5 list-disc text-[15px] text-slate-500 space-y-2 marker:text-slate-300">
                <li>Fleet Manager &rarr; Fleet, Maintenance</li>
                <li>Dispatcher &rarr; Dashboard, Trips</li>
                <li>Safety Officer &rarr; Drivers, Compliance</li>
                <li>Financial Analyst &rarr; Fuel & Expenses, Analytics</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;