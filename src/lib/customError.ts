/**
 * Custom Error can be used to throw error with `message` and `statusCode`
 */
class CustomError {
  constructor(public message: string, public statusCode?: number) {
    this.message = message;
    this.statusCode = statusCode || 500;
  }
}
export default CustomError;
