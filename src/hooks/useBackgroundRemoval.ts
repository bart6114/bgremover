import { useRef, useCallback, useState } from 'react'

export interface ProgressInfo {
  status: 'idle' | 'loading_model' | 'processing' | 'complete' | 'error'
  modelProgress?: number
  message?: string
}

interface UseBackgroundRemovalReturn {
  removeBackground: (file: File) => Promise<Blob>
  progress: ProgressInfo
  isModelLoaded: boolean
}

export function useBackgroundRemoval(): UseBackgroundRemovalReturn {
  const workerRef = useRef<Worker | null>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [progress, setProgress] = useState<ProgressInfo>({ status: 'idle' })

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/backgroundRemoval.worker.ts', import.meta.url),
        { type: 'module' }
      )
    }
    return workerRef.current
  }, [])

  const removeBackground = useCallback(
    async (file: File): Promise<Blob> => {
      const worker = getWorker()

      return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(objectUrl)

          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, img.width, img.height)

          const handleMessage = (event: MessageEvent) => {
            const { type } = event.data

            switch (type) {
              case 'progress': {
                const { status, progress: pct, file: fileName } = event.data
                if (status === 'progress' && pct !== undefined) {
                  setProgress({
                    status: 'loading_model',
                    modelProgress: Math.round(pct),
                    message: `Downloading model... ${Math.round(pct)}%`,
                  })
                } else if (status === 'initiate') {
                  setProgress({
                    status: 'loading_model',
                    message: `Loading ${fileName || 'model'}...`,
                  })
                }
                break
              }
              case 'model_ready':
                setIsModelLoaded(true)
                setProgress({
                  status: 'processing',
                  message: 'Processing image...',
                })
                break
              case 'complete': {
                worker.removeEventListener('message', handleMessage)
                const { imageData: resultData, width, height } = event.data

                const resultCanvas = document.createElement('canvas')
                resultCanvas.width = width
                resultCanvas.height = height
                const resultCtx = resultCanvas.getContext('2d')!
                const resultImageData = new ImageData(
                  new Uint8ClampedArray(resultData),
                  width,
                  height
                )
                resultCtx.putImageData(resultImageData, 0, 0)

                resultCanvas.toBlob(
                  (blob) => {
                    if (blob) {
                      setProgress({ status: 'complete' })
                      resolve(blob)
                    } else {
                      reject(new Error('Failed to create blob'))
                    }
                  },
                  'image/png'
                )
                break
              }
              case 'error':
                worker.removeEventListener('message', handleMessage)
                setProgress({
                  status: 'error',
                  message: event.data.error,
                })
                reject(new Error(event.data.error))
                break
            }
          }

          worker.addEventListener('message', handleMessage)

          const buffer = imageData.data.buffer.slice(0)
          worker.postMessage(
            {
              type: 'process',
              imageData: buffer,
              width: img.width,
              height: img.height,
            },
            { transfer: [buffer] }
          )

          setProgress({
            status: isModelLoaded ? 'processing' : 'loading_model',
            message: isModelLoaded ? 'Processing image...' : 'Loading AI model...',
          })
        }

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('Failed to load image'))
        }

        img.src = objectUrl
      })
    },
    [getWorker, isModelLoaded]
  )

  return { removeBackground, progress, isModelLoaded }
}
