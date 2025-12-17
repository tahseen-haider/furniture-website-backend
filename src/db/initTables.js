import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '#config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initTables = async () => {
  try {
    const dirPath = path.join(__dirname, 'db-init');
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.sql'));

    for (const file of files) {
      const sql = fs.readFileSync(path.join(dirPath, file), 'utf8');
      await pool.query(sql);
      console.log(`Executed ${file}`);
    }

    console.log('All tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing tables:', err);
    process.exit(1);
  }
};
