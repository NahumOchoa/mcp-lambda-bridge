import { InputInterceptor } from './interceptors/inputInterceptor.js';
import { setupMcpServer } from './services/mcpServer.js';
import { log } from './services/logger.js';

async function main() {
  try {
    const interceptor = new InputInterceptor();
    interceptor.wrap();
    
    await setupMcpServer();
  } catch (error) {
    log('Fatal error', error);
    process.exit(1);
  }
}

main().catch(error => {
  log('Fatal error', error);
  process.exit(1);
});
