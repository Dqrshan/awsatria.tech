import { HomePageContent } from "@/components/home/home-page-content";
import { getCommunityStats } from "@/lib/community-stats";

export default async function Home() {
  const stats = await getCommunityStats();
  return <HomePageContent stats={stats} />;
}
