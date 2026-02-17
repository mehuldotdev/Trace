"use client"
import {
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Apple,
  Globe,
  Chrome,
  Compass,
  Terminal,
} from "lucide-react"
import { getDeviceAnalytics } from '@/app/action/analytics'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { DateRange } from 'react-day-picker'

type TabType = "size" | "browser" | "os"

type Tab = {
  id: TabType
  label: string
}

const ICON_MAP: Record<string, any> = {
  // Sizes
  Mobile: Smartphone,
  Desktop: Monitor,
  Laptop: Laptop,
  Tablet: Tablet,
  // Browsers
  Chrome: Chrome,
  Safari: Compass,
  Firefox: Globe,
  Edge: Globe,
  Opera: Globe,
  // OS
  macOS: Apple,
  iOS: Smartphone,
  Android: Smartphone,
  Windows: Monitor,
  Linux: Terminal,
}

const Devices = ({ dateRange }: {
  dateRange?: DateRange
}) => {
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [activeTab, setActiveTab] = useState<TabType>("size")

  const { data, isPending } = useQuery({
    queryKey: ["device", websiteId, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const res = await getDeviceAnalytics(
        websiteId,
        dateRange?.from,
        dateRange?.to
      )
      return res;
    },
    enabled: !!websiteId
  })


  const displayData = useMemo(() => {
    if (!data) return [];
    if (activeTab === "size") return data.devicesSize || []
    if (activeTab === "browser") return data.browsers || []
    if (activeTab === "os") return data.operatingSystems || []
    return []
  }, [data, activeTab])


  const tabList: Tab[] = [
    {
      id: "size",
      label: "Size",
    },
    {
      id: "browser",
      label: "Browser",
    },
    {
      id: "os",
      label: "OS",
    }

  ]


  if (isPending || !data) {
    return <Skeleton className='h-[300px] w-full rounded-xl' />
  }


  return (
    <Card className="py-4 px-6 gap-2">
      <CardHeader className="p-0! pt-2!">
        <CardTitle className='text-sm font-semibold'>Devices</CardTitle>
        <CardAction className="flex gap-2" >
          {tabList.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                `text-xs font-medium pb-1 border-b-2
                transition-all cursor-pointer
                `,
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : `border-transparent text-muted-foreground
                     hover:text-foreground
                  `

              )}
            >
              {tab.label}
            </button>
          ))}
        </CardAction>
      </CardHeader>
      <CardContent className='p-0 pt-3'>
        <div className="flex items-center justify-between
         text-xs text-muted-foreground font-medium mb-1
        ">
          <span>
            {activeTab === "size"
              ? "Screen size"
              : activeTab === "browser"
                ? "Browser"
                : "OS"
            }
          </span>
          <span>Visitors</span>
        </div>
        {displayData.length === 0 ? (
          <div className="text-sm text-muted-foreground
           text-center py-10
          ">
            No {activeTab} data found
          </div>
        ) : displayData?.map((item) => {

          const Icon = ICON_MAP[item.name] || Globe

          return (
            <div
              key={item.name}
              className='relative'
            >
              <div className="flex items-center
              justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium"
                  >{item.visitors.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )
        })

        }
      </CardContent>
    </Card>
  )
}

export default Devices