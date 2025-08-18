// lib/error-utils.ts

export class UserFriendlyError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'UserFriendlyError';
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UserFriendlyError.prototype);
  }
}

export async function safeFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  userMessage: string = 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
): Promise<T> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      let errorDetail = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text();
      }
      console.error(`API Error (${input}): ${errorDetail}`);
      throw new UserFriendlyError(userMessage, new Error(errorDetail));
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    if (error instanceof UserFriendlyError) {
      throw error; // Re-throw user-friendly errors directly
    }
    console.error(`Network or unexpected error (${input}): ${error.message}`);
    throw new UserFriendlyError(userMessage, error);
  }
}
