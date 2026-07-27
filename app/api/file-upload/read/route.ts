import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = '/tmp/ai-phone-uploads';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('name');

    if (!fileName) {
      return NextResponse.json({ error: '未指定文件名' }, { status: 400 });
    }

    // 安全检查：防止路径穿越
    const safeName = fileName.replace(/\.\.\//g, '').replace(/\//g, '');
    const filePath = join(UPLOAD_DIR, safeName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const fileStat = await stat(filePath);
    const content = await readFile(filePath);

    // 根据文件类型返回不同内容
    const ext = safeName.split('.').pop()?.toLowerCase() || '';
    const textExtensions = ['txt', 'md', 'json', 'js', 'ts', 'css', 'html', 'xml', 'csv', 'log', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'];

    if (textExtensions.includes(ext)) {
      // 文本文件直接返回内容
      return NextResponse.json({
        type: 'text',
        fileName: safeName,
        size: fileStat.size,
        content: content.toString('utf-8'),
      });
    } else if (ext === 'pdf') {
      // PDF返回base64（前端或工具可解析）
      return NextResponse.json({
        type: 'pdf',
        fileName: safeName,
        size: fileStat.size,
        content: content.toString('base64'),
        note: 'PDF文件以base64编码返回，需要解析器提取文字',
      });
    } else if (['doc', 'docx'].includes(ext)) {
      // Word文档返回base64
      return NextResponse.json({
        type: 'document',
        fileName: safeName,
        size: fileStat.size,
        content: content.toString('base64'),
        note: 'Word文档以base64编码返回，需要解析器提取文字',
      });
    } else {
      // 其他文件返回基本信息
      return NextResponse.json({
        type: 'binary',
        fileName: safeName,
        size: fileStat.size,
        note: `不支持直接读取此类型文件(${ext})`,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
