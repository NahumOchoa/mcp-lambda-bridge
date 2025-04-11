import axios, { AxiosInstance } from 'axios';
import { log } from './logger.js';
import { getConfig } from '../config.js';
import { JsonRpcRequest, JsonRpcResponse } from '../types.js';

/**
 * JSON-RPC client for Lambda communication
 */
export class JsonRpcClient {
  private static instance: JsonRpcClient;
  private httpClient: AxiosInstance | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): JsonRpcClient {
    if (!JsonRpcClient.instance) {
      JsonRpcClient.instance = new JsonRpcClient();
    }
    return JsonRpcClient.instance;
  }

  /**
   * Get or create HTTP client
   */
  private getClient(): AxiosInstance {
    const config = getConfig();
    
    if (!config.lambdaApiUrl) {
      throw new Error('Lambda API URL is not set. Please provide a valid Lambda URL.');
    }

    // Create new client if config changed or doesn't exist
    if (!this.httpClient) {
      this.httpClient = axios.create({
        baseURL: config.lambdaApiUrl,
        timeout: config.httpTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'jsonrpc': '2.0'
        }
      });
    }

    return this.httpClient;
  }

  /**
   * Call a JSON-RPC method
   */
  public async call(method: string, params?: any): Promise<JsonRpcResponse> {
    const config = getConfig();
    
    try {
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        method,
        params: params || {},
        id: Math.floor(Math.random() * 10000)
      };
      
  
      log(`Lambda request: ${method}`);
      
      const client = this.getClient();
      const response = await client.post<JsonRpcResponse>('', request);
      if (response.data.error) {
        log(`Lambda error (${method})`, response.data.error);
      }
      
      return response.data;
    } catch (error) {
      log(`Network error in JSON-RPC call (${method})`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error in JSON-RPC call: ${errorMessage}`);
    }
  }
}

/**
 * Make a JSON-RPC call to the Lambda function
 * @param method Method name
 * @param params Method parameters
 * @returns JSON-RPC response
 */
export async function callJsonRpc(method: string, params?: any): Promise<JsonRpcResponse> {
  return JsonRpcClient.getInstance().call(method, params);
} 