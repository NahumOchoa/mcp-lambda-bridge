export interface Tool {
  name: string;
  description?: string;
}

export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

export interface ServerConfig {
  name: string;
  version: string;
  description: string;
  [key: string]: unknown;
} 