---
title: "LoRA 微调参数怎么调"
description: "从 Rank、Alpha、目标层到学习率和有效 Batch，给出一套可以逐步验证的 LoRA 调参方法。"
publishedAt: 2026-09-07
category: 技术教程
series: 模型微调
tags: [LoRA, 模型微调, PEFT, LLaMA-Factory]
draft: false
featured: false
readingTime: 10 MIN
---

## 先建立一个基线

下面不是通用最优参数，而是一套便于开始实验的配置：

```python
from peft import LoraConfig, TaskType

config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
    bias="none",
)
```

模型结构不同，层名称也不同。配置前先打印模型结构，确认 `q_proj`、`v_proj` 等模块真实存在。

## Rank 决定适配器容量

Rank，也就是 `r`，决定两个低秩矩阵中间的宽度。Rank 越大，可训练参数越多，模型能表示的权重变化也更复杂。

它并不是越大越好：

- 太小可能欠拟合；
- 太大增加显存和训练时间；
- 数据较少时，过大的容量还可能过拟合。

可以从 `8` 或 `16` 建立基线，再比较 `32`。不要一上来同时改 Rank、学习率和目标层，否则很难知道收益来自哪里。

## Alpha 控制更新强度

LoRA 更新通常会乘以与 `lora_alpha / r` 有关的缩放系数。因此，Alpha 不能脱离 Rank 单独解释。

如果改变 Rank 却保持 Alpha 不变，缩放比例也会改变。实验记录中应同时保存 `r`、`lora_alpha` 以及是否使用 Rank-Stabilized LoRA 等变体。

## Target Modules 决定改哪些层

只训练 `q_proj`、`v_proj` 参数少、成本低，是常见基线。把 `k_proj`、`o_proj` 以及 FFN 的 `gate_proj`、`up_proj`、`down_proj` 加入后，适配能力可能增强，但参数和计算量也会增加。

PEFT 支持 `target_modules="all-linear"`，常用于 QLoRA 风格训练。使用前仍应核对输出层是否应该训练，并记录实际可训练参数量。

## Dropout 不是越大越安全

`lora_dropout` 会随机丢弃 LoRA 分支的一部分输入，用于缓解过拟合。数据量较小、训练轮数较多时可以尝试 `0.05`；数据充分时，`0` 也可能更合适。

判断依据是验证集，而不是训练 Loss。训练 Loss 更低但验证集更差，就是典型过拟合信号。

## 学习率通常比全量微调高

LoRA 只训练少量新参数，常使用比全量微调更高的学习率。但具体数值受到模型规模、数据量、优化器、有效 Batch 和目标层影响。

建议围绕一个基线做小范围对数搜索，例如比较 `1e-4`、`2e-4` 和 `5e-4`，同时观察验证指标和 Loss 曲线。出现明显震荡或快速恶化时，优先降低学习率。

## 有效 Batch 怎么算

```text
有效 Batch Size
= 单卡 Batch × 梯度累积步数 × 数据并行卡数
```

显存不足时，可以减小单卡 Batch，再增加 `gradient_accumulation_steps`。梯度累积能模拟更大的有效 Batch，但不会让单步训练变快，也不能完全复制大 Batch 的所有并行行为。

## Epoch 和 Warmup

Epoch 太少可能没有学会任务，太多则容易过拟合。数据量较小时，不要只按 Epoch 判断训练是否充分，还要看总更新步数。

Warmup 会在训练开始时逐渐提高学习率，避免新初始化的适配器一开始受到过大的更新。常见做法是使用总步数的一小部分，但仍应根据曲线验证。

## 推荐实验顺序

1. 固定数据划分、Prompt 模板和评测指标。
2. 用 `r=16`、少量目标层建立基线。
3. 先搜索学习率。
4. 判断欠拟合后再扩大 Rank 或目标层。
5. 出现过拟合时调整 Epoch、Dropout 和数据质量。
6. 最后比较 QLoRA、DoRA、AdaLoRA 等方法。

每次保存配置、随机种子、可训练参数量、峰值显存和验证结果。LoRA 调参的重点不是找到一个神奇 Rank，而是让每次变化都能够解释和复现。

## 参考资料

- [Hugging Face PEFT 配置指南](https://huggingface.co/docs/peft/main/en/guides/peft_model_config)
- [Hugging Face LoRA API](https://huggingface.co/docs/peft/package_reference/lora)

