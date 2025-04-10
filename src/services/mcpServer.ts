import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { log } from './logger.js';
import { callJsonRpc } from './rpcClient.js';
import { CONFIG } from '../config.js';
import { handleToolCall } from './toolHandler.js';
import { Tool } from '../types.js';

export async function setupMcpServer() {
  log('Starting MCP proxy server for Lambda');
  
  const server = new McpServer(CONFIG.SERVER_INFO);

  const transport = new StdioServerTransport();

  try {
    log('Requesting tool list...');
    const toolsResponse = await callJsonRpc('tools/list');

    if (toolsResponse && toolsResponse.result && toolsResponse.result.tools) {
      const tools: Tool[] = toolsResponse.result.tools;
      log(`Found ${tools.length} tools in Lambda`);

      for (const tool of tools) {
        log(`Registering tool: ${tool.name}`);
        
        server.tool(
          tool.name,
          tool.description || `Tool: ${tool.name}`,
          (args) => handleToolCall(tool.name, args)
        );
      }
    } else {
      throw new Error('Could not retrieve tools from Lambda');
    }
    
    log('Connecting server to transport...');
    await server.connect(transport);
    log('MCP server connected and ready to receive requests');
    
    return server;
  } catch (error) {
    log('Error initializing proxy', error);
    throw error;
  }
} 