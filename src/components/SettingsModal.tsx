import React, { useState } from 'react'
import Modal from './Modal'
import { useStore } from '../store/store'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profiles,
    currentProfileId,
    setCurrentProfileId,
    addProfile,
    deleteProfile,
    reminders,
    setReminders,
    addReminder,
    updateReminder,
    deleteReminder,
  } = useStore()
  const [newName, setNewName] = useState('')
  const [reminderText, setReminderText] = useState('')

  // Add child
  const handleAddChild = () => {
    if (newName.trim()) {
      addProfile({
        id: Math.random().toString(36).substr(2, 9),
        userName: newName,
        babyName: newName,
        dob: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      setNewName('')
    }
  }

  // Add reminder
  const handleAddReminder = () => {
    if (reminderText.trim() && currentProfileId) {
      addReminder(currentProfileId, {
        id: Math.random().toString(36).substr(2, 9),
        text: reminderText,
        time: Date.now(),
        frequency: 'none',
        isActive: true,
      })
      setReminderText('')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="large">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Children management */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Children</h3>
          <ul className="mb-2">
            {profiles.map(p => (
              <li key={p.id} className="flex items-center justify-between mb-1">
                <span className={p.id === currentProfileId ? 'font-bold text-green-600' : ''}>{p.babyName}</span>
                <div className="space-x-2">
                  <button onClick={() => setCurrentProfileId(p.id)} className="text-xs px-2 py-1 bg-blue-200 rounded">Switch</button>
                  <button onClick={() => deleteProfile(p.id)} className="text-xs px-2 py-1 bg-red-200 rounded">Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Add child name" className="px-2 py-1 border rounded" />
            <button onClick={handleAddChild} className="bg-green-500 text-white px-3 py-1 rounded">Add</button>
          </div>
        </div>
        {/* Reminders management */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Reminders</h3>
          <ul className="mb-2">
            {(reminders[currentProfileId || ''] || []).map(r => (
              <li key={r.id} className="flex items-center justify-between mb-1">
                <span>{r.text}</span>
                <button onClick={() => deleteReminder(currentProfileId!, r.id)} className="text-xs px-2 py-1 bg-red-200 rounded">Delete</button>
              </li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <input value={reminderText} onChange={e => setReminderText(e.target.value)} placeholder="Add reminder" className="px-2 py-1 border rounded" />
            <button onClick={handleAddReminder} className="bg-green-500 text-white px-3 py-1 rounded">Add</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal 