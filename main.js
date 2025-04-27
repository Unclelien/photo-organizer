const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('start-transfer', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled) {
    return { success: false, message: '取消選擇資料夾' };
  }

  const sourceFolder = result.filePaths[0];

  // 1. 在同一層建立「照片分類集」資料夾
  const classifyRoot = path.join(sourceFolder, '照片分類集');


  if (!fs.existsSync(classifyRoot)) {
    fs.mkdirSync(classifyRoot, { recursive: true });
  }

  let moved = false;
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.cr2', '.nef', '.arw', '.dng', '.raw', '.heic', '.tiff', '.bmp', '.gif', '.webp'];
  const files = fs.readdirSync(sourceFolder);

  for (const file of files) {
    const filePath = path.join(sourceFolder, file);
    const ext = path.extname(file).toLowerCase();

    if (!supportedExtensions.includes(ext)) continue;

    const buffer = fs.readFileSync(filePath);
    let formattedDate = null;

    try {
      const parser = exif.create(buffer);
      const result = parser.parse();
      const date = result.tags.DateTimeOriginal;

      if (date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
    } catch (error) {
      // 解析 EXIF 失敗，無視
    }

    if (!formattedDate) {
      const stats = fs.statSync(filePath);
      const date = stats.birthtime;
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    // 2. 把分類結果產生在 照片分類集
    const dateFolder = path.join(classifyRoot, formattedDate);

    if (!fs.existsSync(dateFolder)) {
      fs.mkdirSync(dateFolder, { recursive: true });
    }

    const targetPath = path.join(dateFolder, file);

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(filePath, targetPath); // ✅ 這裡改成 copy，不是 move
      moved = true;
    }
  }

  if (moved) {
    // ✅ 分類完成後，詢問要怎麼處理原始照片
    const { response } = await dialog.showMessageBox({
      type: 'question',
      buttons: ['搬到已完成照片項目', '全部刪除', '都不動'],
      defaultId: 2,
      title: '分類完成',
      message: '分類完成，請選擇要怎麼處理原始照片？'
    });
  
    if (response === 0) {
      // 使用者選擇搬到「已完成照片項目」
      const finishedFolder = path.join(sourceFolder, '已完成照片項目');
      if (!fs.existsSync(finishedFolder)) {
        fs.mkdirSync(finishedFolder, { recursive: true });
      }
  
      for (const file of files) {
        const filePath = path.join(sourceFolder, file);
        const ext = path.extname(file).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          const targetPath = path.join(finishedFolder, file);
          if (!fs.existsSync(targetPath)) {
            fs.renameSync(filePath, targetPath);
          }
        }
      }
  
    } else if (response === 1) {
      // 使用者選擇全部刪除
      for (const file of files) {
        const filePath = path.join(sourceFolder, file);
        const ext = path.extname(file).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      // 都不動
      console.log('✅ 使用者選擇保留原始照片');
    }
  
    return { success: true, message: '✅ 照片已分類完成！分類結果在「照片分類集」資料夾中。' };
  } else {
    return { success: true, message: '✅ 沒有新檔案需要分類。' };
  }
  
});
