import Busboy from 'busboy';

export function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const headers = event?.headers || {};
    const contentType = headers['content-type'] || headers['Content-Type'];

    if (!contentType || !String(contentType).includes('multipart/form-data')) {
      reject(new Error('Content-Type must be multipart/form-data'));
      return;
    }

    const busboy = Busboy({ headers: { 'content-type': contentType } });
    const fields = {};
    const files = [];

    busboy.on('field', (fieldName, value) => {
      fields[fieldName] = value;
    });

    busboy.on('file', (fieldName, file, info) => {
      const chunks = [];
      const { filename, mimeType } = info;

      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        files.push({
          fieldName,
          filename,
          mimeType,
          buffer: Buffer.concat(chunks),
        });
      });
    });

    busboy.on('finish', () => resolve({ fields, files }));
    busboy.on('error', reject);

    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '', 'utf-8');

    busboy.end(bodyBuffer);
  });
}
