---
title: "TryHackMe「Metasploit: Meterpreter」学習ノート"
emoji: "🕹️"
type: "tech"
topics: ["metasploit", "tryhackme", "security", "meterpreter", "beginner"]
published: true
---

## この記事について

TryHackMe の「Metasploit: Meterpreter」というルームで学んだ内容を、Task 単位でまとめたノートです。Cyber Security 101 の「Exploitation Basics」モジュールにあり、前ルーム「Metasploit: Exploitation」の最後で少しだけ顔を出した「侵入後（post-exploitation）」のフェーズを、Meterpreter という 1 つのペイロードに絞って掘り下げる構成でした。

課題の設問・答え・フラグはここには載せていません。各 Task で出てきた用語と、演習で手を動かして分かったことを、自分の理解として整理したものです。攻撃手順の再現ではなく、道具が何をしているのか、そして途中で 2 回ほど詰まった箇所の記録が中心になります。

近年の脅威レポートでは、実行ファイルをディスクに置かない「ファイルレス（fileless）」型の攻撃が定番の手口として繰り返し取り上げられています。Meterpreter はその考え方をそのまま形にしたようなペイロードで、メモリ上だけで動く・既存のプロセスに紛れる・通信は暗号化する、の三点で「素朴なファイルスキャンには引っかかりにくい」状態を作ります。学習用の題材として、その仕組みを一段ずつ確認できるルームでした。

## Task 1: Meterpreter とは

Meterpreter は Metasploit のペイロードの一種です。侵入したホスト上でエージェントとして動き、攻撃側のコンソールと暗号化した通信をやり取りします。一番の特徴は「ディスクに自分のファイルを書かない」ことです。`meterpreter.exe` のような実体ファイルは作られず、既存プロセスのメモリ上で動くため、新規ファイルを対象にするタイプのアンチウイルススキャンには捕まりにくい、という説明でした。

教材では、実際にセッションを取った状態で `getpid`（自分のプロセス ID を表示）と `ps`（プロセス一覧）を打つ例が示されます。`getpid` で分かった ID を `ps` の一覧で探しても、そこに並んでいるのは `spoolsv.exe` のような正規のプロセス名で、`meterpreter.exe` という行はどこにもありません。Meterpreter が独立したプロセスではなく、別のプロセスの中に入り込んで動いているからです。通信も TLS で暗号化されるので、中身を復号して検査していないネットワーク監視装置からは、ただの暗号化通信にしか見えません。

ただし教材自身が「主要なアンチウイルスや EDR は Meterpreter を検知する」とはっきり書いています。「完全にステルス」ではなく「ファイルベースの素朴なスキャンはすり抜けやすい」くらいが正確な理解だと受け取りました。

**学んだこと**

ステルス性の話は、後の Task で出てくる「プロセスへの注入」「プロセスマイグレーション」の前提になっています。「Meterpreter はどこかのプロセスに間借りして動く」というイメージを最初に持っておくと、`ps` の読み方も、Task 4 の `migrate` の意味も飲み込みやすくなりました。

**関連キーワード**

| キーワード（英語） | 説明 |
| --- | --- |
| payload | エクスプロイト成功後にターゲット上で動くコード。Meterpreter はその一種 |
| in-memory / fileless | ディスクにファイルを書かず、メモリ上だけで動作する手法 |
| C2 (command and control) | 攻撃者が侵入先のエージェントへ指令を送り、結果を受け取る仕組み |
| getpid / ps | 自分のプロセス ID を確認する / プロセス一覧を見る Meterpreter コマンド |
| EDR (Endpoint Detection and Response) | 端末上の挙動を監視・記録し、メモリ常駐型の攻撃も検知しようとする防御製品 |

## Task 2: Meterpreter の種類（flavors）

Meterpreter には「どの言語・OS 向けにビルドされ、どう通信するか」で分かれた多くのバリエーションがあります。教材では `msfvenom --list payloads | grep meterpreter` で一覧する方法が示されます。

整理の軸は 2 つでした。1 つ目は staged か stageless（inline）か。ペイロード名の区切りが `windows/x64/meterpreter/reverse_tcp` のようにスラッシュなら staged で、最初に小さな stager だけを送り込み、本体は後から取得します。`windows/x64/meterpreter_reverse_tcp` のようにアンダースコアでつながっていれば stageless で、本体を一度に送ります。2 つ目は通信方式（transport）で、`reverse_tcp`（ターゲットから攻撃者へ接続を張り返す）、`bind_tcp`（ターゲットが待ち受けて攻撃者から接続する）、`reverse_http` / `reverse_https`（通信を HTTP(S) に見せかける）などがあります。

どれを選ぶかは、ターゲットの OS、使える部品（Python が入っているか、PHP サイトかなど）、張れる通信経路の 3 つでおおむね決まる、という整理でした。エクスプロイトモジュール経由の場合は既定ペイロードが決まっていて、`show payloads` で互換のあるものを一覧し、`set payload` で差し替えます。

**学んだこと**

ペイロード名の `/` と `_` の 1 文字違いが staged / stageless の違いを表している、というのは知らないと読み飛ばしてしまう情報でした。Task 5 の演習でこの「既定ペイロード」に足をすくわれることになるので（後述）、モジュールが何を勝手に選んでいるのかを `show options` で確認する癖は大事だと感じました。

**関連キーワード**

| キーワード（英語） | 説明 |
| --- | --- |
| staged / stageless | stager + 本体の 2 段階か、本体を 1 回で送るか。名前の区切りが `/` か `_` かで見分ける |
| stager | staged ペイロードの第 1 段。攻撃者へ接続し残りを取得する小さなコード |
| reverse / bind | 接続をターゲットから張り返すか、ターゲットが待ち受けるか |
| reverse_http(s) | C2 通信を HTTP(S) に見せかける transport。外向き 80/443 のみ許可された環境で有効 |
| Mettle | Linux・組み込み機器向けに再実装された軽量 Meterpreter |

## Task 3: Meterpreter のコマンド

セッションを取ったら、まず `help` を打つ、というのがこの Task の要点でした。Meterpreter はバージョンによって使えるコマンドが違うので、毎回 `help` で確認するのが確実です。

コマンドはカテゴリ別に並びます。Core（`background` / `sessions` / `migrate` / `load` / `run` など）、File system（`ls` / `cd` / `cat` / `download` / `upload` / `search`）、Networking（`ifconfig` / `arp` / `netstat` / `portfwd` / `route`）、System（`getuid` / `getpid` / `sysinfo` / `ps` / `shell` / `getsystem` / `hashdump`）といった具合です。ほかにキーロガー系（`keyscan_start` / `keyscan_dump`）、スクリーンショットやマイク録音、痕跡消去系（`clearev` / `timestomp`）もありますが、ターゲットに実機デスクトップがなければ動かないものも多い、と注意書きがありました。

これらはすべて Meterpreter の組み込み機能で、ターゲットに新しい実行ファイルを置かずに動きます。Task 1 のステルス性の話とつながっています。

**学んだこと**

Task 3 はコマンドのカタログなので、丸暗記ではなく「どのカテゴリに何があるか」を押さえる回だと割り切りました。`rm` / `kill` / `reboot` / `shutdown` / `clearev` のような、ターゲットのサービスやログを壊すコマンドが同じ一覧に混ざっている、という点は意識しておこうと思います。

**関連キーワード**

| キーワード（英語） | 説明 |
| --- | --- |
| help（Meterpreter） | 現在のセッションで使える全コマンドをカテゴリ別に表示する |
| load | Kiwi・Python・Incognito などの拡張機能を実行中に追加する |
| portfwd / route | ローカルポート転送とルーティング操作。多段侵入（ピボット）に使う |
| getsystem | トークン偽装などで SYSTEM への昇格を試みる |
| clearev / timestomp | イベントログ消去 / タイムスタンプ改ざん。使用は関与のルールに従う |

## Task 4: Meterpreter での侵入後

侵入直後にやることを流れで見せてくれる Task です。

まず現状把握です。`getuid` で自分がどのユーザーか（`NT AUTHORITY\SYSTEM` なら既に高権限、一般ユーザーなら昇格が必要）、`sysinfo` で OS・ビルド・アーキテクチャ、`ps` で動いているプロセスとその所有者・PID を確認します。次に `migrate <PID>` で Meterpreter を別プロセスの中へ移します。狙いは 3 つあって、（1）エクスプロイトで乗っ取った最初のプロセスは落ちやすいので長生きする正規プロセスへ移って安定させる、（2）「あって当然」のプロセス名に紛れる、（3）`notepad.exe` などに移ってそのウィンドウへのキー入力を拾う、といった機能目的です。ただし SYSTEM から一般ユーザーのプロセスへ移ると権限が下がり、戻せなくなることがあるので、移動先の所有者を `ps` で必ず確認する、という警告つきでした。

そのあとは `hashdump` で SAM のパスワードハッシュを取る（SYSTEM 権限が前提）、`search` で気になるファイルを探す、`shell` で通常の `cmd.exe` に降りる、という流れです。`shell` から Meterpreter に戻るときは CTRL+Z で、`exit` はシェルごと終了、`background` は Meterpreter セッション自体を裏に回す操作なので、この 3 つは意味が違う、と整理されていました。

**学んだこと**

「場当たりでコマンドを打つのではなく、現状把握 → migrate → 権限昇格や資格情報 → 探索、という順で動く」という枠組みが、この Task で言語化できました。`hashdump` の出力形式が `ユーザー名:RID:LMハッシュ:NTハッシュ:::` であること、`aad3b435b51404eeaad3b435b51404ee` が「LM ハッシュ無効」の定番値であることも、次の演習でハッシュ列を読むときに役立ちました。

**関連キーワード**

| キーワード（英語） | 説明 |
| --- | --- |
| post-exploitation | 侵入後に行う情報収集・権限昇格・横展開・永続化などのフェーズ |
| process migration | Meterpreter を別プロセスのメモリへ移す操作。安定化・偽装・機能目的 |
| hashdump / SAM | Windows のローカルユーザーのパスワードハッシュを格納するデータベースをダンプする |
| NTLM hash / Pass-the-Hash | Windows の認証に使うハッシュ形式 / 平文を知らなくてもハッシュだけで他ホストへ認証する横展開手法 |
| shell / CTRL+Z / background | 通常シェルへ降りる / シェルを残して戻る / セッションを裏へ回す。3 つは別物 |

## Task 5: 演習（Post-Exploitation Challenge）

ここまでの総合演習です。部屋があらかじめ資格情報とモジュール名（`exploit/windows/smb/psexec`）を提示してくれるので、「脆弱性を突く」のではなく「正規の資格情報 + SMB でサービスを作ってコード実行する」タイプの初期アクセスを体験します。セッションを取ったら `sysinfo` でホスト情報、`shell` から `net share` で共有フォルダ（既定共有の `ADMIN$` `C$` `IPC$` `NETLOGON` `SYSVOL` 以外に、人が作ったものが混ざっていないか）、`hashdump` で資格情報、`search -f <名前>` と `cat` でファイルの場所と中身、と設問に応じて道具を選んでいきます。

この演習では 2 回詰まりました。

1 つ目は `hashdump` が `priv_passwd_get_sam_hashes: Operation failed: Incorrect function.` で失敗したことです。`getuid` は SYSTEM なのにおかしい、と思って `sysinfo` を見ると、`Architecture` は `x64` なのに `Meterpreter` の行が `x86/windows` になっていました。`psexec` の既定ペイロードが 32bit で、侵入先が 32bit の `powershell.exe`（`SysWOW64` 配下）だったため、Meterpreter が 32bit プロセス上で動いていたのが原因です。32bit プロセスからは 64bit 側の SAM を読む処理が通りません。対処は `ps` で `Arch` が `x64` かつ SYSTEM で動いているプロセス（`winlogon.exe` など）を選び、`migrate <PID>` でそこへ移ることでした。移った瞬間に Meterpreter 自身が x64 になり、`hashdump` が通りました。`use` の直後に `set payload windows/x64/meterpreter/reverse_tcp` を明示していれば起きなかった、というのが教訓です。

2 つ目は、`search` で見つけたファイルを `cat` に渡したら「ファイルが見つからない」と言われたことです。パスにスペースが含まれていて、引用符で囲まなかったために最初のスペースでパスが切れ、途中までを名前とみなして探しに行っていました。パスを `"..."` で囲むか、`cd` でそのフォルダに入ってからファイル名だけ渡せば読めます。

取得したハッシュから平文パスワードを求める設問もありました。ハッシュは元に戻す計算はできませんが、よく使われるパスワードの一覧（`rockyou.txt`）を 1 つずつ同じ方式でハッシュ化して一致を探す、という総当たりは可能です。これは攻撃側マシン上のオフライン処理で、NTLM なら hashcat のモード 1000（`hashcat -m 1000`）を使います。弱いパスワードなら一瞬で解けました。教材では `load kiwi`（mimikatz 相当）で `creds_all` や `lsa_dump_sam` を使い、メモリや SAM から資格情報をまとめて取る方法にも触れています（いずれも SYSTEM 権限が前提）。

**学んだこと**

一番刺さったのは「SYSTEM 権限を取っても、Meterpreter プロセスのビット数が OS と合っていないと一部機能が失敗する」ことです。権限（誰として動いているか）だけでなく、居場所（どのプロセスに間借りしているか）まで見る必要がある、と分かりました。エラーメッセージが「権限不足」ではなく「Incorrect function」という、一見関係なさそうな文言だったのも印象に残りました。詰まったときは `sysinfo` の `Meterpreter :` 行と、`ps` の `Arch` 列をまず確認する、と決めました。

**関連キーワード**

| キーワード（英語） | 説明 |
| --- | --- |
| exploit/windows/smb/psexec | 有効な資格情報を使い SMB 経由でサービスを作成しコード実行する Metasploit モジュール |
| WOW64 | 64bit Windows が 32bit プログラムを動かす互換層。`SysWOW64` 配下に 32bit 版が置かれる |
| set payload | 選択中のモジュールのペイロードを差し替える msfconsole コマンド |
| smart_hashdump | 権限とアーキを見て適切な方法で SAM の取得を試みる post モジュール |
| hashcat -m 1000 | hashcat で NTLM ハッシュ（モード 1000）をクラックする指定 |
| load kiwi / creds_all | Meterpreter に mimikatz 相当の機能を読み込み、資格情報をまとめて取得しようとする |
| net share | ローカルで公開されている共有フォルダを一覧する Windows コマンド |

## おわりに

前ルームで「侵入後フェーズは次で掘り下げる」と予告されていたとおり、Meterpreter 1 本に絞って post-exploitation をなぞるルームでした。コマンドのカタログ（Task 3）と流れの説明（Task 4）を経て、Task 5 の演習で実際に手を動かすと、教材どおりに進まない箇所が出てきます。

私にとっての山は Task 5 の 1 つ目の詰まりでした。SYSTEM 権限は取れているのに `hashdump` が失敗し、原因が「プロセスのビット数」という、権限とは別の軸にあったのが新鮮でした。Meterpreter は他のプロセスに間借りして動くので、その間借り先の性質（名前・権限・32/64bit）をそのまま引き継ぐ、という Task 1 で学んだイメージが、ここで具体的なトラブルとしてつながりました。次はこの `migrate` や `load kiwi` を、別のルームでもう一度使ってみようと思います。
