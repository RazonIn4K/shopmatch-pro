import fs from 'fs';
import path from 'path';

// Mock function to simulate API call
async function submitToPipeline(imagePath: string) {
  console.log(`🚀 Submitting ${path.basename(imagePath)} to AI Restoration Pipeline...`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`✅ Job Submitted! Job ID: job_${Date.now()}`);
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/submit-job.ts <image_path> or <json_db_path>');
    process.exit(1);
  }
  
  const inputPath = args[0];
  
  if (inputPath.endsWith('.json')) {
    // Process batch from JSON
    console.log(`📦 Processing batch from ${inputPath}`);
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    for (const item of data) {
      if (item.localImagePath && fs.existsSync(item.localImagePath)) {
        await submitToPipeline(item.localImagePath);
      } else {
        console.log(`⚠️ Image not found: ${item.localImagePath}`);
      }
    }
    
  } else {
    // Process single file
    if (fs.existsSync(inputPath)) {
      await submitToPipeline(inputPath);
    } else {
      console.error(`❌ File not found: ${inputPath}`);
    }
  }
}

main().catch(console.error);
