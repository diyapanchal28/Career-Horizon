import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Compass,
  ExternalLink,
  GraduationCap,
  Layers,
  Award,
  Lightbulb,
  Monitor,
  Sparkles,
  Target,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

// Fallback curated courses per domain and level with real external links
const FALLBACK_COURSES_BY_DOMAIN = {
  web: {
    Beginner: [
      {
        title: "Responsive Web Design Certification (HTML & CSS)",
        provider: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
        duration: "4 weeks · Free",
      },
      {
        title: "HTML, CSS, and Javascript for Web Developers",
        provider: "Coursera (Johns Hopkins)",
        url: "https://www.coursera.org/learn/html-css-javascript-for-web-developers",
        duration: "5 weeks · Certificate",
      },
      {
        title: "JavaScript Algorithms and Data Structures",
        provider: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
        duration: "6 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "Meta Front-End Developer Professional Certificate (React)",
        provider: "Coursera (Meta)",
        url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Back End Development and APIs (Node.js & Express)",
        provider: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
        duration: "5 weeks · Free",
      },
      {
        title: "Full Stack Open — Modern Web Development",
        provider: "University of Helsinki",
        url: "https://fullstackopen.com/en/",
        duration: "8 weeks · Free",
      },
    ],
    Advanced: [
      {
        title: "IBM Full Stack Software Developer Professional Certificate",
        provider: "Coursera (IBM)",
        url: "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer",
        duration: "8 weeks · Certificate",
      },
      {
        title: "Web Security & Performance Optimization",
        provider: "MDN Web Docs",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Performance",
        duration: "4 weeks · Free",
      },
      {
        title: "CS50's Web Programming with Python and JavaScript",
        provider: "edX (Harvard)",
        url: "https://www.edx.org/learn/web-development/harvard-university-cs50-s-web-programming-with-python-and-javascript",
        duration: "8 weeks · Certificate",
      },
    ],
  },
  software: {
    Beginner: [
      {
        title: "CS50: Introduction to Computer Science",
        provider: "edX (Harvard)",
        url: "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science",
        duration: "6 weeks · Free / Certificate",
      },
      {
        title: "Programming for Everybody (Getting Started with Python)",
        provider: "Coursera (Univ. of Michigan)",
        url: "https://www.coursera.org/learn/python",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Version Control with Git & GitHub",
        provider: "Coursera (Meta)",
        url: "https://www.coursera.org/learn/introduction-to-version-control",
        duration: "3 weeks · Certificate",
      },
    ],
    Intermediate: [
      {
        title: "Algorithms, Part I & Data Structures",
        provider: "Coursera (Princeton)",
        url: "https://www.coursera.org/learn/algorithms-part1",
        duration: "6 weeks · Free",
      },
      {
        title: "Relational Database & SQL Certification",
        provider: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/relational-database/",
        duration: "5 weeks · Free",
      },
      {
        title: "Object Oriented Programming in Java Specialization",
        provider: "Coursera (UC San Diego)",
        url: "https://www.coursera.org/specializations/object-oriented-programming",
        duration: "6 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "Software Design and Architecture Specialization",
        provider: "Coursera (Univ. of Alberta)",
        url: "https://www.coursera.org/specializations/software-design-architecture",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Microservices & Cloud Native Development",
        provider: "edX (Linux Foundation)",
        url: "https://www.edx.org/learn/cloud-computing",
        duration: "5 weeks · Certificate",
      },
      {
        title: "System Design & Scalable Backend Engineering",
        provider: "GitHub System Design Primer",
        url: "https://github.com/donnemartin/system-design-primer",
        duration: "4 weeks · Free",
      },
    ],
  },
  data: {
    Beginner: [
      {
        title: "Google Data Analytics Professional Certificate",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/professional-certificates/google-data-analytics",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Excel Skills for Business Specialization",
        provider: "Coursera (Macquarie Univ.)",
        url: "https://www.coursera.org/specializations/excel",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Intro to SQL for Data Science",
        provider: "Kaggle Learn",
        url: "https://www.kaggle.com/learn/intro-to-sql",
        duration: "3 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "Data Analysis with Python Certification",
        provider: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
        duration: "6 weeks · Free",
      },
      {
        title: "Microsoft Power BI Data Analyst Certificate",
        provider: "Coursera (Microsoft)",
        url: "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Data Visualization with Tableau Specialization",
        provider: "Coursera (UC Davis)",
        url: "https://www.coursera.org/specializations/data-visualization",
        duration: "5 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "IBM Data Science Professional Certificate",
        provider: "Coursera (IBM)",
        url: "https://www.coursera.org/professional-certificates/ibm-data-science",
        duration: "8 weeks · Certificate",
      },
      {
        title: "Statistical Inference & Predictive Analytics",
        provider: "Coursera (Johns Hopkins)",
        url: "https://www.coursera.org/learn/statistical-inference",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Advanced SQL & Data Warehousing",
        provider: "Kaggle Learn",
        url: "https://www.kaggle.com/learn/advanced-sql",
        duration: "4 weeks · Free",
      },
    ],
  },
  ai: {
    Beginner: [
      {
        title: "Python for Data Science, AI & Development",
        provider: "Coursera (IBM)",
        url: "https://www.coursera.org/learn/python-for-applied-data-science-ai",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Mathematics for Machine Learning Specialization",
        provider: "Coursera (Imperial College)",
        url: "https://www.coursera.org/specializations/mathematics-machine-learning",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Intro to Machine Learning",
        provider: "Kaggle Learn",
        url: "https://www.kaggle.com/learn/intro-to-machine-learning",
        duration: "3 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "Machine Learning Specialization (Andrew Ng)",
        provider: "Coursera (DeepLearning.AI)",
        url: "https://www.coursera.org/specializations/machine-learning-introduction",
        duration: "8 weeks · Certificate",
      },
      {
        title: "Deep Learning Specialization",
        provider: "Coursera (DeepLearning.AI)",
        url: "https://www.coursera.org/specializations/deep-learning",
        duration: "8 weeks · Certificate",
      },
      {
        title: "Practical Deep Learning for Coders",
        provider: "fast.ai",
        url: "https://course.fast.ai/",
        duration: "6 weeks · Free",
      },
    ],
    Advanced: [
      {
        title: "Generative AI with Large Language Models",
        provider: "Coursera (AWS & DeepLearning.AI)",
        url: "https://www.coursera.org/learn/generative-ai-with-llms",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Machine Learning Engineering for Production (MLOps)",
        provider: "Coursera (DeepLearning.AI)",
        url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Hugging Face NLP & Transformers Course",
        provider: "Hugging Face",
        url: "https://huggingface.co/learn/nlp-course/",
        duration: "5 weeks · Free",
      },
    ],
  },
  cyber: {
    Beginner: [
      {
        title: "Google Cybersecurity Professional Certificate",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/professional-certificates/google-cybersecurity",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Introduction to Cybersecurity",
        provider: "Cisco Networking Academy",
        url: "https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity",
        duration: "4 weeks · Free",
      },
      {
        title: "Linux Fundamentals & Command Line Basics",
        provider: "edX (Linux Foundation)",
        url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
        duration: "4 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "IBM Cybersecurity Analyst Professional Certificate",
        provider: "Coursera (IBM)",
        url: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Information Security Certification",
        provider: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/information-security/",
        duration: "5 weeks · Free",
      },
      {
        title: "Web Security Academy (OWASP Top 10 Labs)",
        provider: "PortSwigger",
        url: "https://portswigger.net/web-security",
        duration: "6 weeks · Free",
      },
    ],
    Advanced: [
      {
        title: "Incident Response, Forensics & SIEM Operations",
        provider: "Coursera (Palo Alto Networks)",
        url: "https://www.coursera.org/specializations/palo-alto-networks-cybersecurity",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Ethical Hacking & Penetration Testing Path",
        provider: "TryHackMe",
        url: "https://tryhackme.com/",
        duration: "6 weeks · Interactive Labs",
      },
      {
        title: "Cloud Security Architecture & Zero Trust",
        provider: "Coursera (ISC2)",
        url: "https://www.coursera.org/specializations/isc2-ccsp-cloud-security",
        duration: "5 weeks · Certificate",
      },
    ],
  },
  cloud: {
    Beginner: [
      {
        title: "AWS Cloud Practitioner Essentials",
        provider: "Coursera (AWS)",
        url: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Introduction to Linux & Bash Scripting",
        provider: "edX (Linux Foundation)",
        url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
        duration: "4 weeks · Free",
      },
      {
        title: "Computer Networking Fundamentals",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/learn/computer-networking",
        duration: "4 weeks · Certificate",
      },
    ],
    Intermediate: [
      {
        title: "Docker, Kubernetes & OpenShift Containers",
        provider: "Coursera (IBM)",
        url: "https://www.coursera.org/learn/ibm-containers-docker-kubernetes-openshift",
        duration: "5 weeks · Certificate",
      },
      {
        title: "DevOps and AI on AWS Specialization (CI/CD)",
        provider: "Coursera (AWS)",
        url: "https://www.coursera.org/specializations/aws-devops",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Terraform Infrastructure as Code Tutorials",
        provider: "HashiCorp Developer",
        url: "https://developer.hashicorp.com/terraform/tutorials",
        duration: "4 weeks · Free",
      },
    ],
    Advanced: [
      {
        title: "Preparing for Google Cloud Architect Certificate",
        provider: "Coursera (Google Cloud)",
        url: "https://www.coursera.org/professional-certificates/gcp-cloud-architect",
        duration: "7 weeks · Certificate",
      },
      {
        title: "Site Reliability Engineering (SRE): Measuring & Managing Reliability",
        provider: "Coursera (Google Cloud)",
        url: "https://www.coursera.org/learn/site-reliability-engineering-slos",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Kubernetes & Cloud Native Associate (KCNA)",
        provider: "edX (Linux Foundation)",
        url: "https://www.edx.org/learn/kubernetes",
        duration: "6 weeks · Certificate",
      },
    ],
  },
  design: {
    Beginner: [
      {
        title: "Google UX Design Professional Certificate",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Graphic Design Specialization (Typography & Color)",
        provider: "Coursera (CalArts)",
        url: "https://www.coursera.org/specializations/graphic-design",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Figma UI/UX Design Essentials",
        provider: "Figma Learn",
        url: "https://help.figma.com/hc/en-us/categories/360002051613-Get-started",
        duration: "3 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "UI / UX Design Specialization (Wireframes & Prototypes)",
        provider: "Coursera (CalArts)",
        url: "https://www.coursera.org/specializations/ui-ux-design",
        duration: "6 weeks · Certificate",
      },
      {
        title: "User Experience Research and Design",
        provider: "Coursera (Univ. of Michigan)",
        url: "https://www.coursera.org/specializations/michiganux",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Interaction Design Specialization",
        provider: "Coursera (UC San Diego)",
        url: "https://www.coursera.org/specializations/interaction-design",
        duration: "6 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "Design Systems & Component Architecture in Figma",
        provider: "DesignSystems.com",
        url: "https://www.designsystems.com/",
        duration: "4 weeks · Free",
      },
      {
        title: "Web Accessibility (WCAG) by W3C",
        provider: "edX (W3Cx)",
        url: "https://www.edx.org/learn/web-accessibility/the-world-wide-web-consortium-w3c-introduction-to-web-accessibility",
        duration: "4 weeks · Free",
      },
      {
        title: "Digital Product Management & Design Leadership",
        provider: "Coursera (Univ. of Virginia)",
        url: "https://www.coursera.org/specializations/uva-darden-digital-product-management",
        duration: "5 weeks · Certificate",
      },
    ],
  },
  business: {
    Beginner: [
      {
        title: "Business Analysis & Process Management",
        provider: "Coursera",
        url: "https://www.coursera.org/projects/business-analysis-process-management",
        duration: "3 weeks · Certificate",
      },
      {
        title: "Google Business Intelligence & Analytics Certificate",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/professional-certificates/google-business-intelligence",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Google Project Management Professional Certificate",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/professional-certificates/google-project-management",
        duration: "6 weeks · Certificate",
      },
    ],
    Intermediate: [
      {
        title: "Digital Product Management Specialization",
        provider: "Coursera (Univ. of Virginia)",
        url: "https://www.coursera.org/specializations/uva-darden-digital-product-management",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Agile with Atlassian Jira & Scrum Workflows",
        provider: "Coursera (Atlassian)",
        url: "https://www.coursera.org/learn/agile-atlassian-jira",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Business Analytics Specialization (SQL & KPIs)",
        provider: "Coursera (Wharton)",
        url: "https://www.coursera.org/specializations/business-analytics",
        duration: "6 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "Strategic Leadership and Management Specialization",
        provider: "Coursera (Univ. of Illinois)",
        url: "https://www.coursera.org/specializations/strategic-leadership",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Operations & Supply Chain Analytics",
        provider: "edX (MITx)",
        url: "https://www.edx.org/masters/micromasters/mitx-supply-chain-management",
        duration: "8 weeks · Certificate",
      },
      {
        title: "AI Product Management Specialization",
        provider: "Coursera (Duke University)",
        url: "https://www.coursera.org/specializations/ai-product-management-duke",
        duration: "5 weeks · Certificate",
      },
    ],
  },
  finance: {
    Beginner: [
      {
        title: "Financial Markets (by Prof. Robert Shiller)",
        provider: "Coursera (Yale University)",
        url: "https://www.coursera.org/learn/financial-markets-global",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Introduction to Financial Accounting",
        provider: "Coursera (Wharton)",
        url: "https://www.coursera.org/learn/wharton-accounting",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Excel for Corporate Finance & Accounting",
        provider: "Corporate Finance Institute (CFI)",
        url: "https://corporatefinanceinstitute.com/course/excel-fundamentals-formulas-for-finance/",
        duration: "3 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "Business and Financial Modeling Specialization",
        provider: "Coursera (Wharton)",
        url: "https://www.coursera.org/specializations/wharton-business-financial-modeling",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Corporate Finance & Valuation Essentials",
        provider: "Coursera (Wharton)",
        url: "https://www.coursera.org/learn/wharton-finance",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Financial Statement Analysis & Reporting",
        provider: "edX (New York Institute of Finance)",
        url: "https://www.edx.org/learn/financial-analysis",
        duration: "5 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "Investment Management & Portfolio Optimization",
        provider: "Coursera (Univ. of Geneva)",
        url: "https://www.coursera.org/specializations/investment-management",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Financial Risk Management & Derivatives",
        provider: "Coursera (Columbia University)",
        url: "https://www.coursera.org/specializations/financialengineering",
        duration: "7 weeks · Certificate",
      },
      {
        title: "Python and Statistics for Financial Analysis",
        provider: "Coursera (HKUST)",
        url: "https://www.coursera.org/learn/python-statistics-financial-analysis",
        duration: "4 weeks · Certificate",
      },
    ],
  },
  healthcare: {
    Beginner: [
      {
        title: "Design and Interpretation of Clinical Trials",
        provider: "Coursera (Johns Hopkins)",
        url: "https://www.coursera.org/learn/clinical-trials",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Epidemiology: The Basic Science of Public Health",
        provider: "Coursera (UNC Chapel Hill)",
        url: "https://www.coursera.org/learn/epidemiology",
        duration: "4 weeks · Certificate",
      },
      {
        title: "Healthcare Organization & Delivery Systems",
        provider: "Coursera (Rutgers University)",
        url: "https://www.coursera.org/specializations/healthcare-organization-operations",
        duration: "4 weeks · Certificate",
      },
    ],
    Intermediate: [
      {
        title: "Health Informatics Specialization (EHR, HL7 & FHIR)",
        provider: "Coursera (Johns Hopkins)",
        url: "https://www.coursera.org/specializations/health-informatics",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Data Management for Clinical Research (REDCap & CDISC)",
        provider: "Coursera (Vanderbilt University)",
        url: "https://www.coursera.org/learn/clinical-data-management",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Biostatistics in Public Health Specialization",
        provider: "Coursera (Johns Hopkins)",
        url: "https://www.coursera.org/specializations/biostatistics-public-health",
        duration: "6 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "Drug Development, Pharmacovigilance & Regulatory Affairs",
        provider: "Coursera (UC San Diego)",
        url: "https://www.coursera.org/specializations/drug-development-product-management",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Clinical Data Science & Healthcare Analytics",
        provider: "Coursera (Univ. of Colorado)",
        url: "https://www.coursera.org/specializations/clinical-data-science",
        duration: "6 weeks · Certificate",
      },
      {
        title: "WHO OpenWHO Public Health & Pharmacovigilance Courses",
        provider: "World Health Organization (WHO)",
        url: "https://openwho.org/",
        duration: "4 weeks · Free Certificate",
      },
    ],
  },
  general: {
    Beginner: [
      {
        title: "Learning How to Learn & Research Foundations",
        provider: "Coursera (DeepTeaching Solutions)",
        url: "https://www.coursera.org/learn/learning-how-to-learn",
        duration: "4 weeks · Free",
      },
      {
        title: "Professional Communication & Technical Writing",
        provider: "Coursera (UC Irvine)",
        url: "https://www.coursera.org/specializations/career-success",
        duration: "4 weeks · Certificate",
      },
      {
        title: "SWAYAM / NPTEL National Online Courses Catalog",
        provider: "NPTEL (IITs & IISc)",
        url: "https://onlinecourses.nptel.ac.in/",
        duration: "4–8 weeks · Free",
      },
    ],
    Intermediate: [
      {
        title: "Data Literacy & Evidence-Based Decision Making",
        provider: "edX",
        url: "https://www.edx.org/",
        duration: "5 weeks · Certificate",
      },
      {
        title: "Project Planning, Compliance & Stakeholder Management",
        provider: "Coursera (Google)",
        url: "https://www.coursera.org/professional-certificates/google-project-management",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Digital Tools & Domain Workflows Specialization",
        provider: "Coursera",
        url: "https://www.coursera.org/browse",
        duration: "5 weeks · Certificate",
      },
    ],
    Advanced: [
      {
        title: "Capstone Project, Portfolio & Industry Readiness",
        provider: "Coursera",
        url: "https://www.coursera.org/",
        duration: "6 weeks · Certificate",
      },
      {
        title: "Advanced Leadership, Governance & Ethics",
        provider: "edX",
        url: "https://www.edx.org/",
        duration: "5 weeks · Certificate",
      },
      {
        title: "NPTEL Advanced Domain Certification Track",
        provider: "NPTEL (IITs)",
        url: "https://onlinecourses.nptel.ac.in/",
        duration: "8 weeks · Certificate",
      },
    ],
  },
};

function detectCareerDomain(careerName = "") {
  const name = careerName.toLowerCase();
  if (name.includes("web")) return "web";
  if (
    name.includes("ai/ml") ||
    name.includes("machine learning") ||
    name.includes("data scientist")
  )
    return "ai";
  if (name.includes("data analyst") || name.includes("analytics")) return "data";
  if (name.includes("cyber") || name.includes("security")) return "cyber";
  if (
    name.includes("cloud") ||
    name.includes("devops") ||
    name.includes("database")
  )
    return "cloud";
  if (name.includes("software") || name.includes("developer")) return "software";
  if (
    name.includes("health") ||
    name.includes("clinical") ||
    name.includes("pharma") ||
    name.includes("public health") ||
    name.includes("medical")
  ) {
    return "healthcare";
  }
  if (
    name.includes("ui/ux") ||
    name.includes("graphic") ||
    name.includes("product design") ||
    name.includes("instructional design") ||
    name.includes("design")
  ) {
    return "design";
  }
  if (
    name.includes("financial") ||
    name.includes("account") ||
    name.includes("investment") ||
    name.includes("compliance")
  ) {
    return "finance";
  }
  if (
    name.includes("business") ||
    name.includes("product manager") ||
    name.includes("marketing") ||
    name.includes("operations") ||
    name.includes("hr ")
  ) {
    return "business";
  }
  return "general";
}

const LEVEL_SECTIONS_META = [
  {
    key: "Beginner",
    badge: "STAGE 1 · BEGINNER",
    title: "Beginner Roadmap — Core Foundations",
    subtitle:
      "Start here to build strong fundamentals, core terminology, and essential entry-level skills for this field.",
    icon: Sparkles,
    themeClass: "beginner",
  },
  {
    key: "Intermediate",
    badge: "STAGE 2 · INTERMEDIATE",
    title: "Intermediate Roadmap — Applied Tools & Workflows",
    subtitle:
      "Move from theory to practice using standard industry tools, frameworks, and hands-on problem solving.",
    icon: Layers,
    themeClass: "intermediate",
  },
  {
    key: "Advanced",
    badge: "STAGE 3 · ADVANCED",
    title: "Advanced Roadmap — Mastery & Industry Readiness",
    subtitle:
      "Master complex systems, real-world case studies, and build a job-ready portfolio for interviews.",
    icon: Award,
    themeClass: "advanced",
  },
];

export default function Roadmap() {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [career, setCareer] = useState(null);
  const [completedStepIds, setCompletedStepIds] = useState([]);
  const [expandedStepIds, setExpandedStepIds] = useState([]);
  const [activeLevelFilter, setActiveLevelFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingStepId, setTogglingStepId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Enforce login/signup for roadmap access
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem("returnAfterLogin", `/roadmaps/${careerId}`);
      navigate("/login");
    }
  }, [isAuthenticated, careerId, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !careerId) return;

    const fetchRoadmapData = async () => {
      try {
        setLoading(true);
        setError("");
        const authToken = token || localStorage.getItem("token");

        const [careerRes, roadmapRes, progRes] = await Promise.all([
          fetch(`${API_URL}/careers/${careerId}`),
          fetch(`${API_URL}/roadmaps/career/${careerId}`),
          fetch(`${API_URL}/roadmaps/career/${careerId}/progress`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        if (careerRes.ok) {
          const cData = await careerRes.json();
          setCareer(cData);
        }

        let rData = null;
        if (roadmapRes.ok) {
          rData = await roadmapRes.json();
          setRoadmap(rData);
        } else {
          setError(
            "No structured learning roadmap has been registered for this career yet."
          );
        }

        let doneIds = [];
        if (progRes.ok) {
          const progData = await progRes.json();
          if (Array.isArray(progData.completedStepIds)) {
            doneIds = progData.completedStepIds.map((id) => String(id));
            setCompletedStepIds(doneIds);
          }
        }

        // Open only the first incomplete step by default (Step 1 when starting, Step 2 after Step 1 is done, etc.)
        if (rData && Array.isArray(rData.steps) && rData.steps.length > 0) {
          const firstIncompleteIdx = rData.steps.findIndex((s, idx) => {
            const sKey = String(s._id || s.stepNumber || idx + 1);
            return !doneIds.includes(sKey);
          });
          if (firstIncompleteIdx !== -1) {
            const targetStep = rData.steps[firstIncompleteIdx];
            const targetId = String(
              targetStep._id || targetStep.stepNumber || firstIncompleteIdx + 1
            );
            setExpandedStepIds([targetId]);
          } else {
            setExpandedStepIds([]);
          }
        }
      } catch (err) {
        console.error("Failed to load roadmap:", err);
        setError("Failed to load learning roadmap. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmapData();
  }, [careerId, isAuthenticated, token]);

  const toggleExpandStep = (stepId) => {
    const idStr = String(stepId);
    setExpandedStepIds((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr]
    );
  };

  const handleToggleStep = async (stepObj, index) => {
    const sId = String(stepObj._id || stepObj.stepNumber || index + 1);
    const isCurrentlyDone = completedStepIds.includes(sId);
    setTogglingStepId(sId);

    try {
      const authToken = token || localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/roadmaps/career/${careerId}/toggle-step`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ stepId: sId }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        let nextDoneIds = [];
        if (Array.isArray(updated.completedStepIds)) {
          nextDoneIds = updated.completedStepIds.map((id) => String(id));
          setCompletedStepIds(nextDoneIds);
        } else {
          nextDoneIds = isCurrentlyDone
            ? completedStepIds.filter((id) => id !== sId)
            : [...completedStepIds, sId];
          setCompletedStepIds(nextDoneIds);
        }

        const allSteps = Array.isArray(roadmap?.steps) ? roadmap.steps : [];

        // When marking a step complete, close it and automatically open the next incomplete step
        if (!isCurrentlyDone && allSteps.length > 0) {
          let nextTargetIdx = -1;
          for (let i = index + 1; i < allSteps.length; i++) {
            const candidateId = String(
              allSteps[i]._id || allSteps[i].stepNumber || i + 1
            );
            if (!nextDoneIds.includes(candidateId)) {
              nextTargetIdx = i;
              break;
            }
          }
          if (nextTargetIdx === -1) {
            nextTargetIdx = allSteps.findIndex((s, idx) => {
              const candidateId = String(s._id || s.stepNumber || idx + 1);
              return !nextDoneIds.includes(candidateId);
            });
          }

          if (nextTargetIdx !== -1) {
            const nextStepObj = allSteps[nextTargetIdx];
            const nextStepId = String(
              nextStepObj._id || nextStepObj.stepNumber || nextTargetIdx + 1
            );
            setExpandedStepIds([nextStepId]);
          } else {
            setExpandedStepIds([]);
          }
        }

        const doneStepCount = allSteps.filter((s, idx) =>
          nextDoneIds.includes(String(s._id || s.stepNumber || idx + 1))
        ).length;
        const finishedAll =
          !isCurrentlyDone && allSteps.length > 0 && doneStepCount >= allSteps.length;

        setToastMessage(
          finishedAll
            ? `🎉 Congratulations! You have successfully completed the entire ${career?.name || "career"} roadmap!`
            : isCurrentlyDone
            ? `"${stepObj.title}" marked as not complete.`
            : `"${stepObj.title}" marked complete.`
        );
        setTimeout(() => setToastMessage(""), finishedAll ? 5000 : 3500);
      }
    } catch (err) {
      console.error("Failed to toggle step:", err);
    } finally {
      setTogglingStepId("");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stepsList = Array.isArray(roadmap?.steps) ? roadmap.steps : [];
  const totalSteps = stepsList.length;
  const completedCount = stepsList.filter((s, idx) =>
    completedStepIds.includes(String(s._id || s.stepNumber || idx + 1))
  ).length;
  const progressPct =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isRoadmapCompleted = totalSteps > 0 && completedCount >= totalSteps;

  const nextIncompleteStep = stepsList.find(
    (s, idx) =>
      !completedStepIds.includes(String(s._id || s.stepNumber || idx + 1))
  );

  // Group steps into 3 sections: Beginner, Intermediate, Advanced
  const careerName =
    career?.name || roadmap?.title?.replace(/ Roadmap$/i, "") || "Career";
  const domainKey = detectCareerDomain(careerName);
  const domainCoursePack =
    roadmap?.levelCourses ||
    FALLBACK_COURSES_BY_DOMAIN[domainKey] ||
    FALLBACK_COURSES_BY_DOMAIN.general;

  const groupedByLevel = {
    Beginner: [],
    Intermediate: [],
    Advanced: [],
  };

  const third = Math.max(1, Math.ceil(stepsList.length / 3));
  stepsList.forEach((step, idx) => {
    let lvl = step.level;
    if (lvl !== "Beginner" && lvl !== "Intermediate" && lvl !== "Advanced") {
      if (idx < third) lvl = "Beginner";
      else if (idx < third * 2) lvl = "Intermediate";
      else lvl = "Advanced";
    }
    groupedByLevel[lvl].push({ step, globalIndex: idx });
  });

  const visibleSections =
    activeLevelFilter === "ALL"
      ? LEVEL_SECTIONS_META
      : LEVEL_SECTIONS_META.filter((m) => m.key === activeLevelFilter);

  let runningStep = 1;
  const levelMeta = LEVEL_SECTIONS_META.map((sec) => {
    const items = groupedByLevel[sec.key] || [];
    const count = Math.max(1, items.length || 3);
    const completed = items.filter(({ step, globalIndex }) =>
      completedStepIds.includes(
        String(step._id || step.stepNumber || globalIndex + 1)
      )
    ).length;
    const start = runningStep;
    const end = runningStep + count - 1;
    runningStep = end + 1;
    return {
      level: sec.key,
      theme: sec.themeClass,
      completed,
      count,
      start,
      end,
    };
  });

  return (
    <div className="roadmap-page">
      <Navbar />

      {/* Bottom-Right Toast */}
      {toastMessage && (
        <div className="pdf-bottom-toast">
          <span>{toastMessage}</span>
          <button
            type="button"
            className="pdf-toast-close"
            onClick={() => setToastMessage("")}
          >
            Close
          </button>
        </div>
      )}

      <main className="page-container pdf-roadmap-container">
        <div className="pdf-roadmap-back-row">
          <Link to={`/careers/${careerId}`} className="pdf-back-btn">
            <ArrowLeft size={15} />
            <span>Back to {career?.name || "Career"}</span>
          </Link>
        </div>

        {loading && (
          <div className="saved-loading-state">
            <div className="loading-spinner-dot"></div>
            <p>Loading roadmap milestones...</p>
          </div>
        )}

        {!loading && error && (
          <div className="saved-empty-card">
            <Compass size={40} className="empty-icon" />
            <h3>Roadmap Not Found</h3>
            <p>{error}</p>
            <Link to="/careers" className="pdf-explore-btn large">
              <span>Explore other careers</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {!loading && roadmap && (
          <>
            {/* Header */}
            <header className="pdf-roadmap-header">
              <h1>{roadmap.title || `${career?.name || "Career"} Roadmap`}</h1>
              <p>
                {roadmap.summary ||
                  "Structured into Beginner, Intermediate, and Advanced field roadmaps with curated courses you can open directly."}
              </p>
            </header>

            {/* Progress Card with 9-Segment Pill Progress Bar */}
            <section
              className={`pdf-roadmap-progress-card ${
                isRoadmapCompleted ? "completed" : ""
              }`}
            >
              <div className="pdf-roadmap-prog-top">
                <div className="roadmap-prog-top-left">
                  <div className="rm-prog-title-inline">
                    <strong className="rm-prog-heading">Learning Roadmap</strong>
                    {isRoadmapCompleted && (
                      <span className="rm-completed-status-pill">
                        <CheckCircle2 size={14} />
                        <span>Successfully Completed</span>
                      </span>
                    )}
                  </div>
                  <span className="pdf-roadmap-step-count">
                    {completedCount}/{totalSteps} steps completed
                  </span>
                </div>
                <span className="roadmap-prog-total-pct">{progressPct}%</span>
              </div>

              {/* 9-Segment Pill Progress Bar */}
              <div
                className="rm-seg-bar-wrap"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="rm-seg-pills-row">
                  {levelMeta.map((lvl) =>
                    Array.from({ length: lvl.count }).map((_, segIdx) => {
                      const isFilled = segIdx < lvl.completed;
                      return (
                        <span
                          key={`${lvl.level}-seg-${segIdx}`}
                          className={`rm-seg-pill ${lvl.theme} ${
                            isFilled ? "filled" : ""
                          }`}
                          title={`${lvl.level} — Step ${lvl.start + segIdx}`}
                        />
                      );
                    })
                  )}
                </div>

                <div className="rm-seg-legend">
                  {levelMeta.map((lvl) => (
                    <div key={lvl.level} className="rm-seg-legend-item">
                      <div className="rm-seg-legend-title">
                        <span className={`rm-seg-legend-dot ${lvl.theme}`} />
                        <strong>{lvl.level}</strong>
                      </div>
                      <span className="rm-seg-legend-sub">
                        Steps {lvl.start}&ndash;{lvl.end}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pdf-roadmap-next-up">
                {nextIncompleteStep ? (
                  <>
                    Next up: <strong>{nextIncompleteStep.title}</strong>
                  </>
                ) : (
                  <span className="rm-all-done-inline">
                    <Award size={16} />
                    <strong>
                      Congratulations! You have successfully completed all{" "}
                      {totalSteps} steps of the {careerName} roadmap!
                    </strong>
                  </span>
                )}
              </div>
            </section>

            {/* Level Filter / Quick Tabs */}
            <div className="roadmap-level-tabs" role="tablist">
              <button
                type="button"
                className={`roadmap-level-tab ${
                  activeLevelFilter === "ALL" ? "active" : ""
                }`}
                onClick={() => setActiveLevelFilter("ALL")}
              >
                All 3 Stages ({totalSteps})
              </button>
              {LEVEL_SECTIONS_META.map((sec) => {
                const secItems = groupedByLevel[sec.key] || [];
                const secDone = secItems.filter(({ step, globalIndex }) =>
                  completedStepIds.includes(
                    String(step._id || step.stepNumber || globalIndex + 1)
                  )
                ).length;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    className={`roadmap-level-tab ${sec.themeClass} ${
                      activeLevelFilter === sec.key ? "active" : ""
                    }`}
                    onClick={() => setActiveLevelFilter(sec.key)}
                  >
                    <span>{sec.key}</span>
                    <span className="roadmap-tab-count">
                      {secDone}/{secItems.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 3 Roadmap Sections: Beginner, Intermediate, Advanced */}
            <div className="roadmap-levels-wrapper">
              {visibleSections.map((sectionMeta) => {
                const sectionSteps = groupedByLevel[sectionMeta.key] || [];
                const sectionDoneCount = sectionSteps.filter(
                  ({ step, globalIndex }) =>
                    completedStepIds.includes(
                      String(step._id || step.stepNumber || globalIndex + 1)
                    )
                ).length;

                const sectionCourses =
                  domainCoursePack?.[sectionMeta.key] ||
                  FALLBACK_COURSES_BY_DOMAIN.general[sectionMeta.key] ||
                  [];

                const LevelIcon = sectionMeta.icon;

                return (
                  <section
                    key={sectionMeta.key}
                    className={`roadmap-level-section ${sectionMeta.themeClass}`}
                  >
                    {/* Section Header */}
                    <div className="roadmap-level-header">
                      <div className="roadmap-level-header-top">
                        <span
                          className={`roadmap-level-badge ${sectionMeta.themeClass}`}
                        >
                          <LevelIcon size={13} />
                          <span>{sectionMeta.badge}</span>
                        </span>
                        <span className="roadmap-level-progress-pill">
                          {sectionDoneCount}/{sectionSteps.length} completed
                        </span>
                      </div>
                      <h2>{sectionMeta.title}</h2>
                      <p>{sectionMeta.subtitle}</p>
                    </div>

                    {/* Small Field Roadmap (3 Step Cards per Level) */}
                    <div className="pdf-roadmap-steps-stack">
                      {sectionSteps.map(({ step, globalIndex }, localIdx) => {
                        const stepId = String(
                          step._id || step.stepNumber || globalIndex + 1
                        );
                        const isDone = completedStepIds.includes(stepId);
                        const isExpanded = expandedStepIds.includes(stepId);
                        const isToggling = togglingStepId === stepId;

                        const stepCourses =
                          Array.isArray(step.courses) && step.courses.length > 0
                            ? step.courses
                            : sectionCourses.slice(0, 2);

                        const goalText =
                          step.goal ||
                          (step.title?.toLowerCase().includes("html")
                            ? "Create one responsive web page."
                            : `Complete one practical ${step.title.toLowerCase()} deliverable.`);

                        if (!isExpanded) {
                          return (
                            <article
                              key={stepId}
                              className={`pdf-step-accordion-card ${
                                isDone ? "done" : ""
                              }`}
                            >
                              <button
                                type="button"
                                className="pdf-step-accordion-header"
                                onClick={() => toggleExpandStep(stepId)}
                              >
                                <div className="pdf-step-header-left">
                                  <span
                                    className={`pdf-step-circle ${
                                      isDone ? "done" : ""
                                    }`}
                                  >
                                    {isDone ? (
                                      <Check size={14} strokeWidth={3} />
                                    ) : (
                                      localIdx + 1
                                    )}
                                  </span>
                                  <div className="pdf-step-title-wrap">
                                    <h3>{step.title}</h3>
                                    {step.estimatedWeeks && (
                                      <span>
                                        About {step.estimatedWeeks} weeks
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <span className="pdf-step-chevron">
                                  <ChevronDown size={16} />
                                </span>
                              </button>
                            </article>
                          );
                        }

                        return (
                          <article
                            key={stepId}
                            className={`rm-rich-step-card ${
                              isDone ? "done" : ""
                            }`}
                          >
                            {/* Top Status & Step Pill Row */}
                            <div className="rm-detail-top-row">
                              <div className="rm-detail-badges">
                                {isDone && (
                                  <span className="rm-badge-completed">
                                    <CheckCircle2 size={13} />
                                    <span>Completed</span>
                                  </span>
                                )}
                                <span className="rm-badge-step-level">
                                  STEP {localIdx + 1} OF {sectionSteps.length}{" "}
                                  &middot; {sectionMeta.key.toUpperCase()}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="rm-collapse-icon-btn"
                                onClick={() => toggleExpandStep(stepId)}
                                aria-label="Collapse step details"
                              >
                                <ChevronUp size={17} />
                              </button>
                            </div>

                            {/* Hero Header Block */}
                            <div
                              className="rm-detail-hero"
                              onClick={() => toggleExpandStep(stepId)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  toggleExpandStep(stepId);
                                }
                              }}
                            >
                              <div className="rm-hero-icon-box">
                                <Code2 size={22} />
                              </div>
                              <div className="rm-hero-content">
                                <h3>{step.title}</h3>
                                {step.description && (
                                  <p className="rm-hero-desc">
                                    {step.description}
                                  </p>
                                )}
                                <div className="rm-hero-meta">
                                  <span className="rm-meta-item">
                                    <Clock size={13} />
                                    <span>
                                      About {step.estimatedWeeks || 4} weeks
                                    </span>
                                  </span>
                                  <span className="rm-meta-item">
                                    <BarChart2 size={13} />
                                    <span>{sectionMeta.key}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="rm-detail-divider" />

                            {/* Why this matters */}
                            {step.whyItMatters && (
                              <div className="rm-detail-section">
                                <div className="rm-sec-heading">
                                  <Lightbulb
                                    size={16}
                                    className="rm-sec-icon"
                                  />
                                  <h4>Why this matters</h4>
                                </div>
                                <p className="rm-why-prose">
                                  {step.whyItMatters}
                                </p>
                              </div>
                            )}

                            {/* What you'll learn (Soft Lavender Box) */}
                            {Array.isArray(step.topics) &&
                              step.topics.length > 0 && (
                                <div className="rm-learn-card">
                                  <div className="rm-sec-heading">
                                    <BookOpen
                                      size={16}
                                      className="rm-sec-icon"
                                    />
                                    <h4>What you&apos;ll learn</h4>
                                  </div>
                                  <div className="rm-learn-grid">
                                    {step.topics.map((t, tIdx) => (
                                      <div
                                        key={tIdx}
                                        className="rm-learn-topic"
                                      >
                                        <CheckCircle2
                                          size={15}
                                          className="rm-topic-check"
                                        />
                                        <span>{t}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Try it yourself (White Bordered Box) */}
                            {step.practice && (
                              <div className="rm-try-card">
                                <div className="rm-sec-heading">
                                  <Monitor size={16} className="rm-sec-icon" />
                                  <h4>Try it yourself</h4>
                                </div>
                                <p className="rm-try-prose">{step.practice}</p>
                                <div className="rm-try-goal-row">
                                  <Target size={15} className="rm-goal-icon" />
                                  <span>
                                    <strong>Goal:</strong> {goalText}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Recommended courses */}
                            {stepCourses.length > 0 && (
                              <div className="rm-courses-section">
                                <div className="rm-sec-heading">
                                  <GraduationCap
                                    size={17}
                                    className="rm-sec-icon"
                                  />
                                  <h4>Recommended courses</h4>
                                </div>

                                <div className="rm-courses-box">
                                  {stepCourses.map((course, cIdx) => {
                                    const isFree = course.duration
                                      ?.toLowerCase()
                                      .includes("free");
                                    const providerDisplay = course.provider
                                      ? course.provider
                                          .replace(/\(([^)]+)\)/, "- $1")
                                          .trim()
                                      : "Online Course";
                                    const tagsLine =
                                      cIdx % 2 === 0
                                        ? Array.isArray(step.topics) &&
                                          step.topics.length > 0
                                          ? `${step.topics
                                              .slice(0, 2)
                                              .map((t) =>
                                                t.split(" ").slice(0, 2).join(" ")
                                              )
                                              .join(" · ")} · Projects`
                                          : "Guided · Hands-on · Projects"
                                        : "Course duration and certificate depend on current offering.";

                                    return (
                                      <a
                                        key={cIdx}
                                        href={course.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rm-course-item-row"
                                      >
                                        <div className="rm-course-item-left">
                                          <div
                                            className={`rm-course-thumb ${
                                              cIdx % 2 === 0 ? "purple" : "blue"
                                            }`}
                                          >
                                            {cIdx % 2 === 0 ? (
                                              <Code2 size={18} />
                                            ) : (
                                              <BookOpen size={18} />
                                            )}
                                          </div>
                                          <div className="rm-course-item-text">
                                            <strong>
                                              {course.title.replace(
                                                /\s*\([^)]*\)\s*$/,
                                                ""
                                              )}
                                            </strong>
                                            <span className="rm-course-sub">
                                              {providerDisplay}
                                              {isFree ? " · Free" : ""}
                                            </span>
                                            <span className="rm-course-caption">
                                              {tagsLine}
                                            </span>
                                          </div>
                                        </div>
                                        <ExternalLink
                                          size={15}
                                          className="rm-course-ext-link"
                                        />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Bottom Action Buttons */}
                            <div className="rm-detail-actions">
                              {isDone ? (
                                <>
                                  <button
                                    type="button"
                                    className="rm-btn-primary-done"
                                    onClick={() =>
                                      handleToggleStep(step, globalIndex)
                                    }
                                    disabled={isToggling}
                                  >
                                    <Check size={16} strokeWidth={2.5} />
                                    <span>Completed</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="rm-btn-secondary-undo"
                                    onClick={() =>
                                      handleToggleStep(step, globalIndex)
                                    }
                                    disabled={isToggling}
                                  >
                                    Mark incomplete
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="rm-btn-primary-complete"
                                  onClick={() =>
                                    handleToggleStep(step, globalIndex)
                                  }
                                  disabled={isToggling}
                                >
                                  <Check size={16} strokeWidth={2.5} />
                                  <span>Mark as complete</span>
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Final Completion Celebration Card at the end of the Roadmap */}
            {isRoadmapCompleted && (
              <section className="rm-completion-celebration-card">
                <div className="rm-celebration-icon-badge">
                  <Award size={28} />
                </div>

                <span className="rm-celebration-eyebrow">
                  <Sparkles size={13} />
                  <span>ROADMAP SUCCESSFULLY COMPLETED</span>
                </span>

                <h2>
                  Congratulations on completing the {careerName} Roadmap! 🎉
                </h2>

                <p>
                  You have successfully finished all{" "}
                  <strong>{totalSteps} learning steps</strong> across the{" "}
                  <strong>Beginner</strong>, <strong>Intermediate</strong>, and{" "}
                  <strong>Advanced</strong> stages. Your achievement is saved
                  and marked as <strong>Successfully Completed</strong> on your
                  dashboard.
                </p>

                <div className="rm-celebration-stage-pills">
                  <span className="rm-stage-done-pill beginner">
                    <CheckCircle2 size={14} />
                    <span>Beginner Completed</span>
                  </span>
                  <span className="rm-stage-done-pill intermediate">
                    <CheckCircle2 size={14} />
                    <span>Intermediate Completed</span>
                  </span>
                  <span className="rm-stage-done-pill advanced">
                    <CheckCircle2 size={14} />
                    <span>Advanced Completed</span>
                  </span>
                </div>

                <div className="rm-celebration-actions">
                  <Link to="/dashboard" className="pdf-explore-btn large">
                    <span>Go to Dashboard</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link to="/careers" className="pdf-outline-btn">
                    <span>Explore More Careers</span>
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
