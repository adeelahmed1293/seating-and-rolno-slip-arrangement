import { useMemo, useState } from "react";
import UploadDateSheet from "./components/UploadDateSheet";
import { generateRollSlips } from "./utils/parser";
import RollSlip from "./components/RollSlip";

function App() {
  const [students, setStudents] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [dateSheetPreview, setDateSheetPreview] = useState([]);
  const [slips, setSlips] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const handleSelectFile = async () => {
    try {
      const data = await window.api.selectExcel();
      setStudents(Array.isArray(data) ? data : []);
      setMessage("Excel file loaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Excel file load nahi ho saka. Dobara try karein.");
    }
  };

  const handleGenerateSlips = () => {
    const result = generateRollSlips(students, parsedData);
    setSlips(result);
    setMessage("Roll slips generate ho gayi hain.");
  };

  const filteredSlips = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return slips;

    return slips.filter((student) =>
      [student.name, student.roll, student.class]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, slips]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-indigo-400">
                Automation Desk
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                Roll No Slip Generator
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Same workflow, better experience: upload date sheet + excel,
                then generate printable slips with live filtering.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectFile}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Select Excel File
              </button>
              <button
                onClick={handleGenerateSlips}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800"
                disabled={!students.length || !parsedData.length}
              >
                Generate Roll Slips
              </button>
              
    
            </div>
          </div>

          {message ? (
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
              {message}
            </p>
          ) : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Students Loaded"
            value={students.length}
            accent="indigo"
          />
          <StatCard
            label="Classes in Date Sheet"
            value={parsedData.length}
            accent="emerald"
          />
          <StatCard label="Total Slips" value={slips.length} accent="amber" />
          <StatCard
            label="Dates Parsed"
            value={dateSheetPreview.length}
            accent="rose"
          />
        </section>

        <UploadDateSheet
          setParsedData={setParsedData}
          setPreviewTableData={setDateSheetPreview}
          setMessage={setMessage}
        />
       
    
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-white">
              Generated Slips
            </h2>
                <button onClick={() => window.print()}>Download / Print PDF</button>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, roll, class..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-indigo-500 transition focus:ring sm:max-w-xs"
            />
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Showing {filteredSlips.length} of {slips.length} slips
          </p>

          <div id="print-area" className="mt-4 space-y-4">
            {filteredSlips.length ? (
              filteredSlips.map((student, index) => (
                <RollSlip key={`${student.roll}-${index}`} student={student} />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-700 p-5 text-sm text-slate-400">
                Abhi slips available nahi hain. Files upload karke generate
                karein.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }) {
  const accentMap = {
    indigo: "from-indigo-500/20 to-indigo-900/20 text-indigo-300",
    emerald: "from-emerald-500/20 to-emerald-900/20 text-emerald-300",
    amber: "from-amber-500/20 to-amber-900/20 text-amber-300",
    rose: "from-rose-500/20 to-rose-900/20 text-rose-300",
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-linear-to-br p-4 ${accentMap[accent]}`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default App;
