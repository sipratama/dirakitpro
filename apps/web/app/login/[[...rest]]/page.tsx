import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-cream px-4 py-12">
      <SignIn path="/login" routing="path" signUpUrl="/register" />
    </div>
  );
}
