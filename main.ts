// "Make the AI Judge Laugh: The Office Joke Open" — entry writer (v2).
//
// The joke itself is data, not logic: a single office one-liner about HR
// rewriting a job description after a spreadsheet-related breakdown.
// Everything below exists only to get that line, byte for byte, into
// `$MAKEFUN_OUTPUT_DIR/entry.txt` with no trailing newline, and to refuse
// loudly instead of writing a line the competition would reject.
//
// Runtime contract:
//   - Node 22, standard library only. No network, no randomness, no clock.
//   - Output directory comes from MAKEFUN_OUTPUT_DIR, defaulting to
//     /output when the variable is unset or empty.
//   - stdout echoes the line once, for human visibility; the file is the
//     artifact that counts.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ---------------------------------------------------------------------------
// The entry
// ---------------------------------------------------------------------------

// Assembled from parts so the line is readable in source without changing
// a single character of the submitted text.
const ENTRY_PARTS = [
  "HR added 'passionate about spreadsheets' to my job description",
  "after catching me crying into a pivot table.",
] as const;

const ENTRY = ENTRY_PARTS.join(" ");

// ---------------------------------------------------------------------------
// Competition rules, expressed as data
// ---------------------------------------------------------------------------

interface EntryRules {
  minChars: number;
  maxChars: number;
  // The line must be a single line: no newline or carriage return anywhere.
  forbiddenPattern: RegExp;
  // At least one non-whitespace character must survive trimming.
  nonWhitespacePattern: RegExp;
}

const RULES: EntryRules = {
  minChars: 1,
  maxChars: 200,
  forbiddenPattern: /[\n\r]/,
  nonWhitespacePattern: /\S/,
};

interface CheckResult {
  ok: boolean;
  problems: string[];
}

// ---------------------------------------------------------------------------
// Validation — every rule is checked and every failure is named
// ---------------------------------------------------------------------------

function countCodePoints(text: string): number {
  return Array.from(text).length;
}

function validateEntry(text: string, rules: EntryRules): CheckResult {
  const problems: string[] = [];
  const length = countCodePoints(text);

  if (length < rules.minChars) {
    problems.push(`entry is empty (needs at least ${rules.minChars} char)`);
  }
  if (length > rules.maxChars) {
    problems.push(
      `entry is ${length} chars, over the ${rules.maxChars} char limit`,
    );
  }
  if (rules.forbiddenPattern.test(text)) {
    problems.push("entry must be a single line (no newline or CR)");
  }
  if (!rules.nonWhitespacePattern.test(text)) {
    problems.push("entry is only whitespace");
  }

  return { ok: problems.length === 0, problems };
}

// ---------------------------------------------------------------------------
// Output — resolve the directory, create it, write exactly ENTRY
// ---------------------------------------------------------------------------

function resolveOutputDir(): string {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  const dir = raw !== undefined && raw.trim() !== "" ? raw : "/output";
  return resolve(dir);
}

function writeEntry(text: string, dir: string): void {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  // writeFileSync with a plain string writes exactly these bytes — no
  // trailing newline is appended by anything in this program.
  writeFileSync(target, text, { encoding: "utf8" });
  // Read the file back and confirm it is byte-for-byte the entry; a
  // mismatch here means the submission would be wrong, so fail loudly.
  if (readFileSync(target, "utf8") !== text) {
    throw new Error("entry.txt does not match the entry text after writing");
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): number {
  const check = validateEntry(ENTRY, RULES);
  if (!check.ok) {
    for (const problem of check.problems) {
      console.error(`invalid entry: ${problem}`);
    }
    return 1;
  }

  const dir = resolveOutputDir();
  writeEntry(ENTRY, dir);
  process.stdout.write(`${ENTRY}\n`);
  return 0;
}

process.exitCode = main();
