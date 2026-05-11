import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import DAppSpotlight from './pages/DAppSpotlight';
import FlowViewer from './pages/FlowViewer';
import CategoryListing from './pages/CategoryListing';
import AdminLogin from './pages/AdminLogin';
import UserLogin from './pages/UserLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDAppsManagement from './pages/AdminDAppsManagement';
import AdminDAppForm from './pages/AdminDAppForm';
import AdminCategoriesManagement from './pages/AdminCategoriesManagement';
import AdminFlowsManagement from './pages/AdminFlowsManagement';
import AdminFlowForm from './pages/AdminFlowForm';
import AdminMediaLibrary from './pages/AdminMediaLibrary';
import AdminIntegrationsManagement from './pages/AdminIntegrationsManagement';
import Web3NavigatorPage from './pages/Web3NavigatorPage';
import AllCategoriesPage from './pages/AllCategoriesPage';
import FeaturedPage from './pages/FeaturedPage';
import NewPage from './pages/NewPage';
import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

// A component that detects auth errors from the URL and displays a global snackbar
const GlobalAuthErrorToast = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Supabase redirects can put errors in the hash or query string
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    let errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    
    if (errorDescription) {
      // Decode the error message
      errorDescription = decodeURIComponent(errorDescription).replace(/\+/g, ' ');
      setErrorMsg(errorDescription);
      
      // Clean up the URL to prevent showing it again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto dismiss after 8 seconds
      setTimeout(() => setErrorMsg(null), 8000);
    }
  }, []);

  if (!errorMsg) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start space-x-3 px-6 py-4 rounded-xl shadow-2xl bg-red-500/90 border border-red-500 text-white backdrop-blur-sm max-w-md w-[90vw]">
        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-sm mb-1">Authentication Failed</p>
          <p className="text-sm opacity-90 leading-snug">{errorMsg}</p>
        </div>
        <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <GlobalAuthErrorToast />
          <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/user/login" element={<UserLogin />} />
            
            {/* Protected Admin Routes - Uses AdminLayout internally */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin dApps Management */}
            <Route 
              path="/admin/dapps" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDAppsManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin dApp Form - Create */}
            <Route 
              path="/admin/dapps/new" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDAppForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin dApp Form - Edit */}
            <Route 
              path="/admin/dapps/edit/:id" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDAppForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Categories Management */}
            <Route 
              path="/admin/categories" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCategoriesManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Flows Management */}
            <Route 
              path="/admin/flows" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminFlowsManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Flow Form - Create */}
            <Route 
              path="/admin/flows/new" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminFlowForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Flow Form - Edit */}
            <Route 
              path="/admin/flows/edit/:id" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminFlowForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Media Library */}
            <Route 
              path="/admin/media" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminMediaLibrary />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Integrations Management */}
            <Route 
              path="/admin/integrations" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminIntegrationsManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Routes with Layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/navigator" element={<Web3NavigatorPage />} />
                  <Route path="/categories" element={<AllCategoriesPage />} />
                  <Route path="/featured" element={<FeaturedPage />} />
                  <Route path="/new" element={<NewPage />} />
                  <Route path="/category/:slug" element={<CategoryListing />} />
                  <Route path="/dapp/:id" element={<DAppSpotlight />} />
                  <Route path="/flow/:id" element={<FlowViewer />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;