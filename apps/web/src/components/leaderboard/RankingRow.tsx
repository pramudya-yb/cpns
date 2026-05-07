import { Card, CardContent } from "@labas/ui/components/card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Avatar } from "@/components/ui/Avatar";

interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  totalScore: number;
  avgScorePct: number;
  attemptsCount: number;
}

export function RankingRow({
  entry,
  isCurrentUser,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
}) {
  return (
    <Card
      className={`clay-shadow bg-[var(--pure-white)] border-2 rounded-[var(--radius-xl)] clay-hover ${
        isCurrentUser
          ? "border-[var(--matcha-400)] bg-[var(--matcha-100)]"
          : "border-[var(--oat-border)]"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="w-10 text-center shrink-0">
            {entry.rank <= 3 ? (
              <span className="material-symbols-outlined text-2xl">
                {entry.rank === 1 ? "trophy" : entry.rank === 2 ? "workspace_premium" : "award_star"}
              </span>
            ) : (
              <span className="text-lg font-headline font-bold text-[var(--warm-charcoal)]">
                {entry.rank}
              </span>
            )}
          </div>

          {/* Avatar */}
          <Avatar src={entry.image} name={entry.name} size="md" variant="leaderboard" />

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-headline font-bold text-[var(--clay-black)] truncate">
              {entry.name}
            </p>
            <p className="text-xs text-[var(--warm-charcoal)]">
              {entry.avgScorePct}% avg &middot; {entry.attemptsCount} latihan
            </p>
          </div>

          {/* Score */}
          <div className="text-right shrink-0">
            <p className="text-lg font-headline font-extrabold text-[var(--clay-black)]">
              {entry.totalScore}
            </p>
            <p className="text-xs text-[var(--warm-charcoal)]">pts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
