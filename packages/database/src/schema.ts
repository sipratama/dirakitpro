import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums — every value below is a state or type explicitly enumerated in the
// PRD (DirakitPro_MVP_PRD_V1.0.md, section 10 for state machines, section 8/9
// for the rest). Do not add a value here that the PRD doesn't name.
// ---------------------------------------------------------------------------

export const userRole = pgEnum("user_role", ["LEARNER", "ADMIN"]);

export const courseStatus = pgEnum("course_status", [
  "DRAFT",
  "PUBLISHED",
  "UNPUBLISHED",
]); // CAT-003

export const lessonType = pgEnum("lesson_type", [
  "CONCEPT",
  "DEMO",
  "BUILD",
  "CHECKPOINT",
  "DEPLOY",
]); // 9.2

export const progressStatus = pgEnum("progress_status", [
  "NOT_STARTED",
  "STARTED",
  "COMPLETED",
]); // 10.5 (lesson progress); reused for BuildProgress evidence/state (11.1)

export const bundleType = pgEnum("bundle_type", ["FIXED", "CHOOSE_N"]); // 10.3

export const bundleStatus = pgEnum("bundle_status", [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "EXPIRED",
]); // 10.3

export const orderSourceType = pgEnum("order_source_type", [
  "DIRECT_COURSE",
  "BUNDLE",
]); // 10.1

export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "EXPIRED",
  "CANCELLED",
  "REFUNDED",
]); // 10.1

export const orderItemType = pgEnum("order_item_type", ["COURSE", "BUNDLE"]);

export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PAID", // 10.2 calls this "SETTLEMENT/PAID" — normalized to PAID to match Order vocabulary
  "FAILED",
  "EXPIRED",
  "REFUNDED",
]); // 10.2

export const enrollmentStatus = pgEnum("enrollment_status", [
  "ACTIVE",
  "COMPLETED",
  "REVOKED",
]); // 10.4

export const projectVisibility = pgEnum("project_visibility", [
  "PRIVATE",
  "PUBLIC",
]); // PRJ-003

export const projectModerationStatus = pgEnum("project_moderation_status", [
  "UNREVIEWED",
  "APPROVED",
  "REJECTED",
  "HIDDEN",
]); // PRJ-005

export const projectSubmissionState = pgEnum("project_submission_state", [
  "DRAFT",
  "SUBMITTED",
]); // 10.6

// ---------------------------------------------------------------------------
// Identity (11.1, 11.2, 14.2) — every other domain table references users.id,
// never a Clerk ID directly (IAM-004, 11.2).
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  username: varchar("username", { length: 64 }).notNull().unique(), // required by the /projects/[username]/[slug] route (12.1)
  displayName: varchar("display_name", { length: 120 }).notNull(),
  avatarUrl: text("avatar_url"),
  role: userRole("role").notNull().default("LEARNER"), // ADM-001 server-validated role check
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Normalized provider + provider_user_id -> User mapping (IAM-001, IAM-004, IAM-005, 11.1/11.2).
export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).notNull(), // e.g. "clerk"
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("auth_identities_provider_provider_user_id_idx").on(
      table.provider,
      table.providerUserId,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Catalog / Learning / Build (8.2, 8.4, 8.5, 9, 11.1)
// ---------------------------------------------------------------------------

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  outcomeDescription: text("outcome_description").notNull(), // CAT-002 "what-you-will-build"
  description: text("description").notNull(),
  difficulty: varchar("difficulty", { length: 40 }), // CAT-001; PRD doesn't enumerate fixed tiers, so free-text not an enum
  durationEstimate: varchar("duration_estimate", { length: 60 }), // CAT-001; PRD doesn't specify a structured unit
  thumbnailUrl: text("thumbnail_url"),
  status: courseStatus("status").notNull().default("DRAFT"), // CAT-003
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"), // CAT-004 free course support; COM-001 paid publish requires > 0
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  resources: jsonb("resources").notNull().default([]), // LRN-007: course-wide resource block array (Appendix G), same pattern as lessons.content
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export const courseStages = pgTable(
  "course_stages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    position: integer("position").notNull(), // BLD-004 stage ordering
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("course_stages_course_id_position_idx").on(table.courseId, table.position)],
);

export type CourseStage = typeof courseStages.$inferSelect;
export type NewCourseStage = typeof courseStages.$inferInsert;

// Product-oriented milestone attached to a course, optionally scoped to one stage (9.1, 11.1).
export const buildMilestones = pgTable("build_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  courseStageId: uuid("course_stage_id").references(() => courseStages.id, {
    onDelete: "cascade",
  }),
  title: varchar("title", { length: 200 }).notNull(), // e.g. "Database", "Authentication", "Deployment"
  description: text("description"),
  position: integer("position").notNull(),
  isRequired: boolean("is_required").notNull().default(true), // 10.7 course completion rule: required milestones
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type BuildMilestone = typeof buildMilestones.$inferSelect;
export type NewBuildMilestone = typeof buildMilestones.$inferInsert;

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }), // denormalized for the hot access-check/route path (15.1)
    courseStageId: uuid("course_stage_id")
      .notNull()
      .references(() => courseStages.id, { onDelete: "cascade" }),
    buildMilestoneId: uuid("build_milestone_id").references(() => buildMilestones.id, {
      onDelete: "set null",
    }), // CHECKPOINT lessons fulfill a milestone (BLD-002)
    slug: varchar("slug", { length: 160 }).notNull(), // route: /learn/[courseSlug]/[lessonSlug] (12.2)
    title: varchar("title", { length: 200 }).notNull(),
    type: lessonType("type").notNull(), // 9.2
    content: jsonb("content").notNull().default([]), // LRN-004 (Appendix G): block array — markdown/code/image/video/resource_link/task, array order = render order
    isRequired: boolean("is_required").notNull().default(true), // LRN-003/10.7 REQUIRED/OPTIONAL flag
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("lessons_course_id_slug_idx").on(table.courseId, table.slug)],
);

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

// ---------------------------------------------------------------------------
// Enrollment & progress (10.4, 10.5, 11.1)
// ---------------------------------------------------------------------------

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    orderId: uuid("order_id").references(() => orders.id), // nullable: free-course activation may skip Order entirely (10.4)
    status: enrollmentStatus("status").notNull().default("ACTIVE"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // 10.8 / COM-016: at most one ACTIVE-or-COMPLETED enrollment per user/course.
    // REVOKED rows are excluded so a revoked+repurchased course can enroll again.
    uniqueIndex("enrollments_active_user_course_idx")
      .on(table.userId, table.courseId)
      .where(sql`${table.status} in ('ACTIVE', 'COMPLETED')`),
  ],
);

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    status: progressStatus("status").notNull().default("NOT_STARTED"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("lesson_progress_user_id_lesson_id_idx").on(table.userId, table.lessonId)],
);

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;

export const buildProgress = pgTable(
  "build_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    buildMilestoneId: uuid("build_milestone_id")
      .notNull()
      .references(() => buildMilestones.id, { onDelete: "cascade" }),
    status: progressStatus("status").notNull().default("NOT_STARTED"), // BLD-002/BLD-003
    evidence: jsonb("evidence"), // 11.1 "completion evidence/state"
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("build_progress_user_id_milestone_id_idx").on(table.userId, table.buildMilestoneId),
  ],
);

export type BuildProgress = typeof buildProgress.$inferSelect;
export type NewBuildProgress = typeof buildProgress.$inferInsert;

// ---------------------------------------------------------------------------
// Commerce: bundles (10.3, 8.3, 11.1)
// ---------------------------------------------------------------------------

export const bundles = pgTable("bundles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  type: bundleType("type").notNull(), // FIXED | CHOOSE_N
  selectionCount: integer("selection_count"), // required (N) for CHOOSE_N, null for FIXED (COM-005)
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), // COM-006: independent of retail total
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  status: bundleStatus("status").notNull().default("DRAFT"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Bundle = typeof bundles.$inferSelect;
export type NewBundle = typeof bundles.$inferInsert;

// Eligible (CHOOSE_N) or included (FIXED) courses for a bundle (COM-004/COM-005/COM-007).
export const bundleCourses = pgTable(
  "bundle_courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bundleId: uuid("bundle_id")
      .notNull()
      .references(() => bundles.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("bundle_courses_bundle_id_course_id_idx").on(table.bundleId, table.courseId)],
);

// ---------------------------------------------------------------------------
// Commerce: orders, payments, grants (10.1, 10.2, 8.3, 11.1)
// ---------------------------------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    sourceType: orderSourceType("source_type").notNull(),
    status: orderStatus("status").notNull().default("PENDING"),
    courseId: uuid("course_id").references(() => courses.id), // set when sourceType = DIRECT_COURSE
    bundleId: uuid("bundle_id").references(() => bundles.id), // set when sourceType = BUNDLE
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(), // immutable snapshot (COM-002/COM-008)
    currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // drives PENDING -> EXPIRED (10.1); also COM-006 bundle-expiry-mid-checkout anchor
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // COM-015: no two simultaneous PENDING orders for the same user + course/bundle.
    uniqueIndex("orders_pending_user_course_idx")
      .on(table.userId, table.courseId)
      .where(sql`${table.status} = 'PENDING' and ${table.sourceType} = 'DIRECT_COURSE'`),
    uniqueIndex("orders_pending_user_bundle_idx")
      .on(table.userId, table.bundleId)
      .where(sql`${table.status} = 'PENDING' and ${table.sourceType} = 'BUNDLE'`),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// Priced snapshot line for the order (COM-002/COM-008) — course or bundle, never both.
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  itemType: orderItemType("item_type").notNull(),
  courseId: uuid("course_id").references(() => courses.id),
  bundleId: uuid("bundle_id").references(() => bundles.id),
  itemTitle: varchar("item_title", { length: 200 }).notNull(), // immutable title snapshot
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(), // immutable price snapshot
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// Immutable list of exact course(s) to enroll once the order is paid (COM-008/COM-011).
// One row for a direct-course order, one row per granted course for a bundle order.
export const orderCourseGrants = pgTable(
  "order_course_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    courseTitleSnapshot: varchar("course_title_snapshot", { length: 200 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("order_course_grants_order_id_course_id_idx").on(table.orderId, table.courseId),
  ],
);

export type OrderCourseGrant = typeof orderCourseGrants.$inferSelect;
export type NewOrderCourseGrant = typeof orderCourseGrants.$inferInsert;

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 32 }).notNull().default("MIDTRANS"), // COM-009
  providerTransactionId: varchar("provider_transaction_id", { length: 255 }),
  rawStatus: varchar("raw_status", { length: 64 }), // raw provider status, kept alongside the normalized one (10.2)
  normalizedStatus: paymentStatus("normalized_status").notNull().default("PENDING"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("IDR"),
  rawPayload: jsonb("raw_payload"), // sanitized provider payload for audit/debugging (11.3, 15.6)
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// ---------------------------------------------------------------------------
// Project & showcase (10.6, 8.6, 11.1)
// ---------------------------------------------------------------------------

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id), // PRJ-001: exactly one Project per Enrollment
    slug: varchar("slug", { length: 160 }).notNull(), // route: /projects/[username]/[slug] (12.1)
    title: varchar("title", { length: 200 }), // nullable: defaults to course title at read time, learner may override (PROJECT_SHOWCASE.md §2.1)
    description: text("description"),
    features: jsonb("features").notNull().default([]), // string[], learner-authored (PRJ-008)
    technologies: jsonb("technologies").notNull().default([]), // string[], learner-authored (PRJ-008)
    status: projectSubmissionState("status").notNull().default("DRAFT"), // 10.6: DRAFT -> SUBMITTED
    liveUrl: text("live_url"), // PRJ-002: validated well-formed http(s), required to reach SUBMITTED
    screenshotUrl: text("screenshot_url"), // PRJ-002 acceptance: pasted URL, not file upload
    repositoryUrl: text("repository_url"), // optional even at SUBMITTED (10.6)
    notes: text("notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    visibility: projectVisibility("visibility").notNull().default("PRIVATE"), // PRJ-003
    moderationStatus: projectModerationStatus("moderation_status").notNull().default("UNREVIEWED"), // PRJ-005
    moderationReason: text("moderation_reason"),
    isFeatured: boolean("is_featured").notNull().default(false), // PRJ-006
    publishedAt: timestamp("published_at", { withTimezone: true }), // first time visibility became PUBLIC
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("projects_enrollment_id_idx").on(table.enrollmentId),
    uniqueIndex("projects_user_id_slug_idx").on(table.userId, table.slug),
    // Serves the curated gallery query directly (PRJ-006: PUBLIC + APPROVED + FEATURED).
    // Not unique — many projects can satisfy this filter simultaneously.
    index("projects_gallery_idx")
      .on(table.visibility, table.moderationStatus, table.isFeatured)
      .where(sql`${table.visibility} = 'PUBLIC' and ${table.moderationStatus} = 'APPROVED' and ${table.isFeatured} = true`),
  ],
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// ---------------------------------------------------------------------------
// Admin (8.7, 11.1)
// ---------------------------------------------------------------------------

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nullable: most rows are an admin action, but a system-triggered
  // transition (e.g. BUNDLE_EXPIRED, 10.3's automatic ACTIVE -> EXPIRED) has
  // no admin actor. Null means "system-triggered", not "unknown admin".
  adminUserId: uuid("admin_user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // e.g. "COURSE_PUBLISHED", "BUNDLE_ACTIVATED", "PROJECT_MODERATED"
  targetType: varchar("target_type", { length: 40 }).notNull(), // "course" | "bundle" | "order" | "payment" | "project"
  targetId: uuid("target_id").notNull(),
  reason: text("reason"),
  beforeData: jsonb("before_data"),
  afterData: jsonb("after_data"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), // ADM-008: DB-level record, no dedicated admin UI required for MVP
});

export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type NewAdminAuditLog = typeof adminAuditLogs.$inferInsert;
