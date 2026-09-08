---
title: "Agent、Harness 和 Hermes 到底有什么区别"
description: "用员工、工作台和具体产品的比喻，讲清 AI Coding Agent、Agent Harness 与 Hermes 的关系，并梳理主流工具属于哪一类。"
publishedAt: 2026-09-07
category: AI 工具
series: AI Coding
tags: [Agent, Harness, Hermes, Codex, Claude Code, AI Coding]
draft: false
featured: false
readingTime: 10 MIN
---

## 先说结论

Agent、Harness 和 Hermes 并不是三个并列的技术类别。

- **Agent** 是能够理解目标、决定下一步并使用工具完成任务的“干活者”。
- **Harness** 是围绕模型搭建的一整套运行系统，相当于 Agent 的“工作台和管理制度”。
- **Hermes Agent** 是 Nous Research 开发的一个具体 Agent 产品，它自己也带有 Harness。

主流 AI Coding 工具通常既是用户眼中的 Coding Agent，也包含自己的 Coding Harness。因此，把 Claude Code 问成“它属于 Agent 还是 Harness”，就像问一名程序员“属于员工还是办公系统”：程序员是执行者，但他工作时离不开办公系统。

## 先分清模型和 Agent

大语言模型本身更像一个聪明的大脑。你输入文字，它计算并返回文字；但它默认不知道你的项目有哪些文件，也不能真的运行测试、查看报错或修改代码。

当系统给模型接上文件读取、代码编辑、终端、浏览器等工具，并让它反复执行下面的循环，它才开始像 Agent：

```text
理解目标
  -> 决定下一步
  -> 调用工具
  -> 阅读工具结果
  -> 再决定下一步
  -> 验证任务是否完成
```

比如你说“修复登录页面的报错”，Coding Agent 可能会：

1. 搜索登录页面相关文件。
2. 阅读代码和错误日志。
3. 判断问题可能出在哪里。
4. 修改代码。
5. 运行测试。
6. 测试失败后继续修正。
7. 最后告诉你修改了什么。

只回答一段修改建议的是聊天模型；能够进入项目、修改文件并验证结果的，才更接近 Coding Agent。

## Harness 是 Agent 的工作台

模型拥有推理能力，工具拥有执行能力，但还需要一个系统把它们组织起来。这个系统就是 Harness。

Harness 原意是“马具”或“安全带”：它把力量约束、连接并传递到正确的地方。在 Agent 语境中，它是包在模型外面的运行脚手架。

一个 Coding Harness 通常负责：

- 把用户请求和项目规则交给模型；
- 告诉模型有哪些工具可以使用；
- 真正执行读文件、改文件和终端命令；
- 把工具结果再次送回模型；
- 管理上下文，避免对话无限增长；
- 保存任务状态和历史记录；
- 在危险命令前请求用户批准；
- 限制模型可以访问的目录和网络；
- 运行测试并判断任务是否继续；
- 支持 Skills、MCP、插件或子 Agent。

可以把它理解为：

```text
模型 = 员工的大脑
Agent = 正在完成工作的员工
Harness = 电脑、工具箱、流程、权限和监督机制
```

同一个模型放进不同 Harness，实际表现可能差很多。原因不是模型突然变聪明了，而是它获得的工具、上下文管理、提示词、权限边界和反馈循环不同。

## Harness 不是评测 Harness

“Harness”还经常出现在 `evaluation harness` 中，表示批量运行测试和统计分数的评测框架。

它和 Agent Harness 不是一回事：

- Agent Harness 让模型能够持续做事。
- Evaluation Harness 用统一流程测试模型或 Agent 做得怎么样。

看到这个词时，需要先判断讨论的是“运行 Agent”，还是“评测 Agent”。

## Hermes 是什么

Hermes Agent 是 Nous Research 推出的通用个人 Agent。它不是一种与 Agent、Harness 并列的新技术，也不只是一个模型名称。

Hermes 可以连接不同模型提供方，并提供终端、工具、消息渠道、定时任务、Skills 和长期记忆等能力。它强调跨会话学习：保存用户相关信息，从过去的任务中形成或改进 Skill，并能运行在本地机器、服务器或云环境中。

因此，更准确的关系是：

```text
Hermes Agent
  ├─ 使用某个大语言模型作为大脑
  ├─ 使用自身 Harness 管理循环、工具和权限
  └─ 以通用个人 Agent 的形式对外提供服务
```

Hermes 可以写代码，但它的定位比 Coding Agent 更宽。它还可以处理消息、定时工作、个人记忆和跨设备任务。Claude Code、Codex 等产品则更专注于软件工程工作流。

## 为什么有人把 Hermes 叫作 Harness

一个完整产品往往把 Agent 和 Harness 封装在一起。用户看到的是“Hermes 在做事”，开发者看到的则是 Hermes 内部的工具循环、状态管理、权限和记忆系统。

所以以下说法可能同时成立：

- Hermes 是一个 Agent 产品。
- Hermes 内部有一套 Agent Harness。
- Hermes 的 Harness 可以驱动不同模型。

这不是概念冲突，只是观察角度不同。

## 主流 AI Coding 工具属于哪一类

下面的“主要形态”描述用户最常接触的产品形式，并不是说它只能属于这一类。

| 工具 | 主要形态 | 是否包含 Harness | 白话理解 |
|---|---|---:|---|
| OpenAI Codex | Coding Agent，CLI、桌面或云任务 | 是 | 能读项目、改代码、运行命令并验证 |
| Claude Code | 终端 Coding Agent | 是 | 在终端中持续调用工具完成编程任务 |
| Gemini CLI | 终端 Coding Agent | 是 | 由 Gemini 驱动的命令行编程 Agent |
| GitHub Copilot | IDE 助手加 Coding Agent | 是，Agent 模式中 | 既能补全代码，也能接任务自主修改 |
| Cursor | AI IDE 加 Coding Agent | 是，Agent 模式中 | 编辑器是外壳，Agent 模式负责多步执行 |
| Windsurf | AI IDE 加 Coding Agent | 是 | 在 IDE 内通过 Agent 工作流修改项目 |
| Cline | IDE 插件式 Coding Agent | 是 | 在 VS Code 中提供工具调用和审批循环 |
| Continue | IDE 助手和可配置 Agent | 是，Agent 模式中 | 可连接不同模型，并配置工具和上下文 |
| Aider | 终端 Coding Agent | 是 | 以 Git 和代码编辑为核心的轻量 Harness |
| OpenCode | 开源终端 Coding Agent | 是 | 可连接多种模型的 Coding Harness 产品 |
| OpenHands | 开源软件开发 Agent 平台 | 是 | 更强调沙箱、任务执行和自主开发 |
| Devin | 云端软件工程 Agent | 是 | 在托管环境中接收并执行较完整任务 |
| SWE-agent | 研究型 Coding Agent | 是 | 用 Agent 循环处理代码仓库和 Issue |
| Replit Agent | 云 IDE 内的应用开发 Agent | 是 | 从需求出发生成、运行并修改应用 |
| Hermes Agent | 通用个人 Agent | 是 | 能编程，但不只服务于编程任务 |

## 补全工具算不算 Agent

传统的代码补全只根据光标附近内容预测下一段代码：

```text
你写代码 -> 工具建议下一行 -> 你决定是否接受
```

它没有自己拆解任务、调用终端和反复验证，因此更像 Assistant，而不是完整 Agent。

但现在许多产品同时提供补全、聊天和 Agent 模式。例如 GitHub Copilot、Cursor 和 Windsurf 不能只贴一个标签：

- 使用行内补全时，它是代码助手。
- 使用对话问答时，它是聊天助手。
- 让它跨文件修改并运行命令时，它是 Coding Agent，由产品内的 Harness 驱动。

分类应该看“当前模式能做什么”，而不是只看产品名字。

## 模型、Agent 和产品也不要混为一谈

GPT、Claude、Gemini、Qwen 主要是模型家族；Codex、Claude Code、Gemini CLI、Cursor 等是面向用户的 Agent 或开发工具。

一个产品也可能允许切换模型。例如某个开源 Coding Harness 可以同时接入 Claude、GPT 或本地模型。此时：

```text
模型决定思考与生成能力
Harness 决定它如何观察、行动和受约束
具体产品决定用户如何使用这套系统
```

只比较模型排行榜，无法完整预测 Coding Agent 的效果。代码检索是否准确、修改工具是否稳定、上下文是否管理得当、测试反馈能否送回模型，都可能决定最终结果。

## 如何判断一个工具是不是完整 Coding Agent

可以问五个问题：

1. 它能不能自己查看项目文件，而不需要你逐段复制？
2. 它能不能修改多个文件？
3. 它能不能运行终端、测试或构建？
4. 工具失败后，它能不能读取错误并继续尝试？
5. 它有没有权限控制、沙箱或操作确认？

如果只能生成代码建议，它更像助手；如果能够围绕目标持续观察、行动、验证，它就是 Agent；支撑这套循环的运行系统，就是 Harness。

## 选择工具时应该看什么

不要只问“哪个模型最强”，还应比较 Harness：

- 能否准确检索大型仓库；
- 是否支持项目规则和 Skill；
- 是否能运行测试并理解结果；
- 修改是否方便审查和撤回；
- 危险操作是否需要批准；
- 是否支持 MCP、插件和外部工具；
- 长任务能否暂停、恢复或在云端继续；
- 数据会发送到哪里；
- 模型和使用成本是否可控。

如果主要工作是本地软件开发，应优先选择专门的 Coding Agent。需要消息渠道、定时任务、长期个人记忆和跨领域自动化时，Hermes 这类通用 Agent 更贴近需求。

## 最后记住这个关系

Agent 是干活的人，Harness 是他使用的工作台和规则体系，Hermes 是一个已经把“人、工作台和长期记忆”组装好的具体通用 Agent 产品。

Claude Code、Codex、Cursor Agent 等主流 AI Coding 工具，大多不是只属于 Agent 或只属于 Harness：从用户角度看，它们是 Coding Agent；从系统结构看，它们各自包含一套 Coding Harness。

## 参考资料

- [Harness Protocol 术语说明](https://github.com/harnessprotocol/harness-protocol/blob/main/protocol/terminology.md)
- [Microsoft Agent Harness 概念](https://learn.microsoft.com/en-us/agent-framework/concepts/harness)
- [Hermes Agent 官方仓库](https://github.com/NousResearch/hermes-agent)
- [Claude Code 官方文档](https://code.claude.com/docs/)
- [GitHub Copilot CLI 官方说明](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)

