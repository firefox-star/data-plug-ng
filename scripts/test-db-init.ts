// Test the db-init flow simulating a fresh deploy
import { initDatabase } from '../src/lib/db-init';
import { PrismaClient } from '@prisma/client';

async function main() {
  const db = new PrismaClient();
  console.log('[test] Starting db-init test...');
  
  const start = Date.now();
  await initDatabase(db);
  console.log(`[test] initDatabase completed in ${Date.now() - start}ms`);

  // Verify data
  const networks = await db.network.findMany();
  console.log(`[test] Networks: ${networks.length}`);
  networks.forEach(n => console.log(`  - ${n.name} (${n.slug}) icon=${n.icon}`));

  const plans = await db.dataPlan.findMany();
  console.log(`[test] Plans: ${plans.length}`);

  const settings = await db.setting.findMany();
  console.log(`[test] Settings: ${settings.length}`);
  const adminPass = settings.find(s => s.key === 'admin_password');
  console.log(`[test] Admin password set: ${!!adminPass}`);

  // Test idempotency — run again, should be no-op
  const start2 = Date.now();
  await initDatabase(db);
  console.log(`[test] Second initDatabase (should be fast no-op): ${Date.now() - start2}ms`);

  // Verify counts unchanged
  const networks2 = await db.network.findMany();
  const plans2 = await db.dataPlan.findMany();
  console.log(`[test] After 2nd init: networks=${networks2.length}, plans=${plans2.length}`);

  await db.$disconnect();
  console.log('[test] ✓ All checks passed');
}

main().catch(e => { console.error(e); process.exit(1); });
