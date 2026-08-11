'use client';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById } from '@/services/users';
import { useState, useEffect } from 'react';

interface FullUser {
  role: string; // Extend the minimal User interface
  full_name: string;
  email: string;
  school_id?: number | null;
  // Add other full user properties
}

const UserProfile = () => {
  const { user, token } = useAuth();
  const [fullUserData, setFullUserData] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && token) {
      setLoading(true);
      getUserById(String(user.id))
        .then((data) => {
          setFullUserData(data as any); // Assuming your backend returns { user: FullUser }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch user profile');
          setLoading(false);
        });
    } else {
      setError('Not authenticated or user ID not available.');
      setLoading(false);
    }
  }, [user?.id, token]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!fullUserData) {
    return <div>User profile not found.</div>;
  }

  return (
    <div>
      <h1>{fullUserData.full_name}</h1>
      <p>Email: {fullUserData.email}</p>
      <p>Role: {fullUserData.role}</p>
      {fullUserData.school_id && <p>School ID: {fullUserData.school_id}</p>}
      {/* Display other user details */}
    </div>
  );
};

export default UserProfile;