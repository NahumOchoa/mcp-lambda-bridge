import { log } from './logger.js';
import { callJsonRpc } from './rpcClient.js';
import { toolArgumentsCache } from '../interceptors/inputInterceptor.js';

/**
 * Handles tool calls and executes them via Lambda
 * @param toolName Name of the tool to call
 * @param args Arguments for the tool (already validated by MCP Server)
 * @returns Tool execution result
 */
export async function handleToolCall(toolName: string, args: any) {
  log(`Executing tool: ${toolName}`);
  
  try {
    const finalArgs = toolArgumentsCache[toolName] || args;
    
    const result = await executeToolOnLambda(toolName, finalArgs);
    
    return result;
  } catch (error) {
    log(`Error executing tool ${toolName}`, error);
    throw error;
  }
}

/**
 * Execute the tool on Lambda and handle response
 */
async function executeToolOnLambda(toolName: string, args: any): Promise<any> {
  const lambdaResponse = await callJsonRpc('tools/call', {
    name: toolName,
    arguments: args
  });
  
  delete toolArgumentsCache[toolName];
  
  if (lambdaResponse.error) {
    throw new Error(lambdaResponse.error.message || 'Unknown error from Lambda');
  }
  
  if (lambdaResponse.result) {
    return lambdaResponse.result;
  }
  
  throw new Error('Response without result or error');
} 