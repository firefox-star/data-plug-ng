import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const db = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  // Seed networks (only create if not exists)
  const networks = [
    { name: 'MTN', slug: 'mtn', color: '#FFC300', icon: '/logos/mtn.png' },
    { name: 'Airtel', slug: 'airtel', color: '#ED1C24', icon: '/logos/airtel.png' },
    { name: 'Glo', slug: 'glo', color: '#50B651', icon: '/logos/glo.png' },
    { name: '9Mobile', slug: '9mobile', color: '#006B53', icon: '/logos/9mobile.png' },
  ];

  for (const net of networks) {
    const existing = await db.network.findUnique({ where: { slug: net.slug } });
    if (!existing) {
      await db.network.create({ data: net });
      console.log(`Created network: ${net.name}`);
    } else {
      console.log(`Network already exists: ${net.name}`);
    }
  }

  // Seed plans for each network (only create if not exists)
  const planTemplates = [
    { name: '500MB', size: 0.5, validity: '7 days', sortOrder: 1 },
    { name: '1GB', size: 1, validity: '14 days', sortOrder: 2 },
    { name: '1GB', size: 1, validity: '30 days', sortOrder: 3 },
    { name: '2GB', size: 2, validity: '30 days', sortOrder: 4 },
    { name: '3GB', size: 3, validity: '30 days', sortOrder: 5 },
    { name: '5GB', size: 5, validity: '30 days', sortOrder: 6 },
    { name: '10GB', size: 10, validity: '30 days', sortOrder: 7 },
  ];

  const prices: Record<string, number[]> = {
    mtn: [200, 350, 500, 950, 1400, 2200, 4200],
    airtel: [220, 380, 550, 1050, 1500, 2400, 4500],
    glo: [180, 330, 500, 980, 1450, 2300, 4400],
    '9mobile': [200, 350, 520, 1000, 1480, 2350, 4300],
  };

  for (const net of networks) {
    const network = await db.network.findUnique({ where: { slug: net.slug } });
    if (!network) continue;

    const existingPlans = await db.dataPlan.findMany({ where: { networkId: network.id } });

    for (let i = 0; i < planTemplates.length; i++) {
      const template = planTemplates[i];
      const price = prices[net.slug][i];
      const slug = template.name.toLowerCase().replace(/\s+/g, '');
      const validitySlug = template.validity.replace(/\s+/g, '');
      const planId = `${network.id}-${slug}-${validitySlug}`;

      const exists = existingPlans.find(
        (p) => p.name === template.name && p.validity === template.validity && p.networkId === network.id
      );

      if (!exists) {
        await db.dataPlan.create({
          data: {
            id: planId,
            networkId: network.id,
            name: template.name,
            size: template.size,
            price: price,
            validity: template.validity,
            active: true,
            sortOrder: template.sortOrder,
          },
        });
        console.log(`Created plan: ${net.name} ${template.name} ${template.validity} ₦${price}`);
      } else {
        console.log(`Plan already exists: ${net.name} ${template.name} ${template.validity}`);
      }
    }
  }

  // Seed settings (only create if not exists)
  const settings = [
    { key: 'site_name', value: 'DataPlug.ng' },
    { key: 'site_tagline', value: 'Your Reliable Plug for Cheap Data' },
    { key: 'bank_name', value: 'Opay Microfinance Bank' },
    { key: 'account_number', value: '8091234567' },
    { key: 'account_name', value: 'DataPlug Ventures in' },
    { key: 'whatsapp_number', value: '+234 801 234 5678' },
    { key: 'support_email', value: 'support@dataplug.ng' },
    { key: 'payment_instructions', value: 'Transfer the exact amount to the account below, then upload your payment proof. Your wallet will be credited within minutes after confirmation.' },
    { key: 'admin_password', value: hashPassword('admin123') },
  ];

  for (const setting of settings) {
    const existing = await db.setting.findUnique({ where: { key: setting.key } });
    if (!existing) {
      await db.setting.create({ data: setting });
      console.log(`Created setting: ${setting.key}`);
    } else {
      console.log(`Setting already exists: ${setting.key}`);
    }
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
