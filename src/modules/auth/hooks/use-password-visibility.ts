"use client";

import { useCallback, useState } from "react";

export function usePasswordVisibility(initial = false) {
  const [isVisible, setIsVisible] = useState(initial);

  const toggle = useCallback(() => setIsVisible((prev) => !prev), []);

  return {
    isVisible,
    toggle,
    inputType: isVisible ? ("text" as const) : ("password" as const),
  };
}
