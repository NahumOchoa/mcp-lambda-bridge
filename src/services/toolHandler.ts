import { log } from './logger.js';
import { callJsonRpc } from './rpcClient.js';
import { toolArgumentsCache } from '../interceptors/inputInterceptor.js';

export async function handleToolCall(toolName: string, args: any) {
  log(`Tool call '${toolName}'`, args);
  
  const cachedArgs = toolArgumentsCache[toolName];
  log(`Intercepted arguments for ${toolName}`, cachedArgs);
  
  try {
    const argToUse = cachedArgs || args;
    
    // Convert string numbers to actual numbers if needed
    if (typeof argToUse.a === 'string') {
      argToUse.a = Number(argToUse.a);
    }
    if (typeof argToUse.b === 'string') {
      argToUse.b = Number(argToUse.b);
    }
    
    const lambdaResponse = await callJsonRpc('tools/call', {
      name: toolName,
      arguments: argToUse
    });
    
    delete toolArgumentsCache[toolName];
    
    if (lambdaResponse.error) {
      log(`Error from Lambda for '${toolName}'`, lambdaResponse.error);
      throw new Error(lambdaResponse.error.message || 'Unknown error from Lambda');
    }
    
    if (lambdaResponse.result) {
      log(`Successful response for '${toolName}'`, lambdaResponse.result);
      return lambdaResponse.result;
    }
    
    throw new Error('Response without result or error');
  } catch (error) {
    log(`Error executing tool ${toolName}`, error);
    throw error;
  }
} 