const fetch = require('node-fetch');

// 🔱 VAULT CONFIGURATION
const SPACES = [
    { name: "HAT-VAULT", url: "https://hat-e9d2d-default-rtdb.firebaseio.com/sora_vault" },
    { name: "BOMB-VAULT", url: "https://bomb-aa638-default-rtdb.firebaseio.com/sora_vault" }
];

async function runGuardianCycle() {
    console.log("------------------------------------------");
    console.log("🔱 G-GHOST | ETERNAL GUARDIAN V2.0");
    console.log("STATUS: PATROLLING SORA2 EMPIRE");
    console.log("FEATURES: DEAD LINK PURGE + DUPLICATE TERMINATOR");
    console.log("------------------------------------------");
    
    for (const s of SPACES) {
        console.log(`\n📡 SYNCING: ${s.name}...`);
        try {
            const res = await fetch(`${s.url}.json`);
            const data = await res.json();
            
            if (!data) {
                console.log(`[${s.name}] VAULT IS EMPTY.`);
                continue;
            }

            // 🕵️‍♂️ डुप्लीकेट और डेड लिंक्स की पहचान के लिए तैयारी
            const seenUrls = new Set();
            let deadCount = 0;
            let duplicateCount = 0;

            // डेटाबेस को फ्लैट लिस्ट में बदलना ताकि स्कैनिंग आसान हो
            let allEntries = [];
            function traverse(obj, path = "") {
                for (let key in obj) {
                    let item = obj[key];
                    let curPath = path ? `${path}/${key}` : key;
                    if (item && typeof item === 'object') {
                        const videoUrl = item.clean || item.original_url || item.url;
                        if (videoUrl) {
                            allEntries.push({ path: curPath, url: videoUrl });
                        } else traverse(item, curPath);
                    }
                }
            }
            traverse(data);

            console.log(`[${s.name}] SCANNING ${allEntries.length} ASSETS...`);

            // ⚔️ मुख्य स्ट्राइक लूप
            for (const entry of allEntries) {
                // 1. डुप्लीकेट चेक (Duplicate Check)
                if (seenUrls.has(entry.url)) {
                    console.log(`[${s.name}] 👥 DUPLICATE DETECTED: ${entry.path}. PURGING...`);
                    await fetch(`${s.url}/${entry.path}.json`, { method: 'DELETE' });
                    duplicateCount++;
                    continue; // डुप्लीकेट है तो डेड चेक की जरूरत नहीं
                }
                seenUrls.add(entry.url);

                // 2. डेड लिंक चेक (Dead Link Check)
                try {
                    const check = await fetch(entry.url, { method: 'HEAD', timeout: 10000 });
                    if (!check.ok) throw new Error("Dead");
                } catch (e) {
                    console.log(`[${s.name}] 💀 DEAD LINK DETECTED: ${entry.path}. PURGING...`);
                    await fetch(`${s.url}/${entry.path}.json`, { method: 'DELETE' });
                    deadCount++;
                }
            }

            console.log(`[${s.name}] CYCLE COMPLETE.`);
            console.log(`>> DUPLICATES REMOVED: ${duplicateCount}`);
            console.log(`>> DEAD LINKS PURGED: ${deadCount}`);

        } catch (err) {
            console.error(`[${s.name}] CONNECTION FAILED:`, err.message);
        }
    }
    console.log("\n✅ MISSION ACCOMPLISHED. SYSTEM STABLE.");
    console.log("------------------------------------------");
}

runGuardianCycle();
