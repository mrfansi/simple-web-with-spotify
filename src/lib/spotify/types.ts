// Spotify API response types

export interface SpotifyImage {
  height: number | null
  url: string
  width: number | null
}

export interface SpotifyArtist {
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  name: string
  type: 'artist'
  uri: string
}

export interface SpotifyAlbum {
  album_type: 'album' | 'single' | 'compilation'
  artists: SpotifyArtist[]
  available_markets: string[]
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  total_tracks: number
  type: 'album'
  uri: string
}

export interface SpotifyTrack {
  album: SpotifyAlbum
  artists: SpotifyArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: {
    isrc?: string
  }
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
}

export interface SpotifyPlaylist {
  collaborative: boolean
  description: string | null
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  owner: {
    display_name: string | null
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    type: 'user'
    uri: string
  }
  primary_color: string | null
  public: boolean | null
  snapshot_id: string
  tracks: {
    href: string
    total: number
  }
  type: 'playlist'
  uri: string
}

// Simplified versions for our app
export interface SimpleSpotifyItem {
  id: string
  name: string
  uri: string
  type: 'track' | 'playlist' | 'album'
  image?: string
  artist?: string
  album?: string
  description?: string
}

// Search result types
export interface SpotifySearchResult {
  tracks: SimpleSpotifyItem[]
  playlists: SimpleSpotifyItem[]
  albums: SimpleSpotifyItem[]
}

// Music setting type for our database
export interface MusicSettingData {
  id: number
  type: 'TRACK' | 'PLAYLIST' | 'ALBUM' | null
  uri: string | null
  autoplay: boolean
  loop: boolean
  updatedAt: Date
}
