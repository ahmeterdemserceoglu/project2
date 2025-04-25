export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: "user" | "admin"
  createdAt: any
}

export interface Item {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  userId: string
  userDisplayName?: string
  location?: string
  createdAt: Date | number | string | null
  unlimitedDuration?: boolean
  images?: string[]
  status: string
}

export interface ItemWithOwner extends Item {
  owner: {
    id: string
    displayName: string
    email: string
    photoURL?: string
  } | null
}

export interface Request {
  id: string
  itemId: string
  itemTitle: string
  ownerId: string
  ownerName?: string
  requesterId: string
  requesterName: string
  status: "pending" | "accepted" | "rejected" | "completed" | "returning" | "awaiting_approval"
  ownerConfirmed?: boolean
  requesterConfirmed?: boolean
  ownerDeliveryConfirmed?: boolean
  requesterReturnConfirmed?: boolean
  ownerReturnConfirmed?: boolean
  requesterFinalConfirmed?: boolean
  deliveryStatus?: "" | "requester_confirmed" | "completed"
  returnStatus?: "requester_confirmed" | "owner_confirmed" | "completed"
  message?: string
  pickupLocation?: string
  pickupDate?: any
  conversationId?: string
  createdAt: any
}

export interface ReturnRequest {
  id: string
  requestId: string
  itemId: string
  itemTitle: string
  ownerId: string
  ownerName?: string
  requesterId: string
  requesterName: string
  status: "pending" | "accepted" | "rejected" | "completed"
  returnLocation: string
  returnDate: any
  message: string
  ownerConfirmed: boolean
  requesterConfirmed: boolean
  adminReviewed: boolean
  conversationId?: string
  notes?: string
  createdAt: any
}

export interface Report {
  id: string
  itemId: string
  itemTitle: string
  ownerId: string
  reporterId: string
  reporterName: string
  reason: string
  description: string
  status: "pending" | "resolved" | "dismissed"
  adminReviewed: boolean
  createdAt: any
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "message" | "request" | "system" | "rating" | "return" | "report"
  read: boolean
  link?: string
  createdAt: any
}

export interface Rating {
  id: string
  raterId: string
  raterName: string
  ratedUserId: string
  rating: number
  comment: string
  type: "borrower" | "lender"
  createdAt: any
}

export interface LogEntry {
  level: "info" | "warn" | "error"
  message: string
  context?: Record<string, any>
  timestamp: number
}

export interface Conversation {
  id: string
  itemId: string
  itemTitle: string
  participants: string[]
  lastMessage: string
  lastMessageTimestamp: any
  lastMessageSenderId: string
  ownerId?: string
  requesterId?: string
  requestId?: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: any
  fileUrl?: string
  fileName?: string
  fileType?: string
  imageUrl?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon: string
  order: number
  parentId?: string | null
}

export interface UserProfile extends User {
  itemsCount: number
  borrowedItemsCount: number
  ratings: Rating[]
  averageRating: number
  recentActivity: Request[]
}

// Live Support Types
export interface SupportSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: "active" | "closed"
  createdAt: Date
  lastActivity: Date
  unreadCount: number
}

export interface SupportMessage {
  id: string
  sessionId: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  isAdmin: boolean
  timestamp: Date
  read: boolean
}
