---
title: "LoRA、QLoRA、DoRA 与 AdaLoRA 怎么选"
description: "四种参数高效微调方法分别优化训练参数、基础模型显存、权重表达和秩分配。"
publishedAt: 2026-09-04
category: 原理解析
series: 模型微调
tags: [LoRA, QLoRA, DoRA, AdaLoRA, 模型微调]
draft: false
featured: false
readingTime: 10 MIN
---

## 先看选型结论

| 方法 | 核心变化 | 主要解决的问题 |
|---|---|---|
| LoRA | 用低秩矩阵表示权重更新 | 降低可训练参数和优化器状态 |
| QLoRA | 量化冻结的基础模型，再训练 LoRA | 进一步降低基础模型显存 |
| DoRA | 将权重变化拆成幅度和方向 | 改善低秩下的表达能力 |
| AdaLoRA | 训练中动态分配各层的秩预算 | 避免所有层使用相同 Rank |

如果没有明确瓶颈，LoRA 仍是最稳妥的起点。其他方法是在特定约束下增加复杂度，不是无条件升级。

## LoRA：低秩表示权重更新

LoRA 冻结原始权重 `W`，只训练两个较小矩阵，使权重更新近似为：

```text
W' = W + ΔW
ΔW = BA
```

如果原权重大小为 `d × k`，完整更新需要 `d × k` 个参数；LoRA 的可训练参数约为 `r × k + d × r`。当 Rank `r` 远小于 `d` 和 `k` 时，训练参数显著减少。

LoRA 主要减少可训练参数、梯度和优化器状态。基础模型权重仍需要加载，所以它并没有自动解决“基础模型本身放不进显存”的问题。

## QLoRA：把冻结的基础模型量化

QLoRA 的关键是以 4 bit 等低精度保存冻结的基础模型，同时训练通常保持较高计算精度的 LoRA 适配器。它不是“把 LoRA 参数量化成 4 bit”，也不是 W4A4 训练。

常见实现会使用 NF4、double quantization 和分页优化器等技术降低显存压力。它适合显存有限、但仍希望微调较大模型的场景。

代价包括反量化计算、训练速度可能下降，以及量化误差对任务质量的影响。最终仍要和未量化 LoRA 使用同一验证集比较。

## DoRA：分开学习幅度与方向

DoRA 将权重表示拆成 magnitude 和 direction。方向变化由 LoRA 形式处理，幅度则由额外的可学习参数负责。

这种分解试图缩小 LoRA 与完整微调之间的表达差距，尤其可能改善低 Rank 下的效果。但它会增加训练和推理开销。Hugging Face PEFT 建议在适用场景中将权重合并后推理，以减少额外开销。

## AdaLoRA：动态分配 Rank

普通 LoRA 经常给所有目标层设置统一 Rank，但不同层对当前任务的重要程度并不相同。

AdaLoRA 会在训练过程中依据重要性评分重新分配有限的参数预算：重要矩阵保留更高的 Rank，不重要矩阵减少 Rank。训练一般经历初始、预算调整和最终稳定三个阶段。

它适合参数预算严格、且有充分时间调试训练过程的任务。代价是配置项更多，训练总步数和调度阶段必须正确设置。

## 实际选型顺序

### 第一步：先建立 LoRA 基线

固定数据、评测集、Prompt 模板和推理参数，先确定普通 LoRA 的效果。没有基线就无法判断复杂方法是否真的带来收益。

### 第二步：根据瓶颈选择

- 基础模型放不进显存：优先尝试 QLoRA。
- 低 Rank 效果不足，但又不能显著提高 Rank：尝试 DoRA。
- 怀疑不同层需要不同容量，且参数预算固定：尝试 AdaLoRA。
- 普通 LoRA 已满足任务要求：保持简单，不必为了方法更新而切换。

### 第三步：统一成本口径

比较时记录验证集指标、训练峰值显存、训练耗时、适配器大小、合并后推理性能和多次随机种子的稳定性。

## 常见误区

- QLoRA 的优势主要是降低基础模型加载显存，不保证训练更快。
- DoRA 不是简单地“提高 LoRA Rank”。
- AdaLoRA 不是手动为不同层设置 Rank，而是在训练中调整预算。
- LoRA 降低多卡通信量的前提取决于并行和分片方式，不能一概而论。
- 方法名称不能替代数据质量和评测设计。

## 参考资料

- [Hugging Face PEFT LoRA 指南](https://huggingface.co/docs/peft/main/conceptual_guides/lora)
- [Hugging Face PEFT 量化指南](https://huggingface.co/docs/peft/developer_guides/quantization)
- [Hugging Face PEFT AdaLoRA 文档](https://huggingface.co/docs/peft/package_reference/adalora)
- [Hugging Face PEFT DoRA 文档](https://huggingface.co/docs/peft/package_reference/lora_variant_dora)

