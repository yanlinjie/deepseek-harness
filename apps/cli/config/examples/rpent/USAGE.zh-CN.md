# 用 DSH 调度远程 RPent

在机器人端或其控制服务器启动 RPent 任务 MCP 服务。在 DSH 服务器使用已安装依赖并完成构建的 DeepSeek Harness 源码。两台机器之间需要能访问 RPent 的 `/mcp/`，例如 `http://go2-01.lan:8780/mcp/`。

## 配置并提交任务

在 DSH 服务器配置 `DEEPSEEK_API_KEY` 或 DSH 已有的模型凭据。在私有启动环境中导出 `RPENT_RUNNER_TOKEN`，值与目标 RPent runner 一致。进入 DSH 仓库目录执行。

```bash
export RPENT_MCP_URL='http://go2-01.lan:8780/mcp/'
bash apps/cli/config/examples/rpent/run.sh headless \
  '查询 go2-01 是否空闲并报告状态。'
```

导航测试可以把任务改为“让 go2-01 从当前仿真位姿导航到厕所通道。等待最终结果并报告到达证据”。脚本使用 DSH 的 [MCP 客户端](../../../../../docs/subsystems/mcp.zh.md)加载 [任务调度配置](dispatch.cordis.yml)。RPent 负责执行任务，DSH 负责接收终态并汇报。DSH 的模型凭据和运行数据由 DSH 服务器管理。

网页入口使用同一配置。

```bash
bash apps/cli/config/examples/rpent/run.sh web --host 127.0.0.1 --port 3080 --no-open
```

以 DSH 终端打印的网页链接为准。连接多个机器人时，可在 Cordis 配置中为每个地址增加客户端条目，填写不同的 `id` 和 `serverName`，并引用该端点对应的地址和凭据。机器人的实际 `robot_id` 由各 RPent 端点返回。
