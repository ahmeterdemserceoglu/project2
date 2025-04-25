import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, orderBy } from "firebase/firestore"
import type { Notification } from "@/lib/types"

// Create a new notification
export async function createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notification,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[]
  } catch (error) {
    console.error("Error getting user notifications:", error)
    throw error
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, {
      read: true,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))
    const querySnapshot = await getDocs(q)

    const batch = querySnapshot.docs.map((doc) => {
      const notificationRef = doc.ref
      return updateDoc(notificationRef, {
        read: true,
      })
    })

    await Promise.all(batch)
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Get unread notification count for a user
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    throw error
  }
}
