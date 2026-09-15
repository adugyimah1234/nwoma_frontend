/* eslint-disable no-console */
'use client';
import React from 'react';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Check, ArrowRight } from 'lucide-react';

export default function ProfessionalRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password strength indicators
  const passwordRequirements = [
    { label: "At least 8 characters", test: () => password.length >= 8 },
    { label: "Contains uppercase letter", test: () => /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", test: () => /[a-z]/.test(password) },
    { label: "Contains a number", test: () => /[0-9]/.test(password) },
    { label: "Contains special character", test: () => /[^A-Za-z0-9]/.test(password) }
  ];

  const handleSubmit = () => {
    // Input validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the terms of service');
      return;
    }

    // Check password requirements
    const passwordValid = passwordRequirements.every(req => req.test());
    if (!passwordValid) {
      setError('Password does not meet security requirements');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate registration process
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      console.log('Registration data:', { firstName, lastName, email });
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-8">
            Your account has been created successfully. Please check your email to verify your account.
          </p>
          <div className="flex flex-col space-y-4">
            <div className="w-full py-3 px-4 rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
              Go to Dashboard
            </div>
            <div className="w-full py-3 px-4 rounded-lg text-base font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer">
              Back to Login
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Left panel with illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="text-4xl font-bold mb-6">Join our platform</div>
          <p className="text-indigo-200 text-lg mb-8">
            Create an account and unlock the full potential of our analytics dashboard.
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <div className="text-xl font-medium mb-4">Benefits of joining</div>
            <ul className="space-y-3">
              {[
                "Personalized dashboard analytics",
                "Priority customer support",
                "Access to premium templates",
                "Cloud data synchronization"
              ].map((item, i) => (
                <li key={i} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-300 mr-2"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel with registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
              <div className="font-bold text-2xl text-white">DB</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-gray-600">Sign up to get started with Dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Name fields - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Password strength indicator */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password requirements
              </label>
              <div className="grid grid-cols-2 gap-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.test() ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {req.test() && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${req.test() ? 'text-green-700' : 'text-gray-500'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-center">
              <div 
                className={`h-4 w-4 border rounded cursor-pointer flex items-center justify-center ${agreeTerms ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                {agreeTerms && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="ml-2 block text-sm text-gray-700">
                I agree to the <span className="text-indigo-600 cursor-pointer">Terms of Service</span> and <span className="text-indigo-600 cursor-pointer">Privacy Policy</span>
              </div>
            </div>

            {/* Submit button */}
            <div
              onClick={handleSubmit}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Create account</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Google', 'Microsoft', 'Apple'].map((provider) => (
                <div
                  key={provider}
                  className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <span className="text-sm font-medium text-gray-700">{provider}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
