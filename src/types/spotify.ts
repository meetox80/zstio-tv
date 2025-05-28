export type TrackData = {
  IsPlaying: boolean
  Title?: string
  Artist?: string
  AlbumArt?: string
  AlbumName?: string
  Duration?: number
  Progress?: number
  IsAuthenticated?: boolean
} | null 

export type SpotifyTrack = {
  Id: string
  Title: string
  Artist: string
  Album: string
  AlbumArt: string
  Duration: number
  Uri: string
}

export type SearchResult = {
  tracks: SpotifyTrack[]
  isAuthenticated?: boolean
  error?: string
} 