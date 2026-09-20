// Community size aggregated from free, keyless public sources.
//
// OSINT status per platform (verified 2026-09-20):
// - Meetup: member count is rendered in the public group HTML
//   ("345 members</a>"). No auth needed.
// - Instagram: the public /<handle>/embed/ page embeds
//   "followers_count":147 in its payload. No auth needed.
// - LinkedIn: the public company page HTML contains
//   "208 followers". No auth needed.
// - WhatsApp: invite pages expose NO member count publicly, and there is
//   no free API for it. Set WHATSAPP_MEMBERS in your environment
//   (or update WHATSAPP_MEMBERS_FALLBACK below) whenever it changes.
//
// All network fetches are cached for REVALIDATE_SECONDS so the hero never
// hammers these pages. Every source degrades to its *_FALLBACK value on
// failure, so the hero always renders a number.

export type CommunityStats = {
  meetup: number;
  whatsapp: number;
  instagram: number;
  linkedin: number;
  total: number;
};

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours
const FETCH_TIMEOUT_MS = 10_000;

const MEETUP_SLUGS = [
  "aws-sbg-at-atria-institute-of-technology", // canonical slug
  "aws-sbg-at-atria-inst-of-tech", // legacy slug (still used for events GQL)
];
const INSTAGRAM_HANDLE = "awssbg.atria";
const LINKEDIN_COMPANY_SLUG = "aws-sbg-at-atria-inst-of-tech";

// Last-known-good values (measured 2026-09-20). Used only when a live
// fetch fails, so the hero never shows 0/missing data.
const FALLBACKS = {
  meetup: 345,
  instagram: 147,
  linkedin: 208,
};

// WhatsApp has no public count — update this when the group size changes,
// or set the WHATSAPP_MEMBERS env var (takes precedence).
const WHATSAPP_MEMBERS_FALLBACK = 410;

const DESKTOP_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function parseFirstInt(text: string, regex: RegExp): number | null {
  const match = regex.exec(text);
  if (!match?.[1]) return null;
  const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
  return Number.isFinite(value) ? value : null;
}

async function fetchText(url: string, userAgent: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": userAgent, Accept: "text/html" },
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getMeetupMembers(): Promise<number> {
  for (const slug of MEETUP_SLUGS) {
    const html = await fetchText(`https://www.meetup.com/${slug}/`, DESKTOP_UA);
    if (!html) continue;
    const count = parseFirstInt(html, /(\d[\d,]*)\s*members<\/a>/);
    if (count !== null) return count;
  }
  return FALLBACKS.meetup;
}

async function getInstagramFollowers(): Promise<number> {
  const html = await fetchText(
    `https://www.instagram.com/${INSTAGRAM_HANDLE}/embed/`,
    MOBILE_UA
  );
  if (html) {
    const count = parseFirstInt(html, /followers_count\\?"\s*:\s*(\d+)/);
    if (count !== null) return count;
  }
  return FALLBACKS.instagram;
}

async function getLinkedinFollowers(): Promise<number> {
  const html = await fetchText(
    `https://www.linkedin.com/company/${LINKEDIN_COMPANY_SLUG}`,
    DESKTOP_UA
  );
  if (html) {
    const count = parseFirstInt(html, /(\d[\d,]*)\s*followers/);
    if (count !== null) return count;
  }
  return FALLBACKS.linkedin;
}

function getWhatsappMembers(): number {
  const fromEnv = Number.parseInt(process.env.WHATSAPP_MEMBERS ?? "", 10);
  if (Number.isFinite(fromEnv) && fromEnv >= 0) return fromEnv;
  return WHATSAPP_MEMBERS_FALLBACK;
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const [meetup, instagram, linkedin] = await Promise.all([
    getMeetupMembers(),
    getInstagramFollowers(),
    getLinkedinFollowers(),
  ]);
  const whatsapp = getWhatsappMembers();
  return {
    meetup,
    whatsapp,
    instagram,
    linkedin,
    total: meetup + whatsapp + instagram + linkedin,
  };
}
