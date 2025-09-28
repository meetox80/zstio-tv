"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SubstitutionsPage from "../pages/SubstitutionsPage";
import VotePage from "../pages/VotePage";
import SlidesPage from "../pages/SlidesPage";
import PomodoroPage from "../pages/PomodoroPage";
import axios from "axios";
import { GetEnabledPages } from "@/config/pageConfig";
import { usePageContext } from "@/context/PageContext";

const AllPages = [
  { Component: PomodoroPage, Key: "pomodoro" },
  { Component: SubstitutionsPage, Key: "substitutions" },
  { Component: VotePage, Key: "vote" },
  { Component: SlidesPage, Key: "slides" },
];

const DefaultPages = AllPages.filter(page => 
  GetEnabledPages().includes(page.Key)
);

export default function PageSwitcher() {
  const _TotalSeconds = 30;
  const _IsChangingPage = useRef(false);
  
  const { 
    CurrentPageIndex: _CurrentPageIndex, 
    SetCurrentPageIndex, 
    ActivePages: _ActivePages, 
    SetActivePages 
  } = usePageContext();
  
  useEffect(() => {
    SetActivePages(DefaultPages);
  }, []);

  useEffect(() => {
    const CheckSlidesAvailability = async () => {
      try {
        const Response = await axios.get("/api/slides");
        const SlideData = Response.data.Slides || [];

        if (SlideData.length === 0) {
          const FilteredPages = DefaultPages.filter(
            (page) => page.Key !== "slides",
          );
          SetActivePages(FilteredPages);
        } else {
          SetActivePages(DefaultPages);
        }
      } catch (Error) {
        const FilteredPages = DefaultPages.filter(
          (page) => page.Key !== "slides",
        );
        SetActivePages(FilteredPages);
      }
    };

    if (DefaultPages.some(page => page.Key === "slides")) {
      CheckSlidesAvailability();
      
      const RefreshInterval = setInterval(() => {
        CheckSlidesAvailability();
      }, 60000);
      
      return () => clearInterval(RefreshInterval);
    } else {
      SetActivePages(DefaultPages);
    }
  }, []);

  useEffect(() => {
    if (_CurrentPageIndex >= _ActivePages.length && _ActivePages.length > 0) {
      SetCurrentPageIndex(0);
    }
  }, [_ActivePages, _CurrentPageIndex]);

  useEffect(() => {
    const _Interval = setInterval(() => {
      if (_ActivePages.length === 0) return;

      const NewIndex = (_CurrentPageIndex + 1) % _ActivePages.length;
      SetCurrentPageIndex(NewIndex);

      _IsChangingPage.current = true;
      const PageChangeEvent = new CustomEvent("pageChange", {
        detail: { pageIndex: NewIndex },
      });
      window.dispatchEvent(PageChangeEvent);
      _IsChangingPage.current = false;
    }, _TotalSeconds * 1000);

    return () => clearInterval(_Interval);
  }, [_CurrentPageIndex, _ActivePages]);

  useEffect(() => {
    const HandlePageChangeEvent = (
      Event: CustomEvent<{ pageIndex: number }>,
    ) => {
      if (
        !_IsChangingPage.current &&
        Event.detail.pageIndex !== _CurrentPageIndex &&
        Event.detail.pageIndex < _ActivePages.length
      ) {
        setTimeout(() => {
          SetCurrentPageIndex(Event.detail.pageIndex);
        }, 0);
      }
    };

    window.addEventListener(
      "pageChange",
      HandlePageChangeEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "pageChange",
        HandlePageChangeEvent as EventListener,
      );
    };
  }, [_CurrentPageIndex, _ActivePages]);

  if (_ActivePages.length === 0) return null;

  const _CurrentPage = _ActivePages[_CurrentPageIndex];
  const CurrentPageComponent = _CurrentPage?.Component;

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={_CurrentPage?.Key || "page"}
          className="w-full h-full"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {CurrentPageComponent && <CurrentPageComponent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
