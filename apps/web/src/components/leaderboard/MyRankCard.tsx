import { Card, CardContent } from "@labas/ui/components/card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface MyRankData {
  rank: number | null;
  totalParticipants: number;
  totalScore: number;
  avgScorePct: number;
  attemptsCount: number;
}

export function MyRankCard({
  data,
  isLoading,
}: {
  data: MyRankData | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="sticky bottom-20 mt-4 clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[var(--oat-light)] animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-[var(--oat-light)] animate-pulse rounded" />
              <div className="h-3 w-24 bg-[var(--oat-light)] animate-pulse rounded" />
            </div>
            <div className="h-8 w-16 bg-[var(--oat-light)] animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.rank === null) {
    return (
      <Card className="sticky bottom-20 mt-4 clay-shadow bg-[var(--pure-white)] border-2 border-[var(--matcha-400)] rounded-[var(--radius-xl)]">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[var(--matcha-300)] flex items-center justify-center shrink-0">
              <MaterialIcon name="person" className="text-xl text-[var(--matcha-800)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-headline font-bold text-[var(--clay-black)]">
                Posisimu
              </p>
              <p className="text-xs text-[var(--warm-charcoal)]">
                Belum ada data untuk periode ini. Mulai latihan untuk naik klasemen!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky bottom-20 mt-4 clay-shadow bg-[var(--matcha-100)] border-2 border-[var(--matcha-400)] rounded-[var(--radius-xl)]">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[var(--matcha-300)] flex items-center justify-center shrink-0">
            <span className="text-sm font-headline font-extrabold text-[var(--matcha-800)]">
              {data.rank}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-headline font-bold text-[var(--clay-black)]">
              Posisimu: #{data.rank} dari {data.totalParticipants}
            </p>
            <p className="text-xs text-[var(--warm-charcoal)]">
              {data.avgScorePct}% avg &middot; {data.attemptsCount} latihan
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-headline font-extrabold text-[var(--clay-black)]">
              {data.totalScore}
            </p>
            <p className="text-xs text-[var(--warm-charcoal)]">pts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
