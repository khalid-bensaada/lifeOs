export class ApiError extends Error {
  constructor(status, message, extra = {}) {
    super(message)
    this.status = status
    this.code = extra.code
    this.params = extra.params
  }
}