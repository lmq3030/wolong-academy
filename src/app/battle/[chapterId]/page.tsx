import { Suspense } from 'react';
import { chapters } from '@/lib/levels';
import { notFound } from 'next/navigation';
import { BattleClient } from './BattleClient';

export default async function BattlePage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = chapters[chapterId];

  if (!chapter) {
    notFound();
  }

  return (
    <Suspense>
      <BattleClient chapter={chapter} />
    </Suspense>
  );
}
