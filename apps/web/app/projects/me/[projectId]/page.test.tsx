// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetProjectForOwner = vi.hoisted(() => vi.fn());
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
vi.mock("@/features/project/get-project-for-owner", () => ({ getProjectForOwner: mockGetProjectForOwner }));
vi.mock("next/navigation", () => ({ redirect: mockRedirect, notFound: mockNotFound }));
vi.mock("./actions", () => ({
  updateProjectSubmissionAction: vi.fn(),
  setProjectVisibilityAction: vi.fn(),
}));

const { default: EditProjectPage } = await import("./page");

function callPage(projectId: string) {
  return EditProjectPage({ params: Promise.resolve({ projectId }), searchParams: Promise.resolve({}) });
}

const BASE_PROJECT = {
  id: "p1",
  title: null,
  description: null,
  features: [],
  technologies: [],
  status: "DRAFT",
  liveUrl: null,
  screenshotUrl: null,
  repositoryUrl: null,
  notes: null,
  visibility: "PRIVATE",
  moderationStatus: "UNREVIEWED",
  moderationReason: null,
};

describe("EditProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    mockNotFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
  });

  it("redirects to /login when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(callPage("p1")).rejects.toThrow("REDIRECT:/login");
  });

  it("404s when the project doesn't belong to the caller (or doesn't exist)", async () => {
    mockGetProjectForOwner.mockResolvedValue(null);
    await expect(callPage("p1")).rejects.toThrow("NOT_FOUND");
  });

  it("renders the submission form pre-filled with existing values", async () => {
    mockGetProjectForOwner.mockResolvedValue({
      ...BASE_PROJECT,
      description: "Website portofolio",
      liveUrl: "https://example.com",
    });

    render(await callPage("p1"));

    expect(screen.getByRole("textbox", { name: /Deskripsi/ })).toHaveValue("Website portofolio");
    expect(screen.getByRole("textbox", { name: /Live URL/ })).toHaveValue("https://example.com");
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
  });

  it("shows a message instead of the publish form while still DRAFT", async () => {
    mockGetProjectForOwner.mockResolvedValue(BASE_PROJECT);

    render(await callPage("p1"));

    expect(screen.getByText(/Selesaikan submission/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publikasikan" })).not.toBeInTheDocument();
  });

  it("shows the publication declaration checkbox and publish button once SUBMITTED and still PRIVATE", async () => {
    mockGetProjectForOwner.mockResolvedValue({ ...BASE_PROJECT, status: "SUBMITTED" });

    render(await callPage("p1"));

    expect(screen.getByRole("checkbox")).toBeRequired();
    expect(screen.getByRole("button", { name: "Publikasikan" })).toBeInTheDocument();
  });

  it("shows the 'jadikan privat' action and moderation status once PUBLIC", async () => {
    mockGetProjectForOwner.mockResolvedValue({
      ...BASE_PROJECT,
      status: "SUBMITTED",
      visibility: "PUBLIC",
      moderationStatus: "APPROVED",
    });

    render(await callPage("p1"));

    expect(screen.getByRole("button", { name: "Jadikan privat" })).toBeInTheDocument();
    expect(screen.getByText(/Disetujui/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publikasikan" })).not.toBeInTheDocument();
  });

  it("shows the moderation reason for a REJECTED project", async () => {
    mockGetProjectForOwner.mockResolvedValue({
      ...BASE_PROJECT,
      status: "SUBMITTED",
      visibility: "PUBLIC",
      moderationStatus: "REJECTED",
      moderationReason: "Live URL tidak bisa diakses",
    });

    render(await callPage("p1"));

    expect(screen.getByText(/Live URL tidak bisa diakses/)).toBeInTheDocument();
  });
});
