import fetch from 'node-fetch';
async function test() {
  const res = await fetch('http://localhost:3000/api/history');
  console.log(await res.text());
}
test();
