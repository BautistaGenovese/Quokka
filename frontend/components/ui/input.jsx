"use client";
import { forwardRef } from "react";
import FormField from "./form-field";

const Input = forwardRef(function Input({ type = "text", ...props }, ref) {
  return <FormField {...props} ref={ref} as="input" type={type} />;
});
export { Input };
export default Input;
