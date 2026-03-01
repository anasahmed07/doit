"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const BLOB_HALF = 16; // 32px blob radius for centering

export function CustomCursor() {
  const blobRef = useRef<HTMLDivElement>(null);
  const dotRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    const dot  = dotRef.current;
    if (!blob || !dot) return;

    // Kill default cursor globally
    const style = document.createElement("style");
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    // Raw mouse position
    const mouse = { x: -300, y: -300 };
    // Lerped blob position (what we animate)
    const blobPos = { x: -300, y: -300 };
    // Previous blob position for velocity
    const prev = { x: -300, y: -300 };

    let isHovered       = false;
    let needsSpringBack = false;

    gsap.set(blob, { x: -300, y: -300 });
    gsap.set(dot,  { x: -300, y: -300 });

    // Dot snaps instantly via quickTo (duration 0)
    const dotX = gsap.quickTo(dot, "x", { duration: 0.04, ease: "none" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.04, ease: "none" });

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // center the 5px dot
      dotX(mouse.x - 2.5);
      dotY(mouse.y - 2.5);
    };

    // Every frame: lerp blob toward mouse, then apply velocity stretch
    const tickerFn = () => {
      const targetX = mouse.x - BLOB_HALF;
      const targetY = mouse.y - BLOB_HALF;

      // Lerp — 12% per frame ≈ ~350 ms of pleasant lag
      blobPos.x += (targetX - blobPos.x) * 0.12;
      blobPos.y += (targetY - blobPos.y) * 0.12;

      // Velocity from the blob's own smoothed movement
      const dx    = blobPos.x - prev.x;
      const dy    = blobPos.y - prev.y;
      const speed = Math.hypot(dx, dy);

      if (!isHovered && speed > 0.5) {
        needsSpringBack = true;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const sx    = Math.min(1 + speed * 0.13, 1.85);
        gsap.set(blob, {
          x: blobPos.x, y: blobPos.y,
          rotation: angle,
          scaleX: sx, scaleY: 1 / sx,
        });
      } else {
        gsap.set(blob, { x: blobPos.x, y: blobPos.y });
        if (!isHovered && needsSpringBack && speed < 0.08) {
          needsSpringBack = false;
          gsap.to(blob, {
            scaleX: 1, scaleY: 1, rotation: 0,
            duration: 0.9,
            ease: "elastic.out(1, 0.3)",
            overwrite: "auto",
          });
        }
      }

      prev.x = blobPos.x;
      prev.y = blobPos.y;
    };

    gsap.ticker.add(tickerFn);

    // ── Hover ──────────────────────────────────────────────────
    const onEnter = () => {
      isHovered = true;
      gsap.to(blob, {
        scaleX: 2.6, scaleY: 2.6, rotation: 0,
        duration: 0.4, ease: "power2.out", overwrite: "auto",
      });
      gsap.to(dot, { opacity: 0, duration: 0.15 });
    };

    const onLeave = () => {
      isHovered = false;
      gsap.to(blob, {
        scaleX: 1, scaleY: 1,
        duration: 0.45, ease: "power2.out", overwrite: "auto",
      });
      gsap.to(dot, { opacity: 1, duration: 0.25 });
    };

    // ── Click burst ────────────────────────────────────────────
    const onDown = () => {
      const target = isHovered ? 2.6 : 1;
      gsap.timeline({ overwrite: "auto" })
        .to(blob, { scaleX: target + 1, scaleY: target + 1, duration: 0.12, ease: "power2.out" })
        .to(blob, { scaleX: target,     scaleY: target,     duration: 0.65, ease: "elastic.out(1, 0.4)" });
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);

    const interactives = document.querySelectorAll<Element>(
      "a, button, [role='button'], input, textarea, select, label"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      gsap.ticker.remove(tickerFn);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Lagging blob — white + mix-blend-mode:difference inverts whatever's beneath */}
      <div
        ref={blobRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "32px",
          height:        "32px",
          borderRadius:  "50%",
          background:    "#ffffff",
          mixBlendMode:  "difference",
          pointerEvents: "none",
          zIndex:        9998,
          willChange:    "transform",
        }}
      />
      {/* Snapping dot — exact cursor position */}
      <div
        ref={dotRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "5px",
          height:        "5px",
          borderRadius:  "50%",
          background:    "#ffffff",
          mixBlendMode:  "difference",
          pointerEvents: "none",
          zIndex:        9999,
          willChange:    "transform",
        }}
      />
    </>
  );
}
