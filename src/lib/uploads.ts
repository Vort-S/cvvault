export const MAX_UPLOAD=5*1024*1024;
export type UploadKind='application/pdf'|'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
export function verifyUpload(filename:string,bytes:Uint8Array,mime:string):UploadKind|null{
  if(!filename||filename.length>200||/[/\\\u0000]/.test(filename)||/\.(exe|js|jsx|ts|html|htm|php|sh|bat|cmd|ps1|svg)\./i.test(filename))return null;
  if(!bytes.length||bytes.length>MAX_UPLOAD)return null;
  const extension=filename.toLowerCase().split('.').pop();
  if(extension==='pdf'&&mime==='application/pdf'){
    if(Buffer.from(bytes.subarray(0,5)).toString('latin1')!=='%PDF-')return null;
    if(!Buffer.from(bytes.subarray(Math.max(0,bytes.length-2048))).toString('latin1').includes('%%EOF'))return null;
    return 'application/pdf';
  }
  if(extension==='docx'&&['application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip'].includes(mime)){
    const header=Buffer.from(bytes.subarray(0,4)).toString('hex');
    if(header!=='504b0304')return null;
    // Central directory must identify a Word document; avoid decompressing untrusted archives.
    const directory=Buffer.from(bytes.subarray(Math.max(0,bytes.length-65536))).toString('latin1');
    if(!directory.includes('[Content_Types].xml')||!directory.includes('word/document.xml'))return null;
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return null;
}
