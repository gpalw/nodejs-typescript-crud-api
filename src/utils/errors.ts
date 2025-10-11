// src/utils/errors.ts

export class HttpError extends Error {
    public status: number;

    constructor(status: number, message: string) {

        super(message);

        this.status = status;

        Object.setPrototypeOf(this, HttpError.prototype);
    }
}