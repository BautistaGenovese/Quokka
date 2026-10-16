"use client";
import { forwardRef } from "react";
import ChoiceField from "./choice-field";

/** Una decisión independiente; name/value se incluyen en FormData al marcar. */
const Checkbox = forwardRef(function Checkbox(props, ref) {
  return <ChoiceField {...props} ref={ref} type="checkbox" />;
});
export default Checkbox;
