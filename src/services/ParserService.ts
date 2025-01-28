import { injectable } from "tsyringe";
import * as yaml from "yaml";
const { XMLParser } = require("fast-xml-parser");

export type IndexedObject = {
  [k: string]: string | string[] | IndexedObject | IndexedObject[];
};

@injectable()
export class ParserService {
  public async parseRawSecFiling(text: string) {
    const { yamlLikeStructure, xmlLikeStructure } =
      this.splitDocumentIntoYmlAndXML(text);
    const xmlObj = this.badXmlToObj(xmlLikeStructure);
    const ymlObj = this.parseYamlLikeString(yamlLikeStructure);

    const acceptanceDatetimeMatch = text.match(/<ACCEPTANCE-DATETIME>(\d+)/);
    const acceptanceDatetime = acceptanceDatetimeMatch
      ? acceptanceDatetimeMatch[1]
      : "";
    return { acceptanceDatetime, ...ymlObj, ...xmlObj };
  }

  private badYamlToObj(text: string) {
    const lines = text.split("\n").map(this.tabsToSpaces);
    const depthOfFirstLine = this.spaceDepth(lines[0]);
    let normalizedYaml = "";
    let i = 0;

    for (const line of lines) {
      let cleaned = this.removeNSpaces(line, depthOfFirstLine);

      const [key, val] = line.split(":");

      if (key.trim()) {
        let cleanVal = val.trim().replace(`'`, `''`);
        if (cleanVal.trim() === "") {
          cleanVal = "";
        } else {
          cleanVal = ` '${cleanVal}'`;
        }
        cleaned = `${key}__${i}:${cleanVal}`;
      }
      normalizedYaml += `${cleaned}\n`;
      i++;
    }

    let obj = yaml.parse(normalizedYaml);
    obj = this.camelizeKeys(obj);

    return obj;
  }
  private spaceDepth = (line: string) => (line.match(/^ */)?.[0] || "").length;
  private replaceCharAtIndex = (
    str: string,
    index: number,
    newChar: string,
  ) => {
    return str.substring(0, index) + newChar + str.substring(index + 1);
  };
  private tabsToSpaces(str: string) {
    const leadingTabs = str.match(/^\t+/);

    if (!leadingTabs) return str;

    const numSpaces = 2 * leadingTabs[0].length;
    const spaces = " ".repeat(numSpaces);

    return spaces + str.replace(/^\t+/, "");
  }

  private toCamelCase(str: string) {
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
  private removeNSpaces = (str: string, N: number) => {
    let copy = str;

    for (let index = 0; index < N; index++) {
      const char = copy[index];
      if (char === " ") {
        copy = this.replaceCharAtIndex(copy, index, "");
      }
    }

    return copy;
  };
  private recursivelyFlattenDuplicateKeysWithNumbers(obj: IndexedObject) {
    let newKey = ""; // Variable to store the modified key without the numbered suffix
    for (const key in obj) {
      if (key.includes("__")) {
        // Check if the key contains '__'
        newKey = key.replace(/__\d+$/, ""); // Remove the numbered suffix from the key
        if (obj[newKey] !== undefined) {
          // Check if the object has the new key
          if (!Array.isArray(obj[newKey])) {
            // Check if the value of the new key is not an array
            obj[newKey] = [obj[newKey]] as IndexedObject[]; // Convert the value to an array
          }
          (obj[newKey] as IndexedObject[]).push(obj[key] as IndexedObject); // Push the value of the original key to the array
          delete obj[key]; // Delete the original key-value pair
        } else {
          obj[newKey] = obj[key]; // Set the value of the new key to the value of the original key
          delete obj[key]; // Delete the original key-value pair
        }
      }
      if (Array.isArray(obj[newKey])) {
        // Check if the value of the new key is an array
        obj[newKey] = (obj[newKey] as IndexedObject[]).map((x) =>
          this.recursivelyFlattenDuplicateKeysWithNumbers(x),
        ); // Recursively traverse nested arrays
      } else if (typeof obj[newKey] === "object" && obj[newKey] !== null) {
        // Check if the value of the new key is an object
        this.recursivelyFlattenDuplicateKeysWithNumbers(
          obj[newKey] as IndexedObject,
        ); // Recursively traverse nested objects
      }
    }
    return obj; // Return the modified object
  }
  public normalizeKnownKeysAsAppropriateDataTypes(obj: IndexedObject) {
    // Recursive function to iterate over all keys and child keys
    function recurse(obj: IndexedObject) {
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          // If the value is an array, recursively call the function for each element
          obj[key] = (obj[key] as IndexedObject[]).map(
            (item: IndexedObject) => {
              if (typeof item === "object") {
                return recurse(item);
              }
              return item;
            },
          );
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          // If the value is an object, recursively call the function
          obj[key] = recurse(obj[key] as IndexedObject);
        }
        if (repeatableValues.includes(key) && !Array.isArray(obj[key])) {
          obj[key] = [obj[key]] as IndexedObject[];
        }
      }
      return obj;
    }

    const repeatableValues = [
      "filedBy",
      "serialCompany",
      "subjectCompany",
      "reportingOwner",
      "issuer",
      "filedFor",
      "filer",
      "items",
      "references429",
      "itemInformation",
      "groupMembers",
      "absAssetClass",
      "absSubAssetClass",
      "formerCompany",
    ];

    return recurse(obj);
  }
  private parseYamlLikeString(text: string) {
    let obj = this.badYamlToObj(text); // first pass, just create an valid object

    obj = this.recursivelyFlattenDuplicateKeysWithNumbers(obj); // second pass, clean up the object.
    obj = this.normalizeKnownKeysAsAppropriateDataTypes(obj);

    return obj;
  }
  private badXmlToObj(xmlString: string) {
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
    obj = this.camelizeKeys(obj);

    return obj.secHeader;
  }
  private camelizeKeys<T>(obj: T): T {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item: keyof T) => this.camelizeKeys(item)) as T;
    }

    const newObj: IndexedObject = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelCaseKey = this.toCamelCase(key);
        newObj[camelCaseKey] = this.camelizeKeys<IndexedObject>(
          obj[key] as IndexedObject,
        );
      }
    }

    return newObj as T;
  }
  private splitDocumentIntoYmlAndXML(file: string) {
    const fileLines = file.split("\n");
    let endOfYamlLikeContent = 0;
    let indexOfSecHeaderClosingTag = 0;
    let startOfYamlContent = 0;
    for (let i = 0; i < fileLines.length; i++) {
      if (fileLines[i].trim().includes("ACCESSION NUMBER:")) {
        startOfYamlContent = i;
        break;
      }
    }

    for (let i = startOfYamlContent; i < fileLines.length; i++) {
      if (fileLines[i].trim().startsWith("<")) {
        endOfYamlLikeContent = i; // Return the index of the line
        break;
      }
    }
    for (let i = endOfYamlLikeContent; i < fileLines.length; i++) {
      if (fileLines[i].trim() === "</SEC-HEADER>") {
        indexOfSecHeaderClosingTag = i; // Return the index of the line
        break;
      }
    }

    const yamlLikeStructure = fileLines
      .slice(startOfYamlContent, endOfYamlLikeContent)
      .join("\n");
    const xmlLikeStructure = `<SEC-HEADER>
    ${fileLines
      .slice(endOfYamlLikeContent, indexOfSecHeaderClosingTag + 1)
      .join("\n")}`;

    return { yamlLikeStructure, xmlLikeStructure };
  }
}

// ------------------------------------------------------------------------------------------------
