import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from './Modal';

interface LoginSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginSelectionModal: React.FC<LoginSelectionModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (role: 'admin' | 'user') => {
    onClose();
    if (role === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/user/login');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Login Type" size="md">
      <div className="p-6">
        <p className="text-gray-400 mb-6 text-center">
          How would you like to access the Web3 Directory?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('user')}
            className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-xl transition-all group"
          >
            <div className="w-16 h-16 bg-purple-500/10 group-hover:bg-purple-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
              <User className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">User Access</h3>
            <p className="text-sm text-gray-400 text-center">
              Sign in with Google or your Solana Wallet to explore.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('admin')}
            className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl transition-all group"
          >
            <div className="w-16 h-16 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Access</h3>
            <p className="text-sm text-gray-400 text-center">
              Manage dApps, categories, and flows via email.
            </p>
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginSelectionModal;
