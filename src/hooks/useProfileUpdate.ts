import { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Adjust to your actual context path
import { IUpdateProfilePayload } from '@/utils/types';

export const useProfileUpdate = () => {
  const { authFetch, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (payload: IUpdateProfilePayload) => {
    setLoading(true);
    setError(null);

    try {
      // Use your existing authFetch wrapper—no need to manage token headers manually
      const response = await authFetch('/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Profile update failed with status: ${response.status}`);
      }

      // Server returns exclusively your 1-3 changed fields as camelCase JSON
      const updatedFields = await response.json();

      // Safely apply the state mutations using a functional state updater
      setUserData((prevUserData) => {
        if (!prevUserData) return null;
        return {
          ...prevUserData,
          ...updatedFields, // Overwrites displayName, bio, or avatarUrl selectively
          updatedAt: new Date(), // Local UI visual timestamp sync
        };
      });

      return updatedFields;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
};
