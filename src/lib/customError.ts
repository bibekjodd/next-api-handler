/**
 * Custom Error can be used to throw error with `message` and `statusCode`
 */
class CustomError extends Error {
  constructor(public message: string, public statusCode?: number) {
    super(message);
    this.message = message;
    this.statusCode = statusCode || 500;
  }
}
export default CustomError;
