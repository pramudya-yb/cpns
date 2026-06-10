import { drizzle } from "drizzle-orm/node-postgres";

import { loadDatabaseUrl } from "./database-url";
import { examType, sectionType } from "./schema";

const db = drizzle(loadDatabaseUrl());

const examTypes = [
  { id: "CPNS", name: "Ujian CPNS", language: "Bahasa Indonesia", description: "Seleksi Calon Pegawai Negeri Sipil" },
];

const sectionTypes = [
  { id: "TWK", name: "Tes Wawasan Kebangsaan" },
  { id: "TIU", name: "Tes Intelegensia Umum" },
  { id: "TKP", name: "Tes Karakteristik Pribadi" },
];

async function seed() {
  console.log("Seeding exam_type table...");
  for (const et of examTypes) {
    await db.insert(examType).values(et).onConflictDoNothing();
  }

  console.log("Seeding section_type table...");
  for (const st of sectionTypes) {
    await db.insert(sectionType).values(st).onConflictDoNothing();
  }

  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
