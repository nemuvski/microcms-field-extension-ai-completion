class AbortRequestError extends Error {
  constructor() {
    super("Request aborted");
    this.name = "AbortRequestError";
    Object.setPrototypeOf(this, AbortRequestError.prototype);
  }
}

const isAbortRequestError = (error: unknown): error is AbortRequestError => {
  return error instanceof AbortRequestError;
};

export { AbortRequestError, isAbortRequestError };
