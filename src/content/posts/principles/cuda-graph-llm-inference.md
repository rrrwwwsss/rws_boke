---
title: "CUDA Graph 为什么能加速大模型推理"
description: "理解 GPU 工作流录制与回放、CPU 启动开销，以及 CUDA Graph 的适用条件和代价。"
publishedAt: 2026-09-07
category: 原理解析
series: LLM 模型工程笔记
tags: [CUDA Graph, GPU, vLLM, LLM]
draft: false
featured: false
readingTime: 7 MIN
---

## 本质是什么

把一堆 GPU 要干的零碎小活儿，提前“打包”成一个整体，然后一次性交给 GPU 去执行。

比如普通模式就是：
第 1 趟：告诉 GPU “开始准备”
第 2 趟：告诉 GPU “执行计算”
第 3 趟：告诉 GPU “把结果存好”
第 4 趟：告诉 GPU “清理显存”

而CUDA Graph 模式：
你在CPU这儿先把所有步骤写成一个“菜单”（Graph）：
步骤 1、2、3、4、5…… 全部列好
然后一次性把整份菜单发给 GPU，GPU 就照着菜单自己连续干完。

## 为什么逐 Token 解码特别需要它

模型完成加载后要经历两个推理阶段：
- Prefill：模型把用户输入的整个 Prompt 一次性读完，并计算出第一个 Token。
- Decode：逐个 Token 生成剩余的回答，直到结束。

没有 CUDA Graph：Decode阶段，每生成 1 个 Token，CPU 就要“喊” GPU 几十次 → 生成 100 个 Token 就要喊几千次，开销巨大。
用了 CUDA Graph：先把这些步骤打包成一个固定“剧本”，生成每个 Token 时 GPU 自己照着剧本演一遍，CPU 只需喊一次“开始”

## vLLM 中的 enforce eager

在 vLLM 中，`--enforce-eager` 会禁用 CUDA Graph 。它适合排查图捕获失败、显存紧张或特殊模型兼容问题，但通常可能牺牲一部分解码性能。

是否使用它应通过基准测试决定，而不是把 CUDA Graph 简单归类为“永远更快”。至少比较：

- 首 Token 延迟；
- 每输出 Token 延迟；
- 并发吞吐；
- 峰值显存；
- 不同输入、输出长度下的稳定性。

## 一句话记忆

CUDA Graph 像是把 CPU 指挥 GPU 的固定流程录成快捷操作：省掉重复指挥的时间，但真正的 GPU 计算仍然一项不少。

## 参考资料

- [NVIDIA CUDA Graph 文档](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#cuda-graphs)
- [vLLM CUDA Graph 设计说明](https://docs.vllm.ai/en/latest/design/cuda_graphs/)

