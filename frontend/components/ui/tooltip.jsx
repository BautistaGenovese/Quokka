"use client";

import { useId } from "react";
import { Popover as Primitive } from "radix-ui";
import { X } from "lucide-react";
import Button from "./button";

/** Ayuda por clic/tacto: visualmente tooltip, semánticamente un popover.
 * Reutiliza Button y todo su movimiento; no duplica magnetismo ni seguidor.
 * Radix controla Escape, clic fuera y retorno de foco. Sin Portal para heredar
 * los colores de Section (ubicar fuera de contenedores con overflow:hidden).
 */
export default function Tooltip({ content, label = "Más información", side = "top", children,
  variant = "secondary", magnetic = true, motion = "subtle", open, defaultOpen, onOpenChange }) {
  const messageId = useId();
  return (
      <Primitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {/* Ancla quieta: el mensaje no persigue el desplazamiento magnético. */}
        <Primitive.Anchor asChild><span className="inline-flex align-middle">
          <Primitive.Trigger asChild>
            <Button variant={variant} size="sm" magnetic={magnetic} motion={motion} aria-label={label}
              className={children ? "" : "quokka-help-button quokka-help-trigger"}>
              {children ?? <span className="quokka-help-symbol" aria-hidden="true">?</span>}
            </Button>
          </Primitive.Trigger>
        </span></Primitive.Anchor>
        <Primitive.Content side={side} sideOffset={8} collisionPadding={12}
          aria-label={label} aria-describedby={messageId}
          className="quokka-tooltip font-body text-sm font-normal">
          <div className="flex items-start gap-3">
            <p id={messageId} className="min-w-0 flex-1">{content}</p>
            <Primitive.Close asChild><Button variant="ghost" size="sm" magnetic={false}
              className="quokka-help-button" aria-label="Cerrar ayuda"><X size={16} aria-hidden="true" /></Button></Primitive.Close>
          </div>
        </Primitive.Content>
      </Primitive.Root>
  );
}
