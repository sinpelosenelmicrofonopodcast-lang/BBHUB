#!/usr/bin/env node
// Pure offline static checks. Does not connect to Lightroom/Vercel/Supabase or build.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const p=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const album=p('lib/featured-lightroom.ts'),showcase=p('components/LiveLightroomShowcase.tsx'),
home=p('app/page.tsx'),portfolio=p('app/portfolio/page.tsx'),css=p('app/globals.css');
assert.match(album,/https:\/\/adobe\.ly\/4ikEAMg/);
assert.match(home,/LiveLightroomShowcase/);
assert.match(portfolio,/LiveLightroomShowcase/);
assert.match(showcase,/IntersectionObserver/);
assert.match(showcase,/loading="lazy"/);
assert.match(showcase,/rel="noopener noreferrer"/);
assert.match(showcase,/referrerPolicy="strict-origin-when-cross-origin"/);
assert.match(showcase,/adobe\.ly/);
assert.match(showcase,/lightroom\.adobe\.com/);
assert.ok(!/setInterval|setTimeout|fetch\(|XMLHttpRequest|upload\(/.test(showcase));
assert.match(css,/prefers-reduced-motion/);
assert.deepEqual(JSON.parse(p('vercel.json')).git.deploymentEnabled,false);
console.log('PASS: entire Lightroom album staged for live lazy load, no scheduled sync or deploy.');
