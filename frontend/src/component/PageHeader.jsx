import React, { useEffect, useRef } from 'react';

export default function PageHeader({
  title,
  description,
  video = '/asset/magma2.mp4',
  position = 'center 65%',
  children,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    const onScroll = () => {
      const rect = video.closest('header').getBoundingClientRect();
      const progress = Math.max(0, -rect.top / rect.height);
      video.style.transform = `translateY(${progress * 40}px) scale(1.06)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="relative h-[380px] md:h-[320px] overflow-hidden border-b border-[#343c41]">
      <video
        ref={videoRef}
        src={video}
        alt=""
        aria-hidden="true"
        autoPlay
        muted
        loop
        decoding="async"
        className="absolute inset-0 h-[115%] w-full object-cover opacity-75 will-change-transform"
        style={{ objectPosition: position, top: '-7.5%' }}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1c2226]/70 via-[#1c2226]/10 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1c2226] via-[#1c2226]/20 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1c2226]/50 via-transparent to-[#1c2226]/40" />

      <div className="relative mx-auto flex h-full max-w-[1920px] flex-col justify-end px-6 pb-9 lg:px-12 xl:px-16">
        <div aria-hidden="true" className="mb-4 h-[2px] w-10 bg-[#d9651b]" />
        <h1 className="simb-display uppercase text-4xl md:text-5xl 2xl:text-6xl leading-[1.02] text-[#f1efe8]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-base md:text-lg leading-relaxed text-[#d2d0c8]">{description}</p>
        )}
        {children}
      </div>
    </header>
  );
}
