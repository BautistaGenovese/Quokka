/**
 * Form components built on top of React Hook Form.
 * Provides FormField, FormItem, FormLabel, FormControl,
 * FormDescription, and FormMessage with full accessibility support.
 */
"use client"

import * as React from "react"
import { useFormContext, Controller, FormProvider } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// ─── Context ────────────────────────────────────────────────────────────────

const FormFieldContext = React.createContext({})
const FormItemContext = React.createContext({})

// ─── Form (re-exports FormProvider) ─────────────────────────────────────────

const Form = FormProvider

// ─── FormField ───────────────────────────────────────────────────────────────

function FormField(props) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

// ─── useFormField hook ────────────────────────────────────────────────────────

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

// ─── FormItem ─────────────────────────────────────────────────────────────────

function FormItem({ className, ...props }) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

// ─── FormLabel ────────────────────────────────────────────────────────────────

function FormLabel({ className, ...props }) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-[var(--destructive)]", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

// ─── FormControl ──────────────────────────────────────────────────────────────

function FormControl({ ...props }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <div data-slot="form-control">
      {React.cloneElement(props.children, {
        id: formItemId,
        "aria-describedby": !error
          ? formDescriptionId
          : `${formDescriptionId} ${formMessageId}`,
        "aria-invalid": !!error,
      })}
    </div>
  )
}

// ─── FormDescription ──────────────────────────────────────────────────────────

function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-xs text-[var(--muted-foreground)]", className)}
      {...props}
    />
  )
}

// ─── FormMessage ──────────────────────────────────────────────────────────────

function FormMessage({ className, children, ...props }) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) return null

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        "flex items-center gap-1 text-xs font-medium text-[var(--destructive)]",
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-3 shrink-0"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3.25a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 4.75Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
          clipRule="evenodd"
        />
      </svg>
      {body}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
}
