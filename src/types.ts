export interface Tool {
  name: string;
  description?: string;
  inputSchema?: JsonSchema;
}

export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  $schema?: string;
  items?: JsonSchemaProperty;
  enum?: any[];
}

export interface JsonSchemaProperty {
  type: string | string[];
  format?: string;
  description?: string;
  enum?: any[];
  properties?: Record<string, JsonSchemaProperty>;
  items?: JsonSchemaProperty;
  required?: string[];
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