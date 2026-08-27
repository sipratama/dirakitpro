import { SignIn } from "@clerk/nextjs";
import { getCurrentUser } from "@dirakitpro/auth";
import { PublicHeader } from "@/components/home/public-header";
import { PublicFooter } from "@/components/home/public-footer";

// IAM-003: forgot-password/reset-password is Clerk's own capability — mounting
// <SignIn/> here gives it a dedicated route while reusing the same built-in flow
// (its "Forgot password?" link) rather than building a custom reset UI.
export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  return (
    <>
      {await PublicHeader({ user })}
      <main className="flex flex-1 items-center justify-center bg-brand-cream px-4 py-12">
        <div className="flex w-full flex-col items-center gap-8">
          <h1 className="text-center text-h1 text-brand-ink">Atur ulang kata sandimu.</h1>
          <SignIn path="/forgot-password" routing="path" signUpUrl="/register" />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
