import 'dotenv/config';
import { execSync } from 'child_process';
try {
  // Let's use docker exec to check the table definition in supabase-db
  const out = execSync('docker exec supabase-db psql -U postgres -c "\\d+ auditions"').toString();
  console.log(out);
} catch (e) {
  console.log("Docker failed, let's use supabase CLI or direct query if possible.", e.message);
}
