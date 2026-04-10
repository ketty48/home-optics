import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, CreditCard, LogOut, Edit2, X, Save, Lock, Loader } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleEditProfile = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await apiClient.put('/auth/updateprofile', { firstName, lastName, email, phone });
      updateUser(data.data);
      setEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await apiClient.put('/auth/updatepassword', { currentPassword, newPassword });
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile card */}
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-100 gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0">
                {user?.firstName?.charAt(0) || <User />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
                <p className="text-gray-500 text-sm truncate max-w-[180px] sm:max-w-none">{user?.email}</p>
              </div>
            </div>
            {!editingProfile && (
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="+250 7XX XXX XXX"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {savingProfile ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Phone</span>
                <span>{user?.phone || <span className="text-gray-400 italic">Not set</span>}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Role</span>
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password card */}
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Password</h2>
            </div>
            {!editingPassword && (
              <button
                onClick={() => setEditingPassword(true)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Change
              </button>
            )}
          </div>

          {editingPassword ? (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {savingPassword ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                  className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500">••••••••</p>
          )}
        </div>

        {/* Navigation links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
          <Link to="/orders" className="flex items-center justify-between p-4 hover:bg-blue-50 transition-colors group">
            <span className="flex items-center gap-3 font-medium text-gray-700 group-hover:text-blue-700"><Package className="w-5 h-5" /> My Orders</span>
            <span className="text-gray-400 group-hover:text-blue-500">→</span>
          </Link>
          <Link to="/pending-payments" className="flex items-center justify-between p-4 hover:bg-blue-50 transition-colors group">
            <span className="flex items-center gap-3 font-medium text-gray-700 group-hover:text-blue-700"><CreditCard className="w-5 h-5" /> Pending Payments</span>
            <span className="text-gray-400 group-hover:text-blue-500">→</span>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
