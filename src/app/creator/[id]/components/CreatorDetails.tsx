// src/app/creator/[id]/components/CreatorDetails.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { ProfileData } from '@/app/types/profileTabs';
import { useAuth } from '@/app/contexts/AuthContext';
import EditProfileModal from './EditProfileModal';
import { GiRocketFlight } from "react-icons/gi";
import ProfileHeader from './ProfileHeader';
import { notFound } from 'next/navigation';
import ProfileTabs from './ProfileTabs';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreatorDetails({ params }: {params:{ id: string }}) {
  const addressInUrl = params.id;
  const { addressConnected: currentUserAddress } = useAuth();

  const [activeTab, setActiveTab] = useState('coins held');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    address: addressInUrl,
    username: '',
    bio: '',
    profileImage: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/address/${addressInUrl}`);
      const { success, data, error } = await response.json();

      if (!response.ok || !success) {
        if (response.status === 404) {
          setNotFoundError(true);
          return;
        }
        throw new Error(error || 'Failed to fetch user data');
      }

      setProfileData({
        id: data.id,
        address: data.address,
        username: data.username,
        bio: data.bio || `${data.username} is creating Kults`,
        profileImage: data.image || '',
      });

      setIsOwnProfile(data.address.toLowerCase() === currentUserAddress?.toLowerCase());
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addressInUrl, currentUserAddress]);

  // Trigger fetch on mount
  useEffect(() => {
    if (addressInUrl) {
      fetchProfileData();
    }
  }, [addressInUrl, fetchProfileData]);

  // Handle 404
  useEffect(() => {
    if (!isLoading && notFoundError) {
      notFound();
    }
  }, [isLoading, notFoundError]);

  useEffect(() => {
    // Get tab from URL using window.location
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam && isOwnProfile && tabParam === 'claims') {
      setActiveTab('claims');
    }
  }, [isOwnProfile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseEditProfile = () => {
    setIsEditModalOpen(false);
    document.body.style.overflow = 'unset';
  }

  const handleSaveProfile = async (newProfileData: ProfileData) => {
    document.body.style.overflow = 'unset';
    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile data');
      }

      if (result.success) {
        setProfileData(newProfileData);
        setIsEditModalOpen(false);
        toast.success('Profile updated successfully!');
      } 

    } catch (error) {
      if (error instanceof Error && error.message.includes('Username is already taken')) {
        console.error('This username is already taken');
      } else {
        toast.error('Failed to update profile. Please try again later.');
      }
      throw error;
    }
  };

  return (
    <main className="py-12">
      <div className="max-w-3xl mx-auto">       
        <div className="bg-gray-900 text-white p-8 rounded-lg max-w-3xl mx-auto">
          <ProfileHeader
            profileData={profileData}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            isLoading={isLoading}
          />

          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOwnProfile={isOwnProfile}
            profileData={profileData}
          />
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            profileData={profileData}
            onSave={handleSaveProfile}
            onClose={handleCloseEditProfile}
          />
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/" passHref>
            <button className="flex items-center gap-3 border border-gray-400 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-800 transition duration-200 cursor-pointer">
            <GiRocketFlight className='text-amber-400 text-xl' />
              Back to Kults
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}