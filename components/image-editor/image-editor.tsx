'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  RotateCcw,
  Download,
  Undo2,
  Redo2,
  Crop,
  Sparkles,
  Eye,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ImageEditorProps {
  imageUrl: string
  onSave: (blob: Blob) => void
  onClose: () => void
  aspectRatio?: 'square' | 'banner' | 'free'
}

type FilterType = 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'sepia' | 'blur'

interface EditState {
  brightness: number
  contrast: number
  saturation: number
  grayscale: number
  sepia: number
  blur: number
  rotation: number
  cropX: number
  cropY: number
  cropWidth: number
  cropHeight: number
}

const ASPECT_RATIOS = {
  square: { label: '1:1 (Square)', ratio: 1 },
  banner: { label: '3:1 (Banner)', ratio: 3 },
  free: { label: 'Free', ratio: 0 },
}

const DEFAULT_STATE: EditState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  rotation: 0,
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,
}

export function ImageEditor({
  imageUrl,
  onSave,
  onClose,
  aspectRatio = 'free',
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [currentState, setCurrentState] = useState<EditState>(DEFAULT_STATE)
  const [history, setHistory] = useState<EditState[]>([DEFAULT_STATE])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [quality, setQuality] = useState(95)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedAspect, setSelectedAspect] = useState(aspectRatio)

  // Draw the edited image on canvas
  const drawImage = useCallback((state: EditState) => {
    if (!canvasRef.current || !imgRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imgRef.current
    canvas.width = img.width
    canvas.height = img.height

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((state.rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Apply filters
    ctx.filter = `
      brightness(${state.brightness}%)
      contrast(${state.contrast}%)
      saturate(${state.saturation}%)
      grayscale(${state.grayscale}%)
      sepia(${state.sepia}%)
      blur(${state.blur}px)
    `

    ctx.drawImage(img, 0, 0)
    ctx.restore()
  }, [])

  useEffect(() => {
    drawImage(currentState)
  }, [currentState, drawImage])

  const updateState = (newState: Partial<EditState>) => {
    const updated = { ...currentState, ...newState }
    setCurrentState(updated)
    setHistory([...history.slice(0, historyIndex + 1), updated])
    setHistoryIndex(history.length)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCurrentState(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCurrentState(history[historyIndex + 1])
    }
  }

  const reset = () => {
    setCurrentState(DEFAULT_STATE)
    setHistory([DEFAULT_STATE])
    setHistoryIndex(0)
  }

  const rotateImage = (degrees: number) => {
    updateState({
      rotation: (currentState.rotation + degrees) % 360,
    })
  }

  const handleSave = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) onSave(blob)
        },
        'image/jpeg',
        quality / 100
      )
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          {/* Canvas Preview */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-md max-h-96 object-contain bg-muted"
            />
          </div>

          {/* Hidden image element for reference */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Edit"
            className="hidden"
            crossOrigin="anonymous"
          />

          {/* Editor Tabs */}
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="crop">Crop</TabsTrigger>
              <TabsTrigger value="rotate">Rotate</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
            </TabsList>

            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Brightness: {currentState.brightness}%</label>
                  <Slider
                    value={[currentState.brightness]}
                    onValueChange={([value]) => updateState({ brightness: value })}
                    min={0}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Contrast: {currentState.contrast}%</label>
                  <Slider
                    value={[currentState.contrast]}
                    onValueChange={([value]) => updateState({ contrast: value })}
                    min={0}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Saturation: {currentState.saturation}%</label>
                  <Slider
                    value={[currentState.saturation]}
                    onValueChange={([value]) => updateState({ saturation: value })}
                    min={0}
                    max={200}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Grayscale: {currentState.grayscale}%</label>
                  <Slider
                    value={[currentState.grayscale]}
                    onValueChange={([value]) => updateState({ grayscale: value })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Sepia: {currentState.sepia}%</label>
                  <Slider
                    value={[currentState.sepia]}
                    onValueChange={([value]) => updateState({ sepia: value })}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Blur: {currentState.blur}px</label>
                  <Slider
                    value={[currentState.blur]}
                    onValueChange={([value]) => updateState({ blur: value })}
                    min={0}
                    max={20}
                    step={0.5}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Crop Tab */}
            <TabsContent value="crop" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                <Select value={selectedAspect} onValueChange={(val) => {
                  if (val === 'square' || val === 'banner' || val === 'free') {
                    setSelectedAspect(val)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Crop X: {currentState.cropX}%</label>
                <Slider
                  value={[currentState.cropX]}
                  onValueChange={([value]) => updateState({ cropX: value })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Crop Y: {currentState.cropY}%</label>
                <Slider
                  value={[currentState.cropY]}
                  onValueChange={([value]) => updateState({ cropY: value })}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            {/* Rotate Tab */}
            <TabsContent value="rotate" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => rotateImage(-90)}>
                  Rotate -90°
                </Button>
                <Button variant="outline" onClick={() => rotateImage(90)}>
                  Rotate +90°
                </Button>
                <Button variant="outline" onClick={() => rotateImage(180)}>
                  Rotate 180°
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium">Manual Rotation: {currentState.rotation}°</label>
                <Slider
                  value={[currentState.rotation]}
                  onValueChange={([value]) => updateState({ rotation: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            {/* Quality Tab */}
            <TabsContent value="quality" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Image Quality: {quality}%</label>
                <Slider
                  value={[quality]}
                  onValueChange={([value]) => setQuality(value)}
                  min={10}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Current Settings:</p>
                <ul className="list-disc list-inside">
                  <li>Quality: {quality}%</li>
                  <li>Estimated Size: ~{Math.round((quality / 100) * 500)}KB</li>
                  <li>Format: JPEG</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={historyIndex === 0}
              title="Undo"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              title="Redo"
            >
              <Redo2 className="h-4 w-4 mr-1" />
              Redo
            </Button>

            <Button variant="ghost" size="sm" onClick={reset} title="Reset all changes">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>

            <div className="flex-1" />

            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleSave} className="gap-2">
              <Download className="h-4 w-4" />
              Save & Upload
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
