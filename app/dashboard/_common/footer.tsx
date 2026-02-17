import { TraceLogo } from '@/components/trace-logo'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='w-full py-4 border-t border-border flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <Link href="/">
          <TraceLogo showText={false} className='opacity-60' />
        </Link>
        <span className='text-sm text-muted-foreground'>© 2026 Trace</span>
      </div>
      <span className='text-sm text-muted-foreground'>Privacy Policy</span>
    </footer>
  )
}

export default Footer