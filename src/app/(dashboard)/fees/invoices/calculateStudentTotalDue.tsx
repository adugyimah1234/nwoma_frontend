export function calculateStudentTotalDue(
  student: any, // Student | RegistrationData
  categories: { id: string; name: string }[],
  classes: { id: string; name: string }[],
  paidTypes: string[] = [],
  jerseyPriceMap: Record<string, number> = { S: 115, M: 115, L: 115, XL: 115 }
): number {
  if (!student) return 0;

  const isApplicant = (student as any).class_applying_for !== undefined;

  const categoryId = student.category_id;
  const classId = isApplicant
    ? student.class_applying_for
    : student.class_id;

    
    // Use the exact mappings from your page.tsx
    const textBooksMap: Record<string, number> = {
  'kg 1 a': 345,
  'kg 1 d': 345,
  'kg 1 c': 345,
  'kg 1 b': 345,
  'kg 2 a': 345,
  'kg 2 b': 345,
  'kg 2 c': 345,
  'kg 2 d': 345,
  'basic 1': 615,
    'basic 2': 590,
    'basic 3': 590,
    'basic 4': 660,
    'basic 5': 650,
    'basic 6': 650,
    'basic 7': 990,
    'basic 8': 615,
    'basic 9': 350,
  };
  
const exerciseBooksMap: Record<string, number> = {
  'kg 1 a': 104,
  'kg 1 b': 104,
  'kg 1 c': 104,
  'kg 1 d': 104,
  'kg 2 a': 104,
  'kg 2 b': 104,
  'kg 2 c': 104,
  'kg 2 d': 104,
  'basic 1': 194,
  'basic 2': 194,
  'basic 3': 194,
  'basic 4': 186,
  'basic 5': 272,
  'basic 6': 272,
  'basic 7': 333,
  'basic 8': 333,
  'basic 9': 333,
};
  // Partial match fallback
  const categoryName = categories.find(c => String(c.id) === String(categoryId))?.name || "";
// With this (handles both ID and name):
const classNameRaw =
  classes.find(
    cls =>
      String(cls.id) === String(classId) ||
    cls.name.trim().toLowerCase() === String(classId).trim().toLowerCase()
  )?.name || "";
  const normalizedClassName = classNameRaw.trim().toLowerCase().replace(/\s+/g, ' ');

  const feeTypes = isApplicant
    ? ["registration", "levy", "furniture", "jersey", "crest", "textBooks", "exerciseBooks"]
    : ["levy", "furniture", "jersey", "crest", "textBooks", "exerciseBooks"];

  let total = 0;
  for (const type of feeTypes) {
    if (paidTypes.includes(type)) continue;
    let fixedAmount = 0;
    switch (type) {
      case "registration":
        fixedAmount = 40;
        break;
      case "levy":
        if (categoryName === "SVC" || categoryName === "MOD") fixedAmount = 200;
        else if (categoryName === "CIV") fixedAmount = 220;
        break;
      case "furniture":
        fixedAmount = 100;
        break;
      case "jersey": {
        // Use student.jersey_size if available
        const size = student.jersey_size || '';
        fixedAmount = jerseyPriceMap[size] || 0;
        break;
      }
      case "crest":
        fixedAmount = 30;
        break;
      case "textBooks": {
        const textBookKey = Object.keys(textBooksMap).find(key => normalizedClassName.startsWith(key));
        fixedAmount = textBookKey ? textBooksMap[textBookKey] : 0;
        break;
      }
      case "exerciseBooks": {
        const exerciseBookKey = Object.keys(exerciseBooksMap).find(key => normalizedClassName.startsWith(key));
        fixedAmount = exerciseBookKey ? exerciseBooksMap[exerciseBookKey] : 0;
        break;
      }
      default:
        fixedAmount = 0;
    }
    total += fixedAmount;
  }
  return Number.isNaN(total) ? 0 : total;
}

