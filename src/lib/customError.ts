class CustomError {
  constructor(public message: string, public statusCode?: number) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
export default CustomError;
