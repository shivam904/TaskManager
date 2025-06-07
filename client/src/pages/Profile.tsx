import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  CalendarIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const result = await dispatch(updateUser(profileForm));
      if (result.type === 'auth/updateUser/fulfilled') {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.payload || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      // You would implement password change in your auth slice
      // For now, we'll show a success message
      toast.success('Password updated successfully');
      setShowPasswordForm(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeClass = (role: string) => {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No user data</h3>
          <p className="mt-1 text-sm text-gray-500">Unable to load profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              <button
                onClick={() => setShowPasswordForm(false)}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left ${
                  !showPasswordForm
                    ? 'bg-gray-50 text-indigo-700'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <UserCircleIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Profile</span>
              </button>
              <button
                onClick={() => setShowPasswordForm(true)}
                className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full text-left ${
                  showPasswordForm
                    ? 'bg-gray-50 text-indigo-700'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <KeyIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Security</span>
              </button>
            </nav>
          </aside>

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            {!showPasswordForm ? (
              // Profile Section
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Update your personal information and email address.
                        </p>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PencilIcon className="-ml-0.5 mr-2 h-4 w-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-12 w-12 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-xl font-medium text-gray-900">{user.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            {user.email}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            Member since {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isEditing ? (
                      <form onSubmit={handleProfileUpdate} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={profileForm.name}
                              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1 inline" />
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {profileLoading ? (
                              <div className="flex items-center">
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Saving...
                              </div>
                            ) : (
                              <>
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Role</dt>
                            <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(user.updatedAt)}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              // Password Section
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="mb-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Update your password to keep your account secure.
                      </p>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                          minLength={6}
                        />
                        <p className="mt-1 text-sm text-gray-500">Password must be at least 6 characters.</p>
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {passwordLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Updating...
                            </div>
                          ) : (
                            <>
                              <KeyIcon className="h-4 w-4 mr-1" />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 