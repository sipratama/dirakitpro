// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetProjectForModeration = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
);

vi.mock("@/features/admin/get-project-for-moderation", () => ({ getProjectForModeration: mockGetProjectForModeration }));
vi.mock("next/navigation", () => ({ notFound: mockNotFound }));
vi.mock("./actions", () => ({
  moderateProjectAction: vi.fn(),
  toggleProjectFeaturedAction: vi.fn(),
}));

const { default: AdminProjectDetailPage } = await import("./page");

function callPage(projectId: string) {
  return AdminProjectDetailPage({ params: Promise.resolve({ projectId }), searchParams: Promise.resolve({}) });
}

const BASE_PROJECT = {
  id: "p1",
  title: "Personal Website Saya",
  description: "Website portofolio",
  features: ["Responsive"],
  technologies: ["HTML"],
  liveUrl: "https://example.com",
  screenshotUrl: "https://placehold.co/800x600",
  moderationStatus: "UNREVIEWED",
  moderationReason: null,
  isFeatured: false,
  learnerDisplayName: "Budi",
  learnerUsername: "budi",
  courseTitle: "Rakitan Pertama",
};

describe("AdminProjectDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("404s when the project doesn't exist", async () => {
    mockGetProjectForModeration.mockResolvedValue(null);
    await expect(callPage("p1")).rejects.toThrow("NOT_FOUND");
  });

  it("renders full project content: title, learner, description, features, technologies, live URL", async () => {
    mockGetProjectForModeration.mockResolvedValue(BASE_PROJECT);

    render(await callPage("p1"));

    expect(screen.getByRole("heading", { name: "Personal Website Saya" })).toBeInTheDocument();
    expect(screen.getByText(/Budi \(budi\)/)).toBeInTheDocument();
    expect(screen.getByText("Website portofolio")).toBeInTheDocument();
    expect(screen.getByText("Responsive")).toBeInTheDocument();
    expect(screen.getByText("HTML")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Lihat live project/ })).toHaveAttribute("href", "https://example.com");
  });

  it("shows Approve, Reject, and Hide actions, with a required reason field only on Reject/Hide", async () => {
    mockGetProjectForModeration.mockResolvedValue(BASE_PROJECT);

    render(await callPage("p1"));

    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide" })).toBeInTheDocument();

    const reasonFields = screen.getAllByLabelText(/Alasan/);
    expect(reasonFields).toHaveLength(2);
    reasonFields.forEach((field) => expect(field).toBeRequired());
  });

  it("disables the 'Jadikan Featured' button when the project isn't APPROVED", async () => {
    mockGetProjectForModeration.mockResolvedValue({ ...BASE_PROJECT, moderationStatus: "UNREVIEWED" });

    render(await callPage("p1"));

    expect(screen.getByRole("button", { name: "Jadikan Featured" })).toBeDisabled();
  });

  it("enables the 'Jadikan Featured' button once APPROVED", async () => {
    mockGetProjectForModeration.mockResolvedValue({ ...BASE_PROJECT, moderationStatus: "APPROVED" });

    render(await callPage("p1"));

    expect(screen.getByRole("button", { name: "Jadikan Featured" })).not.toBeDisabled();
  });

  it("shows 'Un-feature' instead of 'Jadikan Featured' once the project is already featured", async () => {
    mockGetProjectForModeration.mockResolvedValue({ ...BASE_PROJECT, moderationStatus: "APPROVED", isFeatured: true });

    render(await callPage("p1"));

    expect(screen.getByRole("button", { name: "Un-feature" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Jadikan Featured" })).not.toBeInTheDocument();
  });

  it("shows the moderation reason for a REJECTED project", async () => {
    mockGetProjectForModeration.mockResolvedValue({
      ...BASE_PROJECT,
      moderationStatus: "REJECTED",
      moderationReason: "Live URL tidak bisa diakses",
    });

    render(await callPage("p1"));

    expect(screen.getByText(/Live URL tidak bisa diakses/)).toBeInTheDocument();
  });
});
