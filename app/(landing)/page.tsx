import { AppCard } from "./_common/app-card";
import Header from "./_common/header";
import Hero from "./_common/hero";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <section className="pt-24 md:pt-36 pb-2 px-4 bg-background">
          <AppCard />
        </section>
      </main>
    </div>
  );
}