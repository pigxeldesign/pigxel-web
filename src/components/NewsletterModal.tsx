import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, Check, AlertCircle } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setMessage('');
    setIsSuccess(false);
    setIsError(false);

    // Client-side validation
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setIsError(true);
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setIsError(true);
      return;
    }

    if (email.length > 254) {
      setMessage('Email address is too long');
      setIsError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call our secure Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter-subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'coming_soon_modal'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setEmail(''); // Clear the form
        
        // Auto-close after 3 seconds on success
        setTimeout(() => {
          onClose();
          setMessage('');
          setIsSuccess(false);
        }, 3000);
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form state when closing
      setTimeout(() => {
        setEmail('');
        setMessage('');
        setIsSuccess(false);
        setIsError(false);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-gradient-to-br from-blue-900/90 to-purple-900/90 border border-blue-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Content */}
          <div className="text-center pt-4 pb-2">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-blue-400/50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Get notified when we launch!</h2>
            <p className="text-blue-200 mb-6">
              We'll notify you when this feature goes live. No spam ever.
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                  maxLength={254}
                />
              </div>
              
              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg border text-sm flex items-center ${
                      isSuccess 
                        ? 'bg-green-600/20 border-green-600/30 text-green-300' 
                        : 'bg-red-600/20 border-red-600/30 text-red-300'
                    }`}
                  >
                    {isSuccess ? (
                      <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    )}
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Notify Me
                  </>
                )}
              </button>
            </form>
            
            {/* Privacy Note */}
            <p className="text-xs text-gray-400 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NewsletterModal;