# Moroccan Math Curriculum AgentSkill (`moroccan-math-curriculum`)

A 100% self-contained, offline **agentskills.io** skill package for Moroccan national mathematics (1AC official Gold Standard pack + 3APIC–2BAC pilot datasets), featuring bilingual Arabic/French lesson search, deterministic calculation verification, and exercise generation.

- **Zero external npm dependencies** (pure Node.js 18+ ESM)
- **No API keys or remote servers required**

## Package Structure

```text
moroccan-math-curriculum/
├── SKILL.md
├── LICENSE
├── README.md
├── assets/
│   ├── morocco-math-1ac-gold.json
│   └── pilot-lessons.json
└── scripts/
    └── moroccan-math.mjs
```

## Included Tools

1. `list_curriculum` — Browse covered levels (`1AC`, `3APIC`, `TCS`, `1BAC_SM`, `2BAC_PC_SVT`, `2BAC_SM`), domains, and semesters.
2. `search_lessons` — Search lessons in Arabic or French with objectives, prerequisites, targeted skills, concepts, and common student mistakes.
3. `verify_calculation` — Deterministically verify `arithmetic`, `fraction`, `gcd_lcm`, `quadratic_equation`, `linear_system_2x2`, and `modular_arithmetic`.
4. `generate_exercises` — Generate difficulty-graded exercises (`easy`, `medium`, `hard`) with bilingual statements and step-by-step reference solutions.

## Quick Local Test

```bash
node scripts/moroccan-math.mjs list_curriculum '{}'
node scripts/moroccan-math.mjs search_lessons '{"query":"فيثاغورس"}'
node scripts/moroccan-math.mjs verify_calculation '{"operation_type":"gcd_lcm","parameters":{"a":48,"b":36}}'
node scripts/moroccan-math.mjs generate_exercises '{"lesson_id":"3apic-pythagore","difficulty":"medium","count":1}'
```

## Pedagogical & Scope Transparency

- **`1AC`:** Official Gold Standard pack (`MOROCCO-MATH-1AC-GOLD-v1`).
- **`3APIC` – `2BAC`:** Documented pilot samples (`isPilotData: true`).
- **`verify_calculation`:** Deterministic for the 6 supported numeric/algebraic operations only (does not prove general mathematical theorems).

## License

MIT — see [LICENSE](./LICENSE).
