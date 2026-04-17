import { PrismaClient, Role, ProjectCategory, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Admin User ──────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techlution.ai' },
    update: {},
    create: {
      email: 'admin@techlution.ai',
      password: adminPassword,
      name: 'Rana Muhammad Aleem Akhtar',
      role: Role.ADMIN,
    },
  })
  console.log(`  ✅ Admin user: ${admin.email}`)

  // ─── Staff User ──────────────────────────────────────────────────────
  const staffPassword = await bcrypt.hash('Staff@123456', 12)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@techlution.ai' },
    update: {},
    create: {
      email: 'staff@techlution.ai',
      password: staffPassword,
      name: 'Techlution AI Staff',
      role: Role.STAFF,
    },
  })
  console.log(`  ✅ Staff user: ${staff.email}`)

  // ─── Sample Projects ─────────────────────────────────────────────────
  const projects = [
    {
      title: 'MedFlow AI – Intelligent RCM Platform',
      slug: 'medflow-ai-intelligent-rcm-platform',
      shortDescription: 'AI-powered Revenue Cycle Management system that automates medical billing, coding, and denial management.',
      fullDescription: 'MedFlow AI is a comprehensive healthcare RCM platform that leverages artificial intelligence to streamline the entire revenue cycle. From automated charge capture and ICD/CPT coding to intelligent denial prediction and appeals management, MedFlow AI reduces claim denials by 65% and accelerates payment collection by 40%. Built with HIPAA compliance at its core, the platform integrates seamlessly with existing EHR systems via HL7/FHIR standards.',
      category: ProjectCategory.HEALTHCARE,
      features: [
        'AI-powered ICD/CPT auto-coding',
        'Real-time claim scrubbing & validation',
        'Intelligent denial prediction engine',
        'Automated EOB posting',
        'Patient eligibility verification',
        'Custom analytics dashboards',
      ],
      workflowSteps: [
        { step: 1, title: 'Patient Registration', description: 'Capture demographics and insurance info with eligibility verification.' },
        { step: 2, title: 'Charge Capture', description: 'Automated code suggestion from clinical notes using NLP.' },
        { step: 3, title: 'Claim Submission', description: 'EDI 837 generation with pre-submission scrubbing.' },
        { step: 4, title: 'Payment Posting', description: 'Automated ERA/EOB processing and reconciliation.' },
        { step: 5, title: 'Denial Management', description: 'AI-driven root cause analysis and automated appeals.' },
        { step: 6, title: 'Reporting', description: 'Real-time KPI dashboards and financial analytics.' },
      ],
      benefits: [
        '65% reduction in claim denials',
        '40% faster payment collection',
        'HIPAA-compliant architecture',
        '$2.5M+ recovered in denied claims annually',
        'Seamless EHR integration',
      ],
      images: [],
      status: ProjectStatus.ACTIVE,
      tags: ['Healthcare', 'RCM', 'AI', 'Medical Billing'],
      techStack: ['Python', 'FastAPI', 'PostgreSQL', 'HL7/FHIR', 'React', 'Azure'],
      durationWeeks: 16,
      createdById: admin.id,
    },
    {
      title: 'AutoPilot – Enterprise Workflow Automation',
      slug: 'autopilot-enterprise-workflow-automation',
      shortDescription: 'End-to-end business process automation platform with AI-driven orchestration.',
      fullDescription: 'AutoPilot transforms complex business processes into automated, intelligent workflows. From document processing and data extraction to multi-system integration and decision automation, AutoPilot handles thousands of tasks daily with zero human intervention. The platform supports RPA bots, API orchestration, scheduled jobs, and event-driven triggers with comprehensive audit logging.',
      category: ProjectCategory.AUTOMATION,
      features: [
        'Visual workflow designer',
        'RPA bot integration',
        'Document AI & OCR processing',
        'Multi-system API orchestration',
        'Event-driven & scheduled triggers',
        'Real-time monitoring & alerting',
      ],
      workflowSteps: [
        { step: 1, title: 'Process Discovery', description: 'Identify and map current manual processes.' },
        { step: 2, title: 'Workflow Design', description: 'Build automation flows with visual drag-and-drop editor.' },
        { step: 3, title: 'Integration Setup', description: 'Connect to ERPs, CRMs, databases, and APIs.' },
        { step: 4, title: 'Testing & Validation', description: 'Parallel testing with production safeguards.' },
        { step: 5, title: 'Deployment', description: 'Gradual rollout with fallback mechanisms.' },
        { step: 6, title: 'Monitoring', description: 'Live dashboards tracking execution and SLAs.' },
      ],
      benefits: [
        '80% reduction in manual processing',
        '99.9% accuracy in data handling',
        'ROI within 3 months',
        'Scalable to 100K+ daily tasks',
        'Complete audit trail',
      ],
      images: [],
      status: ProjectStatus.ACTIVE,
      tags: ['Automation', 'RPA', 'Enterprise', 'Workflow'],
      techStack: ['Node.js', 'n8n', 'Redis', 'PostgreSQL', 'Docker', 'React'],
      durationWeeks: 12,
      createdById: admin.id,
    },
    {
      title: 'VisionGuard – AI Computer Vision Security',
      slug: 'visionguard-ai-computer-vision-security',
      shortDescription: 'Real-time AI-powered surveillance and threat detection system using computer vision.',
      fullDescription: 'VisionGuard uses state-of-the-art deep learning models to provide real-time threat detection, anomaly recognition, and automated alerting from CCTV and IP camera feeds. Supporting person re-identification, weapon detection, crowd analysis, and zone intrusion alerts, VisionGuard transforms passive surveillance into proactive security management.',
      category: ProjectCategory.COMPUTER_VISION,
      features: [
        'Real-time object & threat detection',
        'Person re-identification across cameras',
        'Weapon & anomaly detection',
        'Crowd density analysis',
        'Zone intrusion alerts',
        'Cloud & edge deployment',
      ],
      workflowSteps: [
        { step: 1, title: 'Camera Integration', description: 'Connect IP cameras and RTSP streams.' },
        { step: 2, title: 'Model Training', description: 'Fine-tune detection models on domain-specific data.' },
        { step: 3, title: 'Pipeline Setup', description: 'Build real-time inference pipeline with GPU acceleration.' },
        { step: 4, title: 'Alert Configuration', description: 'Define rules, zones, and notification channels.' },
        { step: 5, title: 'Dashboard Deploy', description: 'Live monitoring interface with replay capabilities.' },
        { step: 6, title: 'Optimization', description: 'Performance tuning for latency and accuracy.' },
      ],
      benefits: [
        'Sub-second threat detection',
        '95%+ detection accuracy',
        '24/7 automated monitoring',
        'Reduces security personnel costs by 60%',
        'Edge deployment for offline sites',
      ],
      images: [],
      status: ProjectStatus.ACTIVE,
      tags: ['Computer Vision', 'AI', 'Security', 'Deep Learning'],
      techStack: ['Python', 'PyTorch', 'OpenCV', 'TensorRT', 'FastAPI', 'React'],
      durationWeeks: 14,
      createdById: admin.id,
    },
  ]

  for (const proj of projects) {
    const existing = await prisma.project.findUnique({ where: { slug: proj.slug } })
    if (!existing) {
      await prisma.project.create({ data: proj })
      console.log(`  ✅ Project: ${proj.title}`)
    } else {
      console.log(`  ⏭️  Project exists: ${proj.title}`)
    }
  }

  // ─── Sample Patient ──────────────────────────────────────────────────
  const patient = await prisma.patient.upsert({
    where: { medicalRecordNumber: 'MRN-001' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'Male',
      phone: '+1-555-0100',
      email: 'john.doe@example.com',
      address: '123 Health St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      medicalRecordNumber: 'MRN-001',
      insuranceProvider: 'Blue Cross',
      insuranceId: 'INS-12345',
      groupNumber: 'GRP-001',
      memberId: 'MBR-001',
    },
  })
  console.log(`  ✅ Sample patient: ${patient.firstName} ${patient.lastName}`)

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
