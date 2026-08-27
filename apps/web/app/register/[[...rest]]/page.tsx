import { SignUp } from "@clerk/nextjs";
import { getCurrentUser } from "@dirakitpro/auth";
import { PublicHeader } from "@/components/home/public-header";
import { PublicFooter } from "@/components/home/public-footer";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  return (
    <>
      {await PublicHeader({ user })}
      <main className="flex flex-1 items-center justify-center bg-brand-cream px-4 py-12">
        <div className="flex w-full flex-col items-center gap-8">
          <h1 className="text-center text-h1 text-brand-ink">Gabung dan mulai merakit.</h1>
          <SignUp path="/register" routing="path" signInUrl="/login" forceRedirectUrl="/dashboard" />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
