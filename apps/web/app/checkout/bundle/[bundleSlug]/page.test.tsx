// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockCreateBundleOrder = vi.hoisted(() => vi.fn());
const mockGetBundleBySlug = vi.hoisted(() => vi.fn());
const mockCreateSnapToken = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@dirakitpro/auth", () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock("@/features/commerce/create-bundle-order", () => ({ createBundleOrder: mockCreateBundleOrder }));
vi.mock("@/features/catalog/get-bundle-by-slug", () => ({ getBundleBySlug: mockGetBundleBySlug }));
vi.mock("@/features/commerce/create-snap-token", () => ({ createSnapToken: mockCreateSnapToken }));
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
  notFound: mockNotFound,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("./actions", () => ({ cancelMismatchedOrderAction: vi.fn() }));

const { default: BundleCheckoutPage } = await import("./page");
const { BundleNotPurchasableError, BundleSelectionError } = await import("@/features/commerce/errors");

function callPage(bundleSlug: string, coursesParam?: string) {
  return BundleCheckoutPage({
    params: Promise.resolve({ bundleSlug }),
    searchParams: Promise.resolve(coursesParam ? { courses: coursesParam } : {}),
  });
}

describe("BundleCheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mockGetCurrentUser.mockResolvedValue({ id: "user-1", email: "learner@example.com" });
  });

  it("shows a 'cancel & reselect' form when the existing order's selection doesn't match the new one", async () => {
    mockCreateBundleOrder.mockResolvedValue({
      kind: "existing_order_selection_mismatch",
      existingOrder: { id: "order-old" },
    });

    const page = await callPage("paket-merdeka", "course-a,course-c");
    render(page);

    expect(screen.getByText(/pilihan course yang berbeda/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Batalkan/ })).toBeInTheDocument();
    expect(mockCreateSnapToken).not.toHaveBeenCalled();
  });

  it("renders an inline error (not a 404) when the bundle isn't currently purchasable", async () => {
    mockCreateBundleOrder.mockRejectedValue(new BundleNotPurchasableError("Bundle ini sedang tidak aktif."));

    const page = await callPage("paket-merdeka", "course-a,course-b");
    render(page);

    expect(screen.getByText("Bundle ini sedang tidak aktif.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali ke halaman bundle" })).toHaveAttribute(
      "href",
      "/bundles/paket-merdeka",
    );
  });

  it("renders an inline error for an invalid CHOOSE_N selection (COM-005)", async () => {
    mockCreateBundleOrder.mockRejectedValue(new BundleSelectionError("Pilih tepat 2 course untuk membeli bundle ini."));

    const page = await callPage("paket-merdeka", "course-a");
    render(page);

    expect(screen.getByText("Pilih tepat 2 course untuk membeli bundle ini.")).toBeInTheDocument();
  });

  it("renders the order summary and Snap checkout trigger for a successfully created/reused order", async () => {
    mockCreateBundleOrder.mockResolvedValue({ kind: "order_created", order: { id: "order-1" } });
    mockGetBundleBySlug.mockResolvedValue({ title: "Paket Merdeka", price: "299000" });
    mockCreateSnapToken.mockResolvedValue("snap-token-abc");

    const page = await callPage("paket-merdeka", "course-a,course-b");
    render(page);

    expect(screen.getByText("Paket Merdeka")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bayar sekarang" })).toBeInTheDocument();
    expect(mockCreateSnapToken).toHaveBeenCalledWith("order-1");
  });
});
