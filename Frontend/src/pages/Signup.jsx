import React, { useState, useContext, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const { apiClient } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const isValidUsername = (username) => {
    // 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const isValidName = (name) => {
    // 2-50 characters, letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    return nameRegex.test(name);
  };

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!isValidName(value)) return 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!isValidEmail(value)) return 'Please enter a valid email address';
        return '';
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (!isValidUsername(value)) return 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (!isValidPassword(value)) return 'Password must be at least 8 characters with uppercase, lowercase, and number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear server error when user starts typing
    if (serverError) setServerError("");

    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // Also re-validate confirmPassword if password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError }));
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);

    // Check if form is valid
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const response = await apiClient.post('/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
        password: formData.password,
      });

      // Store email for verification page
      try { 
        localStorage.setItem("pendingEmail", formData.email); 
      } catch (_) {}
      
      navigate(`/verify-pending?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error("Registration failed:", error);
      
      // Handle field-specific errors from server
      if (error.response?.data?.field) {
        setErrors(prev => ({
          ...prev,
          [error.response.data.field]: error.response.data.error
        }));
      } else {
        setServerError(error.response?.data?.error || "An error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

   // Check if form is valid
   const isFormValid = useMemo(() => {
    return Object.values(errors).every(error => error === "") &&
      Object.values(formData).every(value => value.trim() !== "");
  }, [errors, formData]);


  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">Sign Up</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">Join ThiraiView to discover and share movies</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm ${
                touched.name && errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
              }`}
              placeholder="Enter your full name"
            />
            {touched.name && errors.name && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm ${
                touched.username && errors.username ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
              }`}
              placeholder="Choose a username"
            />
            {touched.username && errors.username && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm ${
                touched.email && errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
              }`}
              placeholder="Enter your email"
            />
            {touched.email && errors.email && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm ${
                  touched.password && errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password}</p>
            )}
            {touched.password && !errors.password && formData.password && (
              <p className="text-green-600 dark:text-green-400 text-xs mt-1">✓ Password meets requirements</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm ${
                  touched.confirmPassword && errors.confirmPassword ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
            {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
              <p className="text-green-600 dark:text-green-400 text-xs mt-1">✓ Passwords match</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          {console.log("submitting:", submitting, "isFormValid:", isFormValid)}
          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !isFormValid}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
