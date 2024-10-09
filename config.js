const CONFIG = {
    DEVELOPMENT_URL: 'http://10.0.2.2:8081',  // Use 10.0.2.2 for Android emulator
    PRODUCTION_URL: 'https://api.yourapp.com',
    TIMEOUT: 5000, // optional: add timeout for API calls if needed
};
  
// Decide which environment to use (dev or prod)
const BASE_URL = __DEV__ ? CONFIG.DEVELOPMENT_URL : CONFIG.PRODUCTION_URL;
  
export default {
    BASE_URL,
    TIMEOUT: CONFIG.TIMEOUT,
};
