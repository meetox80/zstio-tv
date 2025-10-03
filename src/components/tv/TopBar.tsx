"use client";

import React, { useCallback, useEffect } from "react";
import LessonWidget from "./widgets/LessonWIdget";
import TextWidget from "./widgets/TextWidget";
import PageIndicator from "./widgets/PageIndicator";
import { motion } from "framer-motion";
import axios from "axios";
import PageConfiguration, { GetEnabledPages } from "@/config/pageConfig";
import { usePageContext } from "@/context/PageContext";

export default function TopBar() {
  const _FirstSectionWidth = 300;
  const _CenterSectionWidth = 1270;
  const _ThirdSectionWidth = 300;

  // Use the shared page context
  const { ActivePages: _ActivePages, SetCurrentPageIndex } = usePageContext();

  // We no longer need the slide availability check here as it's handled in PageSwitcher

  const HandlePageChange = useCallback(
    (PageIndex: number) => {
      // Update the current page index in the shared context
      SetCurrentPageIndex(PageIndex);
    },
    [SetCurrentPageIndex],
  );

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 h-[120px] flex items-center px-[40px] z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex items-center"
        style={{ width: `${_FirstSectionWidth}px` }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        <div className="w-full h-[60px] rounded-[7px] flex">
          <LessonWidget />
        </div>
      </motion.div>

      <motion.div
        className="mx-[20px]"
        style={{ width: `${_CenterSectionWidth}px` }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <div className="w-full h-[60px]">
          <TextWidget />
        </div>
      </motion.div>

      <motion.div
        className="flex items-center justify-center"
        style={{ width: `${_ThirdSectionWidth}px` }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
      >
        <div className="w-full h-[60px]">
          <PageIndicator Pages={_ActivePages} OnPageChange={HandlePageChange} />
        </div>
      </motion.div>
    </motion.div>
  );
}
