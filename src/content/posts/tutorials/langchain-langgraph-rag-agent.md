---
title: "LangChain、LangGraph、RAG 和 Agent 到底是什么关系"
description: "从模型调用、知识检索到流程编排，用一个问答系统讲清四个常被混在一起的概念。"
publishedAt: 2026-09-07
category: 技术教程
series: Agent 工程
tags: [LangChain, LangGraph, RAG, Agent, Orchestrator]
draft: false
featured: false
readingTime: 9 MIN
---

## 先看一句话版本

- LangChain 提供调用模型、Prompt、工具和检索器等组件。
- RAG 是先检索外部资料，再让模型根据资料回答的方法。
- Agent 让模型根据当前情况决定下一步调用什么工具。
- LangGraph 用有状态的图来组织步骤、分支、循环和恢复。

它们不在同一个层级。RAG 和 Agent 是应用模式，LangChain 和 LangGraph 是实现这些模式的工具。

## 从最简单的模型调用开始

最简单的程序只有两步：准备 Prompt，然后调用模型。

```text
用户问题 -> Prompt -> 模型 -> 回答
```

LangChain 为不同模型提供相对统一的接口，还提供 Prompt 模板、结构化输出、工具和检索器等组件。它像一盒应用积木，不代表用了它就自动拥有 Agent 或 RAG。

## RAG 给模型补充外部知识

模型不知道企业最新制度时，可以先检索知识库：

```text
用户问题
  -> 检索相关文档
  -> 把文档和问题一起交给模型
  -> 根据资料生成回答
```

这就是 RAG。它的关键是检索、上下文组装和有依据地生成，不一定需要 Agent。

固定式 RAG 每次都执行检索，路径清楚、结果容易测试。对企业知识问答，这往往是更好的起点。

## Agent 负责做决定

如果系统有多个工具，而且下一步不能提前写死，可以让模型判断：

- 是否需要搜索知识库；
- 是否调用天气或数据库；
- 是否继续追问用户；
- 工具结果是否足够回答；
- 失败后是否换一种方法。

模型、工具和控制循环合在一起，构成 Agent。Agent 增加灵活性，也会增加成本、不确定性和测试难度。

不是所有 RAG 都是 Agent。只有模型能够决定是否检索、如何改写查询或是否再次检索时，才更接近 Agentic RAG。

## LangGraph 管理复杂流程

当 Agent 不再是“调用一次工具就结束”，而是出现分支、循环、人工确认和失败恢复时，普通顺序代码会越来越难维护。

LangGraph 把流程表示成图：

- Node：一个具体步骤，例如检索、调用模型或审核。
- Edge：步骤之间如何流转。
- State：整个任务共享的数据。
- Checkpointer：保存 thread 状态，以便暂停和恢复。

例如一个 RAG Agent 可以这样运行：

```text
收到问题
  -> 判断是否检索
     -> 不需要：直接回答
     -> 需要：检索文档
              -> 判断资料是否相关
                 -> 相关：生成答案
                 -> 不相关：改写问题并再次检索
```

LangChain 官方的高层 Agent 本身也建立在 LangGraph 能力之上；需要更细控制时，可以直接使用 LangGraph 编排。

## Multi Agent 和 Orchestrator

一个 Agent 能完成任务时，不要急着拆成多个。多 Agent 适合角色确实不同、上下文需要隔离或任务能够并行的情况。

Orchestrator 是负责任务分解和调度的上层角色。例如：

```text
Orchestrator
  -> 检索 Agent
  -> 数据分析 Agent
  -> 写作 Agent
  -> 审核 Agent
```

它需要决定把任务交给谁、如何收集结果以及失败时怎么办。多 Agent 不是“多调用几次模型”，而是增加了一套任务协议和状态管理。

## 应该从哪一种架构开始

| 需求 | 建议起点 |
|---|---|
| 单次模型调用 | 模型 SDK 或 LangChain 基础组件 |
| 固定知识库问答 | 简单 RAG 链路 |
| 模型需要选择工具 | Agent |
| 有循环、分支、恢复和人工审核 | LangGraph |
| 多个独立角色协作 | Orchestrator + 多 Agent |

最稳妥的升级顺序是：先做固定流程，再让必要的节点拥有决策能力，最后才考虑多 Agent。架构越复杂，越要补充状态追踪、超时、重试和评测。

## 参考资料

- [LangChain 官方概览](https://docs.langchain.com/oss/python/langchain/overview)
- [LangGraph 官方概览](https://docs.langchain.com/oss/python/langgraph/overview)
- [使用 LangGraph 构建 Agentic RAG](https://docs.langchain.com/oss/python/langgraph/agentic-rag)

