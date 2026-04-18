// ===== DỮ LIỆU =====
let soldiers = JSON.parse(localStorage.getItem("soldiers")) || [];

// ===== NGÀY =====
function getToday() {
  let d = new Date();
  return d.toISOString().split("T")[0];
}

// ===== HIỂN THỊ DANH SÁCH =====
function loadList() {
  let cap = document.getElementById("cap").value;
  let html = "";

  let list = soldiers;

  if (cap !== "all") {
    list = soldiers.filter(s => s.cap === cap);
  }

  list.forEach((s, index) => {
    html += `
      <div style="border:1px solid #ccc;padding:8px;margin:5px;">
        <b>${s.name}</b><br>
        <select onchange="updateStatus(${index}, this.value)">
          <option ${s.status=="Tốt"?"selected":""}>Tốt</option>
          <option ${s.status=="Bình thường"?"selected":""}>Bình thường</option>
          <option ${s.status=="Cần chú ý"?"selected":""}>Cần chú ý</option>
        </select>
      </div>
    `;
  });

  document.getElementById("result").innerHTML = html;
}

// ===== CẬP NHẬT TRẠNG THÁI =====
function updateStatus(index, value) {
  soldiers[index].status = value;
  localStorage.setItem("soldiers", JSON.stringify(soldiers));
}

// ===== LƯU BÁO CÁO =====
function saveData() {
  let name = document.getElementById("name").value.trim();
  let status = document.getElementById("status").value;
  let note = document.getElementById("note").value.trim();

  if (name === "") {
    alert("Nhập họ tên!");
    return;
  }

  let report = {
    name, status, note,
    time: new Date().toLocaleString()
  };

  let allReports = JSON.parse(localStorage.getItem("reports")) || {};
  let today = getToday();

  if (!allReports[today]) allReports[today] = [];

  allReports[today].unshift(report);

  localStorage.setItem("reports", JSON.stringify(allReports));

  showData();
}

// ===== HIỂN THỊ HÔM NAY =====
function showData() {
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};
  let today = getToday();

  let data = allReports[today] || [];

  let html = "";

  data.forEach((item, index) => {
    html += `
      <div style="border:1px solid #ccc;margin:5px;padding:5px;">
        <b>${item.name}</b> - ${item.status}<br>
        ${item.note}<br>
        <button onclick="deleteItem(${index})">Xóa</button>
      </div>
    `;
  });

  document.getElementById("result").innerHTML = html;
}

// ===== XÓA =====
function deleteItem(index) {
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};
  let today = getToday();

  let data = allReports[today] || [];
  data.splice(index, 1);

  allReports[today] = data;

  localStorage.setItem("reports", JSON.stringify(allReports));

  showData();
}

// ===== XÓA HÔM NAY =====
function clearAll() {
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};
  let today = getToday();

  if (confirm("Xóa hôm nay?")) {
    delete allReports[today];
    localStorage.setItem("reports", JSON.stringify(allReports));
    showData();
  }
}

// ===== DASHBOARD =====
function autoReport() {
  let report = {};

  soldiers.forEach(s => {
    if (!report[s.cap]) {
      report[s.cap] = { total: 0, warn: 0 };
    }

    report[s.cap].total++;

    if (s.status === "Cần chú ý") {
      report[s.cap].warn++;
    }
  });

  let html = "<h3>📊 Dashboard</h3>";

  for (let key in report) {
    let warn = report[key].warn;
    let color = warn >= 3 ? "red" : warn >= 1 ? "orange" : "green";

    html += `
      <div style="background:${color};color:white;padding:10px;margin:5px;"
      onclick="viewDetail('${key}')">
        ${key} - 👥 ${report[key].total} | ⚠️ ${warn}
      </div>
    `;
  }

  document.getElementById("report").innerHTML = html;
}

// ===== XEM CHI TIẾT =====
function viewDetail(cap) {
  let list = soldiers.filter(s => s.cap === cap);

  let html = "<h3>Chi tiết</h3>";

  list.forEach(s => {
    html += `- ${s.name} (${s.status})<br>`;
  });

  document.getElementById("report").innerHTML = html;
}

// ===== EXPORT WORD =====
function exportWord() {
  let content = document.getElementById("report").innerHTML;

  let blob = new Blob(['\ufeff', content], {
    type: 'application/msword'
  });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "baocao.doc";
  link.click();
}

// ===== THỐNG KÊ =====
function stats() {
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};
  let today = getToday();

  let week = 0;
  let month = 0;

  for (let date in allReports) {
    let d = new Date(date);
    let now = new Date();

    let diff = (now - d) / (1000 * 60 * 60 * 24);

    if (diff <= 7) week += allReports[date].length;
    if (d.getMonth() === now.getMonth()) {
      month += allReports[date].length;
    }
  }

  document.getElementById("report").innerHTML = `
    <h3>📊 Thống kê</h3>
    Hôm nay: ${(allReports[today] || []).length}<br>
    Tuần: ${week}<br>
    Tháng: ${month}
  `;
}

// ===== IMPORT EXCEL (CHUẨN) =====
function importExcel() {
  let file = document.getElementById("fileInput").files[0];
  let reader = new FileReader();

  reader.onload = function(e) {
    let data = new Uint8Array(e.target.result);
    let workbook = XLSX.read(data, { type: "array" });

    let sheet = workbook.Sheets[workbook.SheetNames[0]];
    let json = XLSX.utils.sheet_to_json(sheet);

    let existing = JSON.parse(localStorage.getItem("soldiers")) || [];

    json.forEach(row => {
      let name = row["Họ tên"];
      let td = row["Trung đội"];
      let status = row["Trạng thái"] || "Tốt";

      let cap = "d1-" + td;

      let found = existing.find(s => s.name === name && s.cap === cap);

      if (found) {
        found.status = status;
      } else {
        existing.push({ name, cap, status });
      }
    });

    localStorage.setItem("soldiers", JSON.stringify(existing));
    soldiers = existing;

    loadList();

    alert("Import thành công!");
  };

  reader.readAsArrayBuffer(file);
}

// ===== RESET =====
function resetList() {
  if (confirm("Xóa toàn bộ danh sách?")) {
    localStorage.removeItem("soldiers");
    soldiers = [];
    loadList();
  }
}

// ===== LOAD =====
loadList();