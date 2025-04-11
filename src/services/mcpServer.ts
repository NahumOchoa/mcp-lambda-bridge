import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log } from './logger.js';
import { callJsonRpc } from './rpcClient.js';
import { getConfig } from '../config.js';
import { handleToolCall } from './toolHandler.js';
import { Tool, JsonSchema, JsonSchemaProperty } from '../types.js';
import { z } from 'zod';


/**
 * Setup and configure the MCP server
 */
export async function setupMcpServer(): Promise<McpServer> {
  const config = getConfig();
  log('Starting MCP proxy server for Lambda');
  
  if (!config.lambdaApiUrl) {
    throw new Error('Lambda API URL is not set. Please provide a valid Lambda URL when starting the application.');
  }
  
  const server = new McpServer(config.serverInfo);
  const transport = new StdioServerTransport();

  try {
    await registerTools(server);
    
    log('Connecting server to transport...');
    await server.connect(transport);
    log('MCP server ready and connected');
    
    return server;
  } catch (error) {
    log('Error initializing proxy', error);
    throw error;
  }
}

/**
 * Fetch and register tools from Lambda
 */
async function registerTools(server: McpServer): Promise<void> {
  log('Requesting tool list from Lambda...');
  const toolsResponse = await callJsonRpc('tools/list');

  if (!toolsResponse?.result?.tools) {
    throw new Error('Could not retrieve tools from Lambda');
  }

  const tools: Tool[] = toolsResponse.result.tools;
  log(`Registered ${tools.length} tools from Lambda`);

  for (const tool of tools) {
    registerTool(server, tool);
  }
}

/**
 * Register a single tool with the MCP server.
 * When registering with a schema, MCP Server will automatically validate
 * arguments before passing them to our handler function.
 */
function registerTool(server: McpServer, tool: Tool): void {
  if (!tool.inputSchema) {
    server.tool(
      tool.name,
      tool.description || `Tool: ${tool.name}`,
      (args) => handleToolCall(tool.name, args)
    );
    return;
  }
  
  
  const zodSchema = convertSchemaToZod(tool.inputSchema);
  server.tool(
    tool.name,
    tool.description || `Tool: ${tool.name}`,
    zodSchema,
    (args) => handleToolCall(tool.name, args)
  );
}

/**
 * Convert JSON Schema to Zod schema for automatic validation
 */
function convertSchemaToZod(schema: JsonSchema): Record<string, z.ZodTypeAny> {
  if (!schema.properties) {
    return {};
  }
  
  const result: Record<string, z.ZodTypeAny> = {};
  
  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    result[propName] = createZodType(propName, propSchema, schema.required);
  }
  
  return result;
}

/**
 * Create a Zod type for a specific property.
 * MCP Server will use this for validating and converting 
 * arguments automatically.
 */
function createZodType(
  propName: string, 
  propSchema: JsonSchemaProperty, 
  required?: string[]
): z.ZodTypeAny {
  const type = Array.isArray(propSchema.type) ? propSchema.type[0] : propSchema.type;
  let zodType: z.ZodTypeAny;
  
  switch (type) {
    case 'string':
      zodType = propSchema.enum && Array.isArray(propSchema.enum) 
        ? z.enum(propSchema.enum as [string, ...string[]]) 
        : z.string();
      break;
      
    case 'number':
    case 'integer':
      zodType = z.number();
      break;
      
    case 'boolean':
      zodType = z.boolean();
      break;
      
    case 'array':
      zodType = z.array(z.any());
      break;
      
    case 'object':
      zodType = z.object({}).passthrough();
      break;
      
    default:
      zodType = z.any();
  }
  
  if (required && !required.includes(propName)) {
    zodType = zodType.optional();
  }
  
  return zodType;
} 