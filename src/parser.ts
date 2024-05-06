import * as yaml from "yaml";
const { XMLParser } = require("fast-xml-parser");

type IndexedObject = { [k: string]: any };

// Function to convert a string to camelCase
export function toCamelCase(str: string) {
  // Split the string into words based on spaces and hyphens
  const words = str.split(/[\s-]+/);

  // Map over the words array and convert each word segment to camelCase
  const camelCaseString = words
    .map((word, index) => {
      // Capitalize the first letter for all word segments except the first one
      if (index === 0) {
        return word.toLowerCase(); // Convert the first word segment to lowercase
      }
      // Capitalize the first letter and convert the rest to lowercase for subsequent segments
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(""); // Join the words together to form the camelCase string

  // Return the camelCase string
  return camelCaseString;
}

const spaceDepth = (line: string) => (line.match(/^ */)?.[0] || "").length;
const replaceCharAtIndex = (str: string, index: number, newChar: string) => {
  return str.substring(0, index) + newChar + str.substring(index + 1);
};

const removeNSpaces = (str: string, N: number) => {
  let copy = str;

  for (let index = 0; index < N; index++) {
    const char = copy[index];
    if (char === " ") {
      copy = replaceCharAtIndex(copy, index, "");
    }
  }

  return copy;
};

const tabsToSpaces = (str: string) => {
  const leadingTabs = str.match(/^\t+/);

  if (!leadingTabs) return str;

  const numSpaces = 2 * leadingTabs[0].length;
  const spaces = " ".repeat(numSpaces);

  return spaces + str.replace(/^\t+/, "");
};

function badYamlToObj(text: string) {
  const lines = text.split("\n").map(tabsToSpaces);
  const depthOfFirstLine = spaceDepth(lines[0]);
  let normalizedYaml = "";
  let i = 0;

  for (const line of lines) {
    let cleaned = removeNSpaces(line, depthOfFirstLine);
    const [key, val] = line.split(":");

    if (key.trim()) {
      cleaned = `${key}__${i}:${val}`;
    }

    normalizedYaml += `${cleaned}\n`;
    i++;
  }

  let obj = yaml.parse(normalizedYaml);
  obj = camelizeKeys(obj);

  return obj;
}

/**
 * Removes numbered keys from the provided object recursively.
 * @param {object} obj - The object from which numbered keys should be removed.
 * @returns {object} - The modified object with numbered keys removed.
 */
function recursivelyFlattenDuplicateKeysWithNumbers(obj: IndexedObject) {
  let newKey = ""; // Variable to store the modified key without the numbered suffix
  for (const key in obj) {
    if (key.includes("__")) {
      // Check if the key contains '__'
      newKey = key.replace(/__\d+$/, ""); // Remove the numbered suffix from the key
      if (obj[newKey] !== undefined) {
        // Check if the object has the new key
        if (!Array.isArray(obj[newKey])) {
          // Check if the value of the new key is not an array
          obj[newKey] = [obj[newKey]]; // Convert the value to an array
        }
        obj[newKey].push(obj[key]); // Push the value of the original key to the array
        delete obj[key]; // Delete the original key-value pair
      } else {
        obj[newKey] = obj[key]; // Set the value of the new key to the value of the original key
        delete obj[key]; // Delete the original key-value pair
      }
    }
    if (typeof obj[newKey] === "object" && obj[newKey] !== null) {
      // Check if the value of the new key is an object
      recursivelyFlattenDuplicateKeysWithNumbers(obj[newKey]); // Recursively traverse nested objects
    }
    if (Array.isArray(obj[newKey])) {
      // Check if the value of the new key is an array
      obj[newKey] = obj[newKey].map(recursivelyFlattenDuplicateKeysWithNumbers); // Recursively traverse nested arrays
    }
  }
  return obj; // Return the modified object
}

/**
 * Parses the SEC header string to extract relevant information.
 * @param {string} text - The SEC header string to parse.
 * @returns {Promise<object>} - A promise that resolves to the parsed SEC header object.
 * @private
 */
export function parseYamlLikeString(text: string) {
  const obj = badYamlToObj(text); // first pass, just create an valid object
  //   console.log(JSON.stringify(obj, null, 2))
  const x = recursivelyFlattenDuplicateKeysWithNumbers(obj); // second pass, clean up the object.
  return x;
}

export function badXmlToObj(xmlString: string) {
  // Split the XML string into lines
  const lines = xmlString.split("\n");

  // Stack to keep track of open tags
  const stack: string[] = [];

  // Corrected XML string
  let correctedXML = "";

  for (const line of lines) {
    // Remove leading and trailing whitespace
    let currentLine = line.trim();
    if (currentLine.startsWith("</")) {
      // Close tag
      currentLine = `${" ".repeat(stack.length * 2)}${currentLine}\n`;
      stack.pop();
    } else if (currentLine.startsWith("<")) {
      // Open tag
      const tagName = currentLine.split("<")[1].split(">")[0];
      const tagValue = currentLine.split(">")[1].trim();
      if (tagValue && !currentLine.endsWith(">")) {
        currentLine = `${" ".repeat(
          stack.length * 2,
        )}${currentLine}</${tagName}>\n`;
        stack.pop();
      } else {
        currentLine = `${" ".repeat(stack.length * 2)}${currentLine}\n`;
      }
    } else if (currentLine.includes(":")) {
      const [key, value] = currentLine.split(":").map((x) => x.trim());
      const expectedKey = key.replace(/ /g, "-");
      currentLine = `<${expectedKey}>${value}</${expectedKey}>`;
    } else {
      // Content within tag
      currentLine = `${" ".repeat(stack.length * 2)}${currentLine}\n`;
    }
    correctedXML += currentLine;
  }

  // Add missing closing tags for open tags with values
  for (const openTag of stack.reverse()) {
    correctedXML += `${" ".repeat(stack.length * 2)}</${openTag}>\n`;
  }

  const xmlParser = new XMLParser();
  let obj = xmlParser.parse(correctedXML);
  obj = camelizeKeys(obj);

  return obj.secHeader;
}

function camelizeKeys<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: any) => camelizeKeys(item)) as any;
  }

  const newObj: IndexedObject = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelCaseKey = toCamelCase(key);
      newObj[camelCaseKey] = camelizeKeys(obj[key]);
    }
  }

  return newObj as any;
}

export function trimDocument(file: string) {
  const fileLines = file.split("\n");
  let endOfYamlLikeContent = 0;
  let endOfXMLindex = 0;
  for (let i = 3; i < fileLines.length; i++) {
    if (fileLines[i].trim().startsWith("<")) {
      endOfYamlLikeContent = i; // Return the index of the line
      break;
    }
  }
  for (let i = endOfYamlLikeContent; i < fileLines.length; i++) {
    if (fileLines[i].trim() === "</SEC-HEADER>") {
      endOfXMLindex = i; // Return the index of the line
      break;
    }
  }
  const yamlLikeStructure = fileLines.slice(3, endOfYamlLikeContent).join("\n");
  const xmlLikeStructure = `<SEC-HEADER>
  ${fileLines.slice(endOfYamlLikeContent, endOfXMLindex + 1).join("\n")}`;

  return { yamlLikeStructure, xmlLikeStructure };
}

async function callTheSEC(url: string) {
  const fileResponse = await fetch(url);
  return fileResponse.text();
}

export async function getObjectFromUrl(url: string) {
  const doc = await callTheSEC(url);
  return getObjectFromString(doc);
}

export async function getObjectFromString(text: string) {
  const { yamlLikeStructure, xmlLikeStructure } = trimDocument(text);
  const xmlObj = badXmlToObj(xmlLikeStructure);
  const ymlObj = parseYamlLikeString(yamlLikeStructure);
  return { ...ymlObj, ...xmlObj };
}
