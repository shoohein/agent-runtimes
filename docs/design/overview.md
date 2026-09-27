# Overview

## 用語

| 用語 | 指すもの |
| --- | --- |
| メタエージェント | 本リポジトリ自体を操作するエージェント |
| 作業エージェント | 作業環境で対象リポジトリを操作するエージェント |
| 作業環境 | `runtimes/<env>/`。本リポジトリの分も同形で持つ（例：`runtimes/gh/me/agent-runtimes`） |

## レイアウト

```text
<repo>/
├── bin/                            # run-agent、new-env
├── shared/
│   ├── env/                        # 全env共通の単一正本（Dockerfile・compose）
│   └── pi/                         # Pi設定の単一正本
├── runtimes/<forge>/<org>/<repo>/  # 作業環境（env固有の差分のみ）
│   ├── config/                     # Pi project層
│   └── env/compose.override.yaml   # 追加分
├── docs/                           # ハーネスの説明
├── instructions/                   # 外部clone・管理外
└── skills/                         # 外部clone・管理外
```

## ハーネスの変更権限

| 側 | 範囲 |
| --- | --- |
| メタエージェント | ハーネス（`bin/` `shared/` 他envの差分含む）を変更できる |
| 作業エージェント | ハーネスを変更しない。対象リポジトリのみ操作する |

## 単一正本

| 正本 | 配布先 | env固有の置き場 |
| --- | --- | --- |
| `shared/env/` | 全envのDockerfile・compose | `runtimes/<env>/env/compose.override.yaml` |
| `shared/pi/` | 全envのPi設定 | `runtimes/<env>/config/` |
