async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  // readPath is the path to the file that Claude is trying to read
  const readPath =
    toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";

  // Block any .env file except .env.example
  // Matches: .env, .env.local, apps/api/.env, ../.env, .env.production, etc.
  // Does NOT match: .env.example
  const isEnvFile = /(?:^|\/)\.env(?!\.example)(?:\.|$)/.test(readPath);
  if (isEnvFile) {
    console.error("read_hook: .env file not allowed");
    process.exit(2);
  }
}

main();
