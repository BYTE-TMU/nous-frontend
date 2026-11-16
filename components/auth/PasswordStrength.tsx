import Image from "next/image";
import { cn } from "@/lib/utils";

// Four-bar meter plus the checklist from the Step 3 frame. Informational only:
// the form still enforces just the minimum length, because the backend has not
// published its password rules.
export function passwordChecks(password: string) {
  const hasNumber = /\d/.test(password);
  return [
    { label: "Strong password", met: password.length >= 12 && hasNumber },
    { label: "8+ characters", met: password.length >= 8 },
    { label: "1 number", met: hasNumber },
    { label: "1 symbol", met: /[^A-Za-z0-9\s]/.test(password) },
  ];
}

export function PasswordStrength({ password }: { password: string }) {
  const checks = passwordChecks(password);
  const filled = checks.filter((check) => check.met).length;

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex gap-2" aria-hidden>
        {checks.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 min-w-0 flex-1 rounded-[3px]",
              index >= filled
                ? "bg-graphite"
                : index === filled - 1
                  ? "bg-signal-lime"
                  : "bg-impact-green",
            )}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              "flex items-center gap-1.5 text-[15px]",
              check.met ? "text-ash" : "text-smoke",
            )}
          >
            <Image
              src={check.met ? "/brand/dot-met.svg" : "/brand/dot-unmet.svg"}
              alt=""
              width={8}
              height={8}
            />
            {check.label}
            <span className="sr-only">{check.met ? "(met)" : "(not met)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
