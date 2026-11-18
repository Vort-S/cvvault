import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { CVContent } from '@/db/schema';
type DocumentData={title:string;template:string;content:CVContent;name:string;headline:string;location:string;phone?:string;email?:string};
export async function makePDF(data:DocumentData){
  const doc=await PDFDocument.create();const regular=await doc.embedFont(StandardFonts.Helvetica);const bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const palette={modern:rgb(.08,.36,.57),classic:rgb(.13,.22,.34),minimal:rgb(.2,.2,.2)};
  const accent=palette[data.template as keyof typeof palette]??palette.classic;
  let page:PDFPage=doc.addPage([595,842]);let y=798;
  const margin=50;const maxWidth=495;
  const safe=(x:string)=>x.replace(/[^\x20-\x7e\n]/g,'?').slice(0,6000);
  function fitLine(s:string,font:PDFFont,size:number){
    const pieces=safe(s).split(/\s+/);const lines:string[]=[];let line='';
    for(const word of pieces){
      const attempt=line?`${line} ${word}`:word;
      if(font.widthOfTextAtSize(attempt,size)<=maxWidth){line=attempt;continue;}
      if(line){lines.push(line);line='';}
      let part='';for(const char of word){const combined=part+char;
        if(font.widthOfTextAtSize(combined,size)>maxWidth&&part){lines.push(part);part=char;}else{part=combined;}
      }line=part;
    }
    if(line)lines.push(line);return lines;
  }
  function text(s:string,size=10,weight=false,space=5){const font=weight?bold:regular;for(const l of safe(s).split('\n')){for(const line of fitLine(l||' ',font,size)){
    if(y<60){page=doc.addPage([595,842]);y=792;}
    page.drawText(line,{x:margin,y,size,font,color:weight?accent:rgb(.18,.25,.33)});y-=size+space;
  }}}
  text(data.name||data.title,23,true,10);
  if(data.headline)text(data.headline,12,true,6);
  text([data.location,data.email,data.phone].filter(Boolean).join('  |  '),9,false,10);y-=8;
  const sections:{key:Exclude<keyof CVContent,'summary'>;label:string}[]=[{key:'experience',label:'Experience'},{key:'education',label:'Education'},{key:'skills',label:'Skills'},{key:'projects',label:'Projects'},{key:'certifications',label:'Certifications'},{key:'languages',label:'Languages'},{key:'references',label:'References'}];
  if(data.content.summary){text('PROFILE',12,true,8);text(data.content.summary,10,false,6);y-=10;}
  for(const {key,label} of sections){
    const items=data.content[key];if(!items.length)continue;
    text(label.toUpperCase(),12,true,8);
    for(const item of items){text(item.title,11,true,4);const sub=[item.subtitle,[item.start,item.end].filter(Boolean).join(' - ')].filter(Boolean).join(' | ');if(sub)text(sub,9,false,4);if(item.description)text(item.description,10,false,5);y-=6;}
    y-=6;
  }
  doc.setTitle(data.title);doc.setAuthor('CVVault');doc.setSubject('Professional curriculum vitae');
  return doc.save();
}
