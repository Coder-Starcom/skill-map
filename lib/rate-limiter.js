// Global rate limiter for Gemini API calls
let lastApiCall = 0;
const API_COOLDOWN = 3000; // 3 seconds between calls (more reasonable)

export async function rateLimitedApiCall(apiFunction, timeoutMs = 30000) {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < API_COOLDOWN) {
    const waitTime = API_COOLDOWN - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms before next API call`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCall = Date.now();
  
  // Add timeout handling
  return Promise.race([
    apiFunction(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API call timeout')), timeoutMs)
    )
  ]);
}
