let data = []; // Dữ liệu gốc

const selectQuocGia = document.getElementById("filterQuocGia");
const selectSoNgay = document.getElementById("filterSoNgay");
const selectDungLuong = document.getElementById("filterDungLuong");
const ketquaDiv = document.getElementById("ketqua");

const columns = [
  { key: "checkbox", label: "" },           // 0 checkbox cột
  { key: "stt", label: "STT" },             // 1 STT
  { key: "maSP", label: "Mã SP" },          // 2
  { key: "goiCuoc", label: "Gói cước" },    // 3
  { key: "quocGia", label: "Quốc gia" },    // 4
  { key: "soNgay", label: "Số ngày" },      // 5
  { key: "dungLuong", label: "Dung lượng" },// 6
  { key: "loaiGoiCuoc", label: "Loại gói cước" }, // 7
  { key: "giaBanLeESIMZY", label: "Giá bán lẻ ESIMZY" }, // 8
  { key: "giaKM", label: "Giá KM" },                   // 9
  { key: "giaBanLeESIMNhat", label: "Giá bán lẻ eSIM Nhật (Yên)" }, // 10
  { key: "region", label: "Region" },                   // 11
  { key: "type", label: "Type" },                       // 12
  { key: "nhaMang", label: "Nhà mạng" },               // 13
  { key: "ghiChu", label: "Ghi chú" }                   // 14
];

// Hàm lấy danh sách duy nhất, sắp xếp
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

function populateFilterOptions() {
  const quocGiaList = getUniqueList("Quốc gia/\nKhu vực");
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

function hienThiBang(ds) {
  if (ds.length === 0) {
    ketquaDiv.innerHTML = "<p>🔎 Không tìm thấy kết quả phù hợp.</p>";
    return;
  }

  let html = `<button id="copySelectedBtn" style="margin-bottom:10px;">Copy dòng và cột đã chọn</button>`;
  html += `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width: 100%; max-width: 100%; overflow-x:auto;">`;
  html += `<thead><tr>`;

  columns.forEach((col, i) => {
    if (col.key === "checkbox") {
      // checkbox chọn tất cả dòng
      html += `<th><input type="checkbox" id="selectAll" /></th>`;
    } else if (col.key === "stt") {
      // STT không có checkbox chọn cột
      html += `<th>${col.label}</th>`;
    } else {
      // checkbox cột KHÔNG checked mặc định
      html += `<th>
        <div style="display:flex; align-items:center; gap:6px;">
          <span>${col.label}</span>
          <input type="checkbox" class="colToggle" data-col-index="${i}" />
        </div>
      </th>`;
    }
  });

  html += `</tr></thead><tbody>`;

  ds.forEach((sp, index) => {
    html += `<tr>
      <td><input type="checkbox" class="rowCheckbox" data-index="${index}"></td>
      <td>${index + 1}</td>
      <td>${sp["Mã sản phẩm"] || ""}</td>
      <td>${sp["Gói cước"] || ""}</td>
      <td>${sp["Quốc gia/\nKhu vực"] || ""}</td>
      <td>${sp["Số ngày"] || ""}</td>
      <td>${sp["Dung lượng"] || ""}</td>
      <td>${sp["Loại gói cước"] || ""}</td>
      <td>${sp[" Giá bán lẻ ESIMZY "] || ""}</td>
      <td>${sp["Giá KM\nsau chiết khấu ESIMZY"] || ""}</td>
      <td>${sp[" Giá bán lẻ eSIM Nhật (Yên) "] || ""}</td>
      <td>${sp["Region"] || ""}</td>
      <td>${sp["Type"] || ""}</td>
      <td>${sp["Nhà Mạng"] || ""}</td>
      <td>${sp["Ghi chú"] || ""}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  ketquaDiv.innerHTML = html;

  // Checkbox chọn tất cả dòng
  document.getElementById("selectAll").addEventListener("change", function () {
    document.querySelectorAll(".rowCheckbox").forEach(cb => cb.checked = this.checked);
  });

  // Nút copy dòng + cột đã chọn
  document.getElementById("copySelectedBtn").addEventListener("click", () => {
    copySelectedCells(ds);
  });
}

// Hàm copy dòng và cột được chọn, nhận ds là dữ liệu đang hiển thị
function copySelectedCells(ds) {
  const checkedRows = Array.from(document.querySelectorAll(".rowCheckbox:checked"))
    .map(cb => parseInt(cb.getAttribute("data-index")));

  if (checkedRows.length === 0) {
    alert("Vui lòng chọn ít nhất một dòng để sao chép.");
    return;
  }

  let checkedCols = Array.from(document.querySelectorAll(".colToggle:checked"))
    .map(cb => parseInt(cb.getAttribute("data-col-index")))
    .filter(i => i !== 0 && i !== 1);

  if (checkedCols.length === 0) {
    alert("Vui lòng chọn ít nhất một cột để sao chép.");
    return;
  }

  const copiedRecords = checkedRows.map(rowIndex => {
  const sp = ds[rowIndex];

  const lines = checkedCols.map(colIndex => {
    const label = columns[colIndex].label;

    let value = "";
    switch (colIndex) {
      case 2: value = sp["Mã sản phẩm"] || ""; break;
      case 3: value = sp["Gói cước"] || ""; break;
      case 4: value = sp["Quốc gia/\nKhu vực"] || ""; break;
      case 5: value = sp["Số ngày"] || ""; break;
      case 6: value = sp["Dung lượng"] || ""; break;
      case 7: value = sp["Loại gói cước"] || ""; break;
      case 8: value = sp[" Giá bán lẻ ESIMZY "] || ""; break;
      case 9: value = sp["Giá KM\nsau chiết khấu ESIMZY"] || ""; break;
      case 10: value = sp[" Giá bán lẻ eSIM Nhật (Yên) "] || ""; break;
      case 11: value = sp["Region"] || ""; break;
      case 12: value = sp["Type"] || ""; break;
      case 13: value = sp["Nhà Mạng"] || ""; break;
      case 14: value = sp["Ghi chú"] || ""; break;
      default: value = ""; break;
    }

    return `- ${label}: ${value}`;
  });

  return lines.join("\n");
});

const copiedText = copiedRecords.join("\n------------------------\n");

navigator.clipboard.writeText(copiedText)
  .then(() => alert("✅ Đã sao chép dữ liệu đã chọn vào bộ nhớ tạm."))
  .catch(err => alert("❌ Lỗi khi sao chép dữ liệu: " + err));


}


function timKiemSanPham() {
  const keyword = document.getElementById("keyword").value.toLowerCase().trim();
  const filterQG = selectQuocGia.value;
  const filterNgay = selectSoNgay.value;
  const filterDL = selectDungLuong.value;

  let ketQua = data;

  if (keyword) {
    ketQua = ketQua.filter(sp =>
      Object.values(sp).some(value =>
        String(value).toLowerCase().includes(keyword)
      )
    );
  }

  if (filterQG) {
    ketQua = ketQua.filter(sp => sp["Quốc gia/\nKhu vực"] === filterQG);
  }

  if (filterNgay) {
    ketQua = ketQua.filter(sp => sp["Số ngày"] === filterNgay);
  }

  if (filterDL) {
    ketQua = ketQua.filter(sp => {
      const dlStr = sp["Dung lượng"] || "";
      const match = dlStr.match(/(\d+)\s*GB/i);
      return match && match[1] === filterDL;
    });
  }

  hienThiBang(ketQua);
}

// Load dữ liệu
fetch('data_sanpham.json')
  .then(res => res.json())
  .then(json => {
    data = json;
    populateFilterOptions();
    hienThiBang(data);
  })
  .catch(err => {
    ketquaDiv.textContent = "❌ Không thể tải dữ liệu.";
    console.error(err);
  });