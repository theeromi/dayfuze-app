import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function CategoryFilters({ activeFilter, onFilterChange }: CategoryFiltersProps) {
  const filters = [
    { key: "all", label: "All Tasks" },
    { key: "todo", label: "To-Do" },
    { key: "progress", label: "In Progress" },
    { key: "done", label: "Done" },
  ];

  return (
    <section className="px-4 mb-6">
      <div className="flex space-x-3 overflow-x-auto">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-4 py-2 text-sm font-medium rounded-full flex-shrink-0 ${
              activeFilter === filter.key
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            data-testid={`button-filter-${filter.key}`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
