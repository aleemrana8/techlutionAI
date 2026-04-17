import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Eye, Zap, Heart, Cloud, Database, CheckCircle2, ArrowRight, X, Globe, Smartphone, ShieldCheck, Headphones, Code2, BarChart3, Box, GraduationCap, ShoppingCart, Megaphone, Fingerprint, Rocket, TrendingUp, Users, Timer, Shield, Target, Gauge, Star, MessageCircle } from 'lucide-react'

const svcIsMobile = typeof window !== 'undefined' && window.innerWidth < 768

interface ServiceItem {
  number: string; title: string; category: string; icon: typeof Brain
  accent: string; accentBg: string; borderAccent: string; glowColor: string
  description: string; features: string[]; techStack: string[]
  highlights: [string, string, string]
}

const services: ServiceItem[] = [
  {
    number: '01',
    title: 'AI & Machine Learning',
    category: 'AI & ML',
    icon: Brain,
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    borderAccent: 'hover:border-cyan-500/30',
    glowColor: 'rgba(6,182,212,0.08)',
    description:
      'Deploy enterprise-grade AI solutions trained on your data. From large language models and RAG systems to custom AI agents — we build intelligent automation tailored to your exact business needs.',
    features: [
      'Custom LLM Integration & Fine-tuning',
      'RAG (Retrieval-Augmented Generation) Systems',
      'AI Agents & Intelligent Automation',
      'Prompt Engineering & Optimization',
      'Natural Language Processing',
      'ML Model Development & Deployment',
    ],
    techStack: ['OpenAI / GPT-4', 'Python', 'LangChain', 'HuggingFace', 'TensorFlow', 'PyTorch', 'FAISS', 'Pinecone', 'FastAPI', 'Llama', 'Mistral', 'scikit-learn', 'Keras', 'MLflow'],
    highlights: ['95% Accuracy', '3x Faster Output', '50+ Models Deployed'],
  },
  {
    number: '02',
    title: 'Computer Vision',
    category: 'Vision AI',
    icon: Eye,
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500/10',
    borderAccent: 'hover:border-violet-500/30',
    glowColor: 'rgba(139,92,246,0.08)',
    description:
      'Extract intelligence from visual data with advanced computer vision solutions — from medical imaging analysis and OCR to real-time object detection and quality control systems.',
    features: [
      'OCR & Document Processing',
      'Medical Imaging Analysis',
      'Object Detection & Recognition',
      'Real-time Video Analytics',
      'Quality Control Automation',
      'Visual Inspection Systems',
    ],
    techStack: ['OpenCV', 'PyTorch', 'YOLOv8', 'Tesseract OCR', 'MediaPipe', 'EasyOCR', 'FaceNet', 'scikit-image', 'TensorFlow Lite', 'ONNX', 'Detectron2', 'Google Vision API'],
    highlights: ['99.2% Detection', 'Real-time Processing', 'Edge Optimized'],
  },
  {
    number: '03',
    title: 'Automation & Integration',
    category: 'Automation',
    icon: Zap,
    accent: 'text-orange-400',
    accentBg: 'bg-orange-500/10',
    borderAccent: 'hover:border-orange-500/30',
    glowColor: 'rgba(249,115,22,0.08)',
    description:
      'Eliminate manual workflows and connect your entire tech stack. We build seamless automation pipelines using n8n, APIs, and webhooks that save time, reduce errors, and maximize efficiency.',
    features: [
      'n8n Workflow Automation',
      'API Integration & Development',
      'Webhook & Event-driven Systems',
      'RPA (Robotic Process Automation)',
      'Cross-platform Data Sync',
      'Business Process Optimization',
    ],
    techStack: ['n8n', 'Zapier', 'Make (Integromat)', 'REST APIs', 'Webhooks', 'Apache Kafka', 'RabbitMQ', 'Playwright', 'Selenium', 'Power Automate', 'UiPath', 'Celery'],
    highlights: ['80% Time Saved', '500+ Workflows', 'Zero Downtime'],
  },
  {
    number: '04',
    title: 'Healthcare AI Solutions',
    category: 'Healthcare',
    icon: Heart,
    accent: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    borderAccent: 'hover:border-rose-500/30',
    glowColor: 'rgba(244,63,94,0.08)',
    description:
      'Transform healthcare operations with intelligent automation. From billing and claims to clinical workflows — HIPAA-compliant solutions that reduce cost and improve patient outcomes.',
    features: [
      'Medical Billing Automation (RCM)',
      'Clinical Workflow Optimization',
      'EHR/EMR System Development',
      'HIPAA-Compliant Solutions',
      'HL7 & FHIR Integration',
      'Denial Management Automation',
    ],
    techStack: ['HL7 / FHIR', 'Epic API', 'ICD-10 / CPT', 'EDI 837P', 'Python', 'FastAPI', 'PostgreSQL', 'Azure HIPAA', 'ClinicalNLP', 'DICOM', 'Cerner', 'Athenahealth API'],
    highlights: ['HIPAA Compliant', '40% Cost Reduction', '99.9% Uptime'],
  },
  {
    number: '05',
    title: 'DevOps & Cloud Infrastructure',
    category: 'Cloud',
    icon: Cloud,
    accent: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    borderAccent: 'hover:border-sky-500/30',
    glowColor: 'rgba(14,165,233,0.08)',
    description:
      'Build scalable, reliable infrastructure with modern cloud technologies. CI/CD pipelines, containerisation, and cloud-native solutions for robust, zero-downtime deployments.',
    features: [
      'Azure Cloud Solutions',
      'Docker & Kubernetes',
      'CI/CD Pipeline Setup',
      'Infrastructure as Code (IaC)',
      'Performance Monitoring',
      'Security & Compliance',
    ],
    techStack: ['Microsoft Azure', 'AWS', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Jenkins', 'Ansible', 'Prometheus', 'Grafana', 'Nginx', 'Linux'],
    highlights: ['99.99% Uptime', 'Auto-scaling', '10x Deploy Speed'],
  },
  {
    number: '06',
    title: 'Data Pipelines & Analytics',
    category: 'Data',
    icon: Database,
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    borderAccent: 'hover:border-emerald-500/30',
    glowColor: 'rgba(16,185,129,0.08)',
    description:
      'Turn raw data into actionable insights. We build robust ETL pipelines, data warehouses, and analytics platforms that power data-driven decision-making across your organisation.',
    features: [
      'ETL Pipeline Development',
      'Web Scraping & Data Collection',
      'Real-time Data Streaming',
      'Data Warehouse Design',
      'Business Intelligence Dashboards',
      'Data Quality & Governance',
    ],
    techStack: ['Apache Airflow', 'Apache Spark', 'Pandas', 'NumPy', 'PostgreSQL', 'MongoDB', 'Redis', 'Scrapy', 'BeautifulSoup', 'Snowflake', 'BigQuery', 'dbt', 'Kafka'],
    highlights: ['1M+ Records/sec', 'Real-time Streams', 'Data Accuracy 99%'],
  },
  {
    number: '07',
    title: 'Web Development',
    category: 'Websites',
    icon: Globe,
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/10',
    borderAccent: 'hover:border-blue-500/30',
    glowColor: 'rgba(59,130,246,0.08)',
    description:
      'Build stunning, high-performance websites and web applications. From corporate sites and landing pages to complex SaaS platforms — responsive, SEO-optimised, and lightning fast.',
    features: [
      'React, Next.js & Vue.js',
      'Full-Stack Web Applications',
      'E-commerce & SaaS Platforms',
      'SEO & Performance Optimization',
      'Progressive Web Apps (PWA)',
      'CMS & Admin Dashboards',
    ],
    techStack: ['React', 'Next.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'WordPress', 'Webflow', 'Vercel', 'Netlify', 'GraphQL', 'Prisma'],
    highlights: ['100 PageSpeed', 'SEO Optimized', 'Pixel Perfect'],
  },
  {
    number: '08',
    title: 'Mobile App Development',
    category: 'Apps',
    icon: Smartphone,
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    borderAccent: 'hover:border-indigo-500/30',
    glowColor: 'rgba(99,102,241,0.08)',
    description:
      'Create cross-platform and native mobile applications for iOS & Android. Elegant UI, smooth UX, and powerful backend integration — apps your users will love.',
    features: [
      'React Native & Flutter',
      'iOS & Android Native Apps',
      'UI/UX Design & Prototyping',
      'Push Notifications & Real-time',
      'App Store Deployment',
      'Offline-first Architecture',
    ],
    techStack: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Firebase', 'Supabase', 'RevenueCat', 'Figma', 'App Store Connect', 'Google Play Console', 'Fastlane'],
    highlights: ['iOS & Android', '4.8★ Avg Rating', '60fps Smooth'],
  },
  {
    number: '09',
    title: 'Cybersecurity Solutions',
    category: 'Security',
    icon: ShieldCheck,
    accent: 'text-red-400',
    accentBg: 'bg-red-500/10',
    borderAccent: 'hover:border-red-500/30',
    glowColor: 'rgba(239,68,68,0.08)',
    description:
      'Protect your business with enterprise-grade cybersecurity. We implement robust security frameworks, penetration testing, and compliance audits to keep your data and systems safe.',
    features: [
      'Penetration Testing & Audits',
      'SIEM & Threat Monitoring',
      'Zero Trust Architecture',
      'GDPR & SOC 2 Compliance',
      'Vulnerability Assessment',
      'Incident Response Planning',
    ],
    techStack: ['Nessus', 'Burp Suite', 'Metasploit', 'OWASP ZAP', 'Splunk', 'CrowdStrike', 'Cloudflare', 'Snyk', 'SonarQube', 'Wireshark', 'HashiCorp Vault', 'AWS Shield'],
    highlights: ['Zero Breaches', 'SOC 2 Ready', '24/7 Monitoring'],
  },
  {
    number: '10',
    title: 'IT Consulting & Strategy',
    category: 'Consulting',
    icon: Headphones,
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    borderAccent: 'hover:border-amber-500/30',
    glowColor: 'rgba(245,158,11,0.08)',
    description:
      'Expert IT consulting to align technology with your business goals. Digital transformation roadmaps, tech stack selection, and hands-on guidance from experienced architects.',
    features: [
      'Digital Transformation Strategy',
      'Technology Stack Assessment',
      'Architecture & System Design',
      'IT Infrastructure Planning',
      'Vendor Selection & Management',
      'Technical Due Diligence',
    ],
    techStack: ['Jira', 'Confluence', 'Notion', 'Miro', 'Lucidchart', 'Slack', 'Microsoft Teams', 'Google Workspace', 'Asana', 'Monday.com', 'Figma', 'Draw.io'],
    highlights: ['5+ Yrs Experience', 'Fortune 500 Clients', 'ROI Focused'],
  },
  {
    number: '11',
    title: 'Custom Software Development',
    category: 'Software',
    icon: Code2,
    accent: 'text-teal-400',
    accentBg: 'bg-teal-500/10',
    borderAccent: 'hover:border-teal-500/30',
    glowColor: 'rgba(20,184,166,0.08)',
    description:
      'Bespoke software solutions built from scratch for your unique business requirements. Enterprise ERP, CRM, inventory systems, and tailor-made tools that fit like a glove.',
    features: [
      'Enterprise ERP & CRM Systems',
      'Inventory & POS Systems',
      'Booking & Scheduling Platforms',
      'Custom API Development',
      'Legacy System Modernisation',
      'Microservices Architecture',
    ],
    techStack: ['Node.js', 'Python', 'Java', '.NET', 'Go', 'PostgreSQL', 'MySQL', 'Redis', 'RabbitMQ', 'gRPC', 'Prisma', 'TypeORM', 'Docker'],
    highlights: ['Enterprise Grade', 'Scalable Architecture', 'Clean Code'],
  },
  {
    number: '12',
    title: 'E-Commerce Solutions',
    category: 'E-Commerce',
    icon: ShoppingCart,
    accent: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    borderAccent: 'hover:border-pink-500/30',
    glowColor: 'rgba(236,72,153,0.08)',
    description:
      'Launch and scale your online store with powerful e-commerce platforms. Multi-vendor marketplaces, payment integrations, and AI-powered product recommendations worldwide.',
    features: [
      'Shopify, WooCommerce & Custom',
      'Multi-vendor Marketplaces',
      'Payment Gateway Integration',
      'AI Product Recommendations',
      'Order & Inventory Management',
      'Global Shipping & Tax Setup',
    ],
    techStack: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'Razorpay', 'Medusa.js', 'Saleor', 'Algolia', 'Magento', 'BigCommerce', 'Square', 'Printful API'],
    highlights: ['3x Conversions', 'Multi-currency', 'Global Shipping'],
  },
  {
    number: '13',
    title: 'Digital Marketing & SEO',
    category: 'Marketing',
    icon: Megaphone,
    accent: 'text-lime-400',
    accentBg: 'bg-lime-500/10',
    borderAccent: 'hover:border-lime-500/30',
    glowColor: 'rgba(132,204,22,0.08)',
    description:
      'Grow your digital presence with data-driven marketing strategies. SEO, paid ads, social media campaigns, and content marketing that drive traffic, leads, and conversions.',
    features: [
      'Search Engine Optimization (SEO)',
      'Google & Meta Ads Management',
      'Social Media Marketing',
      'Content Strategy & Copywriting',
      'Email Marketing Automation',
      'Analytics & Conversion Tracking',
    ],
    techStack: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEMrush', 'Ahrefs', 'Mailchimp', 'HubSpot', 'Hootsuite', 'Canva', 'Buffer', 'Hotjar', 'Google Tag Manager'],
    highlights: ['300% ROI Avg', 'Page 1 Rankings', 'Data-driven'],
  },
  {
    number: '14',
    title: 'Blockchain & Web3',
    category: 'Web3',
    icon: Box,
    accent: 'text-purple-400',
    accentBg: 'bg-purple-500/10',
    borderAccent: 'hover:border-purple-500/30',
    glowColor: 'rgba(168,85,247,0.08)',
    description:
      'Build decentralized applications, smart contracts, and blockchain-powered solutions. From DeFi platforms to NFT marketplaces and tokenization — we bring Web3 to your business.',
    features: [
      'Smart Contract Development',
      'DeFi & DApp Platforms',
      'NFT Marketplace Development',
      'Token & Crypto Integration',
      'Blockchain Consulting',
      'Wallet & Payment Solutions',
    ],
    techStack: ['Solidity', 'Ethereum', 'Polygon', 'Hardhat', 'Web3.js', 'Ethers.js', 'IPFS', 'Moralis', 'Alchemy', 'OpenZeppelin', 'Chainlink', 'Solana'],
    highlights: ['Audit Certified', 'Gas Optimized', 'Multi-chain'],
  },
  {
    number: '15',
    title: 'AI-Powered Education Tech',
    category: 'EdTech',
    icon: GraduationCap,
    accent: 'text-yellow-400',
    accentBg: 'bg-yellow-500/10',
    borderAccent: 'hover:border-yellow-500/30',
    glowColor: 'rgba(234,179,8,0.08)',
    description:
      'Revolutionize learning with AI-driven education platforms. LMS, e-learning portals, adaptive tutoring, and virtual classroom solutions for schools, universities, and corporates.',
    features: [
      'Learning Management Systems (LMS)',
      'AI Adaptive Tutoring',
      'Virtual Classroom Platforms',
      'Course & Content Management',
      'Student Analytics & Reporting',
      'Gamification & Engagement Tools',
    ],
    techStack: ['Moodle', 'Canvas LMS', 'React', 'Firebase', 'OpenAI', 'WebRTC', 'Socket.io', 'Zoom SDK', 'Stripe', 'Google Classroom API', 'Articulate 360', 'xAPI'],
    highlights: ['10K+ Students', 'AI Adaptive', 'Gamified'],
  },
  {
    number: '16',
    title: 'Biometrics & Identity',
    category: 'Identity',
    icon: Fingerprint,
    accent: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-500/10',
    borderAccent: 'hover:border-fuchsia-500/30',
    glowColor: 'rgba(217,70,239,0.08)',
    description:
      'Implement secure biometric and identity verification systems. Face recognition, fingerprint scanning, KYC/AML compliance, and multi-factor authentication for any industry.',
    features: [
      'Face Recognition Systems',
      'Fingerprint & Iris Scanning',
      'KYC/AML Verification',
      'Multi-Factor Authentication',
      'Document Verification AI',
      'Access Control Systems',
    ],
    techStack: ['AWS Rekognition', 'Azure Face API', 'Jumio', 'Onfido', 'OpenCV', 'DeepFace', 'Auth0', 'Okta', 'FaceNet', 'Twilio Verify', 'Google reCAPTCHA', 'NIST Standards'],
    highlights: ['99.7% Accuracy', 'Sub-second Verify', 'NIST Compliant'],
  },
  {
    number: '17',
    title: 'MVP & Startup Solutions',
    category: 'Startups',
    icon: Rocket,
    accent: 'text-orange-300',
    accentBg: 'bg-orange-400/10',
    borderAccent: 'hover:border-orange-400/30',
    glowColor: 'rgba(251,146,60,0.08)',
    description:
      'Launch your startup idea fast with our MVP development service. Rapid prototyping, investor-ready demos, and scalable architecture — from concept to market in weeks, not months.',
    features: [
      'Rapid MVP Development',
      'Product Design & Prototyping',
      'Investor Pitch Deck Support',
      'Scalable Architecture Design',
      'Growth Hacking Strategies',
      'Technical Co-founder Services',
    ],
    techStack: ['React', 'Next.js', 'Node.js', 'Firebase', 'Supabase', 'Vercel', 'Figma', 'Stripe', 'AWS', 'PostgreSQL', 'Tailwind CSS', 'GitHub'],
    highlights: ['2-4 Week MVP', 'Investor Ready', 'Scalable from Day 1'],
  },
  {
    number: '18',
    title: 'Business Intelligence & Reporting',
    category: 'BI',
    icon: BarChart3,
    accent: 'text-cyan-300',
    accentBg: 'bg-cyan-400/10',
    borderAccent: 'hover:border-cyan-400/30',
    glowColor: 'rgba(34,211,238,0.08)',
    description:
      'Transform your data into interactive dashboards and real-time reports. Power BI, Tableau, and custom analytics that give leadership the insights to make smarter decisions.',
    features: [
      'Power BI & Tableau Dashboards',
      'Custom Analytics Platforms',
      'Real-time KPI Monitoring',
      'Automated Report Generation',
      'Predictive Analytics',
      'Data Visualization Design',
    ],
    techStack: ['Power BI', 'Tableau', 'Metabase', 'Apache Superset', 'Looker', 'D3.js', 'Plotly', 'Python', 'SQL', 'Snowflake', 'Google Data Studio', 'Grafana'],
    highlights: ['Live Dashboards', 'Predictive Insights', 'Auto Reports'],
  },
]

export default function Services({ onStartProject, onContactUs }: { onStartProject?: () => void; onContactUs?: () => void }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <section id="services" className="py-20 md:py-32 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30, ...(svcIsMobile ? {} : { filter: 'blur(6px)' }) }}
          whileInView={{ opacity: 1, y: 0, ...(svcIsMobile ? {} : { filter: 'blur(0px)' }) }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-3 text-cyan-400 text-xs sm:text-[11px] tracking-[0.28em] uppercase font-semibold mb-4">
            <div className="w-8 h-px bg-gradient-to-r from-cyan-500 to-violet-500" />
            Our Expertise
            <div className="w-8 h-px bg-gradient-to-r from-violet-500 to-cyan-500" />
          </span>

          <h2
            className="font-black leading-[0.92] tracking-tight text-white mb-4"
            style={{ fontSize: 'clamp(2.2rem,6vw,4.5rem)' }}
          >
            Solutions by{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              Techlution
            </span>{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              AI
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
            From concept to deployment — Techlution AI delivers end-to-end IT solutions across AI, cloud, web, mobile, and enterprise automation.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => {
            const Icon = svc.icon
            const isExpanded = expandedIdx === i

            return (
              <motion.div
                key={svc.number}
                initial={{ opacity: 0, y: 30, ...(svcIsMobile ? {} : { filter: 'blur(4px)' }) }}
                whileInView={{ opacity: 1, y: 0, ...(svcIsMobile ? {} : { filter: 'blur(0px)' }) }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02, boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${svc.glowColor}`, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] md:backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 ${svc.borderAccent}`}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
              >
                {/* Top glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${svc.glowColor}, transparent 70%)`,
                  }}
                />

                {/* Card content */}
                <div className="relative p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      className={`w-12 h-12 rounded-xl ${svc.accentBg} border border-white/5 flex items-center justify-center`}
                      whileHover={{ rotate: 8, scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon size={22} className={svc.accent} />
                    </motion.div>
                    <span className="text-xs sm:text-[10px] text-slate-600 font-mono tracking-wider mt-1">
                      {svc.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold text-lg text-white mb-2 group-hover:${svc.accent.replace('text-', 'text-')} transition-colors`}>
                    {svc.title}
                  </h3>

                  {/* Category badge */}
                  <span className={`inline-block text-xs sm:text-[10px] ${svc.accent} uppercase tracking-[0.18em] font-semibold mb-4 px-2.5 py-1 rounded-md ${svc.accentBg}`}>
                    {svc.category}
                  </span>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-3">
                    {svc.description}
                  </p>

                  {/* Feature preview — first 3 */}
                  <div className="space-y-2 mb-4">
                    {svc.features.slice(0, 3).map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-slate-500 text-xs">
                        <CheckCircle2 size={12} className={`${svc.accent} flex-shrink-0`} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Service highlights */}
                  <div className="flex items-center gap-3 mb-4 py-3 px-3 rounded-xl border border-white/[0.05] bg-white/[0.015]">
                    {svc.highlights.map((h, hi) => (
                      <div key={hi} className="flex items-center gap-1.5">
                        {hi === 0 && <TrendingUp size={10} className={svc.accent} />}
                        {hi === 1 && <Gauge size={10} className={svc.accent} />}
                        {hi === 2 && <Star size={10} className={svc.accent} />}
                        <span className="text-xs sm:text-[10px] text-slate-400 font-semibold">{h}</span>
                        {hi < 2 && <div className="w-px h-3 bg-white/10 ml-1.5" />}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 text-sm font-semibold ${svc.accent} group-hover:gap-3 transition-all`}>
                    Learn more <ArrowRight size={14} />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="h-[2px] w-0 group-hover:w-full transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${svc.glowColor.replace('0.08', '0.6')}, transparent)`,
                  }}
                />
              </motion.div>
            )
          })}
        </div>

        {/* Expanded modal overlay */}
        <AnimatePresence>
          {expandedIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 md:backdrop-blur-sm"
              onClick={() => setExpandedIdx(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative max-w-2xl w-full rounded-2xl border border-white/10 bg-slate-950/[0.98] md:bg-slate-950/95 md:backdrop-blur-xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${services[expandedIdx].glowColor}, transparent 70%)`,
                  }}
                />

                <div className="relative p-8">
                  {/* Close button */}
                  <button
                    onClick={() => setExpandedIdx(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
                  >
                    <X size={16} />
                  </button>

                  {/* Icon + Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-xl ${services[expandedIdx].accentBg} border border-white/5 flex items-center justify-center`}>
                      {(() => { const Icon = services[expandedIdx].icon; return <Icon size={26} className={services[expandedIdx].accent} /> })()}
                    </div>
                    <div>
                      <span className="text-xs sm:text-[10px] text-slate-600 font-mono tracking-wider">{services[expandedIdx].number}</span>
                      <h3 className="font-bold text-2xl text-white">{services[expandedIdx].title}</h3>
                    </div>
                  </div>

                  {/* Category */}
                  <span className={`inline-block text-xs sm:text-[10px] ${services[expandedIdx].accent} uppercase tracking-[0.18em] font-semibold mb-5 px-3 py-1 rounded-md ${services[expandedIdx].accentBg}`}>
                    {services[expandedIdx].category}
                  </span>

                  {/* Description */}
                  <p className="text-slate-400 leading-relaxed mb-8">
                    {services[expandedIdx].description}
                  </p>

                  {/* Features grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {services[expandedIdx].features.map((f, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: j * 0.05, duration: 0.3 }}
                        className="flex items-center gap-2.5 text-slate-300 text-sm"
                      >
                        <CheckCircle2 size={14} className={`${services[expandedIdx].accent} flex-shrink-0`} />
                        {f}
                      </motion.div>
                    ))}
                  </div>

                  {/* Success metrics */}
                  <div className="mb-8 grid grid-cols-4 gap-2">
                    {[
                      { value: '100+',  label: 'Projects',  color: services[expandedIdx].accent },
                      { value: '99%',   label: 'Uptime',    color: 'text-emerald-400' },
                      { value: '24/7',  label: 'Support',   color: 'text-amber-400' },
                      { value: '5★',    label: 'Rated',     color: 'text-violet-400' },
                    ].map((stat, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + j * 0.08, duration: 0.3 }}
                        className="text-center p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                      >
                        <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs sm:text-[10px] text-slate-500 font-medium mt-0.5">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between gap-3">
                    <motion.button
                      onClick={() => { setExpandedIdx(null); onStartProject?.() }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-sm"
                    >
                      Start a Project <ArrowRight size={14} />
                    </motion.button>
                    <motion.button
                      onClick={() => { setExpandedIdx(null); onContactUs?.() }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-orange-500/30 hover:border-orange-400/60 hover:bg-orange-500/[0.08] text-orange-400 font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                    >
                      <MessageCircle size={14} /> Let's Talk
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
