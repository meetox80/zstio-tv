import React from "react";

export default function LessonWidget() {
  const _CircleSize = 28;
  const _StrokeWidth = 5.5;
  const _Progress = 75;

  const CalculateStrokeDashoffset = (Progress: number) => {
    const Circumference = 2 * Math.PI * ((_CircleSize - _StrokeWidth) / 2);
    return Circumference - (Progress / 100) * Circumference;
  };

  const CircleStyles = {
    strokeDasharray: 2 * Math.PI * ((_CircleSize - _StrokeWidth) / 2),
    strokeDashoffset: CalculateStrokeDashoffset(_Progress),
  };

  return (
    <div className="w-full h-full rounded-[7px] flex items-center">
      <div className="relative w-full h-[60px] flex">
        <div className="w-1/2 h-full bg-[#1C1919]/50 border border-[#282626] rounded-l-[7px] flex items-center">
          <div className="flex items-center justify-between w-full px-4">
            <div className="relative flex items-center">
              <svg width={_CircleSize} height={_CircleSize} viewBox={`0 0 ${_CircleSize} ${_CircleSize}`}>
                <circle
                  cx={_CircleSize / 2}
                  cy={_CircleSize / 2}
                  r={(_CircleSize - _StrokeWidth) / 2}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.25"
                  strokeWidth={_StrokeWidth}
                  strokeLinecap="round"
                />
                <circle
                  cx={_CircleSize / 2}
                  cy={_CircleSize / 2}
                  r={(_CircleSize - _StrokeWidth) / 2}
                  fill="none"
                  stroke="white"
                  strokeWidth={_StrokeWidth}
                  strokeLinecap="round"
                  style={CircleStyles}
                  transform={`rotate(-90 ${_CircleSize / 2} ${_CircleSize / 2})`}
                />
              </svg>
            </div>
            <div className="text-white text-lg font-medium flex-1 text-center ml-3">05:23</div>
          </div>
        </div>
        <div className="w-1/2 h-full bg-[#1C1919]/50 border border-[#2B2828] rounded-r-[7px] flex items-center justify-center">
          <span className="text-white text-lg font-medium">Lekcja 5</span>
        </div>
      </div>
    </div>
  );
} 