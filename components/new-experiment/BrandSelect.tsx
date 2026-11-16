"use client";

import Image from "next/image";
import { Select } from "radix-ui";

export type BrandSelectOption = { id: string; label: string };

type BrandSelectProps = {
  id?: string;
  value: string;
  onChange: (id: string) => void;
  options: BrandSelectOption[];
  placeholder: string;
  disabled?: boolean;
  ariaLabel?: string;
};

// The "Select model" control from the New Experiment popup: Ink fill, Graphite
// border, chevron on the right. Built on Radix Select (same behaviour and roles as
// the shared one) and scoped to this popup so components/ui stays untouched.
export function BrandSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  ariaLabel,
}: BrandSelectProps) {
  return (
    <Select.Root value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        id={id}
        aria-label={ariaLabel}
        className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] border-graphite bg-ink pr-2.5 pl-3.5 text-left text-[13px] text-paper outline-none transition-colors focus-visible:border-signal-lime disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-smoke"
      >
        <span className="min-w-0 flex-1 truncate">
          <Select.Value placeholder={placeholder} />
        </span>
        <Select.Icon asChild>
          <Image src="/brand/chevron-down.svg" alt="" width={14} height={14} className="shrink-0" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-[60] min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-graphite bg-carbon p-1.5 text-paper shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.id}
                value={option.id}
                className="flex cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-[13px] outline-none data-[highlighted]:bg-input-fill data-[highlighted]:text-white data-[state=checked]:text-signal-lime"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
