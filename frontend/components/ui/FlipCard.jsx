"use client";
import { useRef, useState } from "react";
import "./FlipCard.css";

/** Una rotación CSS interrumpible; no hay springs ni listeners por frame. */
export default function FlipCard({ front, back, flipped, defaultFlipped = false, onFlipChange,
  axis = "y", flipOnClick = true, disabled = false, ariaLabel = "Girar tarjeta", className = "",
  width = 300, height = 400, radius = 14, background = "var(--s-bg)", color = "var(--s-fg)", perspective = 1100, tilt = true }) {
  const [inner, setInner] = useState(defaultFlipped);
  const shown = flipped ?? inner;
  const bounds = useRef(null);
  const resetTilt = event => { bounds.current = null; event.currentTarget.style.setProperty("--fc-rx", "0deg"); event.currentTarget.style.setProperty("--fc-ry", "0deg"); };
  const flip = () => {
    if (disabled || !flipOnClick) return;
    if (flipped === undefined) setInner(!shown);
    onFlipChange?.(!shown);
  };
  return <div className={('flip-card ' + className).trim()} role="button" tabIndex={disabled ? -1 : 0}
    aria-label={ariaLabel} aria-pressed={shown} aria-disabled={disabled || undefined} data-axis={axis}
    onPointerEnter={event => { if (tilt && !disabled && event.pointerType === "mouse" && matchMedia("(prefers-reduced-motion: no-preference)").matches) bounds.current = event.currentTarget.getBoundingClientRect(); }}
    onPointerMove={event => { const box = bounds.current; if (!box || event.buttons) return; event.currentTarget.style.setProperty("--fc-rx", ((.5 - (event.clientY - box.top) / box.height) * 9) + "deg"); event.currentTarget.style.setProperty("--fc-ry", (((event.clientX - box.left) / box.width - .5) * 9) + "deg"); }}
    onPointerLeave={resetTilt} onPointerCancel={resetTilt} onFocus={resetTilt}
    onClick={event => { if (!event.target.closest("a, button, input, select, textarea")) flip(); }}
    onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); flip(); } }}
    style={{ "--fc-w": width + "px", "--fc-h": height + "px", "--fc-radius": radius + "px", "--fc-bg": background, "--fc-ink": color, perspective }}>
    <div className="flip-card__tilt"><div className="flip-card__rotor">
      <div className="flip-card__face flip-card__face--front" aria-hidden={shown} inert={shown}>{front}</div>
      <div className="flip-card__face flip-card__face--back" aria-hidden={!shown} inert={!shown}>{back}</div>
    </div></div>
  </div>;
}
