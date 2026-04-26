import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Input } from "@labas/ui/components/input";
import { Button } from "@labas/ui/components/button";
import { Card, CardContent } from "@labas/ui/components/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@labas/ui/components/select";

export const Route = createFileRoute("/bank")({
  component: BankComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

const EXAM_TYPES = [
  { id: "IELTS", name: "IELTS" },
  { id: "TOEFL", name: "TOEFL" },
  { id: "JLPT", name: "JLPT" },
  { id: "HSK", name: "HSK" },
  { id: "GOETHE", name: "German" },
];

const SECTIONS = [
  { id: "READING", name: "Reading" },
  { id: "WRITING", name: "Writing" },
];

const FORMATS = [
  "multiple_choice",
  "true_false_not_given",
  "fill_blank",
  "synonym",
  "grammar_in_context",
  "sentence_completion",
  "cloze",
  "reference",
  "author_view",
  "matching_headings",
  "kanji_reading",
  "particle_choice",
  "article_case",
];

const DIFFICULTIES = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Elementary" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
];

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function formatLabel(fmt: string) {
  return fmt.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function BankComponent() {
  const [search, setSearch] = useState("");
  const [examType, setExamType] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [format, setFormat] = useState<string>("");
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const limit = 12;

  const query = useQuery(
    trpc.question.list.queryOptions({
      search: search || undefined,
      examTypeId: examType || undefined,
      sectionTypeId: section || undefined,
      format: format || undefined,
      difficulty,
      isPublic: true,
      limit,
      offset: page * limit,
    }),
  );

  const questions = query.data?.questions ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setSearch("");
    setExamType("");
    setSection("");
    setFormat("");
    setDifficulty(undefined);
    setPage(0);
  };

  const hasFilters = search || examType || section || format || difficulty !== undefined;

  return (
    <div className="min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto bg-[var(--warm-cream)]">
      <section className="mb-8">
        <h1 className="text-4xl font-headline font-extrabold text-[var(--clay-black)] tracking-tight">
          Bank Soal
        </h1>
        <p className="text-lg text-[var(--warm-charcoal)] mt-2">
          Jelajahi soal latihan dari komunitas.
        </p>
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--warm-charcoal)]" />
            <Input
              placeholder="Cari soal..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-10 rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)] h-11"
            />
          </div>
          {hasFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] h-11 clay-hover"
            >
              <MaterialIcon name="filter_alt_off" />
              <span className="ml-2 hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            items={[
              { value: "", label: "Semua Ujian" },
              ...EXAM_TYPES.map((t) => ({ value: t.id, label: t.name })),
            ]}
            value={examType}
            onValueChange={(v: string | null) => { setExamType(v ?? ""); setPage(0); }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Ujian" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Semua Ujian</SelectItem>
                {EXAM_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            items={[
              { value: "", label: "Semua Section" },
              ...SECTIONS.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={section}
            onValueChange={(v: string | null) => { setSection(v ?? ""); setPage(0); }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Semua Section</SelectItem>
                {SECTIONS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            items={[
              { value: "", label: "Semua Format" },
              ...FORMATS.map((f) => ({ value: f, label: formatLabel(f) })),
            ]}
            value={format}
            onValueChange={(v: string | null) => { setFormat(v ?? ""); setPage(0); }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Semua Format</SelectItem>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>{formatLabel(f)}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            items={[
              { value: "", label: "Semua Level" },
              ...DIFFICULTIES.map((d) => ({ value: String(d.value), label: d.label })),
            ]}
            value={difficulty !== undefined ? String(difficulty) : ""}
            onValueChange={(v: string | null) => { setDifficulty(v ? Number(v) : undefined); setPage(0); }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">Semua Level</SelectItem>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {query.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48 bg-[var(--oat-light)] animate-pulse rounded-[var(--radius-xl)]" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20">
          <MaterialIcon name="search_off" className="text-6xl text-[var(--warm-silver)] mx-auto mb-4" />
          <p className="text-lg text-[var(--warm-charcoal)] font-semibold">Tidak ada soal ditemukan</p>
          <p className="text-sm text-[var(--warm-silver)] mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questions.map((q) => (
              <Link key={q.id} to="/bank/$id" params={{ id: q.id }} className="block">
                <Card className="clay-shadow clay-hover bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col h-full">
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

                    <h3 className="font-headline text-base font-bold text-[var(--clay-black)] mb-2 line-clamp-2">
                      {q.questionText}
                    </h3>

                    <p className="text-sm text-[var(--warm-charcoal)] line-clamp-3 mb-4 flex-1">
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
                      </div>
                      <span className="text-xs text-[var(--warm-silver)]">
                        {q.usageCount}x digunakan
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] clay-hover"
              >
                <MaterialIcon name="chevron_left" />
              </Button>
              <span className="text-sm text-[var(--warm-charcoal)] px-4">
                Halaman {page + 1} dari {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] clay-hover"
              >
                <MaterialIcon name="chevron_right" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
