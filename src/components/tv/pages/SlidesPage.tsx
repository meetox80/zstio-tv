"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";

type Slide = {
  Id: string;
  Name: string;
  ImageData: string;
  Duration: number;
};

export default function SlidesPage() {
  const [_CurrentDate, SetCurrentDate] = useState(new Date());
  const _ContainerRef = useRef<HTMLDivElement>(null);

  const [Slides, SetSlides] = useState<Slide[]>([]);
  const [IsLoading, SetIsLoading] = useState(true);
  const [CurrentSlideIndex, SetCurrentSlideIndex] = useState(0);
  const [ImagesPreloaded, SetImagesPreloaded] = useState(false);
  const TimerRef = useRef<NodeJS.Timeout | null>(null);

  const FetchSlides = async () => {
    try {
      const Response = await axios.get("/api/slides");
      const NewSlides = Response.data.Slides || [];

      if (NewSlides.length > 0) {
        SetSlides(NewSlides);
      }
    } catch (Error) {
      console.error("Failed to fetch slides:", Error);
    } finally {
      SetIsLoading(false);
    }
  };

  useEffect(() => {
    const _Timer = setInterval(() => {
      SetCurrentDate(new Date());
    }, 1000);

    return () => {
      clearInterval(_Timer);
    };
  }, []);

  useEffect(() => {
    FetchSlides();

    const RefreshInterval = setInterval(() => {
      FetchSlides();
    }, 60000);

    return () => {
      clearInterval(RefreshInterval);
    };
  }, []);

  useEffect(() => {
    if (Slides.length === 0) return;

    const PreloadImages = async () => {
      SetImagesPreloaded(false);
      const ImagePromises = Slides.map((slide) => {
        return new Promise<void>((resolve) => {
          const Img = new window.Image();
          Img.onload = () => resolve();
          Img.onerror = () => resolve();
          Img.src = slide.ImageData;
        });
      });

      await Promise.all(ImagePromises);
      SetImagesPreloaded(true);
    };

    PreloadImages();
  }, [Slides]);

  useEffect(() => {
    if (Slides.length === 0) return;

    const GoToNextSlide = () => {
      SetCurrentSlideIndex((PrevIndex) =>
        PrevIndex === Slides.length - 1 ? 0 : PrevIndex + 1,
      );
    };

    if (TimerRef.current) {
      clearTimeout(TimerRef.current);
    }

    const CurrentSlide = Slides[CurrentSlideIndex];
    if (CurrentSlide) {
      TimerRef.current = setTimeout(
        GoToNextSlide,
        CurrentSlide.Duration * 1000,
      );
    }

    return () => {
      if (TimerRef.current) {
        clearTimeout(TimerRef.current);
      }
    };
  }, [CurrentSlideIndex, Slides]);

  const CurrentSlide = Slides.length > 0 ? Slides[CurrentSlideIndex] : null;
  const ShowEmptyState = !IsLoading && Slides.length === 0;

  if (ShowEmptyState) {
    return null;
  }

  return (
    <div
      ref={_ContainerRef}
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden mt-12"
    >
      <div className="absolute inset-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl">
        {CurrentSlide && (
          <div className="hidden">
            {Slides.map((slide) => (
              <Image
                key={`preload-${slide.Id}`}
                src={slide.ImageData}
                alt=""
                width={1}
                height={1}
              />
            ))}
          </div>
        )}

        <motion.div
          className="relative rounded-3xl border border-[#2F2F2F] overflow-hidden mb-12 w-full max-w-7xl aspect-video bg-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: ImagesPreloaded ? 1 : 0,
            y: ImagesPreloaded ? 0 : 20,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {CurrentSlide ? (
            <Image
              key={CurrentSlide.Id}
              src={CurrentSlide.ImageData}
              alt={CurrentSlide.Name}
              fill
              style={{ objectFit: "cover" }}
              priority
              loading="eager"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2M3lYKQAAAABJRU5ErkJggg=="
            />
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
