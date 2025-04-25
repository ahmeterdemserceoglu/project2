import { CategoryController } from "../controllers/category-controller"
import type { Category } from "../types"
import { logger } from "../logger"
import { generateSlug } from "../utils/slug-generator"

export class CategoryService {
  // Get category tree (hierarchical structure)
  static async getCategoryTree(): Promise<Category[]> {
    try {
      // Get all categories
      const allCategories = await CategoryController.getAllCategories()

      // Create a map for quick lookup
      const categoryMap = new Map<string, Category & { children: Category[] }>()

      // Initialize each category with an empty children array
      allCategories.forEach((category) => {
        categoryMap.set(category.id, { ...category, children: [] })
      })

      // Build the tree
      const rootCategories: Category[] = []

      allCategories.forEach((category) => {
        if (category.parentId) {
          // This is a child category
          const parent = categoryMap.get(category.parentId)
          if (parent) {
            parent.children.push(categoryMap.get(category.id)!)
          } else {
            // Parent not found, treat as root
            rootCategories.push(categoryMap.get(category.id)!)
          }
        } else {
          // This is a root category
          rootCategories.push(categoryMap.get(category.id)!)
        }
      })

      return rootCategories
    } catch (error) {
      logger.error("Error getting category tree", { error })
      throw error
    }
  }

  // Get category path (breadcrumb)
  static async getCategoryPath(categoryId: string): Promise<Category[]> {
    try {
      const path: Category[] = []
      let currentCategoryId = categoryId

      while (currentCategoryId) {
        const category = await CategoryController.getCategoryById(currentCategoryId)
        if (!category) break

        path.unshift(category) // Add to the beginning of the array
        currentCategoryId = category.parentId || ""
      }

      return path
    } catch (error) {
      logger.error("Error getting category path", { error, categoryId })
      throw error
    }
  }

  // Get popular categories (most used)
  static async getPopularCategories(limit = 5): Promise<Category[]> {
    try {
      // This is a simplified implementation
      // In a real app, you might want to track category usage and sort by that
      const allCategories = await CategoryController.getAllCategories()
      return allCategories.slice(0, limit)
    } catch (error) {
      logger.error("Error getting popular categories", { error })
      throw error
    }
  }

  // Search categories
  static async searchCategories(query: string): Promise<Category[]> {
    try {
      const allCategories = await CategoryController.getAllCategories()
      const lowerQuery = query.toLowerCase()

      return allCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(lowerQuery) || category.description?.toLowerCase().includes(lowerQuery),
      )
    } catch (error) {
      logger.error("Error searching categories", { error, query })
      throw error
    }
  }
  // Initialize default categories if they don't exist
  static async initializeDefaultCategories(): Promise<void> {
    try {
      const existingCategories = await CategoryController.getAllCategories()

      if (existingCategories.length === 0) {
        const defaultCategories = [
          {
            name: "Aletler",
            slug: "aletler",
            description: "Matkap, tornavida, testere ve diğer aletler",
            icon: "tool",
            order: 1,
          },
          {
            name: "Ev Eşyaları",
            slug: "ev-esyalari",
            description: "Ütü, elektrikli süpürge, mikser ve diğer ev eşyaları",
            icon: "home",
            order: 2,
          },
          {
            name: "Kitaplar",
            slug: "kitaplar",
            description: "Roman, bilim, tarih ve diğer kitaplar",
            icon: "book-open",
            order: 3,
          },
          {
            name: "Elektronik",
            slug: "elektronik",
            description: "Kamera, projektör, oyun konsolları ve diğer elektronik cihazlar",
            icon: "cpu",
            order: 4,
          },
          {
            name: "Spor Ekipmanları",
            slug: "spor-ekipmanlari",
            description: "Bisiklet, kamp malzemeleri, spor aletleri ve diğer ekipmanlar",
            icon: "dumbbell",
            order: 5,
          },
          {
            name: "Bahçe Aletleri",
            slug: "bahce-aletleri",
            description: "Çim biçme makinesi, budama makası, bahçe hortumu ve diğer bahçe aletleri",
            icon: "scissors",
            order: 6,
          },
          {
            name: "Müzik Aletleri",
            slug: "muzik-aletleri",
            description: "Gitar, piyano, davul ve diğer müzik aletleri",
            icon: "music",
            order: 7,
          },
          {
            name: "Diğer",
            slug: "diger",
            description: "Diğer kategorilere uymayan eşyalar",
            icon: "search",
            order: 8,
          },
        ]

        for (const category of defaultCategories) {
          await CategoryController.createCategory(category)
        }

        logger.info("Default categories initialized successfully")
      }
    } catch (error) {
      logger.error("Error initializing default categories", { error })
      throw error
    }
  }

  // Create a new category with automatic slug generation
  static async createCategory(name: string, description: string, icon: string): Promise<string> {
    try {
      const slug = generateSlug(name)

      // Get the highest order value
      const categories = await CategoryController.getAllCategories()
      const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.order), 0)

      return await CategoryController.createCategory({
        name,
        slug,
        description,
        icon,
        order: maxOrder + 1,
      })
    } catch (error) {
      logger.error("Error creating category with auto slug", { error })
      throw error
    }
  }
}
