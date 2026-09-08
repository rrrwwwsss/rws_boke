---
title: "vLLM 服务启动参数怎么配"
description: "从模型长度、显存比例到并行和 KV Cache，读懂一条 vllm serve 命令中真正重要的参数。"
publishedAt: 2026-09-07
category: 工程实践
series: LLM 模型工程笔记
tags: [vLLM, LLM, 部署, KV Cache, GPU]
draft: false
featured: false
readingTime: 9 MIN
---

## 先看一条基础命令

```bash
vllm serve /models/Qwen \
  --served-model-name qwen \
  --dtype auto \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.9 \
  --tensor-parallel-size 1
```

这条命令做的事很简单：加载指定模型，启动兼容 OpenAI API 的服务，并规定上下文长度、显存预算和使用几张卡。

## 模型相关参数

`vllm serve /models/Qwen` 中的路径可以是本地目录，也可以是框架支持的模型标识。`--served-model-name` 是客户端请求时填写的模型名，不设置时通常沿用模型路径或名称。

`--dtype auto` 让框架根据模型配置选择数据类型。手动设置 FP16、BF16 前要确认硬件支持。数据类型不仅影响显存，也可能影响数值稳定性和速度。

量化模型还要使用与模型文件匹配的量化配置。`--quantization awq` 不是把普通模型现场变成 AWQ，而是告诉 vLLM 按 AWQ 格式加载已经量化好的权重。

## max model len 控制什么

`--max-model-len 8192` 表示单条序列允许的最大 Token 长度，通常包含输入和输出。

它不是越大越好。设置得越大，服务需要为长序列准备更多 KV Cache 能力，可能降低可承载的并发数。业务只需要 8K 上下文时，没有必要为了“参数好看”直接设置成 128K。

上线前要同时限制 API 的最大输出长度，避免一个请求把上下文预算全部占满。

## gpu memory utilization 不是 KV Cache 比例

`--gpu-memory-utilization 0.9` 表示当前 vLLM 实例计划使用的 GPU 显存比例。模型权重、KV Cache 和执行开销共同使用这份预算。

它不等于“KV Cache 占显存 90%”。如果同一张卡还有其他进程，盲目调高容易触发 OOM；设置过低，则留给 KV Cache 的空间减少，并发能力也会下降。

## KV Cache 数据类型

`--kv-cache-dtype auto` 通常跟随模型数据类型。支持的硬件和模型上可以考虑 FP8 KV Cache，以降低长上下文和高并发时的缓存占用。

降低缓存精度可能影响输出质量，而且不同 GPU 对 FP8 的支持不同。应使用真实任务集比较准确率、吞吐和显存，而不是只看服务能否启动。

## 多卡参数

`--tensor-parallel-size 2` 会把层内权重和计算拆到两张 GPU。它适合模型无法放入单卡的情况，但会引入高频卡间通信。

`--pipeline-parallel-size 2` 按网络层把模型分成两个阶段。它对互联条件的要求可能低于张量并行，但需要考虑阶段是否均衡和流水线空泡。

如果模型单卡能够放下，而目标只是提高总吞吐，多个独立副本通常比强行增加张量并行更直接。

## 调度参数

`--max-num-seqs` 限制一次调度中处理的序列数量，`--max-num-batched-tokens` 控制一次迭代可处理的 Token 总量。前者更接近并发宽度，后者更接近每轮工作量。

调大可能提高吞吐，也会增加显存压力和单请求等待时间。在线对话重视尾延迟，离线批处理更重视总吞吐，两者不应该照抄同一套参数。

## 推荐调参顺序

1. 先用单卡、默认 dtype 验证模型能正确回答。
2. 根据业务确定真实的最大上下文长度。
3. 调整显存比例，保留安全余量。
4. 模型放不下时再配置 TP 或 PP。
5. 用真实长度分布压测 `max-num-seqs` 和 Token 批量。
6. 最后再尝试 FP8 KV Cache、量化和 CUDA Graph 等优化。

每次只改一组变量，并记录 TTFT、TPOT、吞吐、P95/P99 延迟和峰值显存。

## 参考资料

- [vLLM Engine 参数文档](https://docs.vllm.ai/en/latest/configuration/engine_args/)
- [vLLM 并行部署文档](https://docs.vllm.ai/en/latest/serving/parallelism_scaling/)

