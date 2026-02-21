import { readConfig, writeConfig, } from '../infrastructure/fs.js';
import { createLogger } from '../utils/logger.js';
/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
    version: '2.0.0',
    enabled: true,
    voice: 'Samantha',
    rate: 200,
    volume: 50,
    minLength: 10,
    maxLength: 0,
    filters: {
        sensitive: false,
        skipCodeBlocks: false,
        skipCommands: false,
    },
};
/**
 * Configuration manager for Agent Speech Plugin
 * Handles loading, saving, and accessing configuration
 */
export class ConfigManager {
    config;
    dirty = false;
    logger = createLogger({ prefix: '[CONFIG]' });
    /**
     * Create a new ConfigManager
     */
    constructor() {
        this.config = { ...DEFAULT_CONFIG };
    }
    /**
     * Initialize config manager
     * Loads existing config or creates default
     */
    async init() {
        this.logger.debug('Initializing config manager');
        const loaded = await readConfig();
        if (loaded) {
            this.logger.info('Loaded existing config', { version: loaded.version });
            // Migrate config if needed
            this.config = this.migrateConfig(loaded);
        }
        else {
            this.logger.info('Creating new config with defaults');
            this.config = { ...DEFAULT_CONFIG };
        }
        this.dirty = false;
        this.logger.debug('Config initialized', { version: this.config.version });
    }
    /**
     * Migrate configuration from old format to new format
     * @param oldConfig - Possibly old configuration format
     * @returns Migrated configuration
     */
    migrateConfig(oldConfig) {
        // Check if it's already in new format (v2.0+)
        if (!oldConfig.global && !oldConfig.tools) {
            // Already new format
            return {
                ...DEFAULT_CONFIG,
                ...oldConfig,
            };
        }
        // Old format (v1.x) with global and tools
        this.logger.info('Migrating config from v1.x to v2.0');
        const global = oldConfig.global || {};
        const claudeTool = oldConfig.tools?.['claude-code'] || {};
        return {
            version: '2.0.0',
            enabled: claudeTool.enabled ?? global.enabled ?? DEFAULT_CONFIG.enabled,
            voice: claudeTool.voice ?? global.voice ?? DEFAULT_CONFIG.voice,
            rate: claudeTool.rate ?? global.rate ?? DEFAULT_CONFIG.rate,
            volume: claudeTool.volume ?? global.volume ?? DEFAULT_CONFIG.volume,
            minLength: global.minLength ?? DEFAULT_CONFIG.minLength,
            maxLength: global.maxLength ?? DEFAULT_CONFIG.maxLength,
            filters: global.filters ?? DEFAULT_CONFIG.filters,
            language: oldConfig.language,
        };
    }
    /**
     * Save configuration if changed
     */
    async save() {
        if (!this.dirty) {
            this.logger.debug('Save skipped: no changes');
            return;
        }
        this.logger.debug('Saving config');
        await writeConfig(this.config);
        this.dirty = false;
        this.logger.info('Config saved');
    }
    /**
     * Get configuration value
     * @param key - Configuration key
     * @returns Configuration value
     */
    get(key) {
        return this.config[key];
    }
    /**
     * Get all configuration
     * @returns Complete configuration object
     */
    getAll() {
        return { ...this.config };
    }
    /**
     * Set configuration value
     * @param key - Configuration key
     * @param value - New value
     */
    set(key, value) {
        this.config[key] = value;
        this.dirty = true;
    }
    /**
     * Set multiple configuration values
     * @param values - Partial configuration object
     */
    setMultiple(values) {
        Object.assign(this.config, values);
        this.dirty = true;
    }
    /**
     * Reset configuration to defaults
     */
    reset() {
        this.logger.info('Resetting config to defaults');
        this.config = { ...DEFAULT_CONFIG };
        this.dirty = true;
    }
    /**
     * Validate current configuration
     * @returns True if configuration is valid
     */
    validate() {
        if (typeof this.config.enabled !== 'boolean' ||
            typeof this.config.voice !== 'string' ||
            typeof this.config.rate !== 'number' ||
            typeof this.config.volume !== 'number' ||
            typeof this.config.minLength !== 'number' ||
            typeof this.config.maxLength !== 'number') {
            return false;
        }
        // Validate ranges
        if (this.config.rate < 50 || this.config.rate > 400) {
            return false;
        }
        if (this.config.volume < 0 || this.config.volume > 100) {
            return false;
        }
        if (this.config.minLength < 0 || this.config.maxLength < 0) {
            return false;
        }
        return true;
    }
    /**
     * Get configuration version
     * @returns Configuration version string
     */
    getVersion() {
        return this.config.version;
    }
}
//# sourceMappingURL=config.js.map