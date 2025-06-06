import { useState, useCallback } from 'react'
import { removeBackground } from '@imgly/background-removal'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [originalFileName, setOriginalFileName] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (!imageFile) {
      setError('Please drop an image file')
      return
    }

    processImage(imageFile)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }, [])

  const processImage = async (file: File) => {
    setError(null)
    setIsProcessing(true)
    
    const originalUrl = URL.createObjectURL(file)
    setOriginalImage(originalUrl)
    setProcessedImage(null)
    setOriginalFileName(file.name)

    try {
      const blob = await removeBackground(file)
      const processedUrl = URL.createObjectURL(blob)
      setProcessedImage(processedUrl)
    } catch (err) {
      setError('Failed to remove background. Please try again.')
      console.error('Background removal error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    
    // Extract filename and extension from original file
    const lastDotIndex = originalFileName.lastIndexOf('.')
    const nameWithoutExt = lastDotIndex > 0 ? originalFileName.substring(0, lastDotIndex) : originalFileName
    const ext = lastDotIndex > 0 ? originalFileName.substring(lastDotIndex) : '.png'
    
    const downloadFileName = `${nameWithoutExt}_bg_removed${ext}`
    
    const link = document.createElement('a')
    link.href = processedImage
    link.download = downloadFileName
    link.click()
  }

  const reset = () => {
    setOriginalImage(null)
    setProcessedImage(null)
    setError(null)
    setOriginalFileName('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>
        
        {/* Header */}
        <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight py-2">
            Background Remover
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Remove backgrounds from your images instantly
          </p>
        </div>

        {!originalImage ? (
          <div className="flex flex-col items-center animate-in fade-in duration-500 delay-200">
            <div
              className={`relative border-2 border-dashed rounded-3xl p-16 w-full max-w-3xl text-center transition-all duration-300 ease-out transform ${
                isDragOver
                  ? 'border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 scale-105 shadow-2xl'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:scale-102 hover:shadow-xl'
              } backdrop-blur-sm bg-white/70 dark:bg-slate-800/70`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-8">
                <div className="text-8xl mb-4 animate-bounce">📸</div>
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto"></div>
              </div>
              <p className="text-2xl mb-6 text-slate-700 dark:text-slate-200 font-medium">
                Drop your image here or click to browse
              </p>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
                Supports JPG, PNG, and other formats
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg font-semibold rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <span className="mr-2 text-xl">📁</span>
                Choose Image
              </label>
            </div>
            {error && (
              <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl max-w-md animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={reset}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <span className="mr-2 text-lg">🔄</span>
                Upload New Image
              </button>
              {processedImage && (
                <button
                  onClick={downloadImage}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 animate-in slide-in-from-right duration-500"
                >
                  <span className="mr-2 text-lg">💾</span>
                  Download Result
                </button>
              )}
            </div>

            {/* Image Comparison */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="space-y-4 animate-in slide-in-from-left duration-500">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📷</span>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Original</h2>
                </div>
                <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 hover:shadow-3xl hover:scale-102">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div className="space-y-4 animate-in slide-in-from-right duration-500 delay-100">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✨</span>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Background Removed</h2>
                </div>
                <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 min-h-[400px] flex items-center justify-center transition-all duration-300 hover:shadow-3xl hover:scale-102">
                  {isProcessing ? (
                    <div className="flex flex-col items-center space-y-6 py-16">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-purple-400"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl text-slate-700 dark:text-slate-200 font-medium mb-2">
                          Processing image...
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">This may take a moment</p>
                      </div>
                    </div>
                  ) : processedImage ? (
                    <img
                      src={processedImage}
                      alt="Background removed"
                      className="w-full h-auto max-h-[500px] object-contain animate-in zoom-in duration-500"
                      style={{
                        background: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
                        backgroundSize: '24px 24px',
                        backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
                      }}
                    />
                  ) : error ? (
                    <div className="text-center py-16">
                      <div className="text-4xl mb-4">😔</div>
                      <p className="text-xl text-red-600 dark:text-red-400 font-medium">Processing Failed</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Please try again</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-16 text-center animate-in fade-in duration-500 delay-300">
          <div className="max-w-2xl mx-auto p-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3">🆓</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">100% Free Service</h3>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              All processing happens <span className="font-semibold text-indigo-600 dark:text-indigo-400">client-side</span> — 
              your images never leave your device.
            </p>
            <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
              <span className="text-xl mr-2">💝</span>
              <span>Built with </span>
              <a 
                href="https://github.com/imgly/background-removal-js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors duration-200 hover:underline"
              >
                imgly/background-removal-js
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
