import { log } from '../services/logger.js';

export const toolArgumentsCache: { [toolName: string]: any } = {};

export class InputInterceptor {
  private buffer: string = '';
  
  constructor() {}
  
  wrap() {
    const self = this;
    const originalRead = process.stdin.read;
    
    process.stdin.read = function(size?: number) {
      const chunk = originalRead.call(process.stdin, size);
      if (chunk !== null) {
        self.processChunk(chunk);
      }
      return chunk;
    };
    
    const originalOn = process.stdin.on.bind(process.stdin);
    process.stdin.on = function(event: any, listener: any) {
      if (event === 'data') {
        const wrappedListener = (chunk: Buffer) => {
          self.processChunk(chunk);
          listener(chunk);
        };

        return originalOn(event, wrappedListener);
      }
      return originalOn(event, listener);
    };
    
    log('Input interceptor configured');
  }
  
  processChunk(chunk: Buffer | string) {
    const str = chunk.toString();
    this.buffer += str;
    
    let newlineIndex;
    while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.substring(0, newlineIndex);
      this.buffer = this.buffer.substring(newlineIndex + 1);
      
      this.processLine(line);
    }
  }
  
  processLine(line: string) {
    try {
      const message = JSON.parse(line);
      
      if (message && message.method === 'tools/call' && message.params && message.params.name) {
        const toolName = message.params.name;
        const toolArgs = message.params.arguments;
        
        log(`🔍 Intercepted tools/call for '${toolName}'`, toolArgs);
        
        toolArgumentsCache[toolName] = toolArgs;
      }
    } catch (e) {
      log(`Error parsing line: ${line}`, e);
    }
  }
} 