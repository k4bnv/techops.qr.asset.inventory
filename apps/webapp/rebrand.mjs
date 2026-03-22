import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
    let results = [];
    let list = readdirSync(dir);
    list.forEach(function(file) {
        file = join(dir, file);
        let stat = statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/kolya/Desktop/shelf/shelf.nu/apps/webapp/app');
let modifiedFiles = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  
  // Replace Shelf.nu with TechOps Asset Inventory
  let newContent = content.replace(/\bShelf\.nu\b/g, 'TechOps Asset Inventory');
  
  // Replace standalone Shelf with TechOps
  // We use regex boundary to avoid matching ShelfError, useShelf, etc.
  // We also try to avoid replacing imports if they strictly expect "Shelf" 
  newContent = newContent.replace(/\bShelf\b(?!Error)/g, 'TechOps');
  
  if (content !== newContent) {
    writeFileSync(file, newContent, 'utf8');
    modifiedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Replaced branding in ${modifiedFiles} files.`);
