import type { Rating } from "../types"
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
} from "firebase/firestore"
import { logger } from "../logger"
import { NotificationController } from "./notification-controller"

export class RatingController {
  // Create a new rating
  static async createRating(rating: Omit<Rating, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "ratings"), {
        ...rating,
        createdAt: serverTimestamp(),
      })

      // Notify the rated user
      await NotificationController.createNotification({
        userId: rating.ratedUserId,
        title: "Yeni Değerlendirme",
        message: `${rating.raterName} size ${rating.rating} yıldız verdi.`,
        type: "rating",
        read: false,
        link: `/profile/${rating.ratedUserId}`,
      })

      logger.info("Rating created successfully", { ratingId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating rating", { error })
      throw error
    }
  }

  // Get a rating by ID
  static async getRatingById(id: string): Promise<Rating | null> {
    try {
      const docRef = doc(db, "ratings", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Rating
      }

      return null
    } catch (error) {
      logger.error("Error getting rating by ID", { error, ratingId: id })
      throw error
    }
  }

  // Update a rating
  static async updateRating(id: string, data: Partial<Rating>): Promise<void> {
    try {
      const ratingRef = doc(db, "ratings", id)
      await updateDoc(ratingRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      logger.info("Rating updated successfully", { ratingId: id })
    } catch (error) {
      logger.error("Error updating rating", { error, ratingId: id })
      throw error
    }
  }

  // Get ratings by rated user ID
  static async getRatingsByRatedUserId(ratedUserId: string): Promise<Rating[]> {
    try {
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("ratedUserId", "==", ratedUserId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(ratingsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Rating)
    } catch (error) {
      logger.error("Error getting ratings by rated user ID", { error, ratedUserId })
      throw error
    }
  }

  // Get ratings by rater ID
  static async getRatingsByRaterId(raterId: string): Promise<Rating[]> {
    try {
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("raterId", "==", raterId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(ratingsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Rating)
    } catch (error) {
      logger.error("Error getting ratings by rater ID", { error, raterId })
      throw error
    }
  }

  // Get average rating for a user
  static async getAverageRatingForUser(userId: string): Promise<number> {
    try {
      const ratings = await this.getRatingsByRatedUserId(userId)

      if (ratings.length === 0) {
        return 0
      }

      const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
      return sum / ratings.length
    } catch (error) {
      logger.error("Error getting average rating for user", { error, userId })
      throw error
    }
  }

  // Check if user has already rated another user for a specific request
  static async hasUserRatedForRequest(raterId: string, ratedUserId: string, requestId: string): Promise<boolean> {
    try {
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("raterId", "==", raterId),
        where("ratedUserId", "==", ratedUserId),
        where("requestId", "==", requestId),
      )

      const snapshot = await getDocs(ratingsQuery)
      return !snapshot.empty
    } catch (error) {
      logger.error("Error checking if user has rated for request", { error, raterId, ratedUserId, requestId })
      throw error
    }
  }
}
