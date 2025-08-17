'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, X, Music, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useRealtimeMusicSetting } from '@/lib/realtime/use-socket'

interface FloatingPlayerProps {
  className?: string
}

export default function FloatingPlayer({ className = '' }: FloatingPlayerProps) {
  const { isConnected, musicSetting, hasMusic, isLoading } = useRealtimeMusicSetting()
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Show player only when there's music configured
  useEffect(() => {
    setIsVisible(hasMusic && !isLoading)
  }, [hasMusic, isLoading])

  // Don't render if no music is configured or still loading
  if (!isVisible || !musicSetting?.embedUrl) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out
        ${isMinimized ? 'w-16 h-16' : 'w-80 h-auto'}
        ${className}
      `}
    >
      <Card className="shadow-lg border-2 backdrop-blur-sm bg-background/95">
        <CardContent className="p-0">
          {isMinimized ? (
            // Minimized view - just an icon
            <div className="w-16 h-16 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMinimize}
                className="w-full h-full rounded-lg"
              >
                <Music className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            // Full view - embedded player
            <div className="space-y-2">
              {/* Header with controls */}
              <div className="flex items-center justify-between p-3 pb-0">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Now Playing</span>
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleMute}
                    className="h-8 w-8 p-0"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleMinimize}
                    className="h-8 w-8 p-0"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Spotify embed */}
              <div className="px-3 pb-3">
                <div className="relative overflow-hidden rounded-md">
                  <iframe
                    src={`${musicSetting.embedUrl}&utm_source=generator&theme=0${musicSetting.autoplay ? '&autoplay=1' : ''}`}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className={`transition-opacity duration-300 ${isMuted ? 'opacity-30' : 'opacity-100'}`}
                    style={{ 
                      pointerEvents: isMuted ? 'none' : 'auto',
                    }}
                  />
                  {isMuted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                      <VolumeX className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info */}
              <div className="px-3 pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {musicSetting.autoplay && (
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                        Auto
                      </span>
                    )}
                    {musicSetting.loop && (
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                        Loop
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{musicSetting.type?.charAt(0).toUpperCase()}{musicSetting.type?.slice(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Loading placeholder component
export function FloatingPlayerSkeleton() {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-auto">
      <Card className="shadow-lg border-2 backdrop-blur-sm bg-background/95">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted rounded animate-pulse" />
              <div className="w-20 h-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="w-full h-32 bg-muted rounded animate-pulse" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <div className="w-8 h-5 bg-muted rounded-full animate-pulse" />
              <div className="w-8 h-5 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="w-12 h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
