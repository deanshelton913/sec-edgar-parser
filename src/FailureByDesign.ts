/**
 * The FailureByDesign class extends the built-in Error class to provide a structured way
 * to handle errors in the application. This class is particularly useful for representing
 * errors that occur due to design flaws or unexpected conditions in the application logic.
 *
 * Usage:
 *
 * 1. Import the class where you need to handle errors:
 *    ```typescript
 *    import { FailureByDesign } from './FailureByDesign';
 *    ```
 *
 * 2. Create an instance of FailureByDesign when an error occurs:
 *    ```typescript
 *    throw new FailureByDesign("An unexpected error occurred", 400);
 *    ```
 *
 * 3. Catch the error in your application logic to handle it appropriately:
 *    ```typescript
 *    try {
 *      // Some operation that may fail
 *    } catch (error) {
 *      if (error instanceof FailureByDesign) {
 *        console.error(`Error: ${error.surfaceError.errorMessage}`);
 *        console.error(`HTTP Status Code: ${error.httpStatusCode}`);
 *      } else {
 *        // Handle other types of errors
 *      }
 *    }
 *    ```
 *
 * Properties:
 * - `httpStatusCode`: A numeric HTTP status code representing the error type (default is 500).
 * - `surfaceError`: An object containing a user-friendly error message.
 */
export class FailureByDesign extends Error {
  public httpStatusCode: number;
  public surfaceError: { errorMessage: string };
  constructor(message: string, httpStatusCode = 500) {
    super(message);
    this.name = "FailureByDesign";
    this.httpStatusCode = httpStatusCode;
    this.surfaceError = {
      errorMessage: message,
    };
  }
}
