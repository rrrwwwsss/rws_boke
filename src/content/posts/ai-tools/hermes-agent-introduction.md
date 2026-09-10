---
title: "Hermes Agent 是什么"
description: "介绍 Nous Research 的开源个人 AI Agent，以及它的工具、记忆、Skills、自动化和多平台能力。"
publishedAt: 2026-09-09
category: AI 工具
series: AI Agent
tags: [Hermes, Agent, Skills, MCP, 自动化, 长期记忆]
draft: false
featured: false
readingTime: 10 MIN
---


Hermes Agent 是 Nous Research 推出的开源 AI Agent。

它不只是一个聊天窗口，也不只是一个写代码工具。你可以给它一个目标，让它使用终端、文件、网页、浏览器等工具完成任务；它还可以保存跨会话记忆、学习可复用的 Skill、执行定时任务，并通过 Telegram、Discord 等消息平台与你沟通。

用一句白话概括：

> 普通聊天机器人负责回答问题，Hermes 更希望成为一个能够长期认识你、使用工具并持续替你做事的 AI 助手。

## Hermes 不是一个新的大模型

Hermes Agent 和 GPT、Claude、Gemini 不是同一类东西。

GPT、Claude、Gemini 等是模型，相当于负责理解和思考的“大脑”；Hermes Agent 是运行在模型外面的一整套 Agent 系统，负责提供工具、记忆、任务循环和安全控制。

它可以连接不同的模型服务，例如 Nous Portal、OpenRouter、OpenAI 或兼容接口。更换模型后，Hermes 的工具、记忆和使用方式仍然可以继续保留。

可以把它理解成：

```text
大语言模型
  -> 负责理解、推理和生成

Hermes Agent
  -> 给模型提供工具
  -> 执行模型提出的操作
  -> 保存任务状态和长期记忆
  -> 控制权限与运行环境
  -> 把结果送回模型继续判断
```

## 它是怎么完成任务的

假设你让 Hermes：

```text
每天早上整理 AI 新闻，并把摘要发到 Telegram。
```

它需要完成的不只是生成一段文字，而是一套连续动作：

1. 理解你想关注哪些内容。
2. 按计划在每天早上启动任务。
3. 搜索网页并读取新闻。
4. 筛选重复或低价值内容。
5. 整理成你习惯的格式。
6. 通过消息渠道发送结果。
7. 下次继续沿用你的偏好。

Hermes 会让模型在“思考—调用工具—读取结果—继续判断”的循环中工作，直到完成任务或需要你确认。

## 核心能力一：工具调用

模型只能生成内容，真正执行操作要依靠工具。

Hermes 内置或支持的工具类型包括：

- 搜索网页并提取正文；
- 操作浏览器；
- 读取和修改文件；
- 执行终端命令；
- 分析图片和生成媒体；
- 搜索历史会话；
- 创建定时任务；
- 委派任务给子 Agent；
- 连接 Home Assistant 和其他外部服务。

工具可以按照运行平台启用或关闭。例如聊天平台上的 Hermes 不一定需要开放完整终端权限，而本地开发环境可能需要文件和命令行工具。

这也是 Agent 与普通聊天机器人的主要区别：前者不仅告诉你“应该怎么做”，还可以在授权范围内真正执行。

## 核心能力二：跨会话记忆

普通聊天结束后，新会话往往需要重新介绍背景。Hermes 强调持久记忆，可以保存跨会话仍然有用的信息，例如：

- 你的稳定偏好；
- 常用工具和工作方式；
- 项目背景；
- 已经确认的规则；
- 过去任务得到的结论。

记忆不是把全部聊天记录无限塞进 Prompt。更合理的方式是保存少量、稳定、以后有用的信息，再在相关任务中取回。

Hermes 还支持搜索以前的会话。这样它既可以读取整理后的长期记忆，也能在需要时回到历史对话查找具体细节。

需要注意：记忆越强，隐私和错误记忆问题越重要。涉及个人信息、账号或业务数据时，应检查它保存了什么，并使用合适的存储和隔离方式。

## 核心能力三：Skills

Skill 可以理解为交给 Agent 的工作手册。

例如，一个“发布博客”的 Skill 可以写清楚：

1. 文章文件放在哪里。
2. Frontmatter 有哪些字段。
3. 图片如何命名。
4. 发布前运行什么检查。
5. 构建失败时怎样排查。

以后再次发布文章时，Hermes 不必完全从头摸索，可以在需要时加载这份 Skill。

Hermes 的 Skills 采用按需加载方式：平时只保留名称和简介，任务匹配时才读取完整内容。这样安装许多 Skill 也不会把每次请求的上下文全部占满。

它还强调“从经验中学习”：完成一个值得复用的复杂流程后，可以把方法保存成 Skill；以后遇到类似任务时继续使用和改进。

这并不意味着应该允许 Agent 无限制修改自己的规则。重要环境中应保留写入审批和版本审查，防止错误经验被固化。

## 核心能力四：消息平台

Hermes 不要求你一直守在安装它的电脑前。它可以通过 Messaging Gateway 连接多种消息平台，例如：

- Telegram；
- Discord；
- Slack；
- WhatsApp；
- Signal；
- Microsoft Teams；
- 飞书、企业微信等平台。

这样 Hermes 可以运行在服务器上，你通过手机发送任务并接收结果。

消息平台只是入口。真正执行任务的 Agent Core、记忆、工具和权限配置仍然运行在 Hermes 环境中。

## 核心能力五：定时自动化

Hermes 支持 Cron 类型的定时任务，可以让 Agent 在指定时间自动运行，例如：

- 每天整理新闻；
- 定期检查网站是否正常；
- 每周汇总项目进度；
- 夜间执行备份或审计；
- 定时生成并发送报告。

定时 Agent 和普通脚本的区别在于：普通脚本适合固定步骤，Agent 更适合输入会变化、需要判断和总结的任务。

能用普通脚本稳定解决的问题，不一定需要 Agent；只有任务确实需要理解非结构化信息、动态选择工具或生成内容时，Hermes 的优势才明显。

## 核心能力六：子 Agent 与任务委派

复杂任务可以拆成多个相对独立的工作流。例如调研一个技术方案时，可以分别处理：

- 查找官方文档；
- 对比开源项目；
- 分析成本；
- 汇总结论。

Hermes 可以把部分工作委派给隔离的子 Agent，再收集结果。

并行不一定总是更快。任务之间相互依赖、共享上下文很多时，过度拆分反而会增加协调成本。子 Agent 更适合边界清楚、能够独立验证的工作。

## 核心能力七：MCP 扩展

Hermes 支持 Model Context Protocol，也就是 MCP。

MCP 可以把 GitHub、数据库、知识库或其他外部系统的能力，以标准化工具形式提供给 Agent。Hermes 不需要为每个服务重新设计一套完全不同的调用方式。

一个简单配置可能类似：

```yaml
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "你的令牌"
```

令牌不要直接提交到 Git 仓库。生产环境应通过环境变量或密钥管理服务注入，并只授予完成任务所需的最小权限。

## Hermes 能不能写代码

可以。Hermes 能使用终端、文件编辑和浏览器工具，也能连接编辑器，因此可以处理代码相关任务。

但它的定位比专用 Coding Agent 更宽：

- Claude Code、Codex CLI 等工具主要围绕代码仓库、测试和软件开发设计。
- Hermes 更像通用个人 Agent，除了代码，还强调消息平台、长期记忆、自动化和跨领域工作。

如果日常任务几乎全部是编程，专用 Coding Agent 的代码检索、补丁审查和 Git 工作流可能更直接。如果希望 Agent 长期运行在服务器上，并通过手机处理研究、自动化、消息和个人任务，Hermes 更符合这个方向。

二者也可以配合：Hermes 负责接收任务和编排，具体编码工作交给专门的 Coding Agent。

## Hermes 可以运行在哪里

Hermes 可以运行在多种环境中：

- 本地 Windows、macOS 或 Linux；
- WSL2；
- Docker 容器；
- 远程服务器；
- SSH 目标环境；
- 部分云端或 Serverless 运行环境。

本地运行方便使用个人文件，但电脑关机后任务就会停止。服务器适合全天在线，不过需要自行考虑费用、系统安全、日志和密钥保护。

对终端操作不放心时，可以将它放入 Docker 或独立远程环境，避免直接接触宿主机全部文件。

## 安装与基本使用

Windows 和 macOS 用户可以使用 Hermes Desktop 安装器。

Linux、macOS 或 WSL2 的命令行安装方式为：

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

Windows PowerShell 的命令行安装方式为：

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

执行网络安装脚本前，应确认来源是 Hermes 官方域名；安全要求较高时，可以先下载并检查脚本内容再执行。

安装后需要选择模型提供方。官方推荐的新用户入口之一是：

```bash
hermes setup --portal
```

也可以通过下面的命令单独选择模型和配置工具：

```bash
hermes model
hermes tools
```

正确顺序是先让普通对话稳定工作，再逐步增加消息网关、Skills、记忆、Cron 和多模型路由。基础模型调用还没有配通时，同时启用所有高级功能会让排错变得困难。

## 一个推荐的上手顺序

### 第一步：完成一次普通对话

先确认模型凭据、网络和上下文长度没有问题。

### 第二步：只开放必要工具

尝试网页搜索、读取文件或运行一个无风险命令，理解工具权限和确认机制。

### 第三步：测试记忆

让它保存一个非敏感偏好，再开启新会话，确认能够正确取回和删除。

### 第四步：安装一个 Skill

选择自己真正会重复使用的流程，不要一开始安装大量来源不明的 Skill。

### 第五步：连接消息平台

CLI 稳定后，再配置 Telegram、Discord 或其他 Gateway。

### 第六步：创建低风险定时任务

先从新闻摘要、网站检查等只读任务开始，再考虑会修改文件或调用外部服务的自动化。

## 安全上需要注意什么

Hermes 能执行真实操作，因此能力越强，权限风险也越高。

建议至少遵守以下原则：

1. 不把 API Key 和访问令牌写进公开仓库。
2. 工具只开放完成任务所需的权限。
3. 删除文件、发送消息和修改线上系统前保留人工确认。
4. 来源不明的 Skill 和 MCP Server 先阅读代码与权限要求。
5. 高风险任务使用 Docker、远程机器或其他隔离环境。
6. 定期检查日志、定时任务、记忆内容和已连接平台。
7. 不要因为 Agent 能自动重试，就让它无限循环消耗模型费用。

Agent 不只是“更聪明的聊天机器人”，也是一个能够接触真实系统的自动化程序。安全边界应该在使用前设置，而不是出问题后再补。

## Hermes 适合哪些人

Hermes 更适合这些需求：

- 想搭建长期在线的个人 AI 助手；
- 希望通过手机向服务器上的 Agent 派任务；
- 需要跨会话记忆和历史检索；
- 有重复流程，希望沉淀成 Skills；
- 需要定时执行研究、整理和监控任务；
- 希望自行选择模型，而不是绑定单一供应商；
- 愿意配置工具、权限和运行环境。

如果只需要偶尔聊天、总结文本或补全几行代码，普通聊天产品会更简单。Hermes 的价值来自长期运行、工具执行和持续积累，而这些能力也意味着更高的配置和安全管理成本。

## 最后总结

Hermes Agent 是一个运行在大模型外面的通用 Agent 系统。模型负责思考，Hermes 负责提供工具、记忆、Skills、自动化、消息入口和安全边界。

它最有特点的地方不是“又多了一个聊天界面”，而是希望让 AI 助手跨会话积累信息，把成功流程沉淀为 Skill，并在本地、服务器和消息平台中持续完成任务。

## 参考资料

- [Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/)
- [Hermes Agent 功能概览](https://hermes-agent.nousresearch.com/docs/user-guide/features/overview/)
- [Hermes Agent 快速入门](https://hermes-agent.nousresearch.com/docs/getting-started/quickstart/)
- [Hermes Agent 工具说明](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools/)
- [Hermes Agent Skills 系统](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/)
- [Hermes Agent GitHub 仓库](https://github.com/NousResearch/hermes-agent)

