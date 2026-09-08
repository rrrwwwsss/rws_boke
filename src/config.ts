export const SITE = {
  title: '任文硕 · 技术博客',
  shortTitle: 'RWS.LOG',
  description: '记录 AI 应用工程、Agent、模型工程、大数据与 GIS 实践。写清楚原理，也写清楚真实系统如何落地。',
  author: '任文硕',
  email: '15132706585@163.com',
  github: 'https://github.com/rrrwwwsss',
  nav: [
    { label: '文章', href: '/articles/' },
    { label: '技术教程', href: '/categories/技术教程/' },
    { label: '项目实战', href: '/categories/项目实战/' },
    { label: '原理解析', href: '/categories/原理解析/' },
    { label: '工程实践', href: '/categories/工程实践/' },
    { label: '踩坑复盘', href: '/categories/踩坑复盘/' },
    { label: 'AI 工具', href: '/categories/AI 工具/' },
    { label: '关于', href: '/about/' }
  ]
};

export const CATEGORIES = [
  { name: '技术教程', slug: '技术教程', code: '01', description: '从环境搭建到完整实现，给出可以复现的步骤与代码。', accent: 'lime' },
  { name: '项目实战', slug: '项目实战', code: '02', description: '从需求、架构到部署，拆解真实系统的完整落地过程。', accent: 'blue' },
  { name: '原理解析', slug: '原理解析', code: '03', description: '不仅会使用，还要理解技术为什么这样工作。', accent: 'orange' },
  { name: '工程实践', slug: '工程实践', code: '04', description: '架构、测试、性能、部署与长期维护中的工程判断。', accent: 'purple' },
  { name: '踩坑复盘', slug: '踩坑复盘', code: '05', description: '记录现象、排查路径、根因和经过验证的解决方案。', accent: 'red' },
  { name: 'AI 工具', slug: 'AI 工具', code: '06', description: 'AI Coding、自动化与知识工作流的真实使用经验。', accent: 'cyan' }
] as const;
