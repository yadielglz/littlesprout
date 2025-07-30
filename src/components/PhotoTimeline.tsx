import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';
import { generateId } from '../utils/initialization';
import { Camera, Plus, X, Calendar, Heart, Trash2, Download, Share2, Filter } from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

export interface PhotoEntry {
  id: string;
  imageData: string; // base64 encoded image
  caption: string;
  milestone?: string;
  ageAtPhoto: string; // e.g., "3 months 2 days"
  timestamp: Date;
  tags: string[];
  isFavorite: boolean;
}

const PhotoTimeline: React.FC = () => {
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [newPhoto, setNewPhoto] = useState({
    imageData: '',
    caption: '',
    milestone: '',
    tags: [] as string[],
    isFavorite: false
  });

  const [newTag, setNewTag] = useState('');

  // Common milestone suggestions
  const milestoneOptions = [
    'First smile',
    'First laugh',
    'Rolling over',
    'Sitting up',
    'First tooth',
    'Crawling',
    'Standing',
    'First steps',
    'First words',
    'First birthday',
    'Sleeping through the night',
    'First solid food',
    'First bath',
    'Coming home from hospital',
    'Meeting family',
    'First outing',
    'First vacation',
    'Growth spurt',
    'New skill learned',
    'Funny moment'
  ];

  // Calculate age at photo
  const calculateAge = (photoDate: Date) => {
    if (!profile) return '';
    
    const birthDate = new Date(profile.dob);
    const diffTime = photoDate.getTime() - birthDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const months = Math.floor(diffDays / 30.44);
    const days = Math.floor(diffDays % 30.44);
    
    if (months === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  // Load photos from localStorage
  React.useEffect(() => {
    if (profile) {
      const savedPhotos = localStorage.getItem(`photoTimeline_${profile.id}`);
      if (savedPhotos) {
        try {
          const parsedPhotos = JSON.parse(savedPhotos).map((photo: any) => ({
            ...photo,
            timestamp: new Date(photo.timestamp)
          }));
          setPhotos(parsedPhotos);
        } catch (error) {
          console.error('Failed to load photos:', error);
        }
      }
    }
  }, [profile]);

  // Save photos to localStorage
  React.useEffect(() => {
    if (profile && photos.length >= 0) {
      localStorage.setItem(`photoTimeline_${profile.id}`, JSON.stringify(photos));
    }
  }, [photos, profile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error('Photo too large. Please choose a smaller image (max 1MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setNewPhoto(prev => ({ ...prev, imageData: base64 }));
      setShowAddPhoto(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.imageData || !newPhoto.caption.trim() || !profile) {
      toast.error('Please add a photo and caption');
      return;
    }

    const photoEntry: PhotoEntry = {
      id: generateId(),
      imageData: newPhoto.imageData,
      caption: newPhoto.caption.trim(),
      milestone: newPhoto.milestone,
      ageAtPhoto: calculateAge(new Date()),
      timestamp: new Date(),
      tags: newPhoto.tags,
      isFavorite: newPhoto.isFavorite
    };

    try {
      setPhotos(prev => [photoEntry, ...prev]);
      
      // Also log as an activity
      const activityLog = {
        id: generateId(),
        type: 'milestone',
        icon: '📸',
        color: '',
        details: `Photo: ${photoEntry.caption}${photoEntry.milestone ? ` (${photoEntry.milestone})` : ''}`,
        timestamp: new Date(),
        notes: `Age: ${photoEntry.ageAtPhoto}`
      };

      addLog(profile.id, activityLog);
      
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, activityLog);
      }

      setNewPhoto({
        imageData: '',
        caption: '',
        milestone: '',
        tags: [],
        isFavorite: false
      });
      setShowAddPhoto(false);
      toast.success('Photo added to timeline!');
    } catch (error) {
      toast.error('Failed to add photo');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newPhoto.tags.includes(newTag.trim())) {
      setNewPhoto(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPhoto(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleToggleFavorite = (photoId: string) => {
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, isFavorite: !photo.isFavorite }
          : photo
      )
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    setSelectedPhoto(null);
    toast.success('Photo deleted');
  };

  const handleDownloadPhoto = (photo: PhotoEntry) => {
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = `${profile?.babyName}_${photo.caption.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSharePhoto = async (photo: PhotoEntry) => {
    if (navigator.share) {
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(photo.imageData);
        const blob = await response.blob();
        const file = new File([blob], `${photo.caption}.jpg`, { type: 'image/jpeg' });
        
        await navigator.share({
          title: photo.caption,
          text: `${profile?.babyName} - ${photo.caption}`,
          files: [file]
        });
      } catch (error) {
        toast.error('Sharing not supported on this device');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${photo.caption} - Age: ${photo.ageAtPhoto}`);
        toast.success('Photo details copied to clipboard');
      } catch (error) {
        toast.error('Sharing not available');
      }
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(photos.flatMap(photo => photo.tags)));

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    if (showFavoritesOnly && !photo.isFavorite) return false;
    if (filterTag !== 'all' && !photo.tags.includes(filterTag)) return false;
    return true;
  });

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
            <Camera className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Photo Timeline</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Capture and cherish {profile.babyName}'s precious moments
            </p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Photo
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
              showFavoritesOnly 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <Heart className={`w-3 h-3 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites Only
          </button>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredPhotos.length} of {photos.length} photos
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
          <p>Start capturing precious moments!</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Add Your First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative">
                  <img
                    src={photo.imageData}
                    alt={photo.caption}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(photo.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <Heart className={`w-4 h-4 text-white ${photo.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  {photo.milestone && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      🎉 {photo.milestone}
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                    {photo.caption}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{photo.ageAtPhoto}</span>
                    <span className="mx-2">•</span>
                    <span>{photo.timestamp.toLocaleDateString()}</span>
                  </div>
                  
                  {photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {photo.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{photo.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Photo Modal */}
      <Modal isOpen={showAddPhoto} onClose={() => setShowAddPhoto(false)} title="Add Photo to Timeline" size="large">
        <div className="space-y-4">
          {newPhoto.imageData && (
            <div className="text-center">
              <img
                src={newPhoto.imageData}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Caption *
            </label>
            <input
              type="text"
              value={newPhoto.caption}
              onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Describe this precious moment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Milestone (Optional)
            </label>
            <select
              value={newPhoto.milestone}
              onChange={(e) => setNewPhoto({ ...newPhoto, milestone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="">Select a milestone...</option>
              {milestoneOptions.map(milestone => (
                <option key={milestone} value={milestone}>{milestone}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Add a tag..."
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Add
              </button>
            </div>
            {newPhoto.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newPhoto.tags.map(tag => (
                  <span key={tag} className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="favorite"
              checked={newPhoto.isFavorite}
              onChange={(e) => setNewPhoto({ ...newPhoto, isFavorite: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="favorite" className="text-sm text-gray-700 dark:text-gray-300">
              Mark as favorite
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleAddPhoto}
              className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Add to Timeline
            </button>
            <button
              onClick={() => setShowAddPhoto(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Photo Detail Modal */}
      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title="Photo Details" size="large">
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="text-center">
              <img
                src={selectedPhoto.imageData}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-96 mx-auto rounded-lg"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {selectedPhoto.caption}
              </h3>
              {selectedPhoto.milestone && (
                <p className="text-pink-600 dark:text-pink-400 mb-2">
                  🎉 Milestone: {selectedPhoto.milestone}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Age: {selectedPhoto.ageAtPhoto}</span>
                <span className="mx-2">•</span>
                <span>{selectedPhoto.timestamp.toLocaleDateString()}</span>
              </div>
              
              {selectedPhoto.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPhoto.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleToggleFavorite(selectedPhoto.id)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  selectedPhoto.isFavorite
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${selectedPhoto.isFavorite ? 'fill-current' : ''}`} />
                {selectedPhoto.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
              
              <button
                onClick={() => handleDownloadPhoto(selectedPhoto)}
                className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              
              <button
                onClick={() => handleSharePhoto(selectedPhoto)}
                className="flex items-center px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="flex items-center px-3 py-2 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoTimeline;