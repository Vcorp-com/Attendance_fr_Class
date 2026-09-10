import htmlDocx from "html-docx-js/dist/html-docx";

// Escape values before dropping them into the HTML template so a
// stray < or & in a name doesn't break the document.
function esc(s) {
	return String(s).replace(
		/[&<>"']/g,
		(c) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[c],
	);
}

// Build the HTML string that becomes the Word doc.
// Same layout as the original: title, meta line, attendance table.
export function buildAttendanceDocHtml(clsName, classLabel, dateStr, list) {
	const rows = list
		.map(
			(r, i) =>
				`<tr><td>${i + 1}</td><td>${esc(r.roll)}</td><td>${esc(
					r.name,
				)}</td><td>${esc(r.time)}</td></tr>`,
		)
		.join("");

	return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
    <h2 style="font-family:Arial, sans-serif;">${esc(clsName)}</h2>
    <p style="font-family:Arial, sans-serif;">
      <b>Class:</b> ${esc(classLabel)}<br/>
      <b>Date:</b> ${esc(dateStr)}<br/>
      <b>Total Present:</b> ${list.length}
    </p>
    <table border="1" cellspacing="0" cellpadding="6"
      style="border-collapse:collapse;width:100%;font-family:Arial, sans-serif;font-size:12px;">
      <thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Time</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4">No one marked present.</td></tr>'}</tbody>
    </table>
  </body></html>`;
}

// Turn that HTML into a .docx blob and trigger a browser download.
export function downloadHtmlAsDocx(htmlString, filename) {
	try {
		const blob = htmlDocx.asBlob(htmlString);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	} catch (e) {
		alert("Word export failed — please try again.");
		console.error(e);
	}
}
