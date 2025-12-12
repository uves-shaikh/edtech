// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

type PrismaClientInstance = any;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientInstance | undefined;
}

function createPrismaClient(): PrismaClientInstance {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  }) as PrismaClientInstance;
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
