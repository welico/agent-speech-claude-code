import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TextToSpeech } from '../core/tts.js';
import { ConfigManager } from '../core/config.js';
import { SpeakTextInput } from '../types/index.js';

/**
 * Tool name for speak_text
 */
const SPEAK_TOOL_NAME = 'speak_text';

/**
 * MCP Server for Agent Speech Plugin
 * Exposes TTS functionality as an MCP tool
 */
export class MCPServer {
  private server: Server;
  private tts: TextToSpeech;
  private config: ConfigManager;

  constructor() {
    this.server = new Server(
      {
        name: 'agent-speech-plugin',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tts = new TextToSpeech();
    this.config = new ConfigManager();

    this.setupHandlers();
  }

  /**
   * Initialize the MCP server
   */
  async init(): Promise<void> {
    await this.config.init();
    await this.setupToolListing();
  }

  /**
   * Start the MCP server with stdio transport
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log to stderr (won't interfere with MCP protocol)
    console.error('[MCP] Agent Speech Plugin server started');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    await this.server.close();
    console.error('[MCP] Agent Speech Plugin server stopped');
  }

  /**
   * Setup MCP handlers
   */
  private setupHandlers(): void {
    // Handle tool calls
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
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
      }
    );
  }

  /**
   * Setup tool listing
   */
  private async setupToolListing(): Promise<void> {
    // Set the tools handler (this is called by MCP clients)
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => {
        return {
          tools: [
            {
              name: SPEAK_TOOL_NAME,
              description: 'Convert text to speech using macOS TTS',
              inputSchema: this.getToolInputSchema(),
            },
          ],
        };
      }
    );
  }

  /**
   * Get tool input schema
   */
  private getToolInputSchema() {
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
  private async handleSpeak(args: unknown): Promise<{
    content: Array<{ type: string; text: string }>;
  }> {
    try {
      // Parse input
      const input = this.parseSpeakInput(args);

      // Get tool config (claude-code tool config)
      const toolConfig = this.config.getToolConfig('claude-code');

      // Merge input overrides with config
      const config = {
        ...toolConfig,
        ...(input.voice && { voice: input.voice }),
        ...(input.rate && { rate: input.rate }),
        ...(input.volume !== undefined && { volume: input.volume }),
      };

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[MCP] Error handling speak:', error);

      return {
        content: [
          {
            type: 'text',
            text: `Error: ${message}`,
          },
        ],
      };
    }
  }

  /**
   * Parse speak_text input
   */
  private parseSpeakInput(args: unknown): SpeakTextInput {
    if (typeof args !== 'object' || args === null) {
      throw new Error('Invalid input: expected object');
    }

    const obj = args as Record<string, unknown>;

    if (typeof obj.text !== 'string') {
      throw new Error('Invalid input: text must be a string');
    }

    const input: SpeakTextInput = {
      text: obj.text,
    };

    if (typeof obj.voice === 'string') {
      input.voice = obj.voice;
    }

    if (typeof obj.rate === 'number') {
      input.rate = obj.rate;
    }

    if (typeof obj.volume === 'number') {
      input.volume = obj.volume;
    }

    return input;
  }
}

/**
 * Create and start MCP server (entry point for MCP server mode)
 */
export async function createMCPServer(): Promise<MCPServer> {
  const server = new MCPServer();
  await server.init();
  return server;
}
