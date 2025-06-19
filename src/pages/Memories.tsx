import { useState, useRef, useMemo } from 'react'
import { useStore, Memory } from '../store/store'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Plus, 
  Calendar,
  Trash2,
  Edit
} from 'lucide-react'
import Modal from '../components/Modal'
import { generateId } from '../utils/initialization'
import toast from 'react-hot-toast'

const Memories = () => {
  const { getCurrentProfile, getCurrentMemories, addMemory, deleteMemory } = useStore()
  const profile = getCurrentProfile()
  const memories = getCurrentMemories()

  // State
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMemory, setEditMemory] = useState<Memory | null>(null)
  const [deleteMemoryItem, setDeleteMemoryItem] = useState<Memory | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid')
  const [filterYear, setFilterYear] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newMemoryData, setNewMemoryData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    image: ''
  })

  // Get unique years from memories
  const years = useMemo(() => {
    const yearSet = new Set(memories.map(m => new Date(m.date).getFullYear().toString()))
    return Array.from(yearSet).sort((a: string, b: string) => parseInt(b) - parseInt(a))
  }, [memories])

  // Filter memories by year
  const filteredMemories = useMemo(() => {
    if (filterYear === 'all') return memories
    return memories.filter(m => new Date(m.date).getFullYear().toString() === filterYear)
  }, [memories, filterYear])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (editMemory) {
          setEditMemory({ ...editMemory, image: result })
        } else {
          setNewMemoryData({ ...newMemoryData, image: result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handlers
  const handleAddMemory = () => {
    if (!profile || !newMemoryData.description.trim() || !newMemoryData.image) {
      toast.error('Please fill in all fields and add a photo')
      return
    }

    const memory: Memory = {
      id: generateId(),
      date: newMemoryData.date,
      image: newMemoryData.image,
      description: newMemoryData.description
    }

    addMemory(profile.id, memory)
    setShowAddModal(false)
    setNewMemoryData({ date: new Date().toISOString().split('T')[0], description: '', image: '' })
    toast.success('Memory added successfully!')
  }

  const handleUpdateMemory = () => {
    if (!profile || !editMemory || !editMemory.description.trim() || !editMemory.image) {
      toast.error('Please fill in all fields and add a photo')
      return
    }

    // Note: The store doesn't have updateMemory method, so we'll delete and add
    deleteMemory(profile.id, editMemory.id)
    addMemory(profile.id, editMemory)
    setEditMemory(null)
    toast.success('Memory updated successfully!')
  }

  const handleDeleteMemory = () => {
    if (!profile || !deleteMemoryItem) return

    deleteMemory(profile.id, deleteMemoryItem.id)
    setDeleteMemoryItem(null)
    toast.success('Memory deleted successfully!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const memoryDate = new Date(dateString)
    const diffTime = Math.abs(now.getTime() - memoryDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            No Profile Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please set up a profile to view memories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Memories</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Capture and cherish {profile.babyName}'s precious moments
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Timeline
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Add Memory
            </button>
          </div>
        </div>

        {/* Memories Display */}
        {filteredMemories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No memories yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterYear !== 'all' 
                ? `No memories from ${filterYear}`
                : 'Start capturing precious moments with your little one!'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Camera size={20} className="mr-2" />
              Add Your First Memory
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredMemories.map((memory) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={memory.image}
                        alt={memory.description}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={() => setEditMemory(memory)}
                          className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteMemoryItem(memory)}
                          className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-800 dark:text-white text-sm mb-2 line-clamp-2">
                        {memory.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(memory.date)}
                        </span>
                        <span>{getTimeAgo(memory.date)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {filteredMemories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col items-center gap-6`}
                  >
                    <div className="flex-1 md:w-1/2">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        <div className="relative aspect-video">
                          <img
                            src={memory.image}
                            alt={memory.description}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              onClick={() => setEditMemory(memory)}
                              className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-600 hover:text-blue-500 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteMemoryItem(memory)}
                              className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-800 dark:text-white mb-2">
                            {memory.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {formatDate(memory.date)}
                            </span>
                            <span>{getTimeAgo(memory.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block flex-1">
                      <div className="h-full flex items-center justify-center">
                        <div className="w-1 h-32 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Add Memory Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Memory">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {newMemoryData.image ? (
                  <div className="relative">
                    <img
                      src={newMemoryData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setNewMemoryData({ ...newMemoryData, image: '' })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Choose Photo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={newMemoryData.date}
                onChange={(e) => setNewMemoryData({ ...newMemoryData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={newMemoryData.description}
                onChange={(e) => setNewMemoryData({ ...newMemoryData, description: e.target.value })}
                placeholder="Describe this special moment..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAddMemory}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Memory
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Memory Modal */}
        <Modal isOpen={!!editMemory} onClose={() => setEditMemory(null)} title="Edit Memory">
          {editMemory && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photo *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  {editMemory.image ? (
                    <div className="relative">
                      <img
                        src={editMemory.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setEditMemory({ ...editMemory, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Choose Photo
                      </button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editMemory.date}
                  onChange={(e) => setEditMemory({ ...editMemory, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={editMemory.description}
                  onChange={(e) => setEditMemory({ ...editMemory, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUpdateMemory}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update Memory
                </button>
                <button
                  onClick={() => setEditMemory(null)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={!!deleteMemoryItem} onClose={() => setDeleteMemoryItem(null)} title="Delete Memory">
          {deleteMemoryItem && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this memory? This action cannot be undone.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <img
                  src={deleteMemoryItem.image}
                  alt={deleteMemoryItem.description}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="text-sm text-gray-800 dark:text-white">
                  {deleteMemoryItem.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(deleteMemoryItem.date)}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleDeleteMemory}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteMemoryItem(null)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default Memories 