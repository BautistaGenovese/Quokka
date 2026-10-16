'use client';
import { capturePointer, releasePointer } from "@/lib/pointer-capture";

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

import { X } from 'lucide-react';
import './SwipeToast.css';

const EASE_OUT = [0.23, 1, 0.32, 1];
const FLICK = 0.11;
const DEAD_ZONE = 3;
const RESIST_PX = 24;
const COLLAPSE_MS = 200;
const EXIT = 0.7;
const BURN = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }];


const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
const velocityOf = hist => {
  if (hist.length < 2) return 0;
  const [t0, y0] = hist[0];
  const [t1, y1] = hist[hist.length - 1];
  return performance.now() - t1 > 100 ? 0 : (y1 - y0) / Math.max(1, t1 - t0);
};

export default function SwipeToast({
  title = 'Notificación',
  description = '',
  icon,
  actionLabel = '',
  onAction,
  open = true,
  onClose,
  background = '#27272a',
  color = '#f5f5f5',
  fuseColor = '#f5a524',
  width = 356,
  radius = 12,
  slideMs = 400,
  settleBounce = 0.2,
  swipeDistance = 40,
  duration = 4000,
  fuse = 'bottom',
  pauseOnHover = true,
  closeButton = false,
  inline = false,
  dismissible = true,
  className = ''
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(open ? 'open' : 'gone');
  const [instant, setInstant] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef(null);
  const fuseRef = useRef(null);
  const anim = useRef(null);
  const drag = useRef(null);
  const flags = useRef({ hover: false, interacting: false, focus: false, hidden: false });
  const lastInput = useRef('pointer');
  const pendingClose = useRef(null);
  const closeTimer = useRef(undefined);
  const reason = useRef('timeout');
  const leaving = useRef(false);
  const alive = useRef(true);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  const latest = useRef({});
  useEffect(() => { latest.current = { onClose, onAction, slideMs, inline }; }, [onClose, onAction, slideMs, inline]);

  const y = useMotionValue(0);
  const fade = useMotionValue(1);
  const transform = useTransform(y, v => `translateY(${v}px)`);

  const syncFuse = () => {
    const a = anim.current;
    if (!a) return;
    const f = flags.current;
    if (f.hover || f.interacting || f.focus || f.hidden) a.pause();
    else if (a.playState === 'paused') a.play();
  };
  const finish = why => {
    if (!alive.current) return;
    phaseRef.current = "gone";
    setPhase('gone');
    leaving.current = false;
    if (latest.current.inline) closeTimer.current = setTimeout(() => latest.current.onClose?.(why), COLLAPSE_MS);
    else latest.current.onClose?.(why);
  };
  const close = why => {
    if (phaseRef.current !== 'open' || leaving.current) return;
    if (drag.current) {
      pendingClose.current = why;
      return;
    }
    anim.current?.pause();
    reason.current = why;
    const now = why === 'escape' || ((why === 'action' || why === 'close') && lastInput.current === 'keyboard');
    setInstant(now);
    phaseRef.current = 'closing';
    setPhase('closing');
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => finish(why), now ? 0 : latest.current.slideMs * EXIT + 60);
  };
  const rescue = () => {
    phaseRef.current = "open";
    clearTimeout(closeTimer.current);
    setInstant(false);
    y.set(0);
    fade.set(1);
    setPhase('open');
  };

  useEffect(() => {
    if (!open) close('programmatic');
    else if (phaseRef.current !== 'open') rescue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (phase !== 'open' || duration <= 0 || !fuseRef.current) return undefined;
    anim.current?.cancel();
    const a = fuseRef.current.animate(BURN, { duration, easing: 'linear', fill: 'forwards' });
    if (fuse === 'none') fuseRef.current.style.opacity = '0';
    a.onfinish = () => close('timeout');
    anim.current = a;
    syncFuse();
    return () => {
      a.onfinish = null;
      a.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, duration]);
  useEffect(() => {
    if (!pauseOnHover) {
      flags.current.hover = false;
      syncFuse();
    }
     
  }, [pauseOnHover]);
  useEffect(() => {
    alive.current = true;
    const onVisibility = () => {
      flags.current.hidden = document.hidden;
      syncFuse();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive.current = false;
      y.stop(); fade.stop();
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(closeTimer.current);
      anim.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swipeOut = (dy, v) => {
    anim.current?.pause();
    leaving.current = true;
    pendingClose.current = null;
    if (!reduce && cardRef.current) {
      animate(y, dy + cardRef.current.offsetHeight, { type: 'spring', duration: 0.3, bounce: 0, velocity: v * 1000 });
    }
    animate(fade, 0, { duration: 0.2, ease: EASE_OUT }).then(() => finish('swipe'));
  };
  const onPointerDown = e => {
    lastInput.current = 'pointer';
    if (e.button !== 0 || !dismissible || drag.current || leaving.current || e.target.closest('button')) return;
    if (phaseRef.current === 'closing') rescue();
    capturePointer(cardRef.current, e.pointerId);
    y.stop();
    drag.current = {
      id: e.pointerId,
      startY: e.clientY,
      grab: null,
      moved: false,
      hist: [[performance.now(), y.get()]]
    };
    flags.current.interacting = true;
    syncFuse();
  };
  const onPointerMove = e => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.grab === null) {
      if (Math.abs(e.clientY - d.startY) < DEAD_ZONE) return;
      d.grab = e.clientY - y.get();
      if (cardRef.current) cardRef.current.dataset.swiping = '';
    }
    const raw = e.clientY - d.grab;
    const next = raw >= 0 ? raw : rubberband(raw, RESIST_PX);
    y.set(next);
    d.moved = true;
    d.hist.push([performance.now(), next]);
    if (d.hist.length > 4) d.hist.shift();
  };
  const onPointerUp = e => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (cardRef.current) delete cardRef.current.dataset.swiping;
    releasePointer(cardRef.current, e.pointerId);
    flags.current.interacting = false;
    const dy = y.get();
    const v = velocityOf(d.hist);
    if (e.type !== 'pointercancel' && dy > 0 && (v > FLICK || (dy >= swipeDistance && v >= 0))) {
      swipeOut(dy, v);
      return;
    }
    if (d.moved) {
      animate(
        y,
        0,
        reduce
          ? { duration: 0.2, ease: EASE_OUT }
          : { type: 'spring', duration: 0.5, bounce: settleBounce, velocity: v * 1000 }
      );
    }
    const queued = pendingClose.current;
    pendingClose.current = null;
    if (queued) close(queued);
    else syncFuse();
  };

  return (
    <div
      className={`swipe-toast${className ? ` ${className}` : ''}`}
      data-phase={phase}
      inert={phase !== "open"}
      aria-hidden={phase !== "open"}
      data-inline={inline ? 'true' : 'false'}
      data-fuse={duration > 0 ? fuse : 'none'}
      data-dismissible={dismissible ? 'true' : 'false'}
      data-instant={instant ? '' : undefined}
      data-mounted={mounted ? 'true' : 'false'}
      style={{
        '--st-bg': background,
        '--st-ink': color,
        '--st-fuse': fuseColor,
        '--st-w': `${width}px`,
        '--st-radius': `${radius}px`,
        '--st-slide': `${slideMs}ms`,
        '--st-gap': '10px'
      }}
    >
      <div className="swipe-toast__gate">
        <div className="swipe-toast__lift">
          <motion.div
            ref={cardRef}
            className="swipe-toast__card"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            tabIndex={0}
            style={{ transform, opacity: fade }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerEnter={e => {
              if (pauseOnHover && e.pointerType === 'mouse') {
                flags.current.hover = true;
                syncFuse();
              }
            }}
            onPointerLeave={e => {
              if (e.pointerType === 'mouse') {
                flags.current.hover = false;
                syncFuse();
              }
            }}
            onFocus={() => {
              flags.current.focus = true;
              syncFuse();
            }}
            onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                flags.current.focus = false;
                syncFuse();
              }
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') lastInput.current = 'keyboard';
              if (e.key === 'Escape' && dismissible) {
                e.stopPropagation();
                close('escape');
              }
            }}
          >
            {icon ? (
              <span className="swipe-toast__icon" aria-hidden="true">
                {icon}
              </span>
            ) : null}
            <span className="swipe-toast__body">
              <span className="swipe-toast__title">{title}</span>
              {description ? <span className="swipe-toast__desc">{description}</span> : null}
            </span>
            {actionLabel ? (
              <button
                type="button"
                className="swipe-toast__action"
                onClick={() => {
                  latest.current.onAction?.();
                  close('action');
                }}
              >
                {actionLabel}
              </button>
            ) : null}
            {closeButton ? (
              <button type="button" className="swipe-toast__close" aria-label="Cerrar notificación" onClick={() => close('close')}>
                <X size={14} strokeWidth={2.5} />
              </button>
            ) : null}
            <i ref={fuseRef} className="swipe-toast__fuse" aria-hidden="true" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

