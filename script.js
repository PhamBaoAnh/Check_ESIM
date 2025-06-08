let data = []; // Dữ liệu gốc

const selectQuocGia = document.getElementById("filterQuocGia");
const selectSoNgay = document.getElementById("filterSoNgay");
const selectDungLuong = document.getElementById("filterDungLuong");
const ketquaDiv = document.getElementById("ketqua");

// Thêm div chứa nút copy (phải có trong HTML hoặc tạo động)
const copyBtnContainerId = "copy-btn-container";
if (!document.getElementById(copyBtnContainerId)) {
  const divCopyBtn = document.createElement("div");
  divCopyBtn.id = copyBtnContainerId;
  divCopyBtn.style.margin = "10px 0";
  ketquaDiv.parentNode.insertBefore(divCopyBtn, ketquaDiv);
}

const copyBtnContainer = document.getElementById(copyBtnContainerId);

const columns = [
  { key: "checkbox", label: "", selectable: false },           // 0 checkbox cột
  { key: "stt", label: "STT", selectable: false },             // 1 STT
  { key: "Mã sản phẩm", label: "Mã SP", selectable: true },          // 2
  { key: "Gói cước", label: "Gói cước", selectable: true },    // 3
  { key: "Quốc gia", label: "Quốc gia", selectable: true },    // 4 Đổi thành "Quốc gia"
  { key: "Số ngày", label: "Số ngày", selectable: true },      // 5
  { key: "Dung lượng", label: "Dung lượng", selectable: true },// 6
  { key: "Loại gói cước", label: "Loại gói cước", selectable: true }, // 7
  { key: " Giá bán lẻ ESIMZY ", label: "Giá bán lẻ ESIMZY", selectable: true }, // 8
  { key: "Giá KM\nsau chiết khấu ESIMZY", label: "Giá KM", selectable: true },                   // 9
  { key: " Giá bán lẻ eSIM Nhật (Yên) ", label: "Giá bán lẻ eSIM Nhật (Yên)", selectable: true }, // 10
  { key: "Region", label: "Region", selectable: true },                   // 11
  { key: "Type", label: "Type", selectable: true },                       // 12
  { key: "Nhà Mạng", label: "Nhà mạng", selectable: true },               // 13
  { key: "Ghi chú", label: "Ghi chú", selectable: true }                   // 14
];

// Lấy giá trị duy nhất cho filter
function getUniqueList(field, isSoNgay = false, isDungLuong = false) {
  const set = new Set();
  data.forEach(item => {
    let val = item[field];
    if (val) {
      val = val.toString().trim();
      if (isDungLuong) {
        const match = val.match(/(\d+)\s*GB/i);
        if (match) set.add(match[1]);
      } else {
        set.add(val);
      }
    }
  });
  let arr = Array.from(set);
  if (isSoNgay) {
    arr.sort((a,b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0));
  } else {
    arr.sort();
  }
  return arr;
}

// Tạo options cho các filter select
function populateFilterOptions() {
  // Xóa option hiện có trước khi thêm mới
  selectQuocGia.innerHTML = `<option value="">--Chọn Quốc gia--</option>`;
  selectSoNgay.innerHTML = `<option value="">--Chọn Số ngày--</option>`;
  selectDungLuong.innerHTML = `<option value="">--Chọn Dung lượng--</option>`;

  const quocGiaList = getUniqueList("Quốc gia");
  quocGiaList.forEach(qg => {
    const option = document.createElement("option");
    option.value = qg;
    option.textContent = qg;
    selectQuocGia.appendChild(option);
  });

  const soNgayList = getUniqueList("Số ngày", true);
  soNgayList.forEach(ngay => {
    const option = document.createElement("option");
    option.value = ngay;
    option.textContent = ngay;
    selectSoNgay.appendChild(option);
  });

  const dungLuongList = getUniqueList("Dung lượng", false, true);
  dungLuongList.forEach(dl => {
    const option = document.createElement("option");
    option.value = dl;
    option.textContent = dl + " GB";
    selectDungLuong.appendChild(option);
  });
}

// Hàm tạo HTML bảng (chỉ trả về chuỗi)
function taoTableHTML(ds) {
  if (ds.length === 0) {
    return "<p>🔎 Không tìm thấy kết quả phù hợp.</p>";
  }

  let tableHTML = `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width: 100%; max-width: 100%; overflow-x:auto;">`;
  tableHTML += `<thead><tr>`;

  tableHTML += `<th><input type="checkbox" id="selectAll" /></th>`;
  tableHTML += `<th>STT</th>`;

  for(let i = 2; i < columns.length; i++) {
    tableHTML += `<th>
      ${columns[i].label} 
      <input type="checkbox" class="colToggle" data-col-index="${i}" style="margin-left:5px; vertical-align: middle;" checked />
    </th>`;
  }

  tableHTML += `</tr></thead><tbody>`;

  ds.forEach((sp, index) => {
    tableHTML += `<tr>
      <td><input type="checkbox" class="rowCheckbox" data-index="${index}"></td>
      <td>${index + 1}</td>`;

    for(let i = 2; i < columns.length; i++) {
      const key = columns[i].key;
      tableHTML += `<td>${sp[key] || ""}</td>`;
    }

    tableHTML += `</tr>`;
  });

  tableHTML += `</tbody></table>`;

  return tableHTML;
}

// Hiển thị bảng kèm nút copy và gán event
function hienThiBang(ds) {
  if (ds.length === 0) {
    ketquaDiv.innerHTML = "<p>🔎 Không tìm thấy kết quả phù hợp.</p>";
    copyBtnContainer.innerHTML = "";
    return;
  }

  copyBtnContainer.innerHTML = `<button id="copySelectedBtn" style="margin-bottom:10px;">Copy dòng và cột đã chọn</button>`;

  // Tạo bảng
  const tableHTML = taoTableHTML(ds);

  // Tạo danh sách card cho mobile
  let listViewHTML = `<div class="list-view">`;
  ds.forEach((sp, index) => {
    listViewHTML += `<div class="card" data-index="${index}">
      <div><input type="checkbox" class="rowCheckbox" data-index="${index}" /> <strong>STT: ${index + 1}</strong></div>`;
    for (let i = 2; i < columns.length; i++) {
      const key = columns[i].key;
      const label = columns[i].label;
      const value = sp[key] || "";
      listViewHTML += `<div><strong>${label}:</strong> ${value}</div>`;
    }
    listViewHTML += `</div>`;
  });
  listViewHTML += `</div>`;

  ketquaDiv.innerHTML = tableHTML + listViewHTML;

  // Sự kiện chọn tất cả dòng (checkbox trong bảng)
  document.getElementById("selectAll").addEventListener("change", function () {
    const checked = this.checked;
    document.querySelectorAll(".rowCheckbox").forEach(cb => cb.checked = checked);
  });

  // Sự kiện nút copy
  document.getElementById("copySelectedBtn").addEventListener("click", () => {
    copySelectedCells(ds);
  });
}

// Hàm copy dữ liệu theo dòng và cột chọn
function copySelectedCells(ds) {
  const checkedRows = Array.from(document.querySelectorAll(".rowCheckbox:checked"))
    .map(cb => parseInt(cb.getAttribute("data-index")));

  if (checkedRows.length === 0) {
    alert("Vui lòng chọn ít nhất một dòng để sao chép.");
    return;
  }

  const checkedCols = Array.from(document.querySelectorAll(".colToggle:checked"))
    .map(cb => parseInt(cb.getAttribute("data-col-index")));

  if (checkedCols.length === 0) {
    alert("Vui lòng chọn ít nhất một cột để sao chép.");
    return;
  }

  const copiedRecords = checkedRows.map(rowIndex => {
    const sp = ds[rowIndex];

    const lines = checkedCols.map(colIndex => {
      const label = columns[colIndex].label;
      const key = columns[colIndex].key;
      const value = sp[key] || "";
      return `- ${label}: ${value}`;
    });

    return lines.join("\n");
  });

  const copiedText = copiedRecords.join("\n------------------------\n");

  navigator.clipboard.writeText(copiedText)
    .then(() => alert("✅ Đã sao chép dữ liệu đã chọn vào bộ nhớ tạm."))
    .catch(err => alert("❌ Lỗi khi sao chép dữ liệu: " + err));
}

// Hàm tìm kiếm sản phẩm theo filter và từ khóa
function timKiemSanPham() {
  const keyword = document.getElementById("keyword").value.toLowerCase().trim();
  const filterQG = selectQuocGia.value;
  const filterNgay = selectSoNgay.value;
  const filterDL = selectDungLuong.value;

  let ketQua = data;

  // Lọc theo từ khóa
  if (keyword) {
    ketQua = ketQua.filter(sp =>
      Object.values(sp).some(value =>
        String(value).toLowerCase().includes(keyword)
      )
    );
  }

  // Lọc theo Quốc gia
  if (filterQG) {
    ketQua = ketQua.filter(sp => {
      const qg = sp["Quốc gia"] || "";
      return qg.trim() === filterQG;
    });
  }

  // Lọc theo Số ngày
  if (filterNgay) {
    ketQua = ketQua.filter(sp => {
      const soNgay = sp["Số ngày"] || "";
      return soNgay.trim() === filterNgay;
    });
  }

  // Lọc theo Dung lượng
  if (filterDL) {
    ketQua = ketQua.filter(sp => {
      const dlStr = sp["Dung lượng"] || "";
      const match = dlStr.match(/(\d+)\s*GB/i);
      return match && match[1] === filterDL;
    });
  }

  hienThiBang(ketQua);
}

// Load dữ liệu từ file JSON và chuẩn hóa
fetch('data_sanpham.json')
  .then(res => res.json())
  .then(json => {
    // Chuẩn hóa key "Quốc gia/\nKhu vực" thành "Quốc gia"
    data = json.map(item => {
      if (item["Quốc gia/\nKhu vực"]) {
        item["Quốc gia"] = item["Quốc gia/\nKhu vực"];
        delete item["Quốc gia/\nKhu vực"];
      }
      return item;
    });
    populateFilterOptions();

    // Tự động gọi timKiemSanPham khi chọn giá trị trong combobox
    selectQuocGia.addEventListener("change", timKiemSanPham);
    selectSoNgay.addEventListener("change", timKiemSanPham);
    selectDungLuong.addEventListener("change", timKiemSanPham);

    // Nếu bạn có ô nhập từ khóa (input#keyword), bạn có thể gọi timKiemSanPham khi nhập:
    const inputKeyword = document.getElementById("keyword");
    if (inputKeyword) {
      inputKeyword.addEventListener("input", timKiemSanPham);
    }

    hienThiBang(data);
  })
  .catch(err => {
    ketquaDiv.textContent = "❌ Không thể tải dữ liệu.";
    console.error(err);
  });
