"use client"
import React from "react";
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import {
  ComposableMap,
  Geographies,
  Geography,
  Latitude,
  Longitude,
} from '@vnedyalk0v/react19-simple-maps';
import { getLocationAnalytics } from '@/app/action/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from "next-themes";

// URL to a valid TopoJSON file
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';


const Locations = ({ dateRange }: {
  dateRange?: DateRange
}) => {
  const params = useParams()
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'
  const websiteId = params.websiteId as string


  const [tooltip, setTooltip] = React.useState<{
    name: string
    countryCode: string
    visitors: number
    x: number
    y: number
  } | null>(null)

  const { data, isPending } = useQuery({
    queryKey: ["locations", websiteId, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const res = await getLocationAnalytics(
        websiteId,
        dateRange?.from,
        dateRange?.to
      )
      return res;
    },
    enabled: !!websiteId
  })

  const locationData = data?.locations || []



  if (isPending && !data) {
    return <Skeleton className="h-[300px] w-full" />
  }

  return (
    <Card>
      <CardHeader className="px-6">
        <CardTitle className='text-sm font-semibold'>Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className='w-full h-[300px] -mt-17'>
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 147,
              center: [0 as Longitude, 20 as Latitude]
            }}
            width={800}
            height={300}
            className="w-full h-full"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties?.name
                    || geo.properties?.NAME || ''

                  const countryData = locationData?.find(
                    (s) => s.name === countryName
                      || s.name.includes(countryName)
                      || countryName.includes(s.name)
                  )

                  return (
                    <Geography
                      key={geo.id || geo.properties?.name ||
                        `geo-${geographies.indexOf(geo)}`
                      }
                      geography={geo}
                      onMouseOver={(e) => {
                        if (countryData) {
                          const rect = e.currentTarget.
                            getBoundingClientRect()
                          setTooltip({
                            name: countryData.name,
                            visitors: countryData.visitors,
                            countryCode: countryData.code,
                            x: rect.left + rect.width / 2,
                            y: rect.top
                          })
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        default: {
                          fill: countryData
                            ? "#FA5D19" : (isDark
                              ? "#2D2D2D" : "#FFF0E8"),
                          fillOpacity: countryData ?
                            (countryData.val / 100) * 0.6 + 0.2 : 1,
                          stroke: isDark ? "#404040" : "#E5E5E5",
                          strokeWidth: 0.5,
                          outline: 'none',
                          transition: "all 250ms"
                        },
                        hover: {
                          fill: countryData
                            ? "#D94D13" : (isDark
                              ? "#3D3D3D" : "#FFE0D1"),
                          fillOpacity: countryData
                            ? 0.9 : 1,
                          cursor: countryData ?
                            "pointer" : "default",
                          outline: 'none'
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {tooltip && (
          <div className="fixed z-50 px-3 py-2
          text-sm bg-popover text-popover-foreground
           border border-border rounded-lg shadow-lg
            pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 60}px`,
              transform: "translateX(-50%)"
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {tooltip.countryCode && (
                <img
                  src={`https://flagsapi.com/${tooltip.countryCode}/flat/64.png`}
                  alt=""
                  className="size-4 rounded-sm"
                />
              )}
              <div className="font-semibold">{tooltip.name}</div>
            </div>
            <div className="text-muted-foreground">
              {tooltip.visitors.toLocaleString()} visitors
            </div>
          </div>
        )}

        {!tooltip && (
          <div className="absolute bottom-4 left-6 text-[10px] text-muted-foreground italic">
            Hover over a highlighted country for details
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Locations