import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import DAppSpotlight from './pages/DAppSpotlight';
import FlowViewer from './pages/FlowViewer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/dapp/:id" element={<DAppSpotlight />} />
            <Route path="/flow/:id" element={<FlowViewer />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;