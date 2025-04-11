import { validatePositiveInteger } from './validators.js';

interface CliOptions {
  lambdaUrl: string;
  timeout?: number;
  interceptInput?: boolean;
  name?: string;
  version?: string;
  description?: string;
}

/**
 * Parse command line arguments
 * @returns Parsed CLI options
 */
export function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    lambdaUrl: '',
    interceptInput: true
  };

  if (args.length > 0 && !args[0].startsWith('--')) {
    options.lambdaUrl = args[0];
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--url' || arg === '-u') {
      if (i + 1 < args.length) {
        options.lambdaUrl = args[++i];
      }
    } else if (arg === '--timeout' || arg === '-t') {
      if (i + 1 < args.length) {
        try {
          options.timeout = validatePositiveInteger(args[++i]);
        } catch (error) {
          console.error(`Invalid timeout value: ${args[i]}`);
        }
      }
    } else if (arg === '--no-intercept') {
      options.interceptInput = false;
    } else if (arg === '--name') {
      if (i + 1 < args.length) {
        options.name = args[++i];
      }
    } else if (arg === '--version') {
      if (i + 1 < args.length) {
        options.version = args[++i];
      }
    } else if (arg === '--description') {
      if (i + 1 < args.length) {
        options.description = args[++i];
      }
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Print help information
 */
function printHelp(): void {
  console.log(`
Lambda MCP Bridge - Connect AWS Lambda to MCP-compatible language models

Usage:
  npx lambda-mcp-bridge <lambda-url> [options]
  
Options:
  --url, -u <url>       Lambda function URL (can also be specified as first argument)
  --timeout, -t <ms>    HTTP timeout in milliseconds (default: 30000)
  --no-intercept        Disable input interception
  --name <name>         Server name
  --version <version>   Server version
  --description <desc>  Server description
  --help, -h            Show this help message
  
Examples:
  npx lambda-mcp-bridge https://abcd1234.lambda-url.us-west-2.on.aws
  npx lambda-mcp-bridge --url https://my-lambda.on.aws --timeout 60000
  `);
} 