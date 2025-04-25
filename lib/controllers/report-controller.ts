import type { Report } from "../types"
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

export class ReportController {
  // Create a new report
  static async createReport(report: Omit<Report, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "reports"), {
        ...report,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      // Notify admin (you might want to implement a different notification system for admins)
      // For now, we'll just log it
      logger.info("New report created", { reportId: docRef.id, report })

      return docRef.id
    } catch (error) {
      logger.error("Error creating report", { error })
      throw error
    }
  }

  // Get a report by ID
  static async getReportById(id: string): Promise<Report | null> {
    try {
      const docRef = doc(db, "reports", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Report
      }

      return null
    } catch (error) {
      logger.error("Error getting report by ID", { error, reportId: id })
      throw error
    }
  }

  // Update a report
  static async updateReport(id: string, data: Partial<Report>): Promise<void> {
    try {
      const reportRef = doc(db, "reports", id)
      await updateDoc(reportRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })

      logger.info("Report updated successfully", { reportId: id })
    } catch (error) {
      logger.error("Error updating report", { error, reportId: id })
      throw error
    }
  }

  // Get reports by reporter ID
  static async getReportsByReporterId(reporterId: string): Promise<Report[]> {
    try {
      const reportsQuery = query(
        collection(db, "reports"),
        where("reporterId", "==", reporterId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(reportsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report)
    } catch (error) {
      logger.error("Error getting reports by reporter ID", { error, reporterId })
      throw error
    }
  }

  // Get reports by reported user ID
  static async getReportsByReportedUserId(reportedUserId: string): Promise<Report[]> {
    try {
      const reportsQuery = query(
        collection(db, "reports"),
        where("reportedUserId", "==", reportedUserId),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(reportsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report)
    } catch (error) {
      logger.error("Error getting reports by reported user ID", { error, reportedUserId })
      throw error
    }
  }

  // Get reports by item ID
  static async getReportsByItemId(itemId: string): Promise<Report[]> {
    try {
      const reportsQuery = query(collection(db, "reports"), where("itemId", "==", itemId), orderBy("createdAt", "desc"))

      const snapshot = await getDocs(reportsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report)
    } catch (error) {
      logger.error("Error getting reports by item ID", { error, itemId })
      throw error
    }
  }

  // Get reports by status
  static async getReportsByStatus(status: string): Promise<Report[]> {
    try {
      const reportsQuery = query(collection(db, "reports"), where("status", "==", status), orderBy("createdAt", "desc"))

      const snapshot = await getDocs(reportsQuery)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Report)
    } catch (error) {
      logger.error("Error getting reports by status", { error, status })
      throw error
    }
  }

  // Resolve a report
  static async resolveReport(id: string, resolution: string): Promise<void> {
    try {
      const report = await this.getReportById(id)

      if (!report) {
        throw new Error("Report not found")
      }

      // Update report status and resolution
      await this.updateReport(id, { status: "resolved", resolution })

      // Notify the reporter
      await NotificationController.createNotification({
        userId: report.reporterId,
        title: "Raporunuz Çözüldü",
        message: `"${report.reason}" konulu raporunuz çözüldü.`,
        type: "system",
        read: false,
        link: `/reports/${id}`,
      })

      logger.info("Report resolved successfully", { reportId: id })
    } catch (error) {
      logger.error("Error resolving report", { error, reportId: id })
      throw error
    }
  }

  // Dismiss a report
  static async dismissReport(id: string, reason: string): Promise<void> {
    try {
      const report = await this.getReportById(id)

      if (!report) {
        throw new Error("Report not found")
      }

      // Update report status and dismissal reason
      await this.updateReport(id, { status: "dismissed", dismissalReason: reason })

      // Notify the reporter
      await NotificationController.createNotification({
        userId: report.reporterId,
        title: "Raporunuz Reddedildi",
        message: `"${report.reason}" konulu raporunuz reddedildi.`,
        type: "system",
        read: false,
        link: `/reports/${id}`,
      })

      logger.info("Report dismissed successfully", { reportId: id })
    } catch (error) {
      logger.error("Error dismissing report", { error, reportId: id })
      throw error
    }
  }
}
