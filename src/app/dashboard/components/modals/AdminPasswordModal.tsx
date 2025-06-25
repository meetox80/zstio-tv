import { FC, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AdminPasswordModalProps = {
  IsOpen: boolean;
  OnClose: () => void;
  Username: string;
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

const AdminPasswordModal: FC<AdminPasswordModalProps> = ({
  IsOpen,
  OnClose,
  Username,
}) => {
  const [_NewPassword, setNewPassword] = useState("");
  const [_ConfirmPassword, setConfirmPassword] = useState("");
  const [_IsLoading, setIsLoading] = useState(false);
  const [_Error, setError] = useState("");
  const [_Success, setSuccess] = useState(false);
  
  const _ModalRef = useRef<HTMLDivElement>(null);
  const _CloseButtonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (IsOpen) {
      setTimeout(() => _CloseButtonRef.current?.focus(), 0);
    }
  }, [IsOpen]);

  const HandleSubmit = async () => {
    if (_NewPassword.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      return;
    }
    
    if (_NewPassword !== _ConfirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const _UserId = await getUserId(Username);
      
      if (!_UserId) {
        setError("Nie można znaleźć identyfikatora użytkownika");
        setIsLoading(false);
        return;
      }
      
      const _Response = await fetch(`/api/users/${_UserId}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          password: _NewPassword 
        }),
      });
      
      if (_Response.ok) {
        setSuccess(true);
        setTimeout(() => OnClose(), 2000);
      } else {
        const _ErrorData = await _Response.json();
        setError(_ErrorData.error || "Wystąpił błąd");
      }
    } catch (_Error) {
      setError("Wystąpił błąd podczas zmiany hasła");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUserId = async (username: string): Promise<string | null> => {
    try {
      const _Response = await fetch('/api/users');
      if (_Response.ok) {
        const _Users = await _Response.json();
        const _AdminUser = _Users.find((user: any) => user.name === username);
        return _AdminUser?.id || null;
      }
      return null;
    } catch (_Error) {
      console.error("Error fetching user ID:", _Error);
      return null;
    }
  };

  const HandleKeyDown = (Event: React.KeyboardEvent<HTMLDivElement>) => {
    if (Event.key === "Escape") {
      OnClose();
    }
  };

  return (
    <AnimatePresence>
      {IsOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalOverlayVariants}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={OnClose}
          onKeyDown={HandleKeyDown}
        >
          <motion.div
            ref={_ModalRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalContentVariants}
            className="w-full max-w-md rounded-xl shadow-2xl bg-gradient-to-br from-rose-950/90 via-rose-900/30 to-black border border-rose-500/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-rose-500/20 flex items-center">
              <div className="bg-rose-500/20 p-3 rounded-lg mr-3">
                <i className="fas fa-lock text-rose-300 text-lg"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Bezpieczeństwo konta
                </h3>
                <p className="text-sm text-rose-200/70">
                  Dla użytkownika: <span className="font-semibold">{Username}</span>
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-rose-500/20 rounded-lg p-4 mb-6 border border-rose-500/30">
                <p className="text-rose-100 text-sm flex items-start">
                  <i className="fas fa-triangle-exclamation mr-2 mt-0.5"></i>
                  <span>Wykryto użycie domyślnego hasła administratora. Zalecana jest natychmiastowa zmiana hasła.</span>
                </p>
              </div>

              {_Success ? (
                <div className="bg-emerald-500/20 rounded-lg p-4 mb-6 border border-emerald-500/30">
                  <p className="text-emerald-100 text-sm flex items-start">
                    <i className="fas fa-circle-check mr-2 mt-0.5"></i>
                    <span>Hasło zostało zmienione pomyślnie!</span>
                  </p>
                </div>
              ) : (
                <>
                  {_Error && (
                    <div className="bg-rose-500/20 rounded-lg p-4 mb-6 border border-rose-500/30">
                      <p className="text-rose-100 text-sm flex items-start">
                        <i className="fas fa-circle-exclamation mr-2 mt-0.5"></i>
                        <span>{_Error}</span>
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4 mb-6">
                    <div className="space-y-1">
                      <label htmlFor="new-password" className="text-sm text-gray-300 block flex items-center">
                        <i className="fas fa-key mr-2 text-rose-300/70"></i>
                        Nowe hasło
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="new-password"
                          value={_NewPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pl-10 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
                          placeholder="Minimum 8 znaków"
                          disabled={_IsLoading}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400/50">
                          <i className="fas fa-lock text-sm"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="confirm-password" className="text-sm text-gray-300 block flex items-center">
                        <i className="fas fa-check-double mr-2 text-rose-300/70"></i>
                        Potwierdź nowe hasło
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="confirm-password"
                          value={_ConfirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pl-10 rounded-xl backdrop-blur-xl bg-white/5 border border-rose-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all duration-300"
                          placeholder="Potwierdź nowe hasło"
                          disabled={_IsLoading}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rose-400/50">
                          <i className="fas fa-shield text-sm"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  ref={_CloseButtonRef}
                  onClick={OnClose}
                  disabled={_IsLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700/80 text-white font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {_Success ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Zamknij
                    </>
                  ) : (
                    <>
                      <i className="fas fa-xmark mr-2"></i>
                      Anuluj
                    </>
                  )}
                </motion.button>
                
                {!_Success && (
                  <motion.button
                    onClick={HandleSubmit}
                    disabled={_IsLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-all duration-200 ease-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
                  >
                    {_IsLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Zapisywanie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shield mr-2"></i>
                        Zmień hasło
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPasswordModal; 