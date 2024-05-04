// Function to convert a string to camelCase
function toCamelCase(str) {
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

const tabDepth = (line) => ((line.match(/^\t*/)?.[0] || "").length);

function transformTextToValidJson(inputText: string) {
	let everOpened = false; // Flag to track if any object has been opened
	let justOpened = false; // Flag to track if the last line opened a new object
	let openCount = 0; // Counter to track the number of opened objects

	// Split the content into lines
	const lines = inputText.trim().split("\n");
	// Process each line
	const transformedLines = lines.map((line, i) => {
		// Check if the line is empty
		if (line === "") {
			let char = "";
			if (justOpened) {
				char = ""; // If the last line opened a new object, no character is added
			} else {
				if (everOpened) {
					openCount--; // Decrease the open object count if an object has been opened previously
					char = "},"; // Add closing brace and comma for the previously opened object
				}
			}
			justOpened = false; // Reset the flag for justOpened
			return char; // Return the character to be added to the transformed line
		}
        
		// Split the line into key and value, and trim any leading or trailing whitespace
		const [key, value] = line
			.trim()
			.split(":")
			.map((part) => part.trim());

		// Convert the key to camelCase
		const safeKey = toCamelCase(key);
        const currentTabDepth = tabDepth(lines[i])

		// Check if the value SEEMS empty or undefined
		if (value === undefined || value === "") {
            // detect null values by looking ahead in the doc
            const nextTabDepth = tabDepth(lines[i+1])
            if(nextTabDepth<currentTabDepth){
                justOpened = false; // Reset the flag for justOpened
                return `"${safeKey}__${i}": null,`; // Return null value
            }
            
            justOpened = true; // Set the flag for justOpened as true
            everOpened = true; // Set the flag for everOpened as true
            let prepend = '';
            if(currentTabDepth<openCount){
                prepend = `${"}\n".repeat(openCount-currentTabDepth)},`
                openCount=0
            }
            openCount++; // Increment the open object count
            return `${prepend}"${safeKey}__${i}": {`; // Return transformed line for opening object
		}
        justOpened = false; // Reset the flag for justOpened
        return `"${safeKey}__${i}": "${value}",`; // Return transformed line for key-value pair
	});

	// Join the transformed lines and format the result
	let text =
		`${transformedLines.join("\n").replace(/,$/, "").replace(/,$/, "")}\n`;
	for (let i = 0; i < openCount; i++) {
		text += "}"; // Add closing braces for any remaining open objects
	}

	return `{${text}}`; // Return the transformed text as a valid JSON object
}

/**
 * Removes numbered keys from the provided object recursively.
 * @param {object} obj - The object from which numbered keys should be removed.
 * @returns {object} - The modified object with numbered keys removed.
 */
function removeNumberedKeys(obj) {
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
			removeNumberedKeys(obj[newKey]); // Recursively traverse nested objects
		}
		if (Array.isArray(obj[newKey])) {
			// Check if the value of the new key is an array
			obj[newKey] = obj[newKey].map(removeNumberedKeys); // Recursively traverse nested arrays
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
export async function parseSecHeaderString(text: string) {
	try {
		const transformedText = transformTextToValidJson(text);
		const cleanDanglingCommas = transformedText.replace(/,\s*([\]}])/g, "$1");
		const obj = JSON.parse(cleanDanglingCommas);
		return removeNumberedKeys(obj);
	} catch (e) {
		console.error(e);
	}
}

export function trimDocument(file: string) {
	const fileLines = file.trim().split("\n");
	let endOfHeaderIndex = 0;
	for (let i = 3; i < fileLines.length; i++) {
		if (fileLines[i].trim().startsWith("<")) {
			endOfHeaderIndex = i; // Return the index of the line
			break;
		}
	}
	return fileLines.slice(3, endOfHeaderIndex).join("\n");
}


async function callTheSEC(url: string) {
	const fileResponse = await fetch(url);
	return fileResponse.text();
}

export async function getJsonFromUrl(url: string) {
	const doc = await callTheSEC(url);
    const justTheTip = trimDocument(doc);
	return parseSecHeaderString(justTheTip);
}

export async function getJsonFromString(text: string){
	const justTheTip = trimDocument(text);
	return parseSecHeaderString(justTheTip);
}