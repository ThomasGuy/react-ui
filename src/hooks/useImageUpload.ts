import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useImageUpload = () => {
  const { authFetch } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB

  const uploadImage = async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) {
      const sizeErr = 'Choose a file less than 7MB.';
      setUploadError(sizeErr);
      throw new Error(sizeErr);
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // force user_refresh if JWT-token exp < 1 minute
      await authFetch('/user/check');

      const response = await authFetch('/post/image', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 413) {
        throw new Error('The server rejected the file because it exceeds the 7MB limit.');
      }
      if (!response.ok) {
        throw new Error('Image asset clearance failed.');
      }

      const { sanityAssetId } = await response.json();
      return sanityAssetId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err?.message || 'Failed to upload image.';
      setUploadError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, uploadError, setUploadError };
};
