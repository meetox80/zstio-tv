'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HasPermission as CheckPermission, TogglePermission as ToggleUserPermission } from '@/lib/permissions'
import { useToast } from '@/app/context/ToastContext'
import { useSession } from 'next-auth/react'
import { Permission } from '@/types/permissions'

type User = {
  id: string
  name: string
  permissions: number
  createdAt: string
}

const UsersTab: FC = () => {
  const [Users, SetUsers] = useState<User[]>([])
  const [IsLoading, SetIsLoading] = useState(true)
  const [ErrorMessage, SetErrorMessage] = useState<string | null>(null)
  const [NewUserName, SetNewUserName] = useState('')
  const [NewUserPassword, SetNewUserPassword] = useState('')
  const [EditingUser, SetEditingUser] = useState<User | null>(null)
  const [IsAddingUser, SetIsAddingUser] = useState(false)
  const [SearchQuery, SetSearchQuery] = useState('')
  const [PasswordChangeMode, SetPasswordChangeMode] = useState(false)
  const [NewPassword, SetNewPassword] = useState('')
  const [ConfirmPassword, SetConfirmPassword] = useState('')
  const [PasswordError, SetPasswordError] = useState<string | null>(null)
  const { ShowToast } = useToast()
  const { data: _SessionFromHook, update: UpdateSession, status: _SessionStatus } = useSession()
  
  const _PermissionNames = {
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

  const _UserPermissions = _SessionFromHook?.user?.permissions || 0
  const _HasUsersViewPermission = CheckPermission(_UserPermissions, Permission.USERS_VIEW)

  useEffect(() => {
    if (_SessionStatus === 'loading') {
      SetIsLoading(true)
      return
    }

    if (_HasUsersViewPermission) {
      FetchUsers()
    } else {
      SetIsLoading(false)
      SetErrorMessage('Nie masz uprawnień do przeglądania użytkowników lub sesja jest nieaktywna.')
    }
  }, [_HasUsersViewPermission, _SessionStatus])

  const FetchUsers = async () => {
    SetIsLoading(true)
    SetErrorMessage(null)
    
    try {
      const Response = await fetch('/api/users')
      
      if (!Response.ok) {
        const ErrorData = await Response.json().catch(() => ({}))
        SetErrorMessage(ErrorData.error || `Error: ${Response.status}`)
        SetUsers([])
        return
      }
      
      const Data = await Response.json()
      
      if (Array.isArray(Data)) {
        SetUsers(Data)
      } else {
        console.error('Unexpected data format:', Data)
        SetUsers([])
        SetErrorMessage('Received invalid data format')
      }
    } catch (Error) {
      console.error('Failed to fetch users:', Error)
      SetUsers([])
      SetErrorMessage('Failed to load users')
    } finally {
      SetIsLoading(false)
    }
  }

  const AddUser = async () => {
    if (!NewUserName.trim()) return
    if (!NewUserPassword.trim()) {
      ShowToast('Hasło jest wymagane', 'error')
      return
    }

    try {
      const Response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: NewUserName,
          password: NewUserPassword
        })
      })

      if (Response.ok) {
        SetNewUserName('')
        SetNewUserPassword('')
        SetIsAddingUser(false)
        FetchUsers()
        ShowToast('Użytkownik został dodany', 'success')
      } else {
        const ErrorData = await Response.json().catch(() => ({}))
        ShowToast(ErrorData.error || 'Nie udało się dodać użytkownika', 'error')
      }
    } catch (Error) {
      console.error('Failed to add user:', Error)
      ShowToast('Nie udało się dodać użytkownika', 'error')
    }
  }

  const UpdateUser = async (UserId: string, Updates: Partial<User>) => {
    try {
      const Response = await fetch(`/api/users/${UserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Updates)
      })

      if (Response.ok) {
        FetchUsers()
        const UpdatedUserDetails = await Response.json()

        if (Updates.permissions !== undefined) {
          SetEditingUser(UpdatedUserDetails)
          
          if (_SessionFromHook?.user?.id === UserId) {
            await UpdateSession()
            ShowToast(
              `Twoje uprawnienia zostały zaktualizowane. Zmiany są aktywne.`,
              'success',
              7000
            )
          } else {
            ShowToast(
              `Uprawnienia dla użytkownika ${UpdatedUserDetails.name} zostały zaktualizowane. Użytkownik ${UpdatedUserDetails.name} może potrzebować się wylogować i zalogować ponownie, aby zmiany w pełni zaczęły obowiązywać.`,
              'info',
              10000
            )
          }
        } else {
          SetEditingUser(null)
          ShowToast('Dane użytkownika zostały zaktualizowane.', 'success')
        }
      } else {
        const ErrorData = await Response.json().catch(() => ({}))
        ShowToast(ErrorData.error || 'Nie udało się zaktualizować użytkownika', 'error')
      }
    } catch (Error) {
      console.error('Failed to update user:', Error)
      ShowToast('Nie udało się zaktualizować użytkownika', 'error')
    }
  }

  const ChangePassword = async (UserId: string) => {
    if (NewPassword !== ConfirmPassword) {
      SetPasswordError('Hasła nie są identyczne')
      return
    }
    
    if (NewPassword.length < 6) {
      SetPasswordError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    try {
      const Response = await fetch(`/api/users/${UserId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: NewPassword })
      })

      if (Response.ok) {
        SetNewPassword('')
        SetConfirmPassword('')
        SetPasswordError(null)
        SetPasswordChangeMode(false)
        ShowToast('Hasło zostało zmienione', 'success')
      } else {
        const ErrorData = await Response.json().catch(() => ({}))
        SetPasswordError(ErrorData.error || 'Nie udało się zmienić hasła')
      }
    } catch (Error) {
      console.error('Failed to change password:', Error)
      SetPasswordError('Nie udało się zmienić hasła')
    }
  }

  const DeleteUser = async (UserId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return

    try {
      const Response = await fetch(`/api/users/${UserId}`, {
        method: 'DELETE'
      })

      if (Response.ok) {
        FetchUsers()
        ShowToast('Użytkownik został usunięty', 'success')
      } else {
        const ErrorData = await Response.json().catch(() => ({}))
        ShowToast(ErrorData.error || 'Nie udało się usunąć użytkownika', 'error')
      }
    } catch (Error) {
      console.error('Failed to delete user:', Error)
      ShowToast('Nie udało się usunąć użytkownika', 'error')
    }
  }

  const IsAdminUser = (User: User): boolean => {
    return User.name === 'admin'
  }

  const HasPermission = (UserPermissions: number, Permission: number): boolean => {
    return CheckPermission(UserPermissions, Permission)
  }

  const TogglePermission = (CurrentPermissions: number, Permission: number): number => {
    return HasPermission(CurrentPermissions, Permission)
      ? (CurrentPermissions & ~Permission) // Remove permission
      : (CurrentPermissions | Permission)  // Add permission
  }

  const SetAdminPermissions = () => {
    if (EditingUser) {
      UpdateUser(EditingUser.id, { permissions: Permission.ADMINISTRATOR })
    }
  }

  const ClearAllPermissions = () => {
    if (EditingUser) {
      UpdateUser(EditingUser.id, { permissions: 0 })
    }
  }

  const FilteredUsers = Users.filter(User => 
    User.name.toLowerCase().includes(SearchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Zarządzanie użytkownikami</h1>
          <p className="text-rose-100/70">Dodawaj i zarządzaj użytkownikami oraz ich uprawnieniami</p>
        </div>
        {_HasUsersViewPermission && CheckPermission(_UserPermissions, Permission.USERS_MANAGE) && (
          <button
            onClick={() => SetIsAddingUser(true)}
            className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium flex items-center shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 active:scale-95 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>
            Dodaj użytkownika
          </button>
        )}
      </div>

      {_HasUsersViewPermission && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Szukaj użytkownika..."
              value={SearchQuery}
              onChange={(e) => SetSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>
      )}

      {ErrorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/50 text-center">
          <p className="text-red-300">{ErrorMessage}</p>
          {_HasUsersViewPermission && (
            <button 
              onClick={FetchUsers}
              className="mt-3 px-4 py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white text-sm font-medium active:scale-95 transition-all duration-300"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Spróbuj ponownie
            </button>
          )}
        </div>
      )}

      {IsLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      )}

      {IsAddingUser && _HasUsersViewPermission && CheckPermission(_UserPermissions, Permission.USERS_MANAGE) && (
        <div className="mb-6 p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-rose-500/20 to-black/40 border border-rose-500/30 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Dodaj nowego użytkownika</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nazwa użytkownika"
              value={NewUserName}
              onChange={(e) => SetNewUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
            />
            <input
              type="password"
              placeholder="Hasło"
              value={NewUserPassword}
              onChange={(e) => SetNewUserPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
            />
            <div className="flex gap-2">
              <button
                onClick={AddUser}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 active:scale-95 transition-all duration-300"
              >
                Dodaj
              </button>
              <button
                onClick={() => {
                  SetIsAddingUser(false)
                  SetNewUserName('')
                  SetNewUserPassword('')
                }}
                className="px-5 py-2.5 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 text-white font-medium active:scale-95 transition-all duration-300"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {!IsLoading && _HasUsersViewPermission && FilteredUsers.length > 0 ? (
          FilteredUsers.map(User => (
            <div
              key={User.id}
              className={`p-6 rounded-xl backdrop-blur-xl ${
                IsAdminUser(User) 
                  ? 'bg-gradient-to-br from-rose-600/20 to-black/40 border border-rose-500/50' 
                  : 'bg-gradient-to-br from-rose-500/10 to-black/40 border border-rose-500/30'
              } shadow-lg`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex items-center">
                  {IsAdminUser(User) && (
                    <div className="mr-3 px-2 py-1 rounded-md bg-rose-500/20 border border-rose-500/50 text-xs font-semibold text-rose-300">
                      ADMIN
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white">{User.name}</h3>
                </div>
                {!IsAdminUser(User) && CheckPermission(_UserPermissions, Permission.USERS_MANAGE) && (
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <button
                      onClick={() => {
                        SetEditingUser(EditingUser?.id === User.id ? null : User)
                        SetPasswordChangeMode(false)
                        SetNewPassword('')
                        SetConfirmPassword('')
                        SetPasswordError(null)
                      }}
                      className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      {EditingUser?.id === User.id ? 'Anuluj' : 'Edytuj'}
                    </button>
                    <button
                      onClick={() => DeleteUser(User.id)}
                      className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                    >
                      <i className="fas fa-trash-alt mr-2"></i>
                      Usuń
                    </button>
                  </div>
                )}
              </div>

              {EditingUser?.id === User.id && CheckPermission(_UserPermissions, Permission.USERS_MANAGE) ? (
                <div className="mt-6">
                  {!PasswordChangeMode ? (
                    <div className="mb-6">
                      <button
                        onClick={() => SetPasswordChangeMode(true)}
                        className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                      >
                        <i className="fas fa-key mr-2"></i>
                        Zmień hasło
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <h4 className="text-lg font-semibold text-white mb-3">Zmiana hasła</h4>
                      <div className="flex flex-col gap-3">
                        <input
                          type="password"
                          placeholder="Nowe hasło"
                          value={NewPassword}
                          onChange={(e) => SetNewPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-amber-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300"
                        />
                        <input
                          type="password"
                          placeholder="Potwierdź hasło"
                          value={ConfirmPassword}
                          onChange={(e) => SetConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-amber-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300"
                        />
                        {PasswordError && (
                          <div className="text-red-400 text-sm">{PasswordError}</div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => ChangePassword(User.id)}
                            className="px-4 py-2 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                          >
                            Zapisz hasło
                          </button>
                          <button
                            onClick={() => {
                              SetPasswordChangeMode(false)
                              SetNewPassword('')
                              SetConfirmPassword('')
                              SetPasswordError(null)
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                          >
                            Anuluj
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <h4 className="text-lg font-semibold text-white mb-2 md:mb-0">Uprawnienia użytkownika</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={SetAdminPermissions}
                        className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                      >
                        Wszystkie uprawnienia
                      </button>
                      <button
                        onClick={ClearAllPermissions}
                        className="px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-white text-sm font-medium active:scale-95 transition-all duration-300"
                      >
                        Wyczyść wszystkie
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(_PermissionNames).map(([PermissionValue, PermissionName]) => {
                      const PermissionInt = parseInt(PermissionValue)
                      if (isNaN(PermissionInt)) return null
                      
                      return (
                        <div 
                          key={PermissionValue}
                          onClick={() => {
                            if (PermissionInt === Permission.ADMINISTRATOR) return
                            UpdateUser(User.id, { 
                              permissions: TogglePermission(EditingUser.permissions, PermissionInt) 
                            })
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                            HasPermission(EditingUser.permissions, PermissionInt)
                              ? 'bg-rose-500/30 hover:bg-rose-500/40 border border-rose-500/50'
                              : 'bg-white/5 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                              HasPermission(EditingUser.permissions, PermissionInt)
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/10'
                            }`}>
                              {HasPermission(EditingUser.permissions, PermissionInt) && (
                                <i className="fas fa-check text-xs"></i>
                              )}
                            </div>
                            <span className="text-sm text-white">{PermissionName}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(_PermissionNames).map(([PermissionValue, PermissionName]) => {
                      const PermissionInt = parseInt(PermissionValue)
                      if (isNaN(PermissionInt)) return null
                      
                      if (HasPermission(User.permissions, PermissionInt)) {
                        const IsDeactivated = PermissionInt === Permission.CLASS_TIMES_VIEW && 
                                           !HasPermission(User.permissions, Permission.CLASS_TIMES_EDIT)
                        
                        return (
                          <div key={PermissionValue} className={`px-3 py-1.5 rounded-md bg-rose-500/20 border border-rose-500/30 ${
                            IsDeactivated ? 'opacity-50' : ''
                          }`}>
                            <span className="text-sm text-white">{PermissionName}</span>
                          </div>
                        )
                      }
                      
                      return null
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : !IsLoading && _HasUsersViewPermission && (
          <div className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-center">
            <p className="text-gray-400">
              {SearchQuery ? 'Nie znaleziono użytkowników pasujących do wyszukiwania' : 'Brak użytkowników'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default UsersTab 