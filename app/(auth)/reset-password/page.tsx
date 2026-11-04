import type { Metadata } from "next";
import { PasswordResetFlow } from "../../../components/auth/PasswordResetFlow";

export const metadata: Metadata = { title: "Reset password · Nous" };

export default function ResetPasswordPage() {
  return <PasswordResetFlow />;
}
