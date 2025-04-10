import axios from 'axios';
import { log } from './logger.js';
import { CONFIG } from '../config.js';
import { JsonRpcRequest, JsonRpcResponse } from '../types.js';

const httpClient = axios.create({
  baseURL: CONFIG.LAMBDA_API_URL,
  timeout: CONFIG.HTTP_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'jsonrpc': '2.0'
  }
});

export async function callJsonRpc(method: string, params?: any): Promise<JsonRpcResponse> {
  try {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method: method,
      params: params || {},
      id: Math.floor(Math.random() * 10000)
    };
    
    log(`Sending request ${method} to Lambda`, request);
    const response = await httpClient.post<JsonRpcResponse>('', request);
    log(`Lambda response for ${method}`, response.data);
    
    return response.data;
  } catch (error) {
    log(`Error in JSON-RPC call (${method})`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error in JSON-RPC call: ${errorMessage}`);
  }
} 