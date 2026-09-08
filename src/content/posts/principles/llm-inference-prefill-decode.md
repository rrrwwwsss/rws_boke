---
title: "一次大模型推理经历了什么：加载、Prefill 与 Decode"
description: "用上岗、读题和逐字回答三个阶段，讲清模型加载、首 Token 延迟、KV Cache 与生成速度。"
publishedAt: 2026-09-07
category: 原理解析
series: LLM 模型工程笔记
tags: [LLM, 推理, Prefill, Decode, KV Cache, GPU]
draft: false
featured: false
readingTime: 8 MIN
---

当我们向大模型发送一句话时，模型并不是立刻开始“逐字回答”。完整过程可以分成三个阶段：

1. 模型加载：人先到岗，把工具准备好。
2. Prefill：把题目完整读一遍。
3. Decode：一个 Token 接一个 Token 地写答案。

这三个阶段消耗的资源不同，优化方法也不同。分清它们，才能看懂首 Token 延迟、生成速度和显存占用这些指标。

## 阶段一：模型加载与初始化

可以把大模型服务想象成一位准备上岗的员工。正式接单之前，他需要先到工位、拿到资料，并把工具摆好。

这个阶段通常包括：

- 从硬盘读取模型权重；
- 把权重放进 CPU 内存和 GPU、NPU 显存；
- 初始化 CUDA、昇腾运行环境和通信组件；
- 加载 Tokenizer；
- 准备计算所需的 推理代码（Kernel） 和临时工作区；
- 为 KV Cache 预留或建立可动态分配的空间。

不同框架管理 KV Cache 的方式并不完全相同。有的使用固定大小的静态缓存，有的让缓存随着生成过程动态增长；vLLM 这类服务框架还会以块为单位管理缓存。

### 这个阶段会发生几次

模型加载一般在服务启动时执行一次。只要服务进程没有退出，后面的请求就可以复用已经加载好的模型，不需要每问一个问题都重新把几十 GB 的权重搬进显存。

所以，线上常说的“冷启动慢”，主要指模型第一次启动和初始化很慢；服务热起来以后，单个请求更关注 Prefill 和 Decode。

## 阶段二：Prefill，模型把题目读完

假设用户输入：

```text
请帮我写一份执法报告
```

Tokenizer 会先把文字切成模型认识的 Token。接着，模型一次处理整段输入，让每个 Token 与前面的相关内容建立联系。

在这个阶段，模型会完成两件重要的事：

1. 为输入中的每个 Token 计算并保存 K、V，形成最初的 **KV Cache**。
2. 根据最后位置的输出分布选出回答的第一个 Token。

例如，第一个 Token 可能对应“以下”“根据”或某个标点。用户看到第一个字开始出现，说明 Prefill 基本完成，模型进入了生成阶段。

## 为什么 Prefill 计算量大

Prefill 要同时处理整个 Prompt。如果输入有 4,000 个 Token，模型就要处理这 4,000 个 Token；如果输入增长到 20,000 个，计算量和中间数据都会明显增加。

## 阶段三：Decode，模型逐个生成答案

读完题后，模型开始写答案。自回归大模型不能一次把整段答案全部生成出来，而是每次预测一个新 Token。

过程大致是：

```text
已有 Prompt -> 生成第 1 个 Token
Prompt + 第 1 个 Token -> 生成第 2 个 Token
Prompt + 前 2 个 Token -> 生成第 3 个 Token
……
```

如果每一步都重新计算全部历史内容，会浪费大量时间。KV Cache 就是为了解决这个问题。

## KV Cache 像模型的草稿纸

模型在 Prefill 时已经计算了 Prompt 中各 Token 的 K 和 V。Decode 时，它只需要计算新 Token 的 K、V，再读取历史缓存完成注意力计算，不必把以前的内容从头算一遍。

可以把 KV Cache 想成放在桌边的草稿纸：模型每写一个字，就把有用的中间结果记下来；写下一个字时直接翻草稿纸，而不是重新读题并重新推导所有步骤。

KV Cache 节省了重复计算，但会消耗显存。它通常会随着以下内容增加：

- 同时处理的请求数量；
- 每条请求已经缓存的 Token 数；
- 模型层数；
- KV Head 数量和维度；
- KV Cache 使用的数据类型。

这就是为什么长上下文和高并发容易把显存吃满。

## 为什么回答越长越慢

Prefill 通常只执行一次，而 Decode 要按输出 Token 数循环。

如果答案生成 100 个 Token，就大约需要 100 次 Decode；生成 1,000 个 Token，就大约需要 1,000 次。后面的每一步还要读取更长的 KV Cache，所以总耗时会继续累积。

## 三个阶段放在一起看

| 阶段 | 白话理解 | 执行频率 | 重点关注 |
|---|---|---|---|
| 模型加载 | 人到岗并准备工具 | 服务启动时为主 | 启动时间、权重显存、初始化失败 |
| Prefill | 完整读题 | 每个请求一次 | TTFT、Prompt 长度、计算吞吐 |
| Decode | 逐字回答 | 每个输出 Token 一次 | TPOT、TPS、显存带宽、KV Cache |

## 参考资料

- [Hugging Face Transformers KV Cache 指南](https://huggingface.co/docs/transformers/kv_cache)
- [vLLM 优化与调优文档](https://docs.vllm.ai/en/latest/configuration/optimization/)

