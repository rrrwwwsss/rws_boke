---
title: "使用 GitHub Pages 部署 Astro 网站"
description: "讲清 GitHub Pages 的部署原理、Astro 路径配置、GitHub Actions 工作流和常见问题。"
publishedAt: 2026-09-08
category: 工程实践
series: 博客部署
tags: [Astro, GitHub Pages, GitHub Actions, pnpm, 部署]
draft: false
featured: false
readingTime: 10 MIN
---

## GitHub Pages 是什么

GitHub Pages 是 GitHub 提供的静态网站托管服务。它可以发布 HTML、CSS、JavaScript、图片和字体等静态资源。

它不能直接运行长期驻留的 Node.js、Python 后端，也不能直接运行数据库。Astro 能在构建时生成静态文件，因此很适合部署到 GitHub Pages。

## 两种 Pages 网站地址

GitHub Pages 的默认地址分为两类。

### 用户站点

仓库名必须是：

```text
用户名.github.io
```

访问地址位于域名根目录：

```text
https://用户名.github.io/
```

### 项目站点

普通仓库会使用仓库名作为子路径：

```text
仓库：https://github.com/用户名/my-blog
网站：https://用户名.github.io/my-blog/
```

项目站点最常见的问题，就是忘记网址中还有 `/my-blog/` 这一层。

## GitHub Pages 的部署流程

使用 GitHub Actions 部署时，完整流程是：

```text
推送代码到 main
  -> GitHub Actions 拉取代码
  -> 安装 Node.js 和依赖
  -> 执行 Astro 构建
  -> 生成 dist 目录
  -> 上传 dist
  -> GitHub Pages 发布网站
```

GitHub Pages 托管的是构建结果，不是 Astro 源码。Markdown 和 Astro 组件必须先转换成浏览器能够访问的静态文件。

## 第一步：配置 Astro

如果是用户站点（根域名）只需要设置 `site`：

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://用户名.github.io'
});
```
但 GitHub Pages 对根域名有一个**特殊规则：仓库名必须是 用户名.github.io**。因此，对于不是这个命名的仓库来说，需要项目站点。
项目站点要设置 `base`：

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://用户名.github.io',
  base: '/my-blog'
});
```

两个配置的作用不同：

- `site`：网站完整域名，用于生成 sitemap、canonical URL 等绝对地址。
- `base`：网站在域名下的基础路径，一般就是仓库名。

如果仓库名为 `my-blog`，却没有设置 `base`，生成的链接可能指向：

```text
https://用户名.github.io/articles/
```

正确地址应该是：

```text
https://用户名.github.io/my-blog/articles/
```

## 第二步：处理内部链接

配置 `base` 后，**内部链接也要带上基础路径**。可以使用 `import.meta.env.BASE_URL` 封装路径函数：

```ts
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function sitePath(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
}
```

使用时不要直接写：

```astro
<a href="/articles/">文章</a>
```

而是写成：

```astro
<a href={sitePath('/articles/')}>文章</a>
```

## 第三步：准备构建命令

在 `package.json` 中提供构建命令：

```json
{
  "scripts": {
    "build": "astro build"
  }
}
```

如果网站使用 Pagefind，可以在 Astro 构建后生成搜索索引：

```json
{
  "scripts": {
    "build": "astro build && pagefind --site dist"
  }
}
```

Pagefind 要扫描 Astro 已生成的 HTML，所以必须先有 `dist`。

本地先验证：

```bash
pnpm install
pnpm run build
```

构建成功后，`dist` 根目录中应该存在 `index.html`。

## 第四步：添加 GitHub Actions

创建文件：

```text
.github/workflows/deploy-pages.yml
```

使用 pnpm 的工作流示例：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.19.0

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build site
        run: pnpm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

## 工作流中的关键知识点

### 触发条件

`push` 表示向 `main` 推送时自动部署，`workflow_dispatch` 表示允许在 Actions 页面手动部署。

### Pages 权限

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

`contents: read` 用于读取仓库，`pages: write` 用于发布 Pages，`id-token: write` 用于部署身份验证。

### 构建和部署分离

`build` 负责生成并上传 `dist`，`deploy` 负责发布 Artifact：

```yaml
deploy:
  needs: build
```

`needs: build` 保证构建成功后才执行部署。

### 上传目录

```yaml
with:
  path: dist
```

这里必须填写静态构建输出目录。Astro 默认使用 `dist`。

## 第五步：启用 Pages

进入 GitHub 仓库：

```text
Settings -> Pages -> Build and deployment
```

把 Source 设置为：

```text
GitHub Actions
```

提交工作流并推送到 `main` 后，可以在仓库的 Actions 页面查看运行过程。

## 为什么固定 Node 和 pnpm 版本

本地与 GitHub Actions 使用不同版本时，可能出现锁文件不兼容或安装行为不同。

可以在 `package.json` 中声明 pnpm 版本：

```json
{
  "packageManager": "pnpm@11.19.0"
}
```

工作流使用相同版本，并执行：

```bash
pnpm install --frozen-lockfile
```

`--frozen-lockfile` 表示严格使用已经提交的 `pnpm-lock.yaml`。依赖声明与锁文件不一致时，CI 会直接失败。

## 原生依赖为什么容易报错

Astro 项目经常使用 `esbuild` 和 `sharp`。它们包含平台相关文件或安装脚本。

如果 pnpm 阻止必要的构建脚本，可以在确认依赖可信后显式允许：

```yaml
allowBuilds:
  esbuild: true
  sharp: true
```

只开放项目真正需要的依赖，不要直接允许所有包执行安装脚本。

## 静态资源 404 怎么排查

项目站点中的资源地址应该带仓库名：

```text
/my-blog/_astro/example.css
```

如果浏览器请求的是：

```text
/_astro/example.css
```

说明基础路径没有正确加入。常见现象包括：

- 页面只有文字，没有样式；
- 图片不显示；
- 点击文章出现 404；
- 搜索框没有加载；
- favicon 消失。

可以打开浏览器开发者工具，在 Network 面板检查失败请求的 URL。请求地址缺少仓库名时，优先检查 `base` 和内部链接。

## Pagefind 搜索路径

Pagefind 生成的文件通常位于：

```text
dist/pagefind/
```

项目站点中的地址需要带基础路径：

```text
/my-blog/pagefind/pagefind-ui.js
/my-blog/pagefind/pagefind-ui.css
```

建议通过统一路径函数生成地址，不要在搜索页面中单独手写仓库名。

## 刷新子页面是否会 404

Astro 静态构建一般会生成：

```text
dist/articles/index.html
dist/articles/example/index.html
```

GitHub Pages 能直接提供这些文件。如果刷新文章页出现 404，应检查：

- 对应目录是否生成了 `index.html`；
- 页面链接是否带 `base`；
- 页面是否因为草稿或构建条件被排除；
- URL 大小写是否与文件路径一致。

## 自定义域名

GitHub Pages 支持自定义域名，基本步骤是：

1. 在域名服务商处配置 DNS。
2. 在仓库 Pages 设置中填写域名。
3. 在 `public/CNAME` 中写入域名。
4. 把 Astro 的 `site` 改成正式域名。
5. 如果网站位于域名根目录，移除仓库名对应的 `base`。
6. DNS 生效后启用 Enforce HTTPS。

`public/CNAME` 示例：

```text
blog.example.com
```

## 发布后的检查清单

Actions 运行成功后，还要检查：

- 首页、CSS 和图片是否正常；
- 导航、文章、分类和标签能否打开；
- 刷新文章详情页是否出现 404；
- 搜索能否返回结果并正确跳转；
- favicon 是否正常；
- sitemap 地址是否正确；
- canonical URL 是否指向线上地址；
- 手机端页面是否正常。

## 常见问题速查

| 现象 | 常见原因 |
|---|---|
| 首页 404 | Pages Source 错误，或 Artifact 根目录没有 `index.html` |
| 首页正常，文章 404 | 内部链接缺少仓库子路径 |
| 页面没有样式 | `/_astro/` 资源地址缺少 `base` |
| 图片不显示 | 图片路径错误，或文件没有提交到 Git |
| 搜索不可用 | Pagefind 未生成，或搜索脚本路径错误 |
| CI 安装失败 | Node、pnpm、lockfile 或原生依赖不一致 |
| sitemap 地址错误 | Astro 的 `site` 配置错误 |
| 自定义域名后路径重复 | 仍然保留了仓库名 `base` |

## 总结

部署 Astro 到 GitHub Pages，需要理解四点：

1. GitHub Pages 只托管静态构建结果。
2. 项目站点默认位于 `/仓库名/` 子路径。
3. Astro 的 `site`、`base` 和内部链接必须保持一致。
4. GitHub Actions 负责安装依赖、构建、上传 `dist` 和发布。

## 参考资料

- [Astro 官方 GitHub Pages 部署指南](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages 发布源配置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

