import type { Conversation, Message } from "../types"
import { db } from "../firebase"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { logger } from "../logger"
import { NotificationController } from "./notification-controller"

export class ConversationController {
  // Create a new conversation
  static async createConversation(conversation: Omit<Conversation, "id">): Promise<string> {
    try {
      // Check if a conversation already exists between these users for this item
      const existingConversation = await this.getConversationByParticipantsAndItem(
        conversation.participants,
        conversation.itemId,
      )

      if (existingConversation) {
        return existingConversation.id
      }

      // Create new conversation
      const docRef = await addDoc(collection(db, "conversations"), conversation)

      logger.info("Conversation created successfully", { conversationId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating conversation", { error })
      throw error
    }
  }

  // Get a conversation by ID
  static async getConversationById(id: string): Promise<Conversation | null> {
    try {
      const docRef = doc(db, "conversations", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Conversation
      }

      return null
    } catch (error) {
      logger.error("Error getting conversation by ID", { error, conversationId: id })
      throw error
    }
  }

  // Get conversations by participant ID
  static async getConversationsByParticipant(userId: string): Promise<Conversation[]> {
    try {
      const conversationsQuery = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("lastMessageTimestamp", "desc"),
      )

      const snapshot = await getDocs(conversationsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Conversation)
    } catch (error) {
      logger.error("Error getting conversations by participant", { error, userId })
      throw error
    }
  }

  // Get a conversation by participants and item ID
  static async getConversationByParticipantsAndItem(
    participants: string[],
    itemId: string,
  ): Promise<Conversation | null> {
    try {
      // We need to check for both possible orderings of participants
      const conversationsQuery1 = query(
        collection(db, "conversations"),
        where("participants", "==", participants),
        where("itemId", "==", itemId),
      )

      const snapshot1 = await getDocs(conversationsQuery1)

      if (!snapshot1.empty) {
        const doc = snapshot1.docs[0]
        return { id: doc.id, ...doc.data() } as Conversation
      }

      // Try with reversed participants
      const reversedParticipants = [...participants].reverse()
      const conversationsQuery2 = query(
        collection(db, "conversations"),
        where("participants", "==", reversedParticipants),
        where("itemId", "==", itemId),
      )

      const snapshot2 = await getDocs(conversationsQuery2)

      if (!snapshot2.empty) {
        const doc = snapshot2.docs[0]
        return { id: doc.id, ...doc.data() } as Conversation
      }

      return null
    } catch (error) {
      logger.error("Error getting conversation by participants and item", { error, participants, itemId })
      throw error
    }
  }

  // Add a message to a conversation
  static async addMessage(conversationId: string, message: Omit<Message, "id" | "timestamp">): Promise<string> {
    try {
      // Add message to messages subcollection
      const messagesCollection = collection(db, "conversations", conversationId, "messages")
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
      }

      const docRef = await addDoc(messagesCollection, messageData)

      // Update conversation with last message info
      const conversationRef = doc(db, "conversations", conversationId)
      await updateDoc(conversationRef, {
        lastMessage: message.text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: message.senderId,
      })

      // Get conversation to find the recipient
      const conversation = await this.getConversationById(conversationId)

      if (conversation) {
        // Notify the other participant
        const recipientId = conversation.participants.find((id) => id !== message.senderId)

        if (recipientId) {
          await NotificationController.createNotification({
            userId: recipientId,
            title: "Yeni Mesaj",
            message: `${message.senderName}: ${
              message.text.length > 30 ? message.text.substring(0, 30) + "..." : message.text
            }`,
            type: "message",
            read: false,
            link: `/messages/${conversationId}`,
          })
        }
      }

      logger.info("Message added successfully", { conversationId, messageId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error adding message", { error, conversationId })
      throw error
    }
  }

  // Get messages for a conversation
  static async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesQuery = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc"),
      )

      const snapshot = await getDocs(messagesQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Message)
    } catch (error) {
      logger.error("Error getting messages", { error, conversationId })
      throw error
    }
  }
}
