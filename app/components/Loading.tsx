'use client'

interface LoadingProps {
  message?: string
}

export default function Loading({ message = 'Memuat data...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Badminton Shuttlecock */}
        <div className="relative">
          <div className="w-16 h-16 relative animate-bounce">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg"></div>
            <div className="absolute top-2 left-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
              <span className="text-2xl">🏸</span>
            </div>
          </div>
        </div>
        
        {/* Loading text with gradient */}
        <div className="text-center">
          <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {message}
          </p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
