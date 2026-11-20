import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export default function AppHeader() {

  return (
    <header className="flex flex-row w-full justify-between items-center p-4 border-b border-border">
      <Link href="/dashboard">
        <Image src="/brand/nous-wordmark.svg" alt="Nous home" width={87} height={24} priority />
      </Link>
      <div className="flex flex-row gap-4 items-center">
        <UserMenu />
      </div>
    </header>
  )
}