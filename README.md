# 履歴書 A3 作成アプリ v2.8.4

## v2.8.4 — sửa footer luôn hiển thị

- Khôi phục bắt buộc toàn bộ nội dung `記入上の注意` trong DOM khi ứng dụng khởi động.
- Dành riêng 11 mm ở cuối cột trái cho footer, không phụ thuộc số dòng lịch sử.
- Hiển thị đủ 3 dòng trong preview, bản in và PDF chia sẻ.
- Sửa kiểm tra bản vá để không hoàn tác nhầm do chuỗi dấu ngoặc kép.

## v2.5.4 — giữ nguyên dòng hướng dẫn ở footer

- Giữ đầy đủ nội dung `記入上の注意` trong preview, bản in và PDF chia sẻ.
- Chia nội dung thành 3 dòng cố định để không bị cắt hoặc tràn khỏi tờ A3.
- Dành riêng 10 mm cho footer và tự giảm phần bảng học vấn/công việc khi cần.
- Ép hiển thị footer trong bản sao mà `html2canvas` dùng để tạo PDF.
- Đồng bộ cache CSS, JavaScript và Service Worker sang v2.5.4.


## v2.5.4 — giao diện 4 ngôn ngữ

- Chuyển giao diện thao tác giữa Tiếng Việt, 日本語, English và नेपाली.
- Ghi nhớ ngôn ngữ đã chọn trên thiết bị.
- Giữ nguyên nội dung mẫu 履歴書 bằng tiếng Nhật khi xem trước và in PDF.
- Dịch nút, nhãn, hướng dẫn, placeholder, hộp thoại và phần lớn thông báo động.
- Trên điện thoại, bộ chọn ngôn ngữ nằm ngay trên thanh công cụ.


A3横1枚の日本式履歴書を作成・保存・印刷・PDF共有できるPWAです。

## v2.3.4

- Tên furigana/hiragana được căn giữa bắt buộc trong ô tên.
- Tăng khoảng trắng giữa các bảng độc lập để nhìn rõ trên preview và bản in.
- Đổi query cache của CSS/JS sang v2.3.4 để trình duyệt không giữ giao diện cũ.


- A3用紙全体を画面の幅と高さの両方に合わせて中央表示
- 印刷余白：上19mm、下19mm、左18mm、右18mmを用紙内に正確に配置
- 学歴・職歴と資格・免許を同一の行高で表示
- 学歴・職歴の左右行数、資格・免許の行数を選択可能
- 入学、卒業、修了、中途退学、入社、退社、現在に至る等の定型語
- 通勤時間、扶養家族数のラベルを固定
- 固定項目を残したまま「その他のスキル」等の追加テーブルを最大3個作成可能
- 志望動機と本人希望記入欄の正式見出しを固定
- スマートフォンは入力画面を優先し、最後にA3プレビューへ切替
- 写真の拡大・縮小、移動、回転、切り抜き
- JSONバックアップ、PDF保存、PDF共有、印刷

## ローカル起動

`START_LOCAL.bat` を実行するか、プロジェクトフォルダで次を実行します。

```cmd
py -m http.server 5500
```

ブラウザ：`http://localhost:5500/?v=2.3.1`

## 印刷設定

- 用紙：A3
- 向き：横
- 倍率：100%
- ブラウザ余白：なし
- ヘッダーとフッター：オフ

アプリが用紙内の余白を管理します。


## v2.3.4 郵便番号から住所自動入力

- 郵便番号7桁を入力すると住所（漢字）とふりがな（ひらがな）を検索して反映します。
- 同一郵便番号に複数候補がある場合は候補リストから選択できます。
- 番地・建物名は検索後に追記できます。
- ネットワーク未接続時は従来どおり手入力できます。


## v2.5.4 — sửa lỗi tainted canvas khi tạo PDF

- Thay cơ chế SVG `foreignObject` bằng html2canvas ở chế độ an toàn.
- Không cho ảnh khác nguồn làm bẩn canvas (`allowTaint: false`).
- Ảnh thẻ dạng dữ liệu cục bộ vẫn được đưa vào PDF.
- Tự thử CDN dự phòng khi thư viện PDF chưa tải được.
- PDF vẫn được tạo và chia sẻ trực tiếp trên thiết bị, không tải lên Supabase.

## PDF保存・共有（v2.5.4）

「PDF共有」を押すと、PDFを外部サーバーやSupabaseへアップロードせず、端末内でA3 PDFを生成します。

- スマートフォン：PDFのダウンロード保存を開始し、対応端末ではPDFファイルを直接OSの共有画面へ渡します。
- パソコン：PDFをDownloadsへ保存し、対応環境ではファイル共有画面を開きます。
- 共有機能に未対応の場合：Downloadsまたはファイルアプリから保存済みPDFを選び、メールやメッセージへ添付します。

クラウドリンクは作成しないため、相手にはURLではなくPDFファイルそのものを送信します。ブラウザやOSの仕様により、保存先の最終選択が必要になる場合があります。

## v2.5.4 — chia sẻ theo thiết bị

- Máy tính: tự tải PDF xuống thư mục Downloads; nếu trình duyệt hỗ trợ thì mở chia sẻ file, nếu không thì mở bản xem tạm trên chính máy. Link `blob:` chỉ dùng trong máy/trình duyệt hiện tại và không thể gửi cho người khác.
- Điện thoại: tạo PDF ngay trên máy, bắt đầu lưu xuống thiết bị và mở bảng chia sẻ file PDF trực tiếp.


## v2.8.4
- Added a combined total row-count control for education/work history.
- Left and right row counts rebalance automatically while keeping the table format and official footer intact.

## v2.8.4
- Khôi phục bố cục 履歴書 cân đối theo khung chuẩn.
- Duy trì tối thiểu 14 dòng bên trái, 6 dòng bên phải và 5 dòng bằng cấp để bảng không bị quá ngắn hoặc méo.
- Giữ nguyên hai ô cố định 通勤時間 và 扶養家族数（配偶者を除く） với chiều rộng 43 mm và chiều cao cân đối.
- Giới hạn chiều cao phần 志望動機 để hai ô cố định không bị kéo quá lớn.
- Vẫn ưu tiên nội dung học vấn/công việc ở bên trái trước rồi mới tiếp tục sang bên phải.


## v2.8.4
- Mobile header reappears 3 seconds after scrolling stops.
- Installation guide includes a one-tap copy-link button for opening the PWA in Chrome or Safari.


## v2.8.4
- Email input is displayed on its own full-width row beneath the phone number.
- Mobile header no longer auto-hides or auto-reappears.
- A manual Open/Close menu button controls the mobile header.
- Header and form use separate flex regions, so the header does not cover focused inputs.
- Editor and preview keep independent scroll positions inside stable scroll containers.
