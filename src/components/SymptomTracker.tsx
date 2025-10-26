import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';
import { generateId } from '../utils/initialization';
import { formatLocalDateTimeInput } from '../utils/datetime';
import { Thermometer, AlertTriangle, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import Modal from './common/Modal';
import toast from 'react-hot-toast';

export interface Symptom {
  id: string;
  name: string;
  category: 'respiratory' | 'digestive' | 'skin' | 'behavioral' | 'fever' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  timestamp: Date;
  duration?: number; // in minutes
  notes?: string;
  triggers?: string[];
  photos?: string[]; // base64 encoded images
  temperature?: number;
  associatedMedication?: string;
}

const SymptomTracker: React.FC = () => {
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [editSymptom, setEditSymptom] = useState<Symptom | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const [newSymptom, setNewSymptom] = useState<Partial<Symptom>>({
    name: '',
    category: 'other',
    severity: 'mild',
    timestamp: new Date(),
    notes: '',
    triggers: [],
    photos: []
  });

  const symptomCategories = [
    { value: 'respiratory', label: 'Respiratory', icon: '🫁', color: 'bg-blue-100 text-blue-800' },
    { value: 'digestive', label: 'Digestive', icon: '🍼', color: 'bg-green-100 text-green-800' },
    { value: 'skin', label: 'Skin', icon: '🩹', color: 'bg-pink-100 text-pink-800' },
    { value: 'behavioral', label: 'Behavioral', icon: '😢', color: 'bg-purple-100 text-purple-800' },
    { value: 'fever', label: 'Fever/Temperature', icon: '🌡️', color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Other', icon: '❓', color: 'bg-gray-100 text-gray-800' }
  ];

  const commonSymptoms = {
    respiratory: ['Cough', 'Runny nose', 'Congestion', 'Wheezing', 'Difficulty breathing'],
    digestive: ['Vomiting', 'Diarrhea', 'Constipation', 'Gas', 'Reflux', 'Loss of appetite'],
    skin: ['Rash', 'Eczema', 'Dry skin', 'Diaper rash', 'Hives', 'Redness'],
    behavioral: ['Excessive crying', 'Fussiness', 'Sleep issues', 'Lethargy', 'Irritability'],
    fever: ['High temperature', 'Chills', 'Sweating', 'Hot to touch'],
    other: ['Ear pain', 'Teething', 'Growth spurt', 'Developmental concern']
  };

  const severityColors = {
    mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
    severe: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
  };

  const handleAddSymptom = async () => {
    if (!profile || !newSymptom.name) {
      toast.error('Please fill in the symptom name');
      return;
    }

    const symptom: Symptom = {
      id: generateId(),
      name: newSymptom.name,
      category: newSymptom.category || 'other',
      severity: newSymptom.severity || 'mild',
      timestamp: newSymptom.timestamp || new Date(),
      duration: newSymptom.duration,
      notes: newSymptom.notes,
      triggers: newSymptom.triggers || [],
      photos: newSymptom.photos || [],
      temperature: newSymptom.temperature,
      associatedMedication: newSymptom.associatedMedication
    };

    try {
      setSymptoms(prev => [...prev, symptom]);
      
      // Log the symptom as an activity
      const activityLog = {
        id: generateId(),
        type: 'health',
        icon: '🏥',
        color: '',
        details: `${symptom.name} (${symptom.severity})`,
        timestamp: symptom.timestamp,
        notes: symptom.notes
      };

      addLog(profile.id, activityLog);
      
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, activityLog);
      }

      setShowAddSymptom(false);
      setNewSymptom({
        name: '',
        category: 'other',
        severity: 'mild',
        timestamp: new Date(),
        notes: '',
        triggers: [],
        photos: []
      });
      
      toast.success('Symptom logged successfully!');
    } catch (error) {
      toast.error('Failed to log symptom');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error('Photo too large. Please choose a smaller image.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setNewSymptom(prev => ({
          ...prev,
          photos: [...(prev.photos || []), base64]
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const removePhoto = (index: number) => {
    setNewSymptom(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || []
    }));
  };

  const addTrigger = (trigger: string) => {
    if (trigger.trim() && !newSymptom.triggers?.includes(trigger.trim())) {
      setNewSymptom(prev => ({
        ...prev,
        triggers: [...(prev.triggers || []), trigger.trim()]
      }));
    }
  };

  const removeTrigger = (trigger: string) => {
    setNewSymptom(prev => ({
      ...prev,
      triggers: prev.triggers?.filter(t => t !== trigger) || []
    }));
  };

  const getSymptomsByCategory = () => {
    return symptomCategories.map(category => ({
      ...category,
      symptoms: symptoms.filter(s => s.category === category.value)
    }));
  };

  const getRecentSymptoms = () => {
    return symptoms
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Symptom Tracker</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor {profile.babyName}'s health symptoms and patterns
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddSymptom(true)}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Symptom
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Symptoms</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{symptoms.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {symptoms.filter(s => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(s.timestamp) >= weekAgo;
                }).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Severe Cases</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {symptoms.filter(s => s.severity === 'severe').length}
              </p>
            </div>
            <Thermometer className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Symptoms by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getSymptomsByCategory().map(category => (
          <div key={category.value} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{category.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.symptoms.length} symptoms
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${category.color}`}>
                {category.symptoms.length}
              </span>
            </div>
            
            {category.symptoms.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No symptoms recorded</p>
            ) : (
              <div className="space-y-2">
                {category.symptoms.slice(0, 3).map(symptom => (
                  <div key={symptom.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{symptom.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(symptom.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${severityColors[symptom.severity]}`}>
                      {symptom.severity}
                    </span>
                  </div>
                ))}
                {category.symptoms.length > 3 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{category.symptoms.length - 3} more
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Symptoms */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Symptoms
        </h3>
        
        {symptoms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No symptoms recorded yet</p>
            <p className="text-sm">Log a symptom to start tracking health patterns</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getRecentSymptoms().map(symptom => (
              <motion.div
                key={symptom.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {symptom.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${severityColors[symptom.severity]}`}>
                        {symptom.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        symptomCategories.find(c => c.value === symptom.category)?.color
                      }`}>
                        {symptomCategories.find(c => c.value === symptom.category)?.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(symptom.timestamp).toLocaleString()}
                      {symptom.duration && ` • Duration: ${Math.floor(symptom.duration / 60)}h ${symptom.duration % 60}m`}
                    </p>
                    
                    {symptom.temperature && (
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                        Temperature: {symptom.temperature}°F
                      </p>
                    )}
                    
                    {symptom.triggers && symptom.triggers.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Triggers:</p>
                        <div className="flex flex-wrap gap-1">
                          {symptom.triggers.map(trigger => (
                            <span key={trigger} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {symptom.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <strong>Notes:</strong> {symptom.notes}
                      </p>
                    )}
                    
                    {symptom.photos && symptom.photos.length > 0 && (
                      <div className="flex space-x-2 mb-2">
                        {symptom.photos.map((photo, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPhoto(photo)}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <img src={photo} alt={`Symptom ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditSymptom(symptom)}
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSymptoms(prev => prev.filter(s => s.id !== symptom.id));
                        toast.success('Symptom deleted');
                      }}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Symptom Modal */}
      <Modal isOpen={showAddSymptom} onClose={() => setShowAddSymptom(false)} title="Log New Symptom" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symptom Name *
              </label>
              <input
                type="text"
                value={newSymptom.name || ''}
                onChange={(e) => setNewSymptom({ ...newSymptom, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="e.g., Cough, Rash, Fever"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={newSymptom.category || 'other'}
                onChange={(e) => setNewSymptom({ ...newSymptom, category: e.target.value as Symptom['category'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {symptomCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={newSymptom.severity || 'mild'}
                onChange={(e) => setNewSymptom({ ...newSymptom, severity: e.target.value as Symptom['severity'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature (°F) - Optional
              </label>
              <input
                type="number"
                step="0.1"
                min="95"
                max="110"
                value={newSymptom.temperature || ''}
                onChange={(e) => setNewSymptom({ ...newSymptom, temperature: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="98.6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Noticed
            </label>
            <input
              type="datetime-local"
              value={formatLocalDateTimeInput(newSymptom.timestamp)}
              onChange={(e) => setNewSymptom({ ...newSymptom, timestamp: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (Optional)
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              {newSymptom.photos && newSymptom.photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newSymptom.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`Upload ${index + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={newSymptom.notes || ''}
              onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Describe the symptom, when it started, any patterns noticed..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleAddSymptom}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Log Symptom
            </button>
            <button
              onClick={() => setShowAddSymptom(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Photo Viewer Modal */}
      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title="Symptom Photo">
        {selectedPhoto && (
          <div className="text-center">
            <img src={selectedPhoto} alt="Symptom" className="max-w-full max-h-96 mx-auto rounded-lg" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SymptomTracker;