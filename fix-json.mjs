import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'public', 'test_database.json');
let content = fs.readFileSync(filePath, 'utf8');

// Remove any existing outer braces that might have been added incorrectly
content = content.trim();

// Check if it starts with "pageProps" (missing outer braces)
if (content.startsWith('"pageProps"')) {
  // Add opening brace
  content = '{\n' + content;
}

// Fix the ending - remove trailing comma if present, then add closing braces
content = content.trimEnd();
if (content.endsWith(',')) {
  content = content.slice(0, -1);
}

// Add closing braces - one for pageProps, one for outer object
if (!content.endsWith('}')) {
  content = content + '\n}';
}
// Add outer closing brace
if (!content.endsWith('\n}\n}')) {
  content = content + '\n}';
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed JSON file structure');
console.log('First 50 chars:', content.substring(0, 50));
console.log('Last 50 chars:', content.substring(content.length - 50));



