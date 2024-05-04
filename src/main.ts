import fs from "node:fs/promises";
import { getObjectFromUrl, getObjectFromString } from "./parser";

const urls = [
  "https://www.sec.gov/Archives/edgar/data/1456857/000151116418000283/0001511164-18-000283.txt",
  "https://www.sec.gov/Archives/edgar/data/1038074/000110465918026411/0001104659-18-026411.txt",
  "https://www.sec.gov/Archives/edgar/data/1038074/000110465918026411/0001104659-18-026411.txt",
  "https://www.sec.gov/Archives/edgar/data/1027596/000119312519278752/0001193125-19-278752.txt",
  "https://www.sec.gov/Archives/edgar/data/1666268/000183988224014056/0001839882-24-014056.txt",
  "https://www.sec.gov/Archives/edgar/data/1849440/000084251724000086/0000842517-24-000086.txt",
  "https://www.sec.gov/Archives/edgar/data/1454889/000110465922103420/0001104659-22-103420.txt",
];

function getLastSegmentWithoutExtension(urlString) {
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
