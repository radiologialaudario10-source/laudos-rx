import { useEffect, useState } from "react";

export function useDebouncedFlag(trigger: any, delay = 600) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setStatus("saving");
    const t = setTimeout(() => setStatus("saved"), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);

  return status;
}
