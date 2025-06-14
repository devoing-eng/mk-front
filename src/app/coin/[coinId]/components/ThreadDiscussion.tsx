// src/app/coin/[coinId]/components/ThreadDiscussion.tsx

import { Comment, Reply, UserLike } from '@/app/types/comments';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { timeAgo } from '@/utils/dateFormat';
import { FaXTwitter } from 'react-icons/fa6';
import { FiUpload } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';
import { ZoomableImage } from './ZoomableImage';
import { CoinStaticData } from '@/app/types/coin';

export default function ThreadDiscussion({ coinId, coinData }: { coinId : string, coinData: CoinStaticData}) {
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [, setLikedComments] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyImage, setReplyImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/coin/${coinId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
        
        // Initialize liked comments state based on user's likes
        if (user) {
          const userLikes = new Set<string>(
            data.flatMap((comment: Comment) => 
              comment.likedBy
                .filter((like: UserLike) => like.userId === user.id)
                .map(() => comment.id)
            )
          );
          setLikedComments(userLikes);
        }
      } catch (error) {
        console.error(error)
      }
    };
  
    if (coinId) {
      fetchComments();
    }
  }, [coinId, user]);

  const handlePostComment = async () => {
    if (!replyContent || !user || isSubmitting) return;
  
    setIsSubmitting(true);
    try {
      let imageUrl;
      if (replyImage) {
        const formData = new FormData();
        formData.append('image', replyImage);
          
        try {
          const uploadResponse = await fetch('/api/comments/upload', {
            method: 'POST',
            body: formData,
          });
    
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            throw new Error(errorData || 'Failed to upload image');
          }
    
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.imageUrl;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error('Failed to upload image. Please try again.');
        }
      }
  
      const endpoint = replyTo === 'initial' 
        ? '/api/comments' 
        : `/api/comments/${replyTo}/reply`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          content: replyContent,
          userId: user.id,
          coinId,
          imageUrl
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to post reply');
      }
  
      await response.json();
  
      // Refresh comments after posting
      const refreshResponse = await fetch(`/api/comments/coin/${coinId}`);
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh comments');
      }
      const refreshedComments = await refreshResponse.json();
      setComments(refreshedComments);
  
      // Reset form
      setReplyTo(null);
      setReplyContent('');
      setReplyImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error posting:', error);
      alert(error instanceof Error ? error.message : 'Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
  
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to like comment');
      }
  
      const updatedComment = await response.json();
      
      // Update comments state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? {
            ...comment,
            likes: updatedComment.likes,
            likedBy: updatedComment.likedBy
          } : comment
        )
      );
  
      // Update liked comments set
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    // Validate file size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }
  
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }
  
    try {
      // Set the file for upload
      setReplyImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setReplyImage(null);
        setImagePreview(null);
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling image:', error);
      setReplyImage(null);
      setImagePreview(null);
      alert('Error handling image. Please try again.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-800/30 p-2 sm:p-3 rounded-lg border border-gray-700/50 w-full sm:w-auto">
          <div className="flex flex-wrap items-center text-gray-300 text-sm sm:text-base">
            <FaXTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-2" />
            <span>Tweet with</span>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 ml-1 sm:ml-2">
              <Link 
                href="https://x.com/memekult_com" 
                className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-colors duration-200"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span className="text-[#1DA1F1]">@</span>
                <span className="text-gray-300 hover:text-gray-200">memekult_com</span>
              </Link>
              
              <span className="text-gray-500">and</span>
              
              <Link 
                href={`https://x.com/search?q=%24${coinData?.ticker.toUpperCase()}`}
                className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-colors duration-200"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span className="text-[#1DA1F1]">$</span>
                <span className="text-gray-300 hover:text-gray-200">{coinData?.ticker}</span>
              </Link>
            </div>
          </div>
        </div>
        <button
          onClick={() => setReplyTo('initial')}
          className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors w-full sm:w-auto"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 sm:h-5 sm:w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>New Comment</span>
        </button>
      </div>
      
      {comments.length === 0 ? (
        <div className="flex flex-col items-center space-y-4 mt-4">
          <p className="text-white">No comments yet. Be the first to comment! 💬</p>
        </div>
      ) : (
        comments.map((comment, index) => (
          <div 
            key={comment.id} 
            className={`flex flex-col space-y-4 bg-gray-600/80 backdrop-blur-sm rounded-lg p-6 ${
              index === 0 ? 'border-2 border-white/20' : 'border border-white/10'
            }`}
          >
            <div className="flex space-x-4 w-full">
              <div className="flex-shrink-0">
                <Image
                  src={comment.user.image || '/images/blockie1.jpg'}
                  alt={`${comment.user.username}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-purple-500/30 max-w-[40px] h-auto w-auto"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row gap-2 mb-2 items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/creator/${comment.user.address}`} className="font-semibold text-sm text-white/90 hover:underline">{comment.user.username}</Link>
                    <span className="text-xs text-gray-400">{timeAgo(comment.timestamp)}</span>
                    <button 
                      onClick={() => setReplyTo(comment.id)}
                      className="text-blue-400 text-xs hover:text-blue-300 transition-colors duration-200"
                    >
                      Reply
                    </button>
                  </div>
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors duration-200 mt-1 sm:mt-0 ml-auto sm:ml-0"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4" 
                      viewBox="0 0 20 20" 
                      fill={comment.likedBy?.some(like => like.userId === user?.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                    >
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-300">{comment.likes}</span>
                  </button>
                </div>
                {comment.imageUrl && (
                  <div className="mb-3">
                    <ZoomableImage
                      src={comment.imageUrl}
                      alt="Comment image"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                      expandedScale={2}
                    />
                  </div>
                )}
                <p className="text-sm text-white/80 break-words">{comment.content}</p>
              </div>
            </div>

            {comment.replies?.length > 0 && (
              <div className="ml-6 pl-6 border-l-2 border-purple-500/20 space-y-4 max-w-[90%]">
                {comment.replies.map((reply: Reply) => (
                  <div key={reply.id} className="flex space-x-3 bg-gray-700/50 rounded-lg p-4 max-w-[85%]">
                    <div className="flex-shrink-0">
                      <Image
                        src={reply.user.image || '/images/blockie1.jpg'}
                        alt={`${reply.user.username}'s avatar`}
                        width={32}
                        height={32}
                        className="rounded-full ring-1 ring-purple-500/20 max-w-[32px] h-auto w-auto"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-white/90">{reply.user.username}</span>
                          <span className="text-xs text-gray-400">{timeAgo(reply.timestamp)}</span>
                        </div>
                      </div>
                      {reply.imageUrl && (
                        <div className="mb-2">
                          <Image
                            src={reply.imageUrl}
                            alt="Reply image"
                            width={200}
                            height={150}
                            className="rounded-lg object-cover max-w-[200px]"
                          />
                        </div>
                      )}
                      <p className="text-sm text-white/80 break-words">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Reply Modal */}
      {replyTo && (
        <div className="fixed -inset-4 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-gradient-to-br from-gray-900 via-purple-800 to-indigo-800 px-6 py-8 rounded-lg w-96">
            <button 
              onClick={() => {
                setReplyTo(null)
                setReplyContent('')
                setReplyImage(null)
                setImagePreview(null)
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors border border-white border-opacity-20 hover:border-opacity-80 rounded-full p-2"
              aria-label="Close modal"
            >
              <IoClose size={20} />
            </button>
            <h3 className="text-white font-medium my-2">Add a comment</h3>
            <div className="bg-gray-700 text-white p-2 rounded mb-2 border border-gray-600">
              <span className="font-bold">#{coinData?.ticker}</span>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-transparent outline-none mt-2 border border-white rounded-md p-2"
                rows={3}
              />
            </div>
            
            <div className="mb-2">
              <label className="flex text-white font-medium mb-2">Image</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex items-center justify-center w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiUpload className="mr-2" />
                  {replyImage ? 'Change Image' : 'Upload Image'}
                </button>
                
                {replyImage && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">{replyImage.name}</p>
                    <button
                      onClick={() => {
                        setReplyImage(null);
                        setImagePreview(null);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <IoClose size={16} />
                    </button>
                  </div>
                )}
                
                {imagePreview && (
                  <div className="mt-2 relative group">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-lg max-w-full h-auto"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handlePostComment}
              disabled={isSubmitting}
              className={`w-full text-white p-2 rounded mb-2 font-bold ${
                isSubmitting 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-400 to-indigo-600 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-indigo-800'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                replyTo === 'initial' ? 'Post Comment' : 'Reply'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}