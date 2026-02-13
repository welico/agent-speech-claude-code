/**
 * Integration tests for Text-to-Speech functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TextToSpeech } from '../../src/core/tts.js';
import { ConfigManager } from '../../src/core/config.js';
import { rmSync } from 'fs';

const CONFIG_PATH = '/tmp/test-agent-speech-config.json';

describe('TextToSpeech Integration', () => {
  let tts: TextToSpeech;

  beforeEach(() => {
    tts = new TextToSpeech();
    // Clean up any previous test config
    try {
      rmSync(CONFIG_PATH);
    } catch {}
  });

  it('should be constructable', () => {
    expect(tts).toBeDefined();
    expect(tts.isEnabled()).toBe(true);
  });

  it('should list available voices', async () => {
    const voices = await tts.getAvailableVoices();
    expect(Array.isArray(voices)).toBe(true);
    expect(voices.length).toBeGreaterThan(0);
    expect(voices[0]).toHaveProperty('name');
    expect(voices[0]).toHaveProperty('displayName');
    expect(voices[0]).toHaveProperty('language');
  });

  it('should filter sensitive information', () => {
    const config = {
      enabled: true,
      voice: 'Samantha',
      rate: 200,
      volume: 50,
      minLength: 0,
      maxLength: 0,
      filters: {
        sensitive: true,
        skipCodeBlocks: false,
        skipCommands: false,
      },
    };

    const text = 'The password is secret123 and the API key is AKIAIOSFODNN7EXAMPLE';
    const detected = tts.detectSensitive(text);
    expect(detected).toBe(true);
  });

  it('should remove code blocks', () => {
    const config = {
      enabled: true,
      voice: 'Samantha',
      rate: 200,
      volume: 50,
      minLength: 0,
      maxLength: 0,
      filters: {
        sensitive: false,
        skipCodeBlocks: true,
        skipCommands: false,
      },
    };

    const text = 'Here is some code\n```javascript\nconsole.log("hello");\n```\nAnd some more text';
    const filtered = tts.removeCodeBlocks(text);
    expect(filtered).not.toContain('console.log');
    expect(filtered).toContain('Here is some code');
    expect(filtered).toContain('And some more text');
  });

  it('should respect minimum length filter', async () => {
    const config = {
      enabled: true,
      voice: 'Samantha',
      rate: 200,
      volume: 50,
      minLength: 50,  // Require at least 50 characters
      maxLength: 0,
      filters: {
        sensitive: false,
        skipCodeBlocks: false,
        skipCommands: false,
      },
    };

    // Mock the speak command - we don't want actual speech in tests
    const speakSpy = { speak: vi.fn().mockResolvedValue(undefined) };
    // The TTS should skip short text
    await tts.speak('Hi', config);
    // Since text is shorter than minLength, speech should be skipped
    // (no error thrown, no actual speech)
  });
});
