import { Card } from "@labas/ui/components/card";
import { Button } from "@labas/ui/components/button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { QuestionCard } from "./QuestionCard";

interface SoalBrowserProps {
  isLoading: boolean;
  questions: any[];
  totalPages: number;
  page: number;
  hasFilters: boolean;
  userId?: string;
  isQuestionInBundle: (id: string) => boolean;
  onToggleQuestion: (q: any) => void;
  onOpenDetail: (q: any) => void;
  onTogglePublic: (id: string) => void;
  onDelete: (id: string) => void;
  onSetPage: (page: number) => void;
  onClearFilters: () => void;
}

export function SoalBrowser({
  isLoading,
  questions,
  totalPages,
  page,
  hasFilters,
  userId,
  isQuestionInBundle,
  onToggleQuestion,
  onOpenDetail,
  onTogglePublic,
  onDelete,
  onSetPage,
  onClearFilters,
}: SoalBrowserProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-48 bg-[var(--oat-light)] animate-pulse rounded-[var(--radius-xl)]" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <MaterialIcon name="search_off" className="text-6xl text-[var(--warm-silver)] mx-auto mb-4" />
        <p className="text-lg text-[var(--warm-charcoal)] font-semibold">Tidak ada soal ditemukan</p>
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="mt-3 text-sm text-[var(--pomegranate-400)] font-medium hover:underline cursor-pointer"
          >
            Hapus filter
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions[0] && (
          <div className="md:col-span-2">
            <QuestionCard
              q={questions[0]}
              isFeatured
              isInBundle={isQuestionInBundle(questions[0].id)}
              onToggle={() => onToggleQuestion(questions[0])}
              onOpenDetail={() => onOpenDetail(questions[0])}
              isOwner={questions[0].creatorUserId === userId}
              onTogglePublic={() => onTogglePublic(questions[0].id)}
              onDelete={() => onDelete(questions[0].id)}
            />
          </div>
        )}
        {questions.slice(1).map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            isInBundle={isQuestionInBundle(q.id)}
            onToggle={() => onToggleQuestion(q)}
            onOpenDetail={() => onOpenDetail(q)}
            isOwner={q.creatorUserId === userId}
            onTogglePublic={() => onTogglePublic(q.id)}
            onDelete={() => onDelete(q.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            onClick={() => onSetPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] clay-hover cursor-pointer"
          >
            <MaterialIcon name="chevron_left" />
          </Button>
          <span className="text-sm text-[var(--warm-charcoal)] px-4">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onSetPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] clay-hover cursor-pointer"
          >
            <MaterialIcon name="chevron_right" />
          </Button>
        </div>
      )}
    </>
  );
}
