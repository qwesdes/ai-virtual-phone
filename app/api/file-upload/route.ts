import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = '/tmp/ai-phone-uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const AUTO_DELETE_HOURS = 24;

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function cleanOldFiles() {
  try {
    const files = await readdir(UPLOAD_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = join(UPLOAD_DIR, file);
      const fileStat = await stat(filePath);
      if (now - fileStat.mtimeMs > AUTO_DELETE_HOURS * 60 * 60 * 1000) {
        await unlink(filePath);
      }
    }
  } catch (e) {
    // ignore cleanup errors
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();
    await cleanOldFiles();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '没有收到文件' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '文件太大了（最大10MB）' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 用时间戳+原始文件名保存
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fff]/g, '_');
    const fileName = `${Date.now()}_${safeName}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: `文件已上传: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '上传失败' }, { status: 500 });
  }
}

// 列出已上传的文件
export async function GET() {
  try {
    await ensureUploadDir();
    const files = await readdir(UPLOAD_DIR);
    const fileList = await Promise.all(
      files.map(async (name) => {
        const filePath = join(UPLOAD_DIR, name);
        const fileStat = await stat(filePath);
        return {
          name,
          size: fileStat.size,
          uploadedAt: fileStat.mtimeMs,
        };
      })
    );
    return NextResponse.json({ files: fileList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 删除指定文件
export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    if (!fileName) {
      return NextResponse.json({ error: '未指定文件名' }, { status: 400 });
    }
    const filePath = join(UPLOAD_DIR, fileName);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
