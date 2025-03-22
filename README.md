
# 验证码生成器 Chrome 扩展  
**TOTP Authenticator for Chrome**

## 📝 中文简介

验证码生成器是一款简洁高效的 Chrome 扩展工具，用于生成基于时间的一次性密码（TOTP），适用于各种支持双因素认证（2FA）的服务。主要功能包括：

- 🔐 **实时验证码生成**：基于 Base32 密钥，自动生成 6 位验证码，每 30 秒刷新，并显示倒计时动画。
- 📋 **账户管理**：支持手动添加、编辑、删除及拖动排序，轻松管理多个账户。
- 💾 **导入与导出**：支持账户数据的备份与迁移，数据可加密保存，保障安全。
- 📷 **二维码识别**：上传含有 otpauth:// 链接的二维码图片，自动解析并添加账户，减少手动错误。

这款扩展旨在提供一个简洁、安全、用户友好的 TOTP 管理解决方案。

---

## 🌐 English Overview

**TOTP Authenticator** is a clean and efficient Chrome extension for generating time-based one-time passwords (TOTP), commonly used for Two-Factor Authentication (2FA). Key features include:

- 🔐 **Real-time TOTP Generation**: Generates 6-digit codes from Base32 secrets, refreshing every 30 seconds with countdown animation.
- 📋 **Account Management**: Add, edit, delete, and reorder accounts via a simple, intuitive UI.
- 💾 **Import/Export**: Backup or transfer account data securely, with optional encryption.
- 📷 **QR Code Scanning**: Upload QR images containing otpauth:// links for automatic parsing and account addition.

This extension is built to offer a convenient and secure way to manage TOTP-based authentication codes.

---

## 📦 安装 / Installation

1. 克隆或下载本仓库  
   Clone or download this repository

2. 打开 Chrome，访问 `chrome://extensions/`  
   Open Chrome and navigate to `chrome://extensions/`

3. 启用开发者模式  
   Enable **Developer Mode**

4. 点击“加载已解压的扩展程序”，选择项目根目录  
   Click **Load unpacked**, and select the root directory of the project

---

## 🚀 使用说明 / Usage

- **添加账户**：在 popup 页面中输入账户名称和密钥，点击“添加账号”。
- **账户操作**：支持拖拽排序、复制验证码、编辑信息、删除账户。
- **导入导出**：点击右上角“导入导出”按钮，跳转到设置页面进行数据备份与恢复。
- **二维码添加**：点击“二维码添加”，上传二维码图片自动识别并添加。

---

## 🤝 贡献 / Contributing

欢迎提交 issue 或 pull request 来报告问题或提供改进建议！

---

## 📄 许可证 / License

本项目采用 [MIT License](LICENSE)。
