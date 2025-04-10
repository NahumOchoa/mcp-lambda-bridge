export function log(message: string, obj?: any) {
  const timestamp = new Date().toISOString();
  let logMessage = `${timestamp} - ${message}`;
  
  if (obj !== undefined) {
    console.error(logMessage, obj);
  } else {
    console.error(logMessage);
  }
} 