import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isAdmin, signIn } = useAuth();
  const location = useLocation();

  // Redirect if already logged in as admin
  useEffect(() => {
    console.log('AdminLogin useEffect: user:', user, 'isAdmin:', isAdmin, 'loading:', loading);
    if (user && isAdmin) {
      // Redirect to intended page or admin dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      console.log('AdminLogin: Redirecting to:', from);
      window.location.href = from;
    }
  }, [user, isAdmin, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('AdminLogin: Attempting login with email:', email);

    try {
      const { error } = await signIn(email, password);
      
      console.log('AdminLogin: signIn returned error:', error);
      
      if (error) {
        console.log('AdminLogin: Setting error message:', error.message);
        setError(error.message);
      } else {
        console.log('AdminLogin: Sign in successful, waiting for auth state change');
      }
      // Success handling is done by the auth context and useEffect above
    } catch (err) {
      console.error('AdminLogin: Unexpected error during sign in:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in but not admin, show access denied
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            This account does not have admin privileges.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400">
              Admin access only. No registration available.
            </p>
          </div>
        </motion.div>

        {/* Back to Home Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;