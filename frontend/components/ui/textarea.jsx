"use client";
import { forwardRef } from "react";
import FormField from "./form-field";

const Textarea = forwardRef(function Textarea({ rows = 4, ...props }, ref) {
  return <FormField {...props} ref={ref} as="textarea" rows={rows} />;
});
export default Textarea;
