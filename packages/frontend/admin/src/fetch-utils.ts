/**
 * Custom fetch utility with nexio version header
 * Automatically adds the x-nexio-version header to all fetch requests
 */

// BUILD_CONFIG is defined globally in the nexio project

/**
 * Wrapper around fetch that automatically adds the x-nexio-version header
 * @param input Request URL
 * @param init Request initialization options
 * @returns Promise with the fetch Response
 */
export const nexioFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      'x-nexio-version': BUILD_CONFIG.appVersion,
    },
  });
};
