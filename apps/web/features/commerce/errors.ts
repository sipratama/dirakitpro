export class CourseNotPurchasableError extends Error {
  constructor(message = "This course is not available for purchase.") {
    super(message);
    this.name = "CourseNotPurchasableError";
  }
}

// COM-016
export class AlreadyOwnedError extends Error {
  constructor(message = "You already own this course.") {
    super(message);
    this.name = "AlreadyOwnedError";
  }
}

// COM-006 (not ACTIVE / outside campaign window) or a nonexistent bundle slug
export class BundleNotPurchasableError extends Error {
  constructor(message = "This bundle is not available for purchase.") {
    super(message);
    this.name = "BundleNotPurchasableError";
  }
}

// COM-005 (wrong selection count) / COM-007 (not eligible or already owned)
export class BundleSelectionError extends Error {
  constructor(message = "Course selection is not valid for this bundle.") {
    super(message);
    this.name = "BundleSelectionError";
  }
}

export class OrderNotCancellableError extends Error {
  constructor(message = "Only a PENDING order can be cancelled.") {
    super(message);
    this.name = "OrderNotCancellableError";
  }
}

// Deliberately used for both "order doesn't exist" and "order belongs to someone
// else" so callers can't distinguish the two and leak an order's existence.
export class OrderOwnershipError extends Error {
  constructor(message = "Order not found.") {
    super(message);
    this.name = "OrderOwnershipError";
  }
}

// Nonexistent order, not PENDING, or its own expiresAt has already passed.
export class OrderNotPayableError extends Error {
  constructor(message = "This order can no longer be paid.") {
    super(message);
    this.name = "OrderNotPayableError";
  }
}
