/**
 * Build-time script to generate static featured sessions data.
 * Cloudflare Workers don't have filesystem access, so we generate at build time.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEATURED_DIR = join(__dirname, '../public/featured-sessions');
const OUTPUT_FILE = join(__dirname, '../src/lib/featured-sessions.json');

function generate() {
    if (!existsSync(FEATURED_DIR)) {
        console.log('No featured-sessions directory found, creating empty data');
        writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
        return;
    }

    const files = readdirSync(FEATURED_DIR).filter(file => file.endsWith('.json'));

    const sessions = files.map(file => {
        try {
            const content = readFileSync(join(FEATURED_DIR, file), 'utf-8');
            const data = JSON.parse(content);
            return {
                filename: file,
                id: data.id,
                topic: data.topic || 'Untitled Session',
                mode: data.debateMode || 'Standard',
                agentsCount: data.agents?.length || 0,
                turnsCount: data.history?.length || 0,
                timestamp: data.savedAt || new Date().toISOString(),
                data: data
            };
        } catch (e) {
            console.error(`Error reading session ${file}:`, e);
            return null;
        }
    }).filter(Boolean);

    writeFileSync(OUTPUT_FILE, JSON.stringify(sessions, null, 2));
    console.log(`✓ Generated featured-sessions data with ${sessions.length} sessions`);
}

generate();
