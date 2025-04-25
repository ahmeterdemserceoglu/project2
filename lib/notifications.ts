import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Notification } from "@/lib/types"

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string
  title: string
  message: string
  type: "message" | "request" | "system" | "rating" | "return" | "report"
  link?: string
}) {
  try {
    // Bildirim oluştur
    const notification = {
      userId,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "notifications"), notification)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating notification:", error)
    return { success: false, error }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notificationRef = doc(db, "notifications", notificationId)
    await updateDoc(notificationRef, { read: true })
    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
    )

    const snapshot = await getDocs(notificationsQuery)

    const updatePromises = snapshot.docs.map((doc) => updateDoc(doc.ref, { read: true }))

    await Promise.all(updatePromises)

    return { success: true, count: snapshot.size }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error }
  }
}

export function subscribeToUnreadNotifications(userId: string, callback: (count: number) => void) {
  if (!userId) return () => {}

  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
  )

  const unsubscribe = onSnapshot(
    notificationsQuery,
    (snapshot) => {
      callback(snapshot.size)
    },
    (error) => {
      console.error("Error subscribing to unread notifications:", error)
      callback(0)
    },
  )

  return unsubscribe
}

export function subscribeToMessageNotifications(
  userId: string,
  conversationId: string,
  callback: (notifications: Notification[]) => void,
) {
  if (!userId || !conversationId) return () => {}

  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("type", "==", "message"),
    where("link", "==", `/messages/${conversationId}`),
  )

  const unsubscribe = onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[]

      callback(notifications)
    },
    (error) => {
      console.error("Error subscribing to message notifications:", error)
      callback([])
    },
  )

  return unsubscribe
}
