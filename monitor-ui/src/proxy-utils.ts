/**
 * A utility function to fetch data with CORS proxy fallback
 * This can help when direct requests fail due to CORS issues
 */
export async function fetchWithFallback(url: string): Promise<Response> {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      return response;
    }

    throw new Error(`Direct fetch failed with status ${response.status}`);
  } catch (error) {
    console.warn(`Direct fetch to ${url} failed, trying CORS proxy...`, error);

    // Use a CORS proxy as fallback
    // Note: These public proxies have rate limits and should only be used for development
    const corsProxies = [
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`,
    ];

    // Try each proxy
    for (const proxyUrl of corsProxies) {
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest', // Required by some proxies
          },
        });

        if (response.ok) {
          return response;
        }
      } catch (innerError) {
        console.warn(`CORS proxy ${proxyUrl} failed:`, innerError);
      }
    }

    // If we get here, all attempts failed
    throw new Error(`Failed to fetch ${url} directly and through CORS proxies`);
  }
}
