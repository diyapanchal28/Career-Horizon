import {
  Activity,
  Award,
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  Cloud,
  Code2,
  Compass,
  Cpu,
  Database,
  FileText,
  Film,
  FlaskConical,
  Globe,
  GraduationCap,
  Heart,
  Landmark,
  Layers,
  Layout,
  Leaf,
  Lightbulb,
  LineChart,
  Megaphone,
  Monitor,
  Palette,
  PenTool,
  Radio,
  Rocket,
  Scale,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

/**
 * Theme icons and 2-3 word short descriptions for Areas of Interest (Fields) and Subfields.
 */

const FIELD_META_MAP = {
  technology: {
    Icon: Cpu,
    tone: "purple",
    shortTag: "Software, Data & Cloud",
  },
  business: {
    Icon: Briefcase,
    tone: "blue",
    shortTag: "Strategy & Operations",
  },
  finance: {
    Icon: TrendingUp,
    tone: "emerald",
    shortTag: "Investments & Risk",
  },
  design: {
    Icon: Palette,
    tone: "rose",
    shortTag: "UI/UX & Branding",
  },
  healthcare: {
    Icon: Activity,
    tone: "teal",
    shortTag: "Clinical & HealthTech",
  },
  education: {
    Icon: GraduationCap,
    tone: "amber",
    shortTag: "Teaching & EdTech",
  },
  law: {
    Icon: Scale,
    tone: "indigo",
    shortTag: "Contracts & Compliance",
  },
  media: {
    Icon: Film,
    tone: "violet",
    shortTag: "Content & Journalism",
  },
  science: {
    Icon: FlaskConical,
    tone: "cyan",
    shortTag: "Biotech & Research",
  },
};

const SUBFIELD_META_LIST = [
  {
    match: /web|full[- ]?stack|frontend|backend|software/i,
    Icon: Globe,
    tone: "purple",
    shortTag: "Websites & Apps",
  },
  {
    match: /data|ai|artificial intelligence|machine learning|analytics/i,
    Icon: Database,
    tone: "indigo",
    shortTag: "AI & Analytics",
  },
  {
    match: /cyber|security|infosec|network/i,
    Icon: Shield,
    tone: "emerald",
    shortTag: "Security & Networks",
  },
  {
    match: /cloud|devops|infrastructure|sre/i,
    Icon: Cloud,
    tone: "cyan",
    shortTag: "Cloud & Automation",
  },
  {
    match: /mobile|android|ios|app/i,
    Icon: Smartphone,
    tone: "violet",
    shortTag: "iOS & Android",
  },
  {
    match: /business analy|strategy|consulting/i,
    Icon: BarChart2,
    tone: "blue",
    shortTag: "Strategy & Insights",
  },
  {
    match: /product|project|agile|scrum/i,
    Icon: Rocket,
    tone: "purple",
    shortTag: "Product & Delivery",
  },
  {
    match: /operation|supply chain|logistics/i,
    Icon: Settings,
    tone: "amber",
    shortTag: "Operations & Logistics",
  },
  {
    match: /human resource|hr|talent|people/i,
    Icon: Users,
    tone: "teal",
    shortTag: "Talent & Culture",
  },
  {
    match: /marketing|growth|seo/i,
    Icon: Megaphone,
    tone: "rose",
    shortTag: "Growth & Campaigns",
  },
  {
    match: /investment|corporate finance|banking|valuation|portfolio/i,
    Icon: Landmark,
    tone: "emerald",
    shortTag: "Capital & Valuation",
  },
  {
    match: /account|audit|tax|bookkeep/i,
    Icon: FileText,
    tone: "blue",
    shortTag: "Audits & Accounting",
  },
  {
    match: /risk|fintech|wealth|planning|actuar/i,
    Icon: LineChart,
    tone: "indigo",
    shortTag: "Risk & Portfolios",
  },
  {
    match: /ui|ux|user experience|interaction|product design/i,
    Icon: Layout,
    tone: "purple",
    shortTag: "Interfaces & Flows",
  },
  {
    match: /graphic|visual|brand design|illustration/i,
    Icon: PenTool,
    tone: "rose",
    shortTag: "Branding & Visuals",
  },
  {
    match: /motion|animation|video|multimedia|3d|game/i,
    Icon: Film,
    tone: "violet",
    shortTag: "Motion & 3D",
  },
  {
    match: /health informatics|ehr|medical data|digital health/i,
    Icon: Activity,
    tone: "teal",
    shortTag: "Health Data Systems",
  },
  {
    match: /clinical|trial|pharma|biomed/i,
    Icon: FlaskConical,
    tone: "cyan",
    shortTag: "Clinical Trials",
  },
  {
    match: /public health|hospital|healthcare admin|epidemiol/i,
    Icon: Heart,
    tone: "emerald",
    shortTag: "Public Health & Care",
  },
  {
    match: /instructional|edtech|curriculum|e-learning/i,
    Icon: Monitor,
    tone: "amber",
    shortTag: "Digital Learning",
  },
  {
    match: /teach|academic|counsel|mentor|school/i,
    Icon: BookOpen,
    tone: "blue",
    shortTag: "Teaching & Mentoring",
  },
  {
    match: /corporate law|commercial|contract|mergers/i,
    Icon: Building2,
    tone: "indigo",
    shortTag: "Corporate Contracts",
  },
  {
    match: /compliance|intellectual property|ip|privacy|policy|legal|litigation/i,
    Icon: Scale,
    tone: "purple",
    shortTag: "Policy & Compliance",
  },
  {
    match: /content|copywrit|social media|digital media/i,
    Icon: PenTool,
    tone: "violet",
    shortTag: "Content & Social",
  },
  {
    match: /journalism|public relations|pr|broadcast|communications/i,
    Icon: Radio,
    tone: "rose",
    shortTag: "News & PR",
  },
  {
    match: /biotech|life science|genetics|biology|chemistry|lab/i,
    Icon: FlaskConical,
    tone: "cyan",
    shortTag: "Biotech & Lab",
  },
  {
    match: /environment|climate|sustainability|earth|physics|research/i,
    Icon: Leaf,
    tone: "emerald",
    shortTag: "Climate & Research",
  },
];

export function getFieldMeta(field) {
  const key = String(field?.name || "").trim().toLowerCase();
  if (FIELD_META_MAP[key]) {
    return FIELD_META_MAP[key];
  }
  return {
    Icon: Compass,
    tone: "purple",
    shortTag: "Career Pathways",
  };
}

export function getSubfieldMeta(subfield, parentFieldName = "") {
  const name = String(subfield?.name || "").trim();
  const combined = `${name} ${parentFieldName}`;

  for (const entry of SUBFIELD_META_LIST) {
    if (entry.match.test(name)) {
      return { Icon: entry.Icon, tone: entry.tone, shortTag: entry.shortTag };
    }
  }
  for (const entry of SUBFIELD_META_LIST) {
    if (entry.match.test(combined)) {
      return { Icon: entry.Icon, tone: entry.tone, shortTag: entry.shortTag };
    }
  }

  const parentMeta = getFieldMeta({ name: parentFieldName });
  return {
    Icon: parentMeta.Icon || Layers,
    tone: parentMeta.tone || "purple",
    shortTag: "Specialised Track",
  };
}

export function getFieldShortDescription(field) {
  return getFieldMeta(field).shortTag;
}

export function getSubfieldShortDescription(subfield, parentFieldName = "") {
  return getSubfieldMeta(subfield, parentFieldName).shortTag;
}
