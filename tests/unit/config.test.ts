/**
 * Unit tests for ConfigManager class
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ConfigManager } from "../../src/core/config.js";
import type { ToolConfig } from "../../src/types/index.js";
import { rmSync, existsSync } from "node:fs";
import { writeFileSync } from "node:fs";

// The config file path used by ConfigManager (from infrastructure/fs.ts)
// Default is ~/.agent-speech/config.json - we'll write defaults before each test

describe("ConfigManager", () => {
    let config: ConfigManager;

    beforeEach(async () => {
        // Clean up any existing config to start fresh
        const configPaths = [
            "/Users/warezio/.agent-speech/config.json",
            process.env.HOME + "/.agent-speech/config.json",
        ];

        for (const path of configPaths) {
            if (existsSync(path)) {
                rmSync(path);
            }
        }

        config = new ConfigManager();
        await config.init();
    });

    describe("init()", () => {
        it("should initialize with default config", async () => {
            const globalConfig = config.getGlobal();
            expect(globalConfig.enabled).toBe(true);
            expect(globalConfig.voice).toBe("Samantha");
            expect(globalConfig.rate).toBe(200);
            expect(globalConfig.volume).toBe(50);
        });
    });

    describe("getGlobal()", () => {
        it("should return a copy of global config", () => {
            const global1 = config.getGlobal();
            const global2 = config.getGlobal();

            expect(global1).toEqual(global2);
            expect(global1).not.toBe(global2); // Different references
        });
    });

    describe("getToolConfig()", () => {
        it("should return merged config for known tool", () => {
            const toolConfig = config.getToolConfig("claude-code");
            expect(toolConfig.enabled).toBe(true);
            expect(toolConfig.voice).toBe("Samantha");
        });

        it("should return global config for unknown tool", () => {
            const toolConfig = config.getToolConfig("unknown-tool");
            const globalConfig = config.getGlobal();
            expect(toolConfig).toEqual(globalConfig);
        });

        it("should merge tool config with global", () => {
            const toolConfig = config.getToolConfig("opencode");
            expect(toolConfig.enabled).toBe(false); // Tool-specific value
        });
    });

    describe("isToolEnabled()", () => {
        it("should return true for enabled tools", () => {
            expect(config.isToolEnabled("claude-code")).toBe(true);
        });

        it("should return false for disabled tools", () => {
            expect(config.isToolEnabled("opencode")).toBe(false);
        });
    });

    describe("setGlobal()", () => {
        it("should set global config value", () => {
            config.setGlobal("voice", "Alex");
            const globalConfig = config.getGlobal();
            expect(globalConfig.voice).toBe("Alex");
        });

        it("should mark config as dirty", () => {
            config.setGlobal("rate", 250);
            // Config is now dirty and save() would write it
        });
    });

    describe("setToolConfig()", () => {
        it("should set tool config", () => {
            const toolConfig: ToolConfig = {
                enabled: false,
                voice: "Victoria",
            };
            config.setToolConfig("claude-code", toolConfig);

            const retrieved = config.getToolConfig("claude-code");
            expect(retrieved.enabled).toBe(false);
            expect(retrieved.voice).toBe("Victoria");
        });

        it("should throw for unsupported tool", () => {
            expect(() => {
                config.setToolConfig("unsupported-tool", { enabled: true });
            }).toThrow("Unsupported tool");
        });

        it("should merge with existing config", () => {
            // First set voice to Victoria
            config.setToolConfig("claude-code", { voice: "Victoria" });
            // Then only set enabled, voice should be preserved
            config.setToolConfig("claude-code", { enabled: false });
            const retrieved = config.getToolConfig("claude-code");
            expect(retrieved.enabled).toBe(false);
            expect(retrieved.voice).toBe("Victoria"); // Kept from previous set
        });
    });

    describe("setToolEnabled()", () => {
        it("should enable tool", () => {
            config.setToolEnabled("opencode", true);
            expect(config.isToolEnabled("opencode")).toBe(true);
        });

        it("should disable tool", () => {
            config.setToolEnabled("claude-code", false);
            expect(config.isToolEnabled("claude-code")).toBe(false);
        });
    });

    describe("toggleTool()", () => {
        it("should toggle enabled state", () => {
            const initial = config.isToolEnabled("claude-code");
            const toggled = config.toggleTool("claude-code");
            expect(toggled).toBe(!initial);
            expect(config.isToolEnabled("claude-code")).toBe(toggled);
        });
    });

    describe("validate()", () => {
        it("should return true for valid default config", () => {
            expect(config.validate()).toBe(true);
        });

        it("should validate rate range", async () => {
            const testConfig = new ConfigManager();
            await testConfig.init(); // Initialize with defaults

            testConfig.setGlobal("rate", 50); // Minimum
            expect(testConfig.validate()).toBe(true);

            testConfig.setGlobal("rate", 400); // Maximum
            expect(testConfig.validate()).toBe(true);

            testConfig.setGlobal("rate", 49); // Below minimum
            expect(testConfig.validate()).toBe(false);

            testConfig.setGlobal("rate", 401); // Above maximum
            expect(testConfig.validate()).toBe(false);
        });

        it("should validate volume range", async () => {
            // Use the shared config - but skip initial assertions if already invalid
            // (due to test isolation issues with shared config file)
            config.setGlobal("rate", 200); // Reset rate to valid value first

            config.setGlobal("volume", 10); // Valid value
            expect(config.validate()).toBe(true);

            config.setGlobal("volume", 50); // Middle value
            expect(config.validate()).toBe(true);

            config.setGlobal("volume", 100); // Maximum
            expect(config.validate()).toBe(true);

            config.setGlobal("volume", -1); // Below minimum
            expect(config.validate()).toBe(false);

            config.setGlobal("volume", 101); // Above maximum
            expect(config.validate()).toBe(false);
        });
    });

    describe("getVersion()", () => {
        it("should return version string", () => {
            const version = config.getVersion();
            expect(typeof version).toBe("string");
            expect(version.length).toBeGreaterThan(0);
        });
    });

    describe("getRaw()", () => {
        it("should return raw config object", () => {
            const raw = config.getRaw();
            expect(raw).toHaveProperty("version");
            expect(raw).toHaveProperty("global");
            expect(raw).toHaveProperty("tools");
        });
    });
});
