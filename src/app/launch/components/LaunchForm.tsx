// src/app/launch/components/LaunchForm.tsx

"use client";

import { FaArrowRightLong, FaCheck, FaCircle, FaExclamation, FaMicrophone, FaStop } from 'react-icons/fa6';
import { useAffiliateCodes } from '@/app/hooks/useAffiliateCode';
import { validateImageFormat } from '@/utils/imageValidator';
import { TRADING_CONSTANTS } from '@/app/constants/trading';
import { useAuth } from '../../contexts/AuthContext';
import { FiLoader, FiUpload } from 'react-icons/fi';
import { useWeb3 } from '@/app/hooks/useWeb3';
import TermsCheckbox from './TermsCheckbox';
import { useRouter } from 'next/navigation';
import { CiWarning } from 'react-icons/ci';
import { IoFlash } from 'react-icons/io5';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

const LaunchForm = () => {

  const { addressConnected } = useAuth();

  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [description, setDescription] = useState('');

  const [affiliateCode, setAffiliateCode] = useState('');
  const { data: affiliateCodes, isLoading: isLoadingCodes } = useAffiliateCodes();

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [twitterLink, setTwitterLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [website, setWebsite] = useState('');

  // Add these with your other state variables
  const [isAudioMeme, setIsAudioMeme] = useState(false);
  const [audio, setAudio] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const currentAudioRef = useRef<File | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(10);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isFirstBuyer, setIsFirstBuyer] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const MIN_ETH_VALUE = TRADING_CONSTANTS.MIN_ETH_VALUE;
  const {
    createNBuy,
    checkAndSwitchNetwork
  } = useWeb3()

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();


  // Function to check if code is valid
  const isCodeValid = (code: string) => {
    if (!code || !affiliateCodes) return null;
    
    const foundCode = affiliateCodes.find(c => c.code === code);
    if (!foundCode) return false;
    
    // Check if code is not expired
    return new Date(foundCode.expiresAt) > new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Initial validations
      if (!addressConnected) {
        toast.error('Wallet not connected');
        return;
      }
  
      if (!name || !ticker) {
        return;
      }

      if (affiliateCode && isCodeValid(affiliateCode) === false) {
        toast.error('Invalid affiliate code');
        setIsSubmitting(false);
        return;
      }

      if (isAudioMeme && !audio) {
        toast.error('Audio file is required for Audio Meme');
        setAudioError("Please upload or record an audio file");
        setIsSubmitting(false);
        return;
      }
  
      // 2. Network check if first buyer
      if (isFirstBuyer) {
        const ethValue = parseFloat(buyAmount);
        if (ethValue < MIN_ETH_VALUE) {
          return;
        }
  
        const isCorrectNetwork = await checkAndSwitchNetwork('BASE_MAINNET');
        if (!isCorrectNetwork) {
          toast.error('Please switch to Base network');
          return;
        }
      }

      let tokenAddress: string | undefined;

      // 3. If first buyer, execute the blockchain transaction first
      if (isFirstBuyer) {
        const buyToastId = toast.loading('First buy in progress...');
        
        try {
          const txResult = await createNBuy(
            buyAmount,
            name,
            ticker,
            addressConnected
          );

          if (!txResult.success) {
            throw new Error('Transaction failed');
          }

          tokenAddress = txResult.tokenAddress;
          toast.success('First buy successful!', { id: buyToastId });
        } catch (error) {
          console.error('Transaction error:', error);
          toast.error('Transaction failed', { id: buyToastId });
          toast.dismiss('buyToastId');
          throw error;
        }
      }
    
      // 4. Prepare form data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('ticker', ticker);
      formData.append('description', description);
      formData.append('creatorAddress', addressConnected);
      formData.append('affiliateCode', affiliateCode);
      if (image instanceof File) {
        formData.append('image', image);
      } else {
        console.error('The provided image is not a File object.');
      }
      if (isAudioMeme && audio instanceof File) {
        formData.append('audio', audio);
      }
      formData.append('twitterLink', twitterLink);
      formData.append('telegramLink', telegramLink);
      formData.append('website', website);
      formData.append('isFirstBuyer', isFirstBuyer.toString());
      if (tokenAddress) {
        formData.append('tokenAddress', tokenAddress);
      }
  
      // 5. Create pending coin in database
      const createToastId = toast.loading('Creating coin...');
      const createResponse = await fetch('/api/coins/create', {
        method: 'POST',
        body: formData,
      });
  
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create coin');
      }
  
      const createData = await createResponse.json();
      const createdCoin = createData.coin;
  
      if (!createdCoin || !createdCoin.id) {
        throw new Error('Invalid coin data returned from API');
      }
  
      toast.success('Coin created!', { id: createToastId });
  
      // 6. Track holding after successful creation & buy
      if (isFirstBuyer) {
        await fetch('/api/users/track-holding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: addressConnected,
            coinId: createdCoin.id
          })
        });
      }
  
      // 7. Redirect to coin page
      router.push(`/coin/${createdCoin.id}`);
  
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear previous errors
    setImageError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic file type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setImageError("Please upload only JPG, JPEG, PNG or GIF images");
        // Clear the input field
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      // File size validation (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setImageError("Image size must be less than 5MB");
        // Clear the input field
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      // Deep validation for actual image format
      validateImageFormat(file).then(isValid => {
        if (!isValid) {
          setImageError("The image format doesn't match its extension. Please upload a valid image.");
          // Clear the input field
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        
        // If all validations pass, set the image and preview
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }).catch((error: unknown) => {
        console.error("Error validating image:", error);
        setImageError("Failed to validate image. Please try again.");
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioError(null);

    const newFile = e.target.files && e.target.files[0];
  
    // First, clear everything
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    // Reset the audio input
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
    
    // Clear the current audio state
    setAudio(null);
    currentAudioRef.current = null;

    if (!newFile) return;

    // Validate the new file
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp3',
      'audio/m4a',
      'audio/x-m4a',
      'audio/mp4',
      'audio/aac',
      'audio/x-aac',
      'audio/webm'
    ];
    if (!allowedTypes.includes(newFile.type)) {
      setAudioError("Please upload only MP3, MP4, WAV, OGG, M4A, or AAC audio files");
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    // File size validation (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (newFile.size > maxSize) {
      setAudioError("Audio size must be less than 2MB");
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    const tempAudio = new Audio();
    const objectUrl = URL.createObjectURL(newFile);

    tempAudio.addEventListener('loadedmetadata', () => {
      // Cleanup object URL
      URL.revokeObjectURL(objectUrl);
      
      // Check duration (in seconds)
      const MAX_DURATION = 10; // 10 seconds maximum
      
      if (tempAudio.duration > MAX_DURATION) {
        setAudioError(`Audio must be ${MAX_DURATION} seconds or less (current: ${tempAudio.duration.toFixed(1)}s)`);
        return;
      }
      
      // If we get here, audio passed all checks
      setAudioError(null);
      
      // Set the new file and create a URL for it
      currentAudioRef.current = newFile;
      setAudio(newFile);
      setAudioUrl(URL.createObjectURL(newFile));
    });

      
    // Handle loading errors
    tempAudio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      setAudioError("Failed to check audio duration. Please try another file.");
    });
    
    // Start loading the audio file
    tempAudio.src = objectUrl;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerAudioInput = () => {
    audioInputRef.current?.click();
  };

  const startRecording = async () => {
    setAudioError(null);
    
    // Clear everything first
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudio(null);
    chunksRef.current = [];
    
    // Reset the countdown timer
    setRecordingTimeLeft(10);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'video/mp4';
      const options = { mimeType };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      // Store recording start time for accurate duration calculation
      const startTime = Date.now();
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Clear the countdown timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        if (chunksRef.current.length === 0) {
          setAudioError("No audio data recorded");
          return;
        }
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 2 * 1024 * 1024) {
          setAudioError("Recording size must be less than 2MB");
          return;
        }
        
        // Calculate actual duration from timestamps
        const recordingDuration = (Date.now() - startTime) / 1000;
        
        if (recordingDuration > 10) {
          setAudioError(`Recording too long (${recordingDuration.toFixed(1)}s). Maximum is 10 seconds.`);
          return;
        }
        
        // Create file and URL for valid recording
        const fileExtension = mimeType.includes('webm') ? 'webm' : 'mp4';
        const file = new File([audioBlob], `degenrecording.${fileExtension}`, { type: mimeType });
        const newAudioUrl = URL.createObjectURL(audioBlob);
        
        setAudioUrl(newAudioUrl);
        setAudio(file);
        currentAudioRef.current = file;
      };
      
      // Start recording
      setIsRecording(true);
      mediaRecorder.start(200);
      
      // Set up countdown timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTimeLeft(prev => {
          if (prev <= 0) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimeout(() => {
        const duration =  Date.now() - startTime;
        if (isRecording && duration>10000) {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setAudioError("Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="w-full md:w-1/2">
      <form className="border-8 border-white bg-white bg-opacity-5 shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="flex text-white text-sm font-medium mb-2">Coin Type</label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {setIsAudioMeme(false); setAudio(null); setAudioError(null);}}
              className={`py-2 px-4 rounded transition-colors ${!isAudioMeme ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white font-semibold' : 'bg-gray-700 text-gray-300'}`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setIsAudioMeme(true)}
              className={`py-2 px-4 rounded transition-colors ${isAudioMeme ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white font-semibold' : 'bg-gray-700 text-gray-300'}`}
            >
              Audio Meme
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="flex text-white text-sm font-medium mb-2 gap-1" htmlFor="name">
            Name<span className="text-fuchsia-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="flex text-white text-sm font-medium mb-2 gap-1" htmlFor="ticker">
            Ticker<span className="text-fuchsia-500">*</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="flex text-white text-sm font-medium mb-2 gap-1" htmlFor="description">
            Description<span className="text-fuchsia-500">*</span>
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="flex text-white text-sm font-medium mb-2 gap-1" htmlFor="image">
            Image<span className="text-fuchsia-500">*</span>
          </label>
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
            required
          />
          <button
            type="button"
            onClick={triggerFileInput}
            className="flex items-center justify-center w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiUpload className="mr-2" />
            {image ? 'Change Image' : 'Upload Image'}
          </button>
          {image ? <p className="mt-2 text-sm text-gray-500">{image.name}</p> : <p className="mt-2 text-sm text-gray-500">5MB Max. (jpg ; png ; gif)</p>}
          {imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview}
                alt="Preview"
                className="max-w-xs h-auto"
                width={100}
                height={100}
              />
            </div>
          )}
          {imageError && (
            <div className="mt-2 text-sm gap-2 text-red-600 bg-red-50 rounded-md p-2 flex items-center">
              <div className="bg-red-400 rounded-full p-1 flex items-center justify-center min-w-[20px] min-h-[20px]">
                <FaExclamation className="text-white" size={12} />
              </div>
              <span>{imageError}</span>
             </div>
          )}
        </div>

        {isAudioMeme && (
          <div className="mb-4">
            <label className="flex text-white text-sm font-medium mb-2 gap-1" htmlFor="audio">
              Audio<span className="text-fuchsia-500">*</span>
            </label>
            <input
              ref={audioInputRef}
              id="audio"
              type="file"
              onChange={handleAudioChange}
              className="hidden"
            />
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={triggerAudioInput}
                className="flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiUpload className="mr-2" />
                {audio ? 'Change Audio' : 'Upload Audio'}
              </button>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex-1 flex items-center justify-center py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isRecording ? (
                  <>
                    <FaStop className="mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <FaMicrophone className="mr-2" />
                    Record
                  </>
                )}
              </button>
            </div>
            
            {isRecording && (
              <div className="mt-2 flex items-center">
                <div className="flex items-center text-red-500">
                  <FaCircle className="animate-pulse mr-2" size={12} />
                  Recording...
                </div>
                <div className="ml-2 px-2 py-1 bg-gray-800 rounded-md text-white font-mono">
                  {recordingTimeLeft}s left
                </div>
              </div>
            )}
            
            {audio ? <p className="mt-2 text-sm text-gray-500">{audio.name}</p> : <p className="mt-2 text-sm text-gray-500">2MB Max.</p>}
            {currentAudioRef.current && audioUrl && (
              <div className="mt-2">
                <audio 
                  controls 
                  className="w-full"
                  key={`audio-${Date.now()}`}
                >
                  <source src={audioUrl} type={currentAudioRef.current.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {audioError && (
              <div className="mt-2 text-sm gap-2 text-red-600 bg-red-50 rounded-md p-2 flex items-center">
                <div className="bg-red-400 rounded-full p-1 flex items-center justify-center min-w-[20px] min-h-[20px]">
                  <FaExclamation className="text-white" size={12} />
                </div>
                <span>{audioError}</span>
              </div>
            )}
          </div>
        )}


        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="hover:underline text-indigo-400 hover:text-indigo-500"
          >
            {showMoreOptions ? 'Hide Socials ↑' : 'Add Socials +'}
          </button>
        </div>
        {showMoreOptions && (
          <>
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2" htmlFor="twitter">
                Twitter / X
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="twitter"
                type="url"
                placeholder="https://x.com/..."
                value={twitterLink}
                onChange={(e) => setTwitterLink(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2" htmlFor="telegram">
                Telegram
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="telegram"
                type="url"
                placeholder="https://t.me/..."
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2" htmlFor="website">
                Website
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="website"
                type="url"
                placeholder="https://"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="mb-6">
        <div className="relative p-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200">
          {/* Gradient border background */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600 to-yellow-600"></div>
          
          {/* Inner content background */}
          <div className="absolute inset-[4px] rounded-lg bg-[#0D121F]"></div>
          
          {/* Content */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex flex-col mb-3 sm:mb-0">
              <label className="text-white text-lg font-semibold mb-2" htmlFor="firstBuyer">
                BUY TOKENS
              </label>
              <p className="flex items-center gap-2 text-gray-300 text-lg mb-2">
                Buy first. Lead the way. <FaArrowRightLong />
              </p>
              <div className="space-y-1 text-sm text-gray-400">
                <p>On the bonding curve, you can&apos;t lose your initial buy.</p>
                <p className="italic">(minus gas and fees)</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isFirstBuyer}
              onClick={() => setIsFirstBuyer(!isFirstBuyer)}
              className={`
                relative inline-flex h-6 w-10 items-center rounded-full
                transition-colors duration-200 ease-in-out focus:outline-none self-start sm:self-center
                ${isFirstBuyer ? 'bg-gradient-to-r from-red-600 to-yellow-600' : 'bg-yellow-200/40'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
                  transition duration-200 ease-in-out
                  ${isFirstBuyer ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {isFirstBuyer && (
            <div className="mt-4 p-4 border-2 border-white border-opacity-20 rounded-lg animate-fadeIn">
              <label className="flex text-white text-sm font-medium mb-2 gap-1" htmlFor="buyAmount">
                First Buy Amount <span className="text-fuchsia-500">*</span>
              </label>
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600/40"></div>
                  
                  <input
                    className="shadow-lg relative bg-gray-900/80 backdrop-blur-sm w-full pr-20 sm:w-3/4 py-3 px-5 text-white leading-tight focus:outline-none focus:ring-0 border-0 rounded-xl transition-all duration-200 placeholder:text-gray-500"
                    id="buyAmount"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    required={isFirstBuyer}
                    placeholder={`Min ${MIN_ETH_VALUE}`}
                  />
                </div>
                
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center py-1 px-2 gap-2 bg-gray-800/60 backdrop-blur-sm rounded-lg shadow-xl">
                  <span className="text-sm font-medium text-gray-300">ETH</span>
                  <Image
                    src="/images/base-logo.webp"
                    alt="ETH Logo"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 text-white text-sm font-medium mb-2" htmlFor="affiliateCode">
            Boost Code <IoFlash className="text-amber-400" size={14}/>
          </label>
          <div className="relative">
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                affiliateCode && (isCodeValid(affiliateCode) === false ? 'border-red-500' : isCodeValid(affiliateCode) ? 'border-green-500' : '')
              }`}
              id="affiliateCode"
              type="text"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value)}
            />
            {isLoadingCodes && affiliateCode && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <FiLoader className="animate-spin h-5 w-5 text-gray-500" />
              </div>
            )}
            {!isLoadingCodes && affiliateCode && isCodeValid(affiliateCode) && (
              <div className="mt-2 text-sm gap-2 text-green-600 bg-green-50 rounded-md p-2 flex items-center">
                <div className="bg-green-400 rounded-full p-1 flex items-center justify-center min-w-[20px] min-h-[20px]">
                  <FaCheck className="text-white" size={12} />
                </div>
                <span>Using code <span className="font-semibold">{affiliateCode}</span></span>
              </div>
            )}
            {!isLoadingCodes && affiliateCode && isCodeValid(affiliateCode) === false && (
              <div className="mt-2 text-sm gap-2 text-red-600 bg-red-50 rounded-md p-2 flex items-center">
                <div className="bg-red-400 rounded-full p-1 flex items-center justify-center min-w-[20px] min-h-[20px]">
                  <FaExclamation className="text-white" size={12} />
                </div>
                <span>Code not available</span>
              </div>
            )}
          </div>
        </div>

        <p className="flex items-center text-sm text-gray-500 mb-4"><CiWarning className='mr-2 text-red-500' />Coin info cannot be changed after creation</p>
        <div className="mb-6">
          <TermsCheckbox 
            addressConnected={addressConnected}
          />
        </div>
        <div className="flex w-full md:1/2 justify-center">
          <button
            type="submit"
            className={`
              bg-gradient-to-tr from-red-600 to-yellow-600 
              hover:bg-gradient-to-br hover:shadow-lg 
              font-bold text-white py-2 px-4 rounded 
              focus:outline-none focus:shadow-outline 
              group transition-all duration-200
              ${(isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              'Launch Coin'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LaunchForm;