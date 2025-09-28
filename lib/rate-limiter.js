// Global rate limiter for Gemini API calls
let lastApiCall = 0;
const API_COOLDOWN = 8000; // 8 seconds between calls (7.5 per minute max for safety)

export async function rateLimitedApiCall(apiFunction) {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < API_COOLDOWN) {
    const waitTime = API_COOLDOWN - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms before next API call`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCall = Date.now();
  return apiFunction();
}
