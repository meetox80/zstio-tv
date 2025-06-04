import { FC, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "error" | "success" | "info" | "warning";

type ToastProps = {
  Message: string | null;
  Type?: ToastType;
  Duration?: number;
  OnClose?: () => void;
};

const Toast: FC<ToastProps> = ({
  Message,
  Type = "error",
  Duration = 5000,
  OnClose,
}) => {
  const [IsVisible, SetIsVisible] = useState(!!Message);

  useEffect(() => {
    SetIsVisible(!!Message);

    if (Message) {
      const Timer = setTimeout(() => {
        SetIsVisible(false);
        setTimeout(() => {
          OnClose && OnClose();
        }, 300);
      }, Duration);

      return () => clearTimeout(Timer);
    }
  }, [Message, Duration, OnClose]);

  if (!Message) return null;

  const GetIcon = () => {
    switch (Type) {
      case "error":
        return <i className="fas fa-exclamation-triangle text-red-400"></i>;
      case "success":
        return <i className="fas fa-check-circle text-green-400"></i>;
      case "info":
        return <i className="fas fa-info-circle text-rose-400"></i>;
      case "warning":
        return <i className="fas fa-exclamation-circle text-amber-400"></i>;
    }
  };

  const GetBgColor = () => {
    switch (Type) {
      case "error":
        return "bg-red-500/20 border-red-500/30";
      case "success":
        return "bg-green-500/20 border-green-500/30";
      case "info":
        return "bg-rose-500/20 border-rose-500/30";
      case "warning":
        return "bg-amber-500/20 border-amber-500/30";
    }
  };

  return (
    <AnimatePresence>
      {IsVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg ${GetBgColor()} backdrop-blur-md shadow-lg max-w-md flex items-center`}
        >
          <div className="mr-3">{GetIcon()}</div>
          <span className="text-white">{Message}</span>
          <button
            onClick={() => {
              SetIsVisible(false);
              setTimeout(() => {
                OnClose && OnClose();
              }, 300);
            }}
            className="ml-4 text-white/70 hover:text-white"
            aria-label="Zamknij komunikat"
            title="Zamknij"
          >
            <i className="fas fa-times"></i>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
