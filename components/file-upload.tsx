"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  onFileUpload: (fileUrl: string, fileName: string, fileType: string) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Dosya çok büyük",
        description: "Maksimum dosya boyutu 10MB olmalıdır.",
      })
      return
    }

    setSelectedFile(file)
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setProgress(0)

    const fileId = uuidv4()
    const fileExtension = file.name.split(".").pop()
    const fileName = `${fileId}.${fileExtension}`
    const storageRef = ref(storage, `chat_files/${fileName}`)

    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setProgress(progress)
      },
      (error) => {
        console.error("Error uploading file:", error)
        toast({
          variant: "destructive",
          title: "Yükleme hatası",
          description: "Dosya yüklenirken bir hata oluştu.",
        })
        setUploading(false)
        setSelectedFile(null)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        onFileUpload(downloadURL, file.name, file.type)
        setUploading(false)
        setSelectedFile(null)
        setProgress(0)
      },
    )
  }

  const cancelUpload = () => {
    setSelectedFile(null)
    setUploading(false)
    setProgress(0)
  }

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        <Paperclip className="h-5 w-5 text-muted-foreground" />
      </Button>

      {uploading && selectedFile && (
        <div className="absolute bottom-12 left-0 bg-background border rounded-md p-3 shadow-md w-64 z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium truncate max-w-[180px]">{selectedFile.name}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={cancelUpload}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% yüklendi</p>
        </div>
      )}
    </div>
  )
}
