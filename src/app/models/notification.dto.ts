export interface NotificationDTO {
  id: string;
  sourceUserId: string;
  sourceUserName: string;
  sourceUserAvatar?: string;
  destinationUserId: string;
  title: string;
  message: string;
  notificationType: 'FRIEND_REQUEST' | 'COLLABORATOR_ADDED' | 'REFERRAL_REWARD' | 'SYSTEM_MESSAGE';
  isRead: boolean;
  createdAt: Date;
}

export interface FriendshipStatus {
  isFriend: boolean;
  hasPendingRequest: boolean;
  hasReceivedRequest: boolean;
} 