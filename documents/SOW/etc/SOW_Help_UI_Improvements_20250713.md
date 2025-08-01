---
title: "ウディこん助ヘルプ内容更新とUI改善"
status: "Todo"
priority: "High"
assignee: "Claude"
reviewer: "ぴけ"
estimated_hours: 3
actual_hours: null
date: "2025-07-13"
version: "1.0"
---

# SOW: ウディこん助ヘルプ内容更新とUI改善

## 1. プロジェクト概要

### 1.1 背景
ウディこん助Chrome拡張機能の現状機能に合わせたヘルプ内容の更新と、データ管理における重要な注意事項の追加、および利便性向上のためのリンク追加が必要。

### 1.2 目的
- ヘルプ画面の内容を実装済み機能に合わせて正確に更新
- データ消失リスクに対するユーザー保護強化
- 紹介ページと拡張機能間の連携改善
- 開発者連絡先の明示によるサポート向上

## 2. スコープ

### 2.1 対象範囲
- ウディこん助Chrome拡張機能のヘルプ画面（help.html）
- 紹介ページ（website/release/index.html）
- 関連CSSスタイル

### 2.2 対象外
- 既存の基本機能の変更
- 新機能の追加実装

## 3. 要件定義

### 3.1 機能要件

#### 3.1.1 ヘルプ内容更新
- **現状機能に合わせた説明文の修正**
  - 実用的自動監視システムの説明追加
  - 6カテゴリ評価システムの詳細説明
  - 感想メモ機能の説明更新
  - 手動監視機能の説明更新

#### 3.1.2 データ管理注意事項追加
- **キャッシュクリア時のデータ消失警告**
  - 明確な警告文の追加
  - データバックアップの重要性説明
  - エクスポート機能の推奨利用案内

#### 3.1.3 紹介ページリンク追加
- **ヘルプ画面末尾にリンク設置**
  - URL: https://wudi-consuke.vercel.app/website/release/index.html
  - 適切なlink text設定
  - 新しいタブで開く設定

#### 3.1.4 連絡先情報追加
- **紹介ページフッターに開発者連絡先追加**
  - X ID（旧Twitter）: @act_pike
  - 適切なスタイリング適用

### 3.2 非機能要件

#### 3.2.1 デザイン要件
- 既存のデザインシステムとの一貫性維持
- レスポンシブデザイン対応
- 視認性とアクセシビリティの確保

#### 3.2.2 パフォーマンス要件
- ページ読み込み速度への影響最小化
- 外部リンクの適切な処理

## 4. 実装仕様

### 4.1 ヘルプ画面更新

#### 4.1.1 更新対象セクション
1. **メイン機能説明**
   - 自動監視システムの動作説明
   - 評価システムの詳細

2. **データ管理セクション**
   - 既存説明の保持
   - キャッシュクリア警告の追加
   - バックアップ推奨の明記

3. **末尾リンクセクション**
   - 紹介ページへの誘導
   - 視覚的に目立つ配置

#### 4.1.2 警告文言仕様
```
⚠️ 重要：データ保護について
ブラウザのキャッシュクリアや拡張機能の再インストール時に、
保存された評価・感想データが消失する可能性があります。
定期的なデータエクスポートを強く推奨します。
```

### 4.2 紹介ページ更新

#### 4.2.1 連絡先セクション追加
- フッター内に開発者情報セクション追加
- X（旧Twitter）アカウントへのリンク
- 適切なrel属性とtarget="_blank"設定

## 5. 受入条件

### 5.1 必須条件
- [ ] ヘルプ内容が現状機能と一致している
- [ ] データ消失警告が明確に表示される
- [ ] 紹介ページリンクが正常に動作する
- [ ] 連絡先情報が適切に表示される
- [ ] 既存デザインとの一貫性が保たれている

### 5.2 品質条件
- [ ] 全てのリンクが正常に動作する
- [ ] モバイル端末での表示が適切である
- [ ] アクセシビリティガイドラインに準拠している

## 6. 想定リスク

### 6.1 技術リスク
- **リスク**: 既存レイアウトの崩れ
- **対策**: 段階的実装とテスト実施

### 6.2 ユーザビリティリスク
- **リスク**: 警告文による操作への不安増大
- **対策**: 適切な説明と解決策の併記

## 7. 成果物

### 7.1 更新ファイル
- `wodicon_helper/help.html` - ヘルプ画面
- `website/release/index.html` - 紹介ページ
- `website/release/css/styles.css` - スタイル更新（必要に応じて）

### 7.2 ドキュメント
- 本SOW
- 更新内容の記録

## 8. スケジュール

### 8.1 想定工程
1. **要件確認**: 30分
2. **ヘルプ内容更新**: 1時間
3. **紹介ページ更新**: 30分
4. **テスト・調整**: 1時間

### 8.2 完了予定
2025年7月13日中の完了を想定

## 9. 承認

- **作成者**: Claude
- **レビュー担当**: ぴけ
- **承認待ち**: 要承認