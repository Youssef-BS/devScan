"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Calendar,
  Shield,
  Key,
  CheckCircle,
  XCircle,
  Edit2,
  LogOut,
  ChevronRight,
  Github,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateNameSchema,
  changePasswordSchema,
  completeProfileSchema,
  type UpdateNameInput,
  type ChangePasswordInput,
  type CompleteProfileInput,
} from '@repo/validation';
import SubscriptionCard from '@/components/SubscriptionCard';

const Profile = () => {
  const router = useRouter();
  const { user, getCurrentUser, logout, completeProfile, changePassword, updateName, loading } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCompletePassword, setShowCompletePassword] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // ── react-hook-form for "Update Name"
  const nameForm = useForm<UpdateNameInput>({
    resolver: zodResolver(updateNameSchema),
  });

  // ── react-hook-form for "Change Password"
  const pwForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  // ── react-hook-form for "Complete Profile"
  const completeForm = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
  });

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    if (user) {
      nameForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const handleUpdateName = async (data: UpdateNameInput) => {
    setUpdateError('');
    try {
      await updateName(data);
      setUpdateSuccess('Name updated successfully!');
      setIsEditing(false);
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (error: any) {
      setUpdateError(error.message);
    }
  };

  const handleChangePassword = async (data: ChangePasswordInput) => {
    setUpdateError('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setUpdateSuccess('Password changed successfully!');
      pwForm.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (error: any) {
      setUpdateError(error.message);
    }
  };

  const handleCompleteProfile = async (data: CompleteProfileInput) => {
    setUpdateError('');
    try {
      await completeProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });
      setUpdateSuccess('Profile completed successfully!');
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (error: any) {
      setUpdateError(error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent mx-auto" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const needsProfileCompletion = !user.firstName || !user.lastName;

  if (needsProfileCompletion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-full mb-4">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-500 mt-2">Please provide your details to continue</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            {updateSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-green-700 text-sm">{updateSuccess}</p>
              </div>
            )}
            {updateError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <XCircle size={20} className="text-red-600" />
                <p className="text-red-700 text-sm">{updateError}</p>
              </div>
            )}

            <form onSubmit={completeForm.handleSubmit(handleCompleteProfile)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    {...completeForm.register('firstName')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                    placeholder="John"
                  />
                  {completeForm.formState.errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{completeForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    {...completeForm.register('lastName')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                    placeholder="Doe"
                  />
                  {completeForm.formState.errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{completeForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCompletePassword ? 'text' : 'password'}
                    {...completeForm.register('password')}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                    placeholder="Create a password"
                  />
                  <button type="button" onClick={() => setShowCompletePassword(!showCompletePassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCompletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {completeForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{completeForm.formState.errors.password.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Min 8 chars · 1 uppercase · 1 special character</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCompleteConfirm ? 'text' : 'password'}
                    {...completeForm.register('confirmPassword')}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                    placeholder="Confirm your password"
                  />
                  <button type="button" onClick={() => setShowCompleteConfirm(!showCompleteConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCompleteConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {completeForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{completeForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-8">
            <div className="relative group">
              <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.firstName} width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-gray-900 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200">
                  {user.role || 'User'}
                </span>
                {user.subscriptionStatus === 'ACTIVE' && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Premium
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail size={16} className="text-gray-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.subscriptionStatus === 'ACTIVE' && user.subscriptionEndDate && (
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-gray-400" />
                    <span>Until {new Date(user.subscriptionEndDate).toLocaleDateString()}</span>
                  </div>
                )}
                {user.isBanned && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Shield size={16} />
                    <span>Account Banned</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'profile', label: 'Profile Information', icon: User },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'activity', label: 'Recent Activity', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-green-700 text-sm">{updateSuccess}</p>
            </div>
          )}
          {updateError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <XCircle size={20} className="text-red-600" />
              <p className="text-red-700 text-sm">{updateError}</p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  <Edit2 size={16} />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={nameForm.handleSubmit(handleUpdateName)} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      {...nameForm.register('firstName')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                    />
                    {nameForm.formState.errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{nameForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      {...nameForm.register('lastName')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                    />
                    {nameForm.formState.errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{nameForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">First Name</span>
                    <span className="text-sm font-medium text-gray-900">{user.firstName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Last Name</span>
                    <span className="text-sm font-medium text-gray-900">{user.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">Account Status</span>
                    <span className={`text-sm font-medium ${user.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div>
              <SubscriptionCard
                subscriptionStatus={user.subscriptionStatus}
                subscriptionPlan={user.subscriptionPlan}
                subscriptionStartDate={user.subscriptionStartDate}
                subscriptionEndDate={user.subscriptionEndDate}
                onSubscriptionChange={() => getCurrentUser()}
              />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>

              <form onSubmit={pwForm.handleSubmit(handleChangePassword)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...pwForm.register('currentPassword')}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {pwForm.formState.errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{pwForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      {...pwForm.register('newPassword')}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {pwForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{pwForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Key size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...pwForm.register('confirmPassword')}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-gray-900"
                      placeholder="Confirm new password"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {pwForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{pwForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-600" /> At least 8 characters</li>
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-600" /> At least one uppercase letter</li>
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-600" /> At least one special character</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="p-2 bg-white rounded-lg">
                      {i % 2 === 0 ? <Github size={18} className="text-gray-700" /> : <Shield size={18} className="text-gray-700" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {i % 2 === 0 ? 'Repository scanned' : 'Security alert resolved'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {i + 1} {i === 0 ? 'hour' : 'hours'} ago
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                View All Activity
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;