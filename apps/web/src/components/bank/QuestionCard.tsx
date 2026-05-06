import { Button } from "@labas/ui/components/button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { formatLabel } from "@/lib/format";

interface QuestionCardProps {
  q: any;
  isFeatured?: boolean;
  isInBundle: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
  isOwner: boolean;
  onTogglePublic: () => void;
  onDelete: () => void;
}

export function QuestionCard({
  q,
  isFeatured = false,
  isInBundle,
  onToggle,
  onOpenDetail,
  isOwner,
  onTogglePublic,
  onDelete,
}: QuestionCardProps) {
  return (
    <div
      onClick={onOpenDetail}
      className={`clay-shadow clay-hover bg-[var(--pure-white)] border-2 rounded-[var(--radius-xl)] h-full flex flex-col cursor-pointer transition-all ${
        isInBundle
          ? "border-[var(--clay-black)] bg-[var(--matcha-100)]"
          : "border-[var(--oat-border)]"
      }`}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-[var(--matcha-300)] text-[var(--matcha-800)] text-xs font-semibold">
              {q.examTypeName}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[var(--slushie-500)]/20 text-[var(--slushie-800)] text-xs font-semibold">
              {q.sectionTypeName}
            </span>
          </div>
          {q.avgRating && (
            <div className="flex items-center gap-1 text-[var(--lemon-700)]">
              <MaterialIcon name="star" className="text-sm" />
              <span className="text-xs font-bold">{q.avgRating}</span>
            </div>
          )}
        </div>

        <h3
          className={`font-headline font-bold text-[var(--clay-black)] mb-2 ${
            isFeatured ? "text-xl line-clamp-3" : "text-base line-clamp-2"
          }`}
        >
          {q.questionText}
        </h3>

        <p
          className={`text-sm text-[var(--warm-charcoal)] flex-1 ${
            isFeatured ? "line-clamp-4 mb-4" : "line-clamp-2 mb-4"
          }`}
        >
          {q.passageText}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--oat-border)]">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-[var(--oat-light)] text-[var(--warm-charcoal)] text-xs font-medium">
              {formatLabel(q.format)}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--oat-light)] text-[var(--warm-charcoal)] text-xs font-medium">
              Lv.{q.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--oat-light)] text-[var(--warm-charcoal)] text-xs font-medium">
              {q.usageCount}x digunakan
            </span>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--oat-border)]">
          {isOwner && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onTogglePublic}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  q.isPublic
                    ? "bg-[var(--matcha-300)] text-[var(--matcha-800)]"
                    : "bg-[var(--oat-light)] text-[var(--warm-charcoal)]"
                }`}
              >
                {q.isPublic ? "Publik" : "Privat"}
              </button>
              <button
                onClick={onDelete}
                className="text-[var(--pomegranate-400)] hover:bg-[var(--pomegranate-400)]/10 px-2 py-1 rounded-full transition-colors cursor-pointer"
              >
                <MaterialIcon name="delete" className="text-sm" />
              </button>
            </div>
          )}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`ml-auto rounded-[var(--radius-lg)] text-xs cursor-pointer ${
              isInBundle
                ? "bg-[var(--clay-black)] text-[var(--pure-white)] hover:bg-[var(--warm-charcoal)]"
                : "bg-[var(--matcha-300)] text-[var(--matcha-800)] hover:bg-[var(--matcha-400)]"
            }`}
          >
            {isInBundle ? "Hapus dari Paket" : "Tambah ke Paket"}
          </Button>
        </div>
      </div>
    </div>
  );
}
