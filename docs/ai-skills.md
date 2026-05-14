# AI Skills

このプロジェクトでは、Codex に繰り返し頼む作業を `.agents/skills/` に skill としてまとめています。

skill は「毎回同じ観点で確認したい作業」を呼び出すためのメモです。恒常的な開発方針は `AGENTS.md` に置き、特定の作業手順だけを skill にします。

## 使い方

Codex に依頼するとき、skill 名を含めて伝えます。

例:

```text
github-pages-deploy-check で公開前チェックして
```

```text
ui-layout-design を使って、動画プレイヤーを小さくしない配置を考えて
```

```text
skill-definition を使って、新しい skill にするべきか整理して
```

skill 名を明示しなくても、依頼内容が skill の説明に合っている場合は Codex が自動で使います。迷う場合は、明示して依頼するのが確実です。

## 現在の skills

### github-pages-deploy-check

GitHub Pages 公開前後の確認に使います。

主に次を確認します。

- `vite.config.ts` の `base` が `/mk-stamper/` になっているか
- `public/` 配下のファイルを `/songlist.tsv` のようなルート絶対パスで読んでいないか
- 静的ファイルの `fetch()` に `import.meta.env.BASE_URL` を使っているか
- `.github/workflows/deploy.yml` が `app/` を build して `app/dist` を deploy しているか
- `npm run build` が通るか
- `dist` 内の asset path が `/mk-stamper/` 始まりになっているか

使うタイミング:

- GitHub Pages に公開する前
- push 前に公開事故を避けたいとき
- 公開後に JS / CSS / 画像 / favicon / TSV が読み込めないとき
- `vite.config.ts`、`public/`、`fetch()`、deploy workflow を触った後

依頼例:

```text
github-pages-deploy-check で公開前チェックして。問題なければ commit までお願い。push は自分でやる
```

### ui-layout-design

UI レイアウトの設計・改善に使います。

mk-stamper では YouTube プレイヤーを最優先にし、入力欄やボタンをコンパクトにまとめるための配置方針を考えます。

使うタイミング:

- 動画プレイヤーをもっと大きくしたい
- 余白を減らしたい
- 入力欄や操作ボタンを整理したい
- レスポンシブ時の配置を見直したい

依頼例:

```text
ui-layout-design で、動画領域を圧迫しないフォーム配置を考えて
```

### skill-definition

新しい skill を作るかどうか、作るならどんな責務にするかを整理するときに使います。

使うタイミング:

- 同じ指示を何度も書いている
- 判断基準がブレる作業がある
- 新しい skill 名や責務を決めたい

依頼例:

```text
skill-definition を使って、この作業を skill 化するべきか整理して
```

### skill-design-review

既存 skill の設計を見直すときに使います。

使うタイミング:

- skill の説明が長くなった
- 使いどころが分かりにくい
- 他の skill と責務が重なっている
- 固定ルールと毎回の個別指示が混ざっている

依頼例:

```text
skill-design-review で github-pages-deploy-check の内容を見直して
```

## 追加・更新の目安

skill を増やすのは、次のどれかに当てはまるときにします。

- 同じ指示を2回以上書いた
- チェック観点を固定したい
- 作業手順として再利用できる
- AGENTS.md に置くほど恒常的な方針ではない

逆に、一度きりの作業や通常の実装方針は skill にしません。
