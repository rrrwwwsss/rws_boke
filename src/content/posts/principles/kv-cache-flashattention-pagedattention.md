---
title: "KV Cache、FlashAttention 与 PagedAttention 有什么区别"
description: "三个常被放在一起讨论的推理优化，分别解决重复计算、Attention 访存和 KV Cache 管理问题。"
publishedAt: 2026-09-04
category: 原理解析
series: LLM 模型工程笔记
tags: [KV Cache, FlashAttention, PagedAttention, vLLM, Transformer]
draft: false
featured: false
readingTime: 9 MIN
---

## 先把三者分开

KV Cache、FlashAttention 和 PagedAttention 都能影响大模型推理效率，但它们处理的是不同问题：

| 技术 | 主要解决的问题 | 核心思路 |
|---|---|---|
| KV Cache | 自回归解码中的重复计算 | 保存历史 Token 的 K、V |
| FlashAttention | Attention 计算的显存读写开销 | 分块计算并减少 HBM 往返 |
| PagedAttention | 服务场景中的 KV Cache 分配与碎片 | 像虚拟内存一样按块管理缓存 |

把 FlashAttention 简化为“切成小块”，或者把 PagedAttention 理解成“把显存分页”，方向虽然接近，但仍不足以解释它们为什么有效。

## KV Cache 为什么存在

自回归模型每次只生成一个新 Token。没有缓存时，第 `t` 步需要再次计算前面所有 Token 在每一层的 Key 和 Value，已经算过的历史部分会被不断重复计算。

KV Cache 保存各层历史 Token 的 K、V。下一步只计算新 Token 的 Q、K、V，然后让新 Q 与缓存中的历史 K、V 做 Attention。

代价是缓存会随着以下因素近似线性增长：

- batch 中的序列数量；
- 已缓存的 Token 数；
- Transformer 层数；
- KV head 数和 head dimension；
- KV Cache 的数据类型。

因此，长上下文服务经常不是放不下模型权重，而是放不下不断增长的 KV Cache。

## FlashAttention 优化了什么

标准 Attention 通常要生成或读写较大的中间矩阵。GPU 算术运算很快，但高带宽显存 HBM 与片上 SRAM 之间的数据搬运可能成为瓶颈。

FlashAttention 使用 tiling 将 Q、K、V 分块放入更快的片上存储，在块内完成计算，并通过在线 softmax 避免完整保存巨大的 Attention 矩阵。它计算的是精确 Attention，不是通过稀疏化得到的近似结果。

它的重点不是减少模型参数，而是降低内存读写量，并让 Attention 内核更充分利用 GPU。

## PagedAttention 优化了什么

在线服务中，每条请求的输出长度事先不确定。如果为每个请求预留一整块连续 KV Cache，容易出现内部浪费和外部碎片；请求增删还会让管理变得复杂。

PagedAttention 把一条序列的 KV Cache 切成固定大小的块。逻辑上连续的 Token，可以映射到物理上不连续的显存块。系统按需分配块，并能在共享前缀等场景中复用它们。

这和操作系统的分页思想相似，但它管理的是模型推理中的 KV Cache，而不是替代 FlashAttention 的计算内核。

## 三者如何共同工作

一次解码可以同时使用三者：

1. KV Cache 避免重新计算历史 K、V。
2. PagedAttention 负责高效组织和访问这些缓存块。
3. FlashAttention 类内核优化 Attention 计算过程中的数据搬运。

不同框架、模型结构和 GPU 上采用的具体后端可能不同，因此不能笼统地说某个框架在所有情况下都“默认开启同一个 FlashAttention”。应以运行日志、版本文档和 profiling 结果为准。

## 一个常见参数误区

vLLM 的 `--gpu-memory-utilization 0.8` 表示当前实例可使用的 GPU 显存比例目标，不等于“KV Cache 固定占整张 GPU 显存的 80%”。模型权重、执行器开销以及其他显存需求也包含在内，剩余空间才用于缓存等用途。

## 如何判断瓶颈在哪里

- 长上下文或高并发时频繁触碰缓存容量：重点检查 KV Cache 大小和块管理。
- Attention 占据大量 kernel 时间：检查所用 Attention backend 和输入形态。
- 短输出、小 batch 时 GPU 利用率低：还可能是 CPU 调度和 kernel launch 开销。
- 模型权重本身放不下：先考虑张量并行或权重量化，而不是指望 PagedAttention 解决。

## 参考资料

- [FlashAttention 论文](https://arxiv.org/abs/2205.14135)
- [PagedAttention 与 vLLM 论文](https://arxiv.org/abs/2309.06180)
- [vLLM 内存优化文档](https://docs.vllm.ai/en/latest/configuration/optimization/)

