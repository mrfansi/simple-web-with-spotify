'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Play, Pause, Volume2, VolumeX, ExternalLink, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface SpotifyItem {
  id: string
  name: string
  uri: string
  type: 'track' | 'playlist' | 'album'
  image?: string
  artist?: string
  album?: string
  description?: string
}

interface MusicSetting {
  hasMusic: boolean
  type?: string
  uri?: string
  embedUrl?: string | null
  autoplay: boolean
  loop: boolean
  updatedAt: string
}

export default function AdminPage() {
  const searchParams = useSearchParams()
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [currentSetting, setCurrentSetting] = useState<MusicSetting | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'track' | 'playlist' | 'album'>('track')
  const [searchResults, setSearchResults] = useState<SpotifyItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Handle URL parameters (success/error messages from OAuth)
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success) {
      toast.success(success)
      setIsConnected(true)
      // Clear URL parameters
      window.history.replaceState({}, '', '/admin')
    }
    
    if (error) {
      toast.error(error)
      setIsConnected(false)
    }
  }, [searchParams])

  // Check Spotify connection status and load current settings
  useEffect(() => {
    const checkConnectionAndLoadSettings = async () => {
      try {
        const response = await fetch('/api/spotify/playback')
        
        if (response.ok) {
          const data = await response.json()
          setCurrentSetting(data)
          setIsConnected(true)
        } else if (response.status === 401) {
          setIsConnected(false)
        }
      } catch (error) {
        console.error('Failed to check connection:', error)
        setIsConnected(false)
      }
    }

    checkConnectionAndLoadSettings()
  }, [])

  const handleSpotifyConnect = () => {
    window.location.href = '/api/spotify/login'
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}&limit=10`)
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      } else if (response.status === 401) {
        toast.error('Spotify not connected. Please connect first.')
        setIsConnected(false)
      } else {
        toast.error('Search failed')
      }
    } catch (error) {
      toast.error('Search failed')
    }
    setIsSearching(false)
  }

  const handleSelectItem = async (item: SpotifyItem) => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/spotify/update-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: item.uri,
          type: item.type.toUpperCase(),
          autoplay: currentSetting?.autoplay ?? true,
          loop: currentSetting?.loop ?? false,
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSetting(data.data)
        toast.success(`Selected: ${item.name}`)
      } else {
        toast.error('Failed to select item')
      }
    } catch (error) {
      toast.error('Failed to select item')
    }
    setIsUpdating(false)
  }

  const handleSettingChange = async (key: 'autoplay' | 'loop', value: boolean) => {
    if (!currentSetting?.uri) return

    try {
      const response = await fetch('/api/spotify/update-setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uri: currentSetting.uri,
          type: currentSetting.type?.toUpperCase(),
          autoplay: key === 'autoplay' ? value : currentSetting.autoplay,
          loop: key === 'loop' ? value : currentSetting.loop,
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSetting(data.data)
        toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} ${value ? 'enabled' : 'disabled'}`)
      } else {
        toast.error('Failed to update setting')
      }
    } catch (error) {
      toast.error('Failed to update setting')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (isConnected === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Music Settings</h1>
          <p className="text-muted-foreground">Loading Spotify connection status...</p>
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Music Settings</h1>
        <p className="text-muted-foreground">
          Configure your Spotify integration and select music for your website
        </p>
      </div>

      {/* Spotify Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">✅ Connected to Spotify</p>
                <p className="text-sm text-muted-foreground">You can now search and select music</p>
              </div>
              <Button variant="outline" onClick={handleSpotifyConnect}>
                Reconnect
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm font-medium text-red-600">❌ Not connected to Spotify</p>
                <p className="text-sm text-muted-foreground">Connect your Spotify account to get started</p>
              </div>
              <Button onClick={handleSpotifyConnect}>
                Connect to Spotify
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <>
          {/* Current Music & Controls */}
          {currentSetting && (
            <Card>
              <CardHeader>
                <CardTitle>Current Music</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSetting.hasMusic && currentSetting.embedUrl ? (
                  <div className="space-y-4">
                    <iframe
                      src={currentSetting.embedUrl}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-md"
                    />
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="autoplay"
                            checked={currentSetting.autoplay}
                            onCheckedChange={(checked) => handleSettingChange('autoplay', checked)}
                          />
                          <Label htmlFor="autoplay">Autoplay</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="loop"
                            checked={currentSetting.loop}
                            onCheckedChange={(checked) => handleSettingChange('loop', checked)}
                          />
                          <Label htmlFor="loop">Loop</Label>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={currentSetting.uri?.replace('spotify:', 'https://open.spotify.com/').replace(':', '/')}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in Spotify
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No music selected yet. Search and select a track, playlist, or album below.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Search Music</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={searchType} onValueChange={(value) => setSearchType(value as any)}>
                <TabsList>
                  <TabsTrigger value="track">Tracks</TabsTrigger>
                  <TabsTrigger value="playlist">Playlists</TabsTrigger>
                  <TabsTrigger value="album">Albums</TabsTrigger>
                </TabsList>

                <div className="flex space-x-2 mt-4">
                  <Input
                    placeholder={`Search for ${searchType}s...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                <TabsContent value={searchType} className="space-y-4 mt-6">
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{item.name}</h3>
                            {item.artist && (
                              <p className="text-sm text-muted-foreground truncate">
                                {item.artist}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelectItem(item)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Selecting...' : 'Select'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery && !isSearching ? (
                    <Alert>
                      <AlertDescription>
                        No {searchType}s found for "{searchQuery}". Try different search terms.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
