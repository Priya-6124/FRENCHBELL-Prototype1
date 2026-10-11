/**
 * Excel & CSV Export Utility for FrenchBell Cafe Operations
 * Generates formatted Excel Spreadsheets (.xls XML / .xlsx compatible) and CSV with UTF-8 BOM
 */

export function exportToExcel(filename, sheetName, columns, rows) {
  // Generate XML-based Excel Spreadsheet 2003 which Excel, Google Sheets, and LibreOffice open natively
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>FrenchBell Cafe Operations</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1F110A"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#D4AF37"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FAF5ED"/>
   <Interior ss:Color="#1F110A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="RowStyle">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EAE0D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#2B160E"/>
  </Style>
  <Style ss:ID="CurrencyStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EAE0D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1F110A"/>
   <NumberFormat ss:Format="&quot;₹&quot;#,##0.00"/>
  </Style>
  <Style ss:ID="StatusStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EAE0D5"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#8B5A2B"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sheetName || 'Report')}">
  <Table ss:DefaultRowHeight="22">
`;

  // Columns definition
  let colsXml = '';
  columns.forEach(col => {
    colsXml += `   <Column ss:Width="${col.width || 120}"/>\n`;
  });

  // Header Row
  let headerRowXml = '   <Row ss:Height="26">\n';
  columns.forEach(col => {
    headerRowXml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>\n`;
  });
  headerRowXml += '   </Row>\n';

  // Data Rows
  let dataRowsXml = '';
  rows.forEach(row => {
    dataRowsXml += '   <Row ss:Height="20">\n';
    columns.forEach(col => {
      const val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
      const isNum = typeof val === 'number';
      const isCurrency = col.isCurrency;

      if (isCurrency && isNum) {
        dataRowsXml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${val}</Data></Cell>\n`;
      } else if (isNum) {
        dataRowsXml += `    <Cell ss:StyleID="RowStyle"><Data ss:Type="Number">${val}</Data></Cell>\n`;
      } else if (col.key === 'status') {
        dataRowsXml += `    <Cell ss:StyleID="StatusStyle"><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>\n`;
      } else {
        dataRowsXml += `    <Cell ss:StyleID="RowStyle"><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>\n`;
      }
    });
    dataRowsXml += '   </Row>\n';
  });

  const xmlFooter = `  </Table>
 </Worksheet>
</Workbook>`;

  const fullXml = xmlHeader + colsXml + headerRowXml + dataRowsXml + xmlFooter;
  const blob = new Blob([fullXml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  triggerDownload(blob, `${filename}.xls`);
}

export function exportToCsv(filename, columns, rows) {
  const headers = columns.map(c => `"${escapeCsv(c.header)}"`).join(',');
  const lines = rows.map(row => {
    return columns.map(col => {
      const val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
      return `"${escapeCsv(String(val))}"`;
    }).join(',');
  });

  // UTF-8 BOM for perfect Excel CSV opening
  const csvContent = '\uFEFF' + [headers, ...lines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCsv(unsafe) {
  return String(unsafe).replace(/"/g, '""');
}

function triggerDownload(blob, fullFilename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fullFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
