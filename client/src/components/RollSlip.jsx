import Signature from "../assets/signature.png";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function safeStr(val, fallback = "—") {
  try {
    if (val === null || val === undefined) return fallback;
    const str = String(val).trim();
    return str || fallback;
  } catch {
    return fallback;
  }
}
function parseDate(dateStr) {
  const [d, m, y] = dateStr.split("-");
  return new Date(`${y}-${m}-${d}`);
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}-${d.getFullYear()}`;
}

function getDayFromDate(dateStr) {
  try {
    if (!dateStr || typeof dateStr !== "string") return "";
    const parts = dateStr.trim().split("-");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T00:00:00`;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return DAYS[date.getDay()] ?? "";
  } catch {
    return "";
  }
}

function safeExams(raw) {
  try {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((e) => e !== null && e !== undefined && typeof e === "object")
      .slice(0, 20);
  } catch {
    return [];
  }
}

function safeSrc(val) {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

export default function RollSlip({ student }) {
  const data = student !== null && typeof student === "object" ? student : {};
  console.log("student :", data);

  const name = safeStr(data.Name);
  const regNo = safeStr(data["Reg#"] ?? data.reg ?? data.rollNo);
  const discipline = safeStr(data.Class ?? data.class);

  const sortedExams = [...safeExams(data.exams)].sort((a, b) => {
    return parseDate(a.date) - parseDate(b.date);
  });
  const exams = sortedExams;
  // const logoSrc = safeSrc(data.logoSrc);
  const signatureSrc = safeSrc(data.signatureSrc) || Signature;
  const photoSrc = safeSrc(data.__image__);
  const examHeld = (() => {
    if (!sortedExams.length) return "—";

    const dates = sortedExams
      .map((e) => parseDate(e.date))
      .filter((d) => !isNaN(d));

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return `${formatDate(minDate)} to ${formatDate(maxDate)}`;
  })();
  const examSession = (() => {
    if (!sortedExams.length) return "";

    const month = parseDate(sortedExams[0].date).getMonth() + 1;

    if (month >= 1 && month <= 5) return "Spring Semester";
    if (month >= 8 && month <= 12) return "Fall Semester";

    return "Mid Semester";
  })();
  return (
    // Outer wrapper — charon taraf se padding
    <div className="px-25 py-10">
      <article
        className="overflow-hidden  border-amber-950 bg-white text-black print:border-black"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <header className="relative px-4 py-2">
          {/* Institute logo — top-left */}
          {/* <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ width: 64, height: 64 }}
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Institute logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
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
          </div> */}

          {/* Centred text — padded to clear logo on left and photo on right */}
          <div
            className="text-center"
            style={{ paddingLeft: 76, paddingRight: 88 }}
          >
            <p className="text-sm font-bold leading-snug">
              Dr. A. Q. Khan Institute of Computer Sciences
            </p>
            <p className="text-xs leading-snug">&amp; Information Technology</p>
            <p className="text-xs leading-snug">KRL, Kahuta</p>
            <h2 className="mt-1 text-sm underline">
              Roll No. Slip of{" "}
              <span className="font-bold text-base">{name.toUpperCase()}</span>
            </h2>
          </div>

          {/* Student passport photo — top-right */}
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{
              width: 90,
              height: 95,
              borderRadius: 4,
              border: "2px solid #1a1a2e",
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
              flexShrink: 0,
            }}
          >
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                  backgroundColor: "#fff",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.nextSibling) {
                    e.currentTarget.nextSibling.style.display = "flex";
                  }
                }}
              />
            ) : null}

            {/* Fallback silhouette */}
            <div
              style={{
                display: photoSrc ? "none" : "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                backgroundColor: "#e8e8e8",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "#b0b0b0",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 22,
                  borderRadius: "22px 22px 0 0",
                  backgroundColor: "#b0b0b0",
                  marginTop: 2,
                }}
              />
              <p
                style={{
                  fontSize: 8,
                  color: "#888",
                  margin: 0,
                  marginTop: 4,
                  fontFamily: "Arial, sans-serif",
                }}
              >
                No Photo
              </p>
            </div>
          </div>
        </header>

        {/* ── STUDENT META ───────────────────────────────────────────────────── */}
        <div className="grid mt-3.5 grid-cols-2 border-b border-gray-800 text-xs">
          <p className="border border-gray-800 px-3 py-1">
            <span className="font-bold">Name: </span>
            {name}
          </p>
          <p className="px-3 border border-gray-800 py-1">
            <span className="font-bold">Roll No: </span>
            {regNo}
          </p>
          <p className="border-r border border-gray-800 px-3 py-1">
            <span className="font-bold">Discipline: </span>
            {discipline}
          </p>
          <p className="px-3 border py-1">
            <span className="font-bold">Examination held in: </span>
            {examHeld} ({examSession})
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
                <th className="border border-gray-800 px-2 py-1 text-center w-12">
                  S.No.
                </th>
                <th className="border border-gray-800 px-2 py-1 text-left">
                  Subject
                </th>
                <th className="border border-gray-800 px-2 py-1 text-center w-24">
                  Date
                </th>
                <th className="border border-gray-800 px-2 py-1 text-center w-14">
                  Day
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0
                ? exams.map((exam, idx) => {
                    const subject = safeStr(exam?.subject ?? exam?.Subject, "");
                    const date = safeStr(exam?.date ?? exam?.Date, "");
                    const day = getDayFromDate(date);
                    return (
                      <tr key={idx}>
                        <td className="border border-gray-800 px-2 py-1 text-center">
                          {idx + 1}.
                        </td>
                        <td className="border border-gray-800 px-2 py-1">
                          {subject || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="border border-gray-800 px-2 py-1 text-center">
                          {date || "—"}
                        </td>
                        <td className="border border-gray-800 px-2 py-1 text-center">
                          {day || "—"}
                        </td>
                      </tr>
                    );
                  })
                : Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="border border-gray-800 px-2 py-1 text-center text-gray-400">
                        {idx + 1}.
                      </td>
                      <td className="border border-gray-800 px-2 py-1" />
                      <td className="border border-gray-800 px-2 py-1" />
                      <td className="border border-gray-800 px-2 py-1" />
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* ── NOTES ──────────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-800 px-3 py-2 text-xs leading-relaxed">
          <p className="font-bold">Note:</p>
          <p>
            01. Paper will start at <strong>10:30 hrs</strong> and Friday paper
            will start at <strong>09:30 hrs.</strong>
          </p>
          <p>
            02. Hall entry timing is <strong>15 minutes</strong> before the
            start of paper and be seated within 5 minutes.
          </p>
          <p>
            03. In Case of Fee Defaulters or Shortage of Attendance, as Notified
            by KICSIT Management, Students will not be allowed to sit in Exams.
          </p>
          <p>
            04. Mobile Phones &amp; all Communication Devices are strictly
            prohibited in examination hall.
          </p>
          <p>
            05. Exchange of Stationery and <strong>Calculators</strong> are not
            allowed during exams.
          </p>
          <p>06. Students should bring their own water bottles during exams.</p>
          <p>
            07. Students will be{" "}
            <strong>responsible for their belongings</strong>. KICSIT management
            will not take any responsibility in case of any damage/loss.
          </p>
        </div>

        {/* ── SIGNATURE ──────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-800 px-4 pb-4 pt-6 text-right text-xs relative">
          <div className="inline-block text-right relative">
            <div className="absolute right-0 top-2">
              {signatureSrc ? (
                <img
                  src={signatureSrc}
                  alt="Controller of Examinations signature"
                  style={{
                    height: 60,
                    maxWidth: 160,
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded border border-dashed border-gray-400 bg-gray-50 text-gray-400"
                  style={{ width: 160, height: 56, fontSize: 9 }}
                >
                  Signature image
                </div>
              )}
            </div>

            <p className="mt-10">______________________________________</p>
            <p className="text-gray-500">Deputy Controller of Examinations</p>
          </div>
        </div>
      </article>
    </div>
  );
}
