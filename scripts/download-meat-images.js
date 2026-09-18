import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '..', 'public', 'images');

const imagesToDownload = [
  {
    name: 'cat_sausages.jpg',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=900&auto=format&fit=crop&q=85',
  },
  {
    name: 'meat_sausages.jpg',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=900&auto=format&fit=crop&q=85',
  },
  {
    name: 'meat_buff_keema.jpg',
    url: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=900&auto=format&fit=crop&q=85',
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    function makeRequest(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return makeRequest(response.headers.location);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed with HTTP status ${response.statusCode}`));
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }
    makeRequest(url);
  });
}

async function run() {
  for (const item of imagesToDownload) {
    const target = path.join(outputDir, item.name);
    try {
      await downloadFile(item.url, target);
      const stats = fs.statSync(target);
      console.log(`✓ Saved ${item.name} (${Math.round(stats.size / 1024)} KB)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
}

run();
