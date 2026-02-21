import { AppConfig } from '../types/index.js';
/**
 * Configuration manager for Agent Speech Plugin
 * Handles loading, saving, and accessing configuration
 */
export declare class ConfigManager {
    private config;
    private dirty;
    private logger;
    /**
     * Create a new ConfigManager
     */
    constructor();
    /**
     * Initialize config manager
     * Loads existing config or creates default
     */
    init(): Promise<void>;
    /**
     * Migrate configuration from old format to new format
     * @param oldConfig - Possibly old configuration format
     * @returns Migrated configuration
     */
    private migrateConfig;
    /**
     * Save configuration if changed
     */
    save(): Promise<void>;
    /**
     * Get configuration value
     * @param key - Configuration key
     * @returns Configuration value
     */
    get<K extends keyof AppConfig>(key: K): AppConfig[K];
    /**
     * Get all configuration
     * @returns Complete configuration object
     */
    getAll(): AppConfig;
    /**
     * Set configuration value
     * @param key - Configuration key
     * @param value - New value
     */
    set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void;
    /**
     * Set multiple configuration values
     * @param values - Partial configuration object
     */
    setMultiple(values: Partial<AppConfig>): void;
    /**
     * Reset configuration to defaults
     */
    reset(): void;
    /**
     * Validate current configuration
     * @returns True if configuration is valid
     */
    validate(): boolean;
    /**
     * Get configuration version
     * @returns Configuration version string
     */
    getVersion(): string;
}
//# sourceMappingURL=config.d.ts.map