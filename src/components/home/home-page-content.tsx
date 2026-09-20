"use client";

import React from "react";
import { motion } from "framer-motion";
import ArtificialHero from "@/components/ui/artificial-hero";
import type { CommunityStats } from "@/lib/community-stats";
import AsciiSphere from "@/components/ui/ascii-sphere";
import CloudBackground from "@/components/ui/cloud-background";
import NetworkGrid from "@/components/ui/network-grid";
import AsciiCodeRain from "@/components/ui/ascii-code-rain";
import Image from "next/image";
import Link from "next/link";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HomePageContent({ stats }: { stats: CommunityStats }) {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <ArtificialHero stats={stats} />

      {/* Community Mission Section */}
      <section className="relative bg-secondary py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <CloudBackground />
        </div>
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-1/2 opacity-80 pointer-events-none items-center justify-center">
          <RotatingEarth width={500} height={500} />
        </div>
        <div className="container relative z-10 px-8 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
          >
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-primary mb-6 block">
              Our Mission
            </span>
            <h2 className="text-4xl sm:text-[6vw] lg:text-[4vw] font-black leading-[1.1] tracking-tighter text-white uppercase mb-4 max-w-3xl">
              Building the <br /> cloud talent <br /> of{" "}
              <span className="text-primary">tomorrow</span>.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <NetworkGrid />
        </div>
        <div className="container px-8 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
            className="mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] text-secondary">
              A community where <br /> curiosity meets <br />{" "}
              <span className="text-primary">capability</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Card 1: 3D Cylinder */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="aspect-square bg-slate-100 rounded-2xl md:rounded-4xl flex items-center justify-center p-4 md:p-10 border border-border/50"
            >
              <div className="w-full h-full bg-primary rounded-xl md:rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.2)] md:shadow-[0_20px_50px_rgba(79,70,229,0.3)] transform -rotate-3 flex items-center justify-center text-white font-black">
                <Image
                  src="/AWS.svg"
                  alt="AWS Logo"
                  width={64}
                  height={64}
                  className="w-12 h-12 md:w-20 md:h-20"
                />
              </div>
            </motion.div>

            {/* Card 2: Team Photo */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="aspect-square bg-slate-200 rounded-2xl md:rounded-4xl overflow-hidden group border border-border/50"
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                alt="Community Builders collaborating"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>

            {/* Card 3: Code Icon */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="aspect-square bg-primary rounded-2xl md:rounded-4xl flex items-center justify-center p-4 md:p-10 shadow-[0_20px_40px_rgba(79,70,229,0.1)] md:shadow-[0_20px_40px_rgba(79,70,229,0.2)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-12 h-12 md:w-20 md:h-20"
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </motion.div>

            {/* Card 4: Code Rain */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="aspect-square bg-slate-50 rounded-2xl md:rounded-4xl border border-border flex items-center justify-center overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-20">
                <AsciiCodeRain />
              </div>
              <div className="relative z-10 text-primary font-black uppercase tracking-widest text-xs md:text-sm text-center px-2">
                Deployment
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Be with your people Section */}
      <section className="py-24 bg-white border-t border-border">
        <div className="container px-8 mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-square bg-slate-50 rounded-[2rem] md:rounded-[3rem] border border-border overflow-hidden relative group max-w-lg mx-auto w-full"
          >
            <div className="absolute inset-0 z-0">
              <AsciiSphere size={500} opacity={0.6} />
            </div>
            <div className="absolute inset-0 z-10 bg-linear-to-t from-white/20 to-transparent pointer-events-none" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
          >
            <div className="mb-12">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
                Our Culture
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-secondary mb-6 leading-none">
                Be with your people
              </h2>
              <p className="text-base sm:text-lg text-secondary/70 font-medium leading-relaxed max-w-lg">
                Connect with fellow student developers who are passionate about
                the cloud. Share ideas, collaborate on projects, and grow
                together in a supportive environment designed for builders.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border/50">
              <div>
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-primary mb-2 block">
                  Monthly
                </span>
                <p className="text-2xl sm:text-3xl font-black tracking-tighter text-secondary">
                  MEETUPS
                </p>
              </div>
              <div>
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-primary mb-2 block">
                  Hands-on
                </span>
                <p className="text-2xl sm:text-3xl font-black tracking-tighter text-secondary">
                  WORKSHOPS
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-24 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <NetworkGrid />
        </div>
        <div className="container px-8 mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
          >
            <h2 className="text-4xl sm:text-[5vw] font-black tracking-tighter leading-none mb-12 uppercase">
              Ready to <br /> start building?
            </h2>
            <Link
              href={"/join"}
              target={"_blank"}
              rel="noopener noreferrer"
              className="inline-block px-8 sm:px-16 py-4 sm:py-6 bg-white text-primary font-black uppercase tracking-widest text-sm sm:text-lg hover:bg-slate-100 transition-all rounded-lg focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none"
            >
              Become a Member Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
