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
import AdminDashboard from './pages/AdminDashboard';
import AdminDAppsManagement from './pages/AdminDAppsManagement';
import AdminDAppForm from './pages/AdminDAppForm';
import AdminCategoriesManagement from './pages/AdminCategoriesManagement';
import AdminFlowsManagement from './pages/AdminFlowsManagement';
import AdminFlowForm from './pages/AdminFlowForm';
import AdminMediaLibrary from './pages/AdminMediaLibrary';
import AdminIntegrationsManagement from './pages/AdminIntegrationsManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            {/* Admin Login - No Layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
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
                  <Route path="/category/:slug" element={<CategoryListing />} />
                  <Route path="/dapp/:id" element={<DAppSpotlight />} />
                  <Route path="/flow/:id" element={<FlowViewer />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;