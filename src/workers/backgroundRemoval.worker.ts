import { AutoModel, AutoProcessor, RawImage, env } from '@huggingface/transformers'

// Configure environment
env.allowLocalModels = false

// Types
interface ProcessMessage {
  type: 'process'
  imageData: ArrayBuffer
  width: number
  height: number
}

interface ProgressEvent {
  status: 'initiate' | 'progress' | 'done' | 'ready'
  name?: string
  file?: string
  progress?: number
  loaded?: number
  total?: number
}

type WorkerMessage = ProcessMessage

// Singleton for model and processor
class BackgroundRemovalPipeline {
  static model: Promise<Awaited<ReturnType<typeof AutoModel.from_pretrained>>> | null = null
  static processor: Promise<Awaited<ReturnType<typeof AutoProcessor.from_pretrained>>> | null = null

  static async getDevice(): Promise<'webgpu' | 'wasm'> {
    if ('gpu' in navigator) {
      try {
        const adapter = await (navigator as Navigator & { gpu: GPU }).gpu.requestAdapter()
        if (adapter) {
          return 'webgpu'
        }
      } catch (e) {
        console.warn('WebGPU not available, falling back to WASM', e)
      }
    }
    return 'wasm'
  }

  static async getInstance(progressCallback?: (progress: ProgressEvent) => void) {
    const device = await this.getDevice()
    console.log(`Using device: ${device}`)

    if (!this.model) {
      this.model = AutoModel.from_pretrained('briaai/RMBG-1.4', {
        device,
        dtype: 'fp32',
        progress_callback: progressCallback,
      })
    }

    if (!this.processor) {
      this.processor = AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        progress_callback: progressCallback,
      })
    }

    return {
      model: await this.model,
      processor: await this.processor,
    }
  }
}

self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data

  if (type === 'process') {
    try {
      // Get model and processor (will load on first call)
      const { model, processor } = await BackgroundRemovalPipeline.getInstance((progress) => {
        self.postMessage({ type: 'progress', ...progress })
      })

      self.postMessage({ type: 'model_ready' })

      // Get image data from message
      const { imageData, width, height } = event.data
      const uint8Array = new Uint8ClampedArray(imageData)

      // Create RawImage from RGBA pixel data
      const image = new RawImage(uint8Array, width, height, 4)

      // Process image through model
      const { pixel_values } = await processor(image)
      const { output } = await model({ input: pixel_values })

      // Get mask data - output is a tensor with shape [1, 1, H, W]
      const maskData = output.data as Float32Array
      const maskHeight = output.dims[2]
      const maskWidth = output.dims[3]

      // Create a canvas to resize the mask to original dimensions
      const maskCanvas = new OffscreenCanvas(maskWidth, maskHeight)
      const maskCtx = maskCanvas.getContext('2d')!

      // Convert mask to ImageData
      const maskImageData = maskCtx.createImageData(maskWidth, maskHeight)
      for (let i = 0; i < maskData.length; i++) {
        const value = Math.round(maskData[i] * 255)
        maskImageData.data[i * 4] = value // R
        maskImageData.data[i * 4 + 1] = value // G
        maskImageData.data[i * 4 + 2] = value // B
        maskImageData.data[i * 4 + 3] = 255 // A
      }
      maskCtx.putImageData(maskImageData, 0, 0)

      // Resize mask to original dimensions
      const resizedCanvas = new OffscreenCanvas(width, height)
      const resizedCtx = resizedCanvas.getContext('2d')!
      resizedCtx.drawImage(maskCanvas, 0, 0, width, height)
      const resizedMaskData = resizedCtx.getImageData(0, 0, width, height)

      // Apply mask as alpha channel to original image
      const outputData = new Uint8ClampedArray(width * height * 4)
      for (let i = 0; i < width * height; i++) {
        outputData[i * 4] = uint8Array[i * 4] // R
        outputData[i * 4 + 1] = uint8Array[i * 4 + 1] // G
        outputData[i * 4 + 2] = uint8Array[i * 4 + 2] // B
        outputData[i * 4 + 3] = resizedMaskData.data[i * 4] // A from mask (using R channel)
      }

      // Send back the processed image data
      self.postMessage(
        {
          type: 'complete',
          imageData: outputData.buffer,
          width,
          height,
        },
        { transfer: [outputData.buffer] }
      )
    } catch (error) {
      console.error('Worker error:', error)
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
})

export {}
