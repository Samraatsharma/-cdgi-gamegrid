import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/glow-btn secondary/g, 'btn-secondary');
  content = content.replace(/glow-btn/g, 'btn-primary');
  content = content.replace(/glow-text-secondary/g, 'text-accent-secondary');
  content = content.replace(/glow-text/g, 'text-accent');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.js') && file !== 'globals.css') {
      fixFile(fullPath);
    }
  });
}

traverseDir(path.join(process.cwd(), 'app'));
console.log('Fixed styles across all files.');
