import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://i.imgur.com/9VzJJ0a.png';
const publicDir = path.resolve(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const file = fs.createWriteStream(path.join(publicDir, 'logo.png'));
https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed.');
  });
}).on('error', (err) => {
  fs.unlinkSync(path.join(publicDir, 'logo.png'));
  console.error('Error downloading:', err.message);
});
