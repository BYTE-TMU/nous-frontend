import { redirect } from "next/navigation";

// The dashboard lives at "/". Kept so old links still work.
export default function Page() {
  redirect("/");
}
