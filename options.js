document.addEventListener("DOMContentLoaded", () => {
  const exportButton = document.getElementById("exportData");
  const importButton = document.getElementById("importData");
  const importFileInput = document.getElementById("importFileInput");

  // 工具函数：ArrayBuffer 转 Base64
  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // 工具函数：Base64 转 Uint8Array
  function base64ToUint8Array(base64) {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // 利用 PBKDF2 派生密钥
  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // 加密数据（AES-GCM）
  async function encryptData(data, password) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(data)
    );
    // 合并 salt + iv + 密文
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    return arrayBufferToBase64(combined.buffer);
  }

  // 解密数据
  async function decryptData(encryptedData, password) {
    const combined = base64ToUint8Array(encryptedData);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const ciphertext = combined.slice(28);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }

  // 从 chrome.storage 中加载数据
  function loadAccounts(callback) {
    chrome.storage.local.get("accounts", (result) => {
      const accounts = result.accounts || [];
      callback(accounts);
    });
  }

  // 导出数据，支持加密
  exportButton.addEventListener("click", async () => {
    loadAccounts(async (accounts) => {
      let data = JSON.stringify(accounts);
      let password = prompt("请输入用于加密导出数据的密码（留空则不加密）：");
      if (password) {
        try {
          const encrypted = await encryptData(data, password);
          // 加上标记，便于识别加密内容
          data = "ENCRYPTED:" + encrypted;
        } catch (e) {
          alert("加密失败: " + e);
          return;
        }
      }
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "totp_accounts.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  // 触发文件选择
  importButton.addEventListener("click", () => {
    importFileInput.click();
  });

  // 导入数据，支持解密
  importFileInput.addEventListener("change", () => {
    const file = importFileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        let text = reader.result;
        let isEncrypted = false;
        if (text.startsWith("ENCRYPTED:")) {
          isEncrypted = true;
          text = text.substring("ENCRYPTED:".length);
        }
        if (isEncrypted) {
          const password = prompt("请输入解密数据的密码：");
          if (!password) {
            alert("密码不能为空");
            return;
          }
          try {
            text = await decryptData(text, password);
          } catch (e) {
            alert("解密失败，密码可能不正确");
            return;
          }
        }
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          alert("导入失败：数据格式不正确");
          return;
        }
        // 弹出确认框：点击“确认”追加数据（不清空原有数据），点击“取消”覆盖原有数据
        const mergeData = confirm("请确认导入操作：\n点击“确认”将追加数据，不清空原有数据；\n点击“取消”将覆盖原有数据（清空原有数据）");
        if (mergeData) {
          chrome.storage.local.get("accounts", (result) => {
            const existing = result.accounts || [];
            const merged = existing.concat(data);
            chrome.storage.local.set({ accounts: merged }, () => {
              alert("导入成功（已追加数据）");
            });
          });
        } else {
          chrome.storage.local.set({ accounts: data }, () => {
            alert("导入成功（已覆盖原有数据）");
          });
        }
      } catch (err) {
        console.error("解析错误：", err);
        alert("导入失败");
      } finally {
        importFileInput.value = "";
      }
    };
    reader.readAsText(file);
  });
});
