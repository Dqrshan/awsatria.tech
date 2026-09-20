export type MeetupEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  startsAt: string | null;
  location: string;
  type: string;
  isOnline: boolean;
  link: string;
  galleryUrl: string;
  description: string;
  image: string | null;
};

const GQL_ENDPOINT = "https://www.meetup.com/gql2";
const GROUP_URLNAME = "aws-sbg-at-atria-inst-of-tech";

const UPCOMING_QUERY = `query getUpcomingGroupEvents($urlname: String!, $afterDateTime: DateTime!) {
  groupByUrlname(urlname: $urlname) {
    id
    events(filter: { afterDateTime: $afterDateTime }) {
      edges {
        node {
          id
          title
          dateTime
          eventUrl
          description
          isOnline
          eventType
          venue { name }
          photoAlbum { id photoCount }
          featuredEventPhoto { baseUrl highResUrl }
          displayPhoto { baseUrl highResUrl }
        }
      }
    }
  }
}`;

const PAST_QUERY = `query getPastGroupEvents($urlname: String!, $beforeDateTime: DateTime!) {
  groupByUrlname(urlname: $urlname) {
    id
    events(filter: { beforeDateTime: $beforeDateTime, status: [PAST] }) {
      edges {
        node {
          id
          title
          dateTime
          eventUrl
          description
          isOnline
          eventType
          venue { name }
          photoAlbum { id photoCount }
          featuredEventPhoto { baseUrl highResUrl }
          displayPhoto { baseUrl highResUrl }
        }
      }
    }
  }
}`;

function formatDateParts(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return {
      date: "Date TBA",
      time: "Time TBA",
    };
  }

  return {
    date: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(date),
  };
}

// Meetup photo albums live at <group-url>/photos/<albumId>/ — the album ID
// differs from the event ID. Without an album, fall back to the group's
// /photos/ page showing all albums.
function buildGalleryUrl(
  eventUrl: string | null | undefined,
  photoAlbumId: string | null | undefined
): string {
  if (eventUrl?.includes("/events/")) {
    return photoAlbumId
      ? eventUrl.replace(/\/events\/.*$/, `/photos/${photoAlbumId}/`)
      : eventUrl.replace(/\/events\/.*$/, "/photos/");
  }
  return "https://www.meetup.com/aws-sbg-at-atria-institute-of-technology/photos/";
}

function mapGqlEvent(node: any): MeetupEvent {  const { date, time } = formatDateParts(node.dateTime);
  
  // Clean up description (remove HTML tags)
  const plainDescription = node.description
    ? node.description
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "Event details will be available on Meetup.";

  return {
    id: node.id,
    title: node.title || "Untitled Event",
    date,
    time,
    startsAt: node.dateTime,
    location: node.venue?.name || (node.isOnline ? "Online Event" : "Venue TBA"),
    type: node.eventType?.toLowerCase() || "meetup",
    isOnline: Boolean(node.isOnline),
    link: node.eventUrl,
    galleryUrl: buildGalleryUrl(node.eventUrl, node.photoAlbum?.id ?? null),
    description: plainDescription,
    image:
      node.featuredEventPhoto?.highResUrl ||
      node.displayPhoto?.highResUrl ||
      node.image?.highResUrl ||
      null,
  };
}

async function fetchMeetupGql(operationName: string, variables: any, query: string) {
  try {
    const response = await fetch(GQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName,
        variables,
        query,
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Meetup GQL request failed: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data?.groupByUrlname?.events?.edges?.map((edge: any) => edge.node) || [];
  } catch (error) {
    console.error(`Error fetching Meetup ${operationName}:`, error);
    return [];
  }
}

export async function getMeetupEvents() {
  const now = new Date().toISOString();
  const nodes = await fetchMeetupGql("getUpcomingGroupEvents", {
    urlname: GROUP_URLNAME,
    afterDateTime: now,
  }, UPCOMING_QUERY);
  return nodes.map(mapGqlEvent);
}

export async function getPastEvents() {
  const now = new Date().toISOString();
  const nodes = await fetchMeetupGql("getPastGroupEvents", {
    urlname: GROUP_URLNAME,
    beforeDateTime: now,
  }, PAST_QUERY);
  return nodes.map(mapGqlEvent);
}

export async function getEventsCatalog() {
  const [upcoming, past] = await Promise.all([getMeetupEvents(), getPastEvents()]);
  
  // Return all events, sorted by date (newest first)
  return [...upcoming, ...past].sort((a, b) => {
    const dateA = a.startsAt ? new Date(a.startsAt).getTime() : 0;
    const dateB = b.startsAt ? new Date(b.startsAt).getTime() : 0;
    return dateB - dateA;
  });
}
