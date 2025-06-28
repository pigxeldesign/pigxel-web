import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Edit, 
  Copy, 
  Eye, 
  Star, 
  StarOff, 
  Folder, 
  FolderPlus, 
  Tag, 
  X, 
  Check, 
  AlertCircle, 
  Image as ImageIcon, 
  FileImage, 
  Calendar, 
  HardDrive, 
  ExternalLink,
  Loader2,
  ChevronDown,
  Plus,
  Move,
  Archive,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';

interface MediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  folder_id?: string;
  tags: string[];
  is_favorite: boolean;
  usage_count: number;
  used_in: string[];
  uploaded_at: string;
  updated_at: string;
}

interface MediaFolder {
  id: string;
  name: string;
  description?: string;
  file_count: number;
  created_at: string;
}

interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

const AdminMediaLibrary: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [selectedUsage, setSelectedUsage] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data
  const mockMediaFiles: MediaFile[] = [
    {
      id: '1',
      filename: 'uniswap-logo.png',
      original_name: 'Uniswap Logo.png',
      file_type: 'PNG',
      file_size: 45600,
      url: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      thumbnail_url: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
      folder_id: '1',
      tags: ['logo', 'defi', 'uniswap'],
      is_favorite: true,
      usage_count: 12,
      used_in: ['Uniswap dApp', 'DeFi Category'],
      uploaded_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-06-28T14:30:00Z'
    },
    {
      id: '2',
      filename: 'metamask-screenshot.jpg',
      original_name: 'MetaMask Interface Screenshot.jpg',
      file_type: 'JPG',
      file_size: 128400,
      url: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      thumbnail_url: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
      folder_id: '2',
      tags: ['screenshot', 'wallet', 'metamask', 'interface'],
      is_favorite: false,
      usage_count: 8,
      used_in: ['MetaMask Flow', 'Wallet Tutorial'],
      uploaded_at: '2024-02-10T09:15:00Z',
      updated_at: '2024-06-27T16:45:00Z'
    },
    {
      id: '3',
      filename: 'opensea-nft-marketplace.png',
      original_name: 'OpenSea NFT Marketplace.png',
      file_type: 'PNG',
      file_size: 89200,
      url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      thumbnail_url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
      folder_id: '3',
      tags: ['nft', 'marketplace', 'opensea', 'trading'],
      is_favorite: true,
      usage_count: 15,
      used_in: ['OpenSea dApp', 'NFT Tutorial', 'Creative Category'],
      uploaded_at: '2024-03-05T11:30:00Z',
      updated_at: '2024-06-26T12:20:00Z'
    },
    {
      id: '4',
      filename: 'defi-protocol-diagram.svg',
      original_name: 'DeFi Protocol Diagram.svg',
      file_type: 'SVG',
      file_size: 23800,
      url: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      thumbnail_url: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
      folder_id: '1',
      tags: ['diagram', 'defi', 'protocol', 'illustration'],
      is_favorite: false,
      usage_count: 3,
      used_in: ['DeFi Guide'],
      uploaded_at: '2024-04-12T08:45:00Z',
      updated_at: '2024-06-25T10:15:00Z'
    },
    {
      id: '5',
      filename: 'web3-onboarding-flow.png',
      original_name: 'Web3 Onboarding Flow.png',
      file_type: 'PNG',
      file_size: 156700,
      url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      thumbnail_url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
      folder_id: '2',
      tags: ['onboarding', 'flow', 'web3', 'tutorial'],
      is_favorite: false,
      usage_count: 0,
      used_in: [],
      uploaded_at: '2024-05-20T13:20:00Z',
      updated_at: '2024-06-24T09:30:00Z'
    },
    {
      id: '6',
      filename: 'blockchain-network-visual.jpg',
      original_name: 'Blockchain Network Visual.jpg',
      file_type: 'JPG',
      file_size: 203400,
      url: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      thumbnail_url: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
      folder_id: '4',
      tags: ['blockchain', 'network', 'visualization', 'infrastructure'],
      is_favorite: true,
      usage_count: 7,
      used_in: ['Infrastructure Category', 'Blockchain Guide'],
      uploaded_at: '2024-06-01T15:10:00Z',
      updated_at: '2024-06-23T14:45:00Z'
    }
  ];

  const mockFolders: MediaFolder[] = [
    { id: '1', name: 'DeFi Assets', description: 'Images and graphics for DeFi applications', file_count: 24, created_at: '2024-01-15T10:00:00Z' },
    { id: '2', name: 'Wallet Screenshots', description: 'Interface screenshots for wallet tutorials', file_count: 18, created_at: '2024-02-10T09:15:00Z' },
    { id: '3', name: 'NFT Marketplace', description: 'NFT and marketplace related visuals', file_count: 32, created_at: '2024-03-05T11:30:00Z' },
    { id: '4', name: 'Infrastructure', description: 'Blockchain and infrastructure diagrams', file_count: 15, created_at: '2024-04-12T08:45:00Z' },
    { id: '5', name: 'Logos & Branding', description: 'dApp logos and branding materials', file_count: 67, created_at: '2024-05-20T13:20:00Z' }
  ];

  const fileTypes = ['All', 'PNG', 'JPG', 'SVG', 'GIF', 'WebP'];
  const usageOptions = ['All', 'Used', 'Unused', 'Favorites'];

  useEffect(() => {
    loadMediaFiles();
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedFiles.size > 0);
  }, [selectedFiles]);

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setMediaFiles(mockMediaFiles);
        setFolders(mockFolders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading media files:', error);
      setLoading(false);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(file => file.id)));
    }
  };

  const toggleFavorite = async (fileId: string) => {
    setMediaFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, is_favorite: !file.is_favorite } : file
    ));
  };

  const deleteFile = async (fileId: string) => {
    const file = mediaFiles.find(f => f.id === fileId);
    if (file && file.usage_count > 0) {
      if (!window.confirm(`This file is used in ${file.usage_count} place(s). Are you sure you want to delete it?`)) {
        return;
      }
    }
    
    setMediaFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: MediaFolder = {
      id: `folder_${Date.now()}`,
      name: newFolderName,
      file_count: 0,
      created_at: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setShowCreateFolder(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFolder = !selectedFolder || file.folder_id === selectedFolder;
    const matchesFileType = !selectedFileType || selectedFileType === 'All' || file.file_type === selectedFileType;
    const matchesUsage = !selectedUsage || selectedUsage === 'All' ||
                        (selectedUsage === 'Used' && file.usage_count > 0) ||
                        (selectedUsage === 'Unused' && file.usage_count === 0) ||
                        (selectedUsage === 'Favorites' && file.is_favorite);

    return matchesSearch && matchesFolder && matchesFileType && matchesUsage;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFolder('');
    setSelectedFileType('');
    setSelectedUsage('');
  };

  const hasActiveFilters = searchTerm || selectedFolder || selectedFileType || selectedUsage;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      const uploadId = `upload_${Date.now()}_${Math.random()}`;
      const newUpload: UploadProgress = {
        id: uploadId,
        filename: file.name,
        progress: 0,
        status: 'uploading'
      };
      
      setUploadQueue(prev => [...prev, newUpload]);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadQueue(prev => prev.map(upload => {
          if (upload.id === uploadId) {
            const newProgress = Math.min(upload.progress + Math.random() * 20, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...upload, progress: 100, status: 'completed' };
            }
            return { ...upload, progress: newProgress };
          }
          return upload;
        }));
      }, 500);
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
            <p className="text-gray-400">
              Manage and organize visual assets for your dApps and flows
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </button>
            <label className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
              />
            </label>
          </div>
        </div>

        {/* Upload Queue */}
        <AnimatePresence>
          {uploadQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6"
            >
              <h3 className="text-white font-medium mb-3">Upload Progress</h3>
              <div className="space-y-2">
                {uploadQueue.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{upload.filename}</span>
                        <span className="text-xs text-gray-400">{Math.round(upload.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                    {upload.status === 'completed' && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files by name or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center px-4 py-3 bg-gray-700 border border-gray-600 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 border rounded-lg font-medium transition-colors ${
                  hasActiveFilters || showFilters
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Folder Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Folder</label>
                    <select
                      value={selectedFolder}
                      onChange={(e) => setSelectedFolder(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Folders</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* File Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">File Type</label>
                    <select
                      value={selectedFileType}
                      onChange={(e) => setSelectedFileType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {fileTypes.map(type => (
                        <option key={type} value={type === 'All' ? '' : type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Usage Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Usage</label>
                    <select
                      value={selectedUsage}
                      onChange={(e) => setSelectedUsage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {usageOptions.map(option => (
                        <option key={option} value={option === 'All' ? '' : option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {showBulkActions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-purple-300 font-medium">
                    {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      <Move className="w-3 h-3 mr-1 inline" />
                      Move
                    </button>
                    <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors">
                      <Tag className="w-3 h-3 mr-1 inline" />
                      Tag
                    </button>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      <Download className="w-3 h-3 mr-1 inline" />
                      Download
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                      <Trash2 className="w-3 h-3 mr-1 inline" />
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFiles(new Set())}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-400">
            Showing {filteredFiles.length} of {mediaFiles.length} files
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              {selectedFiles.size === filteredFiles.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Media Grid/List */}
        <div 
          className={`bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden ${
            isDragOver ? 'border-purple-500 bg-purple-600/10' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-2">No files found</h3>
              <p className="text-gray-400 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to find files.'
                  : 'Upload your first files to get started.'
                }
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <label className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
                  />
                </label>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden hover:border-purple-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleFileSelect(file.id)}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(file.id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {file.is_favorite ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Image */}
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={file.thumbnail_url || file.url}
                        alt={file.original_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* File Type Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                          {file.file_type}
                        </span>
                      </div>

                      {/* Usage Count */}
                      {file.usage_count > 0 && (
                        <div className="absolute bottom-2 right-2">
                          <span className="px-2 py-1 bg-green-600/80 text-white text-xs rounded">
                            {file.usage_count} uses
                          </span>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-3">
                      <h3 className="text-white text-sm font-medium truncate mb-1">
                        {file.original_name}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {formatFileSize(file.file_size)}
                      </p>
                      
                      {/* Tags */}
                      {file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {file.tags.length > 2 && (
                            <span className="text-gray-400 text-xs">
                              +{file.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit
                        }}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(file.url);
                        }}
                        className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div>
              {/* List Header */}
              <div className="bg-gray-700/50 border-b border-gray-600 px-6 py-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-300">
                    <div className="col-span-4">File</div>
                    <div className="col-span-2">Type & Size</div>
                    <div className="col-span-2">Folder</div>
                    <div className="col-span-2">Usage</div>
                    <div className="col-span-1">Uploaded</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>
              </div>

              {/* List Items */}
              <div className="divide-y divide-gray-700/50">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700/30 transition-colors group"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                        />
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          {/* File Info */}
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={file.thumbnail_url || file.url}
                                  alt={file.original_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-white truncate">{file.original_name}</h3>
                                  {file.is_favorite && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 truncate">{file.filename}</p>
                              </div>
                            </div>
                          </div>

                          {/* Type & Size */}
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                {file.file_type}
                              </span>
                              <p className="text-sm text-gray-400">{formatFileSize(file.file_size)}</p>
                            </div>
                          </div>

                          {/* Folder */}
                          <div className="col-span-2">
                            <span className="text-gray-300">
                              {folders.find(f => f.id === file.folder_id)?.name || 'No folder'}
                            </span>
                          </div>

                          {/* Usage */}
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{file.usage_count}</span>
                                <span className="text-gray-400 text-sm">uses</span>
                              </div>
                              {file.used_in.length > 0 && (
                                <p className="text-xs text-gray-500 truncate">
                                  {file.used_in.slice(0, 2).join(', ')}
                                  {file.used_in.length > 2 && ` +${file.used_in.length - 2}`}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Uploaded */}
                          <div className="col-span-1">
                            <span className="text-gray-400 text-sm">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigator.clipboard.writeText(file.url)}
                                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded-lg transition-colors"
                                title="Copy URL"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFile(file.id)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600/20 rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Drag & Drop Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-purple-600/20 border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center z-50">
              <div className="text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-white mb-2">Drop files to upload</p>
                <p className="text-gray-400">Supported formats: PNG, JPG, SVG, GIF, WebP</p>
              </div>
            </div>
          )}
        </div>

        {/* Create Folder Modal */}
        <AnimatePresence>
          {showCreateFolder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateFolder(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Create New Folder</h2>
                  <button
                    onClick={() => setShowCreateFolder(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Folder Name *
                    </label>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter folder name"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={createFolder}
                      disabled={!newFolderName.trim()}
                      className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create Folder
                    </button>
                    <button
                      onClick={() => setShowCreateFolder(false)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminMediaLibrary;