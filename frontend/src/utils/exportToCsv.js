export function exportToCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    if (val == null) return "";
    const s = String(val).replaceAll('"', '""');
    return `"${s}"`;
  };
  const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => escape(r[h])).join(","))).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
