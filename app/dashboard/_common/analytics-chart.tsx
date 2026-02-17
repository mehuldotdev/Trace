"use client"


import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DateRange } from "react-day-picker"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getAnalytics } from "@/app/action/analytics"
import { eachDayOfInterval, format, startOfDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TrendingUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"


const chartConfig = {
  uniqueVisitors: {
    label: "Unique Visitors",
    color: "var(--primary)",
  },
  totalPageviews: {
    label: "Total Pageviews",
    color: "var(--primary)",
  },
  averageActiveTime: {
    label: "Average Active Time",
    color: "var(--primary)",
  },
  bounceRate: {
    label: "Bounce Rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig

type MetricKey = keyof typeof chartConfig

type Metric = {
  key: MetricKey
  label: string
  value: string
}

const AnalyticsChart = ({ dateRange }: {
  dateRange?: DateRange
}) => {
  const params = useParams()
  const websiteId = params.websiteId as string;
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>("uniqueVisitors")

  const { data, isPending } = useQuery({
    queryKey: ["analytics", websiteId, dateRange?.from, dateRange?.to
    ],
    queryFn: async () => {
      const res = await getAnalytics(websiteId,
        dateRange?.from, dateRange?.to
      )
      return res;
    }
  })

  const isEmpty = !data?.chartData || data?.chartData?.length === 0;


  const chartData = React.useMemo(() => {
    const rawData = data?.chartData || [];
    if (!dateRange?.from || !dateRange?.to) return rawData;

    try {
      const days = eachDayOfInterval({
        start: startOfDay(dateRange.from),
        end: startOfDay(dateRange.to),
      })

      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const existing = rawData.find((d: any) => d.date === dateStr);

        return existing || {
          date: dateStr,
          uniqueVisitors: 0,
          totalPageviews: 0,
          averageActiveTime: 0,
        }
      })
    } catch (error) {
      return rawData;
    }
  }, [data?.chartData, dateRange])

  const rawMetrics = data?.metrics as any;
  const metrics: Metric[] = [
    {
      key: "uniqueVisitors",
      label: "UNIQUE VISITORS",
      value: rawMetrics?.uniqueVisitors?.toLocaleString() || "0",
    },
    {
      key: "totalPageviews",
      label: "TOTAL PAGEVIEWS",
      value: rawMetrics?.totalPageviews?.toLocaleString() || "0",
    },
    {
      key: "averageActiveTime",
      label: "AVERAGE ACTIVE TIME",
      value: `${rawMetrics?.averageActiveTime || 0}s`,
    },
    {
      key: "bounceRate",
      label: "BOUNCE RATE",
      value: `${rawMetrics?.bounceRate || 0}%`,
    },
  ]

  if (isPending && !data) {
    return <Skeleton className="lg:h-[480px] h-[350px] w-full rounded-xl" />
  }


  return (
    <Card className="p-4 relative overflow-hidden">
      {isEmpty && !isPending && (
        <div className="absolute inset-0 z-10 flex flex-col
         items-center justify-center bg-background/40
         backdrop-blur-[2px]
        ">
          <div className="bg-background border border-border
             px-6 py-3 shadow-lg flex flex-col items-center
             gap-2 rounded-xl
              ">
            <span className="text-sm font-semibold text-foreground">No data yet</span>
            <p className="text-xs text-muted-foreground text-center">S
              tart tracking your website to see analytics here.</p>
          </div>
        </div>
      )}
      <CardHeader className="flex flex-row items-stretch
      sm:items-start p-0!
      ">
        {metrics?.map((metric, i) => (
          <React.Fragment key={metric.key}>
            <button
              data-active={activeMetric === metric.key}
              className={cn(`relative flex flex-col flex-[0.15]!
                justify-center gap-1
              px-4 py-4 text-left transition-colors cursor-pointer group hover:bg-primary/5`,
                metric.key === "bounceRate" && "pointer-events-none"
              )}
              onClick={() => {
                if (metric.key === "bounceRate") {
                  return
                }
                setActiveMetric(metric.key)
              }}
            >
              <span className="text-[10px]
              text-muted-foreground
              uppercase font-bold
              group-hover:text-primary
              group-data-[active=true]:text-primary
             transition-colors
              ">
                {metric.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold
                tracking-tight">
                  {metric.value}
                </span>
                <span className={cn(
                  "text-xs flex items-center gap-0.5",
                  "text-green-600"
                )}>
                  <TrendingUp className="size-3" />
                  0%
                </span>
              </div>
            </button>
            <Separator orientation="vertical"
              className="my-2! bg-border h-15! self-center
              last:hidden
              "
            />
          </React.Fragment>
        ))}
      </CardHeader>
      <CardContent className="pr-3 pl-0 pt-0 pb-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -5,
              right: 0,
              top: 48,
              bottom: 0
            }}

          >
            <defs>
              <linearGradient id="fillMetric"
                x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.002}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}k`
                }
                return value
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={activeMetric}
              type="natural"
              fill="url(#fillMetric)"
              fillOpacity={1}
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default AnalyticsChart