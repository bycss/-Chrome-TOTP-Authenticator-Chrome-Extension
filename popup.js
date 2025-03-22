let accounts = [];
let timer = null;

document.addEventListener("DOMContentLoaded", () => {
  const importExportButton = document.getElementById("importExport");
  const searchInput = document.getElementById("search");
  const accountsDiv = document.getElementById("accounts");
  const nameInput = document.getElementById("accountName");
  const secretInput = document.getElementById("accountSecret");
  const confirmAddBtn = document.getElementById("confirmAddAccount");

  const modalOverlay = document.getElementById("modalOverlay");
  const editModal = document.getElementById("editModal");
  const confirmModal = document.getElementById("confirmModal");
  const editName = document.getElementById("editName");
  const editSecret = document.getElementById("editSecret");
  const saveEdit = document.getElementById("saveEdit");
  const cancelEdit = document.getElementById("cancelEdit");
  const confirmText = document.getElementById("confirmText");
  const cancelDelete = document.getElementById("cancelDelete");
  const confirmDelete = document.getElementById("confirmDelete");

  let editIndex = null;

  function showMessage(msg, color = 'green') {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.color = color;
    accountsDiv.prepend(div);
    setTimeout(() => div.remove(), 2000);
  }

  function base32ToHex(base32) {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "", hex = "";
    base32 = base32.toUpperCase().replace(/=+$/, "");
    for (let i = 0; i < base32.length; i++) {
      const val = base32chars.indexOf(base32.charAt(i));
      bits += val.toString(2).padStart(5, '0');
    }
    for (let i = 0; i + 4 <= bits.length; i += 4) {
      hex += parseInt(bits.substr(i, 4), 2).toString(16);
    }
    return hex;
  }

  function leftpad(str, len, pad) {
    return pad.repeat(len - str.length) + str;
  }

  function getSecondsRemaining() {
    return 30 - Math.floor(Date.now() / 1000) % 30;
  }

  function generateTOTP(secret) {
    try {
      const key = base32ToHex(secret);
      const epoch = Math.round(new Date().getTime() / 1000.0);
      const time = leftpad(Math.floor(epoch / 30).toString(16), 16, '0');
      const crypto = window.crypto || window.msCrypto;
      const hmacKey = new Uint8Array(key.match(/.{2}/g).map(b => parseInt(b, 16)));
      const timeBuffer = new Uint8Array(time.match(/.{2}/g).map(b => parseInt(b, 16)));
      return crypto.subtle.importKey("raw", hmacKey.buffer, { name: "HMAC", hash: { name: "SHA-1" } }, false, ["sign"])
        .then(k => crypto.subtle.sign("HMAC", k, timeBuffer.buffer))
        .then(sig => {
          const h = new Uint8Array(sig);
          const offset = h[h.length - 1] & 0xf;
          const bin_code = (h[offset] & 0x7f) << 24 |
                           (h[offset + 1] & 0xff) << 16 |
                           (h[offset + 2] & 0xff) << 8 |
                           (h[offset + 3] & 0xff);
          const otp = bin_code % 1000000;
          return leftpad(otp.toString(), 6, '0');
        }).catch(() => 'ERROR');
    } catch {
      return Promise.resolve("ERROR");
    }
  }

  function createAccountRow(acc, idx) {
    const row = document.createElement("div");
    row.classList.add("account-row");
    row.dataset.index = idx;
    row.setAttribute("draggable", true);

    const nameSpan = document.createElement("span");
    nameSpan.className = "account-name";
    nameSpan.textContent = acc.name;

    const codeSpan = document.createElement("span");
    codeSpan.className = "account-code";
    codeSpan.dataset.secret = acc.secret;

    const circle = document.createElement("div");
    circle.className = "circle";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.className = "edit-btn";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editIndex = idx;
      editName.value = acc.name;
      editSecret.value = acc.secret;
      modalOverlay.style.display = "flex";
      editModal.style.display = "block";
      confirmModal.style.display = "none";
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.className = "delete-btn";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      editIndex = idx;
      confirmText.textContent = `确认删除「${acc.name}」？`;
      modalOverlay.style.display = "flex";
      editModal.style.display = "none";
      confirmModal.style.display = "block";
    });

    const actionSpan = document.createElement("span");
    actionSpan.className = "account-actions";
    actionSpan.appendChild(editBtn);
    actionSpan.appendChild(delBtn);

    row.appendChild(nameSpan);
    row.appendChild(codeSpan);
    row.appendChild(circle);
    row.appendChild(actionSpan);

    codeSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(codeSpan.textContent).then(() => {
        showMessage("已复制");
      });
    });

    return row;
  }

  function renderAccounts(filter = "") {
    accountsDiv.innerHTML = "";
    accounts.forEach((acc, idx) => {
      if (!acc.name.toLowerCase().includes(filter.toLowerCase())) return;
      const row = createAccountRow(acc, idx);
      accountsDiv.appendChild(row);
    });
  }

  function updateTOTPDisplay() {
    const remaining = getSecondsRemaining();
    const percent = ((30 - remaining) / 30) * 360;
    document.querySelectorAll(".account-code").forEach(el => {
      const secret = el.dataset.secret;
      generateTOTP(secret).then(code => {
        el.textContent = code;
        el.classList.toggle("expiring", remaining <= 5);
      });
    });
    document.querySelectorAll(".circle").forEach(el => {
      el.style.background = `conic-gradient(#007bff ${percent}deg, #e0e0e0 0deg)`;
    });
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(updateTOTPDisplay, 1000);
  }

  function saveAccounts() {
    chrome.storage.local.set({ accounts });
  }

  function loadAccounts() {
    chrome.storage.local.get("accounts", (result) => {
      accounts = result.accounts || [];
      renderAccounts();
      updateTOTPDisplay();
    });
  }

  confirmAddBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const secret = secretInput.value.trim();
    if (name && secret) {
      accounts.push({ name, secret });
      saveAccounts();
      renderAccounts();
      updateTOTPDisplay();
      nameInput.value = "";
      secretInput.value = "";
      showMessage("添加成功");
    } else {
      showMessage("请填写名称和密钥", "red");
    }
  });

  // 编辑保存事件
  saveEdit.addEventListener("click", () => {
    const newName = editName.value.trim();
    const newSecret = editSecret.value.trim();
    if (newName && newSecret) {
      accounts[editIndex] = { name: newName, secret: newSecret };
      saveAccounts();
      renderAccounts();
      updateTOTPDisplay();
      modalOverlay.style.display = "none";
      showMessage("修改成功");
    } else {
      showMessage("请填写名称和密钥", "red");
    }
  });

  // 取消编辑
  cancelEdit.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  // 取消删除
  cancelDelete.addEventListener("click", () => {
    modalOverlay.style.display = "none";
  });

  // 确认删除
  confirmDelete.addEventListener("click", () => {
    accounts.splice(editIndex, 1);
    saveAccounts();
    renderAccounts();
    updateTOTPDisplay();
    modalOverlay.style.display = "none";
    showMessage("删除成功");
  });

  // 导入导出按钮打开 options 页面
  importExportButton.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });

  // 拖拽功能
  let draggedEl = null;
  accountsDiv.addEventListener("dragstart", (e) => {
    draggedEl = e.target.closest(".account-row");
    e.dataTransfer.effectAllowed = "move";
  });
  accountsDiv.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  accountsDiv.addEventListener("drop", (e) => {
    e.preventDefault();
    const dropTarget = e.target.closest(".account-row");
    if (!dropTarget || !draggedEl) return;
    const from = Number(draggedEl.dataset.index);
    const to = Number(dropTarget.dataset.index);
    const moved = accounts.splice(from, 1)[0];
    accounts.splice(to, 0, moved);
    saveAccounts();
    renderAccounts();
    updateTOTPDisplay();
  });

  // 搜索功能
  searchInput.addEventListener("input", () => {
    renderAccounts(searchInput.value);
  });

  loadAccounts();
  startTimer();
});
//////
const qrPageButton = document.getElementById("qrPageButton");
qrPageButton.addEventListener("click", () => {
  window.open(chrome.runtime.getURL("qr.html"));
});
