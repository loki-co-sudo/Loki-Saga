---
title: "TryHackMe「Windows Fundamentals 3」学習ノート"
emoji: "🪟"
type: "tech"
topics: ["windows", "tryhackme", "security", "activedirectory", "beginner"]
published: false
---

## この記事について

TryHackMeの「Windows Fundamentals 3」というルームで学んだ内容を、Task単位でまとめたノートです。Windows Fundamentals 1・2に続く座学系ルームで、今回はWindows OSに標準搭載されているセキュリティ機能――Windows Update、Windows Security(Virus & threat protection、Firewall & network protection、App & browser control、Device security)、BitLocker、Volume Shadow Copy Service(VSS)――を扱っています。

課題の設問や答え(flag)はここには含めていません。あくまで各Taskで学んだ考え方・仕組みを、自分の理解として整理したものです。

## Task 1: Introduction

Windows Fundamentals 1・2では、デスクトップ操作やファイルシステム、System ConfigurationやComputer Managementといった管理系ツールを扱いました。Part 3では、Windows OSに組み込まれているセキュリティ機能の概要を扱います。

このTaskでは、リモートデスクトップ(Remote Desktop、RDP)経由でラボマシン(学習用の仮想マシン)に接続し、環境をセットアップします。

## Task 2: Windows Updates

Windows Updateは、OS本体だけでなくMicrosoft Defenderなど他のMicrosoft製品にもセキュリティ更新・機能強化・パッチを配信するサービスです。更新は通常、毎月第2火曜日(Patch Tuesday)にリリースされますが、緊急性の高い更新は定例日を待たずに配信されます。

Windows Updateは「設定」から、あるいは`control /name Microsoft.WindowsUpdate`コマンドからもアクセスできます。付属のVMではWindows Updateの設定が「管理されています」という表示になっていますが、これは企業や学習環境でグループポリシーなどにより制御されている場合に出るメッセージで、家庭用PCでは通常見かけません。

Windows 10以降、更新は延期はできても無視できなくなりました。ユーザーの利便性よりも「端末を最新かつ安全な状態に保つ」というセキュリティを優先した設計判断です。

**学んだこと**

「定義更新プログラム(definition updates)」は、Microsoft Defenderが使うウイルス・マルウェアの検出パターンの更新のことで、後のVirus & threat protectionのTaskともつながる内容でした。攻撃者はしばしば「まだパッチが適用されていない既知の脆弱性」を狙うため、Windows Updateの仕組みを理解することはセキュリティの基本だと感じました。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Windows Update | Windows OSおよび関連製品への更新配信サービス |
| Patch Tuesday | 毎月第2火曜日に定例のセキュリティ更新がリリースされる日の通称 |
| Microsoft Defender | Windows標準搭載のウイルス対策・マルウェア対策ソフト |
| Group Policy(グループポリシー) | Windowsドメイン環境などで複数端末の設定を一括管理する仕組み |

## Task 3: Windows Security

Windows Securityは、Defenderやファイアウォールなど、端末を守るための各種セキュリティ機能をまとめて管理できる画面です。「保護エリア(Protection areas)」として、Virus & threat protection、Firewall & network protection、App & browser control、Device securityの4つに分かれており、以降のTaskではこれらを1つずつ扱っていきます。

ステータスアイコンは緑(十分に保護されている)・黄(推奨事項あり)・赤(要対応)の3色で表され、この色分けはWindowsに限らず多くのセキュリティ製品で採用されている共通の考え方です。

**学んだこと**

演習VMはWindows Server 2019というサーバー用エディションのため、Windows 10/11のHome・Professional版とは画面のレイアウトが少し異なります。同じWindowsでも、用途によってエディションが分かれている、という基礎知識を押さえておくと、この先サーバー環境を扱うときに戸惑いにくいと感じました。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Windows Security | Windows標準のセキュリティ管理画面 |
| Protection areas(保護エリア) | Windows Securityが管理する4つの区分(Virus & threat protection / Firewall & network protection / App & browser control / Device security) |
| Windows Server 2019 | 企業のサーバー用途向けに設計されたWindowsのエディション |

## Task 4: Virus & threat protection

Virus & threat protectionは「Current threats」と「Virus & threat protection settings」の2部構成になっています。Quick scan / Full scan / Custom scanという3種類のスキャン方式が用意されており、「素早く危なそうな場所だけ見る」「時間をかけて全部見る」「自分で対象を指定する」というトレードオフはウイルス対策ソフト全般に共通する考え方です。

設定側では、Real-time protection(リアルタイム保護)・Cloud-delivered protection・Controlled folder access(コントロールされたフォルダーアクセス)・Exclusions(除外)などを管理できます。

**学んだこと**

Controlled folder accessはランサムウェア対策の要となる機能で、未許可のアプリによる保護対象フォルダーへの書き込みをブロックしてくれます。一方でExclusions(除外設定)は誤検知を減らすための便利な機能である反面、悪用されるとマルウェアの検出回避に使われる可能性もある、という攻守両面の性質があるのが印象的でした。演習VMでリアルタイム保護がオフになっているのは、あくまでインターネット非接続の学習環境だからこそ許される設定で、実際の自分のPCでは絶対にオフにしないよう念押しされている点も学びでした。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Microsoft Defender Antivirus | Windows標準搭載のウイルス対策ソフトウェア |
| Real-time protection(リアルタイム保護) | マルウェアのインストール・実行をリアルタイムで検出・阻止する機能 |
| Controlled folder access | 未許可のアプリによる保護対象フォルダーへの書き込みをブロックする、ランサムウェア対策機能 |
| Exclusions(除外) | スキャン対象から特定のファイル・フォルダーを除外する設定。誤検知の抑制に使われるが悪用リスクもある |

## Task 5: Firewall & network protection

ファイアウォールは、ポート(通信の出入口)を通過する通信を制御し、不正なアクセスを防ぐ仕組みです。「扉の前に立つ警備員」という例えの通り、ネットワークの境界で通信を許可・拒否する役割を持ちます。

Windows Firewallには、Domain(組織のドメインコントローラーに認証できるネットワーク)・Private(自宅などのプライベートネットワーク)・Public(カフェや空港のWi-Fiなど)の3つのプロファイルがあり、接続先ネットワークの信頼度に応じて自動的に切り替わります。ファイアウォールの詳細設定は`WF.msc`コマンドで開けます。

**学んだこと**

3つのプロファイルの使い分けは、「今どんなネットワークに接続しているか」でセキュリティレベルを自動調整する、という考え方がよくできていると感じました。特に見知らぬ人と同じネットワークを共有するPublicプロファイルでは、他の端末からの不正アクセスのリスクが高いため、最も厳しめの設定が適用されます。`WF.msc`のように「◯◯.msc」という形式のコマンドは、Windowsの管理コンソール(MMC)のスナップインを直接起動するもので、GUIをたどらずに目的の画面へ素早くアクセスできるテクニックとして覚えておきたいと思いました。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Firewall(ファイアウォール) | 許可されていない通信をブロックし、ネットワークの出入口を制御するセキュリティ機能 |
| Domain / Private / Public | Windows Firewallの3つのプロファイル。接続先ネットワークの信頼度に応じて自動的に切り替わる |
| Domain Controller(ドメインコントローラー) | Active Directory環境でユーザー認証やポリシー管理を担うサーバー |
| MMC (Microsoft Management Console) | Windowsの各種管理ツール(スナップイン)をまとめて実行するための共通コンソール |

## Task 6: App & browser control

このセクションでは、Microsoft Defender SmartScreenの設定を扱います。SmartScreenは、フィッシングサイトやマルウェアを配布するWebサイト・アプリケーション、悪意のある可能性があるファイルのダウンロードから保護する機能で、Warn(警告)・Block(ブロック)・Off(オフ)の3段階で強度を調整できます。

もう1つ、Exploit protection(エクスプロイト保護)も扱いました。Windows 10(および今回のようなWindows Server 2019)に標準搭載されており、脆弱性を突いた攻撃(エクスプロイト)から端末を保護する機能です。

**学んだこと**

SmartScreenは、ブラウザだけでなくOSレベルでファイル実行時にもチェックが働く、という点がポイントでした。「見たことのないアプリ」を実行しようとすると警告が出るのはこの仕組みによるものです。Exploit protectionはDEPやASLRといったメモリレベルの保護の仕組みをまとめた、より低レイヤーの防御機能で、下手に設定を変えるとかえって不安定になりかねないため、基本的には既定値のまま触らないのが安全、という注意も納得でした。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Microsoft Defender SmartScreen | フィッシング・マルウェア・不審なファイルのダウンロードから保護する機能 |
| Exploit(エクスプロイト) | ソフトウェアの脆弱性を突いて不正な動作を引き起こすコードや攻撃手法 |
| DEP (Data Execution Prevention) | データ専用のメモリ領域でコードが実行されるのを防ぐ保護機能 |
| ASLR (Address Space Layout Randomization) | メモリ上のアドレス配置をランダム化し、攻撃者による攻略を難しくする保護技術 |

## Task 7: Device security

Device securityは、ソフトウェアだけでなくハードウェアレベルの保護に関わる設定をまとめたセクションです。Core isolation(コア分離)のMemory Integrity(メモリ整合性)は、仮想化ベースのセキュリティを使って、OSの重要な処理を他の一般的なプロセスから隔離し、悪意のあるコードの注入(コードインジェクション)を防ぎます。

もう1つの柱がSecurity processor、いわゆるTPM(Trusted Platform Module)です。暗号処理や改ざん検知を専門に行うハードウェアチップで、次のTaskのBitLockerとも深く関わってきます。

**学んだこと**

「ソフトウェアだけでは守り切れない部分を、専用のハードウェアで守る」という発想がこのTaskのテーマだと感じました。演習VMがWindows Server 2019であるため、これらの画像は別のWindows 10端末のものが使われていましたが、それは仮想マシンにはTPMのような物理チップが搭載されていないことが多い、という背景も併せて理解できました。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Core isolation(コア分離) | 仮想化ベースのセキュリティを利用して重要なプロセスを隔離する機能群 |
| Memory Integrity(メモリ整合性) | 高セキュリティなプロセスへの悪意あるコード注入を防ぐ、Core isolationの機能の一つ |
| TPM (Trusted Platform Module) | 暗号鍵の管理や改ざん検知を行うセキュリティ専用のハードウェアチップ |

## Task 8: BitLocker

BitLockerは、ドライブ(ハードディスクやSSD)全体を暗号化するWindows標準の機能です。ノートPCの盗難・紛失時に、ドライブを取り外して別のPCに接続されても、暗号化されているため中のデータを読み取られません。TPMが搭載された端末では、BitLockerは最も強力な保護を提供します。

**学んだこと**

前のTaskで出てきたTPMが、BitLockerの暗号鍵を安全に保管する「金庫」のような役割を果たす、という関係性がわかりました。TPMを搭載していない端末では、代わりにUSBメモリのようなリムーバブルドライブにスタートアップキー(startup key)を保存し、起動のたびに挿す、という運用方法が用意されています。「TPMというハードウェアの代わりを、外部の物理デバイスで代替する」という発想が面白いと思いました。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| BitLocker | Windows標準のドライブ暗号化機能 |
| TPM (Trusted Platform Module) | BitLockerの暗号鍵を安全に保管するハードウェアチップ |
| Removable drive(リムーバブルドライブ) | USBメモリなど、取り外し可能な外部記憶装置。TPM非搭載環境でのBitLocker運用に使われる |

## Task 9: Volume Shadow Copy Service

VSS(Volume Shadow Copy Service)は、ドライブのある時点の状態をシャドウコピー(スナップショット)として保存する仕組みで、Windowsの「システムの復元」機能やファイルの「以前のバージョン」機能を裏側で支えています。

**学んだこと**

このTaskで一番印象的だったのは、ランサムウェアとVSSの関係でした。多くのランサムウェアは、被害者が「バックアップから復元して身代金を払わずに済ませる」ことを防ぐために、暗号化する前にわざとシャドウコピー(復元ポイント)を削除するコードを仕込みます。Windows標準の`vssadmin delete shadows`コマンドが、実際に多くのランサムウェアの攻撃コードで使われることで知られている、というのは初めて知りました。VSSは「復旧の生命線であると同時に、攻撃者に狙われやすい弱点でもある」という、防御側・攻撃側どちらの視点からも重要な機能だと理解しました。オフライン・オフサイトのバックアップがない限り復旧できなくなる、という警告の重みも実感できました。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| VSS (Volume Shadow Copy Service) | ドライブのシャドウコピー(スナップショット)作成を調整するWindowsのサービス |
| Restore point(復元ポイント) | システムをある時点の状態に戻すために保存される情報 |
| vssadmin | シャドウコピーを管理するためのWindows標準コマンドラインツール。ランサムウェアによる悪用でも知られる |
| Ransomware(ランサムウェア) | ファイルを暗号化するなどして身代金を要求するマルウェアの一種 |

## Task 10: Conclusion

このルームでは、Windows OSに標準搭載されているいくつかのセキュリティツールを扱いました。最後のTaskでは、今後さらに学んでいくためのキーワードとして、Antimalware Scan Interface(AMSI)、Credential Guard、Windows Helloなどが紹介されていました。

**学んだこと**

特に印象に残ったのが、Living Off The Land(LotL、環境寄生型攻撃)という概念です。攻撃者が新しく怪しいマルウェアを送り込むのではなく、PowerShellやcertutilといったWindows標準の正規ツールを悪用して攻撃活動を行う手法で、正規のツールを使うぶん検知されにくいという特徴があります。今後CTFやペネトレーションテストを学んでいく中で何度も出会いそうな考え方だと感じ、名前だけでもしっかり覚えておこうと思いました。

Windows Fundamentals 1・2・3を通して、基本操作から管理ツール、そして今回のセキュリティ機能まで一通り触れたことになります。地味に感じる内容も多かったですが、こういう「OSの標準機能を知っている」という土台は、この先セキュリティを学んでいくうえで効いてくる部分だと思います。

**関連キーワード**

| キーワード(英語) | 説明 |
| --- | --- |
| Living Off The Land (LotL) | OS標準の正規ツールを悪用し、検知を逃れながら攻撃を行う手法 |
| Antimalware Scan Interface (AMSI) | スクリプトの実行内容をウイルス対策ソフトにスキャンさせるためのWindowsのインターフェース |
| Credential Guard | 仮想化技術を用いて認証情報を保護するWindowsのセキュリティ機能 |
| Windows Hello | 顔認証や指紋認証などの生体認証、PINを使ったWindowsのサインイン機能 |
