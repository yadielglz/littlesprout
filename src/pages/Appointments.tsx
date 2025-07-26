import { useState } from 'react';
import { useStore, Appointment } from '../store/store';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { useModal } from '../contexts/ModalContext';

const Appointments = () => {
  const { getCurrentProfile, appointments, updateAppointment, deleteAppointment } = useStore();
  const profile = getCurrentProfile();
  const { openModal } = useModal();
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [editData, setEditData] = useState({ date: '', time: '', doctor: '', location: '', reason: '', notes: '' });

  const appts = profile ? appointments[profile.id] || [] : [];

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

  const handleSave = () => {
    if (editAppt && profile) {
      updateAppointment(profile.id, editAppt.id, editData);
      setEditAppt(null);
    }
  };

  const handleDelete = (appt: Appointment) => {
    if (profile) {
      deleteAppointment(profile.id, appt.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Appointments</h1>
          <button
            onClick={() => openModal('appointment')}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Appointment
          </button>
        </div>
        {appts.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">No appointments found.</div>
        ) : (
          <div className="space-y-4">
            {appts.map(appt => (
              <motion.div
                key={appt.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                whileHover={{ scale: 1.01 }}
              >
                <div>
                  <div className="font-bold text-lg text-blue-700 dark:text-blue-300">{appt.date} {appt.time}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Doctor: {appt.doctor}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Location: {appt.location}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Reason: {appt.reason}</div>
                  {appt.notes && <div className="text-xs text-gray-400 mt-1">Notes: {appt.notes}</div>}
                </div>
                <div className="flex space-x-2 mt-3 sm:mt-0">
                  <button onClick={() => handleEdit(appt)} className="p-2 text-gray-500 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(appt)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Edit Appointment Modal */}
      <Modal isOpen={!!editAppt} onClose={() => setEditAppt(null)} title="Edit Appointment">
        <div className="space-y-4">
          <input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} className="w-full px-3 py-2 border rounded" />
          <input type="time" value={editData.time} onChange={e => setEditData({ ...editData, time: e.target.value })} className="w-full px-3 py-2 border rounded" />
          <input type="text" value={editData.doctor} onChange={e => setEditData({ ...editData, doctor: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Doctor" />
          <input type="text" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Location" />
          <input type="text" value={editData.reason} onChange={e => setEditData({ ...editData, reason: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Reason" />
          <textarea value={editData.notes} onChange={e => setEditData({ ...editData, notes: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Notes (optional)" />
          <div className="flex space-x-3 pt-4">
            <button onClick={handleSave} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Save</button>
            <button onClick={() => setEditAppt(null)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments; 