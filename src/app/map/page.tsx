import { chapters } from '@/lib/levels';
import { ThreeKingdomsMap } from '@/components/map/ThreeKingdomsMap';

export const metadata = {
  title: '征途地图 - 卧龙学堂',
  description: '三国征途地图 — 完成关卡，一统三国！',
};

export default function MapPage() {
  const chapterList = Object.values(chapters).sort((a, b) => {
    // Sort by act first, then by id
    if (a.act !== b.act) return a.act - b.act;
    return a.id.localeCompare(b.id);
  });

  return <ThreeKingdomsMap chapters={chapterList} />;
}
