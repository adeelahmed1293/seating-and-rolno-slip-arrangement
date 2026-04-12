const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const XLSX = require("xlsx");
const AdmZip = require("adm-zip");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(app.getAppPath(), "client/dist/index.html");
    win.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  createWindow();
});

// ── Helper: extension se MIME type nikalo ─────────────────────────────────
function getMimeType(fileName) {
  const ext = path.extname(fileName).slice(1).toLowerCase();
  const map = {
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    jfif: "image/jpeg",
    png:  "image/png",
    gif:  "image/gif",
    webp: "image/webp",
    bmp:  "image/bmp",
    tiff: "image/tiff",
    tif:  "image/tiff",
  };
  return map[ext] || "image/png";
}

// ── Helper: supported image extension hai? ────────────────────────────────
function isImageFile(fileName) {
  const ext = path.extname(fileName).slice(1).toLowerCase();
  return ["jpg", "jpeg", "jfif", "png", "gif", "webp", "bmp", "tiff", "tif"].includes(ext);
}

ipcMain.handle("select-excel", async () => {
  console.log("IPC CALLED 🔥");

  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
  });

  if (result.canceled) return null;

  const filePath = result.filePaths[0];

  // ── 1. Normal row data nikalo ──────────────────────────────────────────
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rowData = XLSX.utils.sheet_to_json(sheet);

  // ── 2. ZIP se images extract karo ─────────────────────────────────────
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();

  const mediaFiles = {}; // { "image1.jpeg": "data:image/jpeg;base64,..." }

  zipEntries.forEach((entry) => {
    if (entry.entryName.startsWith("xl/media/")) {
      const fileName = path.basename(entry.entryName);
      if (!isImageFile(fileName)) return;

      const mimeType = getMimeType(fileName);
      const base64 = entry.getData().toString("base64");
      mediaFiles[fileName] = `data:${mimeType};base64,${base64}`;

      console.log(`✅ Media extracted: ${fileName} → ${mimeType}`);
    }
  });

  console.log("Total media files found:", Object.keys(mediaFiles).length);

  // ── 3. Drawing XML se row-to-image mapping banao ──────────────────────
  const rowImageMap = {}; // { dataRowIndex: "data:image/...;base64,..." }

  const drawingEntries = zipEntries.filter((e) =>
    /^xl\/drawings\/drawing\d+\.xml$/.test(e.entryName)
  );

  drawingEntries.forEach((drawingEntry) => {
    const drawingName = path.basename(drawingEntry.entryName);
    const relsPath = `xl/drawings/_rels/${drawingName}.rels`;
    const drawingRelsEntry = zipEntries.find((e) => e.entryName === relsPath);

    if (!drawingRelsEntry) {
      console.warn(`⚠️ Rels not found for: ${drawingEntry.entryName}`);
      return;
    }

    const drawingXml = drawingEntry.getData().toString("utf8");
    const relsXml = drawingRelsEntry.getData().toString("utf8");

    // Rels se rId → fileName mapping
    const rIdToFile = {};
    const relsMatches = [
      ...relsXml.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g),
    ];
    relsMatches.forEach(([, rId, target]) => {
      const fileName = path.basename(target);
      rIdToFile[rId] = fileName;
      console.log(`🔗 rId mapping: ${rId} → ${fileName}`);
    });

    // Anchors se row + rId nikalo
    const anchorMatches = [
      ...drawingXml.matchAll(
        /<xdr:(?:twoCellAnchor|oneCellAnchor)[^>]*>[\s\S]*?<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>[\s\S]*?<\/xdr:from>[\s\S]*?<a:blip[^>]*r:embed="([^"]+)"/g
      ),
    ];

    console.log(`📌 Anchors found in ${drawingName}:`, anchorMatches.length);

    anchorMatches.forEach(([, rowStr, rId]) => {
      const rowIndex = parseInt(rowStr); // Excel 0-based: 0 = header row, 1 = first data row
      const fileName = rIdToFile[rId];

      console.log(`  Row: ${rowIndex}, rId: ${rId}, File: ${fileName}`);

      if (fileName && mediaFiles[fileName]) {
        // ✅ FIX: rowIndex 0 ka matlab bhi pehla student (data index 0) ho sakta hai
        // rowIndex 0 → dataIndex 0 (header pe anchored image = pehla student)
        // rowIndex 1 → dataIndex 0 (pehla data row = pehla student)
        // rowIndex 2 → dataIndex 1 ... aur aage
        const dataIndex = rowIndex === 0 ? 0 : rowIndex - 1;

        // Pehle se mapped nahi hai toh hi set karo (duplicate override na ho)
        if (rowImageMap[dataIndex] === undefined) {
          rowImageMap[dataIndex] = mediaFiles[fileName];
          console.log(`  ✅ Mapped data row ${dataIndex} → ${fileName}`);
        } else {
          console.log(`  ⚠️ Row ${dataIndex} already mapped, skipping ${fileName}`);
        }
      } else {
        console.warn(`  ⚠️ No media found for rId: ${rId}, fileName: ${fileName}`);
      }
    });
  });

  console.log("Row image map keys:", Object.keys(rowImageMap));

  // ── 4. Row data mein image inject karo ────────────────────────────────
  const finalData = rowData.map((row, index) => ({
    ...row,
    __image__: rowImageMap[index] || null,
  }));

  console.log(
    "Final rows:", finalData.length,
    "| With images:", finalData.filter((r) => r.__image__).length
  );

  return finalData;
});


const fs = require("fs");

ipcMain.handle("print-to-pdf", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  
  try {
    const data = await win.webContents.printToPDF({
      printBackground: true,      // background colors + images include karo
      pageSize: "A4",
      margins: {
        marginType: "custom",
        top: 0.4,
        bottom: 0.4,
        left: 0.4,
        right: 0.4,
      },
    });

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Save PDF",
      defaultPath: "roll-slips.pdf",
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) return { success: false };

    fs.writeFileSync(filePath, data);
    return { success: true, filePath };

  } catch (err) {
    console.error("PDF error:", err);
    return { success: false, error: err.message };
  }
});