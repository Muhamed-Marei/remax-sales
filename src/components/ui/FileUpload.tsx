'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

interface FileUploadProps {
  dealId: string;
  existingUrls?: string[];
  onUploadSuccess: (urls: string[]) => void;
  maxFiles?: number;
}

export default function FileUpload({ dealId, existingUrls = [], onUploadSuccess, maxFiles = 5 }: FileUploadProps) {
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas is empty'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (urls.length >= maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG and WEBP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const compressedBlob = await compressImage(file);
      const filename = `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
      const storageRef = ref(storage, `deals/${dealId}/${filename}`);
      
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Failed to upload image.');
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newUrls = [...urls, downloadURL];
          setUrls(newUrls);
          onUploadSuccess(newUrls);
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (err) {
      console.error('Compression error:', err);
      setError('Failed to process image.');
      setUploading(false);
    }
  };

  const handleDelete = async (urlToDelete: string) => {
    try {
      const fileRef = ref(storage, urlToDelete);
      await deleteObject(fileRef);
      const newUrls = urls.filter(url => url !== urlToDelete);
      setUrls(newUrls);
      onUploadSuccess(newUrls);
    } catch (err) {
      console.error('Delete error:', err);
      // Even if delete fails (e.g. not found), remove from local state
      const newUrls = urls.filter(url => url !== urlToDelete);
      setUrls(newUrls);
      onUploadSuccess(newUrls);
    }
  };

  return (
    <div className="file-upload-container" style={{ marginTop: '1rem' }}>
      <label className="input-label">Unit Photos / صور الوحدة</label>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {urls.map((url, index) => (
          <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={url} alt={`Unit photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              type="button" 
              onClick={() => handleDelete(url)}
              style={{
                position: 'absolute', top: '4px', right: '4px', 
                background: 'rgba(255,0,0,0.7)', color: 'white', 
                border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {urls.length < maxFiles && (
        <div>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleFileChange} 
            disabled={uploading}
            id="file-upload"
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="file-upload" 
            className="btn btn-outline" 
            style={{ cursor: uploading ? 'not-allowed' : 'pointer', display: 'inline-block' }}
          >
            {uploading ? `Uploading... ${Math.round(progress)}%` : 'Add Photo / إضافة صورة'}
          </label>
        </div>
      )}

      {error && <span className="error-message" style={{ display: 'block', marginTop: '0.5rem' }}>{error}</span>}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        Max {maxFiles} images. Up to 5MB each. JPG, PNG, WEBP.
      </p>
    </div>
  );
}
