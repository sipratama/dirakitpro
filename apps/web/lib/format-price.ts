const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

// CAT-004: a course/bundle priced at exactly 0 is FREE — shown as "Gratis"
// rather than "Rp0" so it doesn't read like a pricing glitch.
export function formatPrice(price: string | number): string {
  const amount = Number(price);
  return amount === 0 ? "Gratis" : idrFormatter.format(amount);
}
