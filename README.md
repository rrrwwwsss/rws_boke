# 任文硕的技术博客

使用 Astro、Markdown、Tailwind CSS 与 Pagefind 构建的纯静态个人技术博客。

## 本地运行

```bash
npm install
npm run dev
```

浏览器访问终端显示的本地地址。

## 新建文章

```bash
npm run new -- langgraph-memory tutorial
npm run new -- road-agent project
npm run new -- vllm-port-error troubleshooting
```

新文章会生成在 `src/content/posts/drafts/<slug>/index.md`，默认 `draft: true`。完成后可以移动到对应栏目目录，并改为 `draft: false`。

文章专用图片放在 `index.md` 同级目录，通过相对路径引用：

```markdown
![图片说明](./architecture.webp)
```

## 构建

先将 `astro.config.mjs` 中的 `site` 改成真实域名，然后执行：

```bash
npm run build
```

最终静态网站位于 `dist/`。将该目录中的所有文件上传到服务器的网站根目录即可。

## Nginx 示例

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/rws-blog;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 内容分类

- 技术教程
- 项目实战
- 原理解析
- 工程实践
- 踩坑复盘
- AI 工具

分类值由 `src/content.config.ts` 校验。新增一级分类时，需要同时更新该文件和 `src/config.ts`。
