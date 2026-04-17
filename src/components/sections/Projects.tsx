import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, X, CheckCircle2, Zap, TrendingUp, Clock, Shield,
  FileText, Lightbulb, Code, Rocket, LifeBuoy, Users, BarChart3, Heart,
  Bot, ShoppingCart, Globe, Cpu, ChevronRight, Star, Target, Layers,
  Send, Mail, User, Phone, MessageSquare, Briefcase, MapPin
} from 'lucide-react'
import { submitContact } from '../../api/api'
import Toast from '../common/Toast'

/* ── Categories ───────────────────────────────────────────────── */

const categories = ['All', 'Healthcare', 'AI Agents', 'Automation', 'Web Apps', 'AI & ML']

/* ── Process Steps (shared) ───────────────────────────────────── */

const processSteps = [
  { icon: FileText, title: 'Discovery & Analysis', color: 'from-blue-500 to-blue-600' },
  { icon: Lightbulb, title: 'Solution Design', color: 'from-violet-500 to-purple-600' },
  { icon: Code, title: 'Development & Testing', color: 'from-cyan-500 to-teal-500' },
  { icon: Rocket, title: 'Deploy & Scale', color: 'from-orange-500 to-amber-500' },
  { icon: LifeBuoy, title: '24/7 Support', color: 'from-emerald-500 to-green-500' },
]

/* ── Project Data ─────────────────────────────────────────────── */

interface ProjectItem {
  number: string
  title: string
  tagline: string
  description: string
  fullDescription: string
  howItHelps: string
  category: string
  badge: string
  icon: typeof Heart
  accent: string
  accentBg: string
  borderAccent: string
  glowColor: string
  image: string
  benefits: { icon: typeof Zap; title: string; desc: string }[]
  workflow: { step: string; detail: string }[]
  process: string[]
  features: string[]
  results: { value: string; label: string }[]
  whyChooseUs: string[]
}

const projects: ProjectItem[] = [
  {
    number: '01',
    title: 'Hospital Management System',
    tagline: 'Run your entire hospital from one screen',
    description: 'One platform for patients, appointments, doctors, labs, pharmacy & billing. No more juggling 10 different systems — everything your hospital needs, in one place.',
    fullDescription: 'Imagine running your entire hospital from a single dashboard. Our Hospital Management System connects every department — front desk, doctors, labs, pharmacy, billing — into one intelligent platform. When a patient checks in, their info flows automatically to the doctor. When a doctor orders a test, the lab gets it instantly. When treatment is done, billing is generated automatically. No duplicate entry, no lost paperwork, no delays.',
    howItHelps: 'Your staff saves 4+ hours daily on paperwork. Patients wait 60% less. Billing errors drop to near zero. Doctors see complete patient history in one click. And you? You see everything happening in your hospital in real-time from one dashboard — beds, staff, revenue, patient flow. It\'s like having a control tower for your hospital.',
    category: 'Healthcare',
    badge: 'Healthcare',
    icon: Heart,
    accent: 'text-red-400',
    accentBg: 'bg-red-500/10',
    borderAccent: 'hover:border-red-500/30',
    glowColor: 'rgba(239,68,68,0.08)',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Clock, title: '60% Faster Operations', desc: 'Automated workflows cut admin time by more than half, letting staff focus on patient care instead of paperwork' },
      { icon: Shield, title: 'HIPAA Compliant', desc: 'End-to-end encryption, role-based access control, and complete audit trails ensure full regulatory compliance' },
      { icon: TrendingUp, title: '3x Revenue Growth', desc: 'Streamlined billing captures every charge accurately, reducing claim denials and accelerating payment cycles' },
      { icon: Users, title: 'Better Patient Care', desc: 'Doctors spend more time with patients and less on administrative tasks, improving satisfaction scores by 45%' },
    ],
    workflow: [
      { step: 'Patient Registration', detail: 'Digital check-in with insurance verification, demographic capture, and instant ID generation' },
      { step: 'Appointment Scheduling', detail: 'AI-optimized scheduling that balances doctor availability, patient urgency, and resource allocation' },
      { step: 'Clinical Documentation', detail: 'Voice-assisted clinical notes, automated coding suggestions, and template-based charting' },
      { step: 'Lab & Pharmacy', detail: 'Integrated order management with real-time result tracking and automated prescription processing' },
      { step: 'Billing & Claims', detail: 'Auto-generated claims with compliance checks, real-time eligibility verification, and payment posting' },
      { step: 'Analytics & Reporting', detail: 'Executive dashboards with KPIs for clinical, operational, and financial performance metrics' },
    ],
    process: [
      'Mapped 50+ clinical workflows & stakeholder interviews across all departments',
      'Designed modular architecture with FHIR/HL7 integration and role-based access',
      'Built with React + Node.js + PostgreSQL, 200+ automated test cases',
      'Zero-downtime deployment with Docker + Kubernetes on HIPAA-compliant cloud',
      'Ongoing monitoring, quarterly updates & 24/7 dedicated incident response',
    ],
    features: ['Patient Records', 'Appointment Booking', 'Billing Integration', 'Clinical Workflows', 'Lab Results', 'Pharmacy Module'],
    results: [{ value: '60%', label: 'Faster Ops' }, { value: '100%', label: 'Uptime' }, { value: '50+', label: 'Workflows' }, { value: '24/7', label: 'Support' }],
    whyChooseUs: [
      'Built by healthcare IT veterans with 10+ years of domain expertise',
      'Seamless integration with existing EHR/EMR systems and medical devices',
      'Scalable from single clinics to multi-hospital networks',
      'Dedicated success manager for onboarding and ongoing optimization',
    ],
  },
  {
    number: '02',
    title: 'RCM & Billing Automation',
    tagline: 'Get paid faster, lose less money',
    description: 'Stop chasing payments manually. Our AI submits claims, tracks payments, catches errors before they happen, and puts money in your account faster.',
    fullDescription: 'Getting paid in healthcare is complicated — insurance verification, coding, claim submission, payment tracking, denials. Our RCM platform automates the entire money flow. Claims go out clean (97%+ accuracy), payments come back faster, and you always know exactly where your money is. Think of it as autopilot for your billing department.',
    howItHelps: 'Within 6 months, practices using our platform collect 40% more revenue. Claims that used to take weeks get processed in hours. Your billing team stops doing repetitive data entry and starts handling the cases that actually need human expertise. The bottom line? More money, less hassle, zero compliance headaches.',
    category: 'Healthcare',
    badge: 'Healthcare',
    icon: BarChart3,
    accent: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    borderAccent: 'hover:border-rose-500/30',
    glowColor: 'rgba(251,113,133,0.08)',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: TrendingUp, title: '40% Revenue Increase', desc: 'Fewer denials and faster claim turnaround mean significantly higher net collections' },
      { icon: Zap, title: '80% Faster Claims', desc: 'Auto-submission with real-time status tracking eliminates manual bottlenecks' },
      { icon: Shield, title: 'Zero Compliance Risk', desc: 'Built-in regulatory checks on every claim ensure CMS and payer guideline adherence' },
      { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Live dashboards for financial performance, denial trends, and collection forecasting' },
    ],
    workflow: [
      { step: 'Eligibility Verification', detail: 'Real-time insurance eligibility checks before patient encounters to prevent claim issues' },
      { step: 'Charge Capture', detail: 'Automated charge capture from clinical documentation with AI-powered CPT/ICD coding' },
      { step: 'Claim Scrubbing', detail: 'Intelligent claim validation against payer-specific rules to catch errors before submission' },
      { step: 'Claim Submission', detail: 'Batch and real-time electronic claim submission to all major clearinghouses and payers' },
      { step: 'Payment Posting', detail: 'Automated ERA/EOB processing with variance detection and exception routing' },
      { step: 'Denial Management', detail: 'AI-driven root cause analysis with automated appeal generation and tracking' },
    ],
    process: [
      'Audited existing billing workflows & identified revenue leakage points across the cycle',
      'Designed automated claim pipeline with multi-layer AI validation and scrubbing',
      'Built RPA bots + ML models for coding accuracy exceeding 97%',
      'Integrated with all major clearinghouses, EHRs & payer APIs',
      'Continuous model tuning, compliance monitoring & monthly performance reviews',
    ],
    features: ['Claim Processing', 'Auto Coding', 'Insurance Verification', 'Payment Posting', 'Denial Tracking', 'Analytics Dashboard'],
    results: [{ value: '40%', label: 'More Revenue' }, { value: '80%', label: 'Faster Claims' }, { value: '95%', label: 'First-Pass' }, { value: '<1%', label: 'Error Rate' }],
    whyChooseUs: [
      'AI models trained on millions of real healthcare claims',
      'Integrates with 200+ payers and all major clearinghouses',
      'ROI positive within the first 90 days of deployment',
      'White-glove onboarding with dedicated billing specialists',
    ],
  },
  {
    number: '03',
    title: 'Denial Management AI',
    tagline: 'Recover money insurance companies owe you',
    description: 'Insurance denied your claim? Our AI figures out why, writes the appeal, and gets your money back — automatically. 85% recovery rate.',
    fullDescription: 'Claim denials are like money slipping through cracks. Our AI catches every denial instantly, figures out exactly why it was denied, and takes action. It writes professional appeal letters tailored to each insurance company, submits them, and tracks until you get paid. It even learns patterns — if Blue Cross keeps denying a certain procedure, our system adjusts future claims to prevent it.',
    howItHelps: 'The average hospital loses $5M+ per year to denials. Our system recovers 85% of that automatically. Your staff stops spending hours researching denial codes and writing appeals by hand. Instead, the AI handles it in minutes. You get your money back faster, and future denials decrease because the system prevents them before they happen.',
    category: 'AI & ML',
    badge: 'AI & ML',
    icon: Shield,
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    borderAccent: 'hover:border-amber-500/30',
    glowColor: 'rgba(245,158,11,0.08)',
    image: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: TrendingUp, title: '85% Recovery Rate', desc: 'AI-powered appeals recover the vast majority of denied claims with optimized language and documentation' },
      { icon: Clock, title: '70% Less Manual Work', desc: 'Automated root cause analysis & appeal drafting eliminates hours of manual research per denial' },
      { icon: Zap, title: 'Real-Time Alerts', desc: 'Instant notifications when denials are received with prioritized action queues based on dollar value' },
      { icon: BarChart3, title: 'Pattern Recognition', desc: 'ML identifies denial trends by payer, procedure, and provider — preventing future denials proactively' },
    ],
    workflow: [
      { step: 'Denial Intake', detail: 'Automated capture of denial notifications from all payer channels with instant categorization' },
      { step: 'Root Cause Analysis', detail: 'NLP engine analyzes remark codes, EOBs, and clinical documentation to identify exact denial reasons' },
      { step: 'Appeal Strategy', detail: 'AI selects optimal appeal strategy based on payer history, denial type, and success probability' },
      { step: 'Appeal Generation', detail: 'Automated appeal letter creation with supporting documentation assembly and compliance checks' },
      { step: 'Submission & Tracking', detail: 'Electronic appeal submission with real-time status monitoring and escalation triggers' },
      { step: 'Analytics & Prevention', detail: 'Pattern analysis feeds back into upstream processes to prevent recurring denial scenarios' },
    ],
    process: [
      'Analyzed 10,000+ historical denials to identify patterns and root causes',
      'Trained NLP models for denial reason classification with 96% accuracy',
      'Built auto-appeal generation engine with customizable templates per payer',
      'Deployed with real-time payer portal integration and status tracking',
      'Monthly model retraining with new denial data for continuous improvement',
    ],
    features: ['Denial Tracking', 'Root Cause Analysis', 'Appeal Generation', 'Payer Analytics', 'Trend Forecasting', 'Compliance Checks'],
    results: [{ value: '85%', label: 'Recovery' }, { value: '70%', label: 'Less Work' }, { value: '2x', label: 'Faster Appeals' }, { value: '$2M+', label: 'Recovered' }],
    whyChooseUs: [
      'NLP models specifically trained on healthcare denial language',
      'Appeal templates optimized per payer with historical win-rate data',
      'Seamless integration with existing RCM and practice management systems',
      'Proven $2M+ average annual recovery per mid-size practice',
    ],
  },
  {
    number: '04',
    title: 'AI Medical Coding Platform',
    tagline: 'Code smarter, earn more, stay compliant',
    description: 'Our AI reads doctor notes and suggests the right billing codes instantly — 98% accurate, 5x faster than manual coding, and always audit-ready.',
    fullDescription: 'Medical coding is the bridge between patient care and getting paid. Our AI reads clinical notes like an expert coder — it understands diagnoses, procedures, and complexity, then suggests the exact ICD-10 and CPT codes with confidence scores. Coders review and approve in seconds instead of spending minutes per chart. It catches undercoding (you\'re leaving money on the table) and overcoding (compliance risk) automatically.',
    howItHelps: 'Your coders become 5x more productive overnight. Revenue increases by 30% because the AI catches codes that humans miss. Audit risk drops to near zero because every code has documented rationale. And when ICD-10 updates come out every year? The AI updates automatically — no retraining needed.',
    category: 'AI & ML',
    badge: 'AI & ML',
    icon: Cpu,
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
    borderAccent: 'hover:border-violet-500/30',
    glowColor: 'rgba(139,92,246,0.08)',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Zap, title: '98% Coding Accuracy', desc: 'AI suggestions match expert-level precision, reducing errors that cause denials and compliance issues' },
      { icon: Clock, title: '5x Faster Coding', desc: 'Auto-suggestions reduce manual lookup time, allowing coders to process 5x more encounters per day' },
      { icon: Shield, title: 'Audit-Ready', desc: 'Complete trail for every code assignment with rationale documentation and compliance verification' },
      { icon: TrendingUp, title: 'Revenue Optimization', desc: 'Captures correct codes including modifiers and specificity to maximize legitimate reimbursement' },
    ],
    workflow: [
      { step: 'Document Intake', detail: 'Clinical notes, operative reports, and discharge summaries are ingested and parsed in real-time' },
      { step: 'NLP Extraction', detail: 'Medical NLP identifies diagnoses, procedures, laterality, severity, and other coding-relevant details' },
      { step: 'Code Suggestion', detail: 'AI suggests ICD-10, CPT, and HCPCS codes with confidence scores and supporting evidence' },
      { step: 'Compliance Check', detail: 'Automated validation against CMS NCCI edits, LCD/NCD policies, and payer-specific rules' },
      { step: 'Coder Review', detail: 'Human coders review AI suggestions, accept/modify, with all decisions logged for audit' },
      { step: 'Quality Assurance', detail: 'Statistical sampling and variance detection ensures ongoing coding accuracy and consistency' },
    ],
    process: [
      'Collected & annotated 100K+ clinical note samples across 30+ specialties',
      'Fine-tuned transformer models on medical terminology with domain-specific embeddings',
      'Built real-time code suggestion API with sub-200ms response and confidence scoring',
      'Integrated into existing EHR/EMR workflows with zero disruption to clinical operations',
      'Ongoing model updates with every new ICD-10/CPT annual release cycle',
    ],
    features: ['ICD-10 Coding', 'CPT Suggestions', 'NLP Analysis', 'Audit Trail', 'Quality Checks', 'Batch Processing'],
    results: [{ value: '98%', label: 'Accuracy' }, { value: '5x', label: 'Faster' }, { value: '100%', label: 'Auditable' }, { value: '30%', label: 'More Revenue' }],
    whyChooseUs: [
      'Models trained on 100K+ real clinical encounters across all specialties',
      'Sub-200ms response time — faster than any human lookup',
      'Continuous learning from coder feedback improves accuracy over time',
      'Supports both professional and facility coding workflows',
    ],
  },
  {
    number: '05',
    title: 'EHR / EMR System',
    tagline: 'Patient records that actually work for you',
    description: 'Fast, modern health records — doctors chart 50% faster with AI assistance, patients access everything online, and it works on any device.',
    fullDescription: 'Forget slow, clunky health record systems. Ours loads in under a second, works beautifully on tablets and phones, and helps doctors write notes faster with AI. When a doctor starts typing, the system suggests common phrases, auto-fills based on the visit type, and even supports voice dictation. Patients get their own portal to view results, book appointments, message their doctor, and request refills — 24/7.',
    howItHelps: 'Doctors save 2+ hours daily on documentation. Patients love the instant access to their records and online booking. Your practice runs smoother because everyone — front desk, nurses, doctors, billing — sees the same up-to-date information. No more "let me check with another department." Everything is right there, right now.',
    category: 'Healthcare',
    badge: 'Healthcare',
    icon: Heart,
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    borderAccent: 'hover:border-pink-500/30',
    glowColor: 'rgba(236,72,153,0.08)',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Users, title: 'Patient-Centric', desc: 'Unified 360° patient view across all departments with complete medical history at a glance' },
      { icon: Clock, title: '50% Less Charting', desc: 'AI-assisted clinical notes, voice dictation, and smart templates dramatically reduce documentation time' },
      { icon: Shield, title: 'HIPAA & FHIR', desc: 'Built on healthcare interoperability standards with end-to-end encryption and access controls' },
      { icon: Zap, title: 'Instant Access', desc: 'Sub-second load times for critical patient data — no more waiting for charts to load' },
    ],
    workflow: [
      { step: 'Patient Onboarding', detail: 'Digital intake forms, insurance capture, consent management, and medical history import' },
      { step: 'Clinical Encounter', detail: 'AI-assisted note-taking with specialty templates, voice dictation, and smart auto-complete' },
      { step: 'Order Management', detail: 'Integrated lab orders, imaging requests, and e-prescriptions with real-time status tracking' },
      { step: 'Results & Follow-up', detail: 'Automatic result notification, abnormal value flagging, and follow-up scheduling' },
      { step: 'Patient Portal', detail: 'Secure messaging, appointment booking, prescription refills, and health record access' },
      { step: 'Interoperability', detail: 'FHIR API for data exchange with other systems, HIEs, and public health registries' },
    ],
    process: [
      'Stakeholder interviews with doctors, nurses, front desk & administrators',
      'Designed FHIR-compliant data architecture with specialty-specific modules',
      'Developed modular frontend with role-based access and responsive design',
      'Load-tested for 10,000+ concurrent users with sub-second response times',
      'HIPAA audit certification + ongoing security patches and feature updates',
    ],
    features: ['Patient Data', 'Lab Results', 'Prescriptions', 'Clinical Notes', 'Imaging', 'Referrals'],
    results: [{ value: '50%', label: 'Less Charting' }, { value: '10K+', label: 'Users' }, { value: '100%', label: 'Uptime' }, { value: 'A+', label: 'Security' }],
    whyChooseUs: [
      'Modern cloud-native architecture — no legacy system baggage',
      'AI-powered documentation saves clinicians 2+ hours per day',
      'Flexible enough for any specialty from family medicine to oncology',
      'Proven reliability with 100% uptime SLA and 24/7 support',
    ],
  },
  {
    number: '06',
    title: 'Front Desk Voice Agents',
    tagline: 'Your AI receptionist answers every call',
    description: 'Patients call, AI answers — books appointments, handles refills, answers questions. 24/7, in 10+ languages. Your phone never goes unanswered again.',
    fullDescription: 'Your front desk is overwhelmed. Phones ring non-stop, patients wait on hold, and after-hours calls go to voicemail. Our AI voice agent fixes all of that. It answers every call within one ring, talks naturally like a real person, and handles the most common requests — booking appointments, rescheduling, refill requests, insurance questions — all by itself. It connects to your calendar and patient records in real-time, so bookings are instant and accurate.',
    howItHelps: 'Zero missed calls means zero lost patients. Your front desk staff can finally focus on the people standing in front of them instead of juggling phones. After-hours calls get handled professionally instead of going to voicemail. And you save $50K+ per year in staffing costs. Patients rate the experience 4.8/5 — they love the instant service.',
    category: 'AI Agents',
    badge: 'AI Agent',
    icon: Bot,
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    borderAccent: 'hover:border-blue-500/30',
    glowColor: 'rgba(59,130,246,0.08)',
    image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Clock, title: '24/7 Availability', desc: 'Never miss a call — AI handles after-hours, weekends, and holidays with the same quality' },
      { icon: TrendingUp, title: '90% Call Resolution', desc: 'Most patient inquiries resolved without human handoff, freeing your team for complex tasks' },
      { icon: Users, title: 'Multi-Language', desc: 'Supports English, Spanish, and 10+ languages natively — serving diverse patient populations' },
      { icon: Zap, title: 'Instant Booking', desc: 'Appointments confirmed in real-time via voice with automatic calendar sync and reminders' },
    ],
    workflow: [
      { step: 'Call Reception', detail: 'AI answers within 1 ring, greets patient by name (if recognized), and identifies call purpose' },
      { step: 'Intent Recognition', detail: 'NLU engine classifies call intent — scheduling, refill, billing inquiry, urgent care, etc.' },
      { step: 'Task Execution', detail: 'Books/modifies appointments, submits refill requests, or provides information in real-time' },
      { step: 'Verification', detail: 'Confirms all actions with patient, sends SMS confirmation, and updates EHR records' },
      { step: 'Escalation Path', detail: 'Complex or urgent cases seamlessly transferred to appropriate staff with full context summary' },
      { step: 'Post-Call Analytics', detail: 'Call transcripts logged, satisfaction tracked, and patterns analyzed for improvement' },
    ],
    process: [
      'Recorded & analyzed 5,000+ real front-desk calls to build conversation models',
      'Designed conversation flows with intelligent fallback and human escalation paths',
      'Trained NLU models on healthcare terminology with accent and dialect support',
      'Integrated with EHR scheduling APIs and phone system infrastructure',
      'A/B testing & continuous conversation tuning based on patient feedback',
    ],
    features: ['NLU Processing', 'Appointment Booking', 'Call Routing', 'Voicemail AI', 'Analytics', 'Multi-Language'],
    results: [{ value: '24/7', label: 'Available' }, { value: '90%', label: 'Resolved' }, { value: '3s', label: 'Avg Wait' }, { value: '10+', label: 'Languages' }],
    whyChooseUs: [
      'Natural-sounding voice that patients rate 4.8/5 for friendliness',
      'Direct integration with all major EHR and PMS platforms',
      'HIPAA-compliant call handling with encrypted recordings',
      '$50K+ average annual savings in front desk staffing costs',
    ],
  },
  {
    number: '07',
    title: 'Customer Support AI Agents',
    tagline: 'Instant support on every channel, any time',
    description: 'AI that answers customer questions on chat, email, WhatsApp & phone — instantly, in any language. Cuts support costs 45% while making customers happier.',
    fullDescription: 'Whether you run a restaurant, hotel, online store, or office — your customers want answers NOW. Our AI support agents deliver exactly that. They answer in seconds on any channel (chat, email, phone, WhatsApp, social media), know your products and policies inside out, and handle everything from order tracking to refunds to complaints. When something needs a human touch, the AI hands off seamlessly with full context.',
    howItHelps: 'Your customers get answers in seconds instead of waiting 10+ minutes. Support costs drop 45% because AI handles the routine stuff. Your team focuses on VIP cases and complex problems. Every conversation is tracked and analyzed, so you learn what customers really want. The result? 4.9★ customer satisfaction and customers who keep coming back.',
    category: 'AI Agents',
    badge: 'AI Agent',
    icon: Bot,
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    borderAccent: 'hover:border-cyan-500/30',
    glowColor: 'rgba(6,182,212,0.08)',
    image: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Zap, title: '80% Faster Response', desc: 'Instant answers without waiting in queue — most issues resolved in under 30 seconds' },
      { icon: TrendingUp, title: '45% Cost Reduction', desc: 'Fewer support staff needed for the same volume while improving customer satisfaction' },
      { icon: Users, title: 'Omni-Channel', desc: 'Chat, email, voice, WhatsApp, and social media — all unified in one smart platform' },
      { icon: Shield, title: 'Smart Escalation', desc: 'Complex issues auto-routed to the right specialist with full conversation context' },
    ],
    workflow: [
      { step: 'Channel Intake', detail: 'Customer reaches out via any channel — chat, email, phone, WhatsApp, or social media' },
      { step: 'Context Building', detail: 'AI identifies customer, pulls order/account history, and understands intent from first message' },
      { step: 'Knowledge Retrieval', detail: 'RAG pipeline searches your knowledge base, FAQs, and documentation for accurate answers' },
      { step: 'Response Generation', detail: 'Personalized response crafted with proper tone, brand voice, and actionable resolution' },
      { step: 'Action Execution', detail: 'AI can process refunds, update orders, book appointments, and trigger internal workflows' },
      { step: 'Feedback Loop', detail: 'Customer satisfaction tracked, responses improved, and knowledge base gaps identified' },
    ],
    process: [
      'Mapped customer journey & analyzed 50,000+ common support queries for your industry',
      'Designed RAG pipeline with your company knowledge base, FAQs, and documentation',
      'Built multi-channel integration layer with CRM, ticketing, and order management systems',
      'Deployed with A/B tested conversation templates optimized for resolution and satisfaction',
      'Weekly analytics review & continuous model improvement based on real interactions',
    ],
    features: ['24/7 Support', 'Multi-Language', 'Ticket Management', 'CRM Integration', 'Knowledge Base', 'Sentiment Analysis'],
    results: [{ value: '80%', label: 'Faster' }, { value: '45%', label: 'Cost Cut' }, { value: '4.9★', label: 'CSAT' }, { value: '1M+', label: 'Conversations' }],
    whyChooseUs: [
      'Industry-specific training for healthcare, hospitality, retail, and more',
      'RAG architecture ensures answers are always based on your actual data',
      'Seamless CRM integration — Salesforce, HubSpot, Zendesk, and more',
      'Proven 4.9★ customer satisfaction across 1M+ conversations',
    ],
  },
  {
    number: '08',
    title: 'Charge Posting & EOB Automation',
    tagline: 'Billing on autopilot, zero human errors',
    description: 'Bots read insurance payments, match them to patient bills, and post everything automatically. Same-day posting, zero typos, complete audit trail.',
    fullDescription: 'Your billing team spends hours every day reading insurance payment documents (EOBs), figuring out which patient they belong to, entering numbers into your system, and reconciling at the end of the day. Our bots do all of that in minutes. They read every EOB, match payments to the right patient and charge, post adjustments, flag anything unusual, and give you a clean reconciliation report — all before your team finishes their morning coffee.',
    howItHelps: 'What used to take your team all day now takes minutes. Payments get posted the same day they arrive instead of piling up for weeks. Data entry errors disappear completely — bots don\'t make typos. Your billing team shifts from data entry to exception handling and patient communication. And everything is tracked with a complete audit trail for compliance.',
    category: 'Automation',
    badge: 'Automation',
    icon: Zap,
    accent: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    borderAccent: 'hover:border-orange-500/30',
    glowColor: 'rgba(249,115,22,0.08)',
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Clock, title: '90% Time Saved', desc: 'RPA handles repetitive posting tasks automatically — what took hours now takes minutes' },
      { icon: Shield, title: 'Zero Errors', desc: 'Eliminates manual data entry mistakes that cause reconciliation issues and compliance risks' },
      { icon: TrendingUp, title: 'Faster Collections', desc: 'Payments posted same-day instead of weeks, improving cash flow and reducing AR days' },
      { icon: BarChart3, title: 'Full Visibility', desc: 'Real-time dashboards for all financial flows with drill-down to individual transactions' },
    ],
    workflow: [
      { step: 'ERA/EOB Intake', detail: 'Automated capture of electronic remittance advices and scanned EOB documents from all payers' },
      { step: 'Document Parsing', detail: 'AI reads and extracts payment details, adjustment codes, remark codes, and patient responsibility' },
      { step: 'Charge Matching', detail: 'Intelligent matching of payments to original charges with fuzzy logic for partial payments' },
      { step: 'Auto Posting', detail: 'RPA bots post payments, adjustments, and patient balances directly into your PMS' },
      { step: 'Exception Handling', detail: 'Discrepancies flagged and routed to staff with context — underpayments, denials, takeback requests' },
      { step: 'Reconciliation', detail: 'Automated bank reconciliation with variance detection and end-of-day balance verification' },
    ],
    process: [
      'Documented existing charge posting workflows and identified automation opportunities',
      'Built RPA bots for EOB parsing, data extraction, and intelligent charge matching',
      'Integrated with billing systems, clearinghouses, and bank feeds',
      'Automated reconciliation with smart exception handling and escalation rules',
      'Monthly bot maintenance, accuracy audits, and performance optimization',
    ],
    features: ['Charge Posting', 'EOB Processing', 'Insurance Matching', 'Reconciliation', 'Exception Handling', 'Audit Trail'],
    results: [{ value: '90%', label: 'Time Saved' }, { value: '0', label: 'Errors' }, { value: 'Same Day', label: 'Posting' }, { value: '100%', label: 'Auditable' }],
    whyChooseUs: [
      'RPA bots work 24/7 without breaks, sick days, or training time',
      'Compatible with all major practice management systems',
      'Exception handling logic customized to your specific workflows',
      'ROI typically achieved within 60 days of deployment',
    ],
  },
  {
    number: '09',
    title: 'Restaurant Website & Ordering',
    tagline: 'Your restaurant, online, making money 24/7',
    description: 'Beautiful website + online ordering + delivery tracking + loyalty program. Customers order directly from you — no DoorDash commissions.',
    fullDescription: 'Your restaurant needs more than a basic website — it needs a money-making machine. Our platform gives you a stunning mobile-friendly site where customers can browse your menu, order food, pay online, track delivery in real-time, and earn loyalty points. The AI even suggests add-ons ("Add garlic bread for $3?") that increase order values by 25%. And the best part? Orders come directly to you — no 15-30% commission fees to delivery apps.',
    howItHelps: 'Restaurants using our platform see 3x more online orders within the first month. You keep 100% of your revenue (no middleman fees). Customers come back 50% more often thanks to the loyalty program and personalized recommendations. Your kitchen gets orders digitally (no phone miscommunication), and you show up at the top of Google local searches. It\'s like having a marketing team, ordering system, and loyalty program all in one.',
    category: 'Web Apps',
    badge: 'Web App',
    icon: ShoppingCart,
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    borderAccent: 'hover:border-emerald-500/30',
    glowColor: 'rgba(16,185,129,0.08)',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: TrendingUp, title: '3x More Orders', desc: 'Online ordering with AI upselling increases revenue and order frequency significantly' },
      { icon: Users, title: 'Customer Loyalty', desc: 'Built-in rewards program and personalized recommendations drive 50% repeat orders' },
      { icon: Zap, title: 'Instant Checkout', desc: 'One-click ordering with saved preferences and payment methods for returning customers' },
      { icon: Globe, title: 'SEO Optimized', desc: 'Rank higher on Google for local food searches with structured data and local SEO' },
    ],
    workflow: [
      { step: 'Website & Branding', detail: 'Custom-designed website with your brand identity, menu photography, and story' },
      { step: 'Menu Configuration', detail: 'Dynamic menu management with categories, modifiers, allergens, and real-time availability' },
      { step: 'Ordering Flow', detail: 'Cart → checkout → payment with support for dine-in, pickup, and delivery options' },
      { step: 'Kitchen Integration', detail: 'Orders flow to KDS (kitchen display) or printers with prep time estimates and status updates' },
      { step: 'Delivery & Tracking', detail: 'Real-time order tracking for customers with driver assignment and ETA updates' },
      { step: 'Loyalty & Marketing', detail: 'Points program, promotional offers, email/SMS campaigns, and review management' },
    ],
    process: [
      'Brand discovery, competitor analysis, and customer persona development',
      'Designed mobile-first UI with optimized ordering flow and beautiful food photography',
      'Built with Next.js + Stripe + real-time tracking with sub-2s page loads',
      'Launched with Google Business optimization, structured data, and local SEO',
      'Ongoing menu updates, promo management, and conversion optimization',
    ],
    features: ['Online Ordering', 'Payment Integration', 'Menu Management', 'Delivery Tracking', 'Loyalty Program', 'SEO'],
    results: [{ value: '3x', label: 'More Orders' }, { value: '2s', label: 'Load Time' }, { value: '4.8★', label: 'Rating' }, { value: '50%', label: 'Repeat' }],
    whyChooseUs: [
      'Zero commission fees — you keep 100% of your online order revenue',
      'AI-powered menu recommendations increase average order value by 25%',
      'Integrates with DoorDash, UberEats, Grubhub, and POS systems',
      'Mobile-first design with 2-second load times for maximum conversions',
    ],
  },
  {
    number: '10',
    title: 'Healthcare Solutions Suite',
    tagline: 'One platform to replace them all',
    description: 'EHR + Billing + Practice Management + Patient Portal + Analytics — all in one system. Stop paying for 5 separate tools that don\'t talk to each other.',
    fullDescription: 'Running a healthcare organization shouldn\'t mean managing 5 different software systems that don\'t work together. Our all-in-one suite replaces your separate EHR, practice management, billing, patient portal, and analytics tools with a single unified platform. Everything shares the same data, the same login, the same support team. When a doctor documents a visit, billing codes generate automatically. When a payment posts, the patient portal updates instantly. It just works — together.',
    howItHelps: 'Organizations switching to our suite save an average of $5M+ over 5 years in licensing, integration, and maintenance costs. Staff learn one system instead of five. Data flows automatically between departments instead of being manually transferred. And when you need help, you call one support team — not five different vendors pointing fingers at each other.',
    category: 'Healthcare',
    badge: 'Enterprise',
    icon: Globe,
    accent: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    borderAccent: 'hover:border-sky-500/30',
    glowColor: 'rgba(14,165,233,0.08)',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop&q=80',
    benefits: [
      { icon: Zap, title: 'Single Platform', desc: 'Replace 5+ separate systems with one unified suite — eliminating integration nightmares forever' },
      { icon: TrendingUp, title: '2x Efficiency', desc: 'Eliminate data silos, duplicate entry, and manual workarounds across departments' },
      { icon: Shield, title: 'Enterprise Security', desc: 'SOC2, HIPAA, and HITRUST certified with role-based access and encryption at rest and in transit' },
      { icon: BarChart3, title: 'Executive Dashboards', desc: 'Real-time KPIs across clinical, financial & operational data with drill-down to individual encounters' },
    ],
    workflow: [
      { step: 'Needs Assessment', detail: 'Comprehensive evaluation of all departments, workflows, and existing systems' },
      { step: 'Data Migration', detail: 'Secure migration of patient records, financial data, and historical information from legacy systems' },
      { step: 'Module Configuration', detail: 'Each module (EHR, PM, RCM, patient portal) configured for your specific specialties and workflows' },
      { step: 'Staff Training', detail: 'Role-based training programs for clinicians, billers, administrators, and front desk staff' },
      { step: 'Phased Go-Live', detail: 'Department-by-department rollout with parallel running to ensure zero disruption to patient care' },
      { step: 'Ongoing Optimization', detail: 'Dedicated success manager, quarterly business reviews, and continuous feature enhancements' },
    ],
    process: [
      'Enterprise needs assessment across all departments and stakeholder groups',
      'Modular microservices architecture design with shared data layer and FHIR compliance',
      'Phased development with sprint demos every 2 weeks and stakeholder sign-off',
      'Staged rollout — department by department with parallel running and cutover support',
      'Dedicated success manager, quarterly business reviews & 24/7 priority support',
    ],
    features: ['EHR Integration', 'Practice Management', 'EDI Processing', '837P Submission', 'Analytics', 'Patient Portal'],
    results: [{ value: '5→1', label: 'Systems' }, { value: '2x', label: 'Efficiency' }, { value: '100%', label: 'Compliant' }, { value: '$5M+', label: 'Saved' }],
    whyChooseUs: [
      'One vendor, one contract, one support team for your entire technology stack',
      'Proven deployment methodology with zero disruption to patient care',
      'Scalable from small practices to multi-site hospital networks',
      'Average $5M+ savings in total cost of ownership over 5 years',
    ],
  },
]

/* ══════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function Projects({ onContactUs, onStartProject }: { onContactUs?: () => void; onStartProject?: () => void }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'benefits' | 'process'>('overview')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', projectType: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  /* Contact form state */
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', countryCode: '+92', service: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')
  const [toast, setToast] = useState({ show: false, title: '', message: '' })
  const closeToast = useCallback(() => setToast(t => ({ ...t, show: false })), [])

  const filtered = activeFilter === 'All' ? projects : projects.filter((p) => p.category === activeFilter)

  return (
    <>
    <section id="projects" className="py-20 md:py-32 bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-3 text-cyan-400 text-[11px] tracking-[0.28em] uppercase font-semibold mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-cyan-500 to-violet-500" />
            Portfolio
            <div className="w-8 h-px bg-gradient-to-r from-violet-500 to-cyan-500" />
          </span>

          <h2
            className="font-black leading-[0.92] tracking-tight text-white mb-4"
            style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)' }}
          >
            Powered by{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              Innovation
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            AI-driven solutions we've delivered for clients worldwide — transforming ideas into scalable, intelligent systems.
          </p>

          {/* Filter pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-xs px-4 py-2 rounded-full border transition-all duration-200 font-medium ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-500 border-transparent text-white shadow-lg shadow-cyan-500/20'
                    : 'border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Project Cards Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {filtered.map((project, i) => {
              const Icon = project.icon
              return (
                <motion.div
                  key={project.number}
                  initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.02, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 25px ${project.glowColor}`, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  onClick={() => {
                    setSelectedProject(projects.indexOf(project))
                    setActiveTab('overview')
                  }}
                  className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 ${project.borderAccent}`}
                >
                  {/* Top glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${project.glowColor}, transparent 70%)` }}
                  />

                  {/* Project Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />
                    <div
                      className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                      style={{ background: `linear-gradient(135deg, ${project.glowColor.replace('0.08', '0.25')}, transparent 60%)` }}
                    />
                    {/* Shimmer sweep on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                      <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent rotate-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    </div>
                    {/* Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] ${project.accent} uppercase tracking-[0.18em] font-semibold px-2.5 py-1 rounded-md ${project.accentBg} backdrop-blur-md border border-white/10 shadow-lg`}>
                        {project.badge}
                      </span>
                    </div>
                    {/* Number */}
                    <div className="absolute top-3 left-3">
                      <span className="text-xs text-white/40 font-mono font-bold bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">{project.number}</span>
                    </div>
                  </div>

                  <div className="relative p-5">
                    {/* Title & Tagline */}
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div
                        className={`w-10 h-10 rounded-lg ${project.accentBg} border border-white/5 flex items-center justify-center flex-shrink-0`}
                        whileHover={{ rotate: 8, scale: 1.05 }}
                      >
                        <Icon size={18} className={project.accent} />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-lg text-white leading-tight">{project.title}</h3>
                        <p className="text-slate-500 text-xs italic mt-0.5">{project.tagline}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{project.description}</p>

                    {/* Results strip */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {project.results.map((r, j) => (
                        <div key={j} className="text-center p-2 rounded-lg border border-white/[0.05] bg-white/[0.015]">
                          <div className={`text-sm font-black ${project.accent}`}>{r.value}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{r.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Benefits preview */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {project.benefits.slice(0, 2).map((b, j) => {
                        const BIcon = b.icon
                        return (
                          <div key={j} className="flex items-center gap-2 p-2 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                            <BIcon size={12} className={project.accent} />
                            <span className="text-[11px] text-slate-400 font-medium truncate">{b.title}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 text-sm font-semibold ${project.accent} group-hover:gap-3 transition-all`}>
                        Explore Project <ArrowRight size={14} />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-600">
                        <Layers size={10} />
                        {project.features.length} Features
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className="h-[2px] w-0 group-hover:w-full transition-all duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${project.glowColor.replace('0.08', '0.6')}, transparent)` }}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════
           EXPANDED PROJECT MODAL
           ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {selectedProject !== null && (() => {
            const p = projects[selectedProject]
            const PIcon = p.icon
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
                onClick={() => setSelectedProject(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative max-w-5xl w-full rounded-2xl border border-white/10 bg-slate-950/98 backdrop-blur-xl shadow-2xl overflow-hidden my-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ── Hero Image ── */}
                  <div className="relative h-72 md:h-96 overflow-hidden">
                    <motion.img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                    {/* Multi-layer gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(135deg, ${p.glowColor.replace('0.08', '0.3')}, transparent 50%)` }}
                    />
                    {/* Animated grain overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

                    {/* Close button */}
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 transition-all z-10"
                    >
                      <X size={16} />
                    </button>

                    {/* Overlay header */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          className={`w-14 h-14 rounded-xl ${p.accentBg} border border-white/10 backdrop-blur-sm flex items-center justify-center`}
                          initial={{ rotate: -10, scale: 0.8 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        >
                          <PIcon size={26} className={p.accent} />
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-white/50 font-mono">{p.number}</span>
                            <span className={`text-[10px] ${p.accent} uppercase tracking-[0.18em] font-semibold px-2.5 py-0.5 rounded-md ${p.accentBg} backdrop-blur-sm`}>
                              {p.badge}
                            </span>
                          </div>
                          <h3 className="font-bold text-2xl md:text-3xl text-white">{p.title}</h3>
                          <p className="text-white/50 text-sm italic mt-0.5">{p.tagline}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Results Strip ── */}
                  <div className="px-6 md:px-8 -mt-4 relative z-10">
                    <div className="grid grid-cols-4 gap-3">
                      {p.results.map((r, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + j * 0.06, duration: 0.3 }}
                          className="text-center p-4 rounded-xl border border-white/[0.08] bg-slate-900/80 backdrop-blur-sm"
                        >
                          <div className={`text-xl font-black ${p.accent}`}>{r.value}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-1">{r.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* ── Tab Navigation ── */}
                  <div className="px-6 md:px-8 mt-6">
                    <div className="flex gap-1 p-1 rounded-xl border border-white/[0.06] bg-white/[0.02] w-fit">
                      {([
                        { key: 'overview' as const, label: 'Overview', icon: FileText },
                        { key: 'workflow' as const, label: 'Workflow', icon: Layers },
                        { key: 'benefits' as const, label: 'Benefits', icon: Star },
                        { key: 'process' as const, label: 'How We Built It', icon: Code },
                      ]).map(tab => {
                        const TabIcon = tab.icon
                        return (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                              activeTab === tab.key
                                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-white/10'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <TabIcon size={12} />
                            <span className="hidden sm:inline">{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── Tab Content ── */}
                  <div className="px-6 md:px-8 py-6">
                    <AnimatePresence mode="wait">
                      {/* OVERVIEW TAB */}
                      {activeTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Full Description */}
                          <div className="mb-8">
                            <h4 className="text-white font-semibold text-lg mb-3">About This Project</h4>
                            <p className="text-slate-400 leading-relaxed text-[15px]">{p.fullDescription}</p>
                          </div>

                          {/* How It Helps */}
                          <div className="mb-8 p-5 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03]">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Target size={18} className="text-cyan-400" />
                              </div>
                              <h4 className="text-white font-semibold text-lg">How This Project Helps You</h4>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-[15px]">{p.howItHelps}</p>
                          </div>

                          {/* Key Features */}
                          <div className="mb-8">
                            <h4 className="text-white font-semibold text-lg mb-4">Key Features</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {p.features.map((f, j) => (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: j * 0.04, duration: 0.25 }}
                                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                                >
                                  <CheckCircle2 size={14} className={p.accent} />
                                  <span className="text-slate-300 text-sm font-medium">{f}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Why Choose Us */}
                          <div className="mb-6">
                            <h4 className="text-white font-semibold text-lg mb-4">Why Choose Techlution AI</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {p.whyChooseUs.map((reason, j) => (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 + j * 0.08, duration: 0.3 }}
                                  className="flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                                >
                                  <div className={`w-6 h-6 rounded-full ${p.accentBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <CheckCircle2 size={12} className={p.accent} />
                                  </div>
                                  <span className="text-slate-400 text-sm leading-relaxed">{reason}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* WORKFLOW TAB */}
                      {activeTab === 'workflow' && (
                        <motion.div
                          key="workflow"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="text-white font-semibold text-lg mb-2">Project Workflow</h4>
                          <p className="text-slate-500 text-sm mb-6">Step-by-step process of how this solution works end-to-end.</p>

                          <div className="space-y-4">
                            {p.workflow.map((w, j) => (
                              <motion.div
                                key={j}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.1, duration: 0.35 }}
                                className="relative flex items-start gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] group/wf hover:border-white/[0.12] transition-all"
                              >
                                {/* Step number */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${processSteps[j < 5 ? j : j % 5].color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                  <span className="text-white font-bold text-sm">{String(j + 1).padStart(2, '0')}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h5 className="text-white font-semibold text-base mb-1.5">{w.step}</h5>
                                  <p className="text-slate-400 text-sm leading-relaxed">{w.detail}</p>
                                </div>

                                {/* Connector */}
                                {j < p.workflow.length - 1 && (
                                  <div className="absolute left-[2.4rem] -bottom-3 w-px h-6 bg-gradient-to-b from-white/10 to-transparent z-10" />
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* BENEFITS TAB */}
                      {activeTab === 'benefits' && (
                        <motion.div
                          key="benefits"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="text-white font-semibold text-lg mb-2">Customer Benefits</h4>
                          <p className="text-slate-500 text-sm mb-6">How this project delivers measurable value to your business.</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {p.benefits.map((b, j) => {
                              const BIcon = b.icon
                              return (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: j * 0.1, duration: 0.35 }}
                                  className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 rounded-xl ${p.accentBg} flex items-center justify-center`}>
                                      <BIcon size={22} className={p.accent} />
                                    </div>
                                    <h5 className="text-white font-semibold text-base">{b.title}</h5>
                                  </div>
                                  <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
                                </motion.div>
                              )
                            })}
                          </div>

                          {/* How It Helps (also in benefits) */}
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="mt-6 p-5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03]"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Target size={18} className="text-emerald-400" />
                              </div>
                              <h4 className="text-white font-semibold">The Bottom Line</h4>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-sm">{p.howItHelps}</p>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* PROCESS TAB */}
                      {activeTab === 'process' && (
                        <motion.div
                          key="process"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="text-white font-semibold text-lg mb-2">How We Built It</h4>
                          <p className="text-slate-500 text-sm mb-6">Our proven 5-step development process for this project.</p>

                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                            {processSteps.map((step, j) => {
                              const SIcon = step.icon
                              return (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: j * 0.12, duration: 0.35 }}
                                  className="relative p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center"
                                >
                                  <div className="absolute -top-2 -left-1 text-[10px] font-mono text-slate-600 bg-slate-950 px-1.5 rounded">
                                    {String(j + 1).padStart(2, '0')}
                                  </div>
                                  <div className={`w-11 h-11 mx-auto rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-3 shadow-lg`}>
                                    <SIcon size={18} className="text-white" />
                                  </div>
                                  <div className="text-white text-xs font-semibold mb-2">{step.title}</div>
                                  <p className="text-slate-500 text-[11px] leading-relaxed">
                                    {p.process[j]}
                                  </p>
                                  {j < 4 && (
                                    <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-700 z-10">
                                      <ChevronRight size={12} />
                                    </div>
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>

                          {/* Why Choose Us in process tab */}
                          <div className="mt-8">
                            <h4 className="text-white font-semibold mb-4">Why Techlution AI for This Project</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {p.whyChooseUs.map((reason, j) => (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 + j * 0.08, duration: 0.3 }}
                                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                                >
                                  <div className={`w-6 h-6 rounded-full ${p.accentBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Star size={10} className={p.accent} />
                                  </div>
                                  <span className="text-slate-400 text-sm leading-relaxed">{reason}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── CTA Footer with Quick Inquiry Form ── */}
                  <div className="px-6 md:px-8 pb-6">
                    {!showForm ? (
                      <div className="flex items-center justify-between gap-3">
                        <motion.button
                          onClick={() => { setSelectedProject(null); onContactUs?.() }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-sm"
                        >
                          <MessageSquare size={14} />
                          Let's Talk
                        </motion.button>
                        <motion.button
                          onClick={() => { setSelectedProject(null); onStartProject?.() }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 inline-flex items-center justify-center gap-2 border border-orange-500/30 hover:border-orange-400/60 hover:bg-orange-500/[0.08] text-orange-400 font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                        >
                          <Rocket size={14} />
                          Start a Project
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {formSent ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] text-center"
                          >
                            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                              <CheckCircle2 size={28} className="text-emerald-400" />
                            </div>
                            <h4 className="text-white font-semibold text-lg mb-1">Message Sent!</h4>
                            <p className="text-slate-400 text-sm mb-4">We'll get back to you within 24 hours about <strong className="text-white">{p.title}</strong>.</p>
                            <button
                              onClick={() => { setShowForm(false); setFormSent(false) }}
                              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Close
                            </button>
                          </motion.div>
                        ) : (
                          <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-white font-semibold">Start a Project</h4>
                              <button
                                onClick={() => { setShowForm(false); setFormError('') }}
                                className="text-slate-500 hover:text-white transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {formError && (
                              <div className="mb-3 p-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.05] text-red-400 text-xs">
                                {formError}
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="Your Name *"
                                  value={formData.name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none transition-colors"
                                />
                              </div>
                              <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type="email"
                                  placeholder="Email Address *"
                                  value={formData.email}
                                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none transition-colors"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                              <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                  type="tel"
                                  placeholder="Contact Number *"
                                  value={formData.phone}
                                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none transition-colors"
                                />
                              </div>
                              <div className="relative">
                                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select
                                  value={formData.projectType}
                                  onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:border-cyan-500/30 focus:outline-none transition-colors appearance-none cursor-pointer"
                                >
                                  <option value="" className="bg-slate-900 text-slate-400">Project Type *</option>
                                  <option value="Website" className="bg-slate-900">Website</option>
                                  <option value="Mobile App" className="bg-slate-900">Mobile App</option>
                                  <option value="IT Support" className="bg-slate-900">IT Support</option>
                                  <option value="AI / Automation" className="bg-slate-900">AI / Automation</option>
                                  <option value="Healthcare IT" className="bg-slate-900">Healthcare IT</option>
                                  <option value="Other" className="bg-slate-900">Other</option>
                                </select>
                              </div>
                            </div>
                            <textarea
                              placeholder="Tell us about your project needs..."
                              value={formData.message}
                              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none transition-colors resize-none mb-3"
                            />
                            <motion.button
                              onClick={async () => {
                                setFormError('')
                                if (!formData.name || !formData.email || !formData.phone || !formData.projectType) {
                                  setFormError('Please fill in all required fields.')
                                  return
                                }
                                if (!/^\d{7,15}$/.test(formData.phone.replace(/[\s\-\+]/g, ''))) {
                                  setFormError('Please enter a valid phone number (7–15 digits).')
                                  return
                                }
                                if (!formData.message || formData.message.length < 10) {
                                  setFormError('Please describe your project (at least 10 characters).')
                                  return
                                }
                                setFormLoading(true)
                                try {
                                  await submitContact({
                                    name: formData.name,
                                    email: formData.email,
                                    phone: formData.phone,
                                    service: `${formData.projectType} — ${p.title}`,
                                    message: formData.message,
                                  })
                                  setFormSent(true)
                                  setFormData({ name: '', email: '', phone: '', projectType: '', message: '' })
                                  setToast({ show: true, title: 'Inquiry Sent! 🚀', message: 'Thank you for your interest. Our team will get back to you within 24 hours.' })
                                } catch {
                                  setFormError('Failed to send. Please try again or email us directly at raleem811811@gmail.com')
                                }
                                setFormLoading(false)
                              }}
                              disabled={formLoading}
                              whileHover={{ scale: formLoading ? 1 : 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold py-3 rounded-xl shadow-lg text-sm disabled:opacity-50"
                            >
                              <Send size={14} />
                              {formLoading ? 'Sending...' : 'Send Inquiry'}
                            </motion.button>
                            <p className="text-[10px] text-slate-600 text-center mt-2">⚡ Guaranteed response within 24 hours · 100% confidential</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CONTACT SECTION — merged into Projects
          ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Contact form + info ── */}
      <div id="contact" className="py-20 md:py-28 px-4 md:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left: contact details */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3
              className="font-black text-white leading-tight mb-3"
              style={{ fontSize: 'clamp(1.6rem,3.5vw,2.8rem)' }}
            >
              Contact Us
            </h3>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
              Ready to transform your business? Get in touch — free consultation. Let's build something amazing together.
            </p>

            <div className="space-y-6 mb-12">
              {[
                { icon: Phone, label: 'Call us', value: '+92 315 1664843', href: 'tel:+923151664843' },
                { icon: Mail, label: 'Email us', value: 'raleem811811@gmail.com', href: 'mailto:raleem811811@gmail.com' },
                { icon: MapPin, label: 'Location', value: 'Hostel Park Road, Islamabad', href: 'https://www.google.com/maps/search/Hostel+City+Park+Road+Islamabad' },
              ].map((info, i) => {
                const Icon = info.icon
                return (
                  <motion.a
                    key={i}
                    href={info.href}
                    target={info.href.startsWith('http') ? '_blank' : undefined}
                    rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    whileHover={{ x: 6 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors mt-0.5">
                      <Icon size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-0.5">{info.label}</div>
                      <div className="text-white font-semibold group-hover:text-orange-400 transition-colors">{info.value}</div>
                    </div>
                  </motion.a>
                )
              })}
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '100+', label: 'Projects Delivered' },
                { value: '24/7', label: 'Support Available' },
                { value: '5★', label: 'Client Rating' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="text-lg font-black bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setContactError('')
                if (!contactForm.name.trim()) {
                  setContactError('Please enter your name.')
                  return
                }
                if (!contactForm.phone.trim()) {
                  setContactError('Please enter your phone number.')
                  return
                }
                if (!/^\d{7,15}$/.test(contactForm.phone.replace(/[\s\-\+]/g, ''))) {
                  setContactError('Please enter a valid phone number (7–15 digits).')
                  return
                }
                if (!contactForm.email.trim()) {
                  setContactError('Please enter your email address.')
                  return
                }
                if (!contactForm.service) {
                  setContactError('Please select a service.')
                  return
                }
                if (!contactForm.message.trim() || contactForm.message.length < 10) {
                  setContactError('Please describe your project (at least 10 characters).')
                  return
                }
                setContactLoading(true)
                try {
                  await submitContact({
                    name: contactForm.name,
                    email: contactForm.email || undefined,
                    phone: `${contactForm.countryCode} ${contactForm.phone}`,
                    service: contactForm.service,
                    message: contactForm.message,
                  })
                  setContactSent(true)
                  setContactForm({ name: '', email: '', phone: '', countryCode: '+92', service: '', message: '' })
                  setToast({ show: true, title: 'Message Sent! ✉️', message: 'Thank you for contacting Techlution AI. Our team will respond within 24 hours.' })
                  setTimeout(() => setContactSent(false), 4000)
                } catch {
                  setContactError('Failed to send. Please email us at raleem811811@gmail.com')
                }
                setContactLoading(false)
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="John Smith"
                    className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Phone Number <span className="text-red-400">*</span></label>
                  <div className="flex gap-2">
                    <select
                      value={contactForm.countryCode}
                      onChange={(e) => setContactForm(f => ({ ...f, countryCode: e.target.value }))}
                      className="w-24 bg-slate-900 border border-white/8 text-slate-300 rounded-xl px-2 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                    >
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+86">🇨🇳 +86</option>
                    </select>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(f => ({ ...f, phone: e.target.value }))}
                      required
                      placeholder="315 1664843"
                      className="flex-1 bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="john@company.com"
                  className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Service Needed <span className="text-red-400">*</span></label>
                <select
                  value={contactForm.service}
                  onChange={(e) => setContactForm(f => ({ ...f, service: e.target.value }))}
                  className="w-full bg-slate-900 border border-white/8 text-slate-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all"
                >
                  <option value="">Select a service...</option>
                  <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Automation & Integration">Automation &amp; Integration</option>
                  <option value="Healthcare AI">Healthcare AI</option>
                  <option value="DevOps & Cloud">DevOps &amp; Cloud</option>
                  <option value="Web & App Development">Web &amp; App Development</option>
                  <option value="AI Voice Agents">AI Voice Agents</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-slate-500 mb-2">Project Details <span className="text-red-400">*</span></label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                  required
                  rows={5}
                  placeholder="Tell us about your project, goals, and timeline..."
                  className="w-full bg-slate-900 border border-white/8 text-white rounded-xl px-4 py-3.5 text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/15 transition-all resize-none"
                />
              </div>

              {contactError && <p className="text-red-400 text-xs">{contactError}</p>}

              <motion.button
                type="submit"
                disabled={contactLoading}
                whileHover={{ scale: contactLoading ? 1 : 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-4 text-base justify-center disabled:opacity-50"
              >
                {contactSent ? 'Message Sent Successfully!' : contactLoading ? 'Sending...' : (<>Contact Us <Send size={16} /></>)}
              </motion.button>

              <p className="text-center text-[11px] text-slate-600">
                🔒 100% Confidential · ⚡ Reply Within 24 Hours · 🚀 100+ Projects Delivered
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
    <Toast show={toast.show} title={toast.title} message={toast.message} onClose={closeToast} />
    </>
  )
}
