(() => {
  let data = []; // Dữ liệu gốc

  const selectQuocGia = document.getElementById("filterQuocGia");
  const selectSoNgay = document.getElementById("filterSoNgay");
  const selectDungLuong = document.getElementById("filterDungLuong");
  const ketquaDiv = document.getElementById("ketqua");

  const copyBtnContainerId = "copy-btn-container";
  if (!document.getElementById(copyBtnContainerId)) {
    const divCopyBtn = document.createElement("div");
    divCopyBtn.id = copyBtnContainerId;
    divCopyBtn.style.margin = "10px 0";
    ketquaDiv.parentNode.insertBefore(divCopyBtn, ketquaDiv);
  }
  const copyBtnContainer = document.getElementById(copyBtnContainerId);

  // Cập nhật column theo JSON eSIM
  const columns = [
    { key: "checkbox", label: "", selectable: false },
    { key: "stt", label: "STT", selectable: false },
    { key: "Gói dịch vụ", label: "Gói dịch vụ", selectable: true },
    { key: "Quốc gia", label: "Quốc gia", selectable: true },
    { key: "Số ngày", label: "Số ngày", selectable: true },
    { key: "Dung lượng", label: "Dung lượng", selectable: true },
    { key: "Loại gói cước", label: "Loại gói cước", selectable: true },
    { key: "Giá bán lẻ ESIMZY", label: "Giá bán lẻ ESIMZY", selectable: true },
    { key: "Ghi chú", label: "Ghi chú", selectable: true }
  ];

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
      arr.sort((a, b) => (parseInt(a.match(/\d+/)) || 0) - (parseInt(b.match(/\d+/)) || 0));
    } else {
      arr.sort();
    }
    return arr;
  }

  function populateFilterOptions() {
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

  function taoTableHTML(ds) {
    if (ds.length === 0) return "<p>🔎 Không tìm thấy kết quả phù hợp.</p>";

    let tableHTML = `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width: 100%;">`;
    tableHTML += `<thead><tr><th><input type="checkbox" id="selectAll" /></th><th>STT</th>`;

    // Mảng chứa tên các cột KHÔNG tích checkbox lúc đầu
    const uncheckedCols = ["Loại gói cước", "Ghi chú"];

    for (let i = 2; i < columns.length; i++) {
      const colLabel = columns[i].label;
      const isChecked = uncheckedCols.includes(colLabel) ? "" : "checked";
      tableHTML += `<th>
        ${colLabel}
        <input type="checkbox" class="colToggle" data-col-index="${i}" style="margin-left:5px;" ${isChecked} />
      </th>`;
    }

    tableHTML += `</tr></thead><tbody>`;

    ds.forEach((sp, index) => {
      tableHTML += `<tr><td><input type="checkbox" class="rowCheckbox" data-index="${index}"></td><td>${index + 1}</td>`;
      for (let i = 2; i < columns.length; i++) {
        const key = columns[i].key;
        tableHTML += `<td>${sp[key] || ""}</td>`;
      }
      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table>`;
    return tableHTML;
  }

  function hienThiBang(ds) {
    if (ds.length === 0) {
      ketquaDiv.innerHTML = "<p>🔎 Không tìm thấy kết quả phù hợp.</p>";
      copyBtnContainer.innerHTML = "";
      return;
    }

    copyBtnContainer.innerHTML = `<button id="copySelectedBtn" style="margin-bottom:10px;">Copy dòng và cột đã chọn</button>`;
    const tableHTML = taoTableHTML(ds);

    // Thêm nút selectAll cho list view
    let listViewHTML = `
      <div style="margin-top:15px; margin-bottom:5px;">
        <label><input type="checkbox" id="selectAllCards" /> Chọn tất cả (danh sách)</label>
      </div>
      <div class="list-view">`;

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

    // Sự kiện checkbox selectAll trong bảng
    document.getElementById("selectAll").addEventListener("change", function () {
      const checked = this.checked;
      // Chỉ chọn checkbox trong bảng (tránh checkbox danh sách)
      document.querySelectorAll("table .rowCheckbox").forEach(cb => cb.checked = checked);
    });

    // Sự kiện checkbox selectAll trong danh sách card
    const selectAllCardsCb = document.getElementById("selectAllCards");
    if (selectAllCardsCb) {
      selectAllCardsCb.addEventListener("change", function () {
        const checked = this.checked;
        // Chỉ chọn checkbox trong danh sách card (tránh ảnh hưởng checkbox bảng)
        document.querySelectorAll(".list-view .rowCheckbox").forEach(cb => cb.checked = checked);
      });
    }

    document.getElementById("copySelectedBtn").addEventListener("click", () => {
      copySelectedCells(ds);
    });
  }

  function copySelectedCells(ds) {
    // Lấy checkbox dòng đã check trong bảng
    const checkedRowsTable = Array.from(document.querySelectorAll("table .rowCheckbox:checked"))
      .map(cb => parseInt(cb.getAttribute("data-index")));

    // Lấy checkbox dòng đã check trong danh sách card
    const checkedRowsCards = Array.from(document.querySelectorAll(".list-view .rowCheckbox:checked"))
      .map(cb => parseInt(cb.getAttribute("data-index")));

    // Gộp 2 mảng và loại trùng
    const checkedRows = Array.from(new Set([...checkedRowsTable, ...checkedRowsCards]));

    if (checkedRows.length === 0) {
      alert("Vui lòng chọn ít nhất một dòng để sao chép.");
      return;
    }

    // Lấy các cột được chọn
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
      ketQua = ketQua.filter(sp => (sp["Quốc gia"] || "").trim() === filterQG);
    }

    if (filterNgay) {
      ketQua = ketQua.filter(sp => (sp["Số ngày"] || "").trim() === filterNgay);
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

  fetch('data_sanpham.json')
    .then(res => res.json())
    .then(json => {
      // Chuẩn hóa GHI CHÚ -> Ghi chú
      data = json.map(item => {
        if (item["GHI CHÚ"]) {
          item["Ghi chú"] = item["GHI CHÚ"];
          delete item["GHI CHÚ"];
        }
        return item;
      });

      populateFilterOptions();

      selectQuocGia.addEventListener("change", timKiemSanPham);
      selectSoNgay.addEventListener("change", timKiemSanPham);
      selectDungLuong.addEventListener("change", timKiemSanPham);

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
})();
