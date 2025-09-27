"use client";

import React, { useEffect, useState } from "react";

export default function TextWidget() {
  const [_WidgetText, SetWidgetText] = useState(
    "Przypominamy, że obowiązuje całkowity zakaz opuszczania terenu szkoły podczas zajęć i przerw międzylekcyjnych.",
  );

  useEffect(() => {
    const FetchWidgetText = async () => {
      try {
        const Response = await fetch("/api/widgets/text");
        const Data = await Response.json();

        if (Data.widget_text) {
          SetWidgetText(Data.widget_text);
        }
      } catch (Error) {
        console.error("Failed to fetch widget text:", Error);
      }
    };

    FetchWidgetText();
  }, []);

  return (
    <div className="w-full h-full bg-[#1C1919]/80 border border-[#282626] rounded-[12px] flex items-center justify-center px-6">
      <p className="text-white text-[20px] font-bold font-inter text-center opacity-75">
        {_WidgetText}
      </p>
    </div>
  );
}
