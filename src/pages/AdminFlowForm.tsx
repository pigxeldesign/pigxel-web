import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import { ArrowLeft, Save, Search, Check, Upload, X } from 'lucide-react';

interface DApp {
  id: string;
  name: string;
  category: {
    title: string;
  };
  sub_category: string;
}

interface FlowFormData {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  is_premium: boolean;
  dapp_id: string;
}

export default function AdminFlowForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FlowFormData>({
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    is_premium: false,
    dapp_id: ''
  });

  const [dapps, setDapps] = useState<DApp[]>([]);
  const [dappSearchTerm, setDappSearchTerm] = useState('');
  const [showDappDropdown, setShowDappDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDApps();
    if (isEditing) {
      fetchFlow();
    }
  }, [id, isEditing]);

  const fetchDApps = async () => {
    try {
      const { data, error } = await supabase
        .from('dapps')
        .select(`
          id,
          name,
          sub_category,
          categories!inner(title)
        `)
        .order('name');

      if (error) throw error;

      const formattedDapps = data.map(dapp => ({
        id: dapp.id,
        name: dapp.name,
        sub_category: dapp.sub_category,
        category: {
          title: dapp.categories.title
        }
      }));

      setDapps(formattedDapps);
    } catch (error) {
      console.error('Error fetching dApps:', error);
      setError('Failed to load dApps');
    }
  };

  const fetchFlow = async () => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        description: data.description,
        duration: data.duration,
        difficulty: data.difficulty,
        is_premium: data.is_premium,
        dapp_id: data.dapp_id
      });

      // Set the search term to the selected dApp name
      const selectedDapp = dapps.find(dapp => dapp.id === data.dapp_id);
      if (selectedDapp) {
        setDappSearchTerm(selectedDapp.name);
      }
    } catch (error) {
      console.error('Error fetching flow:', error);
      setError('Failed to load flow');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('flows')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('flows')
          .insert([formData]);

        if (error) throw error;
      }

      navigate('/admin/flows');
    } catch (error) {
      console.error('Error saving flow:', error);
      setError('Failed to save flow');
    } finally {
      setLoading(false);
    }
  };

  const handleDappSelect = (dapp: DApp) => {
    setFormData(prev => ({ ...prev, dapp_id: dapp.id }));
    setDappSearchTerm(dapp.name);
    setShowDappDropdown(false);
  };

  const filteredDapps = dapps.filter(dapp =>
    dapp.name.toLowerCase().includes(dappSearchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/flows')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Flow' : 'Create New Flow'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900/50 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 5 minutes"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">dApp</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={dappSearchTerm}
                    onChange={(e) => {
                      setDappSearchTerm(e.target.value);
                      setShowDappDropdown(true);
                    }}
                    onFocus={() => setShowDappDropdown(true)}
                    placeholder="Search for a dApp..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                {showDappDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredDapps.length > 0 ? (
                      <div className="py-1">
                        {filteredDapps.map((dapp) => (
                          <button
                            key={dapp.id}
                            type="button"
                            onClick={() => handleDappSelect(dapp)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{dapp.name}</div>
                              <div className="text-sm text-gray-400">
                                {dapp.category.title} • {dapp.sub_category}
                              </div>
                            </div>
                            {formData.dapp_id === dapp.id && (
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-gray-400 text-center">
                        {dappSearchTerm ? 'No dApps found' : 'Start typing to search...'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_premium"
                checked={formData.is_premium}
                onChange={(e) => setFormData(prev => ({ ...prev, is_premium: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_premium" className="text-sm font-medium">
                Premium Flow
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/flows')}
              className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : (isEditing ? 'Update Flow' : 'Create Flow')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}