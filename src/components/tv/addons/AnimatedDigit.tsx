"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type AnimatedDigitProps = {
  Value: string;
  Size?: "small" | "medium" | "large" | "xlarge" | "xxlarge";
  Color?: string;
};

export default function AnimatedDigit({
  Value,
  Size = "large",
  Color = "white",
}: AnimatedDigitProps) {
  const _PrevValueRef = useRef(Value);
  useEffect(() => {
    _PrevValueRef.current = Value;
  }, [Value]);
  
  const _FontSizeClass = {
    small: "text-4xl",
    medium: "text-6xl",
    large: "text-9xl",
    xlarge: "text-[240px]",
    xxlarge: "text-[300px]",
  } as const;
  
  const _Digits = "0123456789:".split("");
  
  return (
    <div
      className={`${_FontSizeClass[Size]} font-bold leading-none tracking-tight`}
      style={{ color: Color }}
    >
      <div className="flex">
        {Value.split("").map((Digit, Index) => (
          <div key={`${Index}-${Digit}`} className="relative overflow-hidden" style={{ width: Digit === ":" ? "0.45em" : "0.62em", height: "1.15em" }}>
            <div className="absolute inset-0 flex justify-center">
              {_Digits.includes(Digit) && (
                <motion.div
                  className="flex flex-col items-center"
                  animate={{
                    y: `${-_Digits.indexOf(Digit) * 100}%`,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  style={{ y: `-${_Digits.indexOf(_PrevValueRef.current[Index] || "0") * 100}%`, willChange: "transform" }}
                >
                  {_Digits.map((D) => (
                    <div key={D} className="flex-shrink-0 flex-grow-0" style={{ height: "1.15em" }}>
                      {D}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
