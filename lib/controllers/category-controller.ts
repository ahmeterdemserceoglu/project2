import type { Category } from "../types"
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
  deleteDoc,
} from "firebase/firestore"
import { logger } from "../logger"

export class CategoryController {
  // Create a new category
  static async createCategory(category: Omit<Category, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      logger.info("Category created successfully", { categoryId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating category", { error })
      throw error
    }
  }

  // Get a category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, "categories", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Category
      }

      return null
    } catch (error) {
      logger.error("Error getting category by ID", { error, categoryId: id })
      throw error
    }
  }

  // Update a category
  static async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    try {
      const categoryRef = doc(db, "categories", id)
      await updateDoc(categoryRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      logger.info("Category updated successfully", { categoryId: id })
    } catch (error) {
      logger.error("Error updating category", { error, categoryId: id })
      throw error
    }
  }

  // Delete a category
  static async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "categories", id))
      logger.info("Category deleted successfully", { categoryId: id })
    } catch (error) {
      logger.error("Error deleting category", { error, categoryId: id })
      throw error
    }
  }

  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      const categoriesQuery = query(collection(db, "categories"), orderBy("order", "asc"))
      const snapshot = await getDocs(categoriesQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
    } catch (error) {
      logger.error("Error getting all categories", { error })
      throw error
    }
  }

  // Get categories by parent ID
  static async getCategoriesByParentId(parentId: string): Promise<Category[]> {
    try {
      const categoriesQuery = query(
        collection(db, "categories"),
        where("parentId", "==", parentId),
        orderBy("order", "asc"),
      )
      const snapshot = await getDocs(categoriesQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
    } catch (error) {
      logger.error("Error getting categories by parent ID", { error, parentId })
      throw error
    }
  }

  // Get root categories (categories without a parent)
  static async getRootCategories(): Promise<Category[]> {
    try {
      const categoriesQuery = query(
        collection(db, "categories"),
        where("parentId", "==", null),
        orderBy("order", "asc"),
      )
      const snapshot = await getDocs(categoriesQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
    } catch (error) {
      logger.error("Error getting root categories", { error })
      throw error
    }
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categoriesQuery = query(collection(db, "categories"), where("slug", "==", slug))
      const snapshot = await getDocs(categoriesQuery)

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Category
    } catch (error) {
      logger.error("Error getting category by slug", { error, slug })
      throw error
    }
  }
}
