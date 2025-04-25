import type { User, UserProfile } from "../types"
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
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore"
import { logger } from "../logger"

export class UserController {
  // Create a new user
  static async createUser(user: Omit<User, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      logger.info("User created successfully", { userId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating user", { error })
      throw error
    }
  }

  // Get a user by ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, "users", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User
      }

      return null
    } catch (error) {
      logger.error("Error getting user by ID", { error, userId: id })
      throw error
    }
  }

  // Get a user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersQuery = query(collection(db, "users"), where("email", "==", email))
      const snapshot = await getDocs(usersQuery)

      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return { id: doc.id, ...doc.data() } as User
      }

      return null
    } catch (error) {
      logger.error("Error getting user by email", { error, email })
      throw error
    }
  }

  // Update a user
  static async updateUser(id: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, "users", id)
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      logger.info("User updated successfully", { userId: id })
    } catch (error) {
      logger.error("Error updating user", { error, userId: id })
      throw error
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await this.getUserById(userId)

      if (!userDoc) {
        return null
      }

      // Get user's items
      const itemsQuery = query(collection(db, "items"), where("ownerId", "==", userId))
      const itemsSnapshot = await getDocs(itemsQuery)
      const itemsCount = itemsSnapshot.size

      // Get user's borrowed items
      const borrowedItemsQuery = query(
        collection(db, "requests"),
        where("requesterId", "==", userId),
        where("status", "==", "accepted"),
      )
      const borrowedItemsSnapshot = await getDocs(borrowedItemsQuery)
      const borrowedItemsCount = borrowedItemsSnapshot.size

      // Get user's ratings
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("ratedUserId", "==", userId),
        orderBy("createdAt", "desc"),
      )
      const ratingsSnapshot = await getDocs(ratingsQuery)
      const ratings = ratingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Calculate average rating
      let averageRating = 0
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
        averageRating = sum / ratings.length
      }

      // Get recent activity
      const recentActivityQuery = query(
        collection(db, "requests"),
        where("requesterId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(5),
      )
      const recentActivitySnapshot = await getDocs(recentActivityQuery)
      const recentActivity = recentActivitySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      return {
        ...userDoc,
        itemsCount,
        borrowedItemsCount,
        ratings,
        averageRating,
        recentActivity,
      }
    } catch (error) {
      logger.error("Error getting user profile", { error, userId })
      throw error
    }
  }

  // Search users
  static async searchUsers(query: string, limit = 10): Promise<User[]> {
    try {
      // This is a simple implementation. For production, consider using Firestore's array-contains
      // with tags or a third-party search service like Algolia
      const usersQuery = query(collection(db, "users"), orderBy("displayName"), limit)
      const snapshot = await getDocs(usersQuery)

      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)

      // Filter users by query (case insensitive)
      const lowerQuery = query.toLowerCase()
      return users.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(lowerQuery) || user.email?.toLowerCase().includes(lowerQuery),
      )
    } catch (error) {
      logger.error("Error searching users", { error, query })
      throw error
    }
  }
}
