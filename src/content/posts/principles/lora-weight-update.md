---
title: "LoRA 近似的为什么是权重更新量"
description: "从 W'=W+BA 出发，理解低秩适配的核心假设、参数量与常见误区。"
publishedAt: 2026-08-20
category: 原理解析
series: 模型微调
tags: [LoRA, 微调, Transformer]
draft: false
readingTime: 8 MIN
---

## 先说结论

LoRA 并不是用两个低秩矩阵替换原始权重，而是在冻结原始权重的前提下，用低秩分解表示训练产生的权重增量。

```text
W' = W + ΔW
ΔW ≈ BA
```

## 参数量为什么会下降

假设原矩阵大小为 `d × k`，完整微调需要训练 `d × k` 个参数。LoRA 使用秩 `r` 的两个矩阵后，只需要训练 `r × k + d × r` 个参数。

## Rank 如何选择

更大的 Rank 提供更强的表达能力，同时增加显存占用与过拟合风险。它不是越大越好，需要通过任务数据和验证集选择。

## 常见误区

- 把 LoRA 描述成对原始权重做低秩分解。
- 只报告 Rank，不说明作用在哪些模块。
- 只观察训练 Loss，不验证任务指标。
