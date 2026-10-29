import { test } from "node:test";
import assert from "node:assert/strict";
import { saveWaitlist, savePartnerApplication, __resetLocalRepos } from "../lib/database/repos.ts";

test("local mode: first sign-up persists locally, second with the same email is a duplicate", async () => {
  __resetLocalRepos();
  const entry = { firstName: "Sam", email: "sam@example.com", country: "Demo Country", interest: "everything", consent: true };
  const a = await saveWaitlist(entry);
  assert.deepEqual(a, { mode: "local", ok: true });
  const b = await saveWaitlist(entry);
  assert.equal(b.ok, false);
  assert.equal(b.duplicate, true);
});

test("local mode: partner applications dedupe on email + business", async () => {
  __resetLocalRepos();
  const app = { businessName: "Brine & Bloom", contactName: "Jo", email: "jo@example.com", city: "Demo City", country: "Demo Country", category: "dining", consent: true };
  assert.equal((await savePartnerApplication(app)).ok, true);
  assert.equal((await savePartnerApplication(app)).duplicate, true);
  assert.equal((await savePartnerApplication({ ...app, businessName: "Other" })).ok, true);
});
