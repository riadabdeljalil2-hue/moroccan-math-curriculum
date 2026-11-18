---
name: moroccan-math-curriculum
description: >
  Offline Moroccan national mathematics curriculum toolkit (1AC official Gold Standard
  pack and 3APIC–2BAC pilot lessons). Provides bilingual Arabic/French lesson search with
  didactic common mistakes, deterministic verification of arithmetic, fractions, PGCD/PPCM,
  quadratic equations, 2x2 linear systems, and modular arithmetic, plus curriculum-aligned
  exercise generation. Use whenever a user asks about Moroccan math lessons (collège or
  lycée), needs Arabic/French explanations aligned with Moroccan Ministry of National
  Education guidelines, or wants verified step-by-step math checks and practice exercises.
license: MIT
compatibility: >
  Self-contained offline skill. Requires Node.js 18+ only. No external npm packages,
  no API keys, and no network access required.
metadata:
  author: riadabdeljalil2
  version: "1.0.0"
  category: education
  language: bilingual-ar-fr-en
  curriculum: Morocco-MEN-Mathematics
allowed-tools: Bash(node:*) Read
---

# Moroccan Math Curriculum & Verification Skill (Standalone)

Use the local Node.js CLI helper `scripts/moroccan-math.mjs` and bundled curriculum datasets in `assets/` to look up Moroccan mathematics lessons, diagnose common student errors, verify calculations deterministically, and generate practice exercises—completely offline without API keys or external servers.

## When to Trigger This Skill

Activate this skill whenever the user:
- Mentions Moroccan school levels or tracks: `1AC` (الأولى إعدادي), `3APIC` (الثالثة إعدادي), `TCS` (الجذع المشترك العلمي), `1BAC_SM`, `2BAC_PC_SVT`, or `2BAC_SM`.
- Requests lessons, prerequisites, competencies (*kifayat*), or common student misconceptions in Arabic or French for Moroccan mathematics.
- Asks to verify or solve step-by-step: order-of-operations arithmetic, fraction simplification/operations, Euclidean `PGCD`/`PPCM`, quadratic equations (discriminant and real/complex roots), 2x2 linear systems, or modular congruence (`a mod m`).
- Wants practice exercises with reference solutions aligned to a Moroccan curriculum lesson.

---

## Step-by-Step Agent Workflow

Run `node scripts/moroccan-math.mjs <tool_name> '<json_args>'` from the skill root directory.

### Step 1: Discover Levels & Lesson IDs (`list_curriculum`)
Check covered levels, domains, and available `lesson_id` values:
```bash
node scripts/moroccan-math.mjs list_curriculum '{}'
```
Optional filters inside JSON args:
- `level_filter`: `"1AC"` | `"3APIC"` | `"TCS"` | `"1BAC_SM"` | `"2BAC_SM"` | `"2BAC_PC_SVT"`
- `domain_filter`: `"arithmetic"` | `"algebra"` | `"geometry"` | `"analysis"` | `"trigonometry"` | `"complex_numbers"`
- `semester`: `1` | `2`

### Step 2: Search Lessons & Didactic Metadata (`search_lessons`)
Search in Arabic or French (2–100 chars):
```bash
node scripts/moroccan-math.mjs search_lessons '{"query":"فيثاغورس"}'
```
Optional filters:
- `level`: narrow to a specific level (e.g., `"1AC"`, `"3APIC"`)
- `language`: `"ar"` | `"fr"` | `"all"`

Use the returned `objectives`, `prerequisites`, `targetedSkills`, `concepts`, and `commonMistakes` (detailed for `1AC`) to anchor your explanation in Moroccan pedagogical terminology.

### Step 3: Verify Calculations Deterministically (`verify_calculation`)
**Never rely on mental math for supported operations when grading or explaining.** Always run `verify_calculation`:
```bash
node scripts/moroccan-math.mjs verify_calculation \
  '{"operation_type":"arithmetic","parameters":{"expression":"2 * (3 + 4) - 2^3"},"expected_result":6}'
```
Supported `operation_type` values and `parameters`:
- `"arithmetic"`: `{ "expression": "2 * (3 + 4) - 2^3" }` (digits, `+`, `-`, `*`, `/`, `^`, `(`, `)`, `.`, max 120 chars)
- `"fraction"`: `{ "num1": 18, "den1": 24 }` or `{ "num1": 1, "den1": 2, "num2": 2, "den2": 3, "op": "+" }` (`op`: `+`, `-`, `*`, `/`)
- `"gcd_lcm"`: `{ "a": 48, "b": 36 }` (positive integers `<= 10^9`)
- `"quadratic_equation"`: `{ "a": 1, "b": -5, "c": 6 }` (`ax^2 + bx + c = 0`, `a != 0`)
- `"linear_system_2x2"`: `{ "a1": 1, "b1": 1, "c1": 5, "a2": 2, "b2": 1, "c2": 8 }`
- `"modular_arithmetic"`: `{ "a": 17, "m": 5 }` (`m > 0`)
- Optional `expected_result`: student's answer to populate `matchesExpected`.

### Step 4: Generate Curriculum-Aligned Exercises (`generate_exercises`)
Generate 1 to 5 exercises for a valid `lesson_id`:
```bash
node scripts/moroccan-math.mjs generate_exercises \
  '{"lesson_id":"3apic-pythagore","difficulty":"medium","count":1}'
```
Parameters:
- `lesson_id` (required — e.g. `"les-math-1ac-precedence"`, `"les-math-1ac-dev-fact"`, `"les-math-1ac-mediatrice-detail"`, `"3apic-pythagore"`, `"3apic-systemes"`, `"tcs-arithmetique"`, `"tcs-second-degre"`, `"2bac-limites-continuite"`)
- `difficulty`: `"easy"` | `"medium"` | `"hard"` (default `"medium"`)
- `count`: integer `1`–`5` (default `1`)
- `skill`: optional competency string

---

## Guardrails & Transparency Rules

1. **Official vs. Pilot Coverage:**
   - Only `1AC` (`MOROCCO-MATH-1AC-GOLD-v1`, 5 lessons) is an official Gold Standard curriculum pack with full didactic concepts and common-mistake remediation.
   - `3APIC`, `TCS`, `1BAC_SM`, `2BAC_PC_SVT`, and `2BAC_SM` are **documented pilot samples** (`isPilotData: true`). Never claim complete official coverage of all Moroccan grades.
2. **Verification Scope Boundaries:**
   - `verify_calculation` checks only the 6 supported numeric/algebraic operations. It does **not** prove general mathematical theorems or abstract geometric proofs.
3. **Language Matching:**
   - Respond in the student's language (Arabic, French, or bilingual Arabic/French for BIOF), preserving standard Moroccan notation (`PGCD`, `PPCM`, `Delta`, `S = {...}`, `R^2`).
