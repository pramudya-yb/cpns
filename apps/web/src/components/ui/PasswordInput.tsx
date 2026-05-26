import { useState } from "react";
import { Input } from "@labas/ui/components/input";
import { Button } from "@labas/ui/components/button";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type PasswordInputProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  autoComplete?: string;
};

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="pr-11"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full w-11 rounded-[var(--radius-lg)] text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        onClick={() => setVisible((prev) => !prev)}
      >
        <MaterialIcon name={visible ? "visibility_off" : "visibility"} className="text-xl" />
      </Button>
    </div>
  );
}
