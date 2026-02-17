import { cn } from "@/lib/utils"
import Image from "next/image"

interface TraceLogoProps {
  className?: string
  showText?: boolean
  textClassName?: string
}

export function TraceLogo({ className, showText = true,
  textClassName }: TraceLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative size-8 flex items-center justify-center">
        <Image
          src="/trace-logo-final.png"
          alt="Trace Logo"
          width={32}
          height={32}
          className="size-full object-contain"
        />
      </div>
      {showText && (
        <span className={cn("text-xl font-bold text-foreground", textClassName)}>
          Trace
        </span>
      )}
    </div>
  )
}