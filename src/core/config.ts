import {
  AppConfig,
  TTSConfig,
  ToolConfig,
} from '../types/index.js';
import {
  readConfig,
  writeConfig,
  configExists,
} from '../infrastructure/fs.js';
import { createLogger } from '../utils/logger.js';

/**
 * Default TTS configuration
 */
const DEFAULT_TTS_CONFIG: TTSConfig = {
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
 * Default application configuration
 */
const DEFAULT_APP_CONFIG: AppConfig = {
  version: '0.1.0',
  global: DEFAULT_TTS_CONFIG,
  tools: {
    'claude-code': {
      enabled: true,
      voice: 'Samantha',
      rate: 200,
    },
    'opencode': {
      enabled: false,
    },
    'codex-cli': {
      enabled: false,
    },
    'gemini-cli': {
      enabled: false,
    },
  },
};

/**
 * Supported tool names
 */
const SUPPORTED_TOOLS = [
  'claude-code',
  'opencode',
  'codex-cli',
  'gemini-cli',
] as const;

/**
 * Configuration manager for Agent Speech Plugin
 * Handles loading, saving, and accessing configuration
 */
export class ConfigManager {
  private config: AppConfig;
  private dirty: boolean = false;
  private logger = createLogger({ prefix: '[CONFIG]' });

  /**
   * Create a new ConfigManager
   * @param configPath - Optional custom config path
   */
  constructor(
    private configPath?: string
  ) {
    this.config = DEFAULT_APP_CONFIG;
  }

  /**
   * Initialize config manager
   * Loads existing config or creates default
   */
  async init(): Promise<void> {
    this.logger.debug('Initializing config manager');

    const loaded = await (this.configPath
      ? readConfig()
      : readConfig());

    if (loaded) {
      this.logger.info('Loaded existing config');
      // Merge with defaults to ensure all fields exist
      this.config = this.mergeWithDefaults(loaded);
    } else {
      this.logger.info('Creating new config with defaults');
      // Create new config with defaults
      this.config = { ...DEFAULT_APP_CONFIG };
    }

    this.dirty = false;
    this.logger.debug('Config initialized', { version: this.config.version });
  }

  /**
   * Save configuration if changed
   */
  async save(): Promise<void> {
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
   * Get global TTS configuration
   */
  getGlobal(): TTSConfig {
    return { ...this.config.global };
  }

  /**
   * Get tool-specific TTS configuration (merged with global)
   * @param toolName - Name of the tool
   * @returns Merged configuration for the tool
   */
  getToolConfig(toolName: string): TTSConfig {
    const global = this.getGlobal();
    const toolConfig = this.config.tools[toolName];

    if (!toolConfig) {
      this.logger.debug(`No config for tool "${toolName}", using global`);
      return global;
    }

    // Merge tool config with global (tool config takes precedence)
    return {
      enabled: toolConfig.enabled ?? global.enabled,
      voice: toolConfig.voice ?? global.voice,
      rate: toolConfig.rate ?? global.rate,
      volume: toolConfig.volume ?? global.volume,
      minLength: global.minLength,
      maxLength: global.maxLength,
      filters: { ...global.filters },
    };
  }

  /**
   * Check if tool is enabled
   * @param toolName - Name of the tool
   * @returns True if TTS is enabled for the tool
   */
  isToolEnabled(toolName: string): boolean {
    const config = this.getToolConfig(toolName);
    return config.enabled;
  }

  /**
   * Set global configuration value
   * @param key - Configuration key
   * @param value - New value
   */
  setGlobal<K extends keyof TTSConfig>(
    key: K,
    value: TTSConfig[K]
  ): void {
    (this.config.global[key] as TTSConfig[K]) = value;
    this.dirty = true;
  }

  /**
   * Set tool-specific configuration
   * @param toolName - Name of the tool
   * @param config - Tool configuration (partial)
   */
  setToolConfig(toolName: string, config: ToolConfig): void {
    if (!SUPPORTED_TOOLS.includes(toolName as any)) {
      this.logger.error('Unsupported tool', { toolName });
      throw new Error(`Unsupported tool: ${toolName}`);
    }

    const existing = this.config.tools[toolName] || {};
    this.config.tools[toolName] = { ...existing, ...config };
    this.dirty = true;
  }

  /**
   * Enable/disable TTS for a tool
   * @param toolName - Name of the tool
   * @param enabled - Whether to enable TTS
   */
  setToolEnabled(toolName: string, enabled: boolean): void {
    this.setToolConfig(toolName, { enabled });
  }

  /**
   * Toggle TTS for a tool
   * @param toolName - Name of the tool
   * @returns New enabled state
   */
  toggleTool(toolName: string): boolean {
    const current = this.isToolEnabled(toolName);
    const newState = !current;
    this.setToolEnabled(toolName, newState);
    return newState;
  }

  /**
   * Validate current configuration
   * @returns True if configuration is valid
   */
  validate(): boolean {
    const { global } = this.config;

    // Validate global config
    if (
      typeof global.enabled !== 'boolean' ||
      typeof global.voice !== 'string' ||
      typeof global.rate !== 'number' ||
      typeof global.volume !== 'number' ||
      typeof global.minLength !== 'number' ||
      typeof global.maxLength !== 'number'
    ) {
      return false;
    }

    // Validate ranges
    if (global.rate < 50 || global.rate > 400) {
      return false;
    }

    if (global.volume < 0 || global.volume > 100) {
      return false;
    }

    if (global.minLength < 0 || global.maxLength < 0) {
      return false;
    }

    return true;
  }

  /**
   * Get configuration version
   */
  getVersion(): string {
    return this.config.version;
  }

  /**
   * Check if configuration exists on disk
   */
  static exists(): boolean {
    return configExists();
  }

  /**
   * Merge loaded config with defaults to ensure all fields exist
   */
  private mergeWithDefaults(loaded: AppConfig): AppConfig {
    return {
      version: loaded.version || DEFAULT_APP_CONFIG.version,
      global: {
        ...DEFAULT_APP_CONFIG.global,
        ...loaded.global,
        filters: {
          ...DEFAULT_APP_CONFIG.global.filters,
          ...loaded.global?.filters,
        },
      },
      tools: {
        ...DEFAULT_APP_CONFIG.tools,
        ...loaded.tools,
      },
    };
  }

  /**
   * Get raw config object (for debugging)
   */
  getRaw(): Readonly<AppConfig> {
    return this.config;
  }
}
