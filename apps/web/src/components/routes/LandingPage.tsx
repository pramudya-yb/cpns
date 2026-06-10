import { Link } from "@tanstack/react-router";
import { Button } from "@pram/ui/components/button";
import { Card, CardContent } from "@pram/ui/components/card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";




export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--warm-cream)] flex flex-col font-sans selection:bg-[var(--matcha-300)] selection:text-[var(--clay-black)]">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 md:px-12 lg:px-16 flex items-center justify-between max-w-7xl mx-auto z-50 sticky top-0 bg-[var(--warm-cream)] border-b-2 border-[var(--oat-border)]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Pram Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
          <span className="font-headline font-semibold text-2xl tracking-[-0.64px] text-[var(--clay-black)] hidden sm:block">Pram</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">

          <Link to="/login">
            <Button variant="ghost" className="text-[var(--clay-black)] font-semibold hover:bg-[var(--oat-light)] rounded-[12px] text-lg px-4 sm:px-6 h-12">
              Masuk
            </Button>
          </Link>
          <Link to="/login">
            <Button className="bg-[var(--clay-black)] text-[var(--pure-white)] hover:bg-[var(--dark-charcoal)] rounded-[24px] h-12 px-6 sm:px-8 font-semibold text-lg clay-hover clay-shadow">
              Mulai Gratis
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center w-full relative">
        {/* HUGE HERO SECTION */}
        <section className="w-full px-6 md:px-12 lg:px-16 flex flex-col xl:flex-row items-center justify-between gap-12 lg:gap-16 relative max-w-[1440px] mx-auto">
          <div className="flex-1 text-center xl:text-left space-y-8 z-10 w-full max-w-[800px] xl:max-w-none">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--matcha-300)] border-2 border-[var(--matcha-800)] text-[var(--clay-black)] uppercase-label shadow-sm mx-auto xl:mx-0 transform -rotate-2">
              <MaterialIcon name="auto_awesome" className="text-sm" />
              <span>Didukung oleh AI Generative</span>
            </div>
            
            <h1 className="text-[50px] md:text-[70px] lg:text-[85px] font-headline font-semibold text-[var(--clay-black)] tracking-[-2.4px] lg:tracking-[-3.2px] leading-[1.0] lg:leading-[0.95] drop-shadow-sm">
              Platform Latihan Bahasa Cerdas.
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--warm-charcoal)] max-w-2xl mx-auto xl:mx-0 leading-relaxed">
              Persiapkan dirimu untuk ujian bahasa asing dengan latihan soal interaktif, mock test realistis, dan AI Generator super cepat.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center xl:justify-start pt-6">
              <Link to="/login" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[var(--pure-white)] text-[var(--clay-black)] rounded-[24px] h-[64px] px-8 text-xl font-semibold border-2 border-[var(--oat-border)] clay-shadow clay-hover">
                  Mulai Latihan Sekarang
                </Button>
              </Link>
            </div>
          </div>
          
          {/* MASSIVE HERO IMAGE WITH FLOATING ASSETS - SIDE BY SIDE ON DESKTOP */}
          <div className="flex-1 w-full relative group mt-8 xl:mt-0 flex justify-center xl:justify-end">
            <div className="relative w-full max-w-[650px] lg:max-w-[750px]">
              <img 
                src="/hero_img.png" 
                alt="Pram Dashboard Preview" 
                className="w-full h-auto object-contain transform transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative z-10"
              />
              {/* Variatif Floating Elements */}
              <div className="absolute -top-8 -left-8 md:-top-12 md:-left-12 w-32 md:w-40 h-auto z-20 hidden sm:block">
                <img src="/generateai.png" alt="floating element" className="w-full h-auto drop-shadow-2xl" />
              </div>
              <div className="absolute -bottom-8 -right-8 md:-bottom-12 md:-right-12 w-40 md:w-48 h-auto z-20 hidden sm:block">
                <img src="/mocktest.png" alt="floating element" className="w-full h-auto drop-shadow-2xl" />
              </div>
              <div className="absolute top-[40%] -left-16 md:-left-24 w-24 md:w-32 h-auto z-0 hidden lg:block opacity-80 blur-[1px]">
                <img src="/progress.png" alt="floating element" className="w-full h-auto drop-shadow-xl" />
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
