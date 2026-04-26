import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

export const Route = createFileRoute("/builder")({
  component: BuilderComponent,
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

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function formatLabel(fmt: string) {
  return fmt.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function BuilderComponent() {
  const [step, setStep] = useState<"select" | "review">("select");
  const [search, setSearch] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Package form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState("IELTS");
  const [isPublic, setIsPublic] = useState(false);

  const questionsQuery = useQuery(
    trpc.question.list.queryOptions({
      search: search || undefined,
      examTypeId: examTypeFilter || undefined,
      isPublic: true,
      limit: 50,
      offset: 0,
    }),
  );

  const createPackage = useMutation({
    ...trpc.package.create.mutationOptions(),
  });

  const addSection = useMutation({
    ...trpc.package.addSection.mutationOptions(),
  });

  const addQuestion = useMutation({
    ...trpc.package.addQuestion.mutationOptions(),
  });

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id],
    );
  };

  const handleCreatePackage = async () => {
    if (!title || selectedQuestions.length === 0) return;

    try {
      const pkg = await createPackage.mutateAsync({
        title,
        description,
        examTypeId: examType,
        isPublic,
        estimatedDurationMin: selectedQuestions.length * 2,
      });

      const sec = await addSection.mutateAsync({
        packageId: pkg.id,
        sectionTypeId: "READING",
        title: "Reading Section",
        orderIndex: 0,
      });

      for (let i = 0; i < selectedQuestions.length; i++) {
        await addQuestion.mutateAsync({
          sectionId: sec.id,
          questionId: selectedQuestions[i],
          orderIndex: i,
        });
      }

      alert(`Paket "${title}" berhasil dibuat!`);
      setSelectedQuestions([]);
      setTitle("");
      setDescription("");
      setStep("select");
    } catch (err: any) {
      alert("Gagal membuat paket: " + err.message);
    }
  };

  const questions = questionsQuery.data?.questions ?? [];
  const selectedCount = selectedQuestions.length;

  return (
    <div className="min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-16 max-w-7xl mx-auto bg-[var(--warm-cream)]">
      <section className="mb-8">
        <h1 className="text-4xl font-headline font-extrabold text-[var(--clay-black)] tracking-tight">
          Test Builder
        </h1>
        <p className="text-lg text-[var(--warm-charcoal)] mt-2">
          Susun paket soal dari bank soal yang tersedia.
        </p>
      </section>

      {step === "select" ? (
        <>
          {/* Selection Toolbar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sticky top-0 z-30 bg-[var(--warm-cream)] py-4">
            <div className="flex gap-3 flex-1 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--warm-charcoal)]" />
                <Input
                  placeholder="Cari soal..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)] h-11"
                />
              </div>
              <Select
                items={[
                  { value: "", label: "Semua Ujian" },
                  ...EXAM_TYPES.map((t) => ({ value: t.id, label: t.name })),
                ]}
                value={examTypeFilter}
                onValueChange={(v: string | null) => setExamTypeFilter(v ?? "")}
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
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--warm-charcoal)]">
                <span className="font-bold text-[var(--clay-black)]">{selectedCount}</span> soal dipilih
              </span>
              <Button
                onClick={() => selectedCount > 0 && setStep("review")}
                disabled={selectedCount === 0}
                className="bg-[var(--clay-black)] text-[var(--pure-white)] hover:bg-[var(--warm-charcoal)] clay-hover rounded-[var(--radius-lg)]"
              >
                <MaterialIcon name="arrow_forward" />
                <span className="ml-2">Lanjut</span>
              </Button>
            </div>
          </div>

          {/* Question Grid */}
          {questionsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-32 bg-[var(--oat-light)] animate-pulse rounded-[var(--radius-xl)]" />
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20">
              <MaterialIcon name="search_off" className="text-6xl text-[var(--warm-silver)] mx-auto mb-4" />
              <p className="text-lg text-[var(--warm-charcoal)] font-semibold">Tidak ada soal ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q) => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestion(q.id)}
                    className={`cursor-pointer rounded-[var(--radius-xl)] border-2 p-5 transition-all clay-hover ${
                      isSelected
                        ? "border-[var(--clay-black)] bg-[var(--matcha-300)]/10 clay-shadow"
                        : "border-[var(--oat-border)] bg-[var(--pure-white)] hover:bg-[var(--oat-light)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[var(--clay-black)] border-[var(--clay-black)]" : "border-[var(--oat-border)]"
                      }`}>
                        {isSelected && <MaterialIcon name="check" className="text-xs text-[var(--pure-white)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 flex-wrap mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-[var(--matcha-300)] text-[var(--matcha-800)] text-xs font-semibold">
                            {q.examTypeName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[var(--slushie-500)]/20 text-[var(--slushie-800)] text-xs font-semibold">
                            {q.sectionTypeName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[var(--oat-light)] text-[var(--warm-charcoal)] text-xs font-semibold">
                            {formatLabel(q.format)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[var(--clay-black)] line-clamp-2">{q.questionText}</p>
                        <p className="text-xs text-[var(--warm-charcoal)] line-clamp-1 mt-1">{q.passageText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Review & Create Step */
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setStep("select")}
            className="mb-6 rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] clay-hover"
          >
            <MaterialIcon name="arrow_back" />
            <span className="ml-2">Kembali</span>
          </Button>

          <Card className="clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] mb-6">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-headline text-xl font-bold text-[var(--clay-black)]">Detail Paket</h2>

              <div>
                <label className="text-sm font-medium text-[var(--clay-black)] block mb-1">Judul</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. IELTS Reading Practice Set 1"
                  className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--clay-black)] block mb-1">Deskripsi</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat..."
                  className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--clay-black)] block mb-1">Jenis Ujian</label>
                <Select
                  items={EXAM_TYPES.map((t) => ({ value: t.id, label: t.name }))}
                  value={examType}
                  onValueChange={(v: string | null) => setExamType(v ?? "IELTS")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ujian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {EXAM_TYPES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--oat-border)]"
                />
                <span className="text-sm text-[var(--warm-charcoal)]">Publikasikan ke Bank Soal</span>
              </label>
            </CardContent>
          </Card>

          <Card className="clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] mb-6">
            <CardContent className="p-6">
              <h3 className="font-headline text-lg font-bold text-[var(--clay-black)] mb-4">
                Soal Terpilih ({selectedCount})
              </h3>
              <div className="space-y-3">
                {selectedQuestions.map((qid, idx) => {
                  const q = questions.find((item) => item.id === qid);
                  if (!q) return null;
                  return (
                    <div key={qid} className="flex items-start gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--oat-light)]">
                      <span className="w-6 h-6 rounded-full bg-[var(--clay-black)] text-[var(--pure-white)] text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-[var(--clay-black)] line-clamp-2 flex-1">{q.questionText}</p>
                      <button
                        onClick={() => toggleQuestion(qid)}
                        className="text-[var(--pomegranate-400)] hover:text-[var(--pomegranate-400)]/80"
                      >
                        <MaterialIcon name="close" className="text-sm" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleCreatePackage}
            disabled={!title || createPackage.isPending}
            className="w-full py-4 rounded-[var(--radius-lg)] bg-[var(--clay-black)] text-[var(--pure-white)] font-bold text-lg clay-shadow clay-hover hover:bg-[var(--warm-charcoal)] h-auto"
          >
            <MaterialIcon name="folder" />
            <span className="ml-2">
              {createPackage.isPending ? "Membuat Paket..." : "Buat Paket Soal"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
