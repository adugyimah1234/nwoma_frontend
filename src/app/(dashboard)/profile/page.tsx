/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { PageHeader } from '@/components/layout/page-header';
import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UpdateUserPayload } from '@/services/users';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EditIcon, 
  SaveIcon,
  ArrowLeftIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserPayload>({
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    full_name: user?.full_name || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
// Update getInitials function

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Please log in to view your profile</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const updatedFields: UpdateUserPayload = {};
      
      if (formData.email && formData.email !== user?.email) {
        updatedFields.email = formData.email;
      }
      
      if (formData.phone_number && formData.phone_number !== user?.phone_number) {
        updatedFields.phone_number = formData.phone_number;
      }

      // if (formData.full_name && formData.full_name !== user?.full_name) {
      //   updatedFields.full_name = formData.full_name;
      // }

      if (Object.keys(updatedFields).length === 0) {
        setSuccess('No changes detected.');
        setIsEditing(false);
        setIsSubmitting(false);
        return;
      }

      await updateUserProfile(updatedFields);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      full_name: user?.full_name || '',
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const getInitials = () => {
    if (!user) return '';
    if (user.full_name) {
      return user.full_name.split(' ').map(name => name[0]).join('').toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || '';
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
        <PageHeader
          title="My Profile"
          description="View and update your personal information"
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Profile' }]}
        />
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            ) : null}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 flex items-start">
              <XCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400 flex items-start">
              <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {/* User profile header */}
            <div className="bg-indigo-600 p-6">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-white text-indigo-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-white">
                    {user.full_name || 'User'}
                  </h2>
                </div>
              </div>
            </div>

            {/* User details */}
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="full_name"
                        id="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div> */}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone_number"
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <SaveIcon className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="border-b dark:border-gray-700 pb-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="mt-1 text-base text-gray-900 dark:text-white">{user.full_name || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b dark:border-gray-700 pb-4">
                    <div className="flex items-center">
                      <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                        <p className="mt-1 text-base text-gray-900 dark:text-white">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b dark:border-gray-700 pb-4">
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                        <p className="mt-1 text-base text-gray-900 dark:text-white">
                          {user.phone_number || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {user.school_id && (
                    <div>
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">School ID</p>
                          <p className="mt-1 text-base text-gray-900 dark:text-white">{user.school_id}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact our support team at <span className="text-indigo-600 dark:text-indigo-400">support@example.com</span>
            </p>
          </div>
        </div>
      </div>
  );
}