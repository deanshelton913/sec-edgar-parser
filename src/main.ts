import fs from "node:fs/promises";
import { getObjectFromUrl, getObjectFromString as _getObjectFromString} from "./parser";

const urls = [
  "https://www.sec.gov/Archives/edgar/data/1614199/000110465924058302/0001104659-24-058302.txt"
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
    const promise = (async (url) => {
      console.log(`Calling: ${url}`);
      const accessionNumber = getLastSegmentWithoutExtension(url);
      const obj = await getObjectFromUrl(url);
      const outputPath = `/tmp/SEC-output-${accessionNumber}.json`;
      await fs.writeFile(outputPath, JSON.stringify(obj, null, 2), "utf-8");
      console.log(`output: ${outputPath}`);
    })(url);
    promises.push(promise);
  }
  await Promise.all(promises);
})();
