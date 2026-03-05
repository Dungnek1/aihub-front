"use client";

import { ClipLoader, PulseLoader, ScaleLoader, BarLoader, BeatLoader, HashLoader, RingLoader, SyncLoader } from "react-spinners";
import { cn } from "@/lib/utils";

type SpinnerType = 
  | "clip" 
  | "pulse" 
  | "scale" 
  | "bar" 
  | "beat" 
  | "hash" 
  | "ring" 
  | "sync"
  | "custom";

interface LoadingSpinnerProps {
  type?: SpinnerType;
  size?: number;
  color?: string;
  className?: string;
  message?: string;
}

export function LoadingSpinner({
  type = "clip",
  size = 40,
  color = "#06b6d4",
  className,
  message,
}: LoadingSpinnerProps) {
  const spinnerClass = cn("flex flex-col items-center justify-center gap-3", className);

  const renderSpinner = () => {
    const spinnerProps = {
      color,
      size,
      loading: true,
    };

    switch (type) {
      case "clip":
        return <ClipLoader {...spinnerProps} />;
      case "pulse":
        return <PulseLoader {...spinnerProps} />;
      case "scale":
        return <ScaleLoader {...spinnerProps} />;
      case "bar":
        return <BarLoader {...spinnerProps} width={100} />;
      case "beat":
        return <BeatLoader {...spinnerProps} />;
      case "hash":
        return <HashLoader {...spinnerProps} />;
      case "ring":
        return <RingLoader {...spinnerProps} />;
      case "sync":
        return <SyncLoader {...spinnerProps} />;
      case "custom":
        return (
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-500/10" />
          </div>
        );
      default:
        return <ClipLoader {...spinnerProps} />;
    }
  };

  return (
    <div className={spinnerClass}>
      {renderSpinner()}
      {message && (
        <p className="text-sm font-medium text-white/90">{message}</p>
      )}
    </div>
  );
}

