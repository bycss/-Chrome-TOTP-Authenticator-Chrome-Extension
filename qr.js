document.addEventListener("DOMContentLoaded", () => {
  const qrFileInput = document.getElementById("qrFileInput");
  const resultDiv = document.getElementById("result");
  const backBtn = document.getElementById("backBtn");

  console.log("qr.js loaded");

  // 手动解析 otpauth:// 协议字符串
  // 预期格式：otpauth://totp/AccountName?secret=XXXX[&issuer=...]
  function parseOtpauthUrl(otpauthUrl) {
    console.log("开始解析二维码内容：", otpauthUrl);
    if (!otpauthUrl.startsWith("otpauth://totp/")) {
      throw new Error("二维码内容不是有效的 otpauth://totp/ 链接");
    }
    const mainPart = otpauthUrl.slice("otpauth://totp/".length);
    const [rawName, rawQuery] = mainPart.split("?");
    if (!rawName) {
      throw new Error("二维码缺少账户名称");
    }
    const accountName = decodeURIComponent(rawName);
    const params = new URLSearchParams(rawQuery || "");
    const secret = params.get("secret");
    if (!secret) {
      throw new Error("二维码中不包含 secret");
    }
    return { accountName, secret };
  }

  // 监听文件选择
  qrFileInput.addEventListener("change", () => {
    console.log("文件选择事件触发");
    const file = qrFileInput.files[0];
    if (!file) {
      console.log("没有选择文件");
      return;
    }
    console.log("选择的文件：", file.name);
    const reader = new FileReader();
    reader.onload = () => {
      console.log("文件读取成功");
      const image = new Image();
      image.onload = () => {
        console.log("图片加载完成，尺寸：", image.width, image.height);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // 调用 jsQR 进行二维码识别
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code) {
          console.log("二维码识别成功，内容：", code.data);
          try {
            const { accountName, secret } = parseOtpauthUrl(code.data);
            console.log("解析出账号：", accountName, "密钥：", secret);
            // 将新账户追加到 chrome.storage 中
            chrome.storage.local.get("accounts", (result) => {
              const existing = result.accounts || [];
              const newAccount = { name: accountName, secret: secret };
              existing.push(newAccount);
              chrome.storage.local.set({ accounts: existing }, () => {
                resultDiv.textContent = "二维码添加成功：" + accountName;
                resultDiv.style.color = "green";
                console.log("账户添加成功：", newAccount);
              });
            });
          } catch (err) {
            console.error("解析二维码失败：", err);
            resultDiv.textContent = err.message;
            resultDiv.style.color = "red";
          }
        } else {
          console.log("未识别到二维码");
          resultDiv.textContent = "未识别到二维码";
          resultDiv.style.color = "red";
        }
      };
      image.onerror = (e) => {
        console.error("图片加载错误：", e);
        resultDiv.textContent = "加载图片失败";
        resultDiv.style.color = "red";
      };
      image.src = reader.result;
    };
    reader.onerror = (e) => {
      console.error("文件读取错误：", e);
      resultDiv.textContent = "读取文件失败";
      resultDiv.style.color = "red";
    };
    reader.readAsDataURL(file);
  });

  // 返回按钮，点击后关闭当前页面或跳转回 popup
  backBtn.addEventListener("click", () => {
    console.log("返回按钮被点击");
    window.close();
    // 如需返回 popup 可使用：
    // window.location.href = chrome.runtime.getURL("popup.html");
  });
});
