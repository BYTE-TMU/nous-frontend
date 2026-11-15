import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";
import { UserMenu } from "./UserMenu";

export default function AppHeader() {

  return (
    <header className="flex flex-row w-full justify-between items-center p-4 border-b border-border">
      <Link href="/">
        <Image src="/brand/nous-wordmark.svg" alt="Nous home" width={87} height={24} priority />
      </Link>
      <div className="flex flex-row gap-4 items-center">
        <Button variant="default" size="default">
        <Link href="/settings" className="text-sm text-muted-foreground">
          Settings
        </Link>
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}