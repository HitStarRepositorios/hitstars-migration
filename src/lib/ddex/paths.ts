import os from "os"
import path from "path"

/**
 * Provides a writable base directory for DDEX generation across environments.
 * Standardizes on the /tmp directory for serverless (Vercel) compatibility.
 */
export function getDDEXBaseDir() {
  return path.join(os.tmpdir(), "hitstar-ddex")
}
