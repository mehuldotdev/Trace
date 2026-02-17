"use client"
import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"

export function AppCard() {
  const { theme } = useTheme()
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300">
      <div className="mx-auto max-w-6xl">
        <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-muted/40 to-muted/20 p-0 transition-transform hover:scale-[1.01] duration-300">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 p-4 bg-muted/50 border-b border-border/50">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-500/80" />
              <div className="size-3 rounded-full bg-yellow-500/80" />
              <div className="size-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 flex items-center gap-2 ml-4">
              <svg
                className="size-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="text-xs text-muted-foreground font-mono">
                trace.io/dashboard
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="bg-background min-h-80">
            <img
              src="/images/app-dark.png"
              alt="Dashboard Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}