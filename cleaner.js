const fetch = require('node-fetch');

// 🔱 VAULT CONFIGURATION
const SPACES = [
    { name: "HAT-VAULT", url: "https://hat-e9d2d-default-rtdb.firebaseio.com/sora_vault" },
    { name: "BOMB-VAULT", url: "https://bomb-aa638-default-rtdb.firebaseio.com/sora_vault" }
];

async function traverseAndPurge(obj, baseUrl, spaceName, path = "") {
    let deadCount = 0;
    for (let key in obj) {
        let item = obj[key];
        let curPath = path ? `${path}/${key}` : key;

        // अगर ऑब्जेक्ट के अंदर लिंक है
        if (item && typeof item === 'object') {
            const videoUrl = item.clean || item.original_url || item.url;
            
            if (videoUrl) {
                try {
                    // लिंक की जांच (HEAD request)
                    const res = await fetch(videoUrl, { method: 'HEAD', timeout: 15000 });
                    if (!res.ok) throw new Error("404/Expired");
                } catch (e) {
                    console.log(`[${spaceName}] 💀 TARGET DETECTED: ${curPath} | REASON: Expired | ACTION: PURGING...`);
                    // Firebase से डिलीट करना
                    await fetch(`${baseUrl}/${curPath}.json`, { method: 'DELETE' });
                    deadCount++;
                }
            } else {
                // अगर अंदर और गहराई है, तो और अंदर जाओ
                deadCount += await traverseAndPurge(item, baseUrl, spaceName, curPath);
            }
        }
    }
    return deadCount;
}

async function runGuardianCycle() {
    console.log("------------------------------------------");
    console.log("🔱 G-GHOST | ETERNAL GUARDIAN V1.0");
    console.log("STATUS: PATROLLING SORA2 EMPIRE");
    console.log("------------------------------------------");
    
    for (const s of SPACES) {
        console.log(`\n📡 SYNCING: ${s.name}...`);
        try {
            const res = await fetch(`${s.url}.json`);
            const data = await res.json();
            
            if (!data) {
                console.log(`[${s.name}] VAULT IS ALREADY CLEAN OR EMPTY.`);
                continue;
            }

            const removed = await traverseAndPurge(data, s.url, s.name);
            console.log(`[${s.name}] CYCLE COMPLETE. TARGETS ELIMINATED: ${removed}`);
        } catch (err) {
            console.error(`[${s.name}] CONNECTION FAILED:`, err.message);
        }
    }
    console.log("\n✅ ALL VAULTS SECURED. GUARDIAN GOING TO STANDBY MODE.");
    console.log("------------------------------------------");
}

runGuardianCycle();
