import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronDown, FiUserPlus } from "react-icons/fi";
import { LoaderCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!formData.terms) {
      return setError("You must agree to the Terms of Service.");
    }

    setLoading(true);
    setError("");

    try {
      // The API only expects email, password, and role based on api_documentation.md
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.session?.access_token || "");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user?.role || "");
        navigate("/app");
      } else {
        setError(data.message || "Registration failed. Please try again.");
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

        <ul className="space-y-6 text-lg text-slate-500">
          {[
            "Manage fleet, drivers and trips efficiently",
            "Track maintenance and reduce downtime",
            "Control expenses and improve profitability",
            "Make data-driven decisions with smart insights"
          ].map((item, idx) => (
            <li key={idx} className="flex items-center gap-4">
              <span className="w-7 h-7 rounded-full border-2 border-[#19c7bb] text-[#19c7bb] flex items-center justify-center text-sm font-bold flex-shrink-0">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex justify-center items-start pt-12 pb-12 px-8 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-[570px]">
          <h2 className="text-3xl font-bold text-[#071b4a] mb-2">Create your account</h2>
          <p className="text-[17px] text-slate-500 mb-8">Enter your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
                {error}
              </div>
            )}

            {/* ROW: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[#071b4a] text-base font-semibold mb-2">Full Name</label>
                <div className="h-14 border border-slate-300 rounded-xl flex items-center px-4 transition-all focus-within:border-[#19c7bb] focus-within:ring-4 focus-within:ring-[#19c7bb]/10 hover:border-[#19c7bb]">
                  <FiUser className="text-slate-400 text-xl" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="flex-1 w-full h-full bg-transparent border-none outline-none px-3 text-base text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

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
                    className="flex-1 w-full h-full bg-transparent border-none outline-none px-3 text-base text-slate-700 placeholder:text-slate-400"
                  />
                </div>
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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 w-full h-full bg-transparent border-none outline-none px-3 text-base text-slate-700 placeholder:text-slate-400"
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

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-[#071b4a] text-base font-semibold mb-2">Confirm Password</label>
              <div className="h-14 border border-slate-300 rounded-xl flex items-center px-4 transition-all focus-within:border-[#19c7bb] focus-within:ring-4 focus-within:ring-[#19c7bb]/10 hover:border-[#19c7bb]">
                <FiLock className="text-slate-400 text-xl" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="flex-1 w-full h-full bg-transparent border-none outline-none px-3 text-base text-slate-700 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 outline-none"
                >
                  {showConfirmPassword ? <FiEyeOff className="text-xl" /> : <FiEye className="text-xl" />}
                </button>
              </div>
            </div>

            {/* ROLE */}
            <div>
              <label className="block text-[#071b4a] text-base font-semibold mb-2">Role</label>
              <div className="relative h-14 border border-slate-300 rounded-xl flex items-center px-4 transition-all focus-within:border-[#19c7bb] focus-within:ring-4 focus-within:ring-[#19c7bb]/10 hover:border-[#19c7bb]">
                <FiUser className="text-slate-400 text-xl absolute left-4 pointer-events-none" />
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="flex-1 w-full h-full bg-transparent border-none outline-none pl-9 pr-10 text-base text-slate-700 cursor-pointer appearance-none"
                >
                  <option value="" disabled hidden>Select your role</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Financial Analyst">Financial Analyst</option>
                </select>
                <FiChevronDown className="text-slate-400 text-xl absolute right-4 pointer-events-none" />
              </div>
            </div>

            {/* TERMS */}
            <div className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="w-[18px] h-[18px] mt-0.5 accent-[#18c7bc] cursor-pointer shrink-0"
              />
              <label className="text-[15px] text-slate-500 leading-relaxed select-none">
                I agree to the <span className="text-[#18c7bc] font-medium cursor-pointer">Terms of Service</span> and <span className="text-[#18c7bc] font-medium cursor-pointer">Privacy Policy</span>
              </label>
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
                  <FiUserPlus className="text-xl" />
                  Create Account
                </>
              )}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[15px] text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* LOGIN LINK */}
            <div className="text-center text-[17px] text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#18c7bc] hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;