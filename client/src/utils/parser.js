// 🔹 Clean line function
function cleanLine(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/--/g, "-")
    .replace("BSC S", "BSCS")
    .replace(/\(.*?\)/g, "") // remove brackets
    .trim();
}

// 🔹 Remove useless lines
function isJunk(line) {
  const junkWords = [
    "Paper Timing",
    "BREAK",
    "B R E A K",
    "NIL",
    "--------"
  ];

  return junkWords.some(j => line.toUpperCase().includes(j));
}

// 🔥 MAIN PARSER
export function parseDateSheet(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let currentDate = null;
  let result = [];

  const dateRegex = /\d{2}-\d{2}-\d{4}/;
  const subjectRegex = /(.*?)[\s-]+(BS?C?E?S?|CS|CE)-?(\d+)/gi;

  for (let line of lines) {

    line = cleanLine(line);

    if (isJunk(line)) continue;

    // ✅ Detect date
    if (dateRegex.test(line)) {
      currentDate = line;
      continue;
    }

    // ✅ Detect subject + class
    const matches = [...line.matchAll(subjectRegex)];

if (matches.length > 0 && currentDate) {
  matches.forEach(match => {
    result.push({
      date: currentDate,
      subject: match[1].trim(),
      class: `${match[2].toUpperCase()}-${match[3]}`
    });
  });
}

 
}
 return result;
}

// 🔹 Group by date
export function groupByDate(data) {
  const map = {};

  data.forEach((item) => {
    if (!map[item.date]) {
      map[item.date] = new Set();
    }
    map[item.date].add(item.class);
  });

  return Object.keys(map).map(date => ({
    date,
    classes: Array.from(map[date])
  }));
}


export function groupByClassWithPapers(data) {
  const classMap = {};

  data.forEach((item) => {
    const cls = item.class;

    if (!classMap[cls]) {
      classMap[cls] = {
        class: cls,
        papers: []
      };
    }

    classMap[cls].papers.push({
      subject: item.subject,
      date: item.date
    });
  });

  return Object.values(classMap);
}

export function processSheet(data) {
  const classMap = {};

  const headerRow = data[0]; // BSCS2, BSCS3...
  const subHeader = data[1]; // Reg, Name

  let classIndexes = [];

  // 🔹 Detect class columns
  for (let i = 0; i < headerRow.length; i++) {
    if (headerRow[i]) {
      classIndexes.push({
        className: formatClass(headerRow[i]),
        regIndex: i,
        nameIndex: i + 1
      });
    }
  }

  // 🔹 Extract students
  for (let i = 2; i < data.length; i++) {
    const row = data[i];

    classIndexes.forEach(cls => {
      const reg = row[cls.regIndex];
      const name = row[cls.nameIndex];

      if (reg && name) {
        if (!classMap[cls.className]) {
          classMap[cls.className] = [];
        }

        classMap[cls.className].push({
          reg: String(reg),
          name: String(name)
        });
      }
    });
  }

  return classMap;
}

export function generateRollSlips(students, parsedData) {
  // 1. convert class data into map (FAST LOOKUP)
  const classMap = {};
 
  parsedData.forEach((cls) => {
    classMap[cls.class] = cls.papers;
  }); 
 console.log("CLASSmAP =",classMap)
  // 2. attach papers to students
  return students.map((student) => {
    return {
      ...student,
      exams: classMap[student.Class] || classMap[student.Class]||[]// 👈 key logic
    };
  });
}