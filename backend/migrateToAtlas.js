/**
 * Career Horizon — MongoDB to MongoDB Atlas Safe Migration Utility
 *
 * Transfers all collections, documents, ObjectIds, and relationships from
 * local MongoDB to your MongoDB Atlas Cloud database without data loss.
 *
 * Usage:
 *   node migrateToAtlas.js "mongodb+srv://<username>:<password>@cluster0.mongodb.net/career_horizon?retryWrites=true&w=majority"
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

const SOURCE_URI = process.env.SOURCE_MONGO_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career_horizon";
const TARGET_URI = process.argv[2] || process.env.ATLAS_URI || process.env.TARGET_MONGO_URI;

if (!TARGET_URI || TARGET_URI.includes("<password>")) {
    console.error("\n===============================================================");
    console.error("ERROR: Missing or incomplete MongoDB Atlas Connection String!");
    console.error("===============================================================");
    console.error("Please supply your Atlas URI as a command line argument:");
    console.error('  node migrateToAtlas.js "mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/career_horizon?retryWrites=true&w=majority"');
    console.error("===============================================================\n");
    process.exit(1);
}

async function migrate() {
    console.log("\n===============================================================");
    console.log("   CAREER HORIZON — MONGODB ATLAS SAFE DATA MIGRATION");
    console.log("===============================================================");
    console.log("Source Database:", SOURCE_URI.replace(/\/\/.*@/, "//***:***@"));
    console.log("Target Database:", TARGET_URI.replace(/\/\/.*@/, "//***:***@"));
    console.log("---------------------------------------------------------------\n");

    const sourceClient = new MongoClient(SOURCE_URI);
    const targetClient = new MongoClient(TARGET_URI);

    try {
        await sourceClient.connect();
        console.log("[OK] Connected to local MongoDB source.");

        await targetClient.connect();
        console.log("[OK] Connected to MongoDB Atlas cloud target.\n");

        const sourceDb = sourceClient.db();
        const targetDb = targetClient.db();

        const collections = await sourceDb.listCollections().toArray();
        const collectionNames = collections.map((c) => c.name).filter((n) => !n.startsWith("system."));

        console.log(`Found ${collectionNames.length} collections to migrate:`, collectionNames.join(", "), "\n");

        for (const colName of collectionNames) {
            process.stdout.write(`Migrating collection: ${colName.padEnd(22)} ... `);
            const sourceCol = sourceDb.collection(colName);
            const targetCol = targetDb.collection(colName);

            const docs = await sourceCol.find({}).toArray();

            if (docs.length === 0) {
                console.log("0 documents (skipped)");
                continue;
            }

            // Upsert each document by _id to preserve ObjectIds and prevent duplicate key collisions
            let migratedCount = 0;
            for (const doc of docs) {
                await targetCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
                migratedCount++;
            }

            const targetCount = await targetCol.countDocuments();
            console.log(`[DONE] ${migratedCount} docs migrated (Target total: ${targetCount})`);
        }

        console.log("\n===============================================================");
        console.log("MIGRATION COMPLETED SUCCESSFULLY!");
        console.log("All careers, roadmaps, users, and assessment records are in Atlas.");
        console.log("===============================================================\n");
    } catch (err) {
        console.error("\nMigration failed with error:", err.message);
        process.exit(1);
    } finally {
        await sourceClient.close();
        await targetClient.close();
    }
}

migrate();
