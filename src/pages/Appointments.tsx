import { useState } from 'react';
import { useStore, Appointment } from '../store/store';
import { useFirebaseStore } from '../store/firebaseStore';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus } from 'lucide-react';
import Modal from '../components/common/Modal';
import { useModal } from '../contexts/ModalContext';
import toast from 'react-hot-toast';
import { formatAppointmentDate, formatTime, isToday, isFuture } from '../utils/datetime';

const Appointments = () => {
  const { getCurrentProfile, appointments } = useStore();
  const { 
    updateAppointmentInFirebase, 
    deleteAppointmentFromFirebase 
  } = useFirebaseStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();
  const { openModal } = useModal();
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [editData, setEditData] = useState({ date: '', time: '', doctor: '', location: '', reason: '', notes: '' });

  const appts = profile ? appointments[profile.id] || [] : [];

  // Sort appointments by date, with future appointments first
  const sortedAppts = appts.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent/future first
  });

  const handleEdit = (appt: Appointment) => {
    setEditAppt(appt);
    setEditData({
      date: appt.date,
      time: appt.time,
      doctor: appt.doctor,
      location: appt.location,
      reason: appt.reason,
      notes: appt.notes || '',
    });
  };

  const handleSave = async () => {
    if (editAppt && profile && currentUser) {
      try {
        await updateAppointmentInFirebase(currentUser.uid, profile.id, editAppt.id, editData);
        setEditAppt(null);
        toast.success('Appointment updated successfully!');
      } catch (error) {
        toast.error('Failed to update appointment. Please try again.');
      }
    }
  };

  const handleDelete = async (appt: Appointment) => {
    if (profile && currentUser) {
      try {
        await deleteAppointmentFromFirebase(currentUser.uid, profile.id, appt.id);
        toast.success('Appointment deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete appointment. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Appointments</h1>
        <button
          onClick={() => openModal('appointment')}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Appointment
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        {sortedAppts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg">No appointments scheduled</p>
            <p className="text-sm">Add your first appointment to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppts.map(appt => {
              const isUpcoming = isFuture(appt.date, appt.time);
              const isTodayAppt = isToday(appt.date);
              
              return (
                <motion.div
                  key={appt.id}
                  className={`rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-l-4 ${
                    isTodayAppt 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                      : isUpcoming 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-lg font-bold ${
                        isTodayAppt 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : isUpcoming 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {formatAppointmentDate(appt.date)}
                      </div>
                      {isTodayAppt && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Today</span>
                      )}
                      {isUpcoming && !isTodayAppt && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Upcoming</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <strong>Time:</strong> {formatTime(appt.time)}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <strong>Doctor:</strong> {appt.doctor}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <strong>Location:</strong> {appt.location}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Reason:</strong> {appt.reason}
                    </div>
                    {appt.notes && (
                      <div className="text-xs text-gray-400 mt-1">
                        <strong>Notes:</strong> {appt.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-3 sm:mt-0">
                    <button 
                      onClick={() => handleEdit(appt)} 
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                      title="Edit appointment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(appt)} 
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Appointment Modal */}
      <Modal isOpen={!!editAppt} onClose={() => setEditAppt(null)} title="Edit Appointment">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input 
              type="date" 
              value={editData.date} 
              onChange={e => setEditData({ ...editData, date: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
            <input 
              type="time" 
              value={editData.time} 
              onChange={e => setEditData({ ...editData, time: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor</label>
            <input 
              type="text" 
              value={editData.doctor} 
              onChange={e => setEditData({ ...editData, doctor: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
              placeholder="Doctor's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input 
              type="text" 
              value={editData.location} 
              onChange={e => setEditData({ ...editData, location: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
              placeholder="Clinic or hospital"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
            <input 
              type="text" 
              value={editData.reason} 
              onChange={e => setEditData({ ...editData, reason: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
              placeholder="Reason for visit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
            <textarea 
              value={editData.notes} 
              onChange={e => setEditData({ ...editData, notes: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
              placeholder="Additional notes"
              rows={3}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={handleSave} 
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
            <button 
              onClick={() => setEditAppt(null)} 
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments; 