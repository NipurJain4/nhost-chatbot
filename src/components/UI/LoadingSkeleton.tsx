import React from 'react'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-white/10 rounded'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-lg'
      case 'text':
      default:
        return 'rounded'
    }
  }

  const getSize = () => {
    const style: React.CSSProperties = {}
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (height) style.height = typeof height === 'number' ? `${height}px` : height
    return style
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${getVariantClasses()} h-4`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
              ...getSize()
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${className}`}
      style={getSize()}
    />
  )
}

// Chat List Skeleton
export const ChatListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg">
          <LoadingSkeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <LoadingSkeleton width="60%" height={16} className="mb-2" />
            <LoadingSkeleton width="80%" height={12} />
          </div>
          <LoadingSkeleton width={40} height={12} />
        </div>
      ))}
    </div>
  )
}

// Message Skeleton
export const MessageSkeleton: React.FC<{ isAi?: boolean }> = ({ isAi = false }) => {
  return (
    <div className={`flex items-end space-x-3 ${!isAi ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <LoadingSkeleton variant="circular" width={32} height={32} />
      <div className="flex flex-col max-w-xs sm:max-w-sm md:max-w-md">
        <div className={`p-4 rounded-2xl ${isAi ? 'rounded-bl-md' : 'rounded-br-md'} bg-white/10`}>
          <LoadingSkeleton lines={2} />
        </div>
        <LoadingSkeleton width={60} height={12} className="mt-1" />
      </div>
    </div>
  )
}
