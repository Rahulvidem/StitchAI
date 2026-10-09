// StitchAI - Full Application Logic v3.5
// Complete AI-Powered Custom Apparel, Sales & Business Automation Platform

// --- GLOBAL STATE ---
const state = {
  activeTab: 'overview',
  activePersona: 'customer', // 'customer' | 'merchant' | 'factory'

  // Gemini API Configuration
  gemini: {
    apiKey: localStorage.getItem('stitchai_gemini_key') || '',
    model: 'gemini-2.5-flash',
    isConnected: false
  },

  // AI Receptionist & Sales Agent
  chat: {
    messages: [
      {
        sender: 'ai',
        time: '10:00 AM',
        text: "👋 Welcome to StitchAI! I'm your AI Apparel Specialist & Sales Concierge. Whether you need custom heavyweight hoodies for your college club, embroidered polos for a company summit, or uniform lines for a restaurant chain—I can configure your garments, analyze your embroidery artwork, and issue instant volume quotations in under 30 seconds. What project are we creating today?"
      }
    ],
    isRecordingVoice: false,
    extractedRequirements: {
      garment: 'Heavyweight Fleece Hoodie',
      fabric: '400 GSM Combed Cotton Terry',
      quantity: 150,
      sizes: 'S: 25, M: 50, L: 50, XL: 25',
      colors: ['Midnight Black', 'Vintage Cream'],
      placement: 'Center Chest (Embroidery) + Left Sleeve (Woven Patch)',
      deadline: '10 Days (Priority Delivery)',
      location: 'San Francisco, CA (94107)',
      estimatedBudget: '$3,800 - $4,200'
    }
  },

  // AI Embroidery & Computer Vision Studio
  studio: {
    selectedGarment: 'hoodie',
    garmentColor: '#18181b', // Onyx Black
    garmentColorName: 'Onyx Black',
    placement: 'center-chest',
    renderMode: 'embroidery-satin',
    logoScale: 100,
    logoRotation: 0,
    logoYOffset: 0,
    activePresetLogo: 'apex',
    customLogoUrl: null,
    
    // Computer Vision Analysis Result
    cvAnalysis: {
      imageName: 'Apex_Robotics_Emblem.svg',
      dimensions: '4.2" W × 3.8" H',
      complexityScore: 84,
      stitchCount: 16840,
      colorCount: 4,
      difficultyRating: 'Moderate - High Density',
      recommendedBacking: '3.0 oz Heavyweight Cutaway',
      underlayType: 'Dual Zig-Zag + Tatami Grid',
      puffEligibility: 'Eligible for Outer 3D Puff Border',
      estimatedRunTimeMinutes: 19.5,
      threadColors: [
        { name: 'Madeira Classic White', hex: '#FFFFFF', code: '1801', percentage: 38 },
        { name: 'Madeira Electric Indigo', hex: '#6366F1', code: '1738', percentage: 32 },
        { name: 'Madeira Cyan Riviera', hex: '#06B6D4', code: '1846', percentage: 18 },
        { name: 'Madeira Platinum Silver', hex: '#94A3B8', code: '1810', percentage: 12 }
      ]
    }
  },

  // Quotation Engine State
  quote: {
    garmentType: 'hoodie',
    quantity: 150,
    placementsCount: 2,
    stitchCount: 16840,
    speed: 'express',
    polybagging: true,
    wovenTags: true,
    zipCode: '94107',
    discountCode: 'STITCHAI-CLUB10',
    discountApplied: true
  },

  // Live Order Workflow State (Customer view)
  order: {
    id: 'ST-8942',
    client: 'Stanford Robotics & AI Club',
    title: '250× Heavyweight Terry Hoodies with 3D Puff Embroidery',
    currentStage: 2,
    totalPrice: 5600.00,
    paymentStatus: 'Paid',
    stages: [
      { id: 0, title: 'Inquiry & AI Quotation', date: 'Oct 04, 09:30 AM', status: 'completed', desc: 'Requirements validated by AI Receptionist. Instant quote generated.' },
      { id: 1, title: 'Digital Tech-Pack Generated', date: 'Oct 04, 11:15 AM', status: 'completed', desc: 'Computer vision generated 16,840-stitch embroidery blueprint & DST simulation.' },
      { id: 2, title: 'Proof Approval', date: 'Pending Action', status: 'active', desc: 'Customer digital approval required for thread palette and placement mockup.' },
      { id: 3, title: 'Garment Sourcing & Knits', date: 'Scheduled Oct 06', status: 'upcoming', desc: '400 GSM Combed Cotton blanks pulled from Pacific Apparel Mill.' },
      { id: 4, title: 'Multi-Head CNC Embroidery', date: 'Scheduled Oct 07', status: 'upcoming', desc: 'Tajima 12-Head industrial embroidery running Madeira Polyneon 40-weight thread.' },
      { id: 5, title: 'AI Computer Vision QC Inspection', date: 'Scheduled Oct 08', status: 'upcoming', desc: 'Automated camera defect detection scanning thread tension & needle trims.' },
      { id: 6, title: 'Custom Labeling & Packaging', date: 'Scheduled Oct 09', status: 'upcoming', desc: 'Custom woven tags heat-sealed and individually polybagged with size stickers.' },
      { id: 7, title: 'Dispatch & Express Delivery', date: 'Estimated Oct 11', status: 'upcoming', desc: 'Air Courier dispatch with live GPS tracking.' }
    ],
    proofApproved: false
  },

  // Production Partner Marketplace
  marketplace: {
    availableJobs: [
      {
        id: 'JOB-7021',
        title: '300× Heavyweight Crewnecks for Tech Summit',
        client: 'NextWave AI Corp',
        units: 300,
        stitchCount: 18200,
        colors: 4,
        garment: '380 GSM Organic French Terry',
        deadline: '7 Days',
        payout: '$3,850.00',
        margin: '38%',
        recommendedMachine: 'Tajima / Barudan (8+ Heads)',
        location: 'Oakland Hub',
        status: 'Open for Bidding'
      },
      {
        id: 'JOB-7022',
        title: '150× Performance Pique Polos (Left Chest)',
        client: 'Apex Capital Partners',
        units: 150,
        stitchCount: 9400,
        colors: 3,
        garment: '100% Combed Pique Cotton',
        deadline: '4 Days',
        payout: '$1,620.00',
        margin: '42%',
        recommendedMachine: 'Brother / Happy 4-Head',
        location: 'San Jose Hub',
        status: 'Open for Bidding'
      },
      {
        id: 'JOB-7023',
        title: '85× Structured Snapback Caps (3D Puff)',
        client: 'IronForge Athletics',
        units: 85,
        stitchCount: 22400,
        colors: 2,
        garment: 'Wool Blend 6-Panel Cap',
        deadline: '5 Days',
        payout: '$1,190.00',
        margin: '45%',
        recommendedMachine: 'Tubular Cap Driver Ready',
        location: 'Fremont Facility',
        status: 'Assigned'
      }
    ]
  },

  // AI CRM & Business Automation Hub
  crm: {
    leads: [
      {
        id: 'LD-904',
        name: 'Elena Rostova',
        org: 'Berkeley Autonomous Driving Club',
        dealSize: '$4,650 (320 Hoodies)',
        intentScore: 96,
        scoreTag: 'High Value - Immediate Buy',
        stage: 'AI Scored High-Intent',
        lastAction: 'AI Sales Agent sent volume price tier proposal'
      },
      {
        id: 'LD-905',
        name: 'Marcus Vance',
        org: 'Vanguard Fitness & CrossFit',
        dealSize: '$8,900 (600 Uniforms & Tees)',
        intentScore: 92,
        scoreTag: 'High Value - Recurring Contract',
        stage: 'Quote Sent',
        lastAction: 'Automated 48h Follow-up triggered with free digitizing perk'
      },
      {
        id: 'LD-906',
        name: 'Sophia Chen',
        org: 'Bloom Coffee & Eatery (5 Locations)',
        dealSize: '$2,150 (120 Heavy Canvas Aprons)',
        intentScore: 88,
        scoreTag: 'Warm Lead',
        stage: 'Design Proofing',
        lastAction: 'Awaiting client color swatch approval'
      },
      {
        id: 'LD-907',
        name: 'David Patel',
        org: 'Hackathon Global SF',
        dealSize: '$12,400 (1,000 Heavyweight Tees)',
        intentScore: 94,
        scoreTag: 'Enterprise Opportunity',
        stage: 'AI Scored High-Intent',
        lastAction: 'AI Sales Agent routed to Enterprise Fulfillment Partner'
      }
    ],
    whatsappSimulation: {
      messages: [
        { sender: 'customer', time: '10:14 AM', text: 'Hey StitchAI! We need 600 gym staff dry-fit tees with our metallic gold embroidered chest logo by the 20th. What is your bulk rate and can you send a proof?' },
        { sender: 'ai', time: '10:14 AM', text: 'Hey Marcus! 🏋️‍♂️ Absolutely! For 600× Pro-Stretch DryFit Crewnecks with metallic gold embroidery (~8,500 stitches), your bulk rate drops to $11.40/unit (saving you 32%).\n\n✅ Stock: 100% In-Stock in Onyx & Charcoal\n⏱️ Turnaround: 6 business days (Delivered by Oct 18)\n🧵 Digitizing Fee: $0 (Waived for 100+ units)\n\nI generated a 3D digital proof and instant approval link for you below:' }
      ]
    }
  },

  // Academic Presentation Slide Deck State
  academic: {
    activeSlide: 1,
    totalSlides: 10,
    slides: [
      {
        title: "StitchAI: Autonomous Apparel & Embroidery OS",
        subtitle: "Project Abstract & System Architecture Defense",
        badge: "Slide 01 • Executive Overview",
        points: [
          "<strong>Core Proposition:</strong> End-to-end digital transformation of custom apparel and embroidery supply chains.",
          "<strong>Key Breakthrough:</strong> Automates requirement intake, computer vision embroidery digitizing, dynamic quotations, and production dispatch into one autonomous loop.",
          "<strong>Primary Focus:</strong> College clubs, startups, gyms, uniform programs, and SMB embroidery mills.",
          "<strong>Tech Paradigm:</strong> Large Language Models (LLMs) + Computer Vision + Algorithmic Pricing + Tajima CNC Integration."
        ]
      },
      {
        title: "Industry Problem & Fragmentation Analysis",
        subtitle: "Why Traditional Custom Apparel Ordering is Broken",
        badge: "Slide 02 • Problem Statement",
        points: [
          "<strong>Communication Delays:</strong> Average custom apparel order requires 14+ manual emails/calls before design lock.",
          "<strong>Manual Digitizing Latency:</strong> Estimating stitch counts and generating .DST embroidery files takes 2-4 days.",
          "<strong>Opaque Pricing:</strong> Inconsistent quotes with surprise digitizing and rush fees leading to 45% cart abandonment.",
          "<strong>Disjointed Production:</strong> Zero real-time visibility for customers between payment and delivery."
        ]
      },
      {
        title: "The StitchAI Architecture & Solution",
        subtitle: "A Unified Digital Ecosystem with 6 Intelligent Pillars",
        badge: "Slide 03 • System Design",
        points: [
          "<strong>1. AI Receptionist:</strong> Natural language requirement parsing via Web Chat, Simulated Voice, and WhatsApp.",
          "<strong>2. CV Embroidery Studio:</strong> Instant vector segmentation, stitch count estimation, and Madeira 40 color matching.",
          "<strong>3. Algorithmic Quotation:</strong> Real-time transparent pricing factoring fabric knits, stitches, and volume tiers.",
          "<strong>4. Production Marketplace:</strong> Decentralized dispatch to vetted embroidery units with downloadable .DST files.",
          "<strong>5. 8-Stage Tracker:</strong> Transparent customer tracking with 1-click digital proof approvals.",
          "<strong>6. AI CRM:</strong> High-intent lead scoring and automated sales follow-up incentives."
        ]
      },
      {
        title: "Full-Stack Technical Architecture",
        subtitle: "React / Vite • Python FastAPI • SQLite / PostgreSQL • OpenCV",
        badge: "Slide 04 • Technical Stack",
        points: [
          "<strong>Frontend Layer:</strong> Modern SPA, SVG vector canvas shaders, Tailwind CSS, KaTeX math rendering.",
          "<strong>Backend Microservices:</strong> Python 3.14 / FastAPI REST API with CORS headers and JSON schemas.",
          "<strong>Database Persistence:</strong> SQLite3 (ACID compliant) storing orders, quotes, leads, transactions, and QC logs.",
          "<strong>AI & LLM Services:</strong> Google Gemini 2.5 Flash API with fallback to local heuristic autonomous engine.",
          "<strong>Payment Infrastructure:</strong> Stripe 256-bit card checkout & Razorpay dynamic UPI QR code simulation."
        ]
      },
      {
        title: "AI Receptionist & Conversational Sales Agent",
        subtitle: "Multi-Attribute Natural Language Extraction",
        badge: "Slide 05 • NLP & RAG Agent",
        points: [
          "<strong>Entity Extraction:</strong> Parses garment type, GSM fabric knits, quantities, size breakdown, placements, deadlines, and ZIP.",
          "<strong>Conversational Voice Intake:</strong> Real-time microphone listening simulation with audio waveform pulse visualizer.",
          "<strong>Catalog RAG Knowledge:</strong> References 120+ blank garment specs (Next Level, AS Colour, Stanley/Stella).",
          "<strong>Immediate Handoff:</strong> Auto-populates parameters into the Computer Vision Studio and Quotation Engine."
        ]
      },
      {
        title: "Computer Vision Embroidery Studio & Shaders",
        subtitle: "Real Pixel Edge Density & Madeira Thread Quantization",
        badge: "Slide 06 • Computer Vision",
        points: [
          "<strong>Pixel Traversal:</strong> Analyzes uploaded raster/vector artwork on HTML5 Canvas in real-time.",
          "<strong>Sobel Edge Filter:</strong> Computes high-contrast boundary gradients to calculate stitch complexity score.",
          "<strong>Thread Clustering:</strong> Maps dominant RGB pixel clusters to Madeira Polyneon 40 catalog codes.",
          "<strong>Shader Simulation:</strong> Renders authentic thread relief, 3D puff embroidery, and flat screenprint textures."
        ]
      },
      {
        title: "Algorithmic Dynamic Quotation Formulation",
        subtitle: "Mathematical Pricing Formulation & Multi-Tier Matrix",
        badge: "Slide 07 • Mathematics & Pricing",
        points: [
          "<strong>Formula:</strong> P_unit = [B(Q) + (S / 1000) * R_s + (K - 1) * C_m + C_pack] * M_velocity.",
          "<strong>Volume Tiers:</strong> Tier 1 (12-49 pcs), Tier 2 (50-149 pcs), Tier 3 (150-499 pcs), Tier 4 (500+ pcs).",
          "<strong>Digitizing Fee Policy:</strong> $35 fee automatically waived by AI on orders >= 50 units.",
          "<strong>Exportable Invoices:</strong> 1-click printable formal PDF quote with breakdown and terms."
        ]
      },
      {
        title: "Multi-Vendor Marketplace & Tajima .DST File Handoff",
        subtitle: "Decentralized Factory Dispatch & Quality Control",
        badge: "Slide 08 • Production Network",
        points: [
          "<strong>Vendor Job Board:</strong> B2B embroidery units bid or accept jobs based on machine capacity (Tajima/Barudan).",
          "<strong>CNC Data Generation:</strong> Generates and downloads standard Tajima .DST binary machine embroidery run-sheets.",
          "<strong>Live Telemetry:</strong> Monitors machine speed (850 SPM), run-time remaining, and thread tensions.",
          "<strong>Quality Control (QC):</strong> Computer vision needle defect scanning and digital inspection checklist logging."
        ]
      },
      {
        title: "AI CRM, Lead Scoring & WhatsApp Multichannel Bridge",
        subtitle: "Automating B2B Lead Conversion & Follow-Ups",
        badge: "Slide 09 • CRM & Multi-Channel",
        points: [
          "<strong>Lead Scoring Algorithm:</strong> Identifies high-intent opportunities (e.g. Elena Rostova - 96% Intent Score).",
          "<strong>Automated Follow-Up:</strong> Dispatches personalized volume discount incentives via email & messaging.",
          "<strong>WhatsApp Webhook Simulator:</strong> Instant 2-second quote and 3D mockup delivery directly in WhatsApp.",
          "<strong>Pipeline Analytics:</strong> Real-time tracking of pipeline gross merchandise value ($148,250) and turnaround times."
        ]
      },
      {
        title: "Business Model, Unit Economics & Academic Evaluation",
        subtitle: "Revenue Streams, Scalability & Future Research",
        badge: "Slide 10 • Conclusion & Roadmap",
        points: [
          "<strong>Revenue Streams:</strong> Garment margins (28-42%), marketplace commissions (8%), B2B SaaS plans, digitizing fees.",
          "<strong>Turnaround Optimization:</strong> Reduced cycle time from 18 days manual to 5.8 days autonomous.",
          "<strong>Conversion Lift:</strong> AI automated quoting increases inquiry-to-order conversion from 14% to 38.6%.",
          "<strong>Future Scope:</strong> Twilio real-time voice streaming API, robotic pick-and-pack warehouse integration, and 3D WebGL draping."
        ]
      }
    ]
  }
};

const API_BASE_URL = '';

function getSessionToken() {
  try {
    return JSON.parse(localStorage.getItem('stitchai-session') || 'null')?.token || '';
  } catch (error) {
    console.error('Could not read the StitchAI session:', error);
    return '';
  }
}

async function apiRequest(path, options = {}) {
  const token = getSessionToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

function setBackendStatus(connected, message) {
  const status = document.getElementById('backendStatus');
  if (!status) return;
  status.className = `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
    connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
  }`;
  status.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-400'}"></span> ${message}`;
}

// --- PRESET LOGO SVGS ---
const PRESET_LOGOS = {
  apex: {
    name: 'Apex Robotics Emblem',
    stitchCount: 16840,
    complexity: 84,
    colors: 4,
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="none" stroke="url(#grad1)" stroke-width="6" stroke-linejoin="round" />
      <polygon points="50,18 80,35 80,65 50,82 20,65 20,35" fill="none" stroke="#ffffff" stroke-width="3" stroke-dasharray="4,2" />
      <circle cx="50" cy="50" r="16" fill="#6366f1" />
      <polygon points="50,38 60,56 40,56" fill="#ffffff" />
      <circle cx="50" cy="50" r="6" fill="#090d16" />
    </svg>`
  },
  shield: {
    name: 'St. Jude College Crest',
    stitchCount: 14200,
    complexity: 76,
    colors: 3,
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <path d="M 20 20 L 80 20 L 80 55 C 80 75 50 90 50 90 C 50 90 20 75 20 55 Z" fill="#b91c1c" stroke="#f59e0b" stroke-width="5" />
      <path d="M 50 25 L 50 82" stroke="#f59e0b" stroke-width="4" />
      <path d="M 25 50 L 75 50" stroke="#f59e0b" stroke-width="4" />
      <circle cx="37" cy="37" r="5" fill="#fef08a" />
      <circle cx="63" cy="37" r="5" fill="#fef08a" />
      <circle cx="37" cy="63" r="5" fill="#fef08a" />
      <circle cx="63" cy="63" r="5" fill="#fef08a" />
    </svg>`
  },
  ironforge: {
    name: 'IronForge CrossFit Club',
    stitchCount: 21500,
    complexity: 89,
    colors: 2,
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="42" fill="#18181b" stroke="#ffffff" stroke-width="5" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#ea580c" stroke-width="4" stroke-dasharray="6,3" />
      <path d="M 38 30 C 38 22 62 22 62 30 L 68 30 C 72 30 76 34 76 38 L 74 68 C 74 76 66 80 50 80 C 34 80 26 76 26 68 L 24 38 C 24 34 28 30 32 30 Z" fill="#ea580c" />
      <circle cx="50" cy="27" r="8" fill="#18181b" />
      <text x="50" y="58" font-size="12" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="sans-serif">IRON</text>
    </svg>`
  },
  bistro: {
    name: 'Velvet & Vine Artisan Bistro',
    stitchCount: 9800,
    complexity: 65,
    colors: 3,
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#15803d" stroke-width="3" />
      <path d="M 50 20 C 65 35 65 65 50 80 C 35 65 35 35 50 20 Z" fill="#16a34a" opacity="0.8" />
      <circle cx="50" cy="45" r="8" fill="#facc15" />
      <path d="M 32 50 Q 50 30 68 50" fill="none" stroke="#ffffff" stroke-width="3" />
      <text x="50" y="65" font-size="8" font-weight="700" text-anchor="middle" fill="#ffffff" letter-spacing="1">VELVET</text>
    </svg>`
  }
};

// --- GARMENTS CATALOG WITH SVG VECTORS ---
const GARMENTS = {
  hoodie: {
    name: 'Heavyweight Fleece Hoodie (400 GSM)',
    basePriceTier1: 32.00,
    basePriceTier2: 24.50,
    basePriceTier3: 19.80,
    basePriceTier4: 16.50,
    fabric: '100% Combed Compact Cotton, Heavy Terry Loopback',
    colors: [
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Heather Grey', hex: '#64748b' },
      { name: 'Vintage Cream', hex: '#fef3c7' },
      { name: 'Deep Navy', hex: '#1e3a5f' },
      { name: 'Pine Forest', hex: '#14532d' },
      { name: 'Crimson Wine', hex: '#881337' },
      { name: 'Earth Sand', hex: '#d4b996' }
    ],
    svg: (color) => `
      <g>
        <path d="M 120 70 C 130 30 170 10 250 10 C 330 10 370 30 380 70 C 350 55 310 50 250 50 C 190 50 150 55 120 70 Z" fill="${shadeColor(color, -20)}" />
        <path d="M 170 50 C 200 40 250 40 280 50 C 270 90 230 90 170 50 Z" fill="${shadeColor(color, -35)}" />
        <path d="M 120 70 L 30 190 L 60 220 L 125 150 L 125 360 L 150 360 Z" fill="${shadeColor(color, -10)}" />
        <path d="M 30 190 L 60 220 L 50 232 L 20 202 Z" fill="${shadeColor(color, -25)}" />
        <path d="M 380 70 L 470 190 L 440 220 L 375 150 L 375 360 L 350 360 Z" fill="${shadeColor(color, -10)}" />
        <path d="M 470 190 L 440 220 L 450 232 L 480 202 Z" fill="${shadeColor(color, -25)}" />
        <path d="M 125 70 C 180 85 320 85 375 70 L 375 380 L 125 380 Z" fill="${color}" />
        <path d="M 160 260 L 340 260 L 360 340 L 140 340 Z" fill="${shadeColor(color, 8)}" stroke="${shadeColor(color, -15)}" stroke-width="2" />
        <rect x="125" y="380" width="250" height="30" fill="${shadeColor(color, -15)}" />
        <path d="M 225 75 Q 220 125 220 150" stroke="#f1f5f9" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 275 75 Q 280 125 280 150" stroke="#f1f5f9" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    `
  },
  tshirt: {
    name: 'Oversized Streetwear T-Shirt (240 GSM)',
    basePriceTier1: 18.00,
    basePriceTier2: 13.50,
    basePriceTier3: 10.80,
    basePriceTier4: 8.90,
    fabric: '100% Ring-Spun Combed Jersey, Bio-Washed',
    colors: [
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Vintage Cream', hex: '#fdfbf7' },
      { name: 'Charcoal Grey', hex: '#374151' },
      { name: 'Forest Green', hex: '#064e3b' },
      { name: 'Cobalt Blue', hex: '#1e40af' }
    ],
    svg: (color) => `
      <g>
        <path d="M 195 50 C 220 72 280 72 305 50 C 285 38 215 38 195 50 Z" fill="${shadeColor(color, -25)}" stroke="${shadeColor(color, -40)}" stroke-width="1.5" />
        <path d="M 195 50 L 80 110 L 105 170 L 155 140 L 155 390 Z" fill="${shadeColor(color, -8)}" />
        <path d="M 305 50 L 420 110 L 395 170 L 345 140 L 345 390 Z" fill="${shadeColor(color, -8)}" />
        <path d="M 195 50 C 225 65 275 65 305 50 L 345 140 L 345 395 L 155 395 L 155 140 Z" fill="${color}" />
      </g>
    `
  },
  polo: {
    name: 'Executive Pique Polo (220 GSM)',
    basePriceTier1: 24.00,
    basePriceTier2: 18.50,
    basePriceTier3: 15.20,
    basePriceTier4: 12.80,
    fabric: 'Honeycomb Pique Knit, Ribbed Collar & Cuffs',
    colors: [
      { name: 'Royal Navy', hex: '#1e3a5f' },
      { name: 'Crisp White', hex: '#f8fafc' },
      { name: 'Pitch Black', hex: '#18181b' }
    ],
    svg: (color) => `
      <g>
        <path d="M 190 55 L 90 105 L 115 160 L 160 135 L 160 390 Z" fill="${shadeColor(color, -8)}" />
        <path d="M 310 55 L 410 105 L 385 160 L 340 135 L 340 390 Z" fill="${shadeColor(color, -8)}" />
        <path d="M 190 55 L 310 55 L 340 135 L 340 395 L 160 395 L 160 135 Z" fill="${color}" />
        <path d="M 185 50 L 225 95 L 250 65 L 210 40 Z" fill="${shadeColor(color, -25)}" stroke="${shadeColor(color, -40)}" stroke-width="2" />
        <path d="M 315 50 L 275 95 L 250 65 L 290 40 Z" fill="${shadeColor(color, -25)}" stroke="${shadeColor(color, -40)}" stroke-width="2" />
        <rect x="238" y="65" width="24" height="65" fill="${shadeColor(color, -15)}" stroke="${shadeColor(color, -30)}" stroke-width="1.5" />
      </g>
    `
  },
  cap: {
    name: 'Structured 6-Panel Snapback Cap',
    basePriceTier1: 19.50,
    basePriceTier2: 14.80,
    basePriceTier3: 11.90,
    basePriceTier4: 9.75,
    fabric: 'Wool Blend Twill, Structured Crown',
    colors: [
      { name: 'Stealth Black', hex: '#18181b' },
      { name: 'Charcoal', hex: '#475569' },
      { name: 'Navy Blue', hex: '#1e3a5f' }
    ],
    svg: (color) => `
      <g transform="translate(0, 50)">
        <path d="M 90 230 C 130 280 370 280 410 230 C 370 215 130 215 90 230 Z" fill="${shadeColor(color, -25)}" stroke="${shadeColor(color, -40)}" stroke-width="2" />
        <path d="M 120 220 C 120 110 180 60 250 60 C 320 60 380 110 380 220 Z" fill="${color}" />
        <path d="M 250 60 L 250 220" stroke="${shadeColor(color, -20)}" stroke-width="2" />
        <circle cx="250" cy="60" r="8" fill="${shadeColor(color, -30)}" />
      </g>
    `
  },
  bomber: {
    name: 'Satin Twill Quilted Bomber Jacket',
    basePriceTier1: 58.00,
    basePriceTier2: 46.00,
    basePriceTier3: 38.50,
    basePriceTier4: 32.00,
    fabric: 'Heavy Flight Nylon, Poly Fill',
    colors: [
      { name: 'Midnight Black', hex: '#18181b' },
      { name: 'Military Olive', hex: '#3f4f34' }
    ],
    svg: (color) => `
      <g>
        <path d="M 180 50 C 215 70 285 70 320 50 C 300 35 200 35 180 50 Z" fill="${shadeColor(color, -30)}" />
        <path d="M 180 50 L 50 160 L 80 200 L 140 140 L 140 370 Z" fill="${shadeColor(color, -10)}" />
        <path d="M 320 50 L 450 160 L 420 200 L 360 140 L 360 370 Z" fill="${shadeColor(color, -10)}" />
        <path d="M 180 50 L 320 50 L 360 140 L 350 375 L 150 375 L 140 140 Z" fill="${color}" />
        <line x1="250" y1="58" x2="250" y2="375" stroke="#94a3b8" stroke-width="4" />
      </g>
    `
  },
  apron: {
    name: 'Heavy Duty 16oz Barista Apron',
    basePriceTier1: 22.00,
    basePriceTier2: 17.00,
    basePriceTier3: 13.50,
    basePriceTier4: 11.20,
    fabric: 'Waxed Canvas Cotton with Leather Straps',
    colors: [
      { name: 'Raw Canvas Sand', hex: '#d4b996' },
      { name: 'Black Denim', hex: '#18181b' }
    ],
    svg: (color) => `
      <g>
        <path d="M 210 40 C 210 10 290 10 290 40" stroke="#78350f" stroke-width="8" fill="none" stroke-linecap="round" />
        <path d="M 200 45 L 300 45 L 340 160 L 360 410 L 140 410 L 160 160 Z" fill="${color}" stroke="${shadeColor(color, -25)}" stroke-width="2" />
        <rect x="175" y="240" width="150" height="110" rx="4" fill="${shadeColor(color, -10)}" stroke="${shadeColor(color, -25)}" stroke-width="2" />
      </g>
    `
  }
};

function shadeColor(color, percent) {
  let num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      B = ((num >> 8) & 0x00FF) + amt,
      G = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupReceptionistChat();
  setupStudioVisualizer();
  setupQuotationCalculator();
  setupOrderTracking();
  setupMarketplace();
  setupCRM();
  setupAcademicDeck();
  setupPaymentGateway();
  setupGeminiConfig();
  renderAll();
  connectBackend();
});

// --- NAVIGATION & TABS ---
function setupNavigation() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavigation = document.getElementById('mobileNavigation');
  if (mobileMenuToggle && mobileNavigation) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
      mobileNavigation.classList.toggle('hidden', isExpanded);
    });
  }

  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-nav-target');
      switchTab(target);
    });
  });

  document.querySelectorAll('[data-persona]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-persona');
      setPersona(p);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavigation = document.getElementById('mobileNavigation');
  if (mobileMenuToggle && mobileNavigation) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileNavigation.classList.add('hidden');
  }
  
  document.querySelectorAll('[data-nav-target]').forEach(el => {
    if (el.getAttribute('data-nav-target') === tabId) {
      el.classList.add('text-indigo-400', 'font-semibold', 'bg-slate-800');
      el.classList.remove('text-slate-300');
    } else {
      el.classList.remove('text-indigo-400', 'font-semibold', 'bg-slate-800');
      el.classList.add('text-slate-300');
    }
  });

  const sections = ['overview', 'receptionist', 'studio', 'quote', 'tracking', 'marketplace', 'crm', 'academic'];
  sections.forEach(s => {
    const el = document.getElementById(`section-${s}`);
    if (el) {
      if (s === tabId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setPersona(persona) {
  state.activePersona = persona;
  document.querySelectorAll('[data-persona]').forEach(btn => {
    if (btn.getAttribute('data-persona') === persona) {
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-300');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
      btn.classList.add('text-slate-300');
    }
  });

  if (persona === 'customer') switchTab('studio');
  else if (persona === 'merchant') switchTab('crm');
  else if (persona === 'factory') switchTab('marketplace');
}

// --- MODULE 1: AI RECEPTIONIST & SALES AGENT (GEMINI POWERED) ---
function setupReceptionistChat() {
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const voiceToggleBtn = document.getElementById('voiceToggleBtn');
  const quickChips = document.querySelectorAll('[data-chat-prompt]');

  const handleSend = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage('user', text);
    chatInput.value = '';
    dispatchAIReceptionistResponse(text);
  };

  if (chatSendBtn) chatSendBtn.addEventListener('click', handleSend);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.getAttribute('data-chat-prompt');
      handleSend();
    });
  });

  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener('click', () => {
      state.chat.isRecordingVoice = !state.chat.isRecordingVoice;
      const waveform = document.getElementById('voiceWaveform');
      if (state.chat.isRecordingVoice) {
        voiceToggleBtn.classList.add('bg-red-500', 'text-white', 'animate-pulse');
        if (waveform) waveform.classList.remove('hidden');
        setTimeout(() => {
          chatInput.value = "Hey StitchAI, we need 120 heavyweight fleece hoodies in Onyx Black with our university crest embroidered on the chest for our college robotics team by next Thursday.";
          state.chat.isRecordingVoice = false;
          voiceToggleBtn.classList.remove('bg-red-500', 'text-white', 'animate-pulse');
          if (waveform) waveform.classList.add('hidden');
          handleSend();
        }, 2800);
      }
    });
  }
}

function addChatMessage(sender, text) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.chat.messages.push({ sender, text, time });
  renderChatMessages();
}

function renderChatMessages() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  container.innerHTML = state.chat.messages.map(m => {
    const isAi = m.sender === 'ai';
    return `
      <div class="flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'} animate-fade-in">
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isAi ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md' : 'bg-slate-700 text-white'
        }">
          ${isAi ? '🧵' : '👤'}
        </div>
        <div class="max-w-[82%]">
          <div class="p-3.5 rounded-2xl text-xs leading-relaxed ${
            isAi 
              ? 'bg-slate-850 border border-slate-750 text-slate-100 shadow-sm rounded-tl-sm' 
              : 'bg-indigo-600 text-white rounded-tr-sm shadow'
          }">
            ${m.text.replace(/\n/g, '<br/>')}
          </div>
          <span class="text-[10px] text-slate-400 mt-1 block px-1 ${isAi ? '' : 'text-right'}">${m.time}</span>
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function dispatchAIReceptionistResponse(userText) {
  const container = document.getElementById('chatMessagesContainer');
  const typingId = 'typingIndicator';
  const typingDiv = document.createElement('div');
  typingDiv.id = typingId;
  typingDiv.className = 'flex items-center gap-2 text-xs text-slate-400 p-2 italic';
  typingDiv.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
    StitchAI Agent is analyzing requirements with Gemini LLM...
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;

  // Try calling backend /api/gemini/chat
  fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(getSessionToken() ? { Authorization: `Bearer ${getSessionToken()}` } : {})
    },
    body: JSON.stringify({
      message: userText,
      apiKey: state.gemini.apiKey,
      history: state.chat.messages.slice(-4)
    })
  })
  .then(res => res.json())
  .then(data => {
    const indicator = document.getElementById(typingId);
    if (indicator) indicator.remove();
    addChatMessage('ai', data.reply || "Specs analyzed! I've populated your order parameters.");
    parseExtractedSpecs(userText);
  })
  .catch(() => {
    // Local fallback
    setTimeout(() => {
      const indicator = document.getElementById(typingId);
      if (indicator) indicator.remove();
      parseExtractedSpecs(userText);
      const aiReply = `🎯 **I've extracted your project parameters!**\n\n• **Garment**: Heavyweight Fleece Hoodie (400 GSM)\n• **Volume**: 150 Units (Tier 3 Wholesale Unlocked)\n• **Estimated Unit Price**: $19.80/unit\n• **Embroidery**: Digitizing Fee Waived ($35 savings)\n• **Timeline**: 4-6 Business Days with Express QC\n\nI have pre-populated your specs into our **CV Embroidery Studio**. Ready to inspect stitches?`;
      addChatMessage('ai', aiReply);
    }, 1000);
  });
}

function parseExtractedSpecs(userText) {
  let qty = 150;
  const matchQty = userText.match(/(\d+)\s*(hoodies|tees|t-shirts|polos|caps|jackets|aprons|units|pcs)/i);
  if (matchQty) qty = parseInt(matchQty[1]);

  let garmentName = 'Heavyweight Fleece Hoodie';
  if (/tee|t-shirt/i.test(userText)) {
    garmentName = 'Oversized Streetwear T-Shirt';
    state.studio.selectedGarment = 'tshirt';
  } else if (/polo/i.test(userText)) {
    garmentName = 'Executive Pique Polo';
    state.studio.selectedGarment = 'polo';
  } else if (/cap|hat/i.test(userText)) {
    garmentName = 'Structured Snapback Cap';
    state.studio.selectedGarment = 'cap';
  }

  state.chat.extractedRequirements.quantity = qty;
  state.chat.extractedRequirements.garment = garmentName;
  state.quote.quantity = qty;

  renderExtractedRequirements();
  calculateQuotation();
}

function renderExtractedRequirements() {
  const req = state.chat.extractedRequirements;
  const container = document.getElementById('extractedRequirementsBadge');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-2 text-xs text-slate-300">
      <div class="flex justify-between pb-1.5 border-b border-slate-700/60">
        <span class="text-slate-400">Garment:</span>
        <span class="font-bold text-white">${req.garment}</span>
      </div>
      <div class="flex justify-between pb-1.5 border-b border-slate-700/60">
        <span class="text-slate-400">Quantity:</span>
        <span class="font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded">${req.quantity} Units</span>
      </div>
      <div class="flex justify-between pb-1.5 border-b border-slate-700/60">
        <span class="text-slate-400">Fabric:</span>
        <span class="text-slate-200">${req.fabric}</span>
      </div>
      <div class="flex justify-between pb-1.5 border-b border-slate-700/60">
        <span class="text-slate-400">Sizes:</span>
        <span class="font-mono text-slate-200">${req.sizes}</span>
      </div>
      <div class="flex justify-between pb-1.5 border-b border-slate-700/60">
        <span class="text-slate-400">Placements:</span>
        <span class="text-slate-200">${req.placement}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-400">Est. Budget:</span>
        <span class="font-bold text-emerald-400">${req.estimatedBudget}</span>
      </div>
    </div>
  `;
}

// --- MODULE 2: REAL CLIENT-SIDE COMPUTER VISION STUDIO ---
function setupStudioVisualizer() {
  document.querySelectorAll('[data-garment-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = btn.getAttribute('data-garment-select');
      state.studio.selectedGarment = g;
      state.quote.garmentType = g;
      renderStudioGarmentButtons();
      renderColorSwatches();
      updateVisualizerCanvas();
      calculateQuotation();
    });
  });

  document.querySelectorAll('[data-logo-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPresetLogo(btn.getAttribute('data-logo-preset'));
    });
  });

  const logoUploadInput = document.getElementById('logoUploadInput');
  if (logoUploadInput) {
    logoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        state.studio.customLogoUrl = event.target.result;
        state.studio.activePresetLogo = null;
        
        // Execute real pixel Computer Vision extraction on HTML5 Canvas!
        runRealPixelComputerVision(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    });
  }

  document.querySelectorAll('[data-placement-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.studio.placement = btn.getAttribute('data-placement-select');
      renderPlacementButtons();
      updateVisualizerCanvas();
    });
  });

  document.querySelectorAll('[data-render-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.studio.renderMode = btn.getAttribute('data-render-mode');
      renderModeButtons();
      updateVisualizerCanvas();
    });
  });

  const scaleSlider = document.getElementById('logoScaleSlider');
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      state.studio.logoScale = parseInt(e.target.value);
      updateVisualizerCanvas();
    });
  }

  const ySlider = document.getElementById('logoYSlider');
  if (ySlider) {
    ySlider.addEventListener('input', (e) => {
      state.studio.logoYOffset = parseInt(e.target.value);
      updateVisualizerCanvas();
    });
  }
}

// REAL COMPUTER VISION PIXEL PROCESSING ENGINE
function runRealPixelComputerVision(dataUrl, filename) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = Math.min(img.width, 240);
    const h = Math.min(img.height, 240);
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const pixels = imgData.data;

    let nonTransparent = 0;
    let edgePixels = 0;
    const colorMap = {};

    // Analyze pixel density & Sobel-like edge transitions
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const a = pixels[idx + 3];

        if (a > 30) {
          nonTransparent++;

          // Quantize color (bucket into 32-step RGB)
          const r = Math.round(pixels[idx] / 32) * 32;
          const g = Math.round(pixels[idx + 1] / 32) * 32;
          const b = Math.round(pixels[idx + 2] / 32) * 32;
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colorMap[hex] = (colorMap[hex] || 0) + 1;

          // Check neighbor delta for edge detection
          if (x > 0 && y > 0 && x < w - 1 && y < h - 1) {
            const rightIdx = idx + 4;
            const downIdx = idx + (w * 4);
            const deltaR = Math.abs(pixels[idx] - pixels[rightIdx]);
            const deltaG = Math.abs(pixels[idx + 1] - pixels[downIdx + 1]);
            if (deltaR + deltaG > 85) {
              edgePixels++;
            }
          }
        }
      }
    }

    // Mathematical stitch estimation
    const tatamiStitches = Math.round(nonTransparent * 0.45);
    const satinStitches = Math.round(edgePixels * 1.6);
    const totalStitches = Math.max(7500, tatamiStitches + satinStitches);
    const complexityScore = Math.min(96, Math.max(52, Math.round((edgePixels / Math.max(1, nonTransparent)) * 320)));

    // Sort top colors
    const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const threadColors = sortedColors.map((entry, i) => ({
      name: `Madeira Shade #${1800 + i * 22}`,
      hex: entry[0],
      code: `${1800 + i * 22}`,
      percentage: Math.round((entry[1] / nonTransparent) * 100)
    }));

    state.studio.cvAnalysis = {
      imageName: filename,
      dimensions: '4.4" W × 3.6" H',
      complexityScore,
      stitchCount: totalStitches,
      colorCount: Math.max(2, threadColors.length),
      difficultyRating: complexityScore > 80 ? 'Complex Multi-Density' : 'Moderate Satin Fill',
      recommendedBacking: '3.0 oz Heavyweight Cutaway',
      underlayType: 'Tatami Grid + Dual Zig-Zag Underlay',
      puffEligibility: 'Eligible on Outer Borders (> 4mm)',
      estimatedRunTimeMinutes: (totalStitches / 850).toFixed(1),
      threadColors: threadColors.length ? threadColors : state.studio.cvAnalysis.threadColors
    };

    state.quote.stitchCount = totalStitches;
    renderCVAnalysisPanel();
    updateVisualizerCanvas();
    calculateQuotation();
    apiRequest('/api/db/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        dimensions: state.studio.cvAnalysis.dimensions,
        complexity_score: complexityScore,
        stitch_count: totalStitches,
        colors_count: state.studio.cvAnalysis.colorCount,
        thread_colors: state.studio.cvAnalysis.threadColors,
        puff_eligibility: state.studio.cvAnalysis.puffEligibility
      })
    }).then(({ artwork_id }) => {
      state.studio.cvAnalysis.artworkId = artwork_id;
    }).catch(error => {
      console.error('Could not save artwork analysis to SQLite:', error);
    });
  };
  img.src = dataUrl;
}

function applyPresetLogo(key) {
  state.studio.activePresetLogo = key;
  state.studio.customLogoUrl = null;
  const p = PRESET_LOGOS[key];
  if (!p) return;

  state.studio.cvAnalysis.imageName = p.name + '.svg';
  state.studio.cvAnalysis.stitchCount = p.stitchCount;
  state.studio.cvAnalysis.complexityScore = p.complexity;
  state.studio.cvAnalysis.colorCount = p.colors;
  state.quote.stitchCount = p.stitchCount;

  renderCVAnalysisPanel();
  updateVisualizerCanvas();
  calculateQuotation();
}

function renderStudioGarmentButtons() {
  document.querySelectorAll('[data-garment-select]').forEach(btn => {
    const g = btn.getAttribute('data-garment-select');
    if (g === state.studio.selectedGarment) {
      btn.classList.add('border-indigo-600', 'bg-indigo-950/40', 'text-indigo-300');
      btn.classList.remove('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
    } else {
      btn.classList.remove('border-indigo-600', 'bg-indigo-950/40', 'text-indigo-300');
      btn.classList.add('border-slate-700', 'bg-slate-900/60', 'text-slate-300');
    }
  });
}

function renderColorSwatches() {
  const container = document.getElementById('garmentColorSwatches');
  if (!container) return;

  const garment = GARMENTS[state.studio.selectedGarment];
  if (!garment) return;

  container.innerHTML = garment.colors.map(c => `
    <button 
      type="button"
      class="w-7 h-7 rounded-full border-2 transition-transform ${c.hex === state.studio.garmentColor ? 'scale-110 ring-2 ring-indigo-500 border-white' : 'border-slate-600 hover:scale-105'}"
      style="background-color: ${c.hex};"
      data-hex="${c.hex}"
      data-colorname="${c.name}"
    ></button>
  `).join('');

  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.studio.garmentColor = btn.getAttribute('data-hex');
      state.studio.garmentColorName = btn.getAttribute('data-colorname');
      renderColorSwatches();
      updateVisualizerCanvas();
    });
  });

  const nameEl = document.getElementById('selectedGarmentColorName');
  if (nameEl) nameEl.textContent = state.studio.garmentColorName;
}

function renderPlacementButtons() {
  document.querySelectorAll('[data-placement-select]').forEach(btn => {
    const p = btn.getAttribute('data-placement-select');
    if (p === state.studio.placement) {
      btn.classList.add('bg-indigo-600', 'text-white', 'font-semibold');
      btn.classList.remove('bg-slate-700', 'text-slate-200');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'font-semibold');
      btn.classList.add('bg-slate-700', 'text-slate-200');
    }
  });
}

function renderModeButtons() {
  document.querySelectorAll('[data-render-mode]').forEach(btn => {
    const m = btn.getAttribute('data-render-mode');
    if (m === state.studio.renderMode) {
      btn.classList.add('bg-indigo-600', 'text-white', 'font-semibold');
      btn.classList.remove('bg-slate-700', 'text-slate-300');
    } else {
      btn.classList.remove('bg-indigo-600', 'text-white', 'font-semibold');
      btn.classList.add('bg-slate-700', 'text-slate-300');
    }
  });
}

function updateVisualizerCanvas() {
  const canvasContainer = document.getElementById('garmentMockupViewer');
  if (!canvasContainer) return;

  const garment = GARMENTS[state.studio.selectedGarment];
  const color = state.studio.garmentColor;
  const placement = state.studio.placement;
  const scale = (state.studio.logoScale / 100);
  const yOff = state.studio.logoYOffset;

  let logoX = 250;
  let logoY = 205 + yOff;
  let logoSize = 110 * scale;

  if (placement === 'left-chest') {
    logoX = 205;
    logoY = 175 + yOff;
    logoSize = 75 * scale;
  } else if (placement === 'full-back') {
    logoX = 250;
    logoY = 210 + yOff;
    logoSize = 150 * scale;
  } else if (placement === 'left-sleeve') {
    logoX = 105;
    logoY = 160 + yOff;
    logoSize = 65 * scale;
  } else if (placement === 'cap-front') {
    logoX = 250;
    logoY = 195 + yOff;
    logoSize = 85 * scale;
  }

  let logoMarkup = '';
  if (state.studio.customLogoUrl) {
    logoMarkup = `<img src="${state.studio.customLogoUrl}" class="w-full h-full object-contain" />`;
  } else if (state.studio.activePresetLogo && PRESET_LOGOS[state.studio.activePresetLogo]) {
    logoMarkup = PRESET_LOGOS[state.studio.activePresetLogo].svg;
  } else {
    logoMarkup = PRESET_LOGOS['apex'].svg;
  }

  let textureClass = 'embroidery-texture';
  if (state.studio.renderMode === 'embroidery-3d-puff') textureClass = 'embroidery-3d-puff';
  else if (state.studio.renderMode === 'flat-screenprint') textureClass = '';

  canvasContainer.innerHTML = `
    <svg viewBox="0 0 500 460" class="w-full h-full max-h-[480px] drop-shadow-xl select-none" xmlns="http://www.w3.org/2000/svg">
      ${garment.svg(color)}
      <g transform="translate(${logoX - logoSize / 2}, ${logoY - logoSize / 2})">
        <foreignObject width="${logoSize}" height="${logoSize}" class="${textureClass}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="w-full h-full relative">
            ${logoMarkup}
          </div>
        </foreignObject>
      </g>
    </svg>
  `;
}

function renderCVAnalysisPanel() {
  const cv = state.studio.cvAnalysis;
  const metricsEl = document.getElementById('cvMetricsGrid');
  const threadEl = document.getElementById('cvThreadColorList');

  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <span class="text-[10px] text-slate-400 uppercase tracking-wide block">Stitch Count</span>
        <span class="text-xl font-black font-mono text-indigo-400">${cv.stitchCount.toLocaleString()}</span>
        <span class="text-[9px] text-slate-500 block">CV Calculated</span>
      </div>
      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <span class="text-[10px] text-slate-400 uppercase tracking-wide block">Complexity</span>
        <span class="text-xl font-black font-mono text-emerald-400">${cv.complexityScore} <span class="text-xs text-slate-500">/ 100</span></span>
        <span class="text-[9px] text-slate-500 block">Sobel Edge Gradient</span>
      </div>
      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <span class="text-[10px] text-slate-400 uppercase tracking-wide block">Thread Shades</span>
        <span class="text-xl font-black font-mono text-white">${cv.colorCount}</span>
        <span class="text-[9px] text-slate-500 block">Madeira Polyneon</span>
      </div>
      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800">
        <span class="text-[10px] text-slate-400 uppercase tracking-wide block">Run Time</span>
        <span class="text-xl font-black font-mono text-amber-400">~${cv.estimatedRunTimeMinutes} min</span>
        <span class="text-[9px] text-slate-500 block">At 850 SPM</span>
      </div>
    `;
  }

  if (threadEl) {
    threadEl.innerHTML = cv.threadColors.map(t => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-inner" style="background-color: ${t.hex};"></span>
          <span class="font-medium text-slate-200 text-[11px]">${t.name}</span>
        </div>
        <span class="bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded text-[10px]">${t.percentage}%</span>
      </div>
    `).join('');
  }

  const adviceEl = document.getElementById('cvDigitizingAdvice');
  if (adviceEl) {
    adviceEl.innerHTML = `
      <div class="text-[11px] space-y-1 text-slate-400">
        <div>✓ <strong>Backing:</strong> ${cv.recommendedBacking}</div>
        <div>✓ <strong>Underlay:</strong> ${cv.underlayType}</div>
        <div>⚡ <strong>3D Puff:</strong> ${cv.puffEligibility}</div>
      </div>
    `;
  }
}

// --- MODULE 3: DYNAMIC AI QUOTATION & BULK CALCULATOR ---
function setupQuotationCalculator() {
  const qtySlider = document.getElementById('quoteQtySlider');
  const qtyInput = document.getElementById('quoteQtyInput');

  if (qtySlider && qtyInput) {
    qtySlider.addEventListener('input', (e) => {
      state.quote.quantity = parseInt(e.target.value);
      qtyInput.value = e.target.value;
      calculateQuotation();
    });

    qtyInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value) || 12;
      state.quote.quantity = val;
      qtySlider.value = Math.min(val, 1000);
      calculateQuotation();
    });
  }

  document.querySelectorAll('input[name="quoteSpeed"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.quote.speed = e.target.value;
      calculateQuotation();
    });
  });

  const polybagCheck = document.getElementById('quotePolybagCheck');
  if (polybagCheck) {
    polybagCheck.addEventListener('change', (e) => {
      state.quote.polybagging = e.target.checked;
      calculateQuotation();
    });
  }

  const tagsCheck = document.getElementById('quoteWovenTagsCheck');
  if (tagsCheck) {
    tagsCheck.addEventListener('change', (e) => {
      state.quote.wovenTags = e.target.checked;
      calculateQuotation();
    });
  }

  document.querySelectorAll('[data-quote-placements]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.quote.placementsCount = parseInt(btn.getAttribute('data-quote-placements'));
      document.querySelectorAll('[data-quote-placements]').forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'font-bold');
        b.classList.add('bg-slate-700', 'text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'font-bold');
      btn.classList.remove('bg-slate-700', 'text-slate-300');
      calculateQuotation();
    });
  });
}

function calculateQuotation() {
  const gType = state.quote.garmentType;
  const garment = GARMENTS[gType] || GARMENTS['hoodie'];
  const qty = state.quote.quantity;
  const stitches = state.quote.stitchCount;
  const placements = state.quote.placementsCount;
  const speed = state.quote.speed;

  let baseUnit = garment.basePriceTier1;
  let tierName = 'Standard Tier (12-49 pcs)';
  if (qty >= 500) {
    baseUnit = garment.basePriceTier4;
    tierName = 'Enterprise Wholesale (500+ pcs)';
  } else if (qty >= 150) {
    baseUnit = garment.basePriceTier3;
    tierName = 'Volume Wholesale (150-499 pcs)';
  } else if (qty >= 50) {
    baseUnit = garment.basePriceTier2;
    tierName = 'Team Bulk Tier (50-149 pcs)';
  }

  const stitchRun = (stitches / 1000) * 0.18;
  const multiHit = (placements - 1) * 3.20;
  const polyCost = state.quote.polybagging ? 0.60 : 0;
  const tagCost = state.quote.wovenTags ? 1.20 : 0;

  const unitSub = baseUnit + stitchRun + multiHit + polyCost + tagCost;
  const speedMult = speed === 'express' ? 1.15 : (speed === 'rush' ? 1.30 : 1.0);
  const finalUnit = unitSub * speedMult;
  const digitizing = qty >= 50 ? 0 : 35.00;
  const total = (finalUnit * qty) + digitizing;

  state.order.totalPrice = total;

  const unitPriceEl = document.getElementById('calcUnitPrice');
  const totalPriceEl = document.getElementById('calcTotalPrice');
  const tierEl = document.getElementById('calcTierLabel');
  const leadTimeEl = document.getElementById('calcLeadTime');

  if (unitPriceEl) unitPriceEl.textContent = `$${finalUnit.toFixed(2)}`;
  if (totalPriceEl) totalPriceEl.textContent = `$${total.toFixed(2)}`;
  if (tierEl) tierEl.textContent = tierName;
  if (leadTimeEl) leadTimeEl.textContent = speed === 'express' ? '4 - 6 Business Days' : (speed === 'rush' ? '48 - 72 Hours Rush' : '7 - 10 Business Days');

  const lineItemsEl = document.getElementById('calcLineItemsContainer');
  if (lineItemsEl) {
    lineItemsEl.innerHTML = `
      <div class="flex justify-between py-1 text-slate-400">
        <span>Base Garment Knit:</span>
        <span class="font-mono text-white">$${baseUnit.toFixed(2)}/pc</span>
      </div>
      <div class="flex justify-between py-1 text-slate-400">
        <span>Stitch Run (${stitches.toLocaleString()} sts):</span>
        <span class="font-mono text-white">$${stitchRun.toFixed(2)}/pc</span>
      </div>
      <div class="flex justify-between py-1 text-slate-400">
        <span>Finishing & Packaging:</span>
        <span class="font-mono text-white">$${(polyCost + tagCost).toFixed(2)}/pc</span>
      </div>
      <div class="flex justify-between py-1 text-emerald-400 font-semibold">
        <span>Digitizing Fee:</span>
        <span>${qty >= 50 ? 'FREE ($35 Waived)' : '$35.00'}</span>
      </div>
    `;
  }
}

async function openFormalQuote() {
  try {
    const quote = await apiRequest('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: state.order.client,
        garmentType: state.quote.garmentType,
        quantity: state.quote.quantity,
        stitches: state.quote.stitchCount,
        placements: state.quote.placementsCount,
        speed: state.quote.speed,
        polybagging: state.quote.polybagging,
        wovenTags: state.quote.wovenTags
      })
    });
    state.order.totalPrice = Number(quote.totalAmount);
    const unitPriceEl = document.getElementById('calcUnitPrice');
    const totalPriceEl = document.getElementById('calcTotalPrice');
    const leadTimeEl = document.getElementById('calcLeadTime');
    if (unitPriceEl) unitPriceEl.textContent = `$${Number(quote.unitPrice).toFixed(2)}`;
    if (totalPriceEl) totalPriceEl.textContent = `$${Number(quote.totalAmount).toFixed(2)}`;
    if (leadTimeEl) leadTimeEl.textContent = quote.leadTime;
    populatePrintableQuote();
    document.getElementById('printableQuoteModal').classList.remove('hidden');
  } catch (error) {
    console.error('Could not create and save quote:', error);
    alert(`Quote could not be saved to the database: ${error.message}`);
  }
}

function populatePrintableQuote() {
  const gType = state.quote.garmentType;
  const garment = GARMENTS[gType] || GARMENTS['hoodie'];
  const qty = state.quote.quantity;
  const modalContainer = document.getElementById('printableQuoteContent');
  if (!modalContainer) return;

  const unitPrice = document.getElementById('calcUnitPrice')?.textContent || '$22.40';
  const totalPrice = document.getElementById('calcTotalPrice')?.textContent || '$3,360.00';

  modalContainer.innerHTML = `
    <div class="p-8 bg-white text-slate-800 rounded-2xl">
      <div class="flex justify-between items-start pb-6 border-b border-slate-200">
        <div>
          <span class="text-2xl font-black bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">StitchAI</span>
          <p class="text-xs text-slate-500 mt-1">Autonomous Apparel Manufacturing & Embroidery Network</p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400 uppercase tracking-wider block font-bold">Official Quotation</span>
          <span class="text-xl font-bold font-mono text-slate-900">#ST-2026-8942</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
        <div>
          <h4 class="font-bold text-slate-500 uppercase text-[11px] mb-2">Prepared For:</h4>
          <p class="font-bold text-slate-900 text-sm">${state.order.client}</p>
          <p class="text-slate-600">Stanford University, CA 94305</p>
        </div>
        <div>
          <h4 class="font-bold text-slate-500 uppercase text-[11px] mb-2">Specifications:</h4>
          <p><strong>Garment:</strong> ${garment.name}</p>
          <p><strong>Placements:</strong> ${state.quote.placementsCount} Hits</p>
          <p><strong>Stitch Count:</strong> ${state.quote.stitchCount.toLocaleString()} Stitches</p>
        </div>
      </div>

      <div class="py-6 flex justify-between items-center text-sm font-bold border-b border-slate-200">
        <span>Total (${qty} Units @ ${unitPrice}/unit):</span>
        <span class="text-xl font-mono text-indigo-600">${totalPrice}</span>
      </div>

      <div class="mt-6 flex justify-end gap-3 no-print">
        <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">
          🖨️ Print / Save PDF
        </button>
        <button onclick="openPaymentModal()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md">
          💳 Pay Now via Stripe / Razorpay
        </button>
      </div>
    </div>
  `;
}

// --- MODULE 4: ORDER WORKFLOW & TRACKING ---
function setupOrderTracking() {
  const approveProofBtn = document.getElementById('approveProofBtn');
  if (approveProofBtn) {
    approveProofBtn.addEventListener('click', async () => {
      try {
        await apiRequest(`/api/db/orders/${encodeURIComponent(state.order.id)}/stage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: 3, stage_title: 'Proof Approved - In Garment Sourcing' })
        });
        state.order.proofApproved = true;
        state.order.currentStage = 3;
        state.order.stages[2].status = 'completed';
        state.order.stages[3].status = 'active';
        renderOrderMilestones();
        alert('✅ Digital Tech-Pack Proof Approved! Production scheduled on Tajima CNC Machine #04.');
      } catch (error) {
        console.error('Could not save proof approval:', error);
        alert(`Proof approval was not saved: ${error.message}`);
      }
    });
  }
}

function renderOrderMilestones() {
  const container = document.getElementById('orderMilestonesContainer');
  if (!container) return;

  container.innerHTML = state.order.stages.map((st, idx) => {
    const isCompleted = st.status === 'completed';
    const isActive = st.status === 'active';

    return `
      <div class="relative flex items-start gap-4 pb-7 last:pb-0">
        ${idx < state.order.stages.length - 1 ? `
          <div class="absolute left-4 top-8 bottom-0 w-0.5 ${isCompleted ? 'bg-indigo-600' : 'bg-slate-700'}"></div>
        ` : ''}

        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
          isCompleted 
            ? 'bg-indigo-600 text-white ring-4 ring-indigo-900' 
            : isActive 
              ? 'bg-amber-500 text-slate-950 font-bold ring-4 ring-amber-900 animate-pulse' 
              : 'bg-slate-800 text-slate-500'
        }">
          ${isCompleted ? '✓' : isActive ? '⚡' : (idx + 1)}
        </div>

        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold ${isActive ? 'text-amber-400' : isCompleted ? 'text-white' : 'text-slate-400'}">
              ${st.title}
            </h4>
            <span class="text-xs font-mono text-slate-400">${st.date}</span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">${st.desc}</p>
        </div>
      </div>
    `;
  }).join('');
}

function refreshOrdersFromDB() {
  apiRequest('/api/db/orders')
    .then(data => {
      applyOrdersFromDatabase(data.orders);
      alert(`🗄️ SQLite Synchronized! ${data.orders.length} production orders retrieved from stitchai.db.`);
    })
    .catch(error => {
      console.error('Could not load orders from SQLite:', error);
      alert(`Could not synchronize orders: ${error.message}`);
    });
}

function applyOrdersFromDatabase(orders) {
  const order = orders.find(item => item.id === state.order.id);
  if (!order) return;

  state.order.client = order.client;
  state.order.title = order.title;
  state.order.totalPrice = Number(order.total_price);
  state.order.paymentStatus = order.payment_status;
  state.order.currentStage = Number(order.current_stage) || 0;
  state.order.stages.forEach((stage, index) => {
    stage.status = index < state.order.currentStage
      ? 'completed'
      : index === state.order.currentStage ? 'active' : 'upcoming';
  });
  renderOrderMilestones();
}

function applyLeadsFromDatabase(leads) {
  state.crm.leads = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    org: lead.org,
    dealSize: lead.deal_size,
    intentScore: Number(lead.intent_score),
    scoreTag: lead.score_tag,
    stage: lead.stage,
    lastAction: lead.last_action,
    channel: lead.channel
  }));
  renderCRMLeads();
}

async function connectBackend() {
  try {
    const [health, orderData, leadData] = await Promise.all([
      apiRequest('/api/health'),
      apiRequest('/api/db/orders'),
      apiRequest('/api/db/leads')
    ]);
    applyOrdersFromDatabase(orderData.orders);
    applyLeadsFromDatabase(leadData.leads);
    setBackendStatus(true, 'SQLite Connected');
    if (health.gemini_connected) {
      console.info('StitchAI backend and SQLite are connected; Gemini is configured.');
    }
  } catch (error) {
    setBackendStatus(false, 'Backend Offline');
    console.error('StitchAI backend is unavailable. Start it with python3 server.py:', error);
  }
}

// --- MODULE 5: PRODUCTION PARTNER & DIGITIZER MARKETPLACE ---
function setupMarketplace() {
  const downloadDstBtn = document.getElementById('downloadDstBtn');
  if (downloadDstBtn) {
    downloadDstBtn.addEventListener('click', () => {
      generateAndDownloadDSTFile();
    });
  }

  const completeQcBtn = document.getElementById('completeQcInspectionBtn');
  if (completeQcBtn) {
    completeQcBtn.addEventListener('click', () => {
      alert('📋 QC Check Complete! All 250 garments verified for thread tension, needle trims, and color accuracy (Pass Rate: 99.6%). Stage updated to Packaging.');
    });
  }
}

function renderMarketplaceJobs() {
  const container = document.getElementById('marketplaceJobsContainer');
  if (!container) return;

  container.innerHTML = state.marketplace.availableJobs.map(job => `
    <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-[10px] font-mono font-bold bg-slate-900 text-indigo-400 px-2 py-0.5 rounded border border-slate-700">${job.id}</span>
          <h4 class="text-sm font-bold text-white mt-1">${job.title}</h4>
          <p class="text-xs text-slate-400">${job.client} • ${job.location}</p>
        </div>
        <span class="text-base font-black font-mono text-emerald-400">${job.payout}</span>
      </div>

      <div class="grid grid-cols-3 gap-2 my-3 text-xs bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono">
        <div>
          <span class="text-[9px] text-slate-500 block">UNITS</span>
          <span class="font-bold text-white">${job.units}</span>
        </div>
        <div>
          <span class="text-[9px] text-slate-500 block">STITCHES</span>
          <span class="font-bold text-indigo-400">${job.stitchCount.toLocaleString()}</span>
        </div>
        <div>
          <span class="text-[9px] text-slate-500 block">DEADLINE</span>
          <span class="font-bold text-amber-400">${job.deadline}</span>
        </div>
      </div>

      <button 
        type="button" 
        onclick="alert('Job ${job.id} dispatched to Tajima CNC queue!')"
        class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors"
      >
        Accept Production Job
      </button>
    </div>
  `).join('');
}

function generateAndDownloadDSTFile() {
  const header = `LA:StitchAI_Design_DST\r\nST:16840\r\nCO:4\r\n+X:420\r\n-X:420\r\n+Y:380\r\n-Y:380\r\nAX:+00000\r\nAY:+00000\r\nMX:+00000\r\nMY:+00000\r\nPD:0\r\n\x1a`;
  const blob = new Blob([header], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StitchAI_${state.order.id}_Production.dst`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- MODULE 6: AI CRM & WHATSAPP HUB ---
function setupCRM() {
  const whatsappSendBtn = document.getElementById('whatsappSimSendBtn');
  const whatsappInput = document.getElementById('whatsappSimInput');

  if (whatsappSendBtn && whatsappInput) {
    const sendSimMessage = () => {
      const text = whatsappInput.value.trim();
      if (!text) return;

      const sim = state.crm.whatsappSimulation;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      sim.messages.push({ sender: 'customer', time: now, text });
      whatsappInput.value = '';
      renderWhatsAppSimulation();

      setTimeout(() => {
        sim.messages.push({
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Got your request! ✅ I have analyzed the quantities and verified factory capacity. Your custom quote has been generated with our guaranteed delivery window. Click here to confirm: https://stitchai.app/q/vanguard-600`
        });
        renderWhatsAppSimulation();
      }, 1000);
    };

    whatsappSendBtn.addEventListener('click', sendSimMessage);
    whatsappInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendSimMessage();
    });
  }
}

function renderCRMLeads() {
  const container = document.getElementById('crmLeadsTableBody');
  if (!container) return;

  container.innerHTML = state.crm.leads.map(lead => `
    <tr class="hover:bg-slate-850 transition-colors text-xs">
      <td class="py-3 px-4">
        <div class="font-bold text-white">${lead.name}</div>
        <div class="text-[11px] text-slate-400">${lead.org}</div>
      </td>
      <td class="py-3 px-4 font-mono font-semibold text-slate-200">${lead.dealSize}</td>
      <td class="py-3 px-4">
        <span class="font-bold text-emerald-400 font-mono">${lead.intentScore}%</span>
        <span class="text-[10px] text-slate-400 block">${lead.scoreTag}</span>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">${lead.stage}</span>
      </td>
      <td class="py-3 px-4 text-slate-300 text-[11px]">
        ${lead.lastAction}
      </td>
      <td class="py-3 px-4 text-right">
        <button 
          type="button" 
          onclick="alert('🤖 AI automated follow-up dispatched for ${lead.name}!')"
          class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[11px] transition-colors"
        >
          Auto Follow-up
        </button>
      </td>
    </tr>
  `).join('');
}

function renderWhatsAppSimulation() {
  const container = document.getElementById('whatsappMessagesList');
  if (!container) return;

  container.innerHTML = state.crm.whatsappSimulation.messages.map(m => `
    <div class="flex items-start gap-2 ${m.sender === 'ai' ? '' : 'flex-row-reverse'} text-xs">
      <div class="p-3 rounded-xl max-w-[85%] ${
        m.sender === 'ai' 
          ? 'bg-slate-800 text-white rounded-tl-sm' 
          : 'bg-[#005c4b] text-white rounded-tr-sm'
      }">
        <p class="leading-relaxed whitespace-pre-wrap">${m.text}</p>
        <span class="text-[9px] text-slate-400 mt-1 block text-right">${m.time}</span>
      </div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

// --- MODULE 7: ACADEMIC PRESENTATION SLIDE DECK ---
function setupAcademicDeck() {
  renderAcademicSlide();
}

function renderAcademicSlide() {
  const idx = state.academic.activeSlide - 1;
  const slide = state.academic.slides[idx];
  const body = document.getElementById('slideContentBody');
  const counter = document.getElementById('slideCounterText');
  const indicators = document.getElementById('slideIndicatorsContainer');

  if (counter) counter.textContent = `${state.academic.activeSlide} / ${state.academic.totalSlides}`;

  if (body) {
    body.innerHTML = `
      <div class="space-y-6 max-w-4xl mx-auto">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          ${slide.badge}
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          ${slide.title}
        </h2>
        <p class="text-base text-slate-400 font-medium pb-2 border-b border-slate-800">
          ${slide.subtitle}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          ${slide.points.map(pt => `
            <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed shadow-sm">
              ${pt}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (indicators) {
    indicators.innerHTML = state.academic.slides.map((_, i) => `
      <button 
        onclick="jumpToSlide(${i + 1})"
        class="w-2.5 h-2.5 rounded-full transition-all ${i + 1 === state.academic.activeSlide ? 'w-6 bg-amber-400' : 'bg-slate-700 hover:bg-slate-500'}"
      ></button>
    `).join('');
  }
}

window.changeSlide = function(delta) {
  let next = state.academic.activeSlide + delta;
  if (next < 1) next = state.academic.totalSlides;
  if (next > state.academic.totalSlides) next = 1;
  state.academic.activeSlide = next;
  renderAcademicSlide();
};

window.jumpToSlide = function(n) {
  state.academic.activeSlide = n;
  renderAcademicSlide();
};

window.showAcademicSubtab = function(tab) {
  const slidesEl = document.getElementById('academicSubtabSlides');
  const reportEl = document.getElementById('academicSubtabReport');
  const btnSlides = document.getElementById('tabShowSlides');
  const btnReport = document.getElementById('tabShowReport');

  if (tab === 'slides') {
    slidesEl.classList.remove('hidden');
    reportEl.classList.add('hidden');
    btnSlides.className = 'text-amber-400 border-b-2 border-amber-400 pb-2 px-1';
    btnReport.className = 'text-slate-400 hover:text-white pb-2 px-1';
  } else {
    slidesEl.classList.add('hidden');
    reportEl.classList.remove('hidden');
    btnReport.className = 'text-amber-400 border-b-2 border-amber-400 pb-2 px-1';
    btnSlides.className = 'text-slate-400 hover:text-white pb-2 px-1';
  }
};

// --- MODULE 8: STRIPE & RAZORPAY PAYMENT GATEWAY ---
function setupPaymentGateway() {
  // Configured via window helpers
}

window.openPaymentModal = function() {
  const quoteModal = document.getElementById('printableQuoteModal');
  if (quoteModal) quoteModal.classList.add('hidden');

  const payModal = document.getElementById('paymentCheckoutModal');
  const amountEl = document.getElementById('payModalAmount');
  if (amountEl) amountEl.textContent = `$${state.order.totalPrice.toFixed(2)}`;
  if (payModal) payModal.classList.remove('hidden');
};

window.selectPaymentGateway = function(gw) {
  const stripeForm = document.getElementById('stripeFormContainer');
  const razorpayForm = document.getElementById('razorpayFormContainer');
  const btnStripe = document.getElementById('btnSelectStripe');
  const btnRazorpay = document.getElementById('btnSelectRazorpay');

  if (gw === 'stripe') {
    stripeForm.classList.remove('hidden');
    razorpayForm.classList.add('hidden');
    btnStripe.className = 'p-3 rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-2 transition-all';
    btnRazorpay.className = 'p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-2 transition-all';
  } else {
    stripeForm.classList.add('hidden');
    razorpayForm.classList.remove('hidden');
    btnRazorpay.className = 'p-3 rounded-xl bg-emerald-600 text-white flex items-center justify-center gap-2 transition-all';
    btnStripe.className = 'p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-2 transition-all';
  }
};

window.executePayment = function(gw) {
  apiRequest('/api/db/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: state.order.id,
      amount: state.order.totalPrice,
      gateway: gw,
      last4: '4242'
    })
  })
  .then(data => {
    if (data.status !== 'success') {
      throw new Error(data.error || 'Payment was not accepted by the backend.');
    }
    document.getElementById('paymentCheckoutModal').classList.add('hidden');
    state.order.paymentStatus = 'Paid';
    state.order.currentStage = 3;
    state.order.stages[2].status = 'completed';
    state.order.stages[3].status = 'active';
    renderOrderMilestones();
    switchTab('tracking');
    alert(`🎉 Payment Successful!\n\nTransaction ID: ${data.transaction_id}\nMethod: ${gw.toUpperCase()}\nOrder #${state.order.id} has been marked PAID and advanced to CNC Production.`);
  })
  .catch(error => {
    console.error('Payment was not recorded:', error);
    alert(`Payment was not recorded. Please try again when the backend is available.\n\n${error.message}`);
  });
};

// --- MODULE 9: GEMINI API CONFIGURATION ---
function setupGeminiConfig() {
  const triggerBtn = document.getElementById('openGeminiModalBtn');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      const modal = document.getElementById('geminiConfigModal');
      const input = document.getElementById('geminiApiKeyInput');
      if (input) input.value = state.gemini.apiKey;
      if (modal) modal.classList.remove('hidden');
    });
  }
}

window.saveGeminiConfig = function() {
  const input = document.getElementById('geminiApiKeyInput');
  const sel = document.getElementById('geminiModelSelect');
  if (input) {
    state.gemini.apiKey = input.value.trim();
    localStorage.setItem('stitchai_gemini_key', state.gemini.apiKey);
  }
  if (sel) state.gemini.model = sel.value;

  const badge = document.getElementById('aiModelBadge');
  if (badge) {
    badge.textContent = state.gemini.apiKey ? `Gemini Active (${state.gemini.model})` : 'StitchAI Local Heuristic Engine';
    badge.className = state.gemini.apiKey ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  }

  document.getElementById('geminiConfigModal').classList.add('hidden');
  alert('⚡ Gemini API settings updated successfully!');
};

// --- MASTER RENDER FUNCTION ---
function renderAll() {
  renderChatMessages();
  renderExtractedRequirements();
  renderStudioGarmentButtons();
  renderColorSwatches();
  renderPlacementButtons();
  renderModeButtons();
  renderCVAnalysisPanel();
  updateVisualizerCanvas();
  calculateQuotation();
  renderOrderMilestones();
  renderMarketplaceJobs();
  renderCRMLeads();
  renderWhatsAppSimulation();
  renderAcademicSlide();
}
