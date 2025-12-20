import React, { useState, FormEvent } from 'react';
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { login } from '../../services/auth';
import { useToast } from '../feedback/ToastProvider';
import { Button } from '../Button';

interface LoginViewProps {
  onSwitch: (view: 'login' | 'signup' | 'magicLink') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitch }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to FacetStudio!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 animate-scale-in">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-aura-300 to-aura-500 rounded-2xl mb-4">
          <Sparkles className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-aura-900 mb-1">Welcome Back</h1>
        <p className="text-gray-600">Sign in to continue your journey</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-aura-900 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 border ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-300 transition-all`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-aura-900 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-11 pr-11 py-3 border ${
                errors.password ? 'border-red-300' : 'border-gray-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-aura-300 transition-all`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-6">
          Sign In
        </Button>
      </form>

      {/* Demo Mode - Temporary */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('demoMode', 'true');
            window.location.reload();
          }}
          className="w-full py-3 px-4 bg-gradient-to-r from-aura-400 to-aura-600 text-white rounded-xl hover:from-aura-500 hover:to-aura-700 transition-all font-medium shadow-lg hover:shadow-xl"
        >
          🎨 Enter Demo Mode
        </button>
        <p className="text-xs text-center text-gray-500 mt-2">
          Preview the app without authentication
        </p>
      </div>

      {/* Magic Link Option */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => onSwitch('magicLink')}
          className="text-sm text-aura-600 hover:text-aura-700 font-medium transition-colors"
        >
          Forgot password? Use Magic Link
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitch('signup')}
            className="text-aura-600 hover:text-aura-700 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};
