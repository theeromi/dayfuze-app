import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

export function TimeInput({ value, onChange, label, id, required, className }: TimeInputProps) {
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        type="time"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        data-testid={id ? `input-${id}` : "input-time"}
        className="w-full"
      />
    </div>
  );
}