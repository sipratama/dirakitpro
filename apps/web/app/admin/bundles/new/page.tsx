import { Button } from "@/components/ui/button";
import { BundleFormFields, EMPTY_BUNDLE_FORM_DEFAULTS } from "../bundle-form-fields";
import { createBundleAction } from "./actions";

export default function NewBundlePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-h1 text-brand-ink">Bundle baru</h1>
      <p className="mt-1 text-small text-neutral-600">Eligible courses dikelola setelah bundle dibuat.</p>

      <form action={createBundleAction} className="mt-8 flex flex-col gap-5">
        <BundleFormFields defaults={EMPTY_BUNDLE_FORM_DEFAULTS} typeLocked={false} />
        <Button type="submit">Simpan sebagai draft</Button>
      </form>
    </div>
  );
}
