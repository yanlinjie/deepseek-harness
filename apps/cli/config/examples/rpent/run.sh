#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == '--help' || "${1:-}" == '-h' ]]; then
    echo "用法：bash apps/cli/config/examples/rpent/run.sh {headless|web} [DSH 选项及任务]"
    exit 0
fi

profile="${1:-web}"
[[ $# -eq 0 ]] || shift
case "$profile" in
    headless|web) ;;
    *) echo '请选择 headless 或 web。' >&2; exit 2 ;;
esac

: "${RPENT_MCP_URL:?请将 RPENT_MCP_URL 设置为 RPent 的 MCP 网络地址。}"
example_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd -- "$example_dir/../../../../.."
exec pnpm dsh --profile "$profile" --patch "$example_dir/dispatch.cordis.yml" "$@"
