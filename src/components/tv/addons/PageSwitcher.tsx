"use client";

import { useState, useEffect, useRef } from "react";
import SubstitutionsPage from "../pages/SubstitutionsPage";
import VotePage from "../pages/VotePage";
import SlidesPage from "../pages/SlidesPage";
import axios from "axios";

const DefaultPages = [
  { Component: SubstitutionsPage, Key: "substitutions" },
  { Component: VotePage, Key: "vote" },
  { Component: SlidesPage, Key: "slides" },
];

export default function PageSwitcher() {
  const [_CurrentPageIndex, SetCurrentPageIndex] = useState(0);
  const _TotalSeconds = 30;
  const _IsChangingPage = useRef(false);
  const [_ActivePages, SetActivePages] = useState(DefaultPages);

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

    CheckSlidesAvailability();

    const RefreshInterval = setInterval(() => {
      CheckSlidesAvailability();
    }, 60000);

    return () => clearInterval(RefreshInterval);
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
  const CurrentPageComponent = _CurrentPage.Component;

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <CurrentPageComponent />
      </div>
    </div>
  );
}
