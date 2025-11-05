import mongoose from 'mongoose';
import Fish from '../models/Fish.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const migrateFishWeights = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all fish
    const allFish = await Fish.find({});
    console.log(`\n📊 Found ${allFish.length} fish to migrate`);

    let migratedCount = 0;
    let alreadyMigratedCount = 0;

    for (const fish of allFish) {
      // Check if already has weightOptions
      if (fish.weightOptions && fish.weightOptions.length > 0) {
        console.log(`⏭️  ${fish.name} - Already has weightOptions: [${fish.weightOptions.join(', ')}]`);
        alreadyMigratedCount++;
        continue;
      }

      // Set default weight options
      const defaultWeights = [0.5, 1, 1.5, 2, 2.5];

      fish.weightOptions = defaultWeights;
      await fish.save();

      console.log(`✅ ${fish.name} - Migrated with weightOptions: [${defaultWeights.join(', ')}]`);
      migratedCount++;
    }

    console.log('\n📋 Migration Summary:');
    console.log(`   Total fish: ${allFish.length}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Already had weightOptions: ${alreadyMigratedCount}`);
    console.log('\n🎉 Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateFishWeights();
