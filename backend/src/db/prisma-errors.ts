export type PrismaErrorLike = {
  code?: string;
  message?: string;
};

export function isPrismaError(error: unknown): error is PrismaErrorLike {
  return typeof error === 'object' && error !== null && ('code' in error || 'message' in error);
}
