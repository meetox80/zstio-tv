"use client";

import { useEffect, useState } from "react";

export default function FullscreenHandler() {
  const [_IsFullscreen, SetIsFullscreen] = useState<boolean>(false);

  const HandleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          SetIsFullscreen(true);
        })
        .catch((error) => {
          console.error(
            `Error attempting to enable fullscreen: ${error.message}`,
          );
        });
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            SetIsFullscreen(false);
          })
          .catch((error) => {
            console.error(
              `Error attempting to exit fullscreen: ${error.message}`,
            );
          });
      }
    }
  };

  useEffect(() => {
    const HandleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "f") {
        HandleFullscreenToggle();
      }
    };

    window.addEventListener("keydown", HandleKeyDown);

    return () => {
      window.removeEventListener("keydown", HandleKeyDown);
    };
  }, []);

  return null;
}
