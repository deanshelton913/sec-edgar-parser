import fs from "node:fs/promises";
import {
  getObjectFromUrl,
  getObjectFromString as _getObjectFromString,
} from "./parser";

const urls = [
  "https://www.sec.gov/Archives/edgar/data/1766724/000117266123003414/0001172661-23-003414.txt",
  "https://www.sec.gov/Archives/edgar/data/314169/000137647423000077/0001376474-23-000077.txt",
];

function getLastSegmentWithoutExtension(urlString: string) {
  const url = new URL(urlString);
  const pathnameParts = url.pathname.split("/");
  const lastSegment = pathnameParts[pathnameParts.length - 1];
  const lastSegmentWithoutExtension = lastSegment.split(".")[0];
  return lastSegmentWithoutExtension;
}

(async () => {
  const promises = [];
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index];
    const email = process.argv[2];

    if (!email || !email.includes("@")) {
      throw new Error(
        "Please provide a valid email address as a command line argument",
      );
    }

    const promise = (async (url) => {
      console.log(`Calling: ${url}`);
      const accessionNumber = getLastSegmentWithoutExtension(url);
      const obj = await getObjectFromUrl(url, email);
      const outputPath = `/tmp/SEC-output-${accessionNumber}.json`;
      await fs.writeFile(outputPath, JSON.stringify(obj, null, 2), "utf-8");
      console.log(`output: ${outputPath}`);
    })(url);
    promises.push(promise);
  }
  await Promise.all(promises);
})();
