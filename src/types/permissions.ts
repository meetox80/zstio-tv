export enum Permission {
  DASHBOARD_ACCESS = 1 << 0, // 1
  SLIDES_VIEW = 1 << 1, // 2
  SLIDES_EDIT = 1 << 2, // 4
  SONG_REQUESTS_VIEW = 1 << 3, // 8
  SONG_REQUESTS_MANAGE = 1 << 4, // 16
  CLASS_TIMES_VIEW = 1 << 5, // 32
  CLASS_TIMES_EDIT = 1 << 6, // 64
  SPOTIFY_AUTH = 1 << 7, // 128 (New)
  USERS_VIEW = 1 << 8, // 256 (Shifted)
  USERS_MANAGE = 1 << 9, // 512 (Shifted)
  ADMINISTRATOR = 0x7fffffff, // All permissions
}
