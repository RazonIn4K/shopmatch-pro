import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import groups from './groups.json';

const DATA_DIR = 'scraped_data';
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const POSTS_FILE = path.join(DATA_DIR, 'group-posts.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

test.describe('Restoration Bot Scraper', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.facebook.com/');
  });

  for (const group of groups) {
    test(`scrape group: ${group.name}`, async ({ page }) => {
      console.log(`\n🔍 Scanning Group: ${group.name} (${group.url})`);
      await page.goto(group.url);
      
      // Wait for feed
      try {
        await page.waitForSelector('[role="feed"]', { timeout: 10000 });
      } catch {
        console.log(`   ⚠️ Could not load feed for ${group.name}. Skipping.`);
        return;
      }
      
      const posts = page.locator('[role="article"]');
      const count = await posts.count();
      console.log(`   Found ${count} posts loaded.`);
      
      const scrapedPosts = [];

      // Analyze first 5 posts
      for (let i = 0; i < Math.min(count, 5); i++) {
        const post = posts.nth(i);
        const text = await post.innerText().catch(() => '');
        
        // Check for keywords
        const keywords = ['restaurar', 'restore', 'arreglar', 'fix', 'dañada', 'damaged', 'antigua', 'old'];
        const isRelevant = keywords.some(k => text.toLowerCase().includes(k));
        
        if (isRelevant) {
          // Check for images
          const images = post.locator('img');
          const imgCount = await images.count();
          
          if (imgCount > 0) {
            const src = await images.first().getAttribute('src');
            if (src) {
              console.log(`   ✅ Relevant Post Found: "${text.substring(0, 30)}..."`);
              
              // Download Image
              const imageFileName = `group_${i}_${Date.now()}.jpg`;
              const imagePath = path.join(IMAGES_DIR, imageFileName);
              
              try {
                const response = await page.request.get(src);
                const buffer = await response.body();
                fs.writeFileSync(imagePath, buffer);
                console.log(`      Saved image to ${imagePath}`);
                
                scrapedPosts.push({
                  group: group.name,
                  text: text,
                  imageUrl: src,
                  localImagePath: imagePath,
                  timestamp: new Date().toISOString()
                });
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                console.log(`      ❌ Failed to download image: ${message}`);
              }
            }
          }
        }
      }
      
      // Save to JSON
      if (scrapedPosts.length > 0) {
        let existingData = [];
        if (fs.existsSync(POSTS_FILE)) {
          existingData = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
        }
        const newData = [...existingData, ...scrapedPosts];
        fs.writeFileSync(POSTS_FILE, JSON.stringify(newData, null, 2));
        console.log(`   💾 Saved ${scrapedPosts.length} posts to ${POSTS_FILE}`);
      }
    });
  }
});
