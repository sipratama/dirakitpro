// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockCreateCourseOrder = vi.hoisted(() => vi.fn());
const mockGetCourseBySlug = vi.hoisted(() => vi.fn());
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
vi.mock("@/features/commerce/create-course-order", () => ({ createCourseOrder: mockCreateCourseOrder }));
vi.mock("@/features/catalog/get-course-by-slug", () => ({ getCourseBySlug: mockGetCourseBySlug }));
vi.mock("@/features/commerce/create-snap-token", () => ({ createSnapToken: mockCreateSnapToken }));
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
  notFound: mockNotFound,
  useRouter: () => ({ push: vi.fn() }),
}));

const { default: CourseCheckoutPage } = await import("./page");
const { AlreadyOwnedError, CourseNotPurchasableError } = await import("@/features/commerce/errors");

function callPage(courseSlug: string) {
  return CourseCheckoutPage({
    params: Promise.resolve({ courseSlug }),
    searchParams: Promise.resolve({}),
  });
}

describe("CourseCheckoutPage", () => {
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

  it("redirects server-side to /learn/[slug] for a free course, without ever calling createSnapToken", async () => {
    mockCreateCourseOrder.mockResolvedValue({ kind: "free_enrolled", courseSlug: "free-course" });

    await expect(callPage("free-course")).rejects.toThrow("REDIRECT:/learn/free-course");
    expect(mockCreateSnapToken).not.toHaveBeenCalled();
  });

  it("redirects to /learn/[slug] instead of erroring when the learner already owns the course (COM-016)", async () => {
    mockCreateCourseOrder.mockRejectedValue(new AlreadyOwnedError());

    await expect(callPage("owned-course")).rejects.toThrow("REDIRECT:/learn/owned-course");
  });

  it("404s for a nonexistent/unpublished course slug", async () => {
    mockCreateCourseOrder.mockRejectedValue(new CourseNotPurchasableError());

    await expect(callPage("bad-slug")).rejects.toThrow("NOT_FOUND");
  });

  it("renders the order summary and a Snap checkout trigger for a paid course order", async () => {
    mockCreateCourseOrder.mockResolvedValue({ kind: "order_created", order: { id: "order-1" } });
    mockGetCourseBySlug.mockResolvedValue({
      title: "Rakit Aplikasi Keuangan Pribadi",
      outcomeDescription: "Outcome",
      price: "149000",
      slug: "rakit-aplikasi-keuangan-pribadi",
    });
    mockCreateSnapToken.mockResolvedValue("snap-token-abc");

    const page = await callPage("rakit-aplikasi-keuangan-pribadi");
    render(page);

    expect(screen.getByText("Rakit Aplikasi Keuangan Pribadi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bayar sekarang" })).toBeInTheDocument();
    expect(mockCreateSnapToken).toHaveBeenCalledWith("order-1");
  });
});
