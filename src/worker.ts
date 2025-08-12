// Charger les variables d'apos;environnement
import { config } from "dotenv";
config();

import { registerSplitWorker } from "@/queues/splitBriefs.queue";
import { registerAgentsWorker } from "@/queues/agents.queue";
import { registerCompileWorker } from "@/queues/compile.queue";
import { registerArchiveWorker } from "@/queues/archive.queue";
import { logger } from "@/lib/logger";

console.log("🚀 Démarrage des workers Beriox AI...");
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "✅ Configurée" : "❌ Manquante");
console.log("Database URL:", process.env.DATABASE_URL ? "✅ Configurée" : "❌ Manquante");
console.log("Redis URL:", process.env.REDIS_URL ? "✅ Configurée" : "❌ Manquante");

registerSplitWorker();
registerAgentsWorker();
registerCompileWorker();
registerArchiveWorker();

logger.info("Workers registered. Waiting for jobs...");

// Keep process alive
setInterval(() => {}, 1 << 30);


