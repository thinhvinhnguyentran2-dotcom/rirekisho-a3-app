(() => {
  'use strict';

  const STORAGE_KEY = 'rirekisho-ui-language-v1';
  const SUPPORTED = ['ja', 'vi', 'en', 'ne'];
  const DEFAULT_LANGUAGE = 'vi';
  const TRANSLATIONS = {"履歴書 A3 作成アプリ":{"vi":"Ứng dụng tạo sơ yếu lý lịch A3","en":"A3 Japanese Resume Builder","ne":"A3 जापानी बायोडाटा बनाउने एप"},"A3横1枚・写真編集・和暦/西暦・PDF保存/共有・オフライン対応":{"vi":"Một trang A3 ngang · chỉnh ảnh · năm Nhật/dương lịch · lưu/chia sẻ PDF · dùng ngoại tuyến","en":"One A3 landscape page · photo editing · Japanese/Western years · PDF save/share · offline","ne":"एउटा A3 तेर्सो पाना · फोटो सम्पादन · जापानी/पश्चिमी वर्ष · PDF सुरक्षित/साझा · अफलाइन"},"保存":{"vi":"Lưu","en":"Save","ne":"सुरक्षित गर्नुहोस्"},"PDF保存":{"vi":"Lưu PDF","en":"Save PDF","ne":"PDF सुरक्षित गर्नुहोस्"},"PDF共有":{"vi":"Chia sẻ PDF","en":"Share PDF","ne":"PDF साझा गर्नुहोस्"},"印刷":{"vi":"In","en":"Print","ne":"प्रिन्ट"},"アプリをインストール":{"vi":"Cài đặt ứng dụng","en":"Install app","ne":"एप स्थापना गर्नुहोस्"},"入力":{"vi":"Nhập liệu","en":"Edit","ne":"फाराम भर्नुहोस्"},"プレビュー":{"vi":"Xem trước","en":"Preview","ne":"पूर्वावलोकन"},"未保存":{"vi":"Chưa lưu","en":"Not saved","ne":"सुरक्षित गरिएको छैन"},"保存済み":{"vi":"Đã lưu","en":"Saved","ne":"सुरक्षित"},"編集中":{"vi":"Đang chỉnh sửa","en":"Editing","ne":"सम्पादन हुँदैछ"},"端末内保存":{"vi":"Lưu trên thiết bị","en":"Saved on device","ne":"उपकरणमा सुरक्षित"},"書類管理":{"vi":"Quản lý hồ sơ","en":"Document management","ne":"कागजात व्यवस्थापन"},"書類名":{"vi":"Tên hồ sơ","en":"Document name","ne":"कागजातको नाम"},"保存済み書類":{"vi":"Hồ sơ đã lưu","en":"Saved documents","ne":"सुरक्षित कागजातहरू"},"新規":{"vi":"Tạo mới","en":"New","ne":"नयाँ"},"開く":{"vi":"Mở","en":"Open","ne":"खोल्नुहोस्"},"複製":{"vi":"Nhân bản","en":"Duplicate","ne":"प्रतिलिपि"},"削除":{"vi":"Xóa","en":"Delete","ne":"मेटाउनुहोस्"},"日付・表示":{"vi":"Ngày tháng và hiển thị","en":"Dates and display","ne":"मिति र प्रदर्शन"},"作成日":{"vi":"Ngày lập hồ sơ","en":"Document date","ne":"तयार मिति"},"生年月日":{"vi":"Ngày sinh","en":"Date of birth","ne":"जन्म मिति"},"年の表示":{"vi":"Cách hiển thị năm","en":"Year format","ne":"वर्षको ढाँचा"},"西暦":{"vi":"Dương lịch","en":"Western year","ne":"इस्वी संवत्"},"和暦":{"vi":"Niên hiệu Nhật","en":"Japanese era","ne":"जापानी युग"},"性別":{"vi":"Giới tính","en":"Gender","ne":"लिङ्ग"},"男":{"vi":"Nam","en":"Male","ne":"पुरुष"},"女":{"vi":"Nữ","en":"Female","ne":"महिला"},"未記入":{"vi":"Không ghi","en":"Blank","ne":"खाली"},"住所・郵便番号自動入力":{"vi":"Địa chỉ và mã bưu điện tự động","en":"Automatic address and postal code","ne":"ठेगाना र हुलाक कोड स्वतः भर्ने"},"郵便番号":{"vi":"Mã bưu điện","en":"Postal code","ne":"हुलाक कोड"},"住所検索":{"vi":"Tìm địa chỉ","en":"Find address","ne":"ठेगाना खोज्नुहोस्"},"7桁を入力すると住所を自動検索します。":{"vi":"Nhập đủ 7 số để tự động tìm địa chỉ.","en":"Enter 7 digits to look up the address automatically.","ne":"७ अङ्क प्रविष्ट गर्दा ठेगाना स्वतः खोजिन्छ।"},"候補を選択":{"vi":"Chọn địa chỉ phù hợp","en":"Select a result","ne":"नतिजा छान्नुहोस्"},"住所（漢字）":{"vi":"Địa chỉ tiếng Nhật (Kanji)","en":"Address (Kanji)","ne":"ठेगाना (कान्जी)"},"ふりがな（ひらがな）":{"vi":"Cách đọc địa chỉ (Hiragana)","en":"Address reading (Hiragana)","ne":"ठेगानाको उच्चारण (हिरागाना)"},"選択候補を再反映":{"vi":"Áp dụng lại địa chỉ đã chọn","en":"Reapply selected result","ne":"छानिएको नतिजा पुनः लागू गर्नुहोस्"},"住所をクリア":{"vi":"Xóa địa chỉ","en":"Clear address","ne":"ठेगाना खाली गर्नुहोस्"},"検索時に送信するのは郵便番号だけです。インターネット未接続時は手入力できます。":{"vi":"Khi tra cứu, chỉ mã bưu điện được gửi đi. Có thể nhập tay khi không có Internet.","en":"Only the postal code is sent during lookup. You can enter the address manually while offline.","ne":"खोज्दा हुलाक कोड मात्र पठाइन्छ। इन्टरनेट नभए हातैले ठेगाना भर्न सकिन्छ।"},"証明写真":{"vi":"Ảnh thẻ","en":"ID photo","ne":"परिचय फोटो"},"写真を選択":{"vi":"Chọn ảnh","en":"Choose photo","ne":"फोटो छान्नुहोस्"},"写真を調整":{"vi":"Chỉnh ảnh","en":"Adjust photo","ne":"फोटो मिलाउनुहोस्"},"写真を削除":{"vi":"Xóa ảnh","en":"Remove photo","ne":"फोटो हटाउनुहोस्"},"ドラッグ、拡大・縮小、回転、位置調整後に履歴書用サイズへ切り抜けます。":{"vi":"Kéo, phóng to/thu nhỏ, xoay và căn vị trí rồi cắt theo kích thước ảnh hồ sơ.","en":"Drag, zoom, rotate and position the image, then crop it for the resume.","ne":"फोटो तानेर, जुम, घुमाएर र स्थान मिलाएर बायोडाटाको आकारमा काट्नुहोस्।"},"志望動機・本人希望":{"vi":"Động cơ ứng tuyển và nguyện vọng","en":"Motivation and preferences","ne":"आवेदनको कारण र व्यक्तिगत चाहना"},"固定見出し":{"vi":"Tiêu đề cố định","en":"Fixed heading","ne":"स्थिर शीर्षक"},"志望の動機、特技、好きな学科、アピールポイントなど":{"vi":"Động cơ ứng tuyển, sở trường, môn học yêu thích, điểm mạnh...","en":"Motivation, special skills, favorite subjects and strengths","ne":"आवेदनको कारण, विशेष सीप, मनपर्ने विषय र आफ्नो विशेषता"},"本文":{"vi":"Nội dung","en":"Text","ne":"विवरण"},"文字サイズ":{"vi":"Cỡ chữ","en":"Font size","ne":"अक्षरको आकार"},"本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）":{"vi":"Nguyện vọng cá nhân (lương, vị trí, giờ làm, nơi làm việc hoặc yêu cầu khác)","en":"Personal preferences (salary, role, working hours, location and other requests)","ne":"व्यक्तिगत चाहना (तलब, पद, कामको समय, स्थान वा अन्य चाहना)"},"貴社の規定に従う":{"vi":"Theo quy định của công ty","en":"Use company policy statement","ne":"कम्पनीको नियमअनुसार"},"本文をクリア":{"vi":"Xóa nội dung","en":"Clear text","ne":"विवरण खाली गर्नुहोस्"},"上下欄の高さ配分":{"vi":"Tỷ lệ chiều cao hai phần","en":"Upper/lower section height","ne":"माथिल्लो/तल्लो भागको उचाइ"},"上段 62% / 下段 38%":{"vi":"Phần trên 62% / phần dưới 38%","en":"Upper 62% / lower 38%","ne":"माथि ६२% / तल ३८%"},"見出しは正式な履歴書表記のまま固定します。本文のみ自由に入力・文字サイズ変更できます。":{"vi":"Tiêu đề giữ nguyên theo mẫu履歴書 chính thức. Chỉ nội dung và cỡ chữ có thể thay đổi.","en":"Headings remain in the official resume format. You can edit only the text and font size.","ne":"शीर्षक आधिकारिक बायोडाटा ढाँचामै रहन्छ। विवरण र अक्षरको आकार मात्र परिवर्तन गर्न सकिन्छ।"},"表の行数・学歴職歴・資格":{"vi":"Số dòng, học vấn–công việc và bằng cấp","en":"Rows, education/work and qualifications","ne":"पङ्क्ति, शिक्षा/काम र योग्यता"},"左側の行数":{"vi":"Số dòng bên trái","en":"Left-side rows","ne":"बायाँतर्फका पङ्क्ति"},"右側の行数":{"vi":"Số dòng bên phải","en":"Right-side rows","ne":"दायाँतर्फका पङ्क्ति"},"学歴・職歴の合計行数":{"vi":"Tổng số dòng học vấn và công việc","en":"Total education/work rows","ne":"शिक्षा/कामका कुल पङ्क्ति"},"合計行数を変更すると、左側と右側を自動でバランスよく配分します。左右を個別変更した場合は、合計行数を保ったまま反対側を調整します。":{"vi":"Khi thay đổi tổng số dòng, ứng dụng tự chia cân đối cho bên trái và bên phải. Khi chỉnh riêng một bên, bên còn lại tự điều chỉnh để giữ nguyên tổng số dòng.","en":"Changing the total automatically balances the left and right sides. Editing one side adjusts the other while keeping the total unchanged.","ne":"कुल पङ्क्ति परिवर्तन गर्दा बायाँ र दायाँ स्वतः सन्तुलित हुन्छन्। एकातिर छुट्टै परिवर्तन गर्दा कुल संख्या कायम राख्न अर्कोतिर समायोजन हुन्छ।"},"資格の行数":{"vi":"Số dòng bằng cấp","en":"Qualification rows","ne":"योग्यताका पङ्क्ति"},"学歴・職歴の選択行を入力":{"vi":"Nhập dòng học vấn/công việc đã chọn","en":"Edit selected education/work row","ne":"छानिएको शिक्षा/काम पङ्क्ति सम्पादन"},"編集する行":{"vi":"Dòng cần chỉnh sửa","en":"Row to edit","ne":"सम्पादन गर्ने पङ्क्ति"},"年":{"vi":"Năm","en":"Year","ne":"वर्ष"},"月":{"vi":"Tháng","en":"Month","ne":"महिना"},"内容":{"vi":"Nội dung","en":"Details","ne":"विवरण"},"定型語":{"vi":"Cụm từ mẫu","en":"Preset phrase","ne":"तयार वाक्यांश"},"選択してください":{"vi":"Hãy chọn","en":"Please select","ne":"छान्नुहोस्"},"学歴":{"vi":"Học vấn","en":"Education","ne":"शिक्षा"},"職歴":{"vi":"Kinh nghiệm làm việc","en":"Work history","ne":"कामको इतिहास"},"その他":{"vi":"Khác","en":"Other","ne":"अन्य"},"入学":{"vi":"Nhập học","en":"Enrolled","ne":"भर्ना"},"卒業":{"vi":"Tốt nghiệp","en":"Graduated","ne":"स्नातक"},"修了":{"vi":"Hoàn thành khóa học","en":"Completed","ne":"पूरा"},"中途退学":{"vi":"Nghỉ học giữa chừng","en":"Withdrew","ne":"बीचमै छोडेको"},"在学中":{"vi":"Đang theo học","en":"Currently enrolled","ne":"हाल अध्ययनरत"},"入社":{"vi":"Vào công ty","en":"Joined company","ne":"कम्पनीमा प्रवेश"},"退社":{"vi":"Nghỉ việc","en":"Left company","ne":"कम्पनी छोडेको"},"途中退社":{"vi":"Nghỉ việc giữa chừng","en":"Left before completion","ne":"बीचमै काम छोडेको"},"現在に至る":{"vi":"Đang làm đến hiện tại","en":"Present","ne":"हालसम्म"},"異動":{"vi":"Điều chuyển","en":"Transferred","ne":"सरुवा"},"配属":{"vi":"Được phân công","en":"Assigned","ne":"जिम्मेवारी तोकिएको"},"就任":{"vi":"Nhậm chức","en":"Appointed","ne":"नियुक्त"},"退任":{"vi":"Kết thúc chức vụ","en":"Stepped down","ne":"पदबाट हटेको"},"取得":{"vi":"Đạt/nhận được","en":"Obtained","ne":"प्राप्त"},"合格":{"vi":"Đỗ","en":"Passed","ne":"उत्तीर्ण"},"更新":{"vi":"Gia hạn/cập nhật","en":"Renewed","ne":"नवीकरण"},"以上":{"vi":"Hết","en":"End","ne":"समाप्त"},"選択行へ追加":{"vi":"Thêm vào dòng đã chọn","en":"Add to selected row","ne":"छानिएको पङ्क्तिमा थप्नुहोस्"},"資格・免許の選択行を入力":{"vi":"Nhập dòng bằng cấp/giấy phép đã chọn","en":"Edit selected qualification/license row","ne":"छानिएको योग्यता/लाइसेन्स पङ्क्ति सम्पादन"},"学歴を追加":{"vi":"Thêm học vấn","en":"Add education","ne":"शिक्षा थप्नुहोस्"},"職歴を追加":{"vi":"Thêm công việc","en":"Add work","ne":"काम थप्नुहोस्"},"見出しを追加":{"vi":"Thêm tiêu đề","en":"Add heading","ne":"शीर्षक थप्नुहोस्"},"資格を追加":{"vi":"Thêm bằng cấp","en":"Add qualification","ne":"योग्यता थप्नुहोस्"},"上へ":{"vi":"Lên trên","en":"Move up","ne":"माथि सार्नुहोस्"},"下へ":{"vi":"Xuống dưới","en":"Move down","ne":"तल सार्नुहोस्"},"行を複製":{"vi":"Nhân bản dòng","en":"Duplicate row","ne":"पङ्क्ति प्रतिलिपि"},"行を削除":{"vi":"Xóa dòng","en":"Delete row","ne":"पङ्क्ति मेटाउनुहोस्"},"固定項目・追加テーブル":{"vi":"Mục cố định và bảng bổ sung","en":"Fixed fields and extra tables","ne":"स्थिर फिल्ड र थप तालिका"},"固定項目（ラベルは変更しません）":{"vi":"Mục cố định (không đổi nhãn)","en":"Fixed fields (labels cannot be changed)","ne":"स्थिर फिल्ड (लेबल परिवर्तन हुँदैन)"},"通勤時間":{"vi":"Thời gian đi làm","en":"Commute time","ne":"काममा पुग्ने समय"},"扶養家族数（配偶者を除く）":{"vi":"Số người phụ thuộc (không gồm vợ/chồng)","en":"Dependents (excluding spouse)","ne":"आश्रित संख्या (पति/पत्नी बाहेक)"},"新しいテーブルを追加":{"vi":"Thêm bảng mới","en":"Add a new table","ne":"नयाँ तालिका थप्नुहोस्"},"編集する追加テーブル":{"vi":"Bảng bổ sung cần chỉnh","en":"Extra table to edit","ne":"सम्पादन गर्ने थप तालिका"},"ラベルの候補":{"vi":"Nhãn gợi ý","en":"Label presets","ne":"लेबलका विकल्प"},"自由入力":{"vi":"Tự nhập","en":"Custom","ne":"आफैँ लेख्नुहोस्"},"その他のスキル":{"vi":"Kỹ năng khác","en":"Other skills","ne":"अन्य सीप"},"希望職種":{"vi":"Vị trí mong muốn","en":"Preferred position","ne":"इच्छित पद"},"希望勤務地":{"vi":"Nơi làm việc mong muốn","en":"Preferred work location","ne":"इच्छित कार्यस्थल"},"勤務可能時間":{"vi":"Thời gian có thể làm việc","en":"Available working hours","ne":"काम गर्न सकिने समय"},"配偶者":{"vi":"Vợ/chồng","en":"Spouse","ne":"पति/पत्नी"},"配偶者の扶養義務":{"vi":"Nghĩa vụ phụ dưỡng vợ/chồng","en":"Obligation to support spouse","ne":"पति/पत्नीलाई आश्रित राख्ने दायित्व"},"資格補足":{"vi":"Thông tin bổ sung về bằng cấp","en":"Qualification notes","ne":"योग्यतासम्बन्धी थप जानकारी"},"新しいラベル名":{"vi":"Tên nhãn mới","en":"New label name","ne":"नयाँ लेबलको नाम"},"表示する内容":{"vi":"Nội dung hiển thị","en":"Displayed content","ne":"देखाइने विवरण"},"追加テーブルを削除":{"vi":"Xóa bảng bổ sung","en":"Delete extra table","ne":"थप तालिका मेटाउनुहोस्"},"「通勤時間」と「扶養家族数」は固定したまま、最大3個まで新しい表を追加できます。":{"vi":"Giữ nguyên “Thời gian đi làm” và “Số người phụ thuộc”; có thể thêm tối đa 3 bảng mới.","en":"Commute time and dependents remain fixed; you can add up to three extra tables.","ne":"काममा पुग्ने समय र आश्रित संख्या स्थिर रहन्छ; बढीमा ३ थप तालिका बनाउन सकिन्छ।"},"表示・印刷・PDF設定":{"vi":"Hiển thị, in và cài đặt PDF","en":"Display, print and PDF settings","ne":"प्रदर्शन, प्रिन्ट र PDF सेटिङ"},"プレビュー倍率":{"vi":"Tỷ lệ xem trước","en":"Preview zoom","ne":"पूर्वावलोकन जुम"},"自動":{"vi":"Tự động","en":"Auto","ne":"स्वचालित"},"A3全体を画面内に自動調整":{"vi":"Tự điều chỉnh toàn bộ A3 vừa màn hình","en":"Fit the entire A3 page to the screen","ne":"पूरै A3 पाना स्क्रिनमा मिलाउनुहोस्"},"A3印刷余白（指定値を初期設定）":{"vi":"Lề in A3 (giá trị mặc định)","en":"A3 print margins (default values)","ne":"A3 प्रिन्ट मार्जिन (पूर्वनिर्धारित)"},"上 mm":{"vi":"Trên mm","en":"Top mm","ne":"माथि mm"},"下 mm":{"vi":"Dưới mm","en":"Bottom mm","ne":"तल mm"},"左 mm":{"vi":"Trái mm","en":"Left mm","ne":"बायाँ mm"},"右 mm":{"vi":"Phải mm","en":"Right mm","ne":"दायाँ mm"},"ヘッダー mm":{"vi":"Đầu trang mm","en":"Header mm","ne":"हेडर mm"},"フッター mm":{"vi":"Chân trang mm","en":"Footer mm","ne":"फुटर mm"},"共有用PDF画質":{"vi":"Chất lượng PDF chia sẻ","en":"Shared PDF quality","ne":"साझा PDF गुणस्तर"},"高速（96 dpi）":{"vi":"Nhanh (96 dpi)","en":"Fast (96 dpi)","ne":"छिटो (96 dpi)"},"標準・推奨（120 dpi）":{"vi":"Tiêu chuẩn, khuyên dùng (120 dpi)","en":"Standard, recommended (120 dpi)","ne":"मानक, सिफारिस (120 dpi)"},"高画質（150 dpi）":{"vi":"Chất lượng cao (150 dpi)","en":"High quality (150 dpi)","ne":"उच्च गुणस्तर (150 dpi)"},"印刷時は A3・横向き・倍率100%・余白なしを選び、ブラウザの「ヘッダーとフッター」はオフにしてください。アプリ内で上19mm・下19mm・左18mm・右18mmへ正確に配置します。":{"vi":"Khi in, chọn A3 ngang, tỷ lệ 100%, không lề và tắt “Đầu trang và chân trang”. Ứng dụng tự đặt đúng lề trên/dưới 19 mm, trái/phải 18 mm.","en":"When printing, choose A3 landscape, 100% scale, no margins, and disable browser headers and footers. The app positions the page at 19 mm top/bottom and 18 mm left/right.","ne":"प्रिन्ट गर्दा A3 तेर्सो, 100% स्केल, मार्जिन नभएको छान्नुहोस् र ब्राउजरको हेडर/फुटर बन्द गर्नुहोस्। एपले माथि/तल 19 mm र बायाँ/दायाँ 18 mm मिलाउँछ।"},"入力内容を確認":{"vi":"Kiểm tra nội dung đã nhập","en":"Check entered information","ne":"भरेको जानकारी जाँच्नुहोस्"},"バックアップ":{"vi":"Sao lưu","en":"Backup","ne":"ब्याकअप"},"JSONを書き出す":{"vi":"Xuất JSON","en":"Export JSON","ne":"JSON निर्यात गर्नुहोस्"},"JSONを読み込む":{"vi":"Nhập JSON","en":"Import JSON","ne":"JSON आयात गर्नुहोस्"},"端末内の全書類を削除":{"vi":"Xóa toàn bộ hồ sơ trên thiết bị","en":"Delete all documents on this device","ne":"यस उपकरणका सबै कागजात मेटाउनुहोस्"},"印刷設定":{"vi":"Thiết lập in","en":"Print settings","ne":"प्रिन्ट सेटिङ"},"A3・横向き・倍率100%・余白なし・ヘッダーとフッターなしを選択してください。用紙内の余白はアプリが管理します。":{"vi":"Chọn A3 ngang, tỷ lệ 100%, không lề, không đầu trang/chân trang. Ứng dụng sẽ quản lý lề bên trong tờ giấy.","en":"Choose A3 landscape, 100% scale, no margins, and no headers or footers. The app manages the margins inside the page.","ne":"A3 तेर्सो, 100% स्केल, मार्जिन छैन र हेडर/फुटर छैन छान्नुहोस्। पानाभित्रको मार्जिन एपले मिलाउँछ।"},"プライバシー":{"vi":"Quyền riêng tư","en":"Privacy","ne":"गोपनीयता"},"利用上の注意":{"vi":"Điều khoản sử dụng","en":"Usage notes","ne":"प्रयोगसम्बन्धी सूचना"},"A3 横 420 × 297 mm":{"vi":"A3 ngang 420 × 297 mm","en":"A3 landscape 420 × 297 mm","ne":"A3 तेर्सो 420 × 297 mm"},"左右2面を1枚に自動調整":{"vi":"Tự căn hai mặt trên một trang","en":"Fit both halves onto one page","ne":"दुवै भाग एउटै पानामा मिलाउनुहोस्"},"証明写真を調整":{"vi":"Chỉnh ảnh thẻ","en":"Adjust ID photo","ne":"परिचय फोटो मिलाउनुहोस्"},"枠内をドラッグして位置を調整してください。":{"vi":"Kéo ảnh trong khung để điều chỉnh vị trí.","en":"Drag inside the frame to adjust the position.","ne":"फ्रेमभित्र तानेर स्थान मिलाउनुहोस्।"},"拡大・縮小":{"vi":"Phóng to/thu nhỏ","en":"Zoom","ne":"जुम"},"回転":{"vi":"Xoay","en":"Rotate","ne":"घुमाउनुहोस्"},"中央に戻す":{"vi":"Đưa về giữa","en":"Center","ne":"बीचमा ल्याउनुहोस्"},"枠に合わせる":{"vi":"Vừa khung","en":"Fit to frame","ne":"फ्रेममा मिलाउनुहोस्"},"出力は履歴書用の3:4比率（900×1200px）です。":{"vi":"Ảnh xuất theo tỷ lệ 3:4 cho hồ sơ (900 × 1200 px).","en":"Output uses the 3:4 resume-photo ratio (900 × 1200 px).","ne":"आउटपुट बायोडाटा फोटोको 3:4 अनुपातमा हुन्छ (900 × 1200 px)।"},"キャンセル":{"vi":"Hủy","en":"Cancel","ne":"रद्द गर्नुहोस्"},"写真を適用":{"vi":"Áp dụng ảnh","en":"Apply photo","ne":"फोटो लागू गर्नुहोस्"},"確認":{"vi":"Xác nhận","en":"Confirm","ne":"पुष्टि"},"閉じる":{"vi":"Đóng","en":"Close","ne":"बन्द गर्नुहोस्"},"例：株式会社〇〇応募用":{"vi":"Ví dụ: hồ sơ ứng tuyển Công ty ○○","en":"Example: Application for ○○ Co., Ltd.","ne":"उदाहरण: ○○ कम्पनीको आवेदन"},"例：653-0834":{"vi":"Ví dụ: 653-0834","en":"Example: 653-0834","ne":"उदाहरण: 653-0834"},"都道府県・市区町村・町域が自動入力されます。番地・建物名を追記してください。":{"vi":"Tỉnh/thành phố/quận/khu vực sẽ tự điền. Hãy nhập thêm số nhà và tên tòa nhà.","en":"Prefecture, city/ward and area are filled automatically. Add the street number and building name.","ne":"प्रान्त, सहर/वडा र क्षेत्र स्वतः भरिन्छ। घर नम्बर र भवनको नाम थप्नुहोस्।"},"住所のよみがなが自動入力されます。":{"vi":"Cách đọc địa chỉ sẽ tự động được điền.","en":"The address reading is filled automatically.","ne":"ठेगानाको उच्चारण स्वतः भरिन्छ।"},"志望の動機、特技、好きな学科、アピールポイントなどを入力":{"vi":"Nhập động cơ ứng tuyển, sở trường, môn học yêu thích và điểm mạnh","en":"Enter your motivation, special skills, favorite subjects and strengths","ne":"आवेदनको कारण, विशेष सीप, मनपर्ने विषय र विशेषता लेख्नुहोस्"},"本人希望記入欄を入力":{"vi":"Nhập nguyện vọng cá nhân","en":"Enter personal preferences","ne":"व्यक्तिगत चाहना लेख्नुहोस्"},"例：約 30 分":{"vi":"Ví dụ: khoảng 30 phút","en":"Example: about 30 minutes","ne":"उदाहरण: करिब ३० मिनेट"},"例：1 人":{"vi":"Ví dụ: 1 người","en":"Example: 1 person","ne":"उदाहरण: १ जना"},"例：その他のスキル":{"vi":"Ví dụ: Kỹ năng khác","en":"Example: Other skills","ne":"उदाहरण: अन्य सीप"},"例：Excel、簿記、接客経験":{"vi":"Ví dụ: Excel, kế toán, kinh nghiệm phục vụ khách hàng","en":"Example: Excel, bookkeeping, customer service experience","ne":"उदाहरण: Excel, लेखा, ग्राहक सेवा अनुभव"},"元に戻す":{"vi":"Hoàn tác","en":"Undo","ne":"पहिलेको अवस्थामा फर्काउनुहोस्"},"やり直す":{"vi":"Làm lại","en":"Redo","ne":"फेरि गर्नुहोस्"},"表示切替":{"vi":"Chuyển chế độ hiển thị","en":"Switch view","ne":"दृश्य परिवर्तन"},"編集パネル":{"vi":"Bảng nhập liệu","en":"Editing panel","ne":"सम्पादन प्यानल"},"A3履歴書プレビュー":{"vi":"Xem trước sơ yếu lý lịch A3","en":"A3 resume preview","ne":"A3 बायोडाटा पूर्वावलोकन"},"新しい履歴書":{"vi":"Sơ yếu lý lịch mới","en":"New resume","ne":"नयाँ बायोडाटा"},"貴社の規定に従います。":{"vi":"Tôi tuân theo quy định của quý công ty.","en":"I will follow your company regulations.","ne":"म कम्पनीको नियम पालना गर्नेछु।"},"処理しています…":{"vi":"Đang xử lý…","en":"Processing…","ne":"प्रक्रिया हुँदैछ…"},"処理がタイムアウトしました。":{"vi":"Quá thời gian xử lý.","en":"The operation timed out.","ne":"प्रक्रियाको समय सकियो।"},"端末に保存しました。":{"vi":"Đã lưu trên thiết bị.","en":"Saved on this device.","ne":"उपकरणमा सुरक्षित भयो।"},"保存容量が不足しています。写真サイズを小さくするか、不要な書類を削除してください。":{"vi":"Không đủ dung lượng lưu trữ. Hãy giảm kích thước ảnh hoặc xóa hồ sơ không cần thiết.","en":"Not enough storage. Reduce the photo size or delete unneeded documents.","ne":"भण्डारण पर्याप्त छैन। फोटो सानो बनाउनुहोस् वा अनावश्यक कागजात मेटाउनुहोस्।"},"住所とふりがなを自動入力しました。番地・建物名を追記してください。":{"vi":"Đã tự điền địa chỉ và Hiragana. Hãy nhập thêm số nhà và tên tòa nhà.","en":"Address and reading were filled automatically. Add the street number and building name.","ne":"ठेगाना र उच्चारण स्वतः भरियो। घर नम्बर र भवनको नाम थप्नुहोस्।"},"住所検索がタイムアウトしました。":{"vi":"Tra cứu địa chỉ quá thời gian.","en":"Address lookup timed out.","ne":"ठेगाना खोज्ने समय सकियो।"},"住所検索サービスへ接続できませんでした。":{"vi":"Không thể kết nối dịch vụ tra cứu địa chỉ.","en":"Could not connect to the address lookup service.","ne":"ठेगाना खोज सेवा जडान हुन सकेन।"},"郵便番号を7桁で入力してください。":{"vi":"Hãy nhập mã bưu điện gồm 7 số.","en":"Enter a 7-digit postal code.","ne":"७ अङ्कको हुलाक कोड लेख्नुहोस्।"},"郵便番号から住所を検索しています…":{"vi":"Đang tìm địa chỉ từ mã bưu điện…","en":"Looking up the address…","ne":"हुलाक कोडबाट ठेगाना खोजिँदैछ…"},"住所検索でエラーが発生しました。":{"vi":"Đã xảy ra lỗi khi tìm địa chỉ.","en":"An address lookup error occurred.","ne":"ठेगाना खोज्दा त्रुटि भयो।"},"該当する住所が見つかりませんでした。郵便番号を確認してください。":{"vi":"Không tìm thấy địa chỉ phù hợp. Hãy kiểm tra mã bưu điện.","en":"No matching address was found. Check the postal code.","ne":"मिल्ने ठेगाना भेटिएन। हुलाक कोड जाँच्नुहोस्।"},"先に表の行を選択してください。":{"vi":"Hãy chọn một dòng trong bảng trước.","en":"Select a table row first.","ne":"पहिले तालिकाको पङ्क्ति छान्नुहोस्।"},"学歴・職歴の行を選択してください。":{"vi":"Hãy chọn dòng học vấn/công việc.","en":"Select an education/work row.","ne":"शिक्षा/कामको पङ्क्ति छान्नुहोस्।"},"追加する定型語を選択してください。":{"vi":"Hãy chọn cụm từ mẫu cần thêm.","en":"Select a preset phrase to add.","ne":"थप्ने तयार वाक्यांश छान्नुहोस्।"},"内容を入力":{"vi":"Nhập nội dung","en":"Enter details","ne":"विवरण लेख्नुहोस्"},"追加テーブルはありません":{"vi":"Chưa có bảng bổ sung","en":"No extra tables","ne":"थप तालिका छैन"},"追加テーブルは3個までです。":{"vi":"Chỉ có thể thêm tối đa 3 bảng.","en":"You can add up to three extra tables.","ne":"बढीमा ३ वटा थप तालिका बनाउन सकिन्छ।"},"削除する追加テーブルを選択してください。":{"vi":"Hãy chọn bảng bổ sung cần xóa.","en":"Select an extra table to delete.","ne":"मेटाउने थप तालिका छान्नुहोस्।"},"新しい履歴書を作成しますか？現在の内容は自動保存されています。":{"vi":"Tạo sơ yếu lý lịch mới? Nội dung hiện tại đã được tự động lưu.","en":"Create a new resume? The current content has been autosaved.","ne":"नयाँ बायोडाटा बनाउने? हालको विवरण स्वतः सुरक्षित भएको छ।"},"新しい履歴書を作成しました。":{"vi":"Đã tạo sơ yếu lý lịch mới.","en":"A new resume was created.","ne":"नयाँ बायोडाटा बनाइयो।"},"保存済みの履歴書を開きました。":{"vi":"Đã mở hồ sơ đã lưu.","en":"Opened the saved resume.","ne":"सुरक्षित बायोडाटा खोलियो।"},"履歴書を複製しました。":{"vi":"Đã nhân bản hồ sơ.","en":"Resume duplicated.","ne":"बायोडाटा प्रतिलिपि भयो।"},"削除しました。":{"vi":"Đã xóa.","en":"Deleted.","ne":"मेटाइयो।"},"端末内に保存したすべての履歴書を削除します。この操作は元に戻せません。":{"vi":"Xóa toàn bộ sơ yếu lý lịch đã lưu trên thiết bị? Thao tác này không thể hoàn tác.","en":"Delete all resumes saved on this device? This cannot be undone.","ne":"यस उपकरणमा सुरक्षित सबै बायोडाटा मेटाउने? यो फर्काउन सकिँदैन।"},"すべての保存データを削除しました。":{"vi":"Đã xóa toàn bộ dữ liệu đã lưu.","en":"All saved data was deleted.","ne":"सबै सुरक्षित डेटा मेटाइयो।"},"JSONバックアップを書き出しました。":{"vi":"Đã xuất bản sao lưu JSON.","en":"JSON backup exported.","ne":"JSON ब्याकअप निर्यात भयो।"},"JSONデータを読み込みました。":{"vi":"Đã nhập dữ liệu JSON.","en":"JSON data imported.","ne":"JSON डेटा आयात भयो।"},"JSONファイルを読み込めませんでした。":{"vi":"Không thể đọc file JSON.","en":"Could not read the JSON file.","ne":"JSON फाइल पढ्न सकिएन।"},"氏名が未入力です。":{"vi":"Chưa nhập họ tên.","en":"Name is missing.","ne":"नाम लेखिएको छैन।"},"ふりがなが未入力です。":{"vi":"Chưa nhập Furigana.","en":"Furigana is missing.","ne":"फुरिगाना लेखिएको छैन।"},"生年月日が未入力です。":{"vi":"Chưa nhập ngày sinh.","en":"Date of birth is missing.","ne":"जन्म मिति लेखिएको छैन।"},"現住所が未入力です。":{"vi":"Chưa nhập địa chỉ hiện tại.","en":"Current address is missing.","ne":"हालको ठेगाना लेखिएको छैन।"},"電話番号が未入力です。":{"vi":"Chưa nhập số điện thoại.","en":"Phone number is missing.","ne":"फोन नम्बर लेखिएको छैन।"},"証明写真が未設定です。":{"vi":"Chưa đặt ảnh thẻ.","en":"ID photo is missing.","ne":"परिचय फोटो राखिएको छैन।"},"入力内容の確認":{"vi":"Kiểm tra nội dung","en":"Check entered information","ne":"भरेको जानकारी जाँच"},"入力内容は良好です":{"vi":"Nội dung chính đã đầy đủ","en":"The main information looks good","ne":"मुख्य जानकारी ठीक छ"},"主要項目が入力されています。PDF保存前に年月と表記を目視確認してください。":{"vi":"Các mục chính đã được nhập. Hãy kiểm tra lại năm, tháng và cách viết trước khi lưu PDF.","en":"The main fields are complete. Check dates and wording before saving the PDF.","ne":"मुख्य फिल्ड भरिएका छन्। PDF सुरक्षित गर्नुअघि मिति र लेखाइ जाँच्नुहोस्।"},"15MB以下の画像を選択してください。":{"vi":"Hãy chọn ảnh không quá 15 MB.","en":"Choose an image no larger than 15 MB.","ne":"१५ MB भन्दा सानो फोटो छान्नुहोस्।"},"画像を読み込めませんでした。":{"vi":"Không thể đọc ảnh.","en":"Could not read the image.","ne":"फोटो पढ्न सकिएन।"},"画像を開けませんでした。":{"vi":"Không thể mở ảnh.","en":"Could not open the image.","ne":"फोटो खोल्न सकिएन।"},"証明写真を適用しました。":{"vi":"Đã áp dụng ảnh thẻ.","en":"ID photo applied.","ne":"परिचय फोटो लागू भयो।"},"PDF保存画面を準備しています…":{"vi":"Đang chuẩn bị màn hình lưu PDF…","en":"Preparing the PDF save dialog…","ne":"PDF सुरक्षित गर्ने स्क्रिन तयार हुँदैछ…"},"印刷画面の「送信先」で「PDFに保存」を選択してください。A3・横向き・倍率100%を推奨します。":{"vi":"Trong cửa sổ in, chọn “Lưu thành PDF”. Khuyên dùng A3 ngang và tỷ lệ 100%.","en":"In the print dialog, choose “Save as PDF”. A3 landscape at 100% is recommended.","ne":"प्रिन्ट संवादमा “PDF को रूपमा सुरक्षित” छान्नुहोस्। A3 तेर्सो र 100% सिफारिस गरिएको छ।"},"共有用PDFを作成しています…":{"vi":"Đang tạo PDF để chia sẻ…","en":"Creating a PDF for sharing…","ne":"साझा गर्न PDF बनाइँदैछ…"},"PDFを共有しました。":{"vi":"Đã chia sẻ PDF.","en":"PDF shared.","ne":"PDF साझा भयो।"},"この端末はPDF共有に未対応のため、PDFを保存しました。":{"vi":"Thiết bị không hỗ trợ chia sẻ file nên PDF đã được tải xuống.","en":"This device does not support file sharing, so the PDF was downloaded.","ne":"उपकरणले फाइल साझा गर्न नसक्ने भएकाले PDF डाउनलोड भयो।"},"PDF共有に失敗しました。PDF保存ボタンからブラウザ標準のPDF保存をご利用ください。":{"vi":"Không thể chia sẻ PDF. Hãy dùng nút Lưu PDF của trình duyệt.","en":"PDF sharing failed. Use the browser’s standard PDF save option.","ne":"PDF साझा गर्न असफल भयो। ब्राउजरको PDF सुरक्षित विकल्प प्रयोग गर्नुहोस्।"},"住所をクリアしました。":{"vi":"Đã xóa địa chỉ.","en":"Address cleared.","ne":"ठेगाना खाली भयो।"},"証明写真を削除しますか？":{"vi":"Xóa ảnh thẻ?","en":"Remove the ID photo?","ne":"परिचय फोटो हटाउने?"},"PDF処理画面を閉じました。必要に応じてもう一度お試しください。":{"vi":"Đã đóng quá trình PDF. Hãy thử lại khi cần.","en":"The PDF operation was closed. Try again if needed.","ne":"PDF प्रक्रिया बन्द भयो। आवश्यक भए फेरि प्रयास गर्नुहोस्।"},"ブラウザのメニューから「ホーム画面に追加」を選択してください。":{"vi":"Hãy chọn “Thêm vào màn hình chính” trong menu trình duyệt.","en":"Choose “Add to Home Screen” from the browser menu.","ne":"ब्राउजर मेनुबाट “होम स्क्रिनमा थप्नुहोस्” छान्नुहोस्।"}};

  Object.assign(TRANSLATIONS, {
    "学歴・職歴の合計は10行まで減らせます。行数を減らすと、右側の志望動機・本人希望欄により多くのスペースを割り当てられます。入力済み内容より少ない行数にはなりません。": {
      "vi": "Có thể giảm tổng số dòng học vấn–công việc xuống còn 10. Khi giảm số dòng, phần động cơ ứng tuyển và nguyện vọng ở bên phải sẽ có thêm diện tích. Số dòng không thể thấp hơn số nội dung đã nhập.",
      "en": "The total education/work rows can be reduced to 10. Fewer rows provide more space for the motivation and personal-request sections on the right. The row count cannot be lower than the entered content.",
      "ne": "शिक्षा/कामका कुल पङ्क्ति १० सम्म घटाउन सकिन्छ। पङ्क्ति घटाउँदा दायाँतर्फको आवेदन कारण र व्यक्तिगत चाहना भागका लागि बढी ठाउँ उपलब्ध हुन्छ। भरेको विवरणभन्दा कम पङ्क्ति हुन सक्दैन।"
    }
  });


  Object.assign(TRANSLATIONS, {
    "PDFリンク共有":{"vi":"Tạo link PDF","en":"Create PDF link","ne":"PDF लिङ्क बनाउनुहोस्"},
    "PDF共有リンク":{"vi":"Chia sẻ PDF bằng liên kết","en":"PDF link sharing","ne":"PDF लिङ्क साझेदारी"},
    "リンクを知っている人は履歴書PDFを閲覧できます。個人情報を含むため、送信相手と保存期間を確認してください。":{"vi":"Bất kỳ ai có liên kết đều có thể xem PDF sơ yếu lý lịch. Hồ sơ có thông tin cá nhân, hãy kiểm tra đúng người nhận và thời gian lưu.","en":"Anyone with the link can view the resume PDF. It contains personal information, so verify the recipient and retention period.","ne":"लिङ्क भएका जोकोहीले बायोडाटा PDF हेर्न सक्छन्। यसमा व्यक्तिगत जानकारी हुन्छ, त्यसैले प्राप्तकर्ता र भण्डारण अवधि जाँच गर्नुहोस्।"},
    "Publishable key / anon key":{"vi":"Publishable key / anon key","en":"Publishable key / anon key","ne":"Publishable key / anon key"},
    "Storage bucket":{"vi":"Kho lưu trữ Storage","en":"Storage bucket","ne":"Storage bucket"},
    "共有設定を保存":{"vi":"Lưu cấu hình chia sẻ","en":"Save sharing settings","ne":"साझेदारी सेटिङ सुरक्षित गर्नुहोस्"},
    "接続を確認":{"vi":"Kiểm tra kết nối","en":"Test connection","ne":"जडान जाँच गर्नुहोस्"},
    "初回のみSupabase設定が必要です。":{"vi":"Chỉ cần cấu hình Supabase một lần trước khi tạo liên kết.","en":"Supabase setup is required once before creating links.","ne":"लिङ्क बनाउनुअघि Supabase एक पटक सेट गर्नुपर्छ।"},
    "共有リンク設定は保存済みです。":{"vi":"Đã lưu cấu hình tạo liên kết.","en":"Link sharing settings are saved.","ne":"लिङ्क साझेदारी सेटिङ सुरक्षित छन्।"},
    "作成済みリンク":{"vi":"Các liên kết đã tạo","en":"Created links","ne":"बनाइएका लिङ्कहरू"},
    "作成済みリンクはありません。":{"vi":"Chưa có liên kết nào.","en":"No links have been created.","ne":"कुनै लिङ्क बनाइएको छैन।"},
    "無料構成ではSupabase Storageを使用します。公開設定は SUPABASE_SETUP.sql をSupabase SQL Editorで1回実行してください。":{"vi":"Bản miễn phí dùng Supabase Storage. Hãy chạy file SUPABASE_SETUP.sql một lần trong Supabase SQL Editor.","en":"The free setup uses Supabase Storage. Run SUPABASE_SETUP.sql once in the Supabase SQL Editor.","ne":"निःशुल्क सेटअपले Supabase Storage प्रयोग गर्छ। Supabase SQL Editor मा SUPABASE_SETUP.sql एक पटक चलाउनुहोस्।"},
    "PDF共有リンクを作成しました":{"vi":"Đã tạo liên kết PDF","en":"PDF link created","ne":"PDF लिङ्क बन्यो"},
    "このURLを送ると、相手はブラウザでPDFを開けます。":{"vi":"Gửi URL này để người nhận mở PDF bằng trình duyệt.","en":"Send this URL so the recipient can open the PDF in a browser.","ne":"यो URL पठाउँदा प्राप्तकर्ताले ब्राउजरमा PDF खोल्न सक्छ।"},
    "共有URL":{"vi":"URL chia sẻ","en":"Share URL","ne":"साझेदारी URL"},
    "リンクをコピー":{"vi":"Sao chép liên kết","en":"Copy link","ne":"लिङ्क प्रतिलिपि गर्नुहोस्"},
    "このリンクを知っている人はPDFを閲覧できます。不要になったら「クラウドから削除」を押してください。":{"vi":"Ai có liên kết đều có thể xem PDF. Khi không còn cần, hãy bấm “Xóa khỏi đám mây”.","en":"Anyone with the link can view the PDF. When it is no longer needed, select “Delete from cloud”.","ne":"लिङ्क भएका जोकोहीले PDF हेर्न सक्छन्। आवश्यक नभएपछि “क्लाउडबाट मेटाउनुहोस्” थिच्नुहोस्।"},
    "クラウドから削除":{"vi":"Xóa khỏi đám mây","en":"Delete from cloud","ne":"क्लाउडबाट मेटाउनुहोस्"},
    "PDFを開く":{"vi":"Mở PDF","en":"Open PDF","ne":"PDF खोल्नुहोस्"},
    "リンクを送る":{"vi":"Gửi liên kết","en":"Send link","ne":"लिङ्क पठाउनुहोस्"},
    "コピー":{"vi":"Sao chép","en":"Copy","ne":"प्रतिलिपि"},
    "PDF共有リンクの設定を保存しました。":{"vi":"Đã lưu cấu hình chia sẻ liên kết PDF.","en":"PDF link sharing settings saved.","ne":"PDF लिङ्क साझेदारी सेटिङ सुरक्षित भयो।"},
    "接続を確認しています…":{"vi":"Đang kiểm tra kết nối…","en":"Testing connection…","ne":"जडान जाँच हुँदैछ…"},
    "PDF共有サービスへ接続できました。":{"vi":"Đã kết nối dịch vụ chia sẻ PDF.","en":"Connected to the PDF sharing service.","ne":"PDF साझेदारी सेवामा जडान भयो।"},
    "最初にPDF共有リンクのSupabase設定を入力してください。":{"vi":"Trước tiên hãy nhập cấu hình Supabase trong mục Chia sẻ PDF bằng liên kết.","en":"First enter the Supabase settings under PDF link sharing.","ne":"पहिले PDF लिङ्क साझेदारीमा Supabase सेटिङ भर्नुहोस्।"},
    "PDFをクラウドへアップロードしています…":{"vi":"Đang tải PDF lên đám mây…","en":"Uploading PDF to the cloud…","ne":"PDF क्लाउडमा अपलोड हुँदैछ…"},
    "PDFリンクを作成し、クリップボードへコピーしました。":{"vi":"Đã tạo liên kết PDF và sao chép vào bộ nhớ tạm.","en":"PDF link created and copied to the clipboard.","ne":"PDF लिङ्क बनाइयो र क्लिपबोर्डमा प्रतिलिपि गरियो।"},
    "PDFリンクを作成しました。":{"vi":"Đã tạo liên kết PDF.","en":"PDF link created.","ne":"PDF लिङ्क बन्यो।"},
    "リンクをコピーしました。":{"vi":"Đã sao chép liên kết.","en":"Link copied.","ne":"लिङ्क प्रतिलिपि भयो।"},
    "リンクをコピーできませんでした。":{"vi":"Không thể sao chép liên kết.","en":"Could not copy the link.","ne":"लिङ्क प्रतिलिपि गर्न सकिएन।"},
    "PDFリンクを共有しました。":{"vi":"Đã chia sẻ liên kết PDF.","en":"PDF link shared.","ne":"PDF लिङ्क साझा भयो।"},
    "共有機能に未対応のため、リンクをコピーしました。":{"vi":"Thiết bị không hỗ trợ bảng chia sẻ nên liên kết đã được sao chép.","en":"The device does not support the share sheet, so the link was copied.","ne":"उपकरणले साझा सुविधा नदिएकाले लिङ्क प्रतिलिपि गरियो।"},
    "この共有PDFをクラウドから削除しますか？リンクは開けなくなります。":{"vi":"Xóa PDF đã chia sẻ khỏi đám mây? Liên kết sẽ không mở được nữa.","en":"Delete this shared PDF from the cloud? The link will stop working.","ne":"यो साझा PDF क्लाउडबाट मेटाउने? लिङ्क फेरि खुल्ने छैन।"},
    "共有PDFをクラウドから削除しました。":{"vi":"Đã xóa PDF chia sẻ khỏi đám mây.","en":"Shared PDF deleted from the cloud.","ne":"साझा PDF क्लाउडबाट मेटाइयो।"}
  });

  Object.assign(TRANSLATIONS, {
    "有効期間中はリンクを知っている人が履歴書PDFを閲覧できます。個人情報を含むため、送信相手を確認してください。":{"vi":"Trong thời hạn hiệu lực, bất kỳ ai có liên kết đều có thể xem PDF sơ yếu lý lịch. Hồ sơ có thông tin cá nhân, hãy kiểm tra đúng người nhận.","en":"While the link is valid, anyone with it can view the resume PDF. It contains personal information, so verify the recipient.","ne":"लिङ्क मान्य रहँदा लिङ्क भएका जोकोहीले बायोडाटा PDF हेर्न सक्छन्। यसमा व्यक्तिगत जानकारी हुन्छ, त्यसैले प्राप्तकर्ता जाँच गर्नुहोस्।"},
    "リンクの有効期間":{"vi":"Thời hạn liên kết","en":"Link validity","ne":"लिङ्क मान्य अवधि"},
    "1日":{"vi":"1 ngày","en":"1 day","ne":"१ दिन"},
    "7日":{"vi":"7 ngày","en":"7 days","ne":"७ दिन"},
    "30日":{"vi":"30 ngày","en":"30 days","ne":"३० दिन"},
    "有効期限まではリンクを知っている人がPDFを閲覧できます。すぐ無効にしたい場合は「クラウドから削除」を押してください。":{"vi":"Ai có liên kết có thể xem PDF cho đến khi hết hạn. Muốn vô hiệu hóa ngay, hãy bấm “Xóa khỏi đám mây”.","en":"Anyone with the link can view the PDF until it expires. To disable it immediately, choose “Delete from cloud”.","ne":"म्याद नसकिँदासम्म लिङ्क भएका जोकोहीले PDF हेर्न सक्छन्। तुरुन्त बन्द गर्न “क्लाउडबाट मेटाउनुहोस्” थिच्नुहोस्।"},
    "期限切れ":{"vi":"Đã hết hạn","en":"Expired","ne":"म्याद सकियो"}
  });
  Object.assign(TRANSLATIONS, {
    "パソコン用PDFを作成しています…":{"vi":"Đang tạo PDF cho máy tính…","en":"Creating the desktop PDF…","ne":"कम्प्युटरका लागि PDF बनाइँदैछ…"},
    "PDFをパソコンに保存し、ファイル共有画面を開きました。":{"vi":"Đã lưu PDF vào máy tính và mở cửa sổ chia sẻ tệp.","en":"The PDF was saved to the computer and the file share dialog was opened.","ne":"PDF कम्प्युटरमा सुरक्षित भयो र फाइल साझेदारी खुल्यो।"},
    "PDFをパソコンに保存し、同じパソコンで使える一時プレビューを開きました。他の人へ送る場合は保存済みPDFを添付してください。":{"vi":"Đã lưu PDF vào máy tính và mở liên kết xem tạm trên chính máy này. Muốn gửi cho người khác, hãy đính kèm file PDF đã lưu.","en":"The PDF was saved and a temporary preview for this computer was opened. To send it to someone else, attach the saved PDF file.","ne":"PDF कम्प्युटरमा सुरक्षित भयो र यही कम्प्युटरमा चल्ने अस्थायी पूर्वावलोकन खुल्यो। अरूलाई पठाउन सुरक्षित PDF फाइल संलग्न गर्नुहोस्।"},
    "PDFをパソコンに保存しました。他の人へ送る場合はDownloads内のPDFを添付してください。":{"vi":"Đã lưu PDF vào máy tính. Muốn gửi cho người khác, hãy đính kèm file PDF trong thư mục Downloads.","en":"The PDF was saved to the computer. To send it to someone else, attach the PDF from Downloads.","ne":"PDF कम्प्युटरमा सुरक्षित भयो। अरूलाई पठाउन Downloads को PDF संलग्न गर्नुहोस्।"},
    "スマートフォンでリンク共有するため、最初にSupabase設定を入力してください。":{"vi":"Để chia sẻ bằng liên kết trên điện thoại, trước tiên hãy nhập cấu hình Supabase.","en":"To share a link on a phone, first enter the Supabase settings.","ne":"फोनमा लिङ्क साझा गर्न पहिले Supabase सेटिङ भर्नुहोस्।"},
    "スマートフォン用PDFを作成しています…":{"vi":"Đang tạo PDF cho điện thoại…","en":"Creating the mobile PDF…","ne":"फोनका लागि PDF बनाइँदैछ…"},
    "PDFをStorageへ保存し、共有リンクを取得しています…":{"vi":"Đang lưu PDF lên Storage và lấy liên kết chia sẻ…","en":"Saving the PDF to Storage and obtaining a share link…","ne":"PDF Storage मा सुरक्षित गरी साझेदारी लिङ्क लिइँदैछ…"},
    "PDFをStorageへ保存し、共有リンクを送信しました。":{"vi":"Đã lưu PDF lên Storage và gửi liên kết chia sẻ.","en":"The PDF was saved to Storage and the share link was sent.","ne":"PDF Storage मा सुरक्षित भयो र साझेदारी लिङ्क पठाइयो।"},
    "PDFをStorageへ保存し、共有リンクをコピーしました。":{"vi":"Đã lưu PDF lên Storage và sao chép liên kết chia sẻ.","en":"The PDF was saved to Storage and the share link was copied.","ne":"PDF Storage मा सुरक्षित भयो र साझेदारी लिङ्क प्रतिलिपि भयो।"},
    "パソコンへのPDF保存に失敗しました：":{"vi":"Không thể lưu PDF vào máy tính: ","en":"Could not save the PDF to the computer: ","ne":"PDF कम्प्युटरमा सुरक्षित गर्न सकिएन: "}
  });

  Object.assign(TRANSLATIONS, {
    "PDFはクラウドへアップロードしません。端末へ保存したあと、対応するスマートフォンやパソコンではPDFファイルをそのまま共有します。":{"vi":"PDF không được tải lên đám mây. Sau khi lưu trên thiết bị, điện thoại hoặc máy tính tương thích sẽ chia sẻ trực tiếp chính file PDF.","en":"The PDF is not uploaded to the cloud. After saving it on the device, supported phones and computers share the PDF file directly.","ne":"PDF क्लाउडमा अपलोड हुँदैन। उपकरणमा सुरक्षित भएपछि समर्थित फोन वा कम्प्युटरले PDF फाइल सिधै साझा गर्छ।"},
    "共有機能に未対応の場合は、Downloadsまたはファイルアプリに保存されたPDFを手動で添付してください。":{"vi":"Nếu thiết bị không hỗ trợ chia sẻ trực tiếp, hãy đính kèm thủ công file PDF đã lưu trong Downloads hoặc ứng dụng Tệp.","en":"If direct sharing is unsupported, manually attach the PDF saved in Downloads or the Files app.","ne":"प्रत्यक्ष साझेदारी समर्थित नभए Downloads वा Files एपमा सुरक्षित PDF हातैले संलग्न गर्नुहोस्।"},
    "PDFを端末へ保存し、ファイル共有画面を開きました。クラウドにはアップロードしていません。":{"vi":"Đã lưu PDF trên thiết bị và mở bảng chia sẻ file. PDF không được tải lên đám mây.","en":"The PDF was saved on the device and the file share sheet was opened. It was not uploaded to the cloud.","ne":"PDF उपकरणमा सुरक्षित भयो र फाइल साझेदारी खुल्यो। क्लाउडमा अपलोड गरिएको छैन।"},
    "PDFを端末へ保存しました。DownloadsまたはファイルアプリからPDFを選んで送信してください。":{"vi":"Đã lưu PDF trên thiết bị. Hãy chọn file PDF trong Downloads hoặc ứng dụng Tệp để gửi.","en":"The PDF was saved on the device. Select it from Downloads or the Files app to send it.","ne":"PDF उपकरणमा सुरक्षित भयो। पठाउन Downloads वा Files एपबाट PDF छान्नुहोस्।"},
    "スマートフォンへのPDF保存に失敗しました：":{"vi":"Không thể lưu PDF vào điện thoại: ","en":"Could not save the PDF to the phone: ","ne":"फोनमा PDF सुरक्षित गर्न सकिएन: "}
  });


  Object.assign(TRANSLATIONS, {
    "行数に合わせて高さ配分を自動調整": {
      "vi": "Tự động điều chỉnh tỷ lệ chiều cao theo số dòng",
      "en": "Automatically adjust section heights to row counts",
      "ne": "पङ्क्ति संख्याअनुसार खण्डको उचाइ स्वतः मिलाउनुहोस्"
    },
    "合計行数を変更すると左右を自動配分します。左側または右側を変更すると、合計を保ったまま反対側がすぐに変わります。資格の行数や合計行数に合わせて、上段・下段の高さ配分も自動調整できます。": {
      "vi": "Khi đổi tổng số dòng, ứng dụng tự chia cho bên trái và bên phải. Khi đổi riêng một bên, bên còn lại thay đổi ngay để giữ nguyên tổng. Tỷ lệ chiều cao hai phần cũng có thể tự điều chỉnh theo tổng số dòng và số dòng bằng cấp.",
      "en": "Changing the total automatically distributes rows between the left and right. Changing either side immediately adjusts the other while preserving the total. The upper/lower section ratio can also adjust automatically to the total and qualification rows.",
      "ne": "कुल पङ्क्ति परिवर्तन गर्दा बायाँ र दायाँ स्वतः बाँडिन्छ। एकातिर परिवर्तन गर्दा कुल संख्या कायम राख्न अर्कोतिर तुरुन्त समायोजन हुन्छ। माथिल्लो/तल्लो भागको अनुपात पनि कुल र योग्यता पङ्क्तिअनुसार स्वतः मिल्छ।"
    }
  });

  Object.assign(TRANSLATIONS, {
    "合計行数を変更すると左右を自動配分します。左側または右側を変更すると、合計を保ったまま反対側がすぐに変わります。資格の行数を増やしたとき、学歴・職歴に空き行があれば、その空き行を自動で減らして他の欄へスペースを回します。高さ配分も行数に合わせて自動調整できます。": {
      "vi": "Khi đổi tổng số dòng, ứng dụng tự chia cho bên trái và bên phải. Khi đổi riêng một bên, bên còn lại thay đổi ngay để giữ nguyên tổng. Khi tăng số dòng bằng cấp, nếu bảng học vấn–công việc còn dòng trống, ứng dụng sẽ tự giảm các dòng trống đó để dành chỗ cho các phần khác. Tỷ lệ chiều cao cũng tự điều chỉnh theo số dòng.",
      "en": "Changing the total automatically distributes rows between the left and right. Changing either side immediately adjusts the other while preserving the total. When qualification rows increase, unused education/work rows are reduced automatically to free space for other sections. Section heights also adjust automatically to the row counts.",
      "ne": "कुल पङ्क्ति परिवर्तन गर्दा बायाँ र दायाँ स्वतः बाँडिन्छ। एकातिर परिवर्तन गर्दा कुल संख्या कायम राख्न अर्कोतिर तुरुन्त समायोजन हुन्छ। योग्यता पङ्क्ति बढाउँदा शिक्षा/काममा खाली पङ्क्ति भए ती स्वतः घटाएर अन्य खण्डका लागि ठाउँ दिइन्छ। खण्डको उचाइ पनि पङ्क्तिअनुसार स्वतः मिल्छ।"
    }
  });


  Object.assign(TRANSLATIONS, {
    "学歴・職歴の後に入力する情報":{"vi":"Thông tin nhập tiếp sau học vấn/công việc","en":"Information entered after education/work","ne":"शिक्षा/कामपछि भर्ने जानकारी"},
    "スマートフォンで学歴・職歴の入力を終えたあと、そのまま基本情報と応募内容を続けて入力できます。":{"vi":"Sau khi nhập xong học vấn/công việc trên điện thoại, có thể tiếp tục nhập thông tin cơ bản và nội dung ứng tuyển ngay bên dưới.","en":"After entering education/work on a phone, continue with basic details and application content directly below.","ne":"फोनमा शिक्षा/काम भरेपछि तलै आधारभूत विवरण र आवेदन सामग्री भर्न जारी राख्न सकिन्छ।"},
    "氏名":{"vi":"Họ tên","en":"Full name","ne":"पूरा नाम"},
    "電話番号":{"vi":"Số điện thoại","en":"Phone number","ne":"फोन नम्बर"},
    "メールアドレス":{"vi":"Email","en":"Email address","ne":"इमेल ठेगाना"},
    "連絡先住所":{"vi":"Nơi liên hệ","en":"Contact address","ne":"सम्पर्क ठेगाना"},
    "志望動機":{"vi":"Động cơ ứng tuyển","en":"Application motivation","ne":"आवेदनको कारण"},
    "本人希望・その他の希望":{"vi":"Nguyện vọng và yêu cầu khác","en":"Personal preferences and other requests","ne":"व्यक्तिगत चाहना र अन्य अनुरोध"},
    "選択済み写真":{"vi":"Ảnh đã chọn","en":"Selected photo","ne":"छानिएको फोटो"},
    "タップして写真を調整":{"vi":"Chạm để chỉnh ảnh","en":"Tap to adjust the photo","ne":"फोटो मिलाउन ट्याप गर्नुहोस्"},
    "選択済みの証明写真":{"vi":"Ảnh thẻ đã chọn","en":"Selected ID photo","ne":"छानिएको परिचय फोटो"}
  });


  Object.assign(TRANSLATIONS, {
    "1．個人情報・連絡先":{"vi":"1. Thông tin cá nhân và liên hệ","en":"1. Personal and contact information","ne":"१. व्यक्तिगत र सम्पर्क जानकारी"},
    "2．住所・別の連絡先":{"vi":"2. Địa chỉ và nơi liên hệ khác","en":"2. Address and alternate contact","ne":"२. ठेगाना र वैकल्पिक सम्पर्क"},
    "3．学歴・職歴・資格":{"vi":"3. Học vấn, công việc và bằng cấp","en":"3. Education, work and qualifications","ne":"३. शिक्षा, काम र योग्यता"},
    "4．志望動機・本人希望":{"vi":"4. Động cơ ứng tuyển và nguyện vọng","en":"4. Motivation and personal preferences","ne":"४. आवेदनको कारण र व्यक्तिगत चाहना"},
    "5．通勤時間・扶養家族・追加項目":{"vi":"5. Thời gian đi làm, người phụ thuộc và mục bổ sung","en":"5. Commute, dependents and extra fields","ne":"५. आवागमन, आश्रित र थप विवरण"},
    "氏名（ふりがな）":{"vi":"Họ tên (Furigana)","en":"Name (Furigana)","ne":"नाम (फुरिगाना)"},
    "氏名（漢字・ローマ字）":{"vi":"Họ tên (Kanji hoặc chữ Latin)","en":"Name (Kanji or Roman letters)","ne":"नाम (कान्जी वा रोमन अक्षर)"},
    "現住所（漢字）":{"vi":"Địa chỉ hiện tại (Kanji)","en":"Current address (Kanji)","ne":"हालको ठेगाना (कान्जी)"},
    "現住所ふりがな（ひらがな）":{"vi":"Cách đọc địa chỉ hiện tại (Hiragana)","en":"Current address reading (Hiragana)","ne":"हालको ठेगानाको उच्चारण (हिरागाना)"},
    "別の連絡先（必要な場合のみ）":{"vi":"Nơi liên hệ khác (chỉ khi cần)","en":"Alternate contact (only if needed)","ne":"वैकल्पिक सम्पर्क (आवश्यक भए मात्र)"},
    "連絡先ふりがな":{"vi":"Cách đọc nơi liên hệ","en":"Contact address reading","ne":"सम्पर्क ठेगानाको उच्चारण"},
    "連絡先電話番号":{"vi":"Số điện thoại nơi liên hệ","en":"Alternate contact phone","ne":"वैकल्पिक सम्पर्क फोन"},
    "最初に氏名・生年月日・電話番号・メール・写真など、本人情報を上から順番に入力してください。":{"vi":"Hãy nhập lần lượt từ trên xuống: họ tên, ngày sinh, số điện thoại, email, ảnh và toàn bộ thông tin cá nhân.","en":"Enter all personal information from top to bottom: name, date of birth, phone, email and photo.","ne":"माथिबाट क्रमशः नाम, जन्म मिति, फोन, इमेल, फोटो र सबै व्यक्तिगत जानकारी भर्नुहोस्।"},
    "現住所を入力し、現住所以外への連絡を希望する場合は別の連絡先も入力してください。":{"vi":"Nhập địa chỉ hiện tại; khi muốn nhận liên hệ ở nơi khác, hãy nhập thêm địa chỉ liên hệ khác.","en":"Enter the current address and add an alternate contact when communication should go elsewhere.","ne":"हालको ठेगाना भर्नुहोस् र अन्य ठाउँमा सम्पर्क चाहिने भए वैकल्पिक सम्पर्क पनि भर्नुहोस्।"},
    "連絡先住所のふりがな":{"vi":"Cách đọc địa chỉ liên hệ","en":"Reading of the contact address","ne":"सम्पर्क ठेगानाको उच्चारण"}
  });

  const originalText = new WeakMap();
  const lastAppliedText = new WeakMap();
  let applying = false;
  let currentLanguage = normalizeLanguage(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE);


  Object.assign(TRANSLATIONS, {
    "本人希望欄の高さ":{"vi":"Chiều cao phần nguyện vọng cá nhân","en":"Personal preferences section height","ne":"व्यक्तिगत चाहना खण्डको उचाइ"},
    "本人希望欄は直接高さを調整できます。上段と下段はA3の範囲内で連動し、下端のborderが切れないように自動制限します。":{"vi":"Có thể điều chỉnh trực tiếp chiều cao phần nguyện vọng. Hai phần tự liên động trong khổ A3 và được giới hạn để không mất đường viền phía dưới.","en":"Adjust the personal preferences section directly. Both sections stay linked within A3 and are limited so the bottom border is not clipped.","ne":"व्यक्तिगत चाहना खण्डको उचाइ सिधै मिलाउन सकिन्छ। दुवै खण्ड A3 भित्र जोडिएर मिल्छन् र तलको किनारा नकटिने गरी सीमित हुन्छन्।"}
  });

  function normalizeLanguage(value) {
    const short = String(value || '').toLowerCase().split('-')[0];
    return SUPPORTED.includes(short) ? short : DEFAULT_LANGUAGE;
  }

  function trExact(source, lang = currentLanguage) {
    if (!source || lang === 'ja') return source;
    return TRANSLATIONS[source]?.[lang] || source;
  }

  function trPattern(source, lang = currentLanguage) {
    if (!source || lang === 'ja') return source;
    let m;
    if ((m = source.match(/^上段\s*(\d+)%\s*\/\s*下段\s*(\d+)%$/))) {
      return lang === 'vi' ? `Phần trên ${m[1]}% / phần dưới ${m[2]}%` : lang === 'en' ? `Upper ${m[1]}% / lower ${m[2]}%` : `माथि ${m[1]}% / तल ${m[2]}%`;
    }
    if ((m = source.match(/^(\d+)%（A3全体）$/))) {
      return lang === 'vi' ? `${m[1]}% (toàn bộ A3)` : lang === 'en' ? `${m[1]}% (entire A3)` : `${m[1]}% (पूरै A3)`;
    }
    if ((m = source.match(/^住所候補が(\d+)件あります。候補を選択できます。$/))) {
      return lang === 'vi' ? `Có ${m[1]} địa chỉ phù hợp. Hãy chọn một địa chỉ.` : lang === 'en' ? `${m[1]} address results found. Select one.` : `${m[1]} वटा ठेगाना भेटिए। एउटा छान्नुहोस्।`;
    }
    if ((m = source.match(/^(\d+)行目：(.*)$/))) {
      return lang === 'vi' ? `Dòng ${m[1]}: ${m[2]}` : lang === 'en' ? `Row ${m[1]}: ${m[2]}` : `पङ्क्ति ${m[1]}: ${m[2]}`;
    }
    if ((m = source.match(/^共通の行高：([\d.]+) mm（学歴・職歴と資格を同じ高さで表示）$/))) {
      return lang === 'vi' ? `Chiều cao dòng chung: ${m[1]} mm (học vấn/công việc và bằng cấp có cùng chiều cao)` : lang === 'en' ? `Shared row height: ${m[1]} mm (education/work and qualifications use the same height)` : `साझा पङ्क्ति उचाइ: ${m[1]} mm (शिक्षा/काम र योग्यता समान उचाइ)`;
    }
    if ((m = source.match(/^共通行高\s*([\d.]+)mm・A3中央配置$/))) {
      return lang === 'vi' ? `Chiều cao dòng chung ${m[1]} mm · căn giữa A3` : lang === 'en' ? `Shared row height ${m[1]} mm · centered on A3` : `साझा पङ्क्ति उचाइ ${m[1]} mm · A3 मा बीचमा`;
    }
    if ((m = source.match(/^現在の配分：左\s*(\d+)\s*行\s*＋\s*右\s*(\d+)\s*行\s*＝\s*合計\s*(\d+)\s*行$/))) {
      return lang === 'vi' ? `Phân bổ hiện tại: trái ${m[1]} dòng + phải ${m[2]} dòng = tổng ${m[3]} dòng` : lang === 'en' ? `Current split: left ${m[1]} rows + right ${m[2]} rows = ${m[3]} total` : `हालको बाँडफाँट: बायाँ ${m[1]} पङ्क्ति + दायाँ ${m[2]} पङ्क्ति = कुल ${m[3]} पङ्क्ति`;
    }
    if (source.startsWith('A3用紙内：')) {
      return lang === 'vi' ? source.replace('A3用紙内：','Trong trang A3: ').replace('上','trên ').replace('下','dưới ').replace('左','trái ').replace('右','phải ').replace('本文領域','vùng nội dung').replace('中央配置','căn giữa') : lang === 'en' ? source.replace('A3用紙内：','Inside A3: ').replace('上','top ').replace('下','bottom ').replace('左','left ').replace('右','right ').replace('本文領域','content area').replace('中央配置','centered') : source.replace('A3用紙内：','A3 पानाभित्र: ').replace('上','माथि ').replace('下','तल ').replace('左','बायाँ ').replace('右','दायाँ ').replace('本文領域','विवरण क्षेत्र').replace('中央配置','बीचमा');
    }
    if (source.startsWith('学歴・職歴：内容')) {
      return lang === 'vi' ? `Bố cục số dòng đã được tính tự động. ${source}` : lang === 'en' ? `Row layout is calculated automatically. ${source}` : `पङ्क्ति लेआउट स्वतः गणना हुन्छ। ${source}`;
    }
    if (source.endsWith(' のコピー')) {
      const base = source.slice(0, -5);
      return lang === 'vi' ? `${base} - bản sao` : lang === 'en' ? `${base} - copy` : `${base} - प्रतिलिपि`;
    }
    return trExact(source, lang);
  }

  function translate(source, lang = currentLanguage) {
    return trPattern(String(source || '').trim(), lang);
  }

  function shouldSkip(node) {
    const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !el || el.closest('#resumeSheet, #uiLanguage, [data-i18n-skip], script, style');
  }

  function translateTextNode(node, force = false) {
    if (shouldSkip(node)) return;
    const raw = node.nodeValue || '';
    const trimmed = raw.trim();
    if (!trimmed) return;
    const previousApplied = lastAppliedText.get(node);
    if (!originalText.has(node) || (trimmed !== previousApplied && !force)) originalText.set(node, trimmed);
    const source = originalText.get(node) || trimmed;
    const translated = translate(source);
    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    const next = `${leading}${translated}${trailing}`;
    lastAppliedText.set(node, translated);
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  Object.assign(TRANSLATIONS, {
    "資格の行数（自動調整）":{"vi":"Số dòng bằng cấp (tự động)","en":"Qualification rows (automatic)","ne":"योग्यताका पङ्क्ति (स्वचालित)"},
    "内容に合わせて自動調整":{"vi":"Tự điều chỉnh theo nội dung","en":"Adjusted automatically to content","ne":"विवरणअनुसार स्वतः समायोजन"},
    "履歴書全体のバランスを優先し、左側を十分に確保してから右側へ続けて表示します。資格欄と通勤時間・扶養家族数の固定2枠は、崩れない標準サイズを維持します。":{"vi":"Ưu tiên sự cân đối của toàn bộ hồ sơ: giữ đủ không gian bên trái rồi mới tiếp tục sang bên phải. Bảng bằng cấp và hai ô cố định Thời gian đi làm/Số người phụ thuộc luôn giữ kích thước chuẩn.","en":"The whole resume is balanced first: the left side keeps sufficient space before content continues on the right. The qualification table and the two fixed commute/dependent boxes retain standard dimensions.","ne":"सम्पूर्ण बायोडाटाको सन्तुलनलाई प्राथमिकता दिइन्छ: दायाँतर्फ जारी गर्नुअघि बायाँतर्फ पर्याप्त ठाउँ राखिन्छ। योग्यता तालिका र आवागमन समय/आश्रित सङ्ख्याका दुई स्थिर बाकस मानक आकारमै रहन्छन्।"}
  });

  function translateAttributes(el) {
    if (shouldSkip(el)) return;
    for (const attr of ['placeholder', 'title', 'aria-label', 'label']) {
      if (!el.hasAttribute(attr)) continue;
      const dataName = `i18nOriginal${attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase())}`;
      if (!el.dataset[dataName]) el.dataset[dataName] = el.getAttribute(attr) || '';
      el.setAttribute(attr, translate(el.dataset[dataName]));
    }
    if (el.tagName === 'OPTION') {
      const source = el.dataset.i18nOriginalOption || el.textContent.trim();
      if (!el.dataset.i18nOriginalOption) {
        el.dataset.i18nOriginalOption = source;
        if (!el.hasAttribute('value')) el.value = source;
      }
    }
  }

  function translateElement(root = document, force = false) {
    applying = true;
    try {
      if (root.nodeType === Node.TEXT_NODE) translateTextNode(root, force);
      const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll('*')] : [...document.querySelectorAll('*')];
      for (const el of elements) translateAttributes(el);
      const walker = document.createTreeWalker(root.nodeType === Node.DOCUMENT_NODE ? root.body : root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) translateTextNode(node, force);
      document.documentElement.lang = currentLanguage;
      document.body?.classList.remove('ui-lang-ja','ui-lang-vi','ui-lang-en','ui-lang-ne');
      document.body?.classList.add(`ui-lang-${currentLanguage}`);
      document.title = translate('履歴書 A3 作成アプリ');
      const selector = document.getElementById('uiLanguage');
      if (selector && selector.value !== currentLanguage) selector.value = currentLanguage;
    } finally {
      applying = false;
    }
  }

  function setLanguage(lang) {
    currentLanguage = normalizeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    translateElement(document, true);
    window.dispatchEvent(new CustomEvent('rirekisho-language-changed', { detail: { language: currentLanguage } }));
  }

  function init() {
    const selector = document.getElementById('uiLanguage');
    if (selector) {
      selector.value = currentLanguage;
      selector.addEventListener('change', event => setLanguage(event.target.value));
    }
    translateElement(document, true);
    const observer = new MutationObserver(mutations => {
      if (applying) return;
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target, false);
        for (const node of mutation.addedNodes || []) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node, false);
          else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node, false);
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: false });
  }

  const nativeConfirm = window.confirm.bind(window);
  window.confirm = message => nativeConfirm(translate(message));
  const nativeAlert = window.alert.bind(window);
  window.alert = message => nativeAlert(translate(message));

  window.RirekishoI18n = {
    t: translate,
    setLanguage,
    getLanguage: () => currentLanguage,
    supported: [...SUPPORTED],
    apply: (root = document, force = true) => translateElement(root || document, force)
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
