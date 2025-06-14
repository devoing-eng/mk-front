import { User } from '@/app/types/user';
  
export interface UserLike {
    id: string;
    userId: string;
    commentId?: string | null;
    replyId?: string | null;
}
  
export type Comment = {
    id: string;
    user: User;
    timestamp: string;
    content: string;
    likes: number;
    imageUrl?: string;
    commentNumber: string;
    replies: Reply[];
    likedBy: UserLike[];
}
  
export type Reply = {
    id: string;
    commentId: string;
    user: User;
    timestamp: string;
    content: string;
    likes: number;
    imageUrl?: string;
    likedBy: UserLike[];
}