export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    if ("error" in error) {
      return getErrorMessage((error as { error?: unknown }).error, fallback);
    }

    if ("message" in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    const values = Object.values(error as Record<string, unknown>).flatMap((value) =>
      Array.isArray(value) ? value : [value]
    );
    const firstString = values.find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );
    if (firstString) {
      return firstString;
    }
  }

  return fallback;
}
