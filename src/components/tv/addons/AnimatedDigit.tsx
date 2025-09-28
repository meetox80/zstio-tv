"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type AnimatedDigitProps = {
  Value: string;
  Size?: "small" | "medium" | "large" | "xlarge" | "xxlarge";
  Color?: string;
  OnColonCenterChange?: (X: number) => void;
};

export default function AnimatedDigit({
  Value,
  Size = "large",
  Color = "white",
  OnColonCenterChange,
}: AnimatedDigitProps) {
  const _PrevValueRef = useRef(Value);
  const _RootRef = useRef<HTMLDivElement | null>(null);
  const _ColonRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    _PrevValueRef.current = Value;
  }, [Value]);

  useEffect(() => {
    if (!_RootRef.current || !_ColonRef.current || !OnColonCenterChange) return;
    const RootRect = _RootRef.current.getBoundingClientRect();
    const ColonRect = _ColonRef.current.getBoundingClientRect();
    const CenterX = ColonRect.left - RootRect.left + ColonRect.width / 2;
    OnColonCenterChange(CenterX);
  }, [Value, Size, Color, OnColonCenterChange]);
  
  const _FontSizeClass = {
    small: "text-4xl",
    medium: "text-6xl",
    large: "text-9xl",
    xlarge: "text-[240px]",
    xxlarge: "text-[300px]",
  } as const;
  
  const _Digits = "0123456789".split("");
  
  return (
    <div
      ref={_RootRef}
      className={`${_FontSizeClass[Size]} font-bold leading-none tracking-tight`}
      style={{ color: Color, lineHeight: 1 }}
    >
      <div className="flex">
        {Value.split("").map((Digit, Index) => {
          if (Digit === ":") {
            return (
              <div
                key={`${Index}-colon`}
                style={{
                  width: "0.45em",
                  height: "1em",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.18em",
                }}
                ref={_ColonRef}
              >
                <span style={{ width: "0.12em", height: "0.12em", borderRadius: "9999px", background: "currentColor" }} />
                <span style={{ width: "0.12em", height: "0.12em", borderRadius: "9999px", background: "currentColor" }} />
              </div>
            );
          }
          return (
            <div
              key={`${Index}-${Digit}`}
              className="relative overflow-hidden"
              style={{
                width: "0.62em",
                height: "1em",
                WebkitMaskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 16%, rgba(0,0,0,1) 34%, rgba(0,0,0,1) 54%, rgba(0,0,0,0.65) 76%, rgba(0,0,0,0) 100%)",
                maskImage:
                  "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 16%, rgba(0,0,0,1) 34%, rgba(0,0,0,1) 54%, rgba(0,0,0,0.65) 76%, rgba(0,0,0,0) 100%)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 flex justify-center">
                <motion.div
                  className="flex flex-col items-center"
                  animate={{
                    y: `${-_Digits.indexOf(Digit) * 100}%`,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  style={{ y: `-${_Digits.indexOf(_PrevValueRef.current[Index] || "0") * 100}%`, willChange: "transform" }}
                >
                  {_Digits.map((D) => (
                    <div key={D} className="flex-shrink-0 flex-grow-0" style={{ height: "1em" }}>
                      {D}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
