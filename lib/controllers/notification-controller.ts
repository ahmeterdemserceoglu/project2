import type { Notification } from "../types"
import { db } from "../firebase"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { logger } from "../logger"

export class NotificationController {
  // Create a new notification
  static async createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        createdAt: serverTimestamp(),
      })

      logger.info("Notification created successfully", { notificationId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating notification", { error })
      throw error
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(notificationsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification)
    } catch (error) {
      logger.error("Error getting user notifications", { error, userId })
      throw error
    }
  }

  // Mark notification as read
  static async markAsRead(id: string): Promise<void> {
    try {
      const notificationRef = doc(db, "notifications", id)
      await updateDoc(notificationRef, { read: true })

      logger.info("Notification marked as read", { notificationId: id })
    } catch (error) {
      logger.error("Error marking notification as read", { error, notificationId: id })
      throw error
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId)

      const updatePromises = notifications
        .filter((notification) => !notification.read)
        .map((notification) => {
          const notificationRef = doc(db, "notifications", notification.id)
          return updateDoc(notificationRef, { read: true })
        })

      await Promise.all(updatePromises)

      logger.info("All notifications marked as read", { userId })
    } catch (error) {
      logger.error("Error marking all notifications as read", { error, userId })
      throw error
    }
  }

  // Delete a notification
  static async deleteNotification(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "notifications", id))
      logger.info("Notification deleted successfully", { notificationId: id })
    } catch (error) {
      logger.error("Error deleting notification", { error, notificationId: id })
      throw error
    }
  }

  // Get unread notification count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false),
      )

      const snapshot = await getDocs(notificationsQuery)
      return snapshot.size
    } catch (error) {
      logger.error("Error getting unread notification count", { error, userId })
      throw error
    }
  }
}
