import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { logger } from "./logger"

export type UserStatus = "online" | "offline" | "away"

export interface UserStatusData {
  status: UserStatus
  lastChanged: Date | null
}

// Kullanıcı durumunu güncelleyen fonksiyon
export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  if (!userId) return

  try {
    const userStatusRef = doc(db, "userStatus", userId)

    // updateDoc yerine setDoc kullanarak, belge yoksa oluştur, varsa güncelle
    await setDoc(
      userStatusRef,
      {
        state: status,
        lastSeen: serverTimestamp(),
      },
      { merge: true }, // merge: true sayesinde, belge yoksa oluşturulur, varsa güncellenir
    )

    logger.info("User status updated", { userId, status })
  } catch (error) {
    logger.error("Error updating user status", { error, userId })
  }
}

// Kullanıcı çevrimiçi olduğunda
export const setUserOnline = async (userId: string) => {
  await updateUserStatus(userId, "online")
}

// Kullanıcı çevrimdışı olduğunda
export const setUserOffline = async (userId: string) => {
  await updateUserStatus(userId, "offline")
}

// Kullanıcı uzakta olduğunda
export const setUserAway = async (userId: string) => {
  await updateUserStatus(userId, "away")
}

// Kullanıcı durumunu dinleyen fonksiyon
export function subscribeToUserStatus(userId: string, callback: (status: UserStatusData | null) => void): () => void {
  if (!userId) return () => {}

  const userStatusRef = doc(db, "userStatus", userId)
  const unsubscribe = onSnapshot(
    userStatusRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        const statusData: UserStatusData = {
          status: data.state || "offline",
          lastChanged: data.lastSeen ? data.lastSeen.toDate() : null,
        }
        callback(statusData)
      } else {
        callback(null)
      }
    },
    (error) => {
      logger.error("Error getting user status", { error, userId })
      callback(null)
    },
  )

  return unsubscribe
}
