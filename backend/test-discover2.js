import dotenv from 'dotenv';
dotenv.config();
const { default: auditionService } = await import('./src/services/audition.service.js');

async function test() {
  try {
    const filters = { category: "Actor / theatre actor,aerial artist" };
    const res = await auditionService.discoverAuditions(filters, 'b47a6c11-8d18-4e9b-a90b-5528e2af5aba');
    console.log("Result length:", res.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
