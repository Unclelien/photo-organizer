const fs = require('fs');
const path = require('path');
const exif = require('exif-parser');

// 設定來源資料夾
const sourceFolder = '/Users/tzuuncle/Desktop/photo';
const targetFolder = sourceFolder; // 直接在原資料夾分類

let moved = false; // 有沒有移動過檔案

// 支援的圖片副檔名
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.cr2', '.nef', '.arw', '.dng', '.raw', '.heic', '.tiff', '.bmp', '.gif', '.webp'];

const files = fs.readdirSync(sourceFolder);

files.forEach(file => {
  const filePath = path.join(sourceFolder, file);
  const ext = path.extname(file).toLowerCase();

  if (!supportedExtensions.includes(ext)) {
    // 非圖片檔案，跳過
    return;
  }

  const buffer = fs.readFileSync(filePath);
  let formattedDate = null;

  try {
    // 嘗試解析EXIF資料
    const parser = exif.create(buffer);
    const result = parser.parse();
    const date = result.tags.DateTimeOriginal;

    if (date) {
      // 如果有EXIF時間
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }
  } catch (error) {
    // 有些raw檔讀EXIF可能會失敗，無視
  }

  if (!formattedDate) {
    // 如果沒有EXIF，使用檔案建立時間
    const stats = fs.statSync(filePath);
    const date = stats.birthtime; // 注意：在某些系統上是 ctime
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;
  }

  // 目標資料夾
  const dateFolder = path.join(targetFolder, formattedDate);

  // 建立資料夾如果不存在
  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder, { recursive: true });
  }

  const targetPath = path.join(dateFolder, file);

  // 如果已經在正確的資料夾，跳過
  if (filePath === targetPath) {
    return;
  }

  if (!fs.existsSync(targetPath)) {
    fs.renameSync(filePath, targetPath);
    console.log(`📂 已移動：${file} → ${formattedDate}/`);
    moved = true;
  } else {
    console.log(`⚠️ 同名檔案已存在，跳過：${file}`);
  }
});

// 最後結果
if (!moved) {
  console.log('✅ 已完成，並無需要更動。');
} else {
  console.log('✅ 所有需要移動的圖片都已完成分類。');
}
