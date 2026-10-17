const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { webcrypto } = require("node:crypto");

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => id in mocks ? mocks[id] : require(id), Request, Response, FormData, File, Buffer, URL, crypto: webcrypto, console: { error() {} }, process: { env: { NEXT_PUBLIC_SITE_URL: "https://shop.example" } } }, { filename: file });
  return module.exports;
}
const shared = load("src/lib/bespoke.ts");
const escape = load("src/lib/email/escape.ts");
const brief = { piece: "necklace", idea: "A star pendant with a little initial", budget: "guidance", occasion: "", desiredDate: "", name: "Test customer", phone: "+971501234567", email: "", emirate: "dubai", contactMethod: "whatsapp", locale: "ar", productSlug: "" };
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhXkAAAAASUVORK5CYII=", "base64");
function intake(options = {}) {
  const calls = { inserted: [], uploads: [], removed: [], emails: [] };
  const rows = new Map();
  const db = {
    from: () => ({
      select: () => ({ eq: (_, id) => ({ maybeSingle: async () => ({ data: rows.get(id) || null, error: null }) }) }),
      insert: async (row) => { calls.inserted.push(row); if (!options.databaseError) rows.set(row.id, row); return { error: options.databaseError ? { message: "failure" } : null }; },
      update: (value) => ({ eq: (_, id) => ({ eq: async () => { if (options.notificationWriteError) throw new Error("offline"); if (rows.has(id)) rows.set(id, { ...rows.get(id), ...value }); return { error: null }; } }) }),
    }),
    storage: { getBucket: async () => ({ data: { public: !!options.publicBucket } }), from: () => ({
      upload: async (path, bytes, config) => { calls.uploads.push({ path, bytes, config }); return { error: null }; },
      remove: async (paths) => { calls.removed.push(...paths); return { error: null }; },
    }) },
  };
  const alert = load("src/lib/email/sendBespokeAlert.ts", {
    "server-only": {}, "@/lib/bespoke": shared, "./escape": escape,
    "./resend": { FROM: "test@example.com", ADMIN_ALERT: "owner@example.com", resend: { emails: { send: async (message) => { calls.emails.push(message); if (options.emailError) throw new Error("offline"); return { error: null }; } } } },
  });
  const route = load("src/app/api/bespoke/route.ts", {
    "@/lib/supabase/admin": { supabaseAdmin: db }, "@/lib/bespoke": shared, "@/lib/email/sendBespokeAlert": alert,
    "@/lib/rateLimit": { clientIp: () => "test", rateLimited: () => !!options.rateLimited },
    "@/lib/email/resend": { FROM: "test@example.com", ADMIN_ALERT: "owner@example.com", resend: { emails: { send: async (message) => { calls.emails.push(message); if (options.emailError) throw new Error("offline"); return { error: null }; } } } },
  });
  return { route, calls };
}
function request(value = brief, image, key = webcrypto.randomUUID()) {
  const body = new FormData(); body.set("brief", JSON.stringify(value)); body.set("consent", "true"); body.set("requestKey", key);
  if (image) body.append("references", new Blob([image.bytes], { type: image.type }), "customer-private-name.png");
  return new Request("http://localhost/api/bespoke", { method: "POST", body });
}

test("WhatsApp requests need no email; invalid or oversized briefs are rejected", () => {
  assert.ok(shared.validateBespokeBrief(brief));
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "0501234567" }).phone, "+971501234567");
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "٠٥٠١٢٣٤٥٦٧" }).phone, "+971501234567");
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "00971 50 123 4567" }).phone, "+971501234567");
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "50 123 4567" }).phone, "+971501234567");
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "٥٠١٢٣٤٥٦٧" }).phone, "+971501234567");
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "+971 (0) 50 123 4567" }).phone, "+971501234567");
  assert.equal(shared.validateBespokeBrief({ ...brief, phone: "+501234567" }).phone, "+501234567");
  for (const invalid of [null, [], { ...brief, idea: "short" }, { ...brief, budget: "unlimited" }, { ...brief, email: {} }, { ...brief, contactMethod: "email" }, { ...brief, idea: "a".repeat(601) }, { ...brief, desiredDate: "2027-02-31" }, { ...brief, desiredDate: "2020-01-01" }]) assert.equal(shared.validateBespokeBrief(invalid), null);
});
test("stored requests remain readable after their desired date and reject malformed fields", () => {
  const stored = { ...brief, source: "mashaer-bespoke-v1", references: [], status: "new", desiredDate: "2020-01-01" };
  assert.ok(shared.parseBespokeBrief(JSON.stringify(stored)));
  assert.equal(shared.parseBespokeBrief(JSON.stringify({ ...stored, name: {} })), null);
  assert.equal(shared.parseBespokeBrief(JSON.stringify({ ...stored, contactMethod: "public" })), null);
});
test("rate limiting and malformed submissions cannot write or send email", async () => {
  const { route, calls } = intake({ rateLimited: true });
  assert.equal((await route.POST(request())).status, 429);
  assert.equal(calls.inserted.length, 0); assert.equal(calls.emails.length, 0);
  assert.equal((await intake().route.POST(request({ ...brief, name: {} }))).status, 400);
});
test("an SVG disguised as a JPEG is rejected before storage", async () => {
  const { route, calls } = intake();
  const response = await route.POST(request(brief, { bytes: "<svg onload='alert(1)'/>", type: "image/jpeg" }));
  assert.equal(response.status, 400); assert.equal(calls.uploads.length, 0); assert.equal(calls.inserted.length, 0);
});
test("a publicly configured reference bucket fails closed", async () => {
  const { route, calls } = intake({ publicBucket: true });
  assert.equal((await route.POST(request(brief, { bytes: png, type: "image/png" }))).status, 503);
  assert.equal(calls.uploads.length, 0); assert.equal(calls.inserted.length, 0);
});
test("failed persistence removes uploaded references and never reports success", async () => {
  const { route, calls } = intake({ databaseError: true });
  assert.equal((await route.POST(request(brief, { bytes: png, type: "image/png" }))).status, 502);
  assert.equal(calls.removed[0], calls.uploads[0].path); assert.equal(calls.emails.length, 0);
});
test("saved requests survive email outages and expose no private storage paths", async () => {
  const { route, calls } = intake({ emailError: true });
  const response = await route.POST(request(brief, { bytes: png, type: "image/png" }));
  const result = await response.json();
  assert.equal(response.status, 200); assert.equal(result.ok, true);
  assert.match(result.reference, /^MS-[A-F0-9]{8}$/);
  assert.ok(calls.uploads[0].path.startsWith(calls.inserted[0].id + "/"));
  assert.equal(calls.inserted[0].email, brief.phone);
  assert.ok(!calls.uploads[0].path.includes("customer-private-name"));
  assert.deepEqual(Object.keys(result).sort(), ["ok", "reference"]);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("retrying a saved submission creates no duplicate request, image or notification", async () => {
  const { route, calls } = intake();
  const key = webcrypto.randomUUID();
  const image = { bytes: png, type: "image/png" };
  const first = await (await route.POST(request(brief, image, key))).json();
  const second = await (await route.POST(request(brief, image, key))).json();
  assert.equal(first.reference, second.reference);
  assert.equal(calls.inserted.length, 1); assert.equal(calls.uploads.length, 1); assert.equal(calls.emails.length, 1);
  assert.equal((await route.POST(request({ ...brief, idea: "A changed customer idea" }, image, key))).status, 409);
});
test("notification status write outages cannot turn a saved request into a failure", async () => {
  const { route, calls } = intake({ notificationWriteError: true });
  const key = webcrypto.randomUUID();
  assert.equal((await route.POST(request(brief, undefined, key))).status, 200);
  assert.equal((await route.POST(request(brief, undefined, key))).status, 200);
  assert.equal(calls.inserted.length, 1); assert.equal(calls.emails.length, 1);
});
function adminRoute(user, isAdmin) {
  const counters = { privateQueries: 0, signatures: 0 };
  const mocks = {
    "server-only": {},
    "@/lib/bespoke": shared,
    "@/lib/supabase/server": { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) },
    "@/lib/supabase/admin": { supabaseAdmin: {
      from: (table) => {
        if (table !== "profiles") counters.privateQueries++;
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_admin: isAdmin } }) }) }) };
      }, storage: { from: () => ({ createSignedUrl: () => { counters.signatures++; } }) },
    } },
  };
  mocks["@/lib/bespokeAdmin"] = load("src/lib/bespokeAdmin.ts", mocks);
  mocks["@/lib/email/sendBespokeAlert"] = { sendBespokeAlert: async () => false };
  const route = load("src/app/api/admin/custom-requests/route.ts", mocks);
  const images = load("src/app/api/admin/custom-requests/reference/route.ts", mocks);
  return { route, images, counters };
}
test("signed-out users and regular customers cannot read requests or change status", async () => {
  for (const [user, isAdmin] of [[null, false], [{ id: "customer" }, false]]) {
    const { route, images, counters } = adminRoute(user, isAdmin);
    assert.equal((await route.GET(new Request("http://localhost/api/admin/custom-requests"))).status, 403);
    assert.equal((await route.PATCH(new Request("http://localhost/api/admin/custom-requests", { method: "PATCH", body: JSON.stringify({ id: "guess", status: "completed" }) }))).status, 403);
    assert.equal((await images.GET(new Request("http://localhost/api/admin/custom-requests/reference?request=" + webcrypto.randomUUID() + "&index=0"))).status, 403);
    assert.equal(counters.privateQueries, 0); assert.equal(counters.signatures, 0);
  }
});
