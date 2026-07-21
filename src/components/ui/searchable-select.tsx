import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

export function SearchableSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  onChange,
  disabled,
}: {
  value: string;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="mt-1.5 h-11 w-full min-w-0 justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(var(--radix-popover-trigger-width),calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-0"
        align="start"
        sideOffset={6}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? "Buscar..."} />
          <CommandList className="max-h-72 overflow-auto">
            <CommandEmpty>{emptyLabel ?? "Nenhum item encontrado."}</CommandEmpty>
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={`${opt.label} ${opt.value}`}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                <span className="line-clamp-2 break-words">{opt.label}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
