import { ServerConfig } from './types.js';

export interface Config {
  lambdaApiUrl: string;
  httpTimeout: number;
  serverInfo: ServerConfig;
}

const defaultConfig: Config = {
  lambdaApiUrl: '',
  httpTimeout: 30000,
  serverInfo: {
    name: 'Lambda-MCP-Bridge',
    version: '1.0.0',
    description: 'Bridge service that connects AWS Lambda to MCP-compatible LLMs'
  }
};

let currentConfig: Config = { ...defaultConfig };

/**
 * Validate configuration object
 */
function validateConfig(config: Partial<Config>): void {
  if (config.httpTimeout !== undefined && (isNaN(config.httpTimeout) || config.httpTimeout <= 0)) {
    throw new Error(`Invalid httpTimeout: ${config.httpTimeout}. Must be a positive number.`);
  }
  
  if (config.lambdaApiUrl !== undefined && config.lambdaApiUrl) {
    try {
      new URL(config.lambdaApiUrl);
    } catch (error) {
      throw new Error(`Invalid lambdaApiUrl: ${config.lambdaApiUrl}. Must be a valid URL.`);
    }
  }

}

/**
 * Set the global configuration
 */
export function setConfig(config: Partial<Config>): void {
  validateConfig(config);
  
  currentConfig = {
    ...currentConfig,
    ...config
  };
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  currentConfig = { ...defaultConfig };
}

/**
 * Get the current configuration
 */
export function getConfig(): Config {
  return { ...currentConfig };
}

/**
 * Update configuration from environment variables
 */
export function loadConfigFromEnv(): void {
  const envConfig: Partial<Config> = {};
  
  if (process.env.LAMBDA_API_URL) {
    envConfig.lambdaApiUrl = process.env.LAMBDA_API_URL;
  }
  
  if (process.env.HTTP_TIMEOUT) {
    const timeout = parseInt(process.env.HTTP_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      envConfig.httpTimeout = timeout;
    }
  }
  
  if (process.env.SERVER_NAME || process.env.SERVER_VERSION || process.env.SERVER_DESCRIPTION) {
    envConfig.serverInfo = {
      ...defaultConfig.serverInfo,
      ...(process.env.SERVER_NAME ? { name: process.env.SERVER_NAME } : {}),
      ...(process.env.SERVER_VERSION ? { version: process.env.SERVER_VERSION } : {}),
      ...(process.env.SERVER_DESCRIPTION ? { description: process.env.SERVER_DESCRIPTION } : {})
    };
  }
  
  if (Object.keys(envConfig).length > 0) {
    setConfig(envConfig);
  }
}

export const CONFIG = {
  get LAMBDA_API_URL() { return currentConfig.lambdaApiUrl; },
  get HTTP_TIMEOUT() { return currentConfig.httpTimeout; },
  get SERVER_INFO() { return currentConfig.serverInfo; }
}; 