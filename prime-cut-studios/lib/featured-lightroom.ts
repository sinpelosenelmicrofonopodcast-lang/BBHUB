/** Public live album explicitly chosen by Prime Cut Studios.
 * Keep the whole album in Adobe Lightroom as the only photo source.
 * All added/removed/edited photos are reflected by Adobe on the next album load.
 * No per-photo transfer, own-hosted copies, scheduled sync, storage or Vercel image proxy.
 * An official Lightroom embed code may be added later; shared shortlinks might refuse iframes.
 */
export const featuredLightroomAlbum={
 albumUrl:'https://adobe.ly/4ikEAMg',
 embedUrl:null as string|null,
 title:'Fotografía que se siente.',
 description:'Retratos, momentos y producciones que hablan por sí solos. Mira nuestro trabajo real y descubre lo que podemos crear para ti.'
} as const;
