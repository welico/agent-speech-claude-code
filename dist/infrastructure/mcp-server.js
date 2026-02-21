import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { TextToSpeech } from '../core/tts.js';
import { ConfigManager } from '../core/config.js';
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';
import { safeValidateSpeakTextInput } from '../utils/schemas.js';
/**
 * Tool name for speak_text
 */
const SPEAK_TOOL_NAME = 'speak_text';
/**
 * MCP Server for Agent Speech Plugin
 * Exposes TTS functionality as an MCP tool
 */
export class MCPServer {
    server;
    tts;
    config;
    logger = createLogger({ prefix: '[MCP]' });
    constructor() {
        this.server = new Server({
            name: 'agent-speech-claude-code',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.tts = new TextToSpeech();
        this.config = new ConfigManager();
        this.setupHandlers();
    }
    /**
     * Initialize the MCP server
     */
    async init() {
        this.logger.debug('Initializing MCP server');
        await this.config.init();
        await this.setupToolListing();
        this.logger.info('MCP server initialized');
    }
    /**
     * Start the MCP server with stdio transport
     */
    async start() {
        this.logger.debug('Starting MCP server with stdio transport');
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        this.logger.info('Agent Speech Plugin server started');
    }
    /**
     * Stop the MCP server
     */
    async stop() {
        this.logger.debug('Stopping MCP server');
        await this.server.close();
        this.logger.info('Agent Speech Plugin server stopped');
    }
    /**
     * Setup MCP handlers
     */
    setupHandlers() {
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            if (name === SPEAK_TOOL_NAME) {
                return this.handleSpeak(args);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Unknown tool: ${name}`,
                    },
                ],
            };
        });
    }
    /**
     * Setup tool listing
     */
    async setupToolListing() {
        // Set the tools handler (this is called by MCP clients)
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: SPEAK_TOOL_NAME,
                        description: 'Convert text to speech using macOS TTS',
                        inputSchema: this.getToolInputSchema(),
                    },
                ],
            };
        });
    }
    /**
     * Get tool input schema
     */
    getToolInputSchema() {
        return {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    description: 'Text to speak',
                },
                voice: {
                    type: 'string',
                    description: 'Voice name (e.g., Samantha, Alex, Victoria)',
                },
                rate: {
                    type: 'number',
                    description: 'Speech rate in words per minute (50-400)',
                },
                volume: {
                    type: 'number',
                    description: 'Volume level (0-100)',
                },
            },
            required: ['text'],
        };
    }
    /**
     * Handle speak_text tool call
     */
    async handleSpeak(args) {
        return withErrorHandling('handleSpeak', async () => {
            this.logger.debug('speak_text called', { args });
            // Validate input with Zod schema
            const validation = safeValidateSpeakTextInput(args);
            if (!validation.success) {
                this.logger.error('Validation failed', { error: validation.error });
                throw new Error(validation.error);
            }
            const input = validation.data;
            this.logger.debug('Parsed input', { text: input.text, length: input.text.length });
            // Get current config
            const currentConfig = this.config.getAll();
            this.logger.debug('Current config', currentConfig);
            // Merge input overrides with config
            const config = {
                enabled: currentConfig.enabled,
                voice: currentConfig.voice,
                rate: currentConfig.rate,
                volume: currentConfig.volume,
                minLength: currentConfig.minLength,
                maxLength: currentConfig.maxLength,
                filters: currentConfig.filters,
                ...(input.voice && { voice: input.voice }),
                ...(input.rate && { rate: input.rate }),
                ...(input.volume !== undefined && { volume: input.volume }),
            };
            this.logger.debug('Final config', { voice: config.voice, rate: config.rate, volume: config.volume });
            // Speak text (runs async, we return immediately)
            this.tts.speak(input.text, config);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Speaking text with voice "${config.voice}"`,
                    },
                ],
            };
        }, this.logger);
    }
}
/**
 * Create and start MCP server (entry point for MCP server mode)
 */
export async function createMCPServer() {
    const server = new MCPServer();
    await server.init();
    return server;
}
//# sourceMappingURL=mcp-server.js.map