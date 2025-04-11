#!/usr/bin/env node

import { InputInterceptor } from './interceptors/inputInterceptor.js';
import { setupMcpServer } from './services/mcpServer.js';
import { log } from './services/logger.js';
import { validateUrl } from './utils/validators.js';
import { setConfig, loadConfigFromEnv, getConfig } from './config.js';
import { parseCliArgs } from './utils/cliParser.js';
import { ServerConfig } from './types.js';

/**
 * Main application function
 */
async function main(): Promise<void> {
  try {
    loadConfigFromEnv();
    
    const options = parseCliArgs();
    
    if (!options.lambdaUrl) {
      log('Error: Lambda URL is required');
      log('Usage: npx mcp-remote-lambda <lambda-function-url>');
      log('Example: npx mcp-remote-lambda https://abcd1234.lambda-url.us-west-2.on.aws');
      process.exit(1);
    }

    log(`Starting Lambda MCP Bridge`);
    
    try {
      validateUrl(options.lambdaUrl);
    } catch (error) {
      log(`Error: Invalid Lambda URL format: ${options.lambdaUrl}`);
      log('Please provide a valid URL starting with http:// or https://');
      process.exit(1);
    }
    
    setConfig({
      lambdaApiUrl: options.lambdaUrl
    });
    
    if (options.timeout) {
      setConfig({
        httpTimeout: options.timeout
      });
    }
    
    if (options.name || options.version || options.description) {
      const currentConfig = getConfig();
      
      const serverInfo: ServerConfig = {
        name: options.name || currentConfig.serverInfo.name,
        version: options.version || currentConfig.serverInfo.version,
        description: options.description || currentConfig.serverInfo.description
      };
      
      setConfig({ serverInfo });
    }
    
    if (options.interceptInput) {
      const interceptor = new InputInterceptor();
      interceptor.wrap();
    }
    
    const server = await setupMcpServer();
    
    setupProcessHandlers(server);
    
    log('Bridge started successfully');
  } catch (error) {
    log('Fatal error', error);
    process.exit(1);
  }
}

/**
 * Setup process termination handlers
 */
function setupProcessHandlers(server: any): void {
  const shutdown = async () => {
    log('Shutting down...');
    try {
      await server.close();
    } catch (error) {
      log('Error during shutdown', error);
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGHUP', shutdown);
  
  process.on('uncaughtException', (error) => {
    log('Uncaught exception', error);
    shutdown();
  });
}

main().catch(error => {
  log('Fatal error', error);
  process.exit(1);
});