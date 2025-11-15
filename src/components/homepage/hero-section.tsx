"use client";

import { useEffect, useRef } from "react";

type VideoItem = { src: string; poster?: string };

type MultiVideoHeroProps = {
  videos?: [VideoItem, VideoItem, VideoItem];
};

export function HeroSection({
  videos = [
    { src: "/videos/veo3-1.mp4", poster: "/images/veo3-1.jpg" },
    { src: "/videos/veo3-2.mp4", poster: "/images/veo3-2.jpg" },
    { src: "/videos/veo3-3.mp4", poster: "/images/veo3-3.jpg" },
  ],
}: MultiVideoHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // IntersectionObserver to play/pause when in view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLVideoElement;
          if (prefersReduced) {
            // Keep paused for users who prefer reduced motion
            el.pause();
            return;
          }
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );

    videoRefs.current.forEach((v) => {
      if (v) io.observe(v);
    });

    return () => io.disconnect();
  }, []);

  // subtle tilt
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--tiltX", `${y * -3}deg`);
      el.style.setProperty("--tiltY", `${x * 4}deg`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative w-full py-10 md:py-14 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 md:px-8" ref={containerRef}>
        <div className="mx-auto max-w-7xl will-change-transform" style={{ transform: 'perspective(1000px) rotateX(var(--tiltX, 0)) rotateY(var(--tiltY, 0))' }}>
          {/* 3-video responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {videos.map((v, i) => (
              <figure
                key={i}
                className="group relative aspect-video overflow-hidden rounded-2xl bg-black/90 ring-1 ring-black/10 shadow-[0_8px_30px_rgb(2,8,23,0.15)]"
              >
                <video
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={v.poster}
                  ref={(el) => { videoRefs.current[i] = el; return; }}
                  aria-hidden
                >
                  <source src={v.src} type="video/mp4" />
                </video>
                {/* overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-60" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />
                {/* hover glow border */}
                <div className="pointer-events-none absolute inset-0 ring-0 ring-cyan-300/0 group-hover:ring-2 group-hover:ring-cyan-300/30 transition-[box-shadow,ring] duration-300" />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}