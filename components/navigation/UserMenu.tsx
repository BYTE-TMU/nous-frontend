"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearToken } from "@/lib/auth";

// The "JD" avatar in the header opens a small menu with Log out. The backend has
// no logout endpoint (sessions are stateless JWTs), so logging out means dropping
// the stored token and going back to the login screen.
export function UserMenu() {
  const router = useRouter();

  function logOut() {
    clearToken();
    router.replace("/login");
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Account menu"
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar size="default">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-40 rounded-xl border border-graphite bg-carbon p-1.5 text-paper shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        >
          <DropdownMenu.Item
            onSelect={logOut}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-status-broke outline-none data-[highlighted]:bg-status-broke/12 data-[highlighted]:text-status-broke"
          >
            <LogOut aria-hidden className="size-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
