import { ZodIssue } from 'zod';

export class ValidationError extends Error {
  public issues: ZodIssue[];

  constructor(issues: ZodIssue[], message?: string) {
    super(message ?? 'Body Validation Failed');

    this.name = 'ValidationError';
    this.issues = issues;
  }
}
