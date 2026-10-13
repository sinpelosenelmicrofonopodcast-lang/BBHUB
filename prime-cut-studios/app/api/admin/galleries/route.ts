import {NextResponse} from 'next/server';
import {requestIsSameOrigin,adminAuthenticated} from '@/lib/auth';
import {getProject} from '@/lib/db';
import {allPhotoGalleries,createPhotoGallery,photoGalleryById,setPhotoGalleryVisibility,validatedLightroomAlbumUrl,validatedLightroomEmbedUrl,galleryCategories,type GalleryType,type GalleryVisibility} from '@/lib/photo-galleries';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!requestIsSameOrigin(req))return new Response('Forbidden',{status:403});
 if(!await adminAuthenticated())return new Response('Unauthorized',{status:401});
 if(Number(req.headers.get('content-length')||0)>12000)return new Response('Request too large',{status:413});
 const f=await req.formData(),action=String(f.get('action')||'create');
 if(action==='visibility'){
  const id=String(f.get('id')||''),visibility=String(f.get('visibility')||''),consent=String(f.get('consent')||'')==='yes';
  if(!/^[\da-f-]{36}$/i.test(id)||!['draft','client','public'].includes(visibility))return new Response('Invalid request',{status:400});
  const album=await photoGalleryById(id);if(!album)return new Response('Not found',{status:404});
  if(visibility==='client'&&!album.project_id)return new Response('Assign a project first',{status:400});
  if(visibility==='public'&&(album.gallery_type!=='portfolio'||!consent))return new Response('Written public portfolio consent required',{status:400});
  if(!await setPhotoGalleryVisibility(id,visibility as GalleryVisibility,consent))return new Response('Could not save visibility',{status:500});
 }else if(action==='create'){
  const embedInput=String(f.get('embed')||'').trim(),embed=embedInput?validatedLightroomEmbedUrl(embedInput):null;
  const title=String(f.get('title')||'').trim(),description=String(f.get('description')||'').trim(),link=validatedLightroomAlbumUrl(String(f.get('url')||'')),id=String(f.get('projectId')||''),category=String(f.get('category')||''),type=String(f.get('galleryType')||'');
  if(embedInput&&!embed)return new Response('Invalid Lightroom embed. Use the iframe code from Lightroom web.',{status:400});
  if(title.length<2||title.length>140||description.length>1200||!link||!galleryCategories.includes(category as typeof galleryCategories[number])||!['proofs','final_delivery','portfolio'].includes(type)||id&&(!/^[\da-f-]{36}$/i.test(id)||!await getProject(id)))return new Response('Invalid gallery details',{status:400});
  await createPhotoGallery({project_id:id||null,title,description,album_url:link,embed_url:embed,category,gallery_type:type as GalleryType,visibility:'draft',consent_confirmed:false,requested_downloads:String(f.get('downloads')||'')==='yes'});
 }else return new Response('Invalid action',{status:400});
 return NextResponse.redirect(new URL('/admin/galleries',req.url),303);
}
