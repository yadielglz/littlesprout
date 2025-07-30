import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';
import { generateId } from '../utils/initialization';
import { StickyNote, Plus, X, Edit, Trash2, Save, Pin, PinOff } from 'lucide-react';
import toast from 'react-hot-toast';

export interface QuickNote {
  id: string;
  text: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuickNotesWidget: React.FC = () => {
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();

  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<QuickNote['color']>('yellow');

  const noteColors = {
    yellow: 'bg-yellow-200 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
    blue: 'bg-blue-200 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100',
    green: 'bg-green-200 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100',
    pink: 'bg-pink-200 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-900 dark:text-pink-100',
    purple: 'bg-purple-200 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-100',
    orange: 'bg-orange-200 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100'
  };

  const colorOptions = [
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-300' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-300' },
    { value: 'green', label: 'Green', class: 'bg-green-300' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-300' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-300' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-300' }
  ];

  // Load notes from localStorage on component mount
  useEffect(() => {
    if (profile) {
      const savedNotes = localStorage.getItem(`quickNotes_${profile.id}`);
      if (savedNotes) {
        try {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }));
          setNotes(parsedNotes);
        } catch (error) {
          console.error('Failed to load notes:', error);
        }
      }
    }
  }, [profile]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (profile && notes.length >= 0) {
      localStorage.setItem(`quickNotes_${profile.id}`, JSON.stringify(notes));
    }
  }, [notes, profile]);

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !profile) return;

    const note: QuickNote = {
      id: generateId(),
      text: newNoteText.trim(),
      color: newNoteColor,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      setNotes(prev => [note, ...prev]);
      
      // Also log as an activity
      const activityLog = {
        id: generateId(),
        type: 'note',
        icon: '📝',
        color: '',
        details: `Quick Note: ${note.text.substring(0, 50)}${note.text.length > 50 ? '...' : ''}`,
        timestamp: new Date(),
        notes: note.text
      };

      addLog(profile.id, activityLog);
      
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, activityLog);
      }

      setNewNoteText('');
      setNewNoteColor('yellow');
      setShowAddNote(false);
      toast.success('Note added!');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleUpdateNote = (noteId: string, updates: Partial<QuickNote>) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Note deleted');
  };

  const handleTogglePin = (noteId: string) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === noteId 
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
          : note
      )
    );
  };

  const handleSaveEdit = () => {
    if (editingNote && editingNote.text.trim()) {
      handleUpdateNote(editingNote.id, { text: editingNote.text.trim() });
      setEditingNote(null);
      toast.success('Note updated');
    }
  };

  // Sort notes: pinned first, then by creation date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (!profile) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Notes</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">({notes.length})</span>
        </div>
        <button
          onClick={() => setShowAddNote(true)}
          className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      <AnimatePresence>
        {showAddNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="space-y-3">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write a quick note..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-yellow-500"
                autoFocus
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                  <div className="flex space-x-1">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setNewNoteColor(color.value as QuickNote['color'])}
                        className={`w-6 h-6 rounded-full ${color.class} border-2 ${
                          newNoteColor === color.value 
                            ? 'border-gray-800 dark:border-white' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowAddNote(false);
                      setNewNoteText('');
                      setNewNoteColor('yellow');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No notes yet</p>
          <p className="text-sm">Add a quick note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {sortedNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`relative p-3 rounded-lg border-2 shadow-sm ${noteColors[note.color]} transform hover:scale-105 transition-transform`}
                style={{ minHeight: '120px' }}
              >
                {/* Pin indicator */}
                {note.isPinned && (
                  <div className="absolute top-1 left-1">
                    <Pin className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </div>
                )}

                {/* Note content */}
                <div className="mb-8">
                  {editingNote?.id === note.id ? (
                    <textarea
                      value={editingNote.text}
                      onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                      className="w-full bg-transparent border-none resize-none focus:outline-none text-sm"
                      rows={3}
                      autoFocus
                    />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {note.text}
                    </p>
                  )}
                </div>

                {/* Note actions */}
                <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                  {editingNote?.id === note.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingNote(null)}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        {note.isPinned ? (
                          <PinOff className="w-3 h-3" />
                        ) : (
                          <Pin className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                        title="Edit note"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                {/* Timestamp */}
                <div className="absolute bottom-1 left-2 text-xs opacity-60">
                  {note.createdAt.toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default QuickNotesWidget;