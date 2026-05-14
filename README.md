# InkRamp Build — Master Communication Hub

> **How to use this file:** This `README.md` is the single source of truth for the InkRamp assignment build.
> Update checkboxes as items are completed. Add notes under each section as decisions are made.
> Treat every section as a living document — rewrite forecasts as reality diverges from plan.

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [Build Checklist](#2-build-checklist)
3. [Time Forecast](#3-time-forecast)
4. [Cost Forecast](#4-cost-forecast)
   - [Development Phase Costs](#41-development-phase-costs)
   - [Monthly Operating Costs at 1,000 Active Buyers](#42-monthly-operating-costs-at-1000-active-buyers)
5. [Success-Rate Forecast](#5-success-rate-forecast)
6. [Key Decisions & Cuts Log](#6-key-decisions--cuts-log)
7. [Session Log](#7-session-log)

---

## 1. What We Are Building

**InkRamp** — a fictional B2B marketplace for commercial print procurement.
Buyers describe a print job in natural language; within minutes they receive three priced, comparable quotes from vetted suppliers.

**Stack:** Node.js + TypeScript backend · Angular frontend · AWS (Lambda / RDS / S3 / CloudFront) · PostgreSQL + pgvector · OpenAI/Anthropic LLMs

**Architecture:** Modular monolith with named domain boundaries:
`identity` · `catalog` · `rfq` · `quoting` · `documents` · `ai-platform` · `analytics`

---

## 2. Build Checklist

Tick boxes here as work is completed. Add a date and brief note in parentheses when an item is done.

### 2.1 Infrastructure & DevOps
- [ ] IaC: RDS (PostgreSQL + pgvector) stack
- [ ] IaC: Lambda + API Gateway stack
- [ ] IaC: CloudFront + S3 for Shell/MFE hosting
- [ ] IaC: CloudFront + S3 for static site (this repo)
- [ ] IaC: Secrets Manager integration (no .env in repo)
- [ ] IaC: Route53 / custom domain
- [ ] IaC: dev / staging / prod parameterisation
- [ ] One-command local setup (`make dev` or `docker compose up`)
- [ ] Clean commit history across all repos

### 2.2 Auth & Identity (`identity` module + Shell)
- [ ] Buyer registration & login
- [ ] Supplier registration & login
- [ ] Admin login
- [ ] JWT / session management
- [ ] Password reset flow
- [ ] RBAC enforced on every backend endpoint
- [ ] CSRF / CORS configured

### 2.3 Supplier Catalogue (`catalog` module + `mfe-admin`)
- [ ] 50+ synthetic supplier listings seeded
- [ ] Supplier schema: capabilities, machinery, lead times, paper inventory, regions, certifications
- [ ] Vector embeddings generated for supplier listings
- [ ] pgvector integration
- [ ] Hybrid retrieval (keyword + vector) search endpoint
- [ ] Supplier catalogue management UI in admin MFE

### 2.4 Conversational Intake Agent (`ai-platform` + `mfe-buyer`)
- [ ] Chat UI in buyer MFE
- [ ] Agent extracts structured RFQ from free-form text
- [ ] Clarifying question loop (missing / ambiguous fields)
- [ ] Agent never invents fields
- [ ] Output validated against RFQ schema
- [ ] Prompt-injection defence on user input
- [ ] PII redaction before LLM call
- [ ] Structured agent run log (input, model, prompt version, tools, tokens, cost, latency, output)

### 2.5 Vision / Multimodal Agent (`ai-platform` + `mfe-buyer`)
- [ ] Image upload UI in buyer MFE
- [ ] Agent extracts spec from image (dimensions, fold, paper weight, colour, finish)
- [ ] Output reconciles with typed RFQ (conflicts surfaced, not silently overridden)
- [ ] At least 3 example image uploads seeded
- [ ] Structured agent run log

### 2.6 RFQ Pipeline (`rfq` module)
- [ ] RFQ creation from intake agent output
- [ ] RFQ status tracking (draft → sent → quoted → accepted → PO issued)
- [ ] 10+ sample RFQs seeded in various states
- [ ] Buyer RFQ list & detail view in buyer MFE
- [ ] Supplier RFQ inbox in supplier MFE

### 2.7 Multi-Step Orchestration Agent (`ai-platform` + `quoting` modules)
- [ ] Match RFQ to top-K suppliers via search layer
- [ ] Generate normalised RFQ payload per supplier
- [ ] Accept supplier quote responses (free-text, JSON, scanned-PDF-like text)
- [ ] Normalise quotes into comparable buyer-facing view (unit price, total, lead time, finishes, exclusions)
- [ ] Surface anomalies (missing finish, different units)
- [ ] Malformed supplier response handling
- [ ] Structured agent run log

### 2.8 Document AI (`documents` module)
- [ ] Purchase Order PDF (on buyer accepts quote)
- [ ] Invoice PDF stub (supplier side)
- [ ] Quote Comparison PDF (buyer downloadable)
- [ ] PDFs generated programmatically (not screenshot-rendered)
- [ ] PDFs look product-quality

### 2.9 Admin Analytics (`analytics` module + `mfe-admin`)
- [ ] RFQs created metric
- [ ] Quote turnaround time metric
- [ ] Conversion rate metric
- [ ] Supplier response rate metric
- [ ] Agent cost per RFQ metric
- [ ] AI-generated insight widget (real LLM call over real synthetic data)
- [ ] Agent observability / logs viewer

### 2.10 AI Guardrails & Security
- [ ] Prompt-injection defence on all user-supplied text fed to agents
- [ ] Output validation against schemas for all agent outputs
- [ ] Eval logging for every agent run
- [ ] Rate limiting on AI endpoints
- [ ] PII redaction before LLM calls
- [ ] Secrets in Secrets Manager (not .env)
- [ ] Input validation on all endpoints
- [ ] No raw SQL with string concatenation

### 2.11 Testing
- [ ] RFQ creation critical path tests
- [ ] Quote normalisation unit tests
- [ ] Role-gated endpoint tests
- [ ] Agent output schema validation tests

### 2.12 Documentation (`/docs`)
- [ ] Product Brief (1 page: problem, user, bet, cuts)
- [ ] HLD (architecture, module boundaries, data flow, deploy topology)
- [ ] LLD (DB schema, API contracts, agent state machines, error/retry semantics)
- [ ] AI System Card: Intake Agent
- [ ] AI System Card: Vision Agent
- [ ] AI System Card: Search / Retrieval
- [ ] AI System Card: Orchestration Agent
- [ ] AI System Card: Analytics Insight Widget
- [ ] Modular Monolith Rationale
- [ ] Security & Guardrails doc
- [ ] What Breaks at 100× doc
- [ ] Cost Estimate at 1,000 active buyers/month
- [ ] Engineering Playbook (1 page, Day 1 hire guide)
- [ ] AI Usage Log (`/docs/AI_USAGE.md`)

### 2.13 Final Deliverables
- [ ] Live deployed application (public AWS URL)
- [ ] Three test accounts: `buyer@inkramp.test` · `supplier@inkramp.test` · `admin@inkramp.test`
- [ ] Seed data loaded (50+ suppliers, 10+ RFQs, 3+ image uploads)
- [ ] Public GitHub repos with clean commit history
- [ ] README with one-command setup + test credentials
- [ ] Walkthrough video (10–15 min, hard cap 17 min, hosted on Loom / YouTube)
  - [ ] Buyer journey demo (3–4 min)
  - [ ] Architecture walkthrough (2–3 min)
  - [ ] Deep dive on one agent (3–4 min)
  - [ ] Live AI workflow demo — real, unedited (2 min)
  - [ ] What you cut and why (1 min)
- [ ] This static site live with checklist + AI usage log

---

## 3. Time Forecast

**Assignment target:** 60–72 focused hours over 7 calendar days.

The table below gives a realistic per-area breakdown. "AI-assisted" times assume heavy Copilot / Claude Code use for boilerplate, schema generation, test scaffolding, and seed data — while architectural decisions, prompt design, and evals are done by hand.

| Area | Hours (Solo, no AI) | Hours (AI-assisted) | Notes |
|---|---|---|---|
| Infrastructure & DevOps | 12 | 5–7 | CDK/Terraform boilerplate writes itself; custom domain + Secrets Manager wiring needs care |
| Auth & Identity | 8 | 3–4 | JWT + RBAC is well-trodden; password reset email needs an SES/SendGrid setup |
| Supplier Catalogue + Seed Data | 8 | 3–4 | AI can generate 50 synthetic listings in minutes; pgvector + hybrid retrieval needs human review |
| Conversational Intake Agent | 10 | 5–6 | Prompt design + clarifying loop + PII redaction + eval logging = the part AI cannot fully own |
| Vision / Multimodal Agent | 6 | 3–4 | GPT-4o / Claude 3.5 Sonnet does the heavy lift; reconciliation logic needs care |
| RFQ Pipeline | 8 | 3–4 | CRUD + status machine; straightforward with AI scaffolding |
| Orchestration Agent | 12 | 6–8 | Hardest piece; malformed input handling, anomaly detection, multi-format parsing require hand-tuning |
| Document AI (PDFs) | 6 | 2–3 | PDFKit / Puppeteer + template = fast with AI; styling to "product quality" takes iteration |
| Admin Analytics Dashboard | 8 | 3–4 | LLM insight widget + observability logs page; metrics queries are boilerplate |
| AI Guardrails & Security | 6 | 2–3 | Rate limiting + schema validation + injection defence; well-documented patterns |
| Testing | 8 | 3–4 | AI-generated tests are welcome *if you've actually read them* — budget read time |
| Documentation (all /docs) | 12 | 5–6 | AI drafts; human edits for accuracy. AI System Cards take longest — must be real artifacts |
| Video + Deployment polish | 5 | 4–5 | Recording, editing, final deploy smoke test |
| **Total** | **~109** | **~52–63** | **Target: 60–72 h** |

**Bottom line:** The 60–72 hour window is achievable with disciplined AI use and the right cuts. The schedule breaks if you:
- Spend >2 hours debugging infrastructure instead of using managed defaults
- Write tests from scratch instead of AI-scaffolding + review
- Try to make the UI pixel-perfect (explicitly out of scope per the rubric)

**Recommended daily cadence (7-day window):**

| Day | Focus | Target hours |
|---|---|---|
| 1 | Repo setup, IaC skeleton, Auth & Identity | 10 |
| 2 | Supplier catalogue, seed data, pgvector, hybrid search | 9 |
| 3 | Intake agent + Vision agent (full prompt + evals) | 10 |
| 4 | RFQ pipeline + Orchestration agent (core path) | 10 |
| 5 | Document AI + Admin analytics + AI insight widget | 9 |
| 6 | Guardrails, security, testing, deploy to AWS | 8 |
| 7 | All documentation, AI Usage Log, video, final QA | 8 |
| **Total** | | **~64 h** |

---

## 4. Cost Forecast

### 4.1 Development Phase Costs

| Item | Est. Cost |
|---|---|
| LLM API calls (dev + iteration, ~500k tokens) | $30–80 |
| AWS dev environment (RDS t3.micro, Lambda, S3, CF) | $20–40 |
| Miscellaneous (domain, SES, misc tooling) | $10–20 |
| **Total dev cost** | **$60–140** |

### 4.2 Monthly Operating Costs at 1,000 Active Buyers

**Assumptions:**
- 1,000 active buyers/month
- Average 5 RFQs per buyer per month = **5,000 RFQs/month**
- ~40% of buyers use the vision agent = **2,000 image extractions/month**
- Admin analytics insight widget runs 4× daily = **~120 LLM calls/month**
- LLM: GPT-4o for orchestration + vision; GPT-4o-mini for intake + analytics

#### Infrastructure

| Service | Config | $/month |
|---|---|---|
| RDS PostgreSQL (pgvector) | db.t3.medium, Multi-AZ off | $55 |
| Lambda + API Gateway | ~10M requests/month | $20–30 |
| S3 + CloudFront (Angular MFEs + assets) | 50 GB transfer | $15–25 |
| Secrets Manager | 10 secrets | $2 |
| Route53 | 1 hosted zone | $1 |
| SES (password reset emails) | 5,000 emails/month | $1 |
| **Infrastructure subtotal** | | **$94–114/month** |

#### LLM / AI

| Agent / Use | Model | Volume | $/call est. | $/month |
|---|---|---|---|---|
| Intake agent (text RFQ extraction) | GPT-4o-mini | 5,000 RFQs | $0.01 | $50 |
| Intake agent clarifying turns (avg 2 extra) | GPT-4o-mini | 10,000 turns | $0.005 | $50 |
| Vision agent (image → spec) | GPT-4o | 2,000 images | $0.05 | $100 |
| Embedding generation (suppliers + RFQs) | text-embedding-3-small | 5,000 RFQs + initial 50 suppliers | $0.002 | $10 |
| Orchestration agent (match + normalise + anomaly) | GPT-4o | 5,000 RFQs | $0.10 | $500 |
| Analytics insight widget | GPT-4o-mini | 120 calls | $0.02 | $2.40 |
| **LLM subtotal** | | | | **~$712/month** |

#### Total Monthly at 1,000 Active Buyers

| Category | $/month |
|---|---|
| Infrastructure | $94–114 |
| LLM / AI | ~$712 |
| **Grand total** | **~$806–826/month** |
| **Per active buyer** | **~$0.81–0.83** |
| **Per RFQ** | **~$0.16** |

**Sensitivity notes:**
- If GPT-4o is replaced with Claude 3.5 Haiku for intake/orchestration, LLM bill drops ~30% → **~$570/month total LLM**.
- Caching supplier embeddings (re-embed only on catalogue changes, not per query) cuts embedding cost to near zero.
- At 10,000 active buyers (10× scale) the LLM cost scales linearly (~$7,120/month) but infrastructure scales sub-linearly (~$300–500/month with proper autoscaling) — making AI the dominant cost driver, not compute.

---

## 5. Success-Rate Forecast

> **Important:** This section will be updated as you share your background, current progress, and tooling choices. The numbers below are a calibrated prior for a strong senior engineer with good AI fluency but no prior InkRamp-specific context.

### Rubric Score Forecast

| Dimension | Weight | Likely Score | Notes |
|---|---|---|---|
| Technical depth & architecture | 20 | 15–18/20 | Modular monolith with clear seams is achievable; full marks require the code to *match* the docs |
| AI engineering quality | 25 | 18–22/25 | Real evals + guardrails + structured logs is the differentiator; most candidates skip evals — don't |
| Product judgement | 15 | 11–13/15 | Score rises if cuts are documented and UX empathy is visible in the buyer/supplier flow |
| Documentation quality | 15 | 11–13/15 | AI System Cards written as real artifacts (with latency/cost numbers from actual runs) earn top marks |
| AI-leveraged velocity (with evidence) | 15 | 12–14/15 | Score requires a specific, honest AI Usage Log — generic logs fail automatically |
| Honesty & self-assessment | 10 | 8–9/10 | Flag what is broken; never claim "everything works" |
| **Projected total** | **100** | **75–89/100** | |

### Scenario Analysis

| Scenario | Projected Score | Outcome |
|---|---|---|
| ✅ Strong AI fluency, ships all core agents, real evals logged, honest cuts documented | 85–92 | **Hire territory / fast offer** |
| ⚠️ Most features shipped, evals skipped, generic AI Usage Log, docs thin | 70–78 | "Gets a real conversation" |
| ❌ Over-scoped, ran out of time, UI heavy but pipeline incomplete, no AI Usage Log | 55–68 | Likely pass |
| ⭐ All agents shipped + AI System Cards are real + video live AI workflow is fluent | 90–96 | **Offer designed same week** |

### The Three Biggest Score levers (in order)

1. **Orchestration agent quality** — This is explicitly "the one closest to real Pactap work." A working, logged, anomaly-detecting orchestration agent with malformed-input handling is worth more than a beautiful UI.
2. **Honest AI Usage Log** — A generic log is an automatic fail on a 15-point dimension. Write it as you go; don't reconstruct it at the end.
3. **Real evals, not vibes** — Logging `eval_verdict: pass/fail` with schema validation on every agent run is what separates a senior AI engineer from someone who "just calls the API."

### Factors That Will Update This Forecast
*(To be filled in as you share details)*

- [ ] Your existing experience with pgvector / vector search
- [ ] Your existing experience with LLM agent orchestration (LangChain / LangGraph / custom)
- [ ] Your Angular proficiency (frontend can be a time sink)
- [ ] Your AWS CDK / Terraform fluency
- [ ] Hours already spent vs hours remaining in the 7-day window
- [ ] Current checklist completion percentage

**→ Paste your answers to the above in the [Session Log](#7-session-log) and the forecast will be updated.**

---

## 6. Key Decisions & Cuts Log

> Record every significant cut or trade-off here as it is made. This feeds directly into the Product Brief and the "What you cut and why" video segment.

| # | Decision | Rationale | Date |
|---|---|---|---|
| 1 | *(example) Skip pixel-perfect UI polish* | Rubric explicitly says "clean plain UI beats beautiful broken pipeline" | — |
| 2 | *(example) Use pgvector over a dedicated vector DB (Pinecone/Weaviate)* | Eliminates one more managed service, simplifies IaC, pgvector is production-ready at this scale | — |
| 3 | | | |

---

## 7. Session Log

> Use this section to communicate context between sessions. Paste answers, progress updates, blockers, and questions here.

### Session 1 — 2026-05-14
- Ingested full assignment brief (Pactap Head of Engineering take-home)
- Ingested full build checklist
- README created with checklist, time forecast, cost forecast, and success-rate analysis
- **Pending from you:** Background details (experience levels listed in §5) to sharpen the forecast

---

*Last updated: 2026-05-14*
