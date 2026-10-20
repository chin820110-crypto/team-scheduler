# 團隊排班與任務管理 Dashboard (Team Shift & Task Scheduler)

一個純前端、現代化且輕量級的團隊管理儀表板，整合了**週日曆排班視圖**與**任務看板管理**，具備預設成員資料、本地 LocalStorage 持久化儲存與資料匯出功能。

---

## 🌟 核心特色

1. **週日曆排班視圖 (Weekly Shift Calendar)**
   - 橫軸自動載入當前週（週一至週日），縱軸為團隊成員。
   - 支援「上一週」、「下一週」、「返回本週」快速導覽。
   - 預設提供「早班 (09:00 - 18:00)」、「中班 (13:00 - 22:00)」、「遠端 (WFH)」、「休假 (OFF)」四種班別。
   - 點擊任一成員的排班格位即可跳出彈窗快速換班與新增備註。

2. **預設團隊成員 (Preset Team Members)**
   - 系統已內建 5 位團隊成員：
     - 👨‍💻 **小明**（前端工程師）
     - 🎨 **小美**（UI/UX 設計師）
     - ⚙️ **小華**（後端工程師）
     - 🚀 **小強**（DevOps 專員）
     - 📋 **小雅**（專案經理 PM）

3. **任務看板與狀態切換 (Task Management & Kanban)**
   - 具備「待辦事項 (To Do)」、「進行中 (In Progress)」、「已完成 (Done)」三欄看板。
   - 卡片上可一鍵點擊切換狀態，並即時反應於統計指標。
   - 提供任務搜尋、指派成員篩選、狀態篩選與新增任務功能。
   - 逾期任務紅字警示與高/中/低優先級色彩標示。

4. **資料持久化 (LocalStorage)**
   - 任何排班修改、新任務建立、狀態切換與刪除均即時同步至瀏覽器 LocalStorage。
   - 重新整理網頁或重啟瀏覽器後資料不遺失。
   - 頂部導航列提供「重設範例資料」按鈕，可隨時復原初始測試環境。

5. **一鍵資料匯出 (Data Export)**
   - **JSON 匯出**：匯出完整備份檔（包含成員、排班與任務全部欄位）。
   - **排班 CSV 匯出**：適合匯入 Excel 或 Google Sheets（已預先加入 UTF-8 BOM 防止中文亂碼）。
   - **任務 CSV 匯出**：完整匯出任務名稱、描述、指派人、優先級、到期日與狀態。

---

## 📁 檔案結構

```
team-shift-scheduler/
├── index.html          # 主頁面結構與視圖容器
├── css/
│   └── style.css       # 自訂微調樣式與滾動條
├── js/
│   ├── data.js         # 5 位成員預設資料、班別定義與種子資料
│   ├── store.js        # LocalStorage 存取與響應式狀態管理
│   ├── calendar.js     # 週排班日曆渲染與彈窗互動
│   ├── tasks.js        # 看板渲染、篩選、任務建立與狀態切換
│   ├── export.js       # JSON / CSV (UTF-8 BOM) 檔案下載處理
│   └── app.js          # 主入口初始化與統計指標連動
└── README.md           # 專案說明文件
```

---

## 🚀 如何開啟與測試

因為本專案採用標準 ES 模組化語法 (`import` / `export`)，建議透過本機簡易 HTTP 伺服器開啟以避免瀏覽器 CORS 檔案協定限制：

### 方式一：使用 Python 快速啟動（推薦）
在終端機執行：
```bash
cd /Users/evenwang/.gemini/antigravity/scratch/team-shift-scheduler
python3 -m http.server 8000
```
接著在瀏覽器打開：`http://localhost:8000`

### 方式二：使用 Node.js / npx
```bash
cd /Users/evenwang/.gemini/antigravity/scratch/team-shift-scheduler
npx serve
```

### 方式三：直接以 macOS 預設瀏覽器開啟
在終端機執行：
```bash
open /Users/evenwang/.gemini/antigravity/scratch/team-shift-scheduler/index.html
```
*(現代多數瀏覽器如 Chrome、Safari 或 Edge 在新版設定下亦支援開啟本機模組)*
