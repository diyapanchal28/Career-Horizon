const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

/**
 * Sanitize string value to prevent CSV/Excel formula injection
 */
function sanitizeCellValue(val) {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (/^[=+@-]$/.test(str[0])) {
        return `'${str}`;
    }
    return str;
}

/**
 * Generate Excel workbook for any report
 * Returns Buffer
 */
async function generateExcelReport(reportData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Career Horizon Admin Reporting System";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Report Data", {
        views: [{ showGridLines: true }]
    });

    // 1. Report Title & Header Block
    const titleRow = sheet.addRow(["CAREER HORIZON — ADMIN REPORTING SYSTEM"]);
    titleRow.font = { name: "Arial", size: 16, bold: true, color: { argb: "FF632CD6" } };
    sheet.mergeCells("A1:E1");

    const subtitleRow = sheet.addRow([reportData.reportName.toUpperCase()]);
    subtitleRow.font = { name: "Arial", size: 13, bold: true, color: { argb: "FF1E1835" } };
    sheet.mergeCells("A2:E2");

    sheet.addRow([
        `Generated On: ${new Date(reportData.generatedAt).toLocaleString()}`,
        "",
        `Reporting Period: ${reportData.periodLabel || "All Time"}`
    ]);
    sheet.getRow(3).font = { name: "Arial", size: 10, italic: true, color: { argb: "FF6B6684" } };
    sheet.addRow([]); // Blank spacer

    // 2. Statistical Summary Section
    const summaryHeader = sheet.addRow(["STATISTICAL SUMMARY"]);
    summaryHeader.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF632CD6" } };

    if (reportData.summary) {
        Object.entries(reportData.summary).forEach(([key, val]) => {
            const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase());
            const row = sheet.addRow([formattedKey, sanitizeCellValue(val)]);
            row.getCell(1).font = { bold: true, color: { argb: "FF333333" } };
            row.getCell(2).font = { color: { argb: "FF1E1835" } };
        });
    }
    sheet.addRow([]); // Blank spacer

    // 3. Detailed Data Table
    const tableHeader = sheet.addRow(["DETAILED REPORT RECORDS"]);
    tableHeader.font = { name: "Arial", size: 11, bold: true, color: { argb: "FF632CD6" } };

    const columns = reportData.table?.columns || [];
    const rows = reportData.table?.rows || [];

    if (columns.length > 0) {
        const colHeaderLabels = columns.map((c) => c.label);
        const colHeaderRow = sheet.addRow(colHeaderLabels);

        colHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF632CD6" }
            };
            cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
            cell.alignment = { vertical: "middle", horizontal: "left" };
            cell.border = {
                top: { style: "thin", color: { argb: "FFDDDDDD" } },
                bottom: { style: "medium", color: { argb: "FF521FC4" } }
            };
        });

        rows.forEach((rowObj, rIdx) => {
            const rowValues = columns.map((c) => sanitizeCellValue(rowObj[c.key]));
            const dataRow = sheet.addRow(rowValues);

            const isEven = rIdx % 2 === 0;
            dataRow.eachCell((cell) => {
                cell.font = { name: "Arial", size: 9 };
                cell.alignment = { vertical: "middle", horizontal: "left" };
                cell.border = {
                    bottom: { style: "thin", color: { argb: "FFEAEAEA" } }
                };
                if (!isEven) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFBF9FF" }
                    };
                }
            });
        });
    }

    // Auto-fit column widths
    sheet.columns.forEach((col) => {
        let maxLen = 14;
        col.eachCell({ includeEmpty: false }, (cell) => {
            const cellLen = cell.value ? String(cell.value).length : 0;
            if (cellLen > maxLen) {
                maxLen = Math.min(45, cellLen + 3);
            }
        });
        col.width = maxLen;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}

/**
 * Common PDF Renderer logic
 */
function renderPdfContent(doc, reportData) {
    const primaryColor = "#632cd6";
    const darkColor = "#1e1835";
    const mutedColor = "#6b6684";
    const tableHeaderBg = "#632cd6";

    // --- Header Banner ---
    doc.rect(40, 40, 515, 60).fill("#f3effe");

    doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("CAREER HORIZON", 55, 48);

    doc.fillColor(darkColor)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(reportData.reportName, 55, 68);

    doc.fillColor(mutedColor)
        .font("Helvetica")
        .fontSize(9)
        .text(
            `Generated: ${new Date(reportData.generatedAt).toLocaleString()}  |  Period: ${reportData.periodLabel || "All Time"}`,
            55,
            83
        );

    doc.moveDown(3);

    // --- Summary KPI Block ---
    doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Statistical Summary", 40, 115);

    doc.moveTo(40, 130).lineTo(555, 130).strokeColor("#e8e3f5").lineWidth(1).stroke();

    let curY = 138;
    const summaryEntries = Object.entries(reportData.summary || {});

    // Draw summary as 2-column key-value grid
    summaryEntries.forEach(([key, val], idx) => {
        const colX = idx % 2 === 0 ? 45 : 300;
        const rowY = curY + Math.floor(idx / 2) * 18;

        const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase());

        doc.fillColor(mutedColor)
            .font("Helvetica")
            .fontSize(9)
            .text(`${formattedKey}:`, colX, rowY, { width: 140 });

        doc.fillColor(darkColor)
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(String(val), colX + 130, rowY, { width: 100 });
    });

    curY += Math.ceil(summaryEntries.length / 2) * 18 + 16;

    // --- Detailed Data Table ---
    doc.fillColor(primaryColor)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Detailed Records", 40, curY);

    curY += 15;
    doc.moveTo(40, curY).lineTo(555, curY).strokeColor("#e8e3f5").lineWidth(1).stroke();
    curY += 8;

    const columns = reportData.table?.columns || [];
    const rows = reportData.table?.rows || [];

    const availableWidth = 515;
    const colWidth = Math.floor(availableWidth / Math.max(1, columns.length));

    // Draw Table Header
    function drawTableHeader(y) {
        doc.rect(40, y, availableWidth, 20).fill(tableHeaderBg);
        columns.forEach((col, cIdx) => {
            const x = 40 + cIdx * colWidth + 5;
            doc.fillColor("#ffffff")
                .font("Helvetica-Bold")
                .fontSize(8)
                .text(col.label, x, y + 5, {
                    width: colWidth - 8,
                    height: 12,
                    ellipsis: true
                });
        });
        return y + 20;
    }

    curY = drawTableHeader(curY);

    // Draw Rows
    const rowHeight = 18;
    rows.slice(0, 300).forEach((row, rIdx) => {
        // Page overflow check
        if (curY + rowHeight > 760) {
            doc.addPage();
            curY = 50;
            curY = drawTableHeader(curY);
        }

        const isEven = rIdx % 2 === 0;
        if (!isEven) {
            doc.rect(40, curY, availableWidth, rowHeight).fill("#faf8ff");
        }

        columns.forEach((col, cIdx) => {
            const x = 40 + cIdx * colWidth + 5;
            const textVal = String(row[col.key] !== undefined ? row[col.key] : "");

            doc.fillColor("#2d2545")
                .font("Helvetica")
                .fontSize(8)
                .text(textVal, x, curY + 4, {
                    width: colWidth - 8,
                    height: 12,
                    ellipsis: true
                });
        });

        // Thin bottom border
        doc.moveTo(40, curY + rowHeight)
            .lineTo(555, curY + rowHeight)
            .strokeColor("#eeeeee")
            .lineWidth(0.5)
            .stroke();

        curY += rowHeight;
    });

    if (rows.length === 0) {
        doc.fillColor(mutedColor)
            .font("Helvetica-Oblique")
            .fontSize(10)
            .text("No data available for the selected report and date range.", 40, curY + 15, {
                align: "center",
                width: availableWidth
            });
    }

    // --- Footer & Page Numbers on all pages ---
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Footer separator
        doc.moveTo(40, 795).lineTo(555, 795).strokeColor("#e8e3f5").lineWidth(0.5).stroke();

        doc.fillColor(mutedColor)
            .font("Helvetica")
            .fontSize(8)
            .text(
                "Generated by Career Horizon – Admin Reporting System",
                40,
                805,
                { width: 300 }
            );

        doc.text(
            `Page ${i + 1} of ${range.count}`,
            400,
            805,
            { align: "right", width: 155 }
        );
    }
}

/**
 * Generate PDF as Buffer in memory
 */
function generatePdfReportBuffer(reportData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 40,
                size: "A4",
                bufferPages: true,
                info: {
                    Title: `Career Horizon — ${reportData.reportName}`,
                    Author: "Career Horizon Admin System"
                }
            });

            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            renderPdfContent(doc, reportData);
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Generate PDF report directly streamed to response
 */
function streamPdfReport(reportData, res) {
    const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        bufferPages: true,
        info: {
            Title: `Career Horizon — ${reportData.reportName}`,
            Author: "Career Horizon Admin System"
        }
    });

    doc.pipe(res);
    renderPdfContent(doc, reportData);
    doc.end();
}

module.exports = {
    generateExcelReport,
    generatePdfReportBuffer,
    streamPdfReport
};
