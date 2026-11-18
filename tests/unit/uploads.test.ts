import { describe,it,expect } from 'vitest';
import { MAX_UPLOAD,verifyUpload } from '../../src/lib/uploads';
const pdf=Buffer.from('%PDF-1.5\n1 0 obj\n<<>>\nendobj\n%%EOF');
describe('file-upload validation',()=>{
 it('accepts a signature-consistent PDF',()=>expect(verifyUpload('resume.pdf',pdf,'application/pdf')).toBe('application/pdf'));
 it('rejects MIME spoofing',()=>expect(verifyUpload('resume.pdf',Buffer.from('this is not a PDF'),'application/pdf')).toBeNull());
 it('rejects double extensions',()=>expect(verifyUpload('virus.exe.pdf',pdf,'application/pdf')).toBeNull());
 it('rejects scripts disguised as files',()=>expect(verifyUpload('resume.pdf.js',pdf,'application/pdf')).toBeNull());
 it('rejects oversized uploads',()=>expect(verifyUpload('resume.pdf',Buffer.alloc(MAX_UPLOAD+1),'application/pdf')).toBeNull());
 it('rejects inappropriate file type',()=>expect(verifyUpload('x.svg',pdf,'image/svg+xml')).toBeNull());
 it('rejects misleading DOCX ZIP files',()=>expect(verifyUpload('resume.docx',Buffer.from('PK\x03\x04random'),'application/zip')).toBeNull());
});
