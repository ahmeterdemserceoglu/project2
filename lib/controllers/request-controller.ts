import type { Request } from "../types"
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
import { ItemController } from "./item-controller"

export class RequestController {
  // Create a new request
  static async createRequest(request: Omit<Request, "id">): Promise<string> {
    try {
      // Check if the item is available
      const item = await ItemController.getItemById(request.itemId)

      if (!item) {
        throw new Error("Item not found")
      }

      if (item.status !== "available") {
        throw new Error("Item is not available")
      }

      // Create the request
      const docRef = await addDoc(collection(db, "requests"), {
        ...request,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      // Notify the owner
      await NotificationController.createNotification({
        userId: request.ownerId,
        title: "Yeni Eşya İsteği",
        message: `${request.requesterName} kullanıcısı "${request.itemTitle}" eşyanızı ödünç almak istiyor.`,
        type: "request",
        read: false,
        link: `/requests/${docRef.id}`,
      })

      logger.info("Request created successfully", { requestId: docRef.id })
      return docRef.id
    } catch (error) {
      logger.error("Error creating request", { error })
      throw error
    }
  }

  // Get a request by ID
  static async getRequestById(id: string): Promise<Request | null> {
    try {
      const docRef = doc(db, "requests", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Request
      }

      return null
    } catch (error) {
      logger.error("Error getting request by ID", { error, requestId: id })
      throw error
    }
  }

  // Update a request
  static async updateRequest(id: string, data: Partial<Request>): Promise<void> {
    try {
      const requestRef = doc(db, "requests", id)
      await updateDoc(requestRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      logger.info("Request updated successfully", { requestId: id })
    } catch (error) {
      logger.error("Error updating request", { error, requestId: id })
      throw error
    }
  }

  // Get requests by requester ID
  static async getRequestsByRequesterId(requesterId: string): Promise<Request[]> {
    try {
      const requestsQuery = query(
        collection(db, "requests"),
        where("requesterId", "==", requesterId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(requestsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Request)
    } catch (error) {
      logger.error("Error getting requests by requester ID", { error, requesterId })
      throw error
    }
  }

  // Get requests by owner ID
  static async getRequestsByOwnerId(ownerId: string): Promise<Request[]> {
    try {
      const requestsQuery = query(
        collection(db, "requests"),
        where("ownerId", "==", ownerId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(requestsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Request)
    } catch (error) {
      logger.error("Error getting requests by owner ID", { error, ownerId })
      throw error
    }
  }

  // Get requests by item ID
  static async getRequestsByItemId(itemId: string): Promise<Request[]> {
    try {
      const requestsQuery = query(
        collection(db, "requests"),
        where("itemId", "==", itemId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(requestsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Request)
    } catch (error) {
      logger.error("Error getting requests by item ID", { error, itemId })
      throw error
    }
  }

  // Get requests by status
  static async getRequestsByStatus(status: string): Promise<Request[]> {
    try {
      const requestsQuery = query(
        collection(db, "requests"),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(requestsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Request)
    } catch (error) {
      logger.error("Error getting requests by status", { error, status })
      throw error
    }
  }

  // Approve a request
  static async approveRequest(id: string): Promise<void> {
    try {
      const request = await this.getRequestById(id)

      if (!request) {
        throw new Error("Request not found")
      }

      if (request.status !== "pending") {
        throw new Error("Request is not pending")
      }

      // Update request status
      await this.updateRequest(id, { status: "approved" })

      // Update item status
      await ItemController.updateItem(request.itemId, { status: "borrowed" })

      // Notify the requester
      await NotificationController.createNotification({
        userId: request.requesterId,
        title: "İsteğiniz Onaylandı",
        message: `"${request.itemTitle}" için isteğiniz onaylandı.`,
        type: "request",
        read: false,
        link: `/requests/${id}`,
      })

      logger.info("Request approved successfully", { requestId: id })
    } catch (error) {
      logger.error("Error approving request", { error, requestId: id })
      throw error
    }
  }

  // Reject a request
  static async rejectRequest(id: string): Promise<void> {
    try {
      const request = await this.getRequestById(id)

      if (!request) {
        throw new Error("Request not found")
      }

      if (request.status !== "pending") {
        throw new Error("Request is not pending")
      }

      // Update request status
      await this.updateRequest(id, { status: "rejected" })

      // Notify the requester
      await NotificationController.createNotification({
        userId: request.requesterId,
        title: "İsteğiniz Reddedildi",
        message: `"${request.itemTitle}" için isteğiniz reddedildi.`,
        type: "request",
        read: false,
        link: `/requests/${id}`,
      })

      logger.info("Request rejected successfully", { requestId: id })
    } catch (error) {
      logger.error("Error rejecting request", { error, requestId: id })
      throw error
    }
  }

  // Complete a request
  static async completeRequest(id: string): Promise<void> {
    try {
      const request = await this.getRequestById(id)

      if (!request) {
        throw new Error("Request not found")
      }

      if (request.status !== "approved") {
        throw new Error("Request is not approved")
      }

      // Update request status
      await this.updateRequest(id, { status: "completed" })

      // Update item status
      await ItemController.updateItem(request.itemId, { status: "available" })

      // Notify both parties
      await NotificationController.createNotification({
        userId: request.requesterId,
        title: "İşlem Tamamlandı",
        message: `"${request.itemTitle}" için işlem tamamlandı.`,
        type: "request",
        read: false,
        link: `/requests/${id}`,
      })

      await NotificationController.createNotification({
        userId: request.ownerId,
        title: "İşlem Tamamlandı",
        message: `"${request.itemTitle}" için işlem tamamlandı.`,
        type: "request",
        read: false,
        link: `/requests/${id}`,
      })

      logger.info("Request completed successfully", { requestId: id })
    } catch (error) {
      logger.error("Error completing request", { error, requestId: id })
      throw error
    }
  }

  // Cancel a request
  static async cancelRequest(id: string): Promise<void> {
    try {
      const request = await this.getRequestById(id)

      if (!request) {
        throw new Error("Request not found")
      }

      if (request.status !== "pending") {
        throw new Error("Only pending requests can be canceled")
      }

      // Update request status
      await this.updateRequest(id, { status: "canceled" })

      // Notify the owner
      await NotificationController.createNotification({
        userId: request.ownerId,
        title: "İstek İptal Edildi",
        message: `"${request.itemTitle}" için istek iptal edildi.`,
        type: "request",
        read: false,
        link: `/requests/${id}`,
      })

      logger.info("Request canceled successfully", { requestId: id })
    } catch (error) {
      logger.error("Error canceling request", { error, requestId: id })
      throw error
    }
  }

  // Get requests by conversation ID
  static async getRequestsByConversationId(conversationId: string): Promise<Request[]> {
    try {
      const requestsQuery = query(collection(db, "requests"), where("conversationId", "==", conversationId))

      const snapshot = await getDocs(requestsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Request)
    } catch (error) {
      logger.error("Error getting requests by conversation ID", { error, conversationId })
      throw error
    }
  }
}
