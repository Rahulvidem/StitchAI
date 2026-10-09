# StitchAI — AI-Powered Custom Apparel, Sales, and Business Automation Platform

**StitchAI v3.5** is a complete, full-stack, AI-driven operating system designed to automate custom apparel manufacturing, embroidery digitizing, sales negotiations, and factory coordination.

---

## 🌟 What Has Been Built (All 5 Pillars Implemented)

1. **🤖 Gemini LLM Sales Agent & Voice Intake**:
   - Integrated with Google Gemini 2.5 Flash / 1.5 Flash API with intelligent multi-attribute parameter extraction (garment, GSM fabric, volume, sizes, placements, deadlines, ZIP).
   - Real-time voice microphone simulation with animated audio waveform pulses.
   - Built-in Gemini API key manager with seamless fallback to StitchAI's autonomous heuristic engine.

2. **🧵 Real Computer Vision Embroidery Studio**:
   - Client-side Canvas HTML5 pixel traversal and 3x3 Sobel gradient edge analysis.
   - Automatic color clustering mapped to the official **Madeira Polyneon 40 catalog** (Classic White, Super Black, Electric Indigo, Riviera Cyan, Metallic Gold, Ruby Red, etc.).
   - Interactive 2D/3D SVG mockup visualizer with realistic **Satin Thread**, **3D Puff Relief**, and **Screen Print** shaders on 6 garments (Hoodies, T-Shirts, Polos, Snapback Caps, Bomber Jackets, Barista Aprons).

3. **🗄️ Relational Database & Persistence (SQLite)**:
   - Dedicated `db.py` module managing `stitchai.db` with 6 ACID-compliant tables:
     - `orders`: Tracks active jobs, stages, payment statuses, and tracking numbers.
     - `quotes`: Stores historical quotation line items and validity dates.
     - `leads`: AI high-intent lead intelligence pipeline with intent scores (e.g. 96%).
     - `artworks`: Vector analysis specs, stitch counts, and Madeira thread codes.
     - `transactions`: Records Stripe and Razorpay payment receipts.
     - `qc_logs`: Production machine quality check records.

4. **💳 Stripe & Razorpay Payment Checkout Gateways**:
   - Interactive modal supporting **Stripe 256-bit Credit/Debit Card Checkout** and **Razorpay Dynamic UPI QR Code Checkout**.
   - Generates simulated transaction IDs (`TXN-9F312A`), marks orders as **PAID** in the SQLite database, and automatically advances orders to the manufacturing stage.

5. **🎓 Academic Presentation Deck & Comprehensive Thesis Report**:
   - **Interactive 10-Slide Presentation Deck**: Complete with slide-by-slide navigator, direct slide indicator dots, and presenter notes for thesis or investor defenses.
   - **Full Technical Documentation & Equations**: Formatted with KaTeX mathematical formulas:
     - Tatami surface stitch equation: $S_{\text{tatami}} = A \cdot \rho_{\text{tatami}} \cdot \gamma_{\text{fill}}$
     - Perimeter Satin border equation: $S_{\text{satin}} = P \cdot \rho_{\text{satin}}$
     - Perceptually weighted Euclidean thread distance: $\Delta E = \sqrt{2(\Delta R)^2 + 4(\Delta G)^2 + 3(\Delta B)^2}$
     - Algorithmic unit pricing model: $P_{\text{unit}} = [B(Q) + (S/1000) \cdot R_s + (K-1) \cdot C_m + C_{\text{pack}}] \cdot M_{\text{velocity}}$

---

## 🚀 Run StitchAI with SQLite

The browser app calls the Python REST API for SQLite-backed orders, leads, quotes,
artwork analyses, and payment transactions. Do not open `index.html` directly;
serve it through the backend so its `/api/...` requests use the same origin.

From the project root, start the backend:

```bash
python3 backend/server.py
```

Open **http://localhost:8000**. The backend serves the frontend and API from the
same origin. Alternatively, VS Code Live Server (for example,
`http://127.0.0.1:5500`) can serve the frontend; on localhost, its API requests
are routed to the backend on port 8000. The status badge indicates whether the
backend and SQLite database are reachable.

The backend uses only the Python standard library and SQLite, so no package
installation is required. Set `GEMINI_API_KEY` in the environment to enable
Gemini; without it, the local assistant fallback is used. `PORT` can be set to
change the backend port.

---

## 📁 Repository Structure

```
stitchai/
├── frontend/
│   ├── index.html   # Single-page application and module markup
│   ├── app.js       # Client-side application, CV, AI, payments, and presentation logic
│   └── styles.css   # Application styles
├── backend/
│   ├── server.py    # Python HTTP server and REST API
│   ├── db.py        # SQLite schema, seed data, and persistence functions
│   ├── cv_engine.py # Embroidery analysis and Madeira thread catalog
│   └── stitchai.db  # Local runtime database (ignored by Git)
├── .gitignore
└── README.md
```
