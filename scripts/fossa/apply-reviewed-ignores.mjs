#!/usr/bin/env node

const API_BASE = process.env.FOSSA_API_BASE || "https://app.fossa.com/api";
const PROJECT_LOCATOR =
  process.env.FOSSA_PROJECT_LOCATOR || "git+github.com/RazonIn4K/shopmatch-pro";
const DEFAULT_REVISION =
  process.env.FOSSA_TARGET_REVISION ||
  "e0ff828281cc9fe8ba377315526e7e6d01869a06";
const CONFIRMATION = "apply-reviewed-fossa-ignores-for-shopmatch-pro";

const expectedLicensingIssueIds = new Set([
  17742268,
  17742267,
  17592533,
  16727735,
  14125305,
  14125309,
  14125306,
  14125313,
  14125303,
  14125314,
  14125308,
  14125307,
  14125299,
  14125300,
  14125310,
  14125312,
  14125311,
  14125302,
]);

const licensingNote = [
  "Reviewed 2026-06-16 for ShopMatch Pro.",
  "CC-BY-SA findings are non-code artwork/license-file attributions",
  "(Next.js glob logo and highlight.js artwork/assets) that this app does not use or distribute.",
  "MPL-2.0 findings are unmodified Next.js/@vercel/og/satori and @axe-core/playwright usage.",
  "LGPL-3.0-or-later sharp/libvips packages are unmodified transitive native image libraries",
  "loaded through sharp/Next.js, with source available upstream.",
].join(" ");

const qualityNote = [
  "Reviewed 2026-06-16 for ShopMatch Pro.",
  "Transitive quality/staleness findings only from the Major - 3 Policy semver outdated rule.",
  "FOSSA security issue count is zero and npm audit --omit=dev is clean.",
].join(" ");

const args = parseArgs(process.argv.slice(2));
const token = process.env.FOSSA_API_KEY || process.env.FOSSA_API_TOKEN;

if (args.help) {
  printUsage();
  process.exit(0);
}

if (!token) {
  fail("FOSSA_API_KEY or FOSSA_API_TOKEN is required.");
}

if (args.apply && args.confirm !== CONFIRMATION) {
  fail(`Refusing to apply without --confirm ${CONFIRMATION}`);
}

const revision = args.revision || DEFAULT_REVISION;

console.log(`FOSSA project: ${PROJECT_LOCATOR}`);
console.log(`Target revision: ${revision}`);
console.log(`Mode: ${args.apply ? "apply" : "dry-run"}`);

const categories = await getJson("/v2/issues/categories", {
  "scope[type]": "project",
  "scope[id]": PROJECT_LOCATOR,
  "scope[revision]": revision,
});

console.log("Active issue counts:");
console.log(`  licensing: ${Number(categories.licensing ?? 0)}`);
console.log(`  quality: ${Number(categories.quality ?? 0)}`);
console.log(`  vulnerability: ${Number(categories.vulnerability ?? 0)}`);

if (Number(categories.vulnerability ?? 0) !== 0) {
  fail("Refusing to continue because FOSSA reports active vulnerability issues.");
}

const licensingIssues = await listIssues("licensing", {
  "scope[revision]": revision,
  count: "100",
});
const qualityIssues = await listIssues("quality", {
  "scope[revision]": revision,
  "filter[type][]": "outdated_dependency",
  count: "100",
});

const activeLicensingIds = licensingIssues.map(getIssueId);
const missingLicensingIds = activeLicensingIds.filter((id) => !Number.isFinite(id));

if (missingLicensingIds.length > 0) {
  fail("FOSSA returned licensing issues without numeric IDs; refusing to apply ignores.");
}

const unreviewedLicensing = licensingIssues.filter((issue) => {
  const id = getIssueId(issue);
  return Number.isFinite(id) && !expectedLicensingIssueIds.has(id);
});

console.log(`Reviewed active licensing issues found: ${activeLicensingIds.length}`);
console.log(`Reviewed active quality issues found: ${qualityIssues.length}`);

if (unreviewedLicensing.length > 0) {
  console.error("Unreviewed active licensing issues were returned by FOSSA:");
  for (const issue of unreviewedLicensing) {
    console.error(`  - ${formatIssue(issue)}`);
  }
  fail("Refusing to bulk-ignore licensing issues that are not in the reviewed issue ID set.");
}

if (Number(categories.licensing ?? 0) > 0 && licensingIssues.length === 0) {
  fail("FOSSA reports active licensing issues, but the script could not list them.");
}

if (Number(categories.quality ?? 0) > 0 && qualityIssues.length === 0) {
  fail("FOSSA reports active quality issues, but no outdated_dependency issues were listed.");
}

if (!args.apply) {
  console.log("");
  console.log("Dry run complete. No FOSSA issues were changed.");
  console.log(`To apply, rerun with --apply --confirm ${CONFIRMATION}`);
  process.exit(0);
}

let changed = 0;

if (licensingIssues.length > 0) {
  const result = await putJson(
    "/v2/issues",
    {
      category: "licensing",
      "scope[type]": "project",
      "scope[id]": PROJECT_LOCATOR,
      "scope[revision]": revision,
      ...arrayParams("ids[]", activeLicensingIds.map(String)),
    },
    {
      type: "ignore",
      notes: licensingNote,
    },
  );
  changed += extractChangedCount(result);
  console.log(`Applied reviewed licensing ignores: ${extractChangedCount(result)}`);
}

if (qualityIssues.length > 0) {
  const result = await putJson(
    "/v2/issues",
    {
      category: "quality",
      "scope[type]": "project",
      "scope[id]": PROJECT_LOCATOR,
      "scope[revision]": revision,
      "filter[type][]": "outdated_dependency",
    },
    {
      type: "ignore",
      notes: qualityNote,
    },
  );
  changed += extractChangedCount(result);
  console.log(`Applied reviewed quality ignores: ${extractChangedCount(result)}`);
}

const after = await getJson("/v2/issues/categories", {
  "scope[type]": "project",
  "scope[id]": PROJECT_LOCATOR,
  "scope[revision]": revision,
});

console.log("Post-apply active issue counts:");
console.log(`  licensing: ${Number(after.licensing ?? 0)}`);
console.log(`  quality: ${Number(after.quality ?? 0)}`);
console.log(`  vulnerability: ${Number(after.vulnerability ?? 0)}`);
console.log(`Total affected issues reported by FOSSA: ${changed}`);

if (
  Number(after.licensing ?? 0) !== 0 ||
  Number(after.quality ?? 0) !== 0 ||
  Number(after.vulnerability ?? 0) !== 0
) {
  fail("FOSSA still reports active issues after applying reviewed ignores.");
}

function parseArgs(argv) {
  const parsed = {
    apply: false,
    confirm: "",
    help: false,
    revision: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") {
      parsed.apply = true;
    } else if (arg === "--help" || arg === "-h") {
      parsed.help = true;
    } else if (arg === "--confirm") {
      parsed.confirm = argv[++i] || "";
    } else if (arg.startsWith("--confirm=")) {
      parsed.confirm = arg.slice("--confirm=".length);
    } else if (arg === "--revision") {
      parsed.revision = argv[++i] || "";
    } else if (arg.startsWith("--revision=")) {
      parsed.revision = arg.slice("--revision=".length);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function printUsage() {
  console.log(`Usage:
  node scripts/fossa/apply-reviewed-ignores.mjs [--revision <sha>]
  node scripts/fossa/apply-reviewed-ignores.mjs --apply --confirm ${CONFIRMATION}

Environment:
  FOSSA_API_KEY or FOSSA_API_TOKEN must be set.
  FOSSA_PROJECT_LOCATOR and FOSSA_TARGET_REVISION can override defaults.`);
}

async function listIssues(category, extraParams = {}) {
  const data = await getJson("/v2/issues", {
    category,
    "scope[type]": "project",
    "scope[id]": PROJECT_LOCATOR,
    status: "active",
    ...extraParams,
  });

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.issues) ? data.issues : [];
}

async function getJson(path, params) {
  return requestJson("GET", path, params);
}

async function putJson(path, params, body) {
  return requestJson("PUT", path, params, body);
}

async function requestJson(method, path, params, body) {
  const url = new URL(`${API_BASE}${path}`);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params || {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  }

  url.search = searchParams.toString();

  const response = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsed = parseJson(text);

  if (!response.ok) {
    const detail = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    fail(`FOSSA API ${method} ${path} failed with ${response.status}: ${detail}`);
  }

  return parsed;
}

function parseJson(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function arrayParams(name, values) {
  return values.reduce((params, value) => {
    if (!params[name]) {
      params[name] = [];
    }
    params[name].push(value);
    return params;
  }, {});
}

function extractChangedCount(result) {
  if (typeof result === "number") {
    return result;
  }

  for (const key of ["count", "updated", "affected", "affectedIssues"]) {
    if (Number.isFinite(Number(result?.[key]))) {
      return Number(result[key]);
    }
  }

  return 0;
}

function formatIssue(issue) {
  const id = getIssueId(issue) || "unknown-id";
  const type = issue.type ?? issue.humanReadableType ?? "unknown-type";
  const locator =
    issue.revisionId ??
    issue.revisionLocator ??
    issue.dependencyRevisionLocator ??
    issue.locator ??
    issue.packageLocator ??
    issue.package?.locator ??
    issue.package?.name ??
    "unknown-locator";
  return `${id} ${type} ${locator}`;
}

function getIssueId(issue) {
  return Number(issue.id ?? issue.issueId);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
