"use client"
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { getWebsites } from '@/app/action/website'
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Check, ChevronDown, Code, Globe, Plus, Search, XIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import AddWebsiteDialog from './add-website-dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { endOfDay, startOfDay, startOfMonth, startOfYear, subDays, subMonths } from 'date-fns'
import { InstallationGuide } from './installation-guide'
import { DateRangePreset } from '@/types/date-preset'
import { getLiveVisitors } from '@/app/action/analytics'

type Props = {
  activePreset: DateRangePreset
  onPresetSelect: (preset: DateRangePreset) => void
}


const presets: { key: DateRangePreset, label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: 'Last 7 days' },
  { key: '30days', label: 'Last 30 days' },
  { key: 'monthToDate', label: 'Month to Date' },
  { key: 'yearToDate', label: 'Year to Date' },
  { key: 'last12Months', label: 'Last 12 months' },
]


const MainTopbar = ({
  activePreset,
  onPresetSelect
}: Props) => {
  const { websiteId } = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [openWebsite, setOpenWebsite] = useState(false)

  const [showInstallGuide, setShowInstallGuide] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["websites"],
    queryFn: async () => {
      const res = await getWebsites()
      if (res?.error) throw new Error(res.error);
      return res.websites || []
    }
  })

  const { data: liveVisitors, isPending } = useQuery({
    queryKey: ["live-visitors", websiteId],
    queryFn: async () => {
      const res = await getLiveVisitors(
        websiteId as string
      )
      return res.liveVisitors || 0
    },
    refetchInterval: 30000,
    enabled: !!websiteId
  })

  const currentWebsite = data?.find(
    (w: any) => w.id === websiteId) || data?.[0]


  const handlePresetSelect = (presetKey: DateRangePreset) => {
    onPresetSelect(presetKey)
    setOpen(false)
  }



  return (
    <>
      <div className="w-ful flex h-12 items-center
      justify-between gap-4
      ">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isLoading ?
                <Skeleton className="h-4 w-24" /> : (
                  <Button variant="ghost" className="gap-2 h-9 border-0 hover:bg-primary/10! text-foreground!">
                    <span className="flex items-center gap-2">
                      <Globe />
                      <span className="font-medium">
                        {currentWebsite?.domain || "Select website"}
                      </span>
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start"
              className='w-56'
            >
              <DropdownMenuLabel
                className="text-muted-foreground
              text-xs uppercase
              "
              >Websites</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoading ? <Spinner />
                : data?.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => router.push(`/dashboard/${item.id}`)}
                    className="cursor-pointer flex justify-between items-center"
                  >

                    <span
                      className={cn("",
                        item.id === websiteId
                          ? "font-semibold" : ""
                      )}
                    >
                      {item.domain}
                    </span>
                    {item.id === websiteId && <Check
                      className="size-4"
                    />}
                  </DropdownMenuItem>
                ))}
              {data?.length === 0 && (
                <div>No Websites found</div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setOpenWebsite(true)}
                className="cursor-pointer gap-2 text-primary focus:text-primary focus:bg-primary/5 font-medium"
              >
                <Plus className="szie-4" />
                <span>Add new website</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Current Visitors */}
          <div className="flex items-center gap-2 text-sm">
            <div className="size-2 rounded-full
           bg-green-500 animate-pulse"  />

            {isPending ? (
              <Skeleton className="h-4 w-12" />
            ) : (
              <span className="text-foreground">
                {liveVisitors || 0} current vistors</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showInstallGuide
              ? "secondary" : "ghost"}
            onClick={() => setShowInstallGuide(!showInstallGuide)}

          >
            {showInstallGuide ? <XIcon className="size-4" /> :
              <Code className="size-4" />}
            <span>{showInstallGuide ? "Close" : "Install script"}</span>
          </Button>

          <span className='flex items-center text-foreground gap-2'>
            <Search className="size-4" />
            Filter
          </span>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className=' h-9 border-0
                bg-secondary! text-foreground!
                '
              >
                <CalendarIcon className="size-4" />
                <span>
                  {presets?.find(p => p.key === activePreset)?.label || "Select Range"}
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2"
              align="end"
            >
              <div className="space-y-1">
                {presets?.map((preset) => (
                  <Button
                    key={preset.key}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      activePreset === preset.key ?
                        "bg-primary/10 text-primary"
                        : ""
                    )}
                    onClick={() => handlePresetSelect(preset.key)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>



      </div>

      <AddWebsiteDialog open={openWebsite}
        onOpenChange={setOpenWebsite} />

      {showInstallGuide && (
        <InstallationGuide
          domain={currentWebsite?.domain}
          siteId={currentWebsite?.site_id}

        />

      )}

    </>
  )
}

export default MainTopbar