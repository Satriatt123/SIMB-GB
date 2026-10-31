import React from 'react';

export default function PageHeader({
  title,
  description,
  image = '/asset/background.webp',
  position = 'center 60%',
  children,
}) {
  return (
    <header className="relative h-[220px] md:h-[280px] overflow-hidden border-b border-[#343c41]">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />

      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#1c2226]/90 via-[#1c2226]/40 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#1c2226] via-transparent to-[#1c2226]/30" />

      <div className="relative mx-auto flex h-full max-w-[1920px] flex-col justify-end px-6 pb-8 lg:px-12 xl:px-16">
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