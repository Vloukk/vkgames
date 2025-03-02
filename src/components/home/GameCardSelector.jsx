"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function GameCardSelector({ title, link, color }) {
  const marqueeRef = useRef(null);
  const marqueeWrapperRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!marqueeWrapperRef.current) return;
    
    // Duplication du texte pour un effet continu sans coupure
    marqueeWrapperRef.current.innerHTML = `<span>${title}   </span>`.repeat(20);

  }, [title]);

  useEffect(() => {
    if (!isMounted) return;

    if (hovered && marqueeRef.current) {
      marqueeRef.current.style.display = "block";
      gsap.to(marqueeRef.current, {
        x: "-100%",
        duration: 20,
        ease: "linear",
        repeat: -1,
      });
    } else if (marqueeRef.current) {
      gsap.killTweensOf(marqueeRef.current);
      gsap.set(marqueeRef.current, { x: 0 }); // Remet le texte à sa position initiale
    }
  }, [hovered, isMounted]);

  return (
    <div
      className="GameCardSelector"
      style={{ backgroundColor: color, cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => (window.location.href = link)}
    >
      {/* On garde les deux éléments pour éviter que React perde la ref */}
      <div className="GameCardSelector__text">
        <span
          className="text__letter"
          style={{ opacity: hovered ? 0 : 1, transition: "opacity 0.3s" }}
        >
          {title.charAt(0).toUpperCase()}
        </span>
        <div
          className="text__marqueeContainer"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s" }}
        >
          <div className="marqueeContainer__marquee" ref={marqueeRef}>
            <div className="marquee__marqueeWrapper" ref={marqueeWrapperRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
