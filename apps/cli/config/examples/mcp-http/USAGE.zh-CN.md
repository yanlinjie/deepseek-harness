# 连接 Streamable HTTP MCP 服务

在 Web 或 Desktop 中打开设置，添加 MCP 服务器并填写服务地址和鉴权请求头。使用终端时，可以直接加载此 Cordis 配置。在 DSH 源码目录执行。

```bash
export DSH_MCP_URL='http://127.0.0.1:9000/mcp'
pnpm dsh --profile headless \
  --patch apps/cli/config/examples/mcp-http/client.cordis.yml \
  '调用 external 服务的只读查询工具'
```

按实际服务替换 URL 和任务文字。`DSH_MCP_NAME` 可设置服务器命名空间，默认是 `external`。长时间调用可用 `DSH_MCP_TOOL_TIMEOUT_MS` 设置单次工具调用预算，默认 60,000 毫秒。

需要 Bearer 鉴权时，通过私有启动环境提供 `DSH_MCP_TOKEN`，并将 `--patch` 指向 `apps/cli/config/examples/mcp-http/bearer.cordis.yml`。DSH 的凭据插件会在连接时解析令牌。

可在同一个 Cordis 文件中为多个服务填写独立的客户端配置项，每个条目使用不同的 `id` 和 `serverName`。接入参数见[官方 MCP 客户端说明](../../../../../packages/mcp/mcp-client/README.zh.md)。

## 接入 RPent

同机运行 Go2 仿真时，加载 [local.cordis.yml](../rpent/local.cordis.yml)，调用 `mcp__go2-01__get_robot_info` 获取就绪状态。该配置连接 `http://127.0.0.1:8780/mcp`。

跨机器且由私网或网关管理访问权限时，先设置 `DSH_RPENT_REMOTE_URL` 为 RPent 的完整 `/mcp` 地址，再加载 [remote.cordis.yml](../rpent/remote.cordis.yml)，调用 `mcp__rpent-remote__get_robot_info` 检查远端。两份配置可通过多个 `--patch` 一起加载。
