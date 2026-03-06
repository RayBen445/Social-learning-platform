'use client'

import React, { useCallback, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DragDropUploadProps {
  onImageSelected: (file: File) => void
  onDrop?: (files: FileList) => void
  maxSize?: number
  accept?: string
}

export function DragDropUpload({
  onImageSelected,
  onDrop,
  maxSize = 5242880, // 5MB
  accept = 'image/jpeg,image/png,image/webp',
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File) => {
    if (!accept.includes(file.type)) {
      setError('Invalid file type. Please use JPG, PNG, or WebP.')
      return false
    }
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB.`)
      return false
    }
    setError(null)
    return true
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onImageSelected(file)
        onDrop?.(files)
      }
    }
  }, [onImageSelected, onDrop])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        onImageSelected(file)
      }
    }
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all ${
          isDragging
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-muted-foreground/50 bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-1">Drag and drop your image here</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse (JPG, PNG, WebP – max 5 MB)
          </p>

          <label className="cursor-pointer">
            <Button type="button" variant="default" className="gap-2">
              <Upload className="h-4 w-4" />
              Choose Image
            </Button>
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={handleFileInput}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-md p-3 mt-2 flex items-start gap-2">
          <X className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </Card>
  )
}
