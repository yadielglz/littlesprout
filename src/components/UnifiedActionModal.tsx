import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Save, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/store';
import { generateId } from '../utils/initialization';
import { formatLocalDateTimeInput } from '../utils/datetime';
import { DatabaseService } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../contexts/TimerContext';
import toast from 'react-hot-toast';

export type ActionType = 
  | 'feed' | 'diaper' | 'sleep' | 'nap' | 'tummy' | 'weight' 
  | 'height' | 'temperature' | 'vaccine' | 'health' | 'appointment' | 'reminder';

interface UnifiedActionModalProps {
  isOpen: boolean;
  actionType: ActionType | null;
  onClose: () => void;
}

const UnifiedActionModal: React.FC<UnifiedActionModalProps> = ({
  isOpen,
  actionType,
  onClose
}) => {
  const { getCurrentProfile, addLog, addAppointment, addReminder, measurementUnit } = useStore();
  const { currentUser } = useAuth();
  const { startTimer } = useTimer();
  const profile = getCurrentProfile();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [maxSteps, setMaxSteps] = useState(1);

  // Reset form when modal opens/closes or action type changes
  useEffect(() => {
    if (isOpen && actionType) {
      setFormData({
        time: formatLocalDateTimeInput(),
        ...getDefaultFormData(actionType)
      });
      setStep(1);
      setMaxSteps(getMaxSteps(actionType));
    }
  }, [isOpen, actionType]);

  const getDefaultFormData = (type: ActionType): Record<string, any> => {
    const defaults: Record<ActionType, Record<string, any>> = {
      feed: { type: 'bottle', amount: '', notes: '' },
      diaper: { type: 'wet', notes: '' },
      sleep: { useTimer: true },
      nap: { useTimer: true },
      tummy: { useTimer: true },
      weight: { weight: '', notes: '', weightUnit: 'kg' },
      height: { height: '', notes: '' },
      temperature: { temperature: '', method: 'oral', notes: '' },
      vaccine: { vaccine: '', dose: '', location: '', notes: '' },
      health: { category: '', symptoms: '', severity: 'mild', notes: '' },
      appointment: { 
        date: new Date().toISOString().split('T')[0], 
        time: '09:00', 
        doctor: '', 
        location: '', 
        reason: '', 
        notes: '' 
      },
      reminder: { 
        text: '', 
        time: Date.now(), 
        frequency: 'daily', 
        isActive: true 
      }
    };
    return defaults[type] || {};
  };

  const getMaxSteps = (type: ActionType): number => {
    const stepConfig: Record<ActionType, number> = {
      feed: 1,
      diaper: 1,
      sleep: 1,
      nap: 1,
      tummy: 1,
      weight: 1,
      height: 1,
      temperature: 1,
      vaccine: 2,
      health: 2,
      appointment: 2,
      reminder: 1
    };
    return stepConfig[type] || 1;
  };

  const getActionConfig = (type: ActionType) => {
    const configs: Record<ActionType, { title: string; icon: string; color: string }> = {
      feed: { title: 'Log Feeding', icon: '🍼', color: 'bg-blue-500' },
      diaper: { title: 'Log Diaper Change', icon: '👶', color: 'bg-amber-500' },
      sleep: { title: 'Log Sleep', icon: '😴', color: 'bg-indigo-500' },
      nap: { title: 'Log Nap', icon: '🛏️', color: 'bg-yellow-500' },
      tummy: { title: 'Log Tummy Time', icon: '⏱️', color: 'bg-green-500' },
      weight: { title: 'Log Weight & Height', icon: '📏', color: 'bg-red-500' },
      height: { title: 'Log Height', icon: '📏', color: 'bg-purple-500' },
      temperature: { title: 'Log Temperature', icon: '🌡️', color: 'bg-purple-500' },
      vaccine: { title: 'Log Vaccine', icon: '💉', color: 'bg-pink-500' },
      health: { title: 'Add Health Note', icon: '📝', color: 'bg-teal-500' },
      appointment: { title: 'Schedule Doctor\'s Appointment', icon: '📅', color: 'bg-blue-600' },
      reminder: { title: 'Add Reminder', icon: '🔔', color: 'bg-orange-500' }
    };
    return configs[type];
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    if (!actionType) return false;

    switch (actionType) {
      case 'vaccine':
        if (step === 1) {
          return formData.vaccine && formData.dose && formData.location;
        } else {
          return formData.time;
        }
      case 'health':
        if (step === 1) {
          return formData.category && formData.symptoms;
        } else {
          return formData.time;
        }
      case 'appointment':
        if (step === 1) {
          return formData.date && formData.time && formData.doctor && formData.location;
        } else {
          return formData.reason;
        }
      default:
        return true; // Single step forms will be validated in validateForm
    }
  };

  const validateForm = () => {
    if (!actionType) return false;

    switch (actionType) {
      case 'feed':
        return formData.amount && formData.time;
      case 'diaper':
        return formData.time;
      case 'sleep':
      case 'nap':
      case 'tummy':
        if (formData.useTimer) return true;
        return formData.time && (formData.hours || formData.minutes);
      case 'weight':
        return formData.weight && formData.time;
      case 'height':
        return formData.height && formData.time;
      case 'temperature':
        return formData.temperature && formData.time;
      case 'vaccine':
        return formData.vaccine && formData.dose && formData.location && formData.time;
      case 'health':
        return formData.category && formData.symptoms && formData.time;
      case 'appointment':
        return formData.date && formData.time && formData.doctor && formData.location && formData.reason;
      case 'reminder':
        return formData.text;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      toast.error('Please fill in all required fields before continuing');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!profile || !actionType) return;

    // Validate form
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionType === 'sleep' || actionType === 'nap' || actionType === 'tummy') {
        if (formData.useTimer) {
          startTimer(actionType);
          onClose();
          return;
        }
      }

      await submitAction(actionType, formData);
      toast.success(`${getActionConfig(actionType).title} saved successfully!`);
      onClose();
    } catch (error) {
      toast.error('Failed to save. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAction = async (type: ActionType, data: Record<string, any>) => {
    if (!profile) return;

    // Ensure time field has a valid value
    const timeValue = data.time || formatLocalDateTimeInput();

    switch (type) {
      case 'feed': {
        const feedLog = {
          id: generateId(),
          type: 'feed',
          icon: '🍼',
          color: '',
          details: `${data.type === 'bottle' ? 'Bottle (Formula)' :
                    data.type === 'breast' ? 'Breast Feed' : 'Food (Solids)'} - ${data.amount}${measurementUnit}`,
          timestamp: new Date(timeValue),
          rawAmount: parseFloat(data.amount) || 0,
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, feedLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, feedLog);
        }
        break;
      }

      case 'diaper': {
        const diaperLog = {
          id: generateId(),
          type: 'diaper',
          icon: '👶',
          color: '',
          details: `Type: ${data.type}`,
          timestamp: new Date(timeValue),
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, diaperLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, diaperLog);
        }
        break;
      }

      case 'weight': {
        const weightLog = {
          id: generateId(),
          type: 'weight',
          icon: '⚖️',
          color: '',
          details: `Weight: ${data.weight} ${data.weightUnit || 'kg'}`,
          timestamp: new Date(timeValue),
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, weightLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, weightLog);
        }
        break;
      }

      case 'height': {
        const heightLog = {
          id: generateId(),
          type: 'height',
          icon: '📏',
          color: '',
          details: `Height: ${data.height} ${data.heightUnit || 'cm'}`,
          timestamp: new Date(timeValue),
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, heightLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, heightLog);
        }
        break;
      }

      case 'temperature': {
        const tempLog = {
          id: generateId(),
          type: 'temperature',
          icon: '🌡️',
          color: '',
          details: `Temperature: ${data.temperature}°F (${data.method})`,
          timestamp: new Date(timeValue),
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, tempLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, tempLog);
        }
        break;
      }

      case 'vaccine': {
        const vaccineLog = {
          id: generateId(),
          type: 'vaccine',
          icon: '💉',
          color: '',
          details: `${data.vaccine} - Dose ${data.dose} (${data.location})`,
          timestamp: new Date(timeValue),
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, vaccineLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, vaccineLog);
        }
        break;
      }

      case 'health': {
        const healthLog = {
          id: generateId(),
          type: 'health',
          icon: '📝',
          color: '',
          details: `${data.category} - ${data.symptoms} (${data.severity})`,
          timestamp: new Date(timeValue),
          ...(data.notes && { notes: data.notes })
        };
        addLog(profile.id, healthLog);
        if (currentUser) {
          await DatabaseService.addLog(currentUser.uid, profile.id, healthLog);
        }
        break;
      }

      case 'sleep':
      case 'nap':
      case 'tummy': {
        if (!data.useTimer) {
          // Manual entry
          const hours = parseInt(data.hours || '0');
          const minutes = parseInt(data.minutes || '0');
          const duration = (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds

          const sleepLog = {
            id: generateId(),
            type: type,
            icon: type === 'sleep' ? '😴' : type === 'nap' ? '🛏️' : '⏱️',
            color: '',
            details: `Duration: ${hours > 0 ? `${hours}h ` : ''}${minutes}min`,
            timestamp: new Date(timeValue),
            rawDuration: duration,
            ...(data.notes && { notes: data.notes })
          };
          addLog(profile.id, sleepLog);
          if (currentUser) {
            await DatabaseService.addLog(currentUser.uid, profile.id, sleepLog);
          }
        }
        // Timer case is handled in handleSubmit
        break;
      }

      case 'appointment': {
        const appointment = {
          id: generateId(),
          date: data.date,
          time: data.time,
          doctor: data.doctor,
          location: data.location,
          reason: data.reason,
          ...(data.notes && { notes: data.notes })
        };
        addAppointment(profile.id, appointment);
        if (currentUser) {
          await DatabaseService.addAppointment(currentUser.uid, profile.id, appointment);
        }
        break;
      }

      case 'reminder': {
        const reminder = {
          id: generateId(),
          text: data.text,
          time: data.time,
          frequency: data.frequency,
          isActive: data.isActive
        };
        addReminder(profile.id, reminder);
        if (currentUser) {
          await DatabaseService.addReminder(currentUser.uid, profile.id, reminder);
        }
        break;
      }
    }
  };

  const renderFormStep = () => {
    if (!actionType) return null;

    const config = getActionConfig(actionType);
    
    switch (actionType) {
      case 'feed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feeding Type
              </label>
              <select
                value={formData.type || 'bottle'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="bottle">Bottle (Formula)</option>
                <option value="breast">Breast Feed</option>
                <option value="food">Food (Solids)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount ({measurementUnit})
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        );

      case 'diaper':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={formData.type || 'wet'}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="wet">Wet</option>
                <option value="dirty">Dirty</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        );

      case 'sleep':
      case 'nap':
      case 'tummy':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                How would you like to track this {actionType}?
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleInputChange('useTimer', true)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  formData.useTimer 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">Start Timer</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Track in real-time with a timer
                    </div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleInputChange('useTimer', false)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  !formData.useTimer 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-3 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">Manual Entry</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Enter duration manually
                    </div>
                  </div>
                </div>
              </button>
            </div>
            {!formData.useTimer && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={formData.hours || ''}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      min="0"
                      max="23"
                      placeholder="Hours"
                      className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="self-center text-gray-500">h</span>
                    <input
                      type="number"
                      value={formData.minutes || ''}
                      onChange={(e) => handleInputChange('minutes', e.target.value)}
                      min="0"
                      max="59"
                      placeholder="Minutes"
                      className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="self-center text-gray-500">m</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.time || ''}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'weight':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Weight Tracking</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter weight in ${formData.weightUnit || 'kg'}`}
                  required
                />
                <select
                  value={formData.weightUnit || 'kg'}
                  onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        );

      case 'height': {
        const isCm = formData.heightUnit === 'cm';
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Height Tracking</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  min="0"
                  step={isCm ? "0.1" : "0.1"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter height in ${isCm ? 'cm' : 'in'}`}
                  required
                />
                <select
                  value={formData.heightUnit || 'cm'}
                  onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        );
      }

      case 'temperature':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Temperature Check</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature (°F)
              </label>
              <input
                type="number"
                value={formData.temperature || ''}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                min="80"
                max="120"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter temperature"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Method
              </label>
              <select
                value={formData.method || 'oral'}
                onChange={(e) => handleInputChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="oral">Oral</option>
                <option value="rectal">Rectal</option>
                <option value="armpit">Armpit</option>
                <option value="forehead">Forehead</option>
                <option value="ear">Ear</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <input
                type="datetime-local"
                value={formData.time || ''}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        );

      case 'vaccine':
        if (step === 1) {
          return (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{config.icon}</div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Vaccine Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={formData.vaccine || ''}
                  onChange={(e) => handleInputChange('vaccine', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., DTaP, MMR, Flu shot"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dose/Series
                </label>
                <input
                  type="text"
                  value={formData.dose || ''}
                  onChange={(e) => handleInputChange('dose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1st dose, 2nd dose, Booster"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location Given
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Left arm, Right thigh"
                  required
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.time || ''}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Any reactions, side effects, or additional notes..."
                />
              </div>
            </div>
          );
        }

      case 'health':
        if (step === 1) {
          return (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{config.icon}</div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Health Note</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  <option value="illness">Illness/Symptoms</option>
                  <option value="medication">Medication</option>
                  <option value="injury">Injury</option>
                  <option value="checkup">Doctor Visit</option>
                  <option value="milestone">Development</option>
                  <option value="allergy">Allergy/Reaction</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.symptoms || ''}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe symptoms, behaviors, or observations..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={formData.severity || 'mild'}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.time || ''}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional details, treatments, or observations..."
                />
              </div>
            </div>
          );
        }

      case 'appointment':
        if (step === 1) {
          return (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{config.icon}</div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Schedule Doctor's Appointment</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time || ''}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Doctor/Provider
                </label>
                <input
                  type="text"
                  value={formData.doctor || ''}
                  onChange={(e) => handleInputChange('doctor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. Smith, Pediatrics Clinic"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Clinic name and address"
                  required
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={formData.reason || ''}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Annual checkup, vaccination, illness"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Questions to ask, symptoms to discuss, etc."
                />
              </div>
            </div>
          );
        }

      case 'reminder':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{config.icon}</div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Add Reminder</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder Text
              </label>
              <input
                type="text"
                value={formData.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="What would you like to be reminded about?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency || 'daily'}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="once">One time only</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Active
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive !== false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Reminder is active
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Form for {actionType} coming soon...
          </div>
        );
    }
  };

  if (!isOpen || !actionType) return null;

  const config = getActionConfig(actionType);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/95 backdrop-blur-xl dark:bg-gray-800/95 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/50 mx-2 sm:mx-0"
        >
          {/* Header */}
          <div className={`${config.color} text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <div className="flex items-center relative z-10">
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="text-3xl sm:text-4xl mr-3 sm:mr-4"
              >
                {config.icon}
              </motion.span>
              <div className="flex-1 min-w-0">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg sm:text-xl lg:text-2xl font-bold truncate"
                >
                  {config.title}
                </motion.h2>
                {maxSteps > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center mt-1.5 sm:mt-2"
                  >
                    <div className="flex space-x-1 mr-2 sm:mr-3">
                      {Array.from({ length: maxSteps }, (_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                            i + 1 <= step ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm opacity-90">Step {step} of {maxSteps}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]"
          >
            {renderFormStep()}
          </motion.div>

          {/* Footer */}
          <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-between bg-gray-50/50 dark:bg-gray-900/50 gap-2 sm:gap-3">
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg sm:rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Back
              </motion.button>
            )}
            <div className="ml-auto flex space-x-2 sm:space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded-lg sm:rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 text-sm sm:text-base"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={step < maxSteps ? handleNextStep : handleSubmit}
                disabled={isSubmitting}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 ${config.color} text-white rounded-lg sm:rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold text-sm sm:text-base min-h-[44px]`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : step < maxSteps ? 'Next' : 'Save'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedActionModal; 