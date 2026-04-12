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

export default function RollSlip({ student, compact = false }) {
  console.log("student = ",student)
  const data = student !== null && typeof student === "object" ? student : {};

  const name = safeStr(data.Name);
  const regNo = safeStr(
    data["Reg#"] ??
      data["reg#"] ??
      data["REG#"] ??
      data["rollNo"] ??
      data["Roll No"] ??
      data.rollNo ??
      data.regNo,
  );
  const discipline = safeStr(data.Class ?? data.class);

  const sortedExams = [...safeExams(data.exams)].sort((a, b) => {
    return parseDate(a.date) - parseDate(b.date);
  });
  const exams = sortedExams;

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

  // ── layout tokens based on compact mode ──
  const outerPad    = compact ? "6px 48px 10px"  : "20px 48px 30px";
  const headerPad   = compact ? "4px 12px"        : "10px 12px";
  const headerMinH  = compact ? 88                : 110;
  const photoW      = compact ? 76                : 90;
  const photoH      = compact ? 84                : 100;
  const photoTop    = compact ? "top-1"           : "top-2";
  const metaFont    = compact ? 10                : 12;
  const metaPad     = compact ? "2px 8px"         : "5px 10px";
  const metaMT      = compact ? 3                 : 6;
  const tableFont   = compact ? 10                : 11;
  const tablePad    = compact ? "2px 6px"         : "5px 8px";
  const noteFont    = compact ? 9.5               : 11;
  const noteLH      = compact ? 1.45              : 1.6;
  const notePad     = compact ? "3px 8px"         : "8px 10px";
  const sigPad      = compact ? "4px 12px 8px"    : "10px 16px 14px";
  const sigImgH     = compact ? 44                : 60;
  const sigMT       = compact ? 48                : 64;
  const titleFont   = compact ? 12                : 14;
  const subFont     = compact ? 10                : 11;
  const h2Font      = compact ? 11                : 13;
  const nameFont    = compact ? 12                : 14;

  return (
    <div style={{ padding: outerPad }}>
      <article
        className="overflow-hidden bg-white text-black"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {/* ── HEADER ── */}
        <header className="relative" style={{ padding: headerPad, minHeight: headerMinH }}>
          <div className="text-center" style={{ paddingLeft: 76, paddingRight: 94 }}>
            <p style={{ fontSize: titleFont, fontWeight: "bold", lineHeight: 1.3, margin: 0 }}>
              Dr. A. Q. Khan Institute of Computer Sciences
            </p>
            <p style={{ fontSize: subFont, lineHeight: 1.3, margin: 0 }}>
              &amp; Information Technology
            </p>
            <p style={{ fontSize: subFont, lineHeight: 1.3, margin: 0 }}>KRL, Kahuta</p>
            <h2 style={{ fontSize: h2Font, marginTop: compact ? 2 : 4, marginBottom: 0, textDecoration: "underline" }}>
              Roll No Slip of{"     "}
              <span style={{ fontWeight: "bold", fontSize: nameFont }}>{name.toUpperCase()}</span>
            </h2>
          </div>

          {/* Passport photo */}
          <div
            className={`absolute right-3 ${photoTop}`}
            style={{
              width: photoW,
              height: photoH,
              borderRadius: 3,
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
                  if (e.currentTarget.nextSibling)
                    e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              style={{
                display: photoSrc ? "none" : "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                backgroundColor: "#e8e8e8",
                gap: 3,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: "#b0b0b0" }} />
              <div style={{ width: 36, height: 18, borderRadius: "18px 18px 0 0", backgroundColor: "#b0b0b0", marginTop: 2 }} />
              <p style={{ fontSize: 7, color: "#888", margin: 0, marginTop: 3, fontFamily: "Arial, sans-serif" }}>
                No Photo
              </p>
            </div>
          </div>
        </header>

        {/* ── STUDENT META ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #1f2937", fontSize: metaFont, marginTop: metaMT }}>
          <p style={{ margin: 0, padding: metaPad, border: "1px solid #1f2937" }}>
            <span style={{ fontWeight: "bold" }}>Name: </span>{name}
          </p>
          <p style={{ margin: 0, padding: metaPad, border: "1px solid #1f2937" }}>
            <span style={{ fontWeight: "bold" }}>Roll No: </span>{regNo}
          </p>
          <p style={{ margin: 0, padding: metaPad, border: "1px solid #1f2937" }}>
            <span style={{ fontWeight: "bold" }}>Discipline: </span>{discipline}
          </p>
          <p style={{ margin: 0, padding: metaPad, border: "1px solid #1f2937" }}>
            <span style={{ fontWeight: "bold" }}>Examination held in: </span>
            {examHeld} ({examSession})
          </p>
        </div>

        {/* ── INTRO LINE ── */}
        <p style={{ borderBottom: "1px solid #1f2937", padding: metaPad, fontSize: metaFont, margin: 0 }}>
          End term papers are arranged according to the following date sheet:
        </p>

        {/* ── EXAM TABLE ── */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: tableFont }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center", width: 36 }}>S.No.</th>
                <th style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "left" }}>Subject</th>
                <th style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center", width: 72 }}>Date</th>
                <th style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center", width: 44 }}>Day</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0
                ? exams.map((exam, idx) => {
                    const subject = safeStr(exam?.subject ?? exam?.Subject, "");
                    const date    = safeStr(exam?.date   ?? exam?.Date,    "");
                    const day     = getDayFromDate(date);
                    return (
                      <tr key={idx}>
                        <td style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center" }}>{idx + 1}.</td>
                        <td style={{ border: "1px solid #1f2937", padding: tablePad }}>
                          {subject || <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                        <td style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center" }}>{date || "—"}</td>
                        <td style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center" }}>{day || "—"}</td>
                      </tr>
                    );
                  })
                : Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td style={{ border: "1px solid #1f2937", padding: tablePad, textAlign: "center", color: "#9ca3af" }}>{idx + 1}.</td>
                      <td style={{ border: "1px solid #1f2937", padding: tablePad }} />
                      <td style={{ border: "1px solid #1f2937", padding: tablePad }} />
                      <td style={{ border: "1px solid #1f2937", padding: tablePad }} />
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* ── NOTES ── */}
        <div style={{ borderTop: "1px solid #1f2937", padding: notePad, fontSize: noteFont, lineHeight: noteLH }}>
          <p style={{ fontWeight: "bold", margin: 0 }}>Note:</p>
          <p style={{ margin: 0 }}>01. Paper will start at <strong>10:30 hrs</strong> and Friday paper will start at <strong>09:30 hrs.</strong></p>
          <p style={{ margin: 0 }}>02. Hall entry timing is <strong>15 minutes</strong> before the start of paper and be seated within 5 minutes.</p>
          <p style={{ margin: 0 }}>03. In Case of Fee Defaulters or Shortage of Attendance, as Notified by KICSIT Management, Students will not be allowed to sit in Exams.</p>
          <p style={{ margin: 0 }}>04. Mobile Phones &amp; all Communication Devices are strictly prohibited in examination hall.</p>
          <p style={{ margin: 0 }}>05. Exchange of Stationery and <strong>Calculators</strong> are not allowed during exams.</p>
          <p style={{ margin: 0 }}>06. Students should bring their own water bottles during exams.</p>
          <p style={{ margin: 0 }}>07. Students will be <strong>responsible for their belongings</strong>. KICSIT management will not take any responsibility in case of any damage/loss.</p>
        </div>

        {/* ── SIGNATURE ── */}
        <div style={{ borderTop: "1px solid #1f2937", padding: sigPad, textAlign: "right", fontSize: 10, position: "relative" }}>
          <div style={{ display: "inline-block", textAlign: "right", position: "relative" }}>
            <div style={{ position: "absolute", right: 0, top: 30 }}>
              {signatureSrc ? (
                <img
                  src={signatureSrc}
                  alt="Controller of Examinations signature"
                  style={{ height: sigImgH, maxWidth: 130, objectFit: "contain" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div style={{ width: 130, height: sigImgH, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #9ca3af", backgroundColor: "#f9fafb", color: "#9ca3af", borderRadius: 3 }}>
                  Signature image
                </div>
              )}
            </div>
            <p style={{ marginTop: sigMT, marginBottom: 0 }}>______________________________________</p>
            <p style={{ margin: 0, color: "#6b7280" }}>Deputy Controller of Examinations</p>
          </div>
        </div>
      </article>
    </div>
  );
}