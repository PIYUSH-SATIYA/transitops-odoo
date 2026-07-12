import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiChevronDown,
  FiUserPlus,
} from "react-icons/fi";

import "./Register.css";

const Register = () => {
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

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // Backend API integration later
  };

  return (
    <div className="register-page">
      {/* Left Side */}

      <div className="register-left">

        <h1>
          Simplify Transport.
          <br />
          Optimize <span>Operations.</span>
        </h1>

        <p>
          TransitOps helps transport and logistics teams manage drivers,
          trips, maintenance and expenses in one centralized platform.
        </p>

        <ul>

          <li>
            <span>✓</span>
            Manage fleet, drivers and trips efficiently
          </li>

          <li>
            <span>✓</span>
            Track maintenance and reduce downtime
          </li>

          <li>
            <span>✓</span>
            Control expenses and improve profitability
          </li>

          <li>
            <span>✓</span>
            Make data-driven decisions with smart insights
          </li>

        </ul>

      </div>

      {/* Right Side */}

      <div className="register-right">

        <div className="register-card">

          <h2>Create your account</h2>

          <p>Enter your details to get started</p>

          <form onSubmit={handleSubmit}>

            {/* Row */}

            <div className="row">

              {/* Full Name */}

              <div className="input-group">

                <label>Full Name</label>

                <div className="input-box">

                  <FiUser />

                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Email */}

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

            </div>

            {/* Password */}

            <div className="input-group">

              <label>Password</label>

              <div className="input-box">

                <FiLock />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <FiEye
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                />

              </div>

            </div>

            {/* Confirm Password */}

            <div className="input-group">

              <label>Confirm Password</label>

              <div className="input-box">

                <FiLock />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

                <FiEye
                  className="eye"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

              </div>

            </div>

            {/* Role */}

<div className="input-group">
  <label>Role</label>

  <div className="select-box">
    <FiUser />

    <select
      name="role"
      value={formData.role}
      onChange={handleChange}
    >
      <option value="">Select your role</option>
      <option value="Fleet Manager">Fleet Manager</option>
      <option value="Dispatcher">Dispatcher</option>
      <option value="Safety Officer">Safety Officer</option>
      <option value="Financial Analyst">Financial Analyst</option>
    </select>

    <FiChevronDown className="dropdown-icon" />
  </div>
</div>

            {/* Terms */}

            <div className="terms">

              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />

              <label>
                I agree to the
                <span> Terms of Service </span>
                and
                <span> Privacy Policy</span>
              </label>

            </div>

            {/* Button */}

            <button type="submit" className="register-btn">

              <FiUserPlus />

              Create Account

            </button>

            {/* Divider */}

            <div className="divider">

              <span></span>

              <p>or</p>

              <span></span>

            </div>

            {/* Bottom */}

            <div className="bottom-text">

              Already have an account?

              <Link to="/login"> Login</Link>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Register;