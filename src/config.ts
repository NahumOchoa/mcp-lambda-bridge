import { ServerConfig } from './types.js';

export const CONFIG = {
  LAMBDA_API_URL: process.env.LAMBDA_API_URL || 'https://your-lambda-function-url.com',
  HTTP_TIMEOUT: parseInt(process.env.HTTP_TIMEOUT || '30000', 10),
  SERVER_INFO: {
    name: process.env.SERVER_NAME || 'Lambda-MCP-Bridge',
    version: process.env.SERVER_VERSION || '1.0.0',
    description: process.env.SERVER_DESCRIPTION || 'Bridge service that connects AWS Lambda to MCP-compatible LLMs'
  } as ServerConfig
}; 