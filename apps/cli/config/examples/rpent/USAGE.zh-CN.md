# 连接 RPent 任务 MCP

先启动 RPent 任务服务，再在 DSH 源码目录执行命令。

## 同机连接

[本地配置](local.cordis.yml)使用 `http://127.0.0.1:8780/mcp`，工具名称以 `mcp__go2-01__` 开头。

```bash
pnpm dsh --profile headless \
  --patch apps/cli/config/examples/rpent/local.cordis.yml \
  '调用 mcp__go2-01__get_robot_info 查询机器人状态'
```

## 跨主机连接

[远程配置](remote.cordis.yml)通过 `DSH_RPENT_REMOTE_URL` 读取完整的 `/mcp` 地址。将下方的 `RPENT_HOST` 换成 RPent 服务的地址，并使用该服务配置的协议和端口。

```bash
DSH_RPENT_REMOTE_URL='http://RPENT_HOST:8780/mcp' \
pnpm dsh --profile headless \
  --patch apps/cli/config/examples/rpent/remote.cordis.yml \
  '调用 mcp__rpent-remote__get_robot_info 查询机器人状态'
```

每份配置的单次工具调用超时默认是 960 秒，可通过 `DSH_MCP_TOOL_TIMEOUT_MS` 按毫秒调整。同一 DSH 进程可以通过多个 `--patch` 加载两份配置。

## Bearer 鉴权

RPent 启用 Bearer 鉴权时，按跨主机示例设置 `DSH_RPENT_REMOTE_URL`，并在 DSH 的启动环境中将 `DSH_MCP_TOKEN` 设为服务端配置的令牌。同机连接可将地址设为 `http://127.0.0.1:8780/mcp`。将下面的配置保存为私有 YAML 文件，并让启动命令的 `--patch` 指向该文件。 [MCP 客户端凭据说明](../../../../../packages/mcp/mcp-client/README.zh.md#runtime-templates-and-credentials)

```yaml
- id: credentials
  disabled: false

- insert:
    - id: rpent-remote-mcp
      name: '@deepseek-ai/dsh-mcp-client'
      inject: [credentials]
      config:
        serverName: rpent-remote
        transport: streamable-http
        url: !!js process.env.DSH_RPENT_REMOTE_URL
        toolCallTimeoutMs: !!js 'Number(process.env.DSH_MCP_TOOL_TIMEOUT_MS ?? 960000)'
        expandTemplates: true
        headers:
          Authorization: 'Bearer ${credential:DSH_MCP_TOKEN}'
```
