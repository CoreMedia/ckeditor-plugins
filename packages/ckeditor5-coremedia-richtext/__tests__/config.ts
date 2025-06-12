import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

function findEnvFile(startDir = import.meta.dirname): string | undefined {
  let dir = startDir;
  let nothingFound = false;
  while (!nothingFound) {
    const envPath = path.join(dir, ".env");
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      nothingFound = true;
    }
    dir = parentDir;
  }
  return undefined;
}

const envPath = findEnvFile();

dotenv.config({ path: envPath });
