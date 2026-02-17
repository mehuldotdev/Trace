import { TraceLogo } from "@/components/trace-logo"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@insforge/nextjs"
import Link from "next/link"

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in duration-500">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <TraceLogo />
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          <SignedOut>
            <SignInButton>
              <Button variant="ghost" size="sm" className="transition-transform hover:scale-105 duration-200">
                Login
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm" className="transition-transform hover:scale-105 duration-200">Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Button variant="outline" size="sm" asChild className="transition-transform hover:scale-105 duration-200">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

export default Header