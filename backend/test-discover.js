import dotenv from 'dotenv';
dotenv.config();
const { default: auditionService } = await import('./src/services/audition.service.js');

async function test() {
  try {
    const filters = { category: "Actor / theatre actor,aerial artist" };
    const res = await auditionService.discoverAuditions(filters, 'some-user-id');
    console.log("Result length:", res.length);
    console.log("Results:", res.map(r => r.title));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
