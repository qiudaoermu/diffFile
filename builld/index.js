const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const srcDir = "./src";
const distDir = "./dist";
const hashFile = "./hashes.json";

// 创建目标文件夹
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// 读取存储的哈希值
let savedHashes = {};
if (fs.existsSync(hashFile)) {
  try {
    savedHashes = JSON.parse(fs.readFileSync(hashFile, "utf8"));
  } catch (err) {
    console.error("无法解析哈希值文件:", err);
  }
}

// 计算文件的哈希值
function calculateHash(filePath) {
  const fileData = fs.readFileSync(filePath);
  const hash = crypto.createHash("md5");
  hash.update(fileData);
  return hash.digest("hex");
}

// 保存哈希值到文件
function saveHashes() {
  fs.writeFileSync(hashFile, JSON.stringify(savedHashes), "utf8");
}

// 复制修改过的文件到目标文件夹，并添加哈希值到文件名
function copyModifiedFiles(srcPath, distPath) {
  const srcHash = calculateHash(srcPath);
  const fileExtension = path.extname(srcPath);
  const fileName = path.basename(srcPath, fileExtension);
  const distFileName = `${fileName}-${srcHash}${fileExtension}`;

  if (savedHashes[srcPath] !== srcHash) {
    // 删除旧文件
    if (fs.existsSync(distPath)) {
      fs.unlinkSync(distPath);
      console.log(`已删除旧文件 ${distPath}`);
    }
    try {
      fs.copyFileSync(srcPath, path.join(distDir, distFileName));
    } catch (error) {
      console.error(`无法复制文件 ${srcPath}:`, error);
    }
    console.log(`成功复制文件 ${srcPath} 到目标文件夹，命名为 ${distFileName}`);
    savedHashes[srcPath] = srcHash; // 更新哈希值
    saveHashes(); // 保存哈希值到文件
  }
}

// 删除旧的文件
function deleteOldFiles() {
  const updatedFiles = Object.values(savedHashes);
  if (updatedFiles.length === 0) return;
  const distFiles = fs.readdirSync(distDir);

  for (const distFile of distFiles) {
    let fileName = path.basename(distFile);
    fileName = fileName.split("-")[1].split(".")[0];
    const distPath = path.join(distDir, distFile);
    if (!updatedFiles.includes(fileName)) {
      fs.unlinkSync(distPath);
      console.log(`已删除旧文件 ${distPath}`);
    }
  }
}

// 遍历源文件夹中的文件
fs.readdir(srcDir, (err, files) => {
  if (err) {
    console.error("无法读取源文件夹中的文件:", err);
    return;
  }

  files.forEach((file) => {
    const srcPath = path.join(srcDir, file);
    const distPath = path.join(distDir, file);
    copyModifiedFiles(srcPath, distPath);
  });
  deleteOldFiles();
});
