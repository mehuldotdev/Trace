"use client"
import { getSourceAnalytics } from '@/app/action/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { Globe } from 'lucide-react'
import { useParams } from 'next/navigation'
import { DateRange } from 'react-day-picker'

const TopSources = ({ dateRange }: {
  dateRange?: DateRange
}) => {
  const params = useParams()
  const websiteId = params.websiteId as string;

  const { data, isPending } = useQuery({
    queryKey: ["top-sources", websiteId, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const res = await getSourceAnalytics(
        websiteId,
        dateRange?.from,
        dateRange?.to
      )
      return res;
    },
    enabled: !!websiteId
  })

  const sourcesData = data?.sources || []

  if (isPending && !data) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />
  }


  return (
    <Card className="py-4 px-6 gap-2 min-h-[300px]">
      <CardHeader className='p-0! pt-2!'>
        <CardTitle className="text-sm font-semibold">
          Top Source
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full">
          {sourcesData?.length === 0 ? (
            <div className='text-sm text-muted-foreground text-center
             py-10
            '>
              No source data found
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center
                 justify-between text-xs font-medium
                 text-muted-foreground mb-2
                ">
                <span>Source</span>
                <span>Visitors</span>
              </div>

              {sourcesData?.map((source, i) => {
                return (
                  <div
                    key={source.name}
                    className="flex items-center justify-between
                      "
                  >
                    <div className='flex items-center gap-2
                      flex-1 pr-4
                      '>
                      {source.name !== "Direct / None" &&
                        source.name !== "localhost" ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${source.name}&sz=128`}
                          className="size-4 rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : (
                        <Globe className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-sm truncate">
                        {source.name}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {source.visitors.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopSources