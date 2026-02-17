"use client"
import React from 'react'
import { getPageAnalytics } from '@/app/action/analytics'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

type TabType = "entry" | "exit"

type TabsType = {
  id: TabType
  label: string
}

const TopPages = ({ dateRange }: {
  dateRange?: DateRange
}) => {
  const params = useParams()
  const websiteId = params.websiteId as string
  const [activeTab, setActiveTab] = React.useState<TabType>('entry')

  const { data, isPending } = useQuery({
    queryKey: ["top-pages", websiteId, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const res = await getPageAnalytics(
        websiteId,
        dateRange?.from,
        dateRange?.to
      )
      return res;
    },
    enabled: !!websiteId
  })

  const displayData = React.useMemo(() => {
    if (!data) return [];
    if (activeTab === "entry") return data.entryPages;
    if (activeTab === "exit") return data.exitPages;
    return []
  }, [data, activeTab])

  const tabs: TabsType[] = [
    { id: "entry", label: "Entry Pages" },
    { id: "exit", label: "Exit Pages" }
  ]

  if (isPending && !data) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />
  }


  return (
    <Card className="py-4 px-6 gap-2">
      <CardHeader className="p-0! pt-2!">
        <CardTitle className='text-sm font-semibold'>Top Pages</CardTitle>
        <CardAction className="flex gap-2" >
          {tabs.map((tab) => (
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
      <CardContent className='p-0'>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium mb-2">
            <span>{activeTab === 'entry' ? 'Entry Page' : 'Exit Page'}</span>
            <span>Visitors</span>
          </div>
          {displayData?.length === 0 ? (
            <div className="text-sm text-muted-foreground
           text-center py-10
          ">
              No  page data found
            </div>
          ) : displayData?.map((page) => {
            return (
              <div
                key={page.path}
                className="relative"
              >
                <div className="flex items-center
                justify-between py-2 px-1">
                  <span className="text-sm text-muted-foreground
                   truncate max-w-[350px]">
                    {page.path === "" ? "/" : page.path}
                  </span>
                  <span className="text-sm font-medium">
                    {page.visitors.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopPages