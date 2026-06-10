const fs = require('fs');
const path = require('path');

const replacements = {
  'â”€': '─',
  'â”‚': '│',
  'â”œ': '├',
  'â””': '└',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.html') || fullPath.endsWith('.md') || fullPath.endsWith('.js') || fullPath.endsWith('.json') || fullPath.endsWith('.env.example'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [bad, good] of Object.entries(replacements)) {
        if (content.includes(bad)) {
          content = content.split(bad).join(good);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

processDirectory(__dirname);
console.log('Done!');
