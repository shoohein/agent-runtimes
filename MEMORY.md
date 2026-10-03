# MEMORY.md（一時メモ。枯れたら恒常docsへ移す）

運用：決定・検証結果はその場で追記（エージェントの記憶として最新維持）。恒常docs行きが決まった内容は移してここから削る。未決・要観察は結論が出るまで残す。
整理方針：将来の判断に必要な情報・決定したが未実施の項目・docs移行予定のみ残す。ファイルを見れば自明な情報は書かない。ただし引き継ぐ別エージェントが必要とする入口（所在・理由・gotcha）は残す。

運用：案→承認→実装、easy-first、叩き台先行。コミットはアトミック変更に分割（一括コミット禁止）。mainは恒久物のみ、wipブランチに一時ファイル（MEMORY・TASKS）を `wip: session state` で載せる。再開時はresetして継続。pushはmain＋wip両方。

## 決定（詳細は各ファイルを参照）

- infra境界：meta（本repo操作）／作業（`runtimes/...` 環境）。作業側のハーネス変更は不可（設計）＋不可視ではないためpolicyでも防衛。
- permission方針：既定allow、危険のみ縛る（正本＝`shared/pi/extensions/pi-permission-system/config.json`）。deny不可の理由＝meta自身も縛られるため人間がdialog判別。制限はproject層override勝ち仕様のためglobal側。
- bashの制限時間はtoolのtimeoutパラメータで指定し `timeout` コマンドで包まない（indirection-wrapper floorでallow→askに固定され毎回dialogが出る。pure-reader以外は設定で解除不可のため）。
- 永続化：sessions・trust.json・authはhost bind、npmは共有volume `agent-npm`（`external: true`＋`run-agent` が自動作成）。`down -v` でも消えない。共有理由＝コンテナephemeral対策（コンテナ内パス安定のため成立）＋全envでhost毎1回login。代償＝1envの暴走が他envの認証を破壊しうる。authはhost piと分離（`${HOME}/.agent-runtimes/auth.json`）。
- `runtimes/.../config/`＝Pi project層。keybindings等の単一正本は `shared/pi/`＋bind（project層に置けないため）。
- skills・instructionsは独立clone＋ignore（REPO_ROOT直下。3件目の外部依存で再議論）。cloneはhttps（publicのため認証不要）、pushはSSH（https pushは認証なしで失敗する）。
- skills repo方針：配置はrepoルート直下（Pi再帰走査・他者共通形。将来はcategory grouping可）。READMEは薄く保ちfrontmatter則は書かない（既存を見れば自明。迷いが出たらskills側にcontribution稿）。pre-commitはyaml対応を初日から（config自体がyamlのため）。
- `.gitignore` はスコープ分割（docs/development移行予定の開発規約）。
- 新envは `bin/new-env` で登録。`bin/` 新規はwrite後に `chmod +x`（writeでmode落ち）。コンテナ内のgit identityはenv継承（`GIT_AUTHOR_*`／`GIT_COMMITTER_*`）。`git config --global` で上書きしない（空で潰す）。
- 自動cloneは維持＋版表示（欠落時は冪等cloneしshort hashを表示）。対象＝instructions・skills（いずれもhttps）。up前処理は各functionに閉じ込める（`fail`・`setup_work_dirs`・`ensure_*`・`build_append_flags`）。
- 追加system promptは `shared/pi/append-system.list` 管理（JSONでなく行指向なのはhost shにparser保証がないため）。AGENTS.md bindは単一機構化のため廃止。再検証時はurandom変数化nonce＋事前leak check＋no-tools指示（permission-reviewログ汚染のため）。
- READMEは利用者視点・薄く保つ（無くても動く設定・開発者都合は載せない）。恒常docsに前作の話は入れない。恒常docsの想定読者＝将来のメタエージェント（AIは記憶を持たない、人間は1か月で忘れる前提で書く）。恒常docsは箇条書き・表で構造的に書く。
- 4層：C。コマンド名 `run-agent` 維持。env省略形不採用。
- pre-commit bake判断：本体はsharedイメージにbake、hook環境はhost bindで永続化。使わないprojectでは不活性（コストはサイズのみ）。版指定はrunner／hook revの2層で、hook revはrepo側config＋版ごと分離のため混ざらない。残リスク＝runner破壊的変更時はmeta側でpin上げ（全env一斉影響は単一正本の代償）。
- UID/GID合わせ（目的＝host bindの所有権合わせ。詳細はMEMORYのみに置きスクリプト側にコメントを残さない）：hostの `id -u/-g` を `run-agent` がexport→compose `build.args`→Dockerfile `ARG`（`environment` 渡しはARGに届かないため廃止）。衝突は `groupadd/useradd -o`（重複許可）で回避（node系baseのnodeユーザー1000:1000対策。権限判定は数値のため重複無害、副作用＝ls表示がnodeになる）。UID変更時は `run-agent --build` で再build。
- github host差吸収（originがhost毎にp.github.com/github.comで異なる＋containerからの到達性もhost毎に異なる。共有composeに方向固定は置けない）：`run-agent` の `ensure_container_git_access` がup後にcontainer内から実測し、届く方へcontainer-globalの `insteadOf` で読替える（host側の `.git/config` は不変）。手順＝rawURL取得（`config --get`。rewrite済み表示の `remote get-url` は使わない）→originのまま `ls-remote`（fast path）→不通ならhost入替URLをprobe→通れば `--replace-all` で書込み。両方不通でもfailしない（警告のみ）。検証＝当hostで全行程を手動再現し `ls-remote`・`fetch/push --dry-run` 成功。残件＝他host（特にcontainerがp必須のhost）での実機確認。

## 未実施（決定済み・検証残件）

- pushのask実動作未確認。
- OAuthフロー・鍵writable化の実害は新host手順で検証。
- pi-subagentsは次回起動で動作確認。
- pre-commit-cache bind（`${HOME}/.agent-runtimes/pre-commit-cache`→`/home/agent/.cache/pre-commit`）は次回再作成時から有効。
- UID/GID合わせの実機build検証（`run-agent --build`＋重複IDのls表示確認）はスキップ中。

## 未決

- 恒常docsの置き場・規約。CI・sessions横断読みは凍結。
- pi起動時間（真因特定・対策実施済み・検証残件）：コールド25〜28秒の真因はjiti変換キャッシュ（`/tmp/jiti`、ephemeral）の再transpile。piは拡張をjiti経由で読み込み、初回はtranspileし直す（pi-lens約15秒＋他3件約8秒）。実証＝同梱環境で `/tmp/jiti` 退避→15.5秒（user CPU 20秒）再現、復帰→1.3秒。host `time` のuser+sysはdocker外側の値でコンテナ内CPUを表さない（誤読注意）。対策＝`~/.agent-runtimes/jiti-cache`→`/tmp/jiti` のhost bind（`ensure_jiti_cache_dir`＋compose各1件）。`~/.pi-lens` bindはnpm取得分の永続化として維持（probe hit確認済み）。`PI_LENS_DISABLE_TOOL_INSTALL` passthroughは無効のため除去。検証＝コールド2回連続の `time ... --help` で26.2秒→3.8秒を確認し2件ともコミット済み（`e3d7b2e`・`edd00ef`）。
- 要観察：初回起動時の `No such container` 一過性エラー。
- 拡張台帳：導入＝web-access・permission-system・pi-lens・tasks-footer自作・pi-subagents。見送り＝pi-formatter系・web-ui・plan-mode・permission代替・diff viewer。
