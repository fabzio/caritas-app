type ErrorStatusCode = 400 | 401 | 403 | 404 | 409 | 500

abstract class BaseError extends Error {
  public status: ErrorStatusCode
  constructor(message: string, status: ErrorStatusCode, name: string) {
    super(message)
    this.name = name
    this.status = status
  }
}

export class InfrastructureError extends BaseError {
  constructor(message: string, status: ErrorStatusCode, name: string) {
    super(message, status, name)
    this.name = name
  }
}

export const createInfrastructureErrorFactory = (
  name: string,
  status: ErrorStatusCode,
) =>
  class extends InfrastructureError {
    constructor(message: string) {
      super(message, status, name)
      this.name = name
    }
  }

export class ApplicationError extends BaseError {
  constructor(message: string, status: ErrorStatusCode, name: string) {
    super(message, status, name)
    this.name = name
  }
}

export const createApplicationErrorFactory = (
  name: string,
  status: ErrorStatusCode,
) =>
  class extends ApplicationError {
    constructor(message: string) {
      super(message, status, name)
      this.name = name
    }
  }
