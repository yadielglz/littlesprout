import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';
import { generateId } from '../utils/initialization';
import { formatLocalDateTimeInput } from '../utils/datetime';
import { Pill, Clock, AlertCircle, Plus, Edit } from 'lucide-react';
import Modal from './common/Modal';
import toast from 'react-hot-toast';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'daily' | 'twice-daily' | 'three-times' | 'four-times' | 'as-needed';
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  reminders: boolean;
  reminderTimes: string[]; // Array of times like ["08:00", "20:00"]
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  timestamp: Date;
  notes?: string;
  givenBy?: string;
}

const MedicationTracker: React.FC = () => {
  const { getCurrentProfile, addLog } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showLogDose, setShowLogDose] = useState(false);
  const [editMedication, setEditMedication] = useState<Medication | null>(null);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    isActive: true,
    reminders: false,
    reminderTimes: ['08:00']
  });

  const [doseLog, setDoseLog] = useState({
    timestamp: formatLocalDateTimeInput(),
    notes: '',
    givenBy: ''
  });

  const frequencyOptions = [
    { value: 'once', label: 'One time only', times: 1 },
    { value: 'daily', label: 'Once daily', times: 1 },
    { value: 'twice-daily', label: 'Twice daily', times: 2 },
    { value: 'three-times', label: 'Three times daily', times: 3 },
    { value: 'four-times', label: 'Four times daily', times: 4 },
    { value: 'as-needed', label: 'As needed', times: 0 }
  ];

  const getDefaultReminderTimes = (frequency: string) => {
    switch (frequency) {
      case 'daily':
      case 'once':
        return ['08:00'];
      case 'twice-daily':
        return ['08:00', '20:00'];
      case 'three-times':
        return ['08:00', '14:00', '20:00'];
      case 'four-times':
        return ['08:00', '12:00', '16:00', '20:00'];
      default:
        return ['08:00'];
    }
  };

  const handleAddMedication = async () => {
    if (!profile || !newMedication.name || !newMedication.dosage) {
      toast.error('Please fill in all required fields');
      return;
    }

    const medication: Medication = {
      id: generateId(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency || 'daily',
      startDate: newMedication.startDate || new Date().toISOString().split('T')[0],
      endDate: newMedication.endDate,
      notes: newMedication.notes,
      isActive: true,
      reminders: newMedication.reminders || false,
      reminderTimes: newMedication.reminderTimes || getDefaultReminderTimes(newMedication.frequency || 'daily')
    };

    try {
      setMedications(prev => [...prev, medication]);
      
      // Log the medication start as an activity
      const medicationLog = {
        id: generateId(),
        type: 'medication',
        icon: '💊',
        color: '',
        details: `Started: ${medication.name} - ${medication.dosage}`,
        timestamp: new Date(),
        notes: `Frequency: ${frequencyOptions.find(f => f.value === medication.frequency)?.label}`
      };

      addLog(profile.id, medicationLog);
      
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, medicationLog);
      }

      setShowAddMedication(false);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
        reminders: false,
        reminderTimes: ['08:00']
      });
      
      toast.success('Medication added successfully!');
    } catch (error) {
      toast.error('Failed to add medication');
    }
  };

  const handleLogDose = async () => {
    if (!profile || !selectedMedication) return;

    try {
      const logEntry: MedicationLog = {
        id: generateId(),
        medicationId: selectedMedication.id,
        medicationName: selectedMedication.name,
        dosage: selectedMedication.dosage,
        timestamp: new Date(doseLog.timestamp),
        notes: doseLog.notes,
        givenBy: doseLog.givenBy
      };

      setMedicationLogs(prev => [...prev, logEntry]);

      // Also add to main activity log
      const activityLog = {
        id: generateId(),
        type: 'medication',
        icon: '💊',
        color: '',
        details: `${selectedMedication.name} - ${selectedMedication.dosage}`,
        timestamp: new Date(doseLog.timestamp),
        notes: doseLog.notes ? `${doseLog.notes}${doseLog.givenBy ? ` (Given by: ${doseLog.givenBy})` : ''}` : doseLog.givenBy ? `Given by: ${doseLog.givenBy}` : undefined
      };

      addLog(profile.id, activityLog);
      
      if (currentUser) {
        await DatabaseService.addLog(currentUser.uid, profile.id, activityLog);
      }

      setShowLogDose(false);
      setSelectedMedication(null);
      setDoseLog({
        timestamp: formatLocalDateTimeInput(),
        notes: '',
        givenBy: ''
      });
      
      toast.success('Dose logged successfully!');
    } catch (error) {
      toast.error('Failed to log dose');
    }
  };

  const handleStopMedication = (medication: Medication) => {
    setMedications(prev => 
      prev.map(med => 
        med.id === medication.id 
          ? { ...med, isActive: false, endDate: new Date().toISOString().split('T')[0] }
          : med
      )
    );
    toast.success(`${medication.name} marked as stopped`);
  };

  const activeMedications = medications.filter(med => med.isActive);
  // const inactiveMedications = medications.filter(med => !med.isActive);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Medication Tracker</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage {profile.babyName}'s medications and dosing schedule
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddMedication(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </button>
      </div>

      {/* Active Medications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Active Medications ({activeMedications.length})
        </h3>
        
        {activeMedications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active medications</p>
            <p className="text-sm">Add a medication to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeMedications.map((medication) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {medication.name}
                      </h4>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Dosage:</strong> {medication.dosage}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Frequency:</strong> {frequencyOptions.find(f => f.value === medication.frequency)?.label}
                    </p>
                    {medication.reminders && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Reminders: {medication.reminderTimes.join(', ')}
                        </span>
                      </div>
                    )}
                    {medication.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <strong>Notes:</strong> {medication.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMedication(medication);
                        setShowLogDose(true);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      Log Dose
                    </button>
                    <button
                      onClick={() => setEditMedication(medication)}
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStopMedication(medication)}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Doses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Recent Doses
        </h3>
        
        {medicationLogs.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>No doses logged yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medicationLogs.slice(-5).reverse().map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {log.medicationName} - {log.dosage}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {log.timestamp.toLocaleString()}
                    {log.givenBy && ` • Given by: ${log.givenBy}`}
                  </p>
                  {log.notes && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{log.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <Modal isOpen={showAddMedication} onClose={() => setShowAddMedication(false)} title="Add New Medication">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Medication Name *
            </label>
            <input
              type="text"
              value={newMedication.name || ''}
              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="e.g., Tylenol, Amoxicillin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dosage *
            </label>
            <input
              type="text"
              value={newMedication.dosage || ''}
              onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="e.g., 5ml, 1 tablet, 2.5mg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <select
              value={newMedication.frequency || 'daily'}
              onChange={(e) => {
                const frequency = e.target.value as Medication['frequency'];
                setNewMedication({ 
                  ...newMedication, 
                  frequency,
                  reminderTimes: getDefaultReminderTimes(frequency)
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={newMedication.startDate || ''}
                onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={newMedication.endDate || ''}
                onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={newMedication.notes || ''}
              onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Special instructions, side effects to watch for, etc."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleAddMedication}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Medication
            </button>
            <button
              onClick={() => setShowAddMedication(false)}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Log Dose Modal */}
      <Modal isOpen={showLogDose} onClose={() => setShowLogDose(false)} title="Log Dose">
        {selectedMedication && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                {selectedMedication.name}
              </h4>
              <p className="text-blue-600 dark:text-blue-300">
                Dosage: {selectedMedication.dosage}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Given
              </label>
              <input
                type="datetime-local"
                value={doseLog.timestamp}
                onChange={(e) => setDoseLog({ ...doseLog, timestamp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Given By (Optional)
              </label>
              <input
                type="text"
                value={doseLog.givenBy}
                onChange={(e) => setDoseLog({ ...doseLog, givenBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Parent, caregiver, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={doseLog.notes}
                onChange={(e) => setDoseLog({ ...doseLog, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Any reactions, difficulty taking, etc."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleLogDose}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Log Dose
              </button>
              <button
                onClick={() => setShowLogDose(false)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicationTracker;