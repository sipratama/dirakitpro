import { SignIn } from "@clerk/nextjs";

// IAM-003: forgot-password/reset-password is Clerk's own capability — mounting
// <SignIn/> here gives it a dedicated route while reusing the same built-in flow
// (its "Forgot password?" link) rather than building a custom reset UI.
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-cream px-4 py-12">
      <SignIn path="/forgot-password" routing="path" signUpUrl="/register" />
    </div>
  );
}
