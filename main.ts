// Entry for make.fun's "Make the AI Judge Laugh: the Office Joke Open".
// One original office joke: the program writes the exact line, with no
// trailing newline, to entry.txt inside MAKEFUN_OUTPUT_DIR (default
// /output), and prints the same line plus a trailing newline to stdout.
// Node 22, standard library only, no network, deterministic on every run.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const entry =
  "The office printer only jams on urgent documents, so IT renamed it the deadline detector.";

// The gate allows 1 to 200 characters; refuse to write an overlong line
// rather than submit an entry the scorer would mark invalid.
const maxEntryChars = 200;
if ([...entry].length > maxEntryChars) {
  console.error(
    `entry is ${[...entry].length} characters, over the ${maxEntryChars}-character gate`,
  );
  process.exit(1);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), entry, "utf8");
process.stdout.write(entry + "\n");
