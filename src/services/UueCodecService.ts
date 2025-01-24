import * as uuencode from "uuencode";
import { injectable } from "tsyringe";

@injectable()
export class UueCodecService {
  public decodeUuEncodedFiles(text: string): {
    mode: number;
    name: string;
    data: Buffer;
  }[] {
    const lines = text.split(/\r?\n/);

    // This array will store the final results for all blocks
    const results: Array<{ mode: number; name: string; data: Buffer }> = [];

    // Track whether we're currently inside a uuencoded block
    let inBlock = false;

    // Temporary variables to collect data for the current block
    let currentMode = 0;
    let currentName = "";
    let uuLines: string[] = [];

    // Helper function to finalize the current block
    const finalizeBlock = () => {
      if (uuLines.length > 0 && currentName) {
        // Decode the collected lines into binary
        const data = this.uudecodeAll(uuLines);
        // Store the block result
        results.push({
          mode: currentMode,
          name: currentName,
          data,
        });
      }
      // Reset block state
      inBlock = false;
      currentMode = 0;
      currentName = "";
      uuLines = [];
    };

    for (const line of lines) {
      // 1) Check for a "begin" line
      const beginMatch = line.match(/^begin\s+(\d+)\s+(.*)$/);
      if (beginMatch) {
        // If we were already in a block, let's finalize it before starting a new one
        if (inBlock) {
          finalizeBlock();
        }

        inBlock = true;
        currentMode = Number.parseInt(beginMatch[1], 10);
        currentName = beginMatch[2] || "";
        uuLines = [];
        continue;
      }

      // 2) Check for an "end" line
      if (inBlock && /^end\s*$/.test(line)) {
        // We reached the end of a uuencoded block, finalize it
        finalizeBlock();
        continue;
      }

      // 3) If we are inside a block, collect lines
      if (inBlock) {
        uuLines.push(line);
      }
    }

    return results;
  }

  // ------------------------------------------------------------------
  // Helper to decode multiple uuencoded lines into a single Buffer
  private uudecodeAll(blockLines: string[]): Buffer {
    const chunks: Uint8Array[] = [];
    for (const blockLine of blockLines) {
      const decoded = this.uudecodeLine(blockLine);
      chunks.push(decoded);
    }
    return Buffer.concat(chunks);
  }

  // ------------------------------------------------------------------
  // Helper to decode a single uuencoded line to bytes
  private uudecodeLine(line: string): Buffer {
    const trimmed = line.trim();
    return Buffer.from(uuencode.decode(trimmed));
  }
}
