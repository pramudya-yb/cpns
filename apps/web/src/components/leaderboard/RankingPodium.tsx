import { Card, CardContent } from "@labas/ui/components/card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Avatar } from "@/components/ui/Avatar";

interface PodiumUser {
  rank: number;
  name: string;
  image: string | null;
  totalScore: number;
}

function PodiumCard({
  user,
  position,
  medalColor,
  medalIcon,
  height,
}: {
  user: PodiumUser;
  position: number;
  medalColor: string;
  medalIcon: string;
  height: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar src={user.image} name={user.name} size="lg" variant="leaderboard" bordered />
      <div className="text-center">
        <p className="text-sm font-headline font-bold text-[var(--clay-black)] truncate max-w-[120px]">
          {user.name}
        </p>
        <p className="text-xs text-[var(--warm-charcoal)]">{user.totalScore} pts</p>
      </div>
      <Card
        className={`w-full clay-shadow bg-[var(--pure-white)] border-2 rounded-[var(--radius-xl)] ${medalColor} ${height}`}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <span className="material-symbols-outlined text-3xl">{medalIcon}</span>
          <span className="text-2xl font-headline font-extrabold text-[var(--clay-black)] mt-1">
            #{position}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

export function RankingPodium({ top3 }: { top3: PodiumUser[] }) {
  if (top3.length === 0) return null;

  const medals = [
    { border: "border-[#F59E0B]", icon: "trophy" },
    { border: "border-[#94A3B8]", icon: "workspace_premium" },
    { border: "border-[#CD7F32]", icon: "award_star" },
  ];

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {/* #2 - Silver (left) */}
      {top3.length >= 2 ? (
        <div className="w-[120px]">
          <PodiumCard
            user={top3[1]!}
            position={2}
            medalColor={medals[1]!.border}
            medalIcon={medals[1]!.icon}
            height="h-28"
          />
        </div>
      ) : (
        <div className="w-[120px]" />
      )}

      {/* #1 - Gold (center, taller) */}
      <div className="w-[140px]">
        {top3.length >= 1 && (
          <PodiumCard
            user={top3[0]!}
            position={1}
            medalColor={`${medals[0]!.border} ring-2 ring-[#F59E0B] ring-offset-2`}
            medalIcon={medals[0]!.icon}
            height="h-36"
          />
        )}
      </div>

      {/* #3 - Bronze (right) */}
      {top3.length >= 3 ? (
        <div className="w-[120px]">
          <PodiumCard
            user={top3[2]!}
            position={3}
            medalColor={medals[2]!.border}
            medalIcon={medals[2]!.icon}
            height="h-24"
          />
        </div>
      ) : (
        <div className="w-[120px]" />
      )}
    </div>
  );
}
