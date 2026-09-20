"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import AsciiHorizon from "./ascii-horizon";
import { EntranceFade, EntranceLines } from "./entrance";
import type { CommunityStats } from "@/lib/community-stats";

export default function ArtificialHero({ stats }: { stats: CommunityStats }) {
  // Mount the canvas only after the text entrance finishes, so the
  // heavy per-frame ASCII render never competes with the transition.
  const [artReady, setArtReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setArtReady(true), 1300);
    return () => window.clearTimeout(id);
  }, []);

  const formatCount = (n: number) => n.toLocaleString("en-IN");

  return (
    <section className="relative pt-17.5 bg-white border-b border-border overflow-hidden min-h-[92dvh] flex flex-col">
      {/* Background gradient washes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-48 right-[-12%] w-[62rem] h-[62rem]"
          style={{
            background:
              "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[-25%] left-[-12%] w-[54rem] h-[54rem]"
          style={{
            background:
              "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-[36rem] h-[36rem]"
          style={{
            background:
              "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* ASCII horizon drifting behind the type */}
      <div
        aria-hidden="true"
        className={`hidden lg:flex absolute -right-32 top-1/2 -translate-y-1/2 w-[56rem] h-[36rem] items-center justify-center pointer-events-none overflow-hidden transition-opacity duration-1000 ${
          artReady ? "opacity-70" : "opacity-0"
        }`}
      >
        {artReady && <AsciiHorizon bands={9} opacity={0.7} />}
      </div>

      <div className="container mx-auto px-8 flex-1 flex flex-col justify-center py-12 lg:py-16 relative z-10">
        <h1 className="font-black uppercase text-secondary tracking-tighter leading-[0.9]">
          {/* Mobile: three locked lines */}
          <span className="block text-[9.5vw] lg:hidden">
            <EntranceLines
              lines={[
                "AWS Student",
                "Builder Group",
                <span key="atria" className="text-primary">
                  @ Atria
                </span>,
              ]}
            />
          </span>
          {/* Desktop: two locked lines */}
          <span className="hidden lg:block text-[6.4vw] 2xl:text-[6rem]">
            <EntranceLines
              lines={[
                "AWS Student Builder",
                <span key="group">
                  Group <span className="text-primary">@ Atria</span>
                </span>,
              ]}
            />
          </span>
        </h1>

        <EntranceFade delay={0.55} className="mt-10 lg:mt-14 max-w-xl">
          <p className="text-base sm:text-lg font-medium leading-relaxed text-secondary/80">
            The official AWS Student Builder Group at Atria I.T. Join
            developers and cloud enthusiasts building on the most comprehensive
            cloud.
          </p>
          <p className="mt-5 text-sm sm:text-base font-bold text-secondary">
            {formatCount(stats.total)}+ members building together
          </p>
          <Link
            href={"/whatsapp"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 w-fit px-8 sm:px-10 py-3.5 sm:py-4 border-2 border-primary text-primary text-xs sm:text-[0.8rem] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:outline-none"
          >
            Join the Community <ArrowUpRight className="w-4 h-4" />
          </Link>
        </EntranceFade>
      </div>

      {/* Spec strip */}
      <div className="container mx-auto px-8 relative z-10">
        <EntranceFade
          delay={0.75}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-8 border-t border-border/70 py-6 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-secondary/60"
        >
          <span>Atria Institute of Technology</span>
          <span>Bengaluru, India</span>
          <span>Workshops · Build Nights · Certifications</span>
        </EntranceFade>
      </div>
    </section>
  );
}
