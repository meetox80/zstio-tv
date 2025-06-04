"use client";

import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HasPermission as CheckPermission } from "@/lib/permissions";
import { useToast } from "@/app/context/ToastContext";
import { useSession } from "next-auth/react";
import { Permission } from "@/types/permissions";

type User = {
  id: string;
  name: string;
  permissions: number;
  createdAt: string;
};

const accordionVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.25, ease: "easeInOut" },
    },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.3, ease: "easeIn" },
      opacity: { duration: 0.2, ease: "easeIn" },
    },
  },
};

const permissionsSectionVariants = {
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.3, ease: "easeOut", delay: 0.05 },
      opacity: { duration: 0.25, ease: "easeInOut", delay: 0.1 },
    },
  },
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.3, ease: "easeIn" },
      opacity: { duration: 0.2, ease: "easeIn" },
    },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const modalContentVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const UsersTab: FC = () => {
  const [Users, SetUsers] = useState<User[]>([]);
  const [IsLoading, SetIsLoading] = useState(true);
  const [ErrorMessage, SetErrorMessage] = useState<string | null>(null);
  const [NewUserName, SetNewUserName] = useState("");
  const [NewUserPassword, SetNewUserPassword] = useState("");
  const [EditingUser, SetEditingUser] = useState<User | null>(null);
  const [IsAddingUser, SetIsAddingUser] = useState(false);
  const [SearchQuery, SetSearchQuery] = useState("");

  // States for the password change modal
  const [IsPasswordModalOpen, SetIsPasswordModalOpen] = useState(false);
  const [UserForPasswordChangeId, SetUserForPasswordChangeId] = useState<
    string | null
  >(null);
  const [NewPasswordModal, SetNewPasswordModal] = useState("");
  const [ConfirmPasswordModal, SetConfirmPasswordModal] = useState("");
  const [PasswordErrorModal, SetPasswordErrorModal] = useState<string | null>(
    null,
  );

  const { ShowToast } = useToast();
  const {
    data: _SessionFromHook,
    update: UpdateSession,
    status: _SessionStatus,
  } = useSession();

  const _PermissionNames = {
    [Permission.DASHBOARD_ACCESS]: "Dostęp do strony głównej",
    [Permission.SLIDES_VIEW]: "Podgląd slajdów",
    [Permission.SLIDES_EDIT]: "Edycja slajdów",
    [Permission.SONG_REQUESTS_VIEW]: "Podgląd propozycji muzyki",
    [Permission.SONG_REQUESTS_MANAGE]: "Zarządzanie propozycjami muzyki",
    [Permission.CLASS_TIMES_VIEW]: "Podgląd czasów lekcyjnych",
    [Permission.CLASS_TIMES_EDIT]: "Edycja czasów lekcyjnych",
    [Permission.SPOTIFY_AUTH]: "Autoryzacja Spotify",
    [Permission.USERS_VIEW]: "Podgląd użytkowników",
    [Permission.USERS_MANAGE]: "Zarządzanie użytkownikami",
    [Permission.ADMINISTRATOR]: "Administrator (wszystkie uprawnienia)",
  };

  const _UserPermissions = _SessionFromHook?.user?.permissions || 0;
  const _HasUsersViewPermission = CheckPermission(
    _UserPermissions,
    Permission.USERS_VIEW,
  );
  const _CurrentUserId = _SessionFromHook?.user?.id || "";
  const _IsCurrentUserAdmin = CheckPermission(
    _UserPermissions,
    Permission.ADMINISTRATOR,
  );

  useEffect(() => {
    if (_SessionStatus === "loading") {
      SetIsLoading(true);
      return;
    }
    if (_HasUsersViewPermission) {
      FetchUsers();
    } else {
      SetIsLoading(false);
      SetErrorMessage(
        "Nie masz uprawnień do przeglądania użytkowników lub sesja jest nieaktywna.",
      );
    }
  }, [_HasUsersViewPermission, _SessionStatus]);

  const FetchUsers = async () => {
    SetIsLoading(true);
    SetErrorMessage(null);
    try {
      const Response = await fetch("/api/users");
      if (!Response.ok) {
        const ErrorData = await Response.json().catch(() => ({}));
        SetErrorMessage(ErrorData.error || `Error: ${Response.status}`);
        SetUsers([]);
        return;
      }
      const Data = await Response.json();
      if (Array.isArray(Data)) {
        SetUsers(Data);
      } else {
        SetUsers([]);
        SetErrorMessage("Received invalid data format");
      }
    } catch (Error) {
      SetUsers([]);
      SetErrorMessage("Failed to load users");
    } finally {
      SetIsLoading(false);
    }
  };

  const AddUser = async () => {
    if (!NewUserName.trim()) return;
    if (!NewUserPassword.trim()) {
      ShowToast("Hasło jest wymagane", "error");
      return;
    }
    try {
      const Response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: NewUserName, password: NewUserPassword }),
      });
      if (Response.ok) {
        SetNewUserName("");
        SetNewUserPassword("");
        SetIsAddingUser(false);
        FetchUsers();
        ShowToast("Użytkownik został dodany", "success");
      } else {
        const ErrorData = await Response.json().catch(() => ({}));
        ShowToast(
          ErrorData.error || "Nie udało się dodać użytkownika",
          "error",
        );
      }
    } catch (Error) {
      ShowToast("Nie udało się dodać użytkownika", "error");
    }
  };

  const UpdateUser = async (UserId: string, Updates: Partial<User>) => {
    try {
      const Response = await fetch(`/api/users/${UserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Updates),
      });
      if (Response.ok) {
        const UpdatedUserDetails = await Response.json();
        SetUsers((PrevUsers) =>
          PrevUsers.map((U) => (U.id === UserId ? UpdatedUserDetails : U)),
        );

        if (EditingUser?.id === UserId && Updates.permissions !== undefined) {
          SetEditingUser(UpdatedUserDetails);
        }

        if (Updates.permissions !== undefined) {
          if (_CurrentUserId === UserId) {
            await UpdateSession();
            ShowToast(
              `Twoje uprawnienia zostały zaktualizowane. Zmiany są aktywne.`,
              "success",
              7000,
            );
          } else {
            ShowToast(
              `Uprawnienia dla użytkownika ${UpdatedUserDetails.name} zostały zaktualizowane.`,
              "success",
              7000,
            );
          }
        } else {
          ShowToast("Dane użytkownika zostały zaktualizowane.", "success");
        }
      } else {
        const ErrorData = await Response.json().catch(() => ({}));
        ShowToast(
          ErrorData.error || "Nie udało się zaktualizować użytkownika",
          "error",
        );
      }
    } catch (Error) {
      ShowToast("Nie udało się zaktualizować użytkownika", "error");
    }
  };

  const HandleChangePassword = async () => {
    if (!UserForPasswordChangeId) return;

    if (NewPasswordModal !== ConfirmPasswordModal) {
      SetPasswordErrorModal("Hasła nie są identyczne");
      return;
    }
    if (NewPasswordModal.length < 6) {
      SetPasswordErrorModal("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    try {
      const Response = await fetch(
        `/api/users/${UserForPasswordChangeId}/password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: NewPasswordModal }),
        },
      );

      if (Response.ok) {
        SetNewPasswordModal("");
        SetConfirmPasswordModal("");
        SetPasswordErrorModal(null);
        SetIsPasswordModalOpen(false);
        SetUserForPasswordChangeId(null);
        ShowToast("Hasło zostało zmienione", "success");
      } else {
        const ErrorData = await Response.json().catch(() => ({}));
        SetPasswordErrorModal(ErrorData.error || "Nie udało się zmienić hasła");
      }
    } catch (Error) {
      SetPasswordErrorModal("Nie udało się zmienić hasła");
    }
  };

  const DeleteUser = async (UserId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
    try {
      const Response = await fetch(`/api/users/${UserId}`, {
        method: "DELETE",
      });
      if (Response.ok) {
        FetchUsers(); // Refreshes the list
        if (EditingUser?.id === UserId) SetEditingUser(null); // Close accordion if deleted user was open
        ShowToast("Użytkownik został usunięty", "success");
      } else {
        const ErrorData = await Response.json().catch(() => ({}));
        ShowToast(
          ErrorData.error || "Nie udało się usunąć użytkownika",
          "error",
        );
      }
    } catch (Error) {
      ShowToast("Nie udało się usunąć użytkownika", "error");
    }
  };

  const IsUserAdmin = (UserToCheck: User): boolean => {
    return CheckPermission(UserToCheck.permissions, Permission.ADMINISTRATOR);
  };

  const CurrentUserHasPermissionDisplay = (
    UserPermissions: number,
    RequiredPermission: number,
  ): boolean => {
    return CheckPermission(UserPermissions, RequiredPermission);
  };

  const ToggleUserPermission = (
    CurrentPermissions: number,
    PermissionToToggle: number,
  ): number => {
    return CurrentUserHasPermissionDisplay(
      CurrentPermissions,
      PermissionToToggle,
    )
      ? CurrentPermissions & ~PermissionToToggle
      : CurrentPermissions | PermissionToToggle;
  };

  const SetAdminPermissions = () => {
    if (EditingUser) {
      UpdateUser(EditingUser.id, { permissions: Permission.ADMINISTRATOR });
    }
  };

  const ClearAllPermissions = () => {
    if (EditingUser) {
      UpdateUser(EditingUser.id, { permissions: 0 });
    }
  };

  const CanChangeUserPassword = (UserIdToChange: string): boolean => {
    return _IsCurrentUserAdmin || UserIdToChange === _CurrentUserId;
  };

  const FilteredUsers = Users.filter((User) =>
    User.name.toLowerCase().includes(SearchQuery.toLowerCase()),
  );

  const HandleAccordionToggle = (UserToToggle: User) => {
    // Don't allow toggling admin users
    if (IsUserAdmin(UserToToggle)) return;

    if (EditingUser?.id === UserToToggle.id) {
      SetEditingUser(null); // Collapse if already open
    } else {
      SetEditingUser(UserToToggle); // Open new one
    }
  };

  const UserForModalName =
    Users.find((u) => u.id === UserForPasswordChangeId)?.name || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Zarządzanie użytkownikami
          </h1>
          <p className="text-rose-100/70">
            Dodawaj i zarządzaj użytkownikami oraz ich uprawnieniami
          </p>
        </div>
        {CheckPermission(_UserPermissions, Permission.USERS_MANAGE) && (
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

      {IsAddingUser &&
        CheckPermission(_UserPermissions, Permission.USERS_MANAGE) && (
          <div className="mb-6 p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-rose-500/20 to-black/40 border border-rose-500/30 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">
              Dodaj nowego użytkownika
            </h2>
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
                    SetIsAddingUser(false);
                    SetNewUserName("");
                    SetNewUserPassword("");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 text-white font-medium active:scale-95 transition-all duration-300"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 gap-4">
        {!IsLoading && _HasUsersViewPermission && FilteredUsers.length > 0 ? (
          FilteredUsers.map((UserFromList) => (
            <div
              key={UserFromList.id}
              className={`rounded-xl backdrop-blur-xl shadow-lg transition-all duration-300 ease-in-out ${
                IsUserAdmin(UserFromList)
                  ? "bg-gradient-to-br from-rose-600/20 to-black/40 border border-rose-500/50"
                  : "bg-gradient-to-br from-rose-500/10 to-black/40 border border-rose-500/30"
              } ${EditingUser?.id === UserFromList.id ? "border-rose-400" : ""}`}
            >
              {/* Accordion Header */}
              <div
                className={`p-4 flex justify-between items-center ${!IsUserAdmin(UserFromList) ? "cursor-pointer hover:bg-white/5" : ""} transition-colors duration-200 rounded-t-xl`}
                onClick={() => HandleAccordionToggle(UserFromList)}
              >
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {UserFromList.name}
                  </h3>
                  {IsUserAdmin(UserFromList) && (
                    <div className="ml-3 px-2 py-1 rounded-md bg-rose-500/20 border border-rose-500/50 text-xs font-semibold text-rose-300">
                      ADMIN
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {CanChangeUserPassword(UserFromList.id) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        SetUserForPasswordChangeId(UserFromList.id);
                        SetIsPasswordModalOpen(true);
                        SetNewPasswordModal("");
                        SetConfirmPasswordModal("");
                        SetPasswordErrorModal(null);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 active:scale-90 transition-all duration-200"
                      aria-label="Zmień hasło"
                    >
                      <i className="fas fa-key text-sm"></i>
                    </button>
                  )}
                  {!IsUserAdmin(UserFromList) &&
                    (_IsCurrentUserAdmin ||
                      CheckPermission(
                        _UserPermissions,
                        Permission.USERS_MANAGE,
                      )) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          DeleteUser(UserFromList.id);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white/90 active:scale-90 transition-all duration-200"
                        aria-label="Usuń użytkownika"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    )}
                  {!IsUserAdmin(UserFromList) && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center ml-1 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all duration-200">
                      <i
                        className={`fas ${EditingUser?.id === UserFromList.id ? "fa-chevron-up" : "fa-chevron-down"} transition-transform duration-300`}
                      ></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence initial={false}>
                {EditingUser?.id === UserFromList.id && (
                  <motion.div
                    key={`content-${UserFromList.id}`}
                    variants={accordionVariants}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 pt-1 border-t border-white/10">
                      {/* Permissions Section */}
                      {!IsUserAdmin(EditingUser) &&
                        (_IsCurrentUserAdmin ||
                          CheckPermission(
                            _UserPermissions,
                            Permission.USERS_MANAGE,
                          )) && (
                          <motion.div
                            key={`permissions-wrapper-${EditingUser.id}`}
                            variants={permissionsSectionVariants}
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 mt-3">
                              <h4 className="text-md font-semibold text-white mb-2 md:mb-0">
                                Uprawnienia użytkownika
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={SetAdminPermissions}
                                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-white text-xs font-medium active:scale-95 transition-all duration-300"
                                >
                                  Wszystkie
                                </button>
                                <button
                                  onClick={ClearAllPermissions}
                                  className="px-3 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-white text-xs font-medium active:scale-95 transition-all duration-300"
                                >
                                  Wyczyść
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {Object.entries(_PermissionNames).map(
                                ([PermissionValue, PermissionName]) => {
                                  const PermissionInt =
                                    parseInt(PermissionValue);
                                  if (
                                    isNaN(PermissionInt) ||
                                    PermissionInt === Permission.ADMINISTRATOR
                                  )
                                    return null;
                                  return (
                                    <div
                                      key={PermissionValue}
                                      onClick={() => {
                                        UpdateUser(EditingUser.id, {
                                          permissions: ToggleUserPermission(
                                            EditingUser.permissions,
                                            PermissionInt,
                                          ),
                                        });
                                      }}
                                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        CurrentUserHasPermissionDisplay(
                                          EditingUser.permissions,
                                          PermissionInt,
                                        )
                                          ? "bg-rose-500/30 hover:bg-rose-500/40 border border-rose-500/50"
                                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <div
                                          className={`w-4 h-4 rounded-sm flex items-center justify-center mr-2 transition-all duration-200 ${
                                            CurrentUserHasPermissionDisplay(
                                              EditingUser.permissions,
                                              PermissionInt,
                                            )
                                              ? "bg-rose-500 text-white"
                                              : "bg-white/10"
                                          }`}
                                        >
                                          {CurrentUserHasPermissionDisplay(
                                            EditingUser.permissions,
                                            PermissionInt,
                                          ) && (
                                            <i className="fas fa-check text-xs"></i>
                                          )}
                                        </div>
                                        <span className="text-xs text-white">
                                          {PermissionName}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </motion.div>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : !IsLoading && _HasUsersViewPermission ? (
          <div className="p-6 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-center">
            <p className="text-gray-400">
              {SearchQuery
                ? "Nie znaleziono użytkowników pasujących do wyszukiwania"
                : "Brak użytkowników"}
            </p>
          </div>
        ) : null}
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {IsPasswordModalOpen && UserForPasswordChangeId && (
          <motion.div
            key="password-modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => SetIsPasswordModalOpen(false)}
          >
            <motion.div
              key="password-modal-content"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full max-w-md p-6 rounded-xl shadow-2xl bg-gradient-to-br from-rose-950/90 via-rose-900/30 to-black border border-rose-500/40"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className="bg-rose-500/20 p-3 rounded-lg mr-3">
                  <i className="fas fa-key text-rose-300 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Zmień hasło</h2>
                  <p className="text-sm text-rose-200/70">
                    Dla użytkownika:{" "}
                    <span className="font-semibold">{UserForModalName}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <input
                  type="password"
                  placeholder="Nowe hasło (min. 6 znaków)"
                  value={NewPasswordModal}
                  onChange={(e) => SetNewPasswordModal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
                />
                <input
                  type="password"
                  placeholder="Potwierdź nowe hasło"
                  value={ConfirmPasswordModal}
                  onChange={(e) => SetConfirmPasswordModal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
                />
              </div>

              {PasswordErrorModal && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-300 text-sm">
                  {PasswordErrorModal}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={HandleChangePassword}
                  className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 active:scale-95 transition-all duration-300"
                >
                  Zapisz hasło
                </button>
                <button
                  onClick={() => {
                    SetIsPasswordModalOpen(false);
                    SetUserForPasswordChangeId(null);
                    SetNewPasswordModal("");
                    SetConfirmPasswordModal("");
                    SetPasswordErrorModal(null);
                  }}
                  className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-gray-700/50 hover:bg-gray-700/70 text-white font-medium active:scale-95 transition-all duration-300"
                >
                  Anuluj
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UsersTab;
