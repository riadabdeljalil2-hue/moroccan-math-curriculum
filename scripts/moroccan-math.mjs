#!/usr/bin/env node
import fs from 'node:fs';

const goldPackData = JSON.parse(
  fs.readFileSync(new URL('../assets/morocco-math-1ac-gold.json', import.meta.url), 'utf8')
);
const pilotLessons = JSON.parse(
  fs.readFileSync(new URL('../assets/pilot-lessons.json', import.meta.url), 'utf8')
);

const VERIFICATION_BOUNDARIES_NOTICE_AR =
  'حدود التحقق المنهجية: هذه الأداة مخصصة حصراً للتحقق من العمليات الحسابية والعددية والجبرية المدعومة المحددة (العمليات الحسابية، الكسور الاعتيادية، القاسم والمضاعف المشترك، معادلات الدرجة الثانية، النظمات الخطية 2x2، والحسابيات المعيارية). هذه الأداة لا تدعي ولا تمتلك القدرة على إثبات البراهين الرياضية العامة أو حل النظريات الهندسية المجردة دون مدخلات عددية مضبوطة.';

const VERIFICATION_BOUNDARIES_NOTICE_FR =
  'Limites de vérification: Cet outil est strictement conçu pour vérifier des calculs numériques et algébriques supportés (opérations élémentaires, fractions, PGCD/PPCM, équations du 2nd degré, systèmes 2x2, arithmétique modulaire). Il ne prétend pas prouver des théorèmes mathématiques généraux ou des démonstrations abstraites.';

function load1ACGoldLessons() {
  const manifest = goldPackData.manifest;
  const units = goldPackData.curriculum?.units || [];
  const lessons = [];
  const domainMap = {
    'unit-math-1ac-ops': 'arithmetic',
    'unit-math-1ac-developpement': 'algebra',
    'unit-math-1ac-mediatrice': 'geometry',
    'unit-math-1ac-triangle': 'geometry',
    'unit-math-1ac-angles': 'geometry'
  };

  for (const unit of units) {
    const domain = domainMap[unit.id] || 'algebra';
    const semester = unit.orderIndex <= 3 ? 1 : 2;
    for (const les of unit.lessons || []) {
      let titleAr = les.title || '';
      let titleFr = '';
      if (titleAr.includes('(') && titleAr.includes(')')) {
        const parts = titleAr.split('(');
        titleAr = parts[0].trim();
        titleFr = parts[1].replace(')', '').trim();
      }
      const skillsFormatted = (les.skills || []).map((s) =>
        s.description ? `${s.name}: ${s.description}` : s.name
      );
      lessons.push({
        id: les.id,
        code: `1AC-${domain.toUpperCase().slice(0, 3)}-0${unit.orderIndex}`,
        level: '1AC',
        cycle: 'college',
        domain,
        titleAr,
        titleFr: titleFr || titleAr,
        semester,
        objectives: les.learningObjectives || [],
        prerequisites: les.prerequisites || [
          'العمليات الأساسية الأربع على الأعداد الصحيحة والعشرية',
          'الهندسة المستوية الأساسية'
        ],
        targetedSkills:
          skillsFormatted.length > 0
            ? skillsFormatted
            : ['تطبيق القواعد والخاصيات الرياضية في الحساب والبرهان الهندسي'],
        isPilotData: false,
        reference: {
          sourceName: manifest.title,
          officialDocument: manifest.packId,
          status: 'official_curriculum',
          noteAr: manifest.description,
          noteFr: 'Pack Gold Standard officiel pour la 1ère Année Collégiale (1AC).'
        },
        concepts: les.concepts || [],
        commonMistakes: les.commonMistakes || [],
        examples: les.examples || [],
        curriculumPackId: manifest.packId
      });
    }
  }
  return lessons;
}

const ALL_LESSONS = [...load1ACGoldLessons(), ...pilotLessons];

function listCurriculum(args = {}) {
  let filtered = [...ALL_LESSONS];
  if (args.level_filter) {
    const lvl = String(args.level_filter).trim().toUpperCase();
    filtered = filtered.filter((l) => l.level.toUpperCase() === lvl);
  }
  if (args.semester) {
    filtered = filtered.filter((l) => l.semester === Number(args.semester));
  }
  if (args.domain_filter) {
    const dom = String(args.domain_filter).trim().toLowerCase();
    filtered = filtered.filter((l) => l.domain.toLowerCase() === dom);
  }

  const levelDescriptions = {
    '1AC': {
      ar: 'السنة الأولى ثانوي إعدادي (الحزمة الذهبية الرسمية المعتمدة - مسار عام ودولي)',
      fr: '1ère Année Collégiale (1AC - Pack Gold Standard)',
      cycle: 'college'
    },
    '3APIC': {
      ar: 'السنة الثالثة ثانوي إعدادي (دورة عادية ودولية)',
      fr: '3ème Année Collégiale',
      cycle: 'college'
    },
    TCS: {
      ar: 'الجذع المشترك العلمي والتكنولوجي',
      fr: 'Tronc Commun Scientifique et Technologique',
      cycle: 'lycee_qualifiant'
    },
    '1BAC_SM': {
      ar: 'السنة الأولى من سلك البكالوريا - مسلك العلوم الرياضية',
      fr: '1ère Année Baccalauréat - Sciences Mathématiques',
      cycle: 'lycee_qualifiant'
    },
    '2BAC_SM': {
      ar: 'السنة الثانية من سلك البكالوريا - مسلك العلوم الرياضية (أ و ب)',
      fr: '2ème Année Baccalauréat - Sciences Mathématiques (A et B)',
      cycle: 'lycee_qualifiant'
    },
    '2BAC_PC_SVT': {
      ar: 'السنة الثانية من سلك البكالوريا - مسلك العلوم التجريبية (PC / SVT)',
      fr: '2ème Année Baccalauréat - Sciences Physiques / SVT',
      cycle: 'lycee_qualifiant'
    }
  };

  const grouped = new Map();
  for (const lesson of filtered) {
    if (!grouped.has(lesson.level)) grouped.set(lesson.level, []);
    grouped.get(lesson.level).push(lesson);
  }

  const levelsCovered = Array.from(grouped.entries()).map(([levelKey, items]) => {
    const desc = levelDescriptions[levelKey] || {
      ar: levelKey,
      fr: levelKey,
      cycle: items[0]?.cycle || 'lycee_qualifiant'
    };
    return {
      levelId: levelKey,
      levelNameAr: desc.ar,
      levelNameFr: desc.fr,
      cycle: desc.cycle,
      lessonCount: items.length,
      lessons: items.map((i) => ({
        id: i.id,
        code: i.code,
        titleAr: i.titleAr,
        titleFr: i.titleFr,
        isOfficial: !i.isPilotData
      }))
    };
  });

  return {
    systemName: 'المنهاج المغربي للرياضيات (Moroccan Mathematics Curriculum)',
    country: 'المملكة المغربية (Kingdom of Morocco)',
    version: '1.2.0-gold-hybrid',
    isPilotBaseline: false,
    totalLessonsLoaded: filtered.length,
    levelsCovered,
    officialNoticeAr:
      'المستوى 1AC مزود بالحزمة الذهبية الرسمية المكتملة (MOROCCO-MATH-1AC-GOLD-v1) مع المفاهيم والتمثلات والأخطاء الشائعة، بينما بقية المستويات مزودة بعينات تجريبية موثقة.',
    officialNoticeFr:
      'Le niveau 1AC intègre le Pack Gold Standard officiel (MOROCCO-MATH-1AC-GOLD-v1) avec concepts didactiques et remédiation des erreurs, complété par des données pilotes pour les autres niveaux.',
    goldPacksActive: ['MOROCCO-MATH-1AC-GOLD-v1']
  };
}

function searchLessons(args = {}) {
  const query = String(args.query || '').trim();
  if (query.length < 2 || query.length > 100) {
    throw new Error('query must be between 2 and 100 characters.');
  }
  const rawQuery = query.toLowerCase();
  const cleanTokens = rawQuery.replace(/[،,.\-]/g, ' ').split(/\s+/).filter((t) => t.length > 1);
  const levelFilter = args.level ? String(args.level).trim().toUpperCase() : null;

  const matches = [];
  for (const lesson of ALL_LESSONS) {
    if (levelFilter && levelFilter !== 'ALL' && lesson.level.toUpperCase() !== levelFilter) {
      continue;
    }
    let score = 0;
    const reasons = [];
    const titleArNorm = lesson.titleAr.toLowerCase();
    const titleFrNorm = lesson.titleFr.toLowerCase();
    const codeNorm = lesson.code.toLowerCase();

    if (titleArNorm.includes(rawQuery)) {
      score += 50;
      reasons.push('تطابق مباشر في العنوان العربي');
    }
    if (titleFrNorm.includes(rawQuery)) {
      score += 50;
      reasons.push('Correspondance directe dans le titre français');
    }
    if (codeNorm.includes(rawQuery) || lesson.id.toLowerCase().includes(rawQuery)) {
      score += 40;
      reasons.push('تطابق كود أو معرف الدرس');
    }
    if (lesson.concepts) {
      for (const cpt of lesson.concepts) {
        if (cpt.name?.toLowerCase().includes(rawQuery)) {
          score += 35;
          reasons.push(`تطابق مباشر في المفهوم الرياضي ("${cpt.name}")`);
        }
        if (cpt.formalDefinition?.toLowerCase().includes(rawQuery)) {
          score += 25;
          reasons.push(`تطابق في التعريف الرسمي للمفهوم ("${cpt.name}")`);
        }
        if (cpt.keywords?.some((k) => k.toLowerCase().includes(rawQuery))) {
          score += 20;
          reasons.push(`تطابق في الكلمات المفتاحية للمفهوم ("${cpt.name}")`);
        }
      }
    }
    if (lesson.commonMistakes) {
      for (const mst of lesson.commonMistakes) {
        if (mst.mistakeDescription?.toLowerCase().includes(rawQuery)) {
          score += 30;
          reasons.push('تطابق في تشخيص التمثلات والأخطاء الشائعة للتلاميذ');
        }
        if (mst.howToCorrect?.toLowerCase().includes(rawQuery)) {
          score += 25;
          reasons.push('تطابق في استراتيجية التصحيح الديداكتيكي للخطأ');
        }
      }
    }
    for (const token of cleanTokens) {
      if (titleArNorm.includes(token)) score += 15;
      if (titleFrNorm.includes(token)) score += 15;
      if (lesson.objectives.some((o) => o.toLowerCase().includes(token))) {
        score += 10;
        reasons.push(`تطابق في أهداف الدرس ("${token}")`);
      }
      if (lesson.targetedSkills.some((s) => s.toLowerCase().includes(token))) {
        score += 12;
        reasons.push(`تطابق في الكفايات والمهارات المستهدفة ("${token}")`);
      }
      if (lesson.prerequisites.some((p) => p.toLowerCase().includes(token))) {
        score += 8;
        reasons.push(`تطابق في المكتسبات القبلية ("${token}")`);
      }
    }
    if (score > 0) {
      matches.push({ ...lesson, matchScore: score, matchReasons: Array.from(new Set(reasons)) });
    }
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);
  return {
    query,
    totalMatches: matches.length,
    lessons: matches,
    curriculumContext: {
      datasetStatus: 'hybrid_official_and_pilot',
      dataSource: 'المنهاج المغربي للرياضيات - الحزمة الذهبية الرسمية 1AC + عينات تجريبية',
      disclaimerAr:
        'دروس السنة الأولى إعدادي معتمدة رسمياً ومرفقة بالتمثلات الخاطئة، وبقية المستويات عينات تجريبية موثقة.',
      disclaimerFr:
        'Les leçons 1AC sont officielles (Gold Pack), les autres niveaux sont des données pilotes conformes.'
    }
  };
}

// Pure recursive-descent arithmetic evaluator (no eval / no new Function)
function safeEvaluateMath(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let dotCount = 0;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        if (expr[i] === '.') dotCount++;
        if (dotCount > 1) throw new Error('تنسيق عدد عشري غير صالح.');
        numStr += expr[i++];
      }
      const val = Number(numStr);
      if (!Number.isFinite(val)) throw new Error('قيمة عددية غير صالحة.');
      tokens.push({ type: 'num', value: val });
      continue;
    }
    if ('+-*/^()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    throw new Error(`رمز غير مسموح به: "${ch}"`);
  }

  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpr() {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parsePower();
    while (peek()?.type === 'op' && (peek().value === '*' || peek().value === '/')) {
      const op = consume().value;
      const right = parsePower();
      if (op === '/') {
        if (right === 0) throw new Error('القسمة على صفر غير معرفة.');
        left = left / right;
      } else {
        left = left * right;
      }
    }
    return left;
  }

  function parsePower() {
    const base = parseUnary();
    if (peek()?.type === 'op' && peek().value === '^') {
      consume();
      const exp = parsePower();
      return Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary() {
    if (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = consume().value;
      const val = parseUnary();
      return op === '-' ? -val : val;
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new Error('تعبير رياضي غير مكتمل.');
    if (tok.type === 'num') {
      consume();
      return tok.value;
    }
    if (tok.type === 'op' && tok.value === '(') {
      consume();
      const val = parseExpr();
      if (peek()?.type !== 'op' || peek().value !== ')') {
        throw new Error('أقواس غير مغلقة في التعبير.');
      }
      consume();
      return val;
    }
    throw new Error(`رمز غير متوقع: "${tok.value}"`);
  }

  const result = parseExpr();
  if (pos < tokens.length) throw new Error('تعبير رياضي غير صالح.');
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('الناتج غير معرف أو أدى إلى قيمة لا نهائية.');
  }
  return result;
}

function calcGcd(x, y) {
  let a = Math.abs(x);
  let b = Math.abs(y);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function verifyCalculation(args = {}) {
  const { operation_type, parameters, expected_result } = args;
  if (!parameters || typeof parameters !== 'object') {
    throw new Error('المعاملات parameters غير صالحة.');
  }
  const round6 = (n) => Math.round(n * 1000000) / 1000000;

  switch (operation_type) {
    case 'arithmetic': {
      const expression = String(parameters.expression || '').trim();
      if (!expression) throw new Error('يرجى تزويد expression.');
      if (expression.length > 120) throw new Error('طول التعبير تجاوز 120 حرفاً.');
      const rounded = round6(safeEvaluateMath(expression));
      let matchesExpected;
      if (expected_result !== undefined && expected_result !== null) {
        const expNum = Number(expected_result);
        matchesExpected = !Number.isNaN(expNum) && Math.abs(rounded - expNum) < 1e-6;
      }
      return {
        verified: true,
        operationType: 'arithmetic',
        normalizedInput: expression,
        computedResult: rounded,
        matchesExpected,
        stepByStepStepsAr: [
          `التعبير الحسابي المدخل: ${expression}`,
          'تحليل ترتيب الأسبقية: الأقواس أولاً، ثم القوى والأسس، ثم الضرب والقسمة، وأخيراً الجمع والطرح.',
          `النتيجة العددية المحسوبة بدقة: ${rounded}`
        ],
        stepByStepStepsFr: [
          `Expression saisie: ${expression}`,
          'Ordre des opérations: parenthèses, exposants, multiplication/division, addition/soustraction.',
          `Résultat numérique calculé: ${rounded}`
        ],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    case 'fraction': {
      const { num1, den1, num2, den2, op } = parameters;
      const n1 = parseInt(num1, 10);
      const d1 = parseInt(den1, 10);
      if (Number.isNaN(n1) || Number.isNaN(d1) || d1 === 0) {
        throw new Error('الكسر الأول غير صالح (den1 != 0).');
      }
      if (num2 === undefined || den2 === undefined || !op) {
        const divisor = calcGcd(n1, d1);
        const simpNum = (n1 / divisor) * (d1 < 0 ? -1 : 1);
        const simpDen = Math.abs(d1 / divisor);
        const simpStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;
        let matchesExpected;
        if (expected_result !== undefined && expected_result !== null) {
          matchesExpected = String(expected_result).trim() === simpStr;
        }
        return {
          verified: true,
          operationType: 'fraction',
          normalizedInput: `${n1}/${d1}`,
          computedResult: {
            simplified: simpStr,
            numerator: simpNum,
            denominator: simpDen,
            decimal: simpNum / simpDen
          },
          matchesExpected,
          stepByStepStepsAr: [
            `الكسر الأصلي: ${n1}/${d1}`,
            `القاسم المشترك الأكبر: PGCD(|${n1}|, |${d1}|) = ${divisor}`,
            `الكسر المختزل غير القابل للاختزال: ${simpStr}`
          ],
          stepByStepStepsFr: [
            `Fraction originale: ${n1}/${d1}`,
            `PGCD(|${n1}|, |${d1}|) = ${divisor}`,
            `Fraction irréductible: ${simpStr}`
          ],
          verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
          verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
          isPilotVerifier: true
        };
      }

      const n2 = parseInt(num2, 10);
      const d2 = parseInt(den2, 10);
      if (Number.isNaN(n2) || Number.isNaN(d2) || d2 === 0) {
        throw new Error('الكسر الثاني غير صالح (den2 != 0).');
      }
      let resNum = 0;
      let resDen = 1;
      if (op === '+' || op === 'add') {
        resNum = n1 * d2 + n2 * d1;
        resDen = d1 * d2;
      } else if (op === '-' || op === 'sub') {
        resNum = n1 * d2 - n2 * d1;
        resDen = d1 * d2;
      } else if (op === '*' || op === 'mul') {
        resNum = n1 * n2;
        resDen = d1 * d2;
      } else if (op === '/' || op === 'div') {
        if (n2 === 0) throw new Error('لا يمكن القسمة على كسر بسطه 0.');
        resNum = n1 * d2;
        resDen = d1 * n2;
      } else {
        throw new Error(`العملية "${op}" غير مدعومة.`);
      }
      const divisor = calcGcd(resNum, resDen);
      const simpNum = (resNum / divisor) * (resDen < 0 ? -1 : 1);
      const simpDen = Math.abs(resDen / divisor);
      const simpStr = simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`;
      let matchesExpected;
      if (expected_result !== undefined && expected_result !== null) {
        matchesExpected =
          String(expected_result).trim() === simpStr ||
          String(expected_result).trim() === `${resNum}/${resDen}`;
      }
      return {
        verified: true,
        operationType: 'fraction',
        normalizedInput: `(${n1}/${d1}) ${op} (${n2}/${d2})`,
        computedResult: {
          raw: `${resNum}/${resDen}`,
          simplified: simpStr,
          numerator: simpNum,
          denominator: simpDen,
          decimalValue: simpNum / simpDen
        },
        matchesExpected,
        stepByStepStepsAr: [
          `العملية: (${n1}/${d1}) ${op} (${n2}/${d2}) = ${resNum}/${resDen}`,
          `PGCD = ${divisor}`,
          `الكسر المختزل النهائي: ${simpStr}`
        ],
        stepByStepStepsFr: [
          `Opération: (${n1}/${d1}) ${op} (${n2}/${d2}) = ${resNum}/${resDen}`,
          `Simplification par PGCD (${divisor}): ${simpStr}`
        ],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    case 'gcd_lcm': {
      const a = parseInt(parameters.a, 10);
      const b = parseInt(parameters.b, 10);
      if (Number.isNaN(a) || Number.isNaN(b) || a <= 0 || b <= 0) {
        throw new Error('يجب إدخال عددين صحيحين موجبين (a > 0 و b > 0).');
      }
      if (a > 1000000000 || b > 1000000000) {
        throw new Error('تجاوزت الأعداد الحد الأقصى المسموح به (1,000,000,000).');
      }
      let x = Math.max(a, b);
      let y = Math.min(a, b);
      const stepsAr = [];
      const stepsFr = [];
      while (y !== 0) {
        const q = Math.floor(x / y);
        const r = x % y;
        stepsAr.push(`القسمة الإقليدية: ${x} = ${y} × ${q} + ${r}`);
        stepsFr.push(`Division euclidienne: ${x} = ${y} × ${q} + ${r}`);
        x = y;
        y = r;
      }
      const gcd = x;
      const lcm = (a / gcd) * b;
      let matchesExpected;
      if (expected_result !== undefined && expected_result !== null) {
        const expNum = Number(expected_result);
        matchesExpected = !Number.isNaN(expNum) && (expNum === gcd || expNum === lcm);
      }
      return {
        verified: true,
        operationType: 'gcd_lcm',
        normalizedInput: `PGCD(${a}, ${b}) و PPCM(${a}, ${b})`,
        computedResult: { gcd, lcm, areCoprime: gcd === 1 },
        matchesExpected,
        stepByStepStepsAr: [
          ...stepsAr,
          `PGCD(${a}, ${b}) = ${gcd}`,
          `PPCM(${a}, ${b}) = (${a} × ${b}) ÷ ${gcd} = ${lcm}`
        ],
        stepByStepStepsFr: [
          ...stepsFr,
          `PGCD(${a}, ${b}) = ${gcd}`,
          `PPCM(${a}, ${b}) = (${a} × ${b}) / ${gcd} = ${lcm}`
        ],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    case 'quadratic_equation': {
      const a = parseFloat(parameters.a);
      const b = parseFloat(parameters.b);
      const c = parseFloat(parameters.c);
      if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || a === 0) {
        throw new Error('يرجى تزويد a, b, c مع a ≠ 0.');
      }
      const delta = round6(b * b - 4 * a * c);
      const payload = { a, b, c, delta };
      let summaryAr = '';
      let summaryFr = '';
      if (delta > 0) {
        const s = Math.sqrt(delta);
        const r1 = round6((-b - s) / (2 * a));
        const r2 = round6((-b + s) / (2 * a));
        payload.solutionsCount = 2;
        payload.solutionsReal = [r1, r2];
        payload.nature = 'two_distinct_real_roots';
        summaryAr = `Δ > 0: حلان حقيقيان متمايزان S = {${r1}, ${r2}}`;
        summaryFr = `Delta > 0: deux racines réelles S = {${r1}, ${r2}}`;
      } else if (delta === 0) {
        const r0 = round6(-b / (2 * a));
        payload.solutionsCount = 1;
        payload.solutionsReal = [r0];
        payload.nature = 'one_double_real_root';
        summaryAr = `Δ = 0: حل حقيقي مزدوج S = {${r0}}`;
        summaryFr = `Delta = 0: racine double S = {${r0}}`;
      } else {
        const s = Math.sqrt(-delta);
        const re = round6(-b / (2 * a));
        const im = round6(s / (2 * Math.abs(a)));
        payload.solutionsCount = 0;
        payload.solutionsReal = [];
        payload.complexRoots = [`${re} - ${im}i`, `${re} + ${im}i`];
        payload.nature = 'no_real_roots_two_complex_conjugate';
        summaryAr = `Δ < 0: S = ∅ في R، وفي C: z = ${re} ± ${im}i`;
        summaryFr = `Delta < 0: S = vide dans R; dans C: z = ${re} ± ${im}i`;
      }
      return {
        verified: true,
        operationType: 'quadratic_equation',
        normalizedInput: `${a}x² + (${b})x + (${c}) = 0`,
        computedResult: payload,
        stepByStepStepsAr: [`Δ = (${b})² - 4(${a})(${c}) = ${delta}`, summaryAr],
        stepByStepStepsFr: [`Delta = ${delta}`, summaryFr],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    case 'linear_system_2x2': {
      const a1 = parseFloat(parameters.a1);
      const b1 = parseFloat(parameters.b1);
      const c1 = parseFloat(parameters.c1);
      const a2 = parseFloat(parameters.a2);
      const b2 = parseFloat(parameters.b2);
      const c2 = parseFloat(parameters.c2);
      if ([a1, b1, c1, a2, b2, c2].some(Number.isNaN)) {
        throw new Error('يرجى تزويد المعاملات الستة: a1, b1, c1, a2, b2, c2.');
      }
      const D = round6(a1 * b2 - a2 * b1);
      const Dx = round6(c1 * b2 - c2 * b1);
      const Dy = round6(a1 * c2 - a2 * c1);
      const res = { determinant: D, detDx: Dx, detDy: Dy };
      let msgAr = '';
      let msgFr = '';
      if (D !== 0) {
        const x = round6(Dx / D);
        const y = round6(Dy / D);
        res.uniqueSolution = { x, y };
        res.hasUniqueSolution = true;
        msgAr = `حل وحيد: (x, y) = (${x}, ${y})`;
        msgFr = `Couple unique: (x, y) = (${x}, ${y})`;
      } else if (Dx === 0 && Dy === 0) {
        res.hasUniqueSolution = false;
        res.infiniteSolutions = true;
        msgAr = 'ما لا نهاية له من الحلول (المستقيمان منطبقان).';
        msgFr = 'Infinité de solutions (droites confondues).';
      } else {
        res.hasUniqueSolution = false;
        res.noSolution = true;
        msgAr = 'النظمة مستحيلة الحل: S = ∅.';
        msgFr = 'Aucune solution: S = vide.';
      }
      return {
        verified: true,
        operationType: 'linear_system_2x2',
        normalizedInput: `System: { ${a1}x + ${b1}y = ${c1} ; ${a2}x + ${b2}y = ${c2} }`,
        computedResult: res,
        stepByStepStepsAr: [`D = ${D}, Dx = ${Dx}, Dy = ${Dy}`, msgAr],
        stepByStepStepsFr: [`D = ${D}, Dx = ${Dx}, Dy = ${Dy}`, msgFr],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    case 'modular_arithmetic': {
      const a = parseInt(parameters.a, 10);
      const m = parseInt(parameters.m, 10);
      if (Number.isNaN(a) || Number.isNaN(m) || m <= 0) {
        throw new Error('يرجى تزويد a و m (m > 0).');
      }
      const remainder = ((a % m) + m) % m;
      const quotient = Math.floor(a / m);
      const gcd = calcGcd(a, m);
      let matchesExpected;
      if (expected_result !== undefined && expected_result !== null) {
        matchesExpected = parseInt(String(expected_result), 10) === remainder;
      }
      return {
        verified: true,
        operationType: 'modular_arithmetic',
        normalizedInput: `${a} ≡ r [${m}]`,
        computedResult: { a, modulus: m, remainder, quotient, gcdWithModulus: gcd },
        matchesExpected,
        stepByStepStepsAr: [
          `${a} = ${m} × (${quotient}) + (${remainder})`,
          `${a} ≡ ${remainder} [${m}]`
        ],
        stepByStepStepsFr: [`${a} = ${m} * (${quotient}) + (${remainder})`, `${a} ≡ ${remainder} [${m}]`],
        verificationBoundariesNoticeAr: VERIFICATION_BOUNDARIES_NOTICE_AR,
        verificationBoundariesNoticeFr: VERIFICATION_BOUNDARIES_NOTICE_FR,
        isPilotVerifier: true
      };
    }

    default:
      throw new Error(`نوع العملية "${operation_type}" غير مدعوم.`);
  }
}

function generateExercises(args = {}) {
  const lessonId = String(args.lesson_id || '').trim();
  const lesson = ALL_LESSONS.find(
    (l) => l.id.toLowerCase() === lessonId.toLowerCase() || l.code.toLowerCase() === lessonId.toLowerCase()
  );
  if (!lesson) {
    throw new Error(`الدرس "${lessonId}" غير موجود. استخدم list_curriculum لمعرفة المعرفات المتاحة.`);
  }
  const diff = ['easy', 'medium', 'hard'].includes(args.difficulty) ? args.difficulty : 'medium';
  const count = Math.min(Math.max(1, Number(args.count) || 1), 5);
  const chosenSkill = args.skill || lesson.targetedSkills[0] || 'تطبيق المكتسبات الأساسية للدرس';

  const exercises = [];
  for (let idx = 1; idx <= count; idx++) {
    if (lesson.id === 'les-math-1ac-precedence') {
      const bank = {
        easy: { stmt: 'A = 15 + 4 × 3 - 7', ans: 'A = 20', key: 'A=20', steps: ['4 × 3 = 12', '15 + 12 - 7 = 20'] },
        medium: { stmt: 'B = 12 + 8 ÷ 2 × 3 - 5', ans: 'B = 19', key: 'B=19', steps: ['8 ÷ 2 = 4', '4 × 3 = 12', '12 + 12 - 5 = 19'] },
        hard: { stmt: 'A = 45 - [3 × (5 + 2) - 6]', ans: 'A = 30', key: 'A=30', steps: ['5 + 2 = 7', '3 × 7 = 21', '21 - 6 = 15', '45 - 15 = 30'] }
      }[diff];
      exercises.push({
        id: `EX-1AC-OPS-${diff.toUpperCase()}-${idx}`,
        lessonId: lesson.id,
        level: lesson.level,
        difficulty: diff,
        statementAr: `احسب قيمة التعبير التالي مع تبيان الخطوات:\n${bank.stmt}`,
        statementFr: `Calculer l'expression suivante en détaillant les étapes:\n${bank.stmt}`,
        referenceSolution: { stepsAr: bank.steps, finalAnswer: bank.ans, testVerificationKey: bank.key },
        isPilotData: false,
        contentTag: 'OFFICIAL_CURRICULUM_BASELINE'
      });
    } else if (lesson.id === '3apic-pythagore') {
      const p = { easy: { a: 3, b: 4, c: 5 }, medium: { a: 6, b: 8, c: 10 }, hard: { a: 5, b: 12, c: 13 } }[diff];
      exercises.push({
        id: `EX-PYTH-${diff.toUpperCase()}-${idx}`,
        lessonId: lesson.id,
        level: lesson.level,
        difficulty: diff,
        statementAr: `ليكن ABC مثلثاً قائماً الزاوية في A حيث AB = ${p.a} cm و AC = ${p.b} cm. احسب طول الوتر BC.`,
        statementFr: `Soit ABC rectangle en A avec AB = ${p.a} cm et AC = ${p.b} cm. Calculer BC.`,
        referenceSolution: {
          stepsAr: [`BC² = ${p.a}² + ${p.b}² = ${p.c * p.c}`, `BC = √(${p.c * p.c}) = ${p.c} cm`],
          finalAnswer: `${p.c} cm`,
          testVerificationKey: `BC=${p.c}`
        },
        isPilotData: true,
        contentTag: 'PILOT_EXPERIMENTAL_DATA'
      });
    } else {
      exercises.push({
        id: `EX-${lesson.code}-${diff.toUpperCase()}-${idx}`,
        lessonId: lesson.id,
        level: lesson.level,
        skill: chosenSkill,
        difficulty: diff,
        statementAr: `تمرين تطبيقي لدرس "${lesson.titleAr}" (${lesson.level}) حول الكفاية: "${chosenSkill}" (المستوى: ${diff}).`,
        statementFr: `Exercice d'application pour "${lesson.titleFr}" (${lesson.level}) sur la compétence: "${chosenSkill}".`,
        referenceSolution: {
          stepsAr: [
            `تحديد شروط الدرس في ${lesson.titleAr}.`,
            'تطبيق الخاصية المناسبة خطوة بخطوة.',
            'التحقق من النتيجة النهائية.'
          ],
          finalAnswer: `حل مرجعي لدرس ${lesson.titleAr}`,
          testVerificationKey: `GENERIC_${lesson.id}`
        },
        isPilotData: Boolean(lesson.isPilotData),
        contentTag: lesson.isPilotData ? 'PILOT_EXPERIMENTAL_DATA' : 'OFFICIAL_CURRICULUM_BASELINE'
      });
    }
  }

  return {
    lesson: { id: lesson.id, titleAr: lesson.titleAr, titleFr: lesson.titleFr, level: lesson.level },
    totalGenerated: exercises.length,
    exercises,
    curriculumCompliance: {
      isPilotData: Boolean(lesson.isPilotData),
      tag: lesson.isPilotData ? 'PILOT_EXPERIMENTAL_DATA' : 'OFFICIAL_CURRICULUM_BASELINE',
      noticeAr: lesson.isPilotData
        ? 'محتوى تجريبي (Pilot Data) مرفق بحل مرجعي لأغراض الاختبار والتقييم.'
        : 'محتوى مرجعي معتمد للحزمة الذهبية للأولى إعدادي (1AC).'
    }
  };
}

const [toolName, rawArgs = '{}'] = process.argv.slice(2);
if (!toolName) {
  console.error('Usage: node scripts/moroccan-math.mjs <list_curriculum|search_lessons|verify_calculation|generate_exercises> [jsonArgs]');
  process.exit(1);
}

try {
  const parsedArgs = JSON.parse(rawArgs);
  let output;
  switch (toolName) {
    case 'list_curriculum':
      output = listCurriculum(parsedArgs);
      break;
    case 'search_lessons':
      output = searchLessons(parsedArgs);
      break;
    case 'verify_calculation':
      output = verifyCalculation(parsedArgs);
      break;
    case 'generate_exercises':
      output = generateExercises(parsedArgs);
      break;
    default:
      throw new Error(`Unknown tool "${toolName}".`);
  }
  console.log(JSON.stringify({ success: true, toolName, result: output }, null, 2));
} catch (err) {
  console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }, null, 2));
  process.exit(1);
        }
