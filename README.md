# MCP-Lambda-Bridge

## Efficient Model Context Protocol Bridge for AWS Lambda Functions

MCP-Lambda-Bridge is a high-performance proxy service that optimizes communication between desktop LLM clients (like Claude Desktop) and AWS Lambda functions using the Model Context Protocol (MCP). This bridge eliminates the need for HTTP+SSE connections by efficiently batching and routing requests through standard HTTP calls, significantly reducing Lambda invocation frequency and associated costs.

## Key Benefits

- **Optimized API Consumption**: Reduces the number of Lambda invocations by using a single HTTP connection instead of maintaining HTTP+SSE streams
- **Cost Efficiency**: Minimizes AWS Lambda costs by decreasing the frequency of function calls
- **Low Latency**: Provides fast tool execution with minimal overhead
- **Simple Integration**: Works seamlessly with desktop LLM clients like Claude Desktop

## Features

- Transparent proxy between MCP-compatible AI clients and AWS Lambda functions
- Efficient batching and processing of tool requests
- Standard HTTP communication (no streaming/SSE required)
- Configurable through environment variables in Claude Desktop configuration
- Modular architecture with clean separation of concerns
- Minimal CPU and memory footprint

## Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   LLM Client    │     │  MCP-Lambda-Bridge│     │   AWS Lambda    │
│  (Claude Desktop)│◄───►│    (Local Proxy)  │◄───►│  (Cloud Functions)│
└─────────────────┘     └───────────────────┘     └─────────────────┘
      MCP Protocol           HTTP Requests            Function Calls
       (stdio/IPC)          (Optimized Batch)       (JSON-RPC format)
```

## Installation

```bash
# Clone the repository
git clone https://github.com/NahumOchoa/mcp-lambda-bridge.git
cd mcp-lambda-bridge

# Install dependencies
npm install

# Build the application
npm run build
```

## Configuration with Claude Desktop

To use with Claude Desktop, modify the Claude Desktop configuration file:

```json
{
    "mcpServers": {
        "lambda_proxy": {
            "command": "node",
            "args": ["/path/to/mcp-lambda-bridge/dist/index.js"],
            "env": {
                "LAMBDA_API_URL": "https://your-lambda-endpoint.execute-api.region.amazonaws.com/stage",
                "HTTP_TIMEOUT": "30000",
                "SERVER_NAME": "Lambda-MCP-Bridge",
                "SERVER_VERSION": "1.0.0",
                "SERVER_DESCRIPTION": "Bridge service for Lambda LLM tools"
            }
        }
    }
}
```

## Usage

After configuration, restart Claude Desktop, and the MCP-Lambda-Bridge will automatically start when Claude needs to access tools. The bridge handles communication with your Lambda function efficiently.

## How It Works

1. Claude Desktop spawns the bridge as a child process
2. The bridge receives tool definitions from your Lambda function
3. When a tool call is made, the bridge converts it to an optimized HTTP request
4. Lambda processes the request and returns the result
5. The bridge formats the response and returns it to Claude
6. The entire process uses standard HTTP requests instead of maintaining persistent connections

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 