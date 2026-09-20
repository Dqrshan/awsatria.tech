"use client";

import { motion } from "framer-motion";
import { ExternalLink, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { MeetupEvent } from "@/lib/meetup-events";
import { MarkdownText } from "@/lib/markdown";
import { EntranceFade, EntranceLines } from "@/components/ui/entrance";
import AsciiTorus from "@/components/ui/ascii-torus";

type EventsPageContentProps = {
  events: MeetupEvent[];
};

type EventFilter = "upcoming" | "past" | "all";
type DateParts = {
  year: number;
  month: number;
  day: number;
};

const EVENT_TIME_ZONE = "Asia/Kolkata";

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function getDateParts(date: Date, timeZone: string): DateParts | null {
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) return null;
  return { year, month, day };
}

function compareDateParts(a: DateParts, b: DateParts) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function EventsPageContent({ events }: EventsPageContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<EventFilter>("upcoming");
  const today = getDateParts(new Date(), EVENT_TIME_ZONE);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (eventFilter === "all") return true;

    const eventDate = event.startsAt ? getDateParts(new Date(event.startsAt), EVENT_TIME_ZONE) : null;
    if (!eventDate || !today) return eventFilter !== "past";

    const isPast = compareDateParts(eventDate, today) < 0;
    return eventFilter === "past" ? isPast : !isPast;
  });

  return (
    <div className="bg-white min-h-screen pt-17.5">
      {/* Header Section */}
      <section className="py-20 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none -z-10" />
        <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-1/3 opacity-50 pointer-events-none items-center justify-center">
          <AsciiTorus size={400} />
        </div>
        <div className="container px-8 mx-auto">
          <EntranceFade delay={0}>
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
              Our Calendar
            </span>
          </EntranceFade>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-secondary mb-8">
            <EntranceLines
              baseDelay={0.08}
              lines={["Workshops &", "Build Nights"]}
            />
          </h1>
          <EntranceFade delay={0.45}>
            <p className="text-xl text-secondary/60 font-medium leading-relaxed max-w-2xl">
              Join us for hands-on sessions, technical workshops, and community
              meetups where we build the future on AWS.
            </p>
          </EntranceFade>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 border-b border-border bg-slate-50/50">
        <div className="container px-8 mx-auto flex flex-col md:flex-row gap-8 justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search community events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-border focus:border-primary focus:ring-0 text-sm font-bold uppercase tracking-widest transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["upcoming", "past", "all"] as EventFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setEventFilter(filter)}
                className={`px-6 py-3 text-[0.65rem] font-black uppercase tracking-widest transition-all active:scale-[0.98] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                  eventFilter === filter
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-secondary border-border hover:border-secondary"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20">
        <div className="container px-8 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, i) => {
                const eventDate = event.startsAt
                  ? getDateParts(new Date(event.startsAt), EVENT_TIME_ZONE)
                  : null;
                const isPast = Boolean(
                  eventDate && today && compareDateParts(eventDate, today) < 0
                );
                return (
                  <MeetupEventCard
                    key={event.id}
                    event={event}
                    index={i}
                    isPast={isPast}
                  />
                );
              })
            ) : (
              <div className="col-span-full py-32 text-center border border-dashed border-border">
                <p className="text-secondary/50 font-black uppercase tracking-[0.2em]">
                  No events found
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MeetupEventCard({
  event,
  index,
  isPast,
}: {
  event: MeetupEvent;
  index: number;
  isPast: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  // Meetup hosts each event's photo gallery at <event-url>/photos/.
  const galleryLink = `${event.link.replace(/\/?$/, "/")}photos/`;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={revealVariants}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="aspect-video bg-slate-100 border border-border overflow-hidden mb-8 relative">
        {!imgError && event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-primary/20 group-hover:bg-primary/10 transition-colors">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-primary mb-2 opacity-70">
              AWS Student Builders
            </span>
            <span className="text-xl font-black uppercase tracking-tighter text-secondary leading-none max-w-62.5">
              {event.title}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 bg-white px-4 py-2 border border-border text-[0.6rem] font-black uppercase tracking-widest shadow-sm">
          <span
            aria-hidden="true"
            className={`w-1.5 h-1.5 rounded-full ${
              event.isOnline ? "bg-sky-500" : "bg-primary"
            }`}
          />
          {event.isOnline ? "Online" : "In-Person"}
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        <span className="text-[0.7rem] font-black uppercase tracking-widest text-primary">
          {event.date} • {event.time}
        </span>
        <h3 className="text-3xl font-black tracking-tighter text-secondary group-hover:text-primary transition-colors uppercase leading-none">
          {event.title}
        </h3>
      </div>
      <div className="text-secondary/70 font-medium mb-8 line-clamp-3 leading-relaxed md-desc">
        <MarkdownText text={event.description} />
      </div>
      <div className="flex items-center gap-3 mb-8 text-[0.65rem] font-bold uppercase tracking-widest text-secondary/60">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        {event.location}
      </div>
      {isPast ? (
        <a
          href={galleryLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View photo gallery for ${event.title} on Meetup`}
          className="inline-flex items-center gap-4 px-8 py-4 border border-secondary text-secondary text-[0.7rem] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          View Gallery <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`RSVP for ${event.title} on Meetup`}
          className="inline-flex items-center gap-4 px-8 py-4 border border-secondary text-secondary text-[0.7rem] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          RSVP ON MEETUP <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}
