const fs = require('fs');
const files = [
  'views/ModulViewer.ejs',
  'views/ModulKonstruksi.ejs',
  'views/tools.ejs',
  'views/material.ejs',
  'views/index.ejs'
];

for (const file of files) {
  let content = fs.readFileSync('d:/Project Magang PLN/PLN-WEB/' + file, 'utf8');
  
  // Add overflow-x-hidden to html tag
  content = content.replace(/<html(.*?)class=\"(.*?)\"/, (match, p1, p2) => {
    if (!p2.includes('overflow-x-hidden')) {
      return `<html${p1}class=\"${p2} overflow-x-hidden\"`;
    }
    return match;
  });

  // Add overflow-x-hidden to main tag
  content = content.replace(/<main(.*?)class=\"(.*?)\"/, (match, p1, p2) => {
    if (!p2.includes('overflow-x-hidden')) {
      return `<main${p1}class=\"${p2} overflow-x-hidden\"`;
    }
    return match;
  });

  // Also replace w-[800px] or w-[700px] with max-w-[100vw] so it's impossible to overflow
  content = content.replace(/w-\[800px\]/g, 'w-[800px] max-w-[100vw]');
  content = content.replace(/w-\[700px\]/g, 'w-[700px] max-w-[100vw]');

  fs.writeFileSync('d:/Project Magang PLN/PLN-WEB/' + file, content);
}
console.log('Fixed mobile overflow in all public views');
