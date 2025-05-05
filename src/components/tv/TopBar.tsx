import React from "react";
import LessonWidget from "./widgets/LessonWIdget";

export default function TopBar() {
  const FirstSectionWidth = 300;
  const CenterSectionWidth = 1270;
  const ThirdSectionWidth = 300;
  
  return (
    <div className="absolute top-0 left-0 right-0 h-[120px] flex items-center px-[40px]">
      <div className="flex items-center" style={{ width: `${FirstSectionWidth}px` }}>
        <div className="w-full h-[60px] rounded-[7px] flex">
          <LessonWidget />
        </div>
      </div>
      
      <div className="mx-[15px]" style={{ width: `${CenterSectionWidth}px` }}>
        <div className="w-full h-[60px] rounded-[7px] border border-[#2F2F2F] bg-[#151515]/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]"></div>
      </div>
      
      <div className="flex items-center" style={{ width: `${ThirdSectionWidth}px` }}>
        <div className="w-full h-[60px] rounded-[7px] border border-[#2F2F2F] bg-[#151515]/80 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]"></div>
      </div>
    </div>
  );
} 