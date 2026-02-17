import { Button } from "@/components/ui/button";
import { SignUpButton } from "@insforge/nextjs";
import Link from "next/link";

const Hero = () => {
    return (
        <section className="w-full bg-gradient-to-b from-muted/50 via-muted/30 to-background py-20 md:py-32 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Premium web intelligence, simplified.
                        </span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        Trace is powerful, intuitive and lightweight analytics.
                        No cookies, just insights.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <SignUpButton>
                        <Button size="lg" className="w-full sm:w-auto transition-transform hover:scale-105 duration-200">
                            Get Started for Free
                        </Button>
                    </SignUpButton>
                </div>
            </div>
        </section>
    )
}

export default Hero;