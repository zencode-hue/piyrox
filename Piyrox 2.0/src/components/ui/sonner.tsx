"use client";

import { Toaster as SonnerToaster } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      className="toaster"
      style={{
        background: "#09090b",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      {...props}
    />
  );
}