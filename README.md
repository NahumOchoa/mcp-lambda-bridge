# Lambda MCP Bridge

[![npm version](https://img.shields.io/npm/v/mcp-remote-lambda.svg)](https://www.npmjs.com/package/mcp-remote-lambda)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An efficient proxy that connects desktop LLM clients with Lambda functions using the Model Context Protocol (MCP). This bridge reduces API calls and costs while maintaining high performance by using standard HTTP instead of HTTP+SSE.

*Inspired by [mcp-remote](https://github.com/geelen/mcp-remote)*

## Why Lambda?

While mcp-remote enables connecting to remote HTTP+SSE servers, mcp-remote-lambda specifically targets AWS Lambda functions. This approach offers several unique benefits:

- **Serverless Architecture**: Deploy your MCP tools without managing infrastructure
- **Pay-per-use Pricing**: Only pay for actual compute time, not idle servers
- **Auto-scaling**: Handle varying workloads automatically
- **Global Availability**: Deploy functions close to your users for lower latency
- **Easy Versioning**: Update tools without disrupting existing clients

## Features

- **Simple Connection**: Easily connect your MCP-compatible LLMs to AWS Lambda functions
- **Reduced Costs**: Optimized communication to minimize API calls
- **CLI Support**: Run directly from the command line with npx
- **Flexible Configuration**: Multiple options to customize behavior
- **Input Interception**: Optional interception of input/output streams


## Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   LLM Client    │     │  MCP-Lambda-Bridge│     │   AWS Lambda    │
│  (Claude Desktop)│◄───►│    (Local Proxy)  │◄───►│  (Cloud Functions)│
└─────────────────┘     └───────────────────┘     └─────────────────┘
      MCP Protocol           HTTP Requests            Function Calls
       (stdio/IPC)          (Optimized Batch)       (JSON-RPC format)
```


## Using with MCP Clients

All the most popular MCP clients (Claude Desktop, Cursor & Windsurf) use the following config format:

### Claude Desktop

Claude Desktop configuration file location:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "lambda-bridge": {
      "command": "npx",
      "args": [
        "mcp-remote-lambda",
        "https://your-lambda-function.lambda-url.region.on.aws"
      ],
      "env": {
        "HTTP_TIMEOUT": "30000",
        "SERVER_NAME": "Lambda-MCP-Bridge",
        "SERVER_VERSION": "1.0.0",
        "SERVER_DESCRIPTION": "Bridge service that connects AWS Lambda to MCP-compatible LLMs"
      }
    }
  }
}

```

## Requirements

- Node.js >= 18.0.0
- An AWS Lambda function that implements the JSON-RPC protocol recommended
- Successfully tested with Lambda and API Gateway implementation from [serverless-mcp-server](https://github.com/eleva/serverless-mcp-server), which provides a minimal MCP server deployment example

## License

MIT 