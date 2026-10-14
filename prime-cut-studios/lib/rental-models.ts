import type {EquipmentItem} from './equipment-catalog';

export type RentalUnit = EquipmentItem & {priceCents?:number|null};

export type RentalModel = {
  key:string;
  name:string;
  category:string;
  assetIds:string[];
  quantity:number;
  photoUrl:string|null;
  manufacturerUrl:string|null;
  manualUrl:string|null;
  specs:string[];
  rentalApproval:'review_required'|'approved';
  priceCents:number|null;
};

// The public catalogue presents one product per exact model, while physical
// units keep their individual immutable IDs for authorization and inquiries.
// Category + manufacturer model is the identity; never group by brand alone.
function modelKey(name:string,category:string){
  const model=name.trim().replace(/\s+#\d+$/,'').normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en-US').replace(/\s+/g,' ');
  return category.toLocaleLowerCase('en-US')+'|'+model;
}

export function groupRentalCatalog(units:RentalUnit[]):RentalModel[]{
  const grouped=new Map<string,RentalUnit[]>();
  for(const unit of units){
    if(unit.inventoryStatus!=='ready')continue;
    const key=modelKey(unit.name,unit.category);
    const existing=grouped.get(key);
    if(existing)existing.push(unit);
    else grouped.set(key,[unit]);
  }
  return [...grouped].map(([key,records])=>{
    const first=records[0];
    const ids=[...new Set(records.map(r=>r.id))];
    const approval=records.every(r=>r.rentalApproval==='approved');
    const rates=records.map(r=>r.priceCents);
    const uniformRate=approval&&rates.every(r=>typeof r==='number'&&r===rates[0])
      ? rates[0] ?? null : null;
    return {
      key,name:first.name.replace(/\s+#\d+$/,''),category:first.category,
      assetIds:ids,quantity:ids.length,
      photoUrl:records.find(r=>r.photoUrl)?.photoUrl||null,
      manufacturerUrl:records.find(r=>r.manufacturerUrl)?.manufacturerUrl||null,
      manualUrl:records.find(r=>r.manualUrl)?.manualUrl||null,
      specs:records.find(r=>r.specs.length>0)?.specs||[],
      rentalApproval:approval?('approved' as const):('review_required' as const),
      priceCents:uniformRate
    };
  }).sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));
}
