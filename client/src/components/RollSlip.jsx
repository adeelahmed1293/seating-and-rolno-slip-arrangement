// const RollSlip = ({ student }) => {

//   const getDay = (dateStr) => {
//     try {
//       const d = new Date(dateStr.split("-").reverse().join("-"));
//       return d.toLocaleDateString("en-US", { weekday: "short" });
//     } catch {
//       return "-";
//     }
//   };

//   return (
//     <article className="overflow-hidden rounded-xl border border-slate-700 bg-white text-black print:border-black print:bg-white">

//       {/* HEADER */}
//       <div className="border-b border-slate-300 px-4 py-3 text-center">
//         <h2 className="text-lg font-bold">Dr. A.Q. Khan Institute of Computer Sciences</h2>
//         <p className="text-sm">& Information Technology - KRL, Kahuta</p>
//         <h3 className="mt-2 text-base font-semibold underline">ROLL NO. SLIP</h3>
//       </div>

//       {/* STUDENT INFO */}
//       <div className="grid gap-2 border-b border-slate-300 px-4 py-3 text-sm sm:grid-cols-3">
//         <p>
//           <span className="font-semibold">Name: </span>
//           {student.Name || "-"}
//         </p>
//         <p>
//           <span className="font-semibold">Roll No: </span>
//           {student["Reg#"] || "-"}
//         </p>
//         <p>
//           <span className="font-semibold">Class: </span>
//           {student.class || "-"}
//         </p>
//       </div>

//       {/* TABLE */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border border-slate-300 text-sm">
//           <thead className="bg-slate-200">
//             <tr>
//               <th className="border px-2 py-1">S.No</th>
//               <th className="border px-2 py-1">Subject</th>
//               <th className="border px-2 py-1">Date</th>
//               <th className="border px-2 py-1">Day</th>
//             </tr>
//           </thead>

//           <tbody>
//             {(student.exams || []).length ? (
//               student.exams.map((exam, index) => (
//                 <tr key={index}>
//                   <td className="border px-2 py-1 text-center">{index + 1}</td>
//                   <td className="border px-2 py-1">{exam.subject}</td>
//                   <td className="border px-2 py-1 text-center">{exam.date}</td>
//                   <td className="border px-2 py-1 text-center">{getDay(exam.date)}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={4} className="border px-3 py-2 text-center text-gray-500">
//                   No papers mapped for this class
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* NOTES */}
//       <div className="px-4 py-3 text-xs leading-relaxed">
//         <p><strong>Note:</strong></p>
//         <p>1. Paper will start at 10:30 hrs (Friday 09:30 hrs).</p>
//         <p>2. Students must reach 15 minutes before exam.</p>
//         <p>3. Mobile phones are strictly prohibited.</p>
//         <p>4. Bring your own stationery.</p>
//       </div>

//       {/* SIGNATURE */}
//       <div className="px-4 pb-4 text-right">
//         ______________________
//       </div>

//     </article>
//   );
// };

// export default RollSlip;

/**
 * RollSlip.jsx
 * Matches the official Dr. A.Q. Khan Institute of Computer Sciences
 * Roll No. Slip format exactly, including both image placeholders.
 *
 * Expected student prop shape:
 * {
 *   Name:            string,
 *   "Reg#":          string,
 *   discipline:      string,
 *   examHeld:        string,
 *   logoSrc:         string | undefined   // institute logo — shown top-left of header
 *   signatureSrc:    string | undefined   // controller signature — shown above the line in footer
 *   exams: [
 *     { subject: string, date: string }   // date format: "DD-MM-YYYY"
 *   ]
 * }
 */
import Signature from '../assets/signature.png';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function safeStr(val, fallback = '—') {
  try {
    if (val === null || val === undefined) return fallback;
    const str = String(val).trim();
    return str || fallback;
  } catch {
    return fallback;
  }
}

function getDayFromDate(dateStr) {
  try {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.trim().split('-');
    if (parts.length !== 3) return '';
    const [d, m, y] = parts;
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00`;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    return DAYS[date.getDay()] ?? '';
  } catch {
    return '';
  }
}

function safeExams(raw) {
  try {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e) => e !== null && e !== undefined && typeof e === 'object')
      .slice(0, 20);
  } catch {
    return [];
  }
}

function safeSrc(val) {
  return typeof val === 'string' && val.trim() ? val.trim() : null;
}

export default function RollSlip({ student }) {
  const data = student !== null && typeof student === 'object' ? student : {};
  console.log("student :" ,data)
  const name         = safeStr(data.Name);
  const regNo        = safeStr(data['Reg#'] ?? data.reg ?? data.rollNo);
  const discipline   = safeStr(data.discipline ?? data.Discipline);
  const examHeld     = safeStr(data.examHeld ?? data.ExamHeld);
  const exams        = safeExams(data.exams);
  const logoSrc      = safeSrc(data.logoSrc);
  const signatureSrc =  safeSrc(data.signatureSrc) || Signature;  // default to bundled signature image if not provided

  return (
    <article
      className="overflow-hidden border border-gray-800 bg-white text-black print:border-black"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      {/* Logo sits top-left; institute name is centred over the full width.   */}
      <header className="relative border-b border-gray-800 px-4 py-2">

        {/* Institute logo — top-left */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ width: 64, height: 64 }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Institute logo"
              className="h-full w-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded border border-dashed border-gray-400 bg-gray-50 text-center text-gray-400"
              style={{ fontSize: 9, lineHeight: 1.3 }}
              title="Pass logoSrc prop to display the institute logo"
            >
              Logo
            </div>
          )}
        </div>

        {/* Centred text — padded to clear the logo on the left */}
        <div className="text-center" style={{ paddingLeft: 72, paddingRight: 72 }}>
          <p className="text-sm font-bold leading-snug">
            Dr. A. Q. Khan Institute of Computer Sciences
          </p>
          <p className="text-xs leading-snug">&amp; Information Technology</p>
          <p className="text-xs leading-snug">KRL, Kahuta</p>
          <h2 className="mt-1 text-sm font-bold uppercase underline">
            Roll No. Slip of {name}
          </h2>
        </div>
      </header>

      {/* ── STUDENT META ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 border-b border-gray-800 text-xs">
        <p className="border-r border-gray-800 px-3 py-1">
          <span className="font-bold">Name: </span>{name}
        </p>
        <p className="px-3 py-1">
          <span className="font-bold">Roll No: </span>{regNo}
        </p>
        <p className="border-r border-t border-gray-800 px-3 py-1">
          <span className="font-bold">Discipline: </span>{discipline}
        </p>
        <p className="border-t border-gray-800 px-3 py-1">
          <span className="font-bold">Examination held in: </span>{examHeld}
        </p>
      </div>

      {/* ── INTRO LINE ─────────────────────────────────────────────────────── */}
      <p className="border-b border-gray-800 px-3 py-1 text-xs">
        End term papers are arranged according to the following date sheet:
      </p>

      {/* ── EXAM TABLE ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-2 py-1 text-center w-12">S.No.</th>
              <th className="border border-gray-800 px-2 py-1 text-left">Subject</th>
              <th className="border border-gray-800 px-2 py-1 text-center w-24">Date</th>
              <th className="border border-gray-800 px-2 py-1 text-center w-14">Day</th>
            </tr>
          </thead>
          <tbody>
            {exams.length > 0 ? (
              exams.map((exam, idx) => {
                const subject = safeStr(exam?.subject ?? exam?.Subject, '');
                const date    = safeStr(exam?.date    ?? exam?.Date,    '');
                const day     = getDayFromDate(date);
                return (
                  <tr key={idx}>
                    <td className="border border-gray-800 px-2 py-1 text-center">{idx + 1}.</td>
                    <td className="border border-gray-800 px-2 py-1">
                      {subject || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="border border-gray-800 px-2 py-1 text-center">{date || '—'}</td>
                    <td className="border border-gray-800 px-2 py-1 text-center">{day || '—'}</td>
                  </tr>
                );
              })
            ) : (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-800 px-2 py-1 text-center text-gray-400">{idx + 1}.</td>
                  <td className="border border-gray-800 px-2 py-1" />
                  <td className="border border-gray-800 px-2 py-1" />
                  <td className="border border-gray-800 px-2 py-1" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── NOTES ──────────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-800 px-3 py-2 text-xs leading-relaxed">
        <p className="font-bold">Note:</p>
        <p>01. Paper will start at <strong>10:30 hrs</strong> and Friday paper will start at <strong>09:30 hrs.</strong></p>
        <p>02. Hall entry timing is <strong>15 minutes</strong> before the start of paper and be seated within 5 minutes.</p>
        <p>03. In Case of Fee Defaulters or Shortage of Attendance, as Notified by KICSIT Management, Students will not be allowed to sit in Exams.</p>
        <p>04. Mobile Phones &amp; all Communication Devices are strictly prohibited in examination hall.</p>
        <p>05. Exchange of Stationery and <strong>Calculators</strong> are not allowed during exams.</p>
        <p>06. Students should bring their own water bottles during exams.</p>
        <p>07. Students will be <strong>responsible for their belongings</strong>. KICSIT management will not take any responsibility in case of any damage/loss.</p>
      </div>

      {/* ── SIGNATURE ──────────────────────────────────────────────────────── */}
      {/* The original .docx places the controller's signature photo above the */}
      {/* underscore line, right-aligned.                                       */}
      <div className="border-t border-gray-800 px-4 pb-4 pt-3 text-right text-xs">
        <div className="inline-block text-right">

          {/* Signature image or dashed placeholder */}
          {signatureSrc ? (
            <img
              src={signatureSrc}
              alt="Controller of Examinations signature"
              className="mb-1 ml-auto object-contain"
              style={{ height: 56, maxWidth: 160 }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div
              className="mb-1 ml-auto flex items-center justify-center rounded border border-dashed border-gray-400 bg-gray-50 text-gray-400"
              style={{ width: 160, height: 56, fontSize: 9 }}
              title="Pass signatureSrc prop to display the controller's signature"
            >
              Signature image
            </div>
          )}

          <p>______________________________________</p>
          <p className="text-gray-500">Controller of Examinations</p>
        </div>
      </div>

    </article>
  );
}