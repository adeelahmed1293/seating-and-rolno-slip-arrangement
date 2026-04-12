import { useState } from "react";
import mammoth from "mammoth";
import { groupByClassWithPapers, groupByDate, parseDateSheet } from "../utils/parser";

export default function UploadDateSheet({ setParsedData, setPreviewTableData, setMessage }) {
  const [tableData, setLocalTableData] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const parsed = parseDateSheet(result.value);
      const grouped = groupByDate(parsed);
      const jsonDateSheet = groupByClassWithPapers(parsed);

      setParsedData(jsonDateSheet);
      setLocalTableData(grouped);
      setPreviewTableData?.(grouped);
      setMessage?.("Date sheet parse ho gayi hai.");
    } catch (error) {
      console.error(error);
      setMessage?.("Date sheet parse nahi ho saki. File format check karein.");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Upload Date Sheet</h3>
          <p className="text-sm text-slate-400">Supported format: `.doc` / `.docx`</p>
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-500 hover:text-white">
          Choose file
          <input type="file" onChange={handleFile} className="hidden" />
        </label>
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {fileName ? `Selected: ${fileName}` : "No file selected yet."}
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
          <thead className="bg-slate-950/70 text-slate-300">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Classes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {tableData.length ? (
              tableData.map((row, index) => (
                <tr key={`${row.date}-${index}`} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2 text-slate-200">{row.date}</td>
                  <td className="px-3 py-2 text-slate-300">{row.classes.join(", ")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-3 py-4 text-center text-slate-500">
                  Date sheet data yahan preview hogi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}