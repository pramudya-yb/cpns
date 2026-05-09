import type { ReactNode } from "react";

const FURIGANA_PATTERN = /([\u4e00-\u9fff\u3400-\u4dbf\ua000-\ua4cf\uf900-\ufaff]+)\(([^)]+)\)/g;

export function parseFurigana(text: string): ReactNode {
  if (!text) return text;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const re = new RegExp(FURIGANA_PATTERN.source, "g");
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <ruby key={match.index}>
        {match[1]}
        <rt>{match[2]}</rt>
      </ruby>,
    );
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
