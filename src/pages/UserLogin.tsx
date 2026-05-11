import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Wallet, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { address } from '@solana/kit'; // using new @solana/kit for address typing

const UserLogin: React.FC = () => {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setToast(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      showToast('Redirecting to Google...', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to initialize Google login', 'error');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoadingWallet(true);
    setToast(null);
    try {
      // Connect using the standard window provider (Phantom, Solflare, etc)
      const provider = (window as any).phantom?.solana || (window as any).solana;
      
      if (!provider || !provider.isPhantom) {
        throw new Error('Please install a Solana wallet like Phantom to continue.');
      }

      // Connect to the wallet
      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();
      
      // Request signature for authentication
      const message = `Sign this message to log in to Pigxel Directory.\n\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      const signedMessage = await provider.signMessage(encodedMessage, "utf8");
      
      const signatureArray = Array.from(signedMessage.signature);
      const publicKeyBytesArray = Array.from(resp.publicKey.toBytes());

      // Clear any corrupted local session before calling the Edge Function
      await supabase.auth.signOut();

      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('wallet-login', {
        body: {
          publicKey: publicKey,
          publicKeyBytesArray: publicKeyBytesArray,
          signature: signatureArray,
          message: message
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to authenticate wallet with server');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Set the session using the genuine tokens returned by Supabase Auth
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      });

      if (sessionError) throw sessionError;
      
      setWalletAddress(publicKey);
      showToast('Wallet Authenticated Successfully!', 'success');
      console.log('Wallet connected & authenticated:', publicKey);
      
      // Redirect to home
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to connect wallet', 'error');
    } finally {
      setIsLoadingWallet(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">
            Sign in to explore the Web3 ecosystem.
          </p>
        </div>

        {/* Floating Snackbar */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-full shadow-lg ${
              toast.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium whitespace-nowrap">{toast.message}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle || isLoadingWallet || !!walletAddress}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingGoogle ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-900" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleWalletConnect}
            disabled={isLoadingGoogle || isLoadingWallet || !!walletAddress}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-[#512DA8] hover:bg-[#4527A0] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingWallet ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Solana Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for the user icon
const UserIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default UserLogin;
