// Static rental integrity gate; this script never accesses networks, data, or deployment APIs.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(x)=>JSON.parse(fs.readFileSync(path.join(root,'lib',x),'utf8'));
const catalog=read('equipment-catalog.json');
const prices=read('rental-rates.json').rates;
const assets=read('rental-asset-map.json');
const legacy=read('rental-legacy-map.json');
const bundles=read('rental-bundles.json');
const photos=read('equipment-image-production-queue.json').items;
const assert=require('node:assert/strict');

const model=new Map();
for(const p of catalog){
 assert(Number.isInteger(p.id)&&p.id>0);
 assert(p.name&&typeof p.name==='string');
 assert(Number.isInteger(p.quantity)&&p.quantity>0);
 assert(prices[String(p.id)]&&prices[String(p.id)].day>0,'Missing price reference '+p.name);
 const key=p.name.normalize('NFKC').toLowerCase();
 const record=model.get(key)||{name:p.name,qty:0,ids:[]};
 record.qty+=p.quantity;record.ids.push(p.id);model.set(key,record);
}
const available=[...model.values()];
const qty=(s)=>{const p=available.find(x=>x.name===s);assert(p,'Missing model '+s);return p.qty};
assert.equal(qty('Shure SM7B'),4);
assert.equal(qty('RØDE Wireless PRO'),2);
assert.equal(qty('Canon EOS R100'),3);
assert.equal(qty('Aputure LS 600c Pro II'),1);
assert.equal(qty('Aputure F10 Fresnel'),1);
assert.equal(bundles['21']['4'].day,80);
for(const p of available){const refs=p.ids.flatMap(id=>(assets[String(id)]||[]).map(a=>a.assetId));
 const fallbacks=p.ids.flatMap(id=>legacy[String(id)]?[legacy[String(id)].assetId]:[]);
 if(!refs.length&&!fallbacks.length)console.warn('UNLINKED INVENTORY — cannot request:',p.name);
 const unique=new Set(refs);
 assert(unique.size<=p.qty,'Mapped more physical units than inventory permits: '+p.name);
 if(refs.length!==unique.size)console.log('Shared serial-to-product mapping deduplicated:',p.name);
}
assert.equal(photos.length,model.size,'Photo queue must cover every commercial model');
assert(!photos.some(x=>x.readyForPublishing===true&&!x.transparentAlphaVerified),'Unverified alpha image marked ready');
console.log(JSON.stringify({passed:true,catalogRows:catalog.length,models:model.size,photoSources:photos.filter(x=>x.sourceLinked).length,pendingSources:photos.filter(x=>!x.sourceLinked).length,authoritativePrices:Object.values(prices).filter(x=>x.status==='published-reference').length,proposedPrices:Object.values(prices).filter(x=>x.status==='suggested').length},null,2));
