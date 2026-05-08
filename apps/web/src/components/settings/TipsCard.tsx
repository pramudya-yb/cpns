import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@labas/ui/components/card";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function TipsCard() {
  return (
    <Card className="clay-shadow bg-[var(--pure-white)] border-2 border-[var(--oat-border)] rounded-[var(--radius-xl)] sticky top-8">
      <CardHeader>
        <CardTitle className="font-headline text-[var(--clay-black)]">Tips</CardTitle>
        <CardDescription className="text-[var(--warm-charcoal)]">
          Panduan singkat mengelola API key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-[var(--warm-charcoal)] space-y-2">
          <p className="flex items-start gap-2">
            <MaterialIcon name="check_circle" className="text-xs text-[var(--matcha-600)] shrink-0 mt-0.5" />
            BYOK — bawa key milik Anda sendiri
          </p>
          <p className="flex items-start gap-2">
            <MaterialIcon name="check_circle" className="text-xs text-[var(--matcha-600)] shrink-0 mt-0.5" />
            Platform tidak menyimpan key di server
          </p>
          <p className="flex items-start gap-2">
            <MaterialIcon name="check_circle" className="text-xs text-[var(--matcha-600)] shrink-0 mt-0.5" />
            Key dienkripsi secara lokal di browser
          </p>
          <p className="flex items-start gap-2">
            <MaterialIcon name="check_circle" className="text-xs text-[var(--matcha-600)] shrink-0 mt-0.5" />
            Anda bisa menambahkan beberapa config
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
