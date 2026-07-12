import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
} from "react-icons/fi";

import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // Backend API Integration Later
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <div className="login-left">

        <h1>
          Simplify Transport.
          <br />
          Optimize <span>Operations.</span>
        </h1>

        <p>
          TransitOps helps transport and logistics teams manage
          drivers, trips, maintenance and expenses in one
          centralized platform.
        </p>

        <div className="roles-section">

          <h3>One platform, four roles:</h3>

          <ul>

            <li>
              <span>✓</span>
              Fleet Manager
            </li>

            <li>
              <span>✓</span>
              Dispatcher
            </li>

            <li>
              <span>✓</span>
              Safety Officer
            </li>

            <li>
              <span>✓</span>
              Financial Analyst
            </li>

          </ul>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="login-right">

        <div className="login-card">

          <h2>Sign in to your account</h2>

          <p>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="input-group">

              <label>Email</label>

              <div className="input-box">

                <FiMail />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label>Password</label>

              <div className="input-box">

                <FiLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                {showPassword ? (
                  <FiEyeOff
                    className="eye"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FiEye
                    className="eye"
                    onClick={() => setShowPassword(true)}
                  />
                )}

              </div>

            </div>

            {/* OPTIONS */}

            <div className="login-options">

              <div className="remember">

                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />

                <label>Remember me</label>

              </div>

              <Link to="/forgot-password">
                Forgot password?
              </Link>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="login-btn"
            >

              <FiLogIn />

              Sign In

            </button>

            {/* DIVIDER */}

            <div className="divider">

              <span></span>

              <p>or</p>

              <span></span>

            </div>

            {/* REGISTER */}

            <div className="bottom-text">

              Don't have an account?

              <Link to="/register">
                Register
              </Link>

            </div>

            {/* ROLE INFO */}

            <div className="role-info">

              <h4>
                Access is scoped by role after login:
              </h4>

              <ul>

                <li>
                  Fleet Manager → Fleet, Maintenance
                </li>

                <li>
                  Dispatcher → Dashboard, Trips
                </li>

                <li>
                  Safety Officer → Drivers, Compliance
                </li>

                <li>
                  Financial Analyst → Fuel & Expenses,
                  Analytics
                </li>

              </ul>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;