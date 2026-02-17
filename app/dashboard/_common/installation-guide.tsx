'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, } from 'lucide-react'
import { getScript } from '@/constants/constants'

export const InstallationGuide = ({ domain, siteId }: { domain: string, siteId: string }) => {
  const [copied, setCopied] = useState(false)
  const script = getScript(domain, siteId)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='my-2 rounded-xl border border-border bg-card
        px-4 py-3 flex items-center justify-between'>
      <div>
        <h2 className='text-base font-semibold'>Installation Script</h2>
        <p className='text-xs text-muted-foreground'>Add this script to your website&apos;s &lt;head&gt; section</p>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <pre className='bg-muted px-3 py-2 rounded-lg text-xs
                    border border-border
                    max-w-md overflow-x-auto whitespace-nowrap'>
            <code>{script}</code>
          </pre>
          <Button size='sm' variant='outline' onClick={handleCopy}>
            {copied ? <><Check className='h-3 w-3 mr-1' />Copied</>
              : <><Copy className='h-3 w-3 mr-1' />Copy</>}
          </Button>
        </div>
      </div>
    </div>
  )
}