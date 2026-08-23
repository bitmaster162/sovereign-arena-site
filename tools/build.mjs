import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "site");
const output = path.join(root, "dist");
const expected = [
  "ai-audit.html",
  "boards.html",
  "continuityos.html",
  "grids.html",
  "guide.html",
  "index.html",
  "pulse-status.json",
  "pulse.html",
  "research-log.html",
  "sovereign-twin.html",
  "triage.html",
  "vercel.json",
];

const actual = (await readdir(source)).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(
    `Strict deployment allowlist mismatch.\nExpected: ${expected.join(", ")}\nActual: ${actual.join(", ")}`,
  );
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of expected) {
  const sourcePath = path.join(source, name);
  if (!(await stat(sourcePath)).isFile()) throw new Error(`${name} is not a file`);
  const sourceText = await readFile(sourcePath, "utf8");
  const canonicalText = sourceText.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  await writeFile(path.join(output, name), canonicalText, {
    encoding: "utf8",
    flag: "wx",
  });
}

console.log(
  JSON.stringify(
    {
      result: "PASS",
      source: "site",
      output: "dist",
      deployment_files: expected.length,
      build_model: "static-prebuilt-allowlist",
      text_encoding: "UTF-8",
      line_endings: "LF",
      external_dependencies: 0,
      approved: false,
      can_trade: false,
      capital_permission: "DENY",
    },
    null,
    2,
  ),
);
