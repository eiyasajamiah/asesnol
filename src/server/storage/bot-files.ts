// src/server/storage/bot-files.ts
export async function uploadBotFile(file: File, userId: string) {
  // فحص الملف
  const allowedExtensions = ['.ex4', '.ex5', '.mq4', '.mq5', '.dll'];
  const ext = path.extname(file.name).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Invalid file type');
  }

  // فحص الفيروسات (اختياري)
  // await scanFile(file);

  // رفع الملف باسم عشوائي
  const key = `bots/${userId}/${crypto.randomUUID()}${ext}`;
  
  await r2.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      contentDisposition: 'attachment',
    },
  });

  return key;
}