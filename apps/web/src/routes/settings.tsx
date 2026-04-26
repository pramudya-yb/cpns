import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useApiKey } from "@/hooks/use-api-key";
import { Button } from "@labas/ui/components/button";
import { Input } from "@labas/ui/components/input";
import { Label } from "@labas/ui/components/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@labas/ui/components/card";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

function MaterialIcon({ name }: { name: string }) {
  return <span className="material-symbols-outlined text-xl">{name}</span>;
}

function RouteComponent() {
  const { storedKey, isLoading, saveKey, removeKey, hasKey } = useApiKey();

  const [provider, setProvider] = useState(storedKey?.provider ?? "openai");
  const [baseUrl, setBaseUrl] = useState(storedKey?.baseUrl ?? "https://api.openai.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState(storedKey?.modelName ?? "gpt-4o-mini");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey) return;
    setIsSaving(true);
    try {
      await saveKey({ provider, baseUrl, apiKey, modelName });
      setApiKey("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-32 px-6 md:px-12 lg:px-16 max-w-5xl mx-auto bg-[var(--warm-cream)]">
      <section className="mb-10">
        <h1 className="text-4xl font-headline font-extrabold text-[var(--clay-black)] tracking-tight">Pengaturan</h1>
        <p className="text-lg text-[var(--warm-charcoal)] mt-2">Kelola API key dan preferensi akun.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <Card className="clay-shadow clay-hover bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MaterialIcon name="key" />
                <CardTitle className="font-headline text-[var(--clay-black)]">
                  {hasKey ? "Update API Key" : "Tambah API Key"}
                </CardTitle>
              </div>
              <CardDescription className="text-[var(--warm-charcoal)]">
                API key disimpan terenkripsi di browser (localStorage + IndexedDB). Server tidak pernah menyimpan key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-[var(--clay-black)]">Provider</Label>
                  <select
                    id="provider"
                    className="flex h-10 w-full rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)] px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-black)] focus-visible:ring-offset-2 text-[var(--clay-black)]"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="groq">Groq</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-[var(--clay-black)]">Model</Label>
                  <Input
                    id="model"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)] text-[var(--clay-black)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl" className="text-[var(--clay-black)]">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)] text-[var(--clay-black)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-[var(--clay-black)]">
                  {hasKey ? "API Key Baru (kosongkan jika tidak diubah)" : "API Key"}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasKey ? "••••••••" : "sk-..."}
                  className="rounded-[var(--radius-lg)] border-2 border-[var(--oat-border)] bg-[var(--pure-white)] text-[var(--clay-black)]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={(!apiKey && !hasKey) || isSaving}
                  className="bg-[var(--clay-black)] text-[var(--pure-white)] hover:bg-[var(--warm-charcoal)] rounded-[var(--radius-lg)] h-11 clay-shadow clay-hover"
                >
                  {isSaving ? "Menyimpan..." : hasKey ? "Update Key" : "Simpan API Key"}
                </Button>
                {hasKey && (
                  <Button
                    variant="outline"
                    onClick={removeKey}
                    className="rounded-[var(--radius-lg)] h-11 border-2 border-[var(--oat-border)] text-[var(--pomegranate-400)] hover:bg-[var(--pomegranate-400)]/10 clay-hover"
                  >
                    Hapus Key
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="clay-shadow clay-hover bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] sticky top-8">
            <CardHeader>
              <CardTitle className="font-headline text-[var(--clay-black)]">Status API Key</CardTitle>
              <CardDescription className="text-[var(--warm-charcoal)]">Informasi penyimpanan key.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-[var(--warm-charcoal)]">Memuat...</p>
              ) : hasKey ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[var(--matcha-300)] rounded-[var(--radius-lg)]">
                    <MaterialIcon name="check_circle" />
                    <div>
                      <p className="font-medium text-[var(--matcha-800)]">Key Tersimpan</p>
                      <p className="text-sm text-[var(--matcha-800)]/70">
                        {storedKey?.provider} · {storedKey?.modelName}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--warm-charcoal)] space-y-1">
                    <p>• Disimpan terenkripsi di localStorage</p>
                    <p>• Key enkripsi disimpan di IndexedDB</p>
                    <p>• Server tidak pernah menyimpan key</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MaterialIcon name="key_off" />
                  <p className="text-[var(--warm-charcoal)] mt-2">Belum ada API key.</p>
                  <p className="text-xs text-[var(--warm-charcoal)] mt-1">
                    Tambahkan key untuk mulai generate soal.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
