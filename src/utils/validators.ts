/**
 * Validates if a string is a valid URL
 * @param url String to validate as URL
 * @throws Error if URL is invalid
 */
export function validateUrl(url: string): void {
  if (!url) {
    throw new Error('URL cannot be empty');
  }
  
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }
  

}

/**
 * Validates if a string is a positive integer
 * @param value String to validate
 * @returns Parsed integer if valid
 * @throws Error if not a valid positive integer
 */
export function validatePositiveInteger(value: string): number {
  const num = parseInt(value, 10);
  
  if (isNaN(num) || num <= 0 || num.toString() !== value) {
    throw new Error(`Value must be a positive integer: ${value}`);
  }
  
  return num;
} 