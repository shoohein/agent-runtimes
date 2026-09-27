# Agent Runtimes

エージェントをproject毎のコンテナで動かすための実行環境定義集。

現行エージェントは[Pi](https://pi.dev)。

## 導入

前提：docker（compose v2）

```sh
git clone https://github.com/shoohein/agent-runtimes
```

## 使い方

1. checkout確保：`REPO_DIR` 以下に `<forge>/<org>/<repo>` を置く（既定 `REPO_DIR=$HOME`）
1. `bin/new-env <forge>/<org>/<repo>`：env登録
1. `bin/run-agent <env>`：起動

```sh
bin/run-agent --list        # env一覧
bin/run-agent --build <env>  # 再buildして起動
bin/run-agent down <env>    # 掃除用
```

詳細は各スクリプトの `--help` を参照。

コンテナ内からホストの鍵を使ってssh接続する場合は、ssh-agentを起動しておく。

## 設定方法

設定は環境変数で行う。未設定なら既定値。

| 環境変数           | 用途                                 | 既定                  |
| ------------------ | ------------------------------------ | --------------------- |
| `AGENT_BASE_IMAGE` | ベースイメージ（Debian系＋node搭載） | `node:24-trixie-slim` |
| `REPO_DIR`         | checkout置き場                       | `$HOME`               |

env固有の設定は `runtimes/<env>/` 以下のファイルで行う。

## ドキュメント

詳しくは [docs/](docs/) を参照。

## License

[MIT License](./LICENSE)
