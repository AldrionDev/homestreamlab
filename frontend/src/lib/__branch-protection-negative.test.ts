import { test, expect } from "vitest";

// Disposable check for issue #135 branch-protection enforcement. DO NOT MERGE.
// This file intentionally fails the Frontend CI check to prove that branch
// protection on `main` blocks merging a PR with a failing required check.
// It must be removed together with its throwaway branch/PR after verification.
test("intentional failure to prove branch protection blocks merge", () => {
  expect(1).toBe(2);
});
