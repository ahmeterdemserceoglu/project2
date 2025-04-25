import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createNotification } from "@/lib/notifications"
import { logger } from "@/lib/logger"
import type { ReturnRequest } from "@/lib/types"

// İade istekleri işlemlerini güncelleyelim, admin onayı yerine kullanıcılar arası onay olacak

export async function createReturnRequest({
  requestId,
  itemId,
  itemTitle,
  ownerId,
  ownerName,
  requesterId,
  requesterName,
  returnLocation,
  returnDate,
  message,
  conversationId,
}: {
  requestId: string
  itemId: string
  itemTitle: string
  ownerId: string
  ownerName?: string
  requesterId: string
  requesterName: string
  returnLocation: string
  returnDate: Date
  message: string
  conversationId?: string
}) {
  try {
    logger.info("Creating return request", {
      itemId,
      requesterId,
      ownerId,
    })

    const returnRequestData: Omit<ReturnRequest, "id" | "createdAt"> = {
      requestId,
      itemId,
      itemTitle,
      ownerId,
      ownerName,
      requesterId,
      requesterName,
      status: "pending",
      returnLocation,
      returnDate,
      message,
      ownerConfirmed: false,
      requesterConfirmed: true, // İade eden kişi zaten onaylamış sayılır
      adminReviewed: false,
      conversationId,
    }

    const returnRequestRef = await addDoc(collection(db, "returnRequests"), {
      ...returnRequestData,
      createdAt: serverTimestamp(),
    })

    // Eşya sahibine bildirim gönder
    await createNotification({
      userId: ownerId,
      title: "Yeni İade Talebi",
      message: `${requesterName} kullanıcısı "${itemTitle}" eşyanızı iade etmek istiyor.`,
      type: "return",
      link: `/items/${itemId}`,
    })

    logger.info("Return request created successfully", {
      returnRequestId: returnRequestRef.id,
      itemId,
    })

    return { success: true, returnRequestId: returnRequestRef.id }
  } catch (error) {
    logger.error("Error creating return request", { error, itemId, requesterId })
    return { success: false, error }
  }
}

export async function updateReturnRequestStatus({
  returnRequestId,
  status,
  adminReviewed = false,
}: {
  returnRequestId: string
  status: "pending" | "accepted" | "rejected" | "completed"
  adminReviewed?: boolean
}) {
  try {
    logger.info("Updating return request status", {
      returnRequestId,
      status,
      adminReviewed,
    })

    const returnRequestRef = doc(db, "returnRequests", returnRequestId)
    const returnRequestSnap = await getDoc(returnRequestRef)

    if (!returnRequestSnap.exists()) {
      logger.error("Return request not found", { returnRequestId })
      return { success: false, error: "Return request not found" }
    }

    const returnRequest = returnRequestSnap.data() as ReturnRequest

    await updateDoc(returnRequestRef, {
      status,
      adminReviewed,
    })

    // İade tamamlandıysa, eşya durumunu müsait olarak güncelle
    if (status === "completed") {
      const itemRef = doc(db, "items", returnRequest.itemId)
      await updateDoc(itemRef, {
        status: "available",
      })

      logger.info("Item status updated to available after return", {
        itemId: returnRequest.itemId,
      })
    }

    // Durum değişikliğine göre bildirimler oluştur
    if (status === "accepted") {
      // İade eden kişiye bildirim
      await createNotification({
        userId: returnRequest.requesterId,
        title: "İade Talebiniz Onaylandı",
        message: `"${returnRequest.itemTitle}" için iade talebiniz onaylandı.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })

      // Eşya sahibine bildirim
      await createNotification({
        userId: returnRequest.ownerId,
        title: "İade Talebi Onaylandı",
        message: `"${returnRequest.itemTitle}" için iade talebi onaylandı. Lütfen iade işlemini onaylayın.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })
    } else if (status === "rejected") {
      // İade eden kişiye bildirim
      await createNotification({
        userId: returnRequest.requesterId,
        title: "İade Talebiniz Reddedildi",
        message: `"${returnRequest.itemTitle}" için iade talebiniz reddedildi.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })
    } else if (status === "completed") {
      // Her iki tarafa da bildirim
      await createNotification({
        userId: returnRequest.requesterId,
        title: "İade İşlemi Tamamlandı",
        message: `"${returnRequest.itemTitle}" eşyasının iade işlemi tamamlandı.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })

      await createNotification({
        userId: returnRequest.ownerId,
        title: "İade İşlemi Tamamlandı",
        message: `"${returnRequest.itemTitle}" eşyanızın iade işlemi tamamlandı.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })
    }

    logger.info("Return request status updated successfully", {
      returnRequestId,
      status,
    })

    return { success: true }
  } catch (error) {
    logger.error("Error updating return request status", { error, returnRequestId })
    return { success: false, error }
  }
}

export async function confirmReturnDelivery({
  returnRequestId,
  isOwner,
  notes,
}: {
  returnRequestId: string
  isOwner: boolean
  notes?: string
}) {
  try {
    logger.info("Confirming return delivery", {
      returnRequestId,
      isOwner,
    })

    const returnRequestRef = doc(db, "returnRequests", returnRequestId)
    const returnRequestSnap = await getDoc(returnRequestRef)

    if (!returnRequestSnap.exists()) {
      logger.error("Return request not found", { returnRequestId })
      return { success: false, error: "Return request not found" }
    }

    const returnRequest = returnRequestSnap.data() as ReturnRequest
    const updateData: Record<string, any> = {}

    if (isOwner) {
      updateData.ownerConfirmed = true
      updateData.status = "accepted" // Eşya sahibi onayladığında durum "accepted" olur
    } else {
      updateData.requesterConfirmed = true
    }

    // Her iki taraf da onayladıysa, durum "completed" olarak güncellenir
    if ((isOwner && returnRequest.requesterConfirmed) || (!isOwner && returnRequest.ownerConfirmed)) {
      updateData.status = "completed"

      // Eşya durumunu güncelle
      const itemRef = doc(db, "items", returnRequest.itemId)
      await updateDoc(itemRef, {
        status: "available",
      })

      logger.info("Item status updated to available after return confirmation", {
        itemId: returnRequest.itemId,
      })
    }

    if (notes) {
      updateData.notes = notes
    }

    await updateDoc(returnRequestRef, updateData)

    // Bildirimler gönder
    const recipientId = isOwner ? returnRequest.requesterId : returnRequest.ownerId
    const bothConfirmed = (isOwner && returnRequest.requesterConfirmed) || (!isOwner && returnRequest.ownerConfirmed)

    if (!bothConfirmed) {
      await createNotification({
        userId: recipientId,
        title: "İade Onayı Bekleniyor",
        message: `"${returnRequest.itemTitle}" için iade onayınız bekleniyor.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })
    }

    if (bothConfirmed) {
      // Her iki tarafa da bildirim
      await createNotification({
        userId: returnRequest.requesterId,
        title: "İade İşlemi Tamamlandı",
        message: `"${returnRequest.itemTitle}" eşyasının iade işlemi tamamlandı.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })

      await createNotification({
        userId: returnRequest.ownerId,
        title: "İade İşlemi Tamamlandı",
        message: `"${returnRequest.itemTitle}" eşyanızın iade işlemi tamamlandı.`,
        type: "return",
        link: `/items/${returnRequest.itemId}`,
      })
    }

    logger.info("Return delivery confirmation successful", {
      returnRequestId,
      isOwner,
      bothConfirmed,
    })

    return { success: true, completed: bothConfirmed }
  } catch (error) {
    logger.error("Error confirming return delivery", { error, returnRequestId })
    return { success: false, error }
  }
}
