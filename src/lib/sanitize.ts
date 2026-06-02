/**
 * PIYROX Market — Input Sanitization
 *
 * Strips HTML tags and XSS vectors from user input.
 */

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // Remove HTML tags
    .replace(/&lt;/g, "<")              // Decode common entities for re-stripping
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "")           // Strip again after decode
    .trim();
}

/**
 * Escape HTML special characters to prevent XSS.
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#96;",
  };
  return input.replace(/[&<>"'/`]/g, (char) => map[char] || char);
}

/**
 * Remove potential XSS vectors from input.
 * Strips event handlers, javascript: URLs, data: URLs, etc.
 */
export function sanitize(input: string): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, "");
  sanitized = sanitized.replace(/data\s*:/gi, "");
  sanitized = sanitized.replace(/vbscript\s*:/gi, "");

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove script tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Remove extra whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitize(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }

  return result;
}

/**
 * Validate and sanitize an email address.
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9@._+-]/g, "");
}
