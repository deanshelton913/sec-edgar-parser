
// Function to convert a string to camelCase
function toCamelCase(str) {
    // Split the string into words based on spaces
    const words = str.split(' ');

    // Map over the words array and convert each word to camelCase
    const camelCaseString = words.map((word, index) => {
        // Capitalize the first letter for all words except the first one
        if (index === 0) {
            return word.toLowerCase(); // Convert the first word to lowercase
        } else {
            // Capitalize the first letter and convert the rest to lowercase for subsequent words
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
    }).join(''); // Join the words together to form the camelCase string

    // Return the camelCase string
    return camelCaseString;
}



function transformTextToValidJson(inputText: string) {
    let everOpened = false; // Flag to track if any object has been opened
    let justOpened = false; // Flag to track if the last line opened a new object
    let openCount = 0; // Counter to track the number of opened objects

    // Split the content into lines
    const lines = inputText.trim().split('\n');

    // Process each line
    const transformedLines = lines.map((line, i) => {
        // Check if the line is empty
        if (line === '') {
            let char = '';
            if (justOpened) {
                char = ''; // If the last line opened a new object, no character is added
            } else {
                if (everOpened) {
                    openCount--; // Decrease the open object count if an object has been opened previously
                    char = '},'; // Add closing brace and comma for the previously opened object
                }
            }
            justOpened = false; // Reset the flag for justOpened
            return char; // Return the character to be added to the transformed line
        }
        i += 1; // Increment index for safeKey

        // Split the line into key and value, and trim any leading or trailing whitespace
        const [key, value] = line.trim().split(':').map(part => part.trim());

        // Convert the key to camelCase
        const safeKey = toCamelCase(key);

        // Check if the value is not empty or undefined
        if (value !== undefined && value !== '') {
            justOpened = false; // Reset the flag for justOpened
            return `"${safeKey}__${i}": "${value}",`; // Return transformed line for key-value pair
        } else {
            justOpened = true; // Set the flag for justOpened as true
            everOpened = true; // Set the flag for everOpened as true
            openCount++; // Increment the open object count
            return `"${safeKey}__${i}": {`; // Return transformed line for opening object
        }
    });

    // Join the transformed lines and format the result
    let text = transformedLines.join('\n').replace(/,$/, '').replace(/,$/, '') + '\n';
    for (let i = 0; i < openCount; i++) {
        text += '}'; // Add closing braces for any remaining open objects
    }

    return `{${text}}`; // Return the transformed text as a valid JSON object
}

/**
 * Removes numbered keys from the provided object recursively.
 * @param {object} obj - The object from which numbered keys should be removed.
 * @returns {object} - The modified object with numbered keys removed.
 */
function removeNumberedKeys(obj) {
    let newKey = ''; // Variable to store the modified key without the numbered suffix
    for (const key in obj) {
        if (key.includes('__')) { // Check if the key contains '__'
            newKey = key.replace(/__\d+$/, ''); // Remove the numbered suffix from the key
            if (obj.hasOwnProperty(newKey)) { // Check if the object has the new key
                if (!Array.isArray(obj[newKey])) { // Check if the value of the new key is not an array
                    obj[newKey] = [obj[newKey]]; // Convert the value to an array
                }
                obj[newKey].push(obj[key]); // Push the value of the original key to the array
                delete obj[key]; // Delete the original key-value pair
            } else {
                obj[newKey] = obj[key]; // Set the value of the new key to the value of the original key
                delete obj[key]; // Delete the original key-value pair
            }
        }
        if (typeof obj[newKey] === 'object' && obj[newKey] !== null) { // Check if the value of the new key is an object
            removeNumberedKeys(obj[newKey]); // Recursively traverse nested objects
        }
        if (Array.isArray(obj[newKey])) { // Check if the value of the new key is an array
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
async function parseSecHeaderString(text: string) {
    try {
        const transformedText = transformTextToValidJson(text);
        const parsedObject = transformedText.replace(/,\s*([\]}])/g, '$1');
        return removeNumberedKeys(parsedObject);
    } catch (e) {
        console.error(e);
    }
}

/**
 * Fetches the SEC header string from the provided URL and extracts the header section.
 * @param {string} url - The URL to fetch the SEC filing from.
 * @returns {Promise<string>} - A promise that resolves to the SEC header string.
 * @private
 */
async function getSecHeaderStringFromUrl(url: string) {
    const fileResponse = await fetch(url);
    const file = await fileResponse.text();
    const fileLines = file.trim().split('\n');
    let endOfHeaderIndex = 0;
    for (let i = 3; i < fileLines.length; i++) {
        if (fileLines[i].trim().startsWith('<')) {
            endOfHeaderIndex = i; // Return the index of the line
            break;
        }
    }
    return fileLines.slice(3, endOfHeaderIndex).join('\n');
}


export async function parseSecHeaderStringFromUrl(url: string) {
    const headerString = await getSecHeaderStringFromUrl(url);
    return parseSecHeaderString(headerString);
}