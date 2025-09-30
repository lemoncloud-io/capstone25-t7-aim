/**
 * Creates an async delay utility function
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the specified delay
 */
export const createAsyncDelay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
