// Production configuration
export const APP_CONFIG = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  
  // Authentication Configuration
  AUTH: {
    MAX_LOADING_TIME: parseInt(process.env.NEXT_PUBLIC_AUTH_MAX_LOADING_TIME || '10000'),
    SESSION_CHECK_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_AUTH_SESSION_TIMEOUT || '8000'),
    PROFILE_FETCH_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_AUTH_PROFILE_TIMEOUT || '6000'),
    RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_AUTH_RETRY_ATTEMPTS || '3'),
    RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_AUTH_RETRY_DELAY || '1000'),
  },
  
  // Database Configuration
  DATABASE: {
    QUERY_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_DB_QUERY_TIMEOUT || '10000'),
    RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_DB_RETRY_ATTEMPTS || '2'),
    CONNECTION_POOL_SIZE: parseInt(process.env.DB_CONNECTION_POOL_SIZE || '10'),
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_REPORTING: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    ENABLE_PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: parseInt(process.env.RATE_LIMIT_RPM || '60'),
    REQUESTS_PER_HOUR: parseInt(process.env.RATE_LIMIT_RPH || '1000'),
  },
  
  // UI Configuration
  UI: {
    TOAST_DURATION: parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION || '5000'),
    DEBOUNCE_DELAY: parseInt(process.env.NEXT_PUBLIC_DEBOUNCE_DELAY || '300'),
    PAGINATION_SIZE: parseInt(process.env.NEXT_PUBLIC_PAGINATION_SIZE || '10'),
  },
} as const

// Validation function to check required environment variables
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return true
}

// Development vs Production checks
export const isDevelopment = APP_CONFIG.NODE_ENV === 'development'
export const isProduction = APP_CONFIG.NODE_ENV === 'production'

// Logging configuration
export const LOGGING = {
  LEVEL: isProduction ? 'error' : 'debug',
  ENABLE_CONSOLE: isDevelopment,
  ENABLE_REMOTE: isProduction && APP_CONFIG.FEATURES.ENABLE_ERROR_REPORTING,
} as const 