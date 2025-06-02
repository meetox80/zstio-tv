import { Permission } from '@/types/permissions'

export const HasPermission = (UserPermissions: number, Permission: number): boolean => {
  // Admin has all permissions
  if (UserPermissions === 0x7FFFFFFF) return true
  
  return (UserPermissions & Permission) === Permission
}

export const TogglePermission = (CurrentPermissions: number, Permission: number): number => {
  return CurrentPermissions ^ Permission
}

export const AddPermission = (CurrentPermissions: number, Permission: number): number => {
  return CurrentPermissions | Permission
}

export const RemovePermission = (CurrentPermissions: number, Permission: number): number => {
  return CurrentPermissions & ~Permission
}

export const GetPermissionName = (PermissionValue: number): string => {
  const _PermissionNames: Record<number, string> = {
    [Permission.DASHBOARD_ACCESS]: 'Dostęp do strony głównej',
    [Permission.SLIDES_VIEW]: 'Podgląd slajdów',
    [Permission.SLIDES_EDIT]: 'Edycja slajdów',
    [Permission.SONG_REQUESTS_VIEW]: 'Podgląd propozycji muzyki',
    [Permission.SONG_REQUESTS_MANAGE]: 'Zarządzanie propozycjami muzyki',
    [Permission.CLASS_TIMES_VIEW]: 'Podgląd czasów lekcyjnych',
    [Permission.CLASS_TIMES_EDIT]: 'Edycja czasów lekcyjnych',
    [Permission.SPOTIFY_AUTH]: 'Autoryzacja Spotify',
    [Permission.USERS_VIEW]: 'Podgląd użytkowników',
    [Permission.USERS_MANAGE]: 'Zarządzanie użytkownikami',
    [Permission.ADMINISTRATOR]: 'Administrator (wszystkie uprawnienia)'
  }
  
  return _PermissionNames[PermissionValue] || 'Nieznane uprawnienie'
}

export const GetPermissionValue = (PermissionName: string): number | null => {
  const _PermissionValues: Record<string, number> = {
    'Dostęp do strony głównej': Permission.DASHBOARD_ACCESS,
    'Podgląd slajdów': Permission.SLIDES_VIEW,
    'Edycja slajdów': Permission.SLIDES_EDIT,
    'Podgląd propozycji muzyki': Permission.SONG_REQUESTS_VIEW,
    'Zarządzanie propozycjami muzyki': Permission.SONG_REQUESTS_MANAGE,
    'Podgląd czasów lekcyjnych': Permission.CLASS_TIMES_VIEW,
    'Edycja czasów lekcyjnych': Permission.CLASS_TIMES_EDIT,
    'Autoryzacja Spotify': Permission.SPOTIFY_AUTH,
    'Podgląd użytkowników': Permission.USERS_VIEW,
    'Zarządzanie użytkownikami': Permission.USERS_MANAGE,
    'Administrator (wszystkie uprawnienia)': Permission.ADMINISTRATOR
  }
  
  return _PermissionValues[PermissionName] || null
}