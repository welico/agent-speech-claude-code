import { AppConfig } from '../types/index.js';
/**
 * Get user home directory
 */
export declare function getUserHome(): string;
/**
 * Get default config path
 */
export declare function getConfigPath(): string;
/**
 * Get config directory path
 */
export declare function getConfigDir(): string;
/**
 * Ensure config directory exists
 */
export declare function ensureConfigDir(): Promise<void>;
/**
 * Read JSON file
 */
export declare function readJSON<T = unknown>(path: string): Promise<T | null>;
/**
 * Write JSON file
 */
export declare function writeJSON<T>(path: string, data: T): Promise<void>;
/**
 * Read config from default location
 */
export declare function readConfig(): Promise<AppConfig | null>;
/**
 * Write config to default location
 */
export declare function writeConfig(config: AppConfig): Promise<void>;
/**
 * Check if config file exists
 */
export declare function configExists(): boolean;
//# sourceMappingURL=fs.d.ts.map