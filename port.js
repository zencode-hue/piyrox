const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../piyrox-homepage');
const destDir = path.join(__dirname, 'src/app');

// 1. Copy globals.css
const cssContent = fs.readFileSync(path.join(srcDir, 'style.css'), 'utf-8');
fs.writeFileSync(path.join(destDir, 'globals.css'), cssContent);

// 2. Port HTML files
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));

function htmlToJsx(html) {
  let jsx = html;
  
  // Extract body content
  const bodyMatch = jsx.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    jsx = bodyMatch[1];
  }

  // Basic React conversions
  jsx = jsx.replace(/class="/g, 'className="');
  jsx = jsx.replace(/for="/g, 'htmlFor="');
  jsx = jsx.replace(/onclick="/g, 'onClick="');
  jsx = jsx.replace(/onsubmit="/g, 'onSubmit="');
  jsx = jsx.replace(/style="([^"]*)"/g, (match, styleStr) => {
    // Very basic style string to object converter (not perfect but handles simple cases)
    const styleObj = styleStr.split(';').filter(s => s.trim()).map(s => {
      const [key, val] = s.split(':');
      if(!key || !val) return '';
      const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      return `${camelKey}: '${val.trim()}'`;
    }).join(', ');
    return `style={{${styleObj}}}`;
  });

  // Self-closing tags
  const tagsToClose = ['input', 'img', 'hr', 'br', 'meta', 'link'];
  tagsToClose.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    jsx = jsx.replace(regex, `<${tag}$1 />`);
  });

  // Fix SVG fill rules and attributes if any
  jsx = jsx.replace(/fill-rule/g, 'fillRule');
  jsx = jsx.replace(/clip-rule/g, 'clipRule');
  jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
  jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
  jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');

  // Fix inline comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

  return jsx;
}

files.forEach(file => {
  const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  const jsxContent = htmlToJsx(content);
  
  const componentName = file === 'index.html' ? 'Home' : file.replace('.html', '').charAt(0).toUpperCase() + file.replace('.html', '').slice(1);
  
  const reactCode = `
"use client";
import React from 'react';
import Link from 'next/link';

export default function ${componentName}() {
  return (
    <>
      ${jsxContent}
    </>
  );
}
`;

  if (file === 'index.html') {
    fs.writeFileSync(path.join(destDir, 'page.tsx'), reactCode);
  } else {
    const routeDir = path.join(destDir, file.replace('.html', ''));
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(routeDir, 'page.tsx'), reactCode);
  }
  console.log(\`Ported \${file}\`);
});

// Copy public directory (assets, images, zip files)
const oldPublic = path.join(srcDir, 'public');
const newPublic = path.join(__dirname, 'public');
if (fs.existsSync(oldPublic)) {
  fs.cpSync(oldPublic, newPublic, { recursive: true });
}
