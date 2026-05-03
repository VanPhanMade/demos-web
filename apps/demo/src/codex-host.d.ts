type CodexLogLevel = "debug" | "info" | "warn" | "error";

interface Window {
  codexHost?: {
    platform: string;
    log(level: CodexLogLevel, message: string, details?: unknown): void;
  };
}

