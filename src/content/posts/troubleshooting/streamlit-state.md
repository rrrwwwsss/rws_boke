---
title: "Streamlit 页面重运行后，状态为什么丢了"
description: "理解 rerun、session state 与后端对象生命周期之间的区别。"
publishedAt: 2026-08-05
category: 踩坑复盘
series: 状态管理
tags: [Streamlit, Python, Debug]
draft: false
readingTime: 6 MIN
---

## 问题现象

页面发生交互后脚本重新执行，聊天消息还在，但 Agent 内部对象、缓存或当前任务状态出现不一致。

## 根本原因

Streamlit 的交互模型是从上到下重新执行脚本。普通局部变量不会自然跨 rerun 保存，而 session state、缓存资源和外部持久化拥有不同生命周期。

## 解决方案

- 页面展示状态放入 `st.session_state`。
- 昂贵且可复用的客户端使用资源缓存。
- 对话状态使用稳定的 thread ID 和 Checkpointer。
- 服务重启后仍需保留的数据写入 SQLite 或 PostgreSQL。

## 验证方式

分别测试组件交互、浏览器刷新、服务进程重启和并发会话，不能只测试正常聊天路径。
