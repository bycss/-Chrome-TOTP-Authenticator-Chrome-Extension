验证码生成器 Chrome 扩展 / TOTP Authenticator Chrome Extension
中文简介
验证码生成器 Chrome 扩展是一款简洁实用的工具，用于生成基于时间的一次性密码（TOTP），广泛应用于双因素身份验证（2FA）。本扩展具有以下主要功能：

实时验证码生成
基于 Base32 格式密钥生成 6 位动态验证码，每 30 秒自动更新，并配有倒计时动画效果。

账号管理
支持手动添加、编辑、删除和拖拽排序账户，让管理多个 TOTP 账户变得简单直观。

导入/导出功能
提供独立的选项页面，用于导入和导出账户数据（支持数据加密保护），方便备份和数据迁移。

二维码添加账户
通过专用页面上传二维码（包含 otpauth:// 链接），自动解析并添加账户，减少手动输入错误。

该扩展旨在为用户提供一个便捷、安全的 TOTP 管理工具，助力日常双因素认证。

English Overview
The TOTP Authenticator Chrome Extension is a simple and practical tool for generating time-based one-time passwords (TOTP) widely used in two-factor authentication (2FA). This extension offers the following key features:

Real-time TOTP Generation
Generates 6-digit dynamic codes from a Base32 secret key that automatically updates every 30 seconds, complete with a countdown animation.

Account Management
Easily add, edit, delete, and reorder TOTP accounts with a user-friendly interface, making it straightforward to manage multiple accounts.

Import/Export Functionality
Provides a dedicated options page to securely import and export account data (with optional encryption), facilitating backup and data migration.

QR Code Account Addition
A separate page allows users to upload QR codes (containing otpauth:// links) for automatic parsing and account addition, reducing manual entry errors.

This extension is designed to provide users with a convenient and secure TOTP management tool, essential for everyday two-factor authentication.

安装 / Installation
克隆或下载本仓库。

打开 Chrome 浏览器，进入 chrome://extensions/ 页面，并启用“开发者模式”。

点击“加载已解压的扩展程序”，选择项目根目录即可安装扩展。

Clone or download this repository.

Open Chrome and navigate to chrome://extensions/, then enable Developer Mode.

Click "Load unpacked" and select the project root directory to install the extension.

使用 / Usage
添加账户
在 popup 页面中输入账户名称和 Base32 格式的密钥，然后点击“添加账号”即可手动添加账户。

账号管理
通过拖拽可重新排序账户；点击验证码可复制到剪贴板；点击编辑按钮修改账户信息，点击删除按钮移除账户。

导入/导出
使用顶部的“导入导出”按钮打开选项页面，在该页面中可以进行账户数据的导入和导出（支持加密保护）。

二维码添加账户
在 popup 页面点击“二维码添加”按钮将打开专用页面，在该页面中上传包含 otpauth://totp/… 格式的二维码图片，系统将自动解析并添加账户。

贡献 / Contributing
欢迎大家贡献代码、提出问题或建议！请通过提交 issue 或 pull request 与我们交流。

许可证 / License
本项目遵循 MIT License。

