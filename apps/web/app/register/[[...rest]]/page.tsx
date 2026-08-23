import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-cream px-4 py-12">
      <SignUp path="/register" routing="path" signInUrl="/login" />
    </div>
  );
}
