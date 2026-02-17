"use client"
import { useEffect, useState } from 'react'
import { endOfDay, startOfDay, startOfMonth, startOfYear, subDays, subMonths } from 'date-fns'
import { DateRange } from 'react-day-picker'
import MainTopbar from '../_common/main-topbar'
import AnalyticsChart from '../_common/analytics-chart'
import { DateRangePreset } from '@/types/date-preset'
import Locations from '../_common/locations'
import Devices from '../_common/devices'
import TopSources from '../_common/top-sources'
import TopPages from '../_common/top-pages'

const Page = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [activePreset, setActivePreset] = useState<DateRangePreset>("monthToDate")

  useEffect(() => {
    handlePresetSelect("monthToDate")
  }, [])

  const handlePresetSelect = (presetKey: DateRangePreset) => {
    const now = new Date()
    let from: Date
    let to: Date = endOfDay(now)

    switch (presetKey) {
      case "today":
        from = startOfDay(now)
        break;
      case '7days':
        from = startOfDay(subDays(now, 6))
        break;
      case '30days':
        from = startOfDay(subDays(now, 29))
        break;
      case 'monthToDate':
        from = startOfMonth(now)
        break;
      case 'yearToDate':
        from = startOfYear(now)
        break;
      case 'last12Months':
        from = startOfMonth(subMonths(now, 12))
        break;
      default:
        from = startOfMonth(now)
        break;
    }

    setDateRange({ from, to })
    setActivePreset(presetKey)
  }

  return (
    <div className="w-full flex flex-col space-y-6 px-4 md:px-6 lg:px-8">
      <MainTopbar
        activePreset={activePreset}
        onPresetSelect={handlePresetSelect}
      />

      <div className="w-full space-y-6 pb-8">
        <AnalyticsChart dateRange={dateRange} />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <Locations dateRange={dateRange} />
          <Devices dateRange={dateRange} />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <TopSources dateRange={dateRange} />
          <TopPages dateRange={dateRange} />
        </div>
      </div>
    </div>
  )
}

export default Page