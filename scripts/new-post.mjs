import fs from 'node:fs';
import path from 'node:path';

const [slug, template = 'tutorial'] = process.argv.slice(2);
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('用法：npm run new -- <英文短标题> [tutorial|project|troubleshooting]');
  process.exit(1);
}
const templateFile = path.resolve(`templates/${template}.md`);
if (!fs.existsSync(templateFile)) {
  console.error(`找不到模板：${template}`);
  process.exit(1);
}
const targetDir = path.resolve('src/content/posts/drafts', slug);
const targetFile = path.join(targetDir, 'index.md');
if (fs.existsSync(targetFile)) {
  console.error(`文章已存在：${targetFile}`);
  process.exit(1);
}
fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(templateFile, targetFile);
console.log(`已创建草稿：${targetFile}`);
