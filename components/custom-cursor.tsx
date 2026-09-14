"use client";

import { useEffect, useRef } from "react";

/**
 * Puzzle Inn dual cursor.
 * Always mounts on the client; CSS hides it on coarse/touch-primary devices
 * so Playwright/headless and desktop browsers both get a visible cursor.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLSpanElement>(null);
  const outerMoveRef = useRef<HTMLSpanElement>(null);
  const innerMoveRef = useRef<HTMLSpanElement>(null);

  const target = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });
  const innerPos = useRef({ x: -100, y: -100 });
  const prevTarget = useRef({ x: -100, y: -100 });
  const angle = useRef(0);
  const speed = useRef(0);
  const hovering = useRef(false);
  const clicking = useRef(false);
  const visible = useRef(true);
  const moving = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    document.body.classList.add("cursor-ready");
    visible.current = true;

    const applyClasses = () => {
      const root = rootRef.current;
      if (!root) return;
      root.classList.add("isVisible");
      const nextMoving = speed.current > 2.2 && !hovering.current;
      if (moving.current !== nextMoving) {
        moving.current = nextMoving;
        root.classList.toggle("isMoving", nextMoving);
      }
      root.classList.toggle("isHover", hovering.current);
      root.classList.toggle("isClicked", clicking.current);
      root.classList.toggle("isVisible", visible.current);
    };

    // Seed position to viewport center so the cursor is never stuck off-screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    target.current = { x: cx, y: cy };
    outerPos.current = { x: cx, y: cy };
    innerPos.current = { x: cx, y: cy };
    prevTarget.current = { x: cx, y: cy };

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevTarget.current.x;
      const dy = e.clientY - prevTarget.current.y;
      const dist = Math.hypot(dx, dy);
      speed.current = dist;
      if (dist > 0.4) angle.current = (Math.atan2(dy, dx) * 180) / Math.PI;
      prevTarget.current = { x: e.clientX, y: e.clientY };
      target.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
      applyClasses();
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      hovering.current = Boolean(
        el?.closest(
          "a, button, input, textarea, select, label, [role='button'], [data-cursor], .see-you-letter",
        ),
      );
      applyClasses();
    };

    const onDown = () => {
      clicking.current = true;
      applyClasses();
    };
    const onUp = () => {
      clicking.current = false;
      applyClasses();
    };
    const onLeave = () => {
      visible.current = false;
      applyClasses();
    };
    const onEnter = () => {
      visible.current = true;
      applyClasses();
    };

    const tick = () => {
      speed.current *= 0.86;
      outerPos.current.x += (target.current.x - outerPos.current.x) * 0.14;
      outerPos.current.y += (target.current.y - outerPos.current.y) * 0.14;
      innerPos.current.x += (target.current.x - innerPos.current.x) * 0.42;
      innerPos.current.y += (target.current.y - innerPos.current.y) * 0.42;

      if (outerMoveRef.current) {
        outerMoveRef.current.style.transform = `translate3d(${outerPos.current.x}px, ${outerPos.current.y}px, 0) rotate(${angle.current}deg)`;
      }
      if (innerMoveRef.current) {
        innerMoveRef.current.style.transform = `translate3d(${innerPos.current.x}px, ${innerPos.current.y}px, 0)`;
      }
      applyClasses();
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    applyClasses();
    raf.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("cursor-ready");
    };
  }, []);

  return (
    <span ref={rootRef} aria-hidden className="pi-cursor isVisible" data-testid="custom-cursor">
      <span ref={outerMoveRef} className="pi-cursor-move-outer">
        <span className="pi-cursor-outer" />
      </span>
      <span ref={innerMoveRef} className="pi-cursor-move-inner">
        <span className="pi-cursor-inner" />
      </span>
    </span>
  );
}
