// ===== LẤY NGÀY HÔM NAY =====
function getToday() {
  let d = new Date();
  return d.toISOString().split("T")[0]; // yyyy-mm-dd
}
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

// ===== LƯU BÁO CÁO =====
function saveData() {
  let name = document.getElementById("name").value.trim();
  let status = document.getElementById("status").value;
  let note = document.getElementById("note").value.trim();

  if (name === "") {
    alert("Nhập họ tên trước khi gửi!");
    return;
  }

  let report = {
    name,
    status,
    note,
    time: new Date().toLocaleString()
  };

  // 👉 Lưu theo ngày
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};

  let today = getToday();

  if (!allReports[today]) {
    allReports[today] = [];
  }

  allReports[today].unshift(report);

  localStorage.setItem("reports", JSON.stringify(allReports));

  showData();

  document.getElementById("name").value = "";
  document.getElementById("note").value = "";
}

// ===== HIỂN THỊ HÔM NAY =====
function showData() {
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};
  let today = getToday();

  let data = allReports[today] || [];

  let html = "";

  if (data.length === 0) {
    html = "<p>Hôm nay chưa có báo cáo</p>";
  } else {
    data.forEach((item, index) => {
    html += `
  <div onclick="viewDetail('${key}')"
       style="border:1px solid #ccc;margin:5px;padding:5px;cursor:pointer;">
    <b>${key}</b><br>
    Quân số: ${report[key].total}<br>
    Cần chú ý: ${report[key].warn}
  </div>
`;
    });
  }

  document.getElementById("result").innerHTML = html;
}

// ===== XÓA 1 NGƯỜI =====
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

  if (confirm("Xóa báo cáo hôm nay?")) {
    delete allReports[today];

    localStorage.setItem("reports", JSON.stringify(allReports));

    showData();
  }
}

// ===== XEM LỊCH SỬ =====
function showHistory() {
  let allReports = JSON.parse(localStorage.getItem("reports")) || {};

  let html = "<h3>📅 Lịch sử báo cáo</h3>";

  for (let date in allReports) {
    html += `<b>${date}</b><br>`;

    allReports[date].forEach(item => {
      html += `- ${item.name} (${item.status})<br>`;
    });

    html += "<hr>";
  }

  document.getElementById("history").innerHTML = html;
}

// ===== LOAD KHI MỞ APP =====
showData();
// ===== BÁO CÁO TỰ ĐỘNG THEO CẤP =====
function autoReport() {
  let report = {};

  // gom dữ liệu
  soldiers.forEach(s => {
    if (!report[s.cap]) {
      report[s.cap] = { total: 0, warn: 0 };
    }

    report[s.cap].total++;

    if (s.status === "Cần chú ý") {
      report[s.cap].warn++;
    }
  });

  let html = "<h3>📊 Dashboard tư tưởng đơn vị</h3>";

  for (let key in report) {
    let total = report[key].total;
    let warn = report[key].warn;

    // 🎯 LOGIC MÀU THEO TƯ TƯỞNG
    let color = "green";

    if (warn >= 3) {
      color = "red";
    } else if (warn >= 1) {
      color = "orange";
    } else {
      color = "green";
    }

    html += `
      <div style="
        display:inline-block;
        width:200px;
        border:2px solid ${color};
        background:${color};
        color:white;
        margin:8px;
        padding:10px;
        border-radius:10px;
        text-align:center;
        cursor:pointer;
      " onclick="viewDetail('${key}')">

        <b>${key.toUpperCase()}</b><br>
        👥 ${total}<br>
        ⚠️ ${warn}

      </div>
    `;
  }

  document.getElementById("report").innerHTML = html;
}
  let report = {
    trungdoan: { total: 0, warn: 0 },
    tieudoan1: { total: 0, warn: 0 },
    tieudoan2: { total: 0, warn: 0 },
    tieudoan3: { total: 0, warn: 0 },
    d1: { total: 0, warn: 0 },
    d2: { total: 0, warn: 0 },
    d3: { total: 0, warn: 0 },
    dkz: { total: 0, warn: 0 },
    td1: { total: 0, warn: 0 },
    td2: { total: 0, warn: 0 },
    td3: { total: 0, warn: 0 },
    hoaluc: { total: 0, warn: 0 }
  };

  soldiers.forEach(s => {
    let cap = s.cap;

    if (report[cap]) {
      report[cap].total++;
      if (s.status === "Cần chú ý") report[cap].warn++;
    }

    report.trungdoan.total++;
    if (s.status === "Cần chú ý") report.trungdoan.warn++;
  });

  let html = "<h3>📊 Báo cáo tự động theo cấp</h3>";

  for (let key in report) {
    html += `
      <div style="border:1px solid #ccc;margin:5px;padding:5px;">
        <b>${key}</b><br>
        Quân số: ${report[key].total}<br>
        Cần chú ý: ${report[key].warn}
      </div>
    `;
  }

  document.getElementById("report").innerHTML = html;
}
function viewDetail(cap) {
  let list = soldiers.filter(s => s.cap === cap);

  let html = "<h3>Chi tiết " + cap + "</h3>";

  list.forEach(s => {
    html += `- ${s.name} (${s.status})<br>`;
  });

  document.getElementById("report").innerHTML = html;
}
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

  let html = `
    <h3>📊 Thống kê</h3>
    Hôm nay: ${(allReports[today] || []).length}<br>
    Tuần: ${week}<br>
    Tháng: ${month}
  `;

  document.getElementById("report").innerHTML = html;
}