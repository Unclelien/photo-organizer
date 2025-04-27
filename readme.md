# 📸 照片分類工具 Photo Organizer

這是一個使用 Electron 製作的跨平台桌面應用程式，  
可以根據照片的拍攝日期，自動分類整理照片到新的資料夾中。  
支援副檔名：JPG、PNG、RAW、HEIC、GIF 等格式。

---

## 🚀 主要功能

- ✅ 根據照片拍攝日期，自動分類到以日期命名的資料夾
- ✅ 支援批次處理大量照片
- ✅ 支援 RAW 檔案
- ✅ 分類完成後可以選擇：
  - 搬移到「已完成照片項目」
  - 全部刪除
  - 保留原樣
- ✅ 打包成 Windows / Mac / Linux 可執行檔
- ✅ 簡單點選選單即可操作

---

## 🛠️ 如何使用

### 下載成品
前往 [Releases 頁面](https://github.com/Unclelien/photo-organizer/releases) 下載適合你系統的安裝檔！

- Windows ➔ `.exe`
- Mac ➔ `.dmg`
- Linux ➔ `.AppImage`

### 本地開發（開發者專用）
如果你想自己跑：

```bash
# 安裝必要套件
npm install

# 本地啟動 (開發模式)
npm run start

# 打包成安裝檔 (dist 資料夾會出現產物)
npm run dist
