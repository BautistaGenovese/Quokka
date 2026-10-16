"use client";

import { Children, forwardRef, useEffect, useRef, useState } from "react";
import { Select as Primitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { gsap, useGSAP, MOTION } from "@/lib/gsap";
import FormField from "./form-field";

/** Un timeline reversible, con los movimientos del dropdown de GSAP:
 * panel elástico + opciones desde la izquierda. Presence mantiene el nodo
 * durante los 400 ms de salida; GSAP es dueño de transforms y opacidad.
 */
function OptionsPanel({ open, children }) {
  const panel = useRef(null), timeline = useRef(null), state = useRef(open);
  useGSAP(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const items = panel.current.querySelectorAll(".quokka-select-item");
    gsap.set(panel.current, { autoAlpha: 0, yPercent: -30, scale: 0.7 });
    const tl = gsap.timeline({ paused: true })
      .to(panel.current, { autoAlpha: 1, yPercent: 0, scale: 1, ...MOTION.options.panel }, 0)
      .from(items, { opacity: 0, x: -12, ...MOTION.options.item,
        stagger: { amount: Math.min(0.35, Math.max(0, items.length - 1) * 0.07) } }, 0.1);
    timeline.current = tl;
    const preference = () => { if (media.matches) tl.progress(state.current ? 1 : 0).pause(); };
    media.addEventListener("change", preference);
    return () => { timeline.current = null; media.removeEventListener("change", preference); };
  }, { scope: panel });
  useEffect(() => {
    state.current = open;
    const tl = timeline.current;
    if (!tl) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) tl.progress(open ? 1 : 0).pause();
    else if (open) tl.timeScale(1).play();
    else tl.timeScale(MOTION.options.reverseSpeed).reverse();
  }, [open]);
  return <div ref={panel} className="quokka-select-panel"><Primitive.Viewport>{children}</Primitive.Viewport></div>;
}

/** Mantiene children option/optgroup y FormData mediante el select interno de
 * Radix. value/onValueChange o defaultValue; ref apunta al trigger enfocable.
 * Radix resuelve flechas, búsqueda por letras, Escape, foco y colisiones.
 * Sin Portal: el desplegable hereda los roles de Section; evitar clipping.
 */
const Select = forwardRef(function Select({ children, value, defaultValue, onValueChange,
  name, form, autoComplete, disabled, required, placeholder, ...props }, ref) {
  const [open, setOpen] = useState(false);
  const arrow = useRef(null);
  const nativeOptions = Children.toArray(children);
  const emptyOption = nativeOptions.find(child => child.type === "option" && child.props.value === "");
  const hint = placeholder ?? emptyOption?.props.children ?? "Elegí una opción";
  useGSAP(() => {
    gsap.to(arrow.current, { rotation: open ? 180 : 0,
      ...MOTION.change,
      duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : MOTION.change.duration,
      overwrite: true });
  }, { dependencies: [open], scope: arrow });
  function options(nodes, groupDisabled = false) {
    return Children.toArray(nodes).map(child => {
      if (child.type === "optgroup") return <Primitive.Group key={child.key}>
        <Primitive.Label className="quokka-select-group">{child.props.label}</Primitive.Label>
        {options(child.props.children, groupDisabled || child.props.disabled)}
      </Primitive.Group>;
      if (child.type !== "option" || child.props.value === "") return null;
      const optionValue = String(child.props.value ?? child.props.children);
      return <Primitive.Item key={optionValue} value={optionValue} disabled={groupDisabled || child.props.disabled}
        className="quokka-select-item">
        <Primitive.ItemText>{child.props.children}</Primitive.ItemText>
        <Primitive.ItemIndicator><Check size={18} aria-hidden="true" /></Primitive.ItemIndicator>
      </Primitive.Item>;
    });
  }
  return <Primitive.Root open={open} onOpenChange={setOpen} value={value} defaultValue={defaultValue}
    onValueChange={onValueChange} name={name} form={form} autoComplete={autoComplete} disabled={disabled} required={required}>
    <FormField {...props} as={Primitive.Trigger} controlKind="select" ref={ref} icon={false}
      disabled={disabled} required={required} focusActive={open}>
      <Primitive.Value placeholder={hint} />
      <Primitive.Icon asChild><ChevronDown ref={arrow} size={20} className="quokka-select-arrow" /></Primitive.Icon>
    </FormField>
    <Primitive.Content position="popper" sideOffset={8} collisionPadding={12} className="quokka-select-content">
      <OptionsPanel open={open}>{options(children)}</OptionsPanel>
    </Primitive.Content>
  </Primitive.Root>;
});
export default Select;
