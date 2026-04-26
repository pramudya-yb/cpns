import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Button } from "@labas/ui/components/button";
import { Card, CardContent } from "@labas/ui/components/card";

export const Route = createFileRoute("/bank/$id")({
  component: QuestionDetailComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function formatLabel(fmt: string) {
  return fmt.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number | null;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(null)}
          className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <MaterialIcon
            name={(hover ?? value ?? 0) >= star ? "star" : "star_outline"}
            className={`text-xl ${(hover ?? value ?? 0) >= star ? "text-[var(--lemon-500)]" : "text-[var(--oat-border)]"}`}
          />
        </button>
      ))}
    </div>
  );
}

function QuestionDetailComponent() {
  const { id } = Route.useParams();
  const { data: session } = authClient.useSession();

  const questionQuery = useQuery(trpc.question.getById.queryOptions({ id }));
  const ratingQuery = useQuery(trpc.rating.getQuestionRating.queryOptions({ questionId: id }));

  const rateMutation = useMutation({
    ...trpc.rating.rateQuestion.mutationOptions(),
    onSuccess: () => {
      ratingQuery.refetch();
      questionQuery.refetch();
    },
  });

  const q = questionQuery.data;

  if (questionQuery.isLoading) {
    return (
      <div className="min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-16 max-w-4xl mx-auto bg-[var(--warm-cream)]">
        <div className="h-8 w-48 bg-[var(--oat-light)] animate-pulse rounded mb-4" />
        <div className="h-64 bg-[var(--oat-light)] animate-pulse rounded-[var(--radius-xl)]" />
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-16 max-w-4xl mx-auto bg-[var(--warm-cream)]">
        <div className="text-center py-20">
          <MaterialIcon name="error_outline" className="text-6xl text-[var(--warm-silver)] mx-auto mb-4" />
          <p className="text-lg text-[var(--warm-charcoal)] font-semibold">Soal tidak ditemukan</p>
          <Link to="/bank" className="text-[var(--matcha-600)] font-semibold mt-4 inline-block">
            Kembali ke Bank Soal
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = q.creatorUserId === session?.user.id;

  return (
    <div className="min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-16 max-w-4xl mx-auto bg-[var(--warm-cream)]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--warm-charcoal)] mb-6">
        <Link to="/bank" className="hover:text-[var(--clay-black)] transition-colors">Bank Soal</Link>
        <MaterialIcon name="chevron_right" className="text-xs" />
        <span className="text-[var(--clay-black)] font-medium">Detail Soal</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-[var(--matcha-300)] text-[var(--matcha-800)] text-sm font-semibold">
            {q.examTypeName}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[var(--slushie-500)]/20 text-[var(--slushie-800)] text-sm font-semibold">
            {q.sectionTypeName}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[var(--lemon-400)]/30 text-[var(--lemon-800)] text-sm font-semibold">
            {formatLabel(q.format)}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[var(--oat-light)] text-[var(--warm-charcoal)] text-sm font-semibold">
            Level {q.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StarRating
            value={ratingQuery.data?.myRating ?? null}
            onChange={(score) => rateMutation.mutate({ questionId: id, score })}
          />
          {ratingQuery.data?.avgRating && (
            <span className="text-sm text-[var(--warm-charcoal)]">
              {ratingQuery.data.avgRating}/5
            </span>
          )}
        </div>
      </div>

      {/* Passage */}
      <Card className="clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] mb-6">
        <CardContent className="p-6">
          <h2 className="font-headline text-lg font-bold text-[var(--clay-black)] mb-4 flex items-center gap-2">
            <MaterialIcon name="menu_book" />
            Teks Bacaan
          </h2>
          <div className="text-[var(--clay-black)] leading-relaxed whitespace-pre-wrap">
            {q.passageText}
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] mb-6">
        <CardContent className="p-6">
          <h2 className="font-headline text-lg font-bold text-[var(--clay-black)] mb-4 flex items-center gap-2">
            <MaterialIcon name="help_outline" />
            Pertanyaan
          </h2>
          <p className="text-lg text-[var(--clay-black)] font-medium mb-4">{q.questionText}</p>

          {!!q.options && Array.isArray(q.options as unknown[]) && (q.options as unknown[]).length > 0 && (
            <div className="space-y-2 mt-4">
              {(q.options as Array<{ key: string; text: string }>).map((opt) => (
                <div
                  key={opt.key}
                  className={`flex items-center p-4 rounded-[var(--radius-lg)] border-2 transition-all ${
                    opt.key === q.correctAnswer
                      ? "border-[var(--matcha-600)] bg-[var(--matcha-300)]/20"
                      : "border-[var(--oat-border)] bg-[var(--oat-light)]"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full border-2 border-[var(--oat-border)] flex items-center justify-center mr-3 text-xs font-bold text-[var(--warm-charcoal)]">
                    {opt.key}
                  </span>
                  <span className={`${opt.key === q.correctAnswer ? "font-semibold text-[var(--matcha-800)]" : "text-[var(--clay-black)]"}`}>
                    {opt.text}
                  </span>
                  {opt.key === q.correctAnswer && (
                    <span className="ml-auto text-xs font-bold text-[var(--matcha-800)] bg-[var(--matcha-300)] px-2 py-1 rounded-full">
                      Benar
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!q.options && (
            <div className="p-4 rounded-[var(--radius-md)] border-2 border-[var(--matcha-300)] bg-[var(--matcha-300)]/20 mt-4">
              <span className="font-semibold text-[var(--matcha-800)]">Jawaban: </span>
              <span className="text-[var(--matcha-800)]">{q.correctAnswer}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explanation */}
      {q.explanation && (
        <Card className="clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] mb-6">
          <CardContent className="p-6">
            <h2 className="font-headline text-lg font-bold text-[var(--clay-black)] mb-4 flex items-center gap-2">
              <MaterialIcon name="lightbulb" />
              Penjelasan
            </h2>
            <p className="text-[var(--warm-charcoal)] leading-relaxed">{q.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--warm-charcoal)]">
        <div className="flex gap-4">
          <span>Dibuat oleh {q.creatorName ?? "Anonim"}</span>
          <span>•</span>
          <span>{q.usageCount}x digunakan</span>
          <span>•</span>
          <span className="capitalize">{q.source}</span>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${q.isPublic ? "bg-[var(--matcha-300)] text-[var(--matcha-800)]" : "bg-[var(--oat-light)] text-[var(--warm-charcoal)]"}`}>
              {q.isPublic ? "Publik" : "Privat"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
