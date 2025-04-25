"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, X } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, fileName: string) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Geçersiz dosya",
        description: "Lütfen bir resim dosyası seçin.",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Resim çok büyük",
        description: "Maksimum resim boyutu 5MB olmalıdır.",
      })
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    setProgress(0)

    const fileId = uuidv4()
    const fileExtension = file.name.split(".").pop()
    const fileName = `${fileId}.${fileExtension}`
    const storageRef = ref(storage, `chat_images/${fileName}`)

    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(progress)
      },
      (error) => {
        console.error("Error uploading image:", error)
        toast({
          variant: "destructive",
          title: "Yükleme hatası",
          description: "Resim yüklenirken bir hata oluştu.",
        })
        setUploading(false)
        setSelectedImage(null)
        setPreviewUrl(null)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        onImageUpload(downloadURL, file.name)
        setUploading(false)
        setSelectedImage(null)
        setPreviewUrl(null)
        setProgress(0)
      },
    )
  }

  const cancelUpload = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setUploading(false)
    setProgress(0)
  }

  return (
    <div className="relative">
      <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 transform -translate-y-1/2"
        onClick={() => imageInputRef.current?.click()}
        disabled={uploading}
      >
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      </Button>

      {uploading && selectedImage && previewUrl && (
        <div className="absolute bottom-12 right-0 bg-background border rounded-md p-3 shadow-md w-64 z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium truncate max-w-[180px]">{selectedImage.name}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={cancelUpload}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative h-32 w-full mb-2 bg-muted rounded-md overflow-hidden">
            <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% yüklendi</p>
        </div>
      )}
    </div>
  )
}
