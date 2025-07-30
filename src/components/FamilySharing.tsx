import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';
import { generateId } from '../utils/initialization';
import { Users, UserPlus, Mail, Shield, Crown, Eye, Edit, Trash2, Copy, Check } from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

export interface FamilyMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'parent' | 'caregiver' | 'viewer';
  status: 'pending' | 'active' | 'inactive';
  invitedAt: Date;
  joinedAt?: Date;
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canInvite: boolean;
    canManageMembers: boolean;
  };
}

export interface FamilyInvite {
  id: string;
  email: string;
  role: 'parent' | 'caregiver' | 'viewer';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  message?: string;
}

const FamilySharing: React.FC = () => {
  const { getCurrentProfile } = useStore();
  const { currentUser } = useAuth();
  const profile = getCurrentProfile();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: generateId(),
      email: currentUser?.email || '',
      name: profile?.userName || 'You',
      role: 'owner',
      status: 'active',
      invitedAt: new Date(),
      joinedAt: new Date(),
      permissions: {
        canView: true,
        canEdit: true,
        canInvite: true,
        canManageMembers: true
      }
    }
  ]);

  const [pendingInvites, setPendingInvites] = useState<FamilyInvite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'caregiver' as FamilyInvite['role'],
    message: ''
  });

  const roleConfig = {
    owner: {
      label: 'Owner',
      icon: Crown,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
      description: 'Full access to all features and settings'
    },
    parent: {
      label: 'Parent',
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
      description: 'Can view and edit all data, invite caregivers'
    },
    caregiver: {
      label: 'Caregiver',
      icon: UserPlus,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
      description: 'Can view and add daily activities'
    },
    viewer: {
      label: 'Viewer',
      icon: Eye,
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400',
      description: 'Can only view data, no editing'
    }
  };

  const getRolePermissions = (role: FamilyMember['role']) => {
    switch (role) {
      case 'owner':
        return { canView: true, canEdit: true, canInvite: true, canManageMembers: true };
      case 'parent':
        return { canView: true, canEdit: true, canInvite: true, canManageMembers: false };
      case 'caregiver':
        return { canView: true, canEdit: true, canInvite: false, canManageMembers: false };
      case 'viewer':
        return { canView: true, canEdit: false, canInvite: false, canManageMembers: false };
      default:
        return { canView: false, canEdit: false, canInvite: false, canManageMembers: false };
    }
  };

  const handleSendInvite = async () => {
    if (!inviteForm.email || !profile) {
      toast.error('Please enter an email address');
      return;
    }

    // Check if user is already a member or has pending invite
    const existingMember = familyMembers.find(member => member.email === inviteForm.email);
    const existingInvite = pendingInvites.find(invite => invite.email === inviteForm.email);

    if (existingMember) {
      toast.error('This person is already a family member');
      return;
    }

    if (existingInvite) {
      toast.error('An invitation has already been sent to this email');
      return;
    }

    try {
      const invite: FamilyInvite = {
        id: generateId(),
        email: inviteForm.email,
        role: inviteForm.role,
        invitedBy: currentUser?.email || '',
        invitedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        message: inviteForm.message
      };

      setPendingInvites(prev => [...prev, invite]);

      // Generate invite link
      const link = `${window.location.origin}/invite/${invite.id}`;
      setInviteLink(link);

      // In a real app, you would send an email here
      toast.success('Invitation sent! Share the link with the family member.');

      setInviteForm({ email: '', role: 'caregiver', message: '' });
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const handleCopyInviteLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setCopiedLink(true);
        toast.success('Invite link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleRemoveMember = (member: FamilyMember) => {
    if (member.role === 'owner') {
      toast.error('Cannot remove the owner');
      return;
    }

    setFamilyMembers(prev => prev.filter(m => m.id !== member.id));
    toast.success(`${member.name} has been removed from the family`);
  };

  const handleUpdateMemberRole = (memberId: string, newRole: FamilyMember['role']) => {
    setFamilyMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole, permissions: getRolePermissions(newRole) }
          : member
      )
    );
    toast.success('Member role updated successfully');
  };

  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
    toast.success('Invitation cancelled');
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Family Sharing</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share {profile.babyName}'s data with family members and caregivers
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </button>
      </div>

      {/* Family Members */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Family Members ({familyMembers.length})
        </h3>
        
        <div className="space-y-4">
          {familyMembers.map((member) => {
            const roleInfo = roleConfig[member.role];
            const RoleIcon = roleInfo.icon;
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {member.name}
                        {member.email === currentUser?.email && (
                          <span className="ml-2 text-sm text-gray-500">(You)</span>
                        )}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center ${roleInfo.color}`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {member.status === 'active' ? 'Active' : 'Pending'} • 
                      Joined {member.joinedAt?.toLocaleDateString() || 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {member.role !== 'owner' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {member.role === 'owner' && (
                    <div className="p-2 text-purple-500">
                      <Crown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Pending Invitations ({pendingInvites.length})
          </h3>
          
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const roleInfo = roleConfig[invite.role];
              const RoleIcon = roleInfo.icon;
              
              return (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{invite.email}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Expires {invite.expiresAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
          Role Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(roleConfig).map(([role, config]) => {
            const Icon = config.icon;
            const permissions = getRolePermissions(role as FamilyMember['role']);
            
            return (
              <div key={role} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-gray-800 dark:text-white">{config.label}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{config.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${permissions.canView ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-600 dark:text-gray-400">View data</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${permissions.canEdit ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-600 dark:text-gray-400">Edit data</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${permissions.canInvite ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-600 dark:text-gray-400">Invite members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${permissions.canManageMembers ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-gray-600 dark:text-gray-400">Manage members</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Family Member">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as FamilyInvite['role'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option value="parent">Parent</option>
              <option value="caregiver">Caregiver</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {roleConfig[inviteForm.role]?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              placeholder="Add a personal message to the invitation..."
            />
          </div>

          {inviteLink && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Invitation Link Generated!</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-600 rounded text-sm"
                />
                <button
                  onClick={handleCopyInviteLink}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Share this link with the family member to join.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSendInvite}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send Invitation
            </button>
            <button
              onClick={() => {
                setShowInviteModal(false);
                setInviteLink(null);
                setCopiedLink(false);
              }}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Edit Family Member">
        {selectedMember && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-white">{selectedMember.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMember.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={selectedMember.role}
                onChange={(e) => handleUpdateMemberRole(selectedMember.id, e.target.value as FamilyMember['role'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                disabled={selectedMember.role === 'owner'}
              >
                <option value="parent">Parent</option>
                <option value="caregiver">Caregiver</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FamilySharing;