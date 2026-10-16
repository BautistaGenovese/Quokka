"use client";
import { Children, cloneElement, isValidElement, useEffect, useRef } from "react";
import "./heading.css";

const textContent = children => Children.toArray(children).map(child => {
  if (!isValidElement(child)) return child;
  if (child.props["aria-hidden"]) return "";
  return child.type === "br" ? " " : textContent(child.props.children);
}).join("");

/** Entrada de pliegue y hover locales en CSS; ningún listener global del mouse. */
export default function AnimatedHeading({ as: Tag = "h2", children, className = "", ...rest }) {
  const root = useRef(null);
  const text = textContent(children);
  useEffect(() => {
    const el = root.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.ready = "true";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.dataset.entered = "true";
      observer.disconnect();
    }, { rootMargin: "0px 0px -8% 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); delete el.dataset.ready; delete el.dataset.entered; };
  }, [text]);
  let index = 0;
  const split = content => Children.map(content, child => {
    if (typeof child === "string" || typeof child === "number") return String(child).split(/(\s+)/).map((word, i) =>
      /\s/.test(word) ? word : <span className="heading-word" key={i}>{Array.from(word).map(letter => {
        const n = index++;
        return <span className="heading-letter" key={n} style={{ "--heading-delay": Math.min(n * 18, 260) + "ms" }}>{letter}</span>;
      })}</span>);
    if (!isValidElement(child) || child.props["aria-hidden"] || !child.props.children) return child;
    return cloneElement(child, {}, split(child.props.children));
  });
  return <Tag {...rest} ref={root} className={('section-fold-heading ' + className).trim()} aria-label={rest["aria-label"] ?? text}>
    <span aria-hidden="true">{split(children)}</span>
  </Tag>;
}
