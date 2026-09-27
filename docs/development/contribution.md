# Contribution

## 管理対象

- Git管理する
  - 実行環境定義：`bin/` `shared/` `runtimes/`
  - その説明：`docs/`
- Git管理しない
  - 作業リポジトリのコード
  - 外部clone（実行時にコンテナへ取り込む）：`instructions/` `skills/`

## 利用者向け操作

| やりたいこと | 方法                                        |
| ------------ | ------------------------------------------- |
| 起動・停止   | `bin/run-agent` のみ使う。compose直叩き不可 |
| 新env登録    | `bin/new-env <forge>/<org>/<repo>`          |

## compose編集時の約束

- volumesは意味でグループ化する（repo由来→host→shared infra）
