class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'success';

    Error.captureStackTrace(this, this.constructor);
  }

  sendResponse(res) {
    res.status(this.statusCode).json({
      status: this.status,
      error: this.message,
    });
  }
}
module.exports = AppError;