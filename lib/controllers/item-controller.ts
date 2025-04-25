import type { Item, ItemWithOwner } from "../types"
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
  deleteDoc,
} from "firebase/firestore"
import { logger } from "../logger"
import { UserController } from "./user-controller"

export class ItemController {
  // Create a new item
  static async createItem(item: Omit<Item, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "items"), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      logger.info("Item created successfully", { itemId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating item", { error })
      throw error
    }
  }

  // Get an item by ID
  static async getItemById(id: string): Promise<Item | null> {
    try {
      const docRef = doc(db, "items", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Item
      }

      return null
    } catch (error) {
      logger.error("Error getting item by ID", { error, itemId: id })
      throw error
    }
  }

  // Get an item with owner details
  static async getItemWithOwner(id: string): Promise<ItemWithOwner | null> {
    try {
      const item = await this.getItemById(id)

      if (!item) {
        return null
      }

      const owner = await UserController.getUserById(item.ownerId)

      if (!owner) {
        return { ...item, owner: null }
      }

      return {
        ...item,
        owner: {
          id: owner.id,
          displayName: owner.displayName,
          email: owner.email,
          photoURL: owner.photoURL,
        },
      }
    } catch (error) {
      logger.error("Error getting item with owner", { error, itemId: id })
      throw error
    }
  }

  // Update an item
  static async updateItem(id: string, data: Partial<Item>): Promise<void> {
    try {
      const itemRef = doc(db, "items", id)
      await updateDoc(itemRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      logger.info("Item updated successfully", { itemId: id })
    } catch (error) {
      logger.error("Error updating item", { error, itemId: id })
      throw error
    }
  }

  // Delete an item
  static async deleteItem(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "items", id))
      logger.info("Item deleted successfully", { itemId: id })
    } catch (error) {
      logger.error("Error deleting item", { error, itemId: id })
      throw error
    }
  }

  // Get items by owner ID
  static async getItemsByOwnerId(ownerId: string): Promise<Item[]> {
    try {
      const itemsQuery = query(collection(db, "items"), where("ownerId", "==", ownerId), orderBy("createdAt", "desc"))

      const snapshot = await getDocs(itemsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Item)
    } catch (error) {
      logger.error("Error getting items by owner ID", { error, ownerId })
      throw error
    }
  }

  // Get items by category
  static async getItemsByCategory(category: string): Promise<Item[]> {
    try {
      const itemsQuery = query(
        collection(db, "items"),
        where("category", "==", category),
        where("status", "==", "available"),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(itemsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Item)
    } catch (error) {
      logger.error("Error getting items by category", { error, category })
      throw error
    }
  }

  // Search items
  static async searchItems(searchTerm: string, filters: Record<string, any> = {}): Promise<Item[]> {
    try {
      // Base query - available items
      let itemsQuery = query(collection(db, "items"), where("status", "==", "available"))

      // Apply filters
      if (filters.category) {
        itemsQuery = query(itemsQuery, where("category", "==", filters.category))
      }

      if (filters.location) {
        itemsQuery = query(itemsQuery, where("location", "==", filters.location))
      }

      // Execute query
      const snapshot = await getDocs(itemsQuery)
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Item)

      // Filter by search term (client-side filtering)
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return items.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            (item.description && item.description.toLowerCase().includes(term)),
        )
      }

      return items
    } catch (error) {
      logger.error("Error searching items", { error, searchTerm, filters })
      throw error
    }
  }

  // Get recent items
  static async getRecentItems(limitCount = 10): Promise<Item[]> {
    try {
      const itemsQuery = query(
        collection(db, "items"),
        where("status", "==", "available"),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      )

      const snapshot = await getDocs(itemsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Item)
    } catch (error) {
      logger.error("Error getting recent items", { error })
      throw error
    }
  }

  // Get popular items (most requested)
  static async getPopularItems(limitCount = 10): Promise<Item[]> {
    try {
      // This is a simplified implementation
      // For a production app, you might want to track request count in the item document
      // or use a more sophisticated approach
      const itemsQuery = query(
        collection(db, "items"),
        where("status", "==", "available"),
        orderBy("viewCount", "desc"),
        limit(limitCount),
      )

      const snapshot = await getDocs(itemsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Item)
    } catch (error) {
      logger.error("Error getting popular items", { error })
      throw error
    }
  }

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    try {
      const itemRef = doc(db, "items", id)
      const itemSnap = await getDoc(itemRef)

      if (itemSnap.exists()) {
        const currentViewCount = itemSnap.data().viewCount || 0
        await updateDoc(itemRef, {
          viewCount: currentViewCount + 1,
        })
      }
    } catch (error) {
      logger.error("Error incrementing view count", { error, itemId: id })
      // Don't throw error for view count - non-critical operation
    }
  }
}
