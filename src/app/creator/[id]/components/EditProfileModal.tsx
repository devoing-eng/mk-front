import { defaultProfileImage } from '@/app/constants/general';
import { useState, ChangeEvent, FormEvent } from 'react';
import { ProfileData } from '@/app/types/profileTabs';
import Image from 'next/image';

interface EditProfileModalProps {
  profileData: ProfileData;
  onSave: (newProfileData: ProfileData) => void;
  onClose: () => void;
}

export default function EditProfileModal({
  profileData,
  onSave,
  onClose
}: EditProfileModalProps) {
  const [editedData, setEditedData] = useState<ProfileData>(profileData);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setEditedData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(editedData);
    setUsernameError(''); 

    try {
      await onSave(editedData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Username is already taken')) {
        setUsernameError('This username is already taken');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white">
              Profile photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <Image
                  src={previewImage || editedData.profileImage || defaultProfileImage}
                  alt="Profile"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <label className="cursor-pointer bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded">
                <span>Change</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={editedData.username}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {usernameError && (
              <p className="mt-1 text-sm text-red-500">
                {usernameError}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              placeholder='Kults'
              value={editedData.bio}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 rounded hover:underline text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-200 hover:bg-indigo-300 text-gray-800 font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}