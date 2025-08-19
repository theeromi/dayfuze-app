import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search tasks..." }: SearchBarProps) {
  return (
    <section className="px-4 mb-6">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-100 border-0 rounded-xl py-3 pl-12 pr-4 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          data-testid="input-search"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
    </section>
  );
}
