import OpenAI from 'openai'
import logger from '../utils/logger'

interface GenerateProjectInput {
  title: string
  category: string
}

export interface GeneratedProject {
  description: string
  features: string[]
  workflowSteps: { step: number; title: string; description: string }[]
  benefits: string[]
  techStack: string[]
  tags: string[]
}

// Mock data when OpenAI key is unavailable
function mockGenerate(input: GenerateProjectInput): GeneratedProject {
  const cat = input.category.toUpperCase()
  return {
    description: `${input.title} is a cutting-edge ${input.category} solution built by Techlution AI. ` +
      `Leveraging state-of-the-art AI models, it automates complex workflows, reduces operational ` +
      `overhead, and delivers measurable ROI. The system is HIPAA-compliant, cloud-native, and ` +
      `designed for enterprise scalability.`,
    features: [
      'Real-time AI inference engine',
      'Secure, role-based access control',
      'RESTful + WebSocket API layer',
      'Automated reporting & dashboards',
      'Multi-tenant support',
      'Audit logging & compliance',
    ],
    workflowSteps: [
      { step: 1, title: 'Discovery & Requirements', description: 'Deep-dive into business requirements and data landscape.' },
      { step: 2, title: 'Data Pipeline Setup',      description: 'ETL pipelines ingesting structured and unstructured data sources.' },
      { step: 3, title: 'Model Training',           description: 'Train and evaluate AI/ML models on domain-specific datasets.' },
      { step: 4, title: 'Integration',              description: 'Connect to existing EHR, CRM, or ERP systems via secure APIs.' },
      { step: 5, title: 'QA & Validation',          description: 'Rigorous testing against real-world edge cases.' },
      { step: 6, title: 'Deployment & Monitoring',  description: 'CI/CD deployment on Azure/Docker with live observability.' },
    ],
    benefits: [
      'Up to 70% reduction in manual processing time',
      'Improved accuracy through AI-driven decision making',
      'Scalable to millions of records with horizontal scaling',
      'Full audit trail for regulatory compliance',
      'Reduced operational costs by 40–60%',
    ],
    techStack: cat.includes('HEALTH')
      ? ['Python', 'FastAPI', 'HL7/FHIR', 'PostgreSQL', 'Azure']
      : cat.includes('AUTO')
      ? ['n8n', 'Node.js', 'REST APIs', 'Redis', 'Docker']
      : ['Python', 'LangChain', 'OpenAI', 'PostgreSQL', 'FastAPI'],
    tags: [input.category, 'AI', 'Automation', 'Enterprise'],
  }
}

export async function generateProjectContent(input: GenerateProjectInput): Promise<GeneratedProject> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || apiKey.startsWith('sk-your')) {
    logger.warn('OpenAI key not configured – using mock generator')
    return mockGenerate(input)
  }

  const client = new OpenAI({ apiKey })

  const prompt = `You are an expert AI solutions architect at Techlution AI, a company specializing in AI, automation, and healthcare software.

Generate a comprehensive project knowledge document for the following:
- Project Title: "${input.title}"
- Category: "${input.category}"

Respond ONLY with a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "description": "3-4 paragraph detailed description",
  "features": ["feature 1", "feature 2", ... (6-8 items)],
  "workflowSteps": [
    { "step": 1, "title": "Step title", "description": "Step description" },
    ... (6-8 steps)
  ],
  "benefits": ["benefit 1", ... (5-6 items)],
  "techStack": ["tech 1", ... (6-8 items)],
  "tags": ["tag1", "tag2", ... (4-6 items)]
}`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = response.choices[0]?.message?.content ?? ''
    return JSON.parse(content) as GeneratedProject
  } catch (err) {
    logger.error('OpenAI generation failed, falling back to mock:', err)
    return mockGenerate(input)
  }
}
