import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { AppConfig } from '../types/index.js';

/**
 * Default config directory
 */
const DEFAULT_CONFIG_DIR = '.agent-speech';

/**
 * Default config file name
 */
const CONFIG_FILE_NAME = 'config.json';

/**
 * Get user home directory
 */
export function getUserHome(): string {
  return process.env.HOME || process.env.USERPROFILE || '.';
}

/**
 * Get default config path
 */
export function getConfigPath(): string {
  return join(getUserHome(), DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
}

/**
 * Get config directory path
 */
export function getConfigDir(): string {
  return join(getUserHome(), DEFAULT_CONFIG_DIR);
}

/**
 * Ensure config directory exists
 */
export async function ensureConfigDir(): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Read JSON file
 */
export async function readJSON<T = unknown>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Write JSON file
 */
export async function writeJSON<T>(path: string, data: T): Promise<void> {
  await ensureConfigDir();
  const dir = dirname(path);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Read config from default location
 */
export async function readConfig(): Promise<AppConfig | null> {
  return readJSON<AppConfig>(getConfigPath());
}

/**
 * Write config to default location
 */
export async function writeConfig(config: AppConfig): Promise<void> {
  await writeJSON(getConfigPath(), config);
}

/**
 * Check if config file exists
 */
export function configExists(): boolean {
  return existsSync(getConfigPath());
}
