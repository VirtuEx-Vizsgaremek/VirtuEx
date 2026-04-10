export const toDateOrNull = (value: unknown): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) return value;
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

export const toIsoOrNull = (value: unknown): string | null => {
  const date = toDateOrNull(value);
  return date ? date.toISOString() : null;
};
