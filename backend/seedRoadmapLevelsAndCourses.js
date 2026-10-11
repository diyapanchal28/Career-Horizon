const mongoose = require("mongoose");
require("dotenv").config();

const Roadmap = require("./models/Roadmap");
const Career = require("./models/Career");
const Field = require("./models/Field");

const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career_horizon";

// Curated clickable courses per career/domain and level (Beginner, Intermediate, Advanced)
const DOMAIN_COURSES = {
    web: {
        Beginner: [
            {
                title: "Responsive Web Design Certification (HTML & CSS)",
                provider: "freeCodeCamp",
                url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
                duration: "4 weeks · Free"
            },
            {
                title: "HTML, CSS, and Javascript for Web Developers",
                provider: "Coursera (Johns Hopkins)",
                url: "https://www.coursera.org/learn/html-css-javascript-for-web-developers",
                duration: "5 weeks · Certificate"
            },
            {
                title: "JavaScript Algorithms and Data Structures",
                provider: "freeCodeCamp",
                url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
                duration: "6 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "Meta Front-End Developer Professional Certificate (React)",
                provider: "Coursera (Meta)",
                url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Back End Development and APIs (Node.js & Express)",
                provider: "freeCodeCamp",
                url: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
                duration: "5 weeks · Free"
            },
            {
                title: "Full Stack Open — Modern Web Development",
                provider: "University of Helsinki",
                url: "https://fullstackopen.com/en/",
                duration: "8 weeks · Free"
            }
        ],
        Advanced: [
            {
                title: "IBM Full Stack Software Developer Professional Certificate",
                provider: "Coursera (IBM)",
                url: "https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer",
                duration: "8 weeks · Certificate"
            },
            {
                title: "Web Security & Performance Optimization",
                provider: "MDN Web Docs",
                url: "https://developer.mozilla.org/en-US/docs/Learn/Performance",
                duration: "4 weeks · Free"
            },
            {
                title: "CS50's Web Programming with Python and JavaScript",
                provider: "edX (Harvard)",
                url: "https://www.edx.org/learn/web-development/harvard-university-cs50-s-web-programming-with-python-and-javascript",
                duration: "8 weeks · Certificate"
            }
        ]
    },
    software: {
        Beginner: [
            {
                title: "CS50: Introduction to Computer Science",
                provider: "edX (Harvard)",
                url: "https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science",
                duration: "6 weeks · Free / Certificate"
            },
            {
                title: "Programming for Everybody (Getting Started with Python)",
                provider: "Coursera (Univ. of Michigan)",
                url: "https://www.coursera.org/learn/python",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Version Control with Git & GitHub",
                provider: "Coursera (Meta)",
                url: "https://www.coursera.org/learn/introduction-to-version-control",
                duration: "3 weeks · Certificate"
            }
        ],
        Intermediate: [
            {
                title: "Algorithms, Part I & Data Structures",
                provider: "Coursera (Princeton)",
                url: "https://www.coursera.org/learn/algorithms-part1",
                duration: "6 weeks · Free"
            },
            {
                title: "Relational Database & SQL Certification",
                provider: "freeCodeCamp",
                url: "https://www.freecodecamp.org/learn/relational-database/",
                duration: "5 weeks · Free"
            },
            {
                title: "Object Oriented Programming in Java Specialization",
                provider: "Coursera (UC San Diego)",
                url: "https://www.coursera.org/specializations/object-oriented-programming",
                duration: "6 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "Software Design and Architecture Specialization",
                provider: "Coursera (Univ. of Alberta)",
                url: "https://www.coursera.org/specializations/software-design-architecture",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Microservices & Cloud Native Development",
                provider: "edX (Linux Foundation)",
                url: "https://www.edx.org/learn/cloud-computing",
                duration: "5 weeks · Certificate"
            },
            {
                title: "System Design & Scalable Backend Engineering",
                provider: "GitHub System Design Primer",
                url: "https://github.com/donnemartin/system-design-primer",
                duration: "4 weeks · Free"
            }
        ]
    },
    data: {
        Beginner: [
            {
                title: "Google Data Analytics Professional Certificate",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/professional-certificates/google-data-analytics",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Excel Skills for Business Specialization",
                provider: "Coursera (Macquarie Univ.)",
                url: "https://www.coursera.org/specializations/excel",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Intro to SQL for Data Science",
                provider: "Kaggle Learn",
                url: "https://www.kaggle.com/learn/intro-to-sql",
                duration: "3 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "Data Analysis with Python Certification",
                provider: "freeCodeCamp",
                url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
                duration: "6 weeks · Free"
            },
            {
                title: "Microsoft Power BI Data Analyst Certificate",
                provider: "Coursera (Microsoft)",
                url: "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Data Visualization with Tableau Specialization",
                provider: "Coursera (UC Davis)",
                url: "https://www.coursera.org/specializations/data-visualization",
                duration: "5 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "IBM Data Science Professional Certificate",
                provider: "Coursera (IBM)",
                url: "https://www.coursera.org/professional-certificates/ibm-data-science",
                duration: "8 weeks · Certificate"
            },
            {
                title: "Statistical Inference & Predictive Analytics",
                provider: "Coursera (Johns Hopkins)",
                url: "https://www.coursera.org/learn/statistical-inference",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Advanced SQL & Data Warehousing",
                provider: "Kaggle Learn",
                url: "https://www.kaggle.com/learn/advanced-sql",
                duration: "4 weeks · Free"
            }
        ]
    },
    ai: {
        Beginner: [
            {
                title: "Python for Data Science, AI & Development",
                provider: "Coursera (IBM)",
                url: "https://www.coursera.org/learn/python-for-applied-data-science-ai",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Mathematics for Machine Learning Specialization",
                provider: "Coursera (Imperial College)",
                url: "https://www.coursera.org/specializations/mathematics-machine-learning",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Intro to Machine Learning",
                provider: "Kaggle Learn",
                url: "https://www.kaggle.com/learn/intro-to-machine-learning",
                duration: "3 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "Machine Learning Specialization (Andrew Ng)",
                provider: "Coursera (DeepLearning.AI)",
                url: "https://www.coursera.org/specializations/machine-learning-introduction",
                duration: "8 weeks · Certificate"
            },
            {
                title: "Deep Learning Specialization",
                provider: "Coursera (DeepLearning.AI)",
                url: "https://www.coursera.org/specializations/deep-learning",
                duration: "8 weeks · Certificate"
            },
            {
                title: "Practical Deep Learning for Coders",
                provider: "fast.ai",
                url: "https://course.fast.ai/",
                duration: "6 weeks · Free"
            }
        ],
        Advanced: [
            {
                title: "Generative AI with Large Language Models",
                provider: "Coursera (AWS & DeepLearning.AI)",
                url: "https://www.coursera.org/learn/generative-ai-with-llms",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Machine Learning Engineering for Production (MLOps)",
                provider: "Coursera (DeepLearning.AI)",
                url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Hugging Face NLP & Transformers Course",
                provider: "Hugging Face",
                url: "https://huggingface.co/learn/nlp-course/",
                duration: "5 weeks · Free"
            }
        ]
    },
    cyber: {
        Beginner: [
            {
                title: "Google Cybersecurity Professional Certificate",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/professional-certificates/google-cybersecurity",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Introduction to Cybersecurity",
                provider: "Cisco Networking Academy",
                url: "https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity",
                duration: "4 weeks · Free"
            },
            {
                title: "Linux Fundamentals & Command Line Basics",
                provider: "edX (Linux Foundation)",
                url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
                duration: "4 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "IBM Cybersecurity Analyst Professional Certificate",
                provider: "Coursera (IBM)",
                url: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Information Security Certification",
                provider: "freeCodeCamp",
                url: "https://www.freecodecamp.org/learn/information-security/",
                duration: "5 weeks · Free"
            },
            {
                title: "Web Security Academy (OWASP Top 10 Labs)",
                provider: "PortSwigger",
                url: "https://portswigger.net/web-security",
                duration: "6 weeks · Free"
            }
        ],
        Advanced: [
            {
                title: "Incident Response, Forensics & SIEM Operations",
                provider: "Coursera (Palo Alto Networks)",
                url: "https://www.coursera.org/specializations/palo-alto-networks-cybersecurity",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Ethical Hacking & Penetration Testing Path",
                provider: "TryHackMe",
                url: "https://tryhackme.com/",
                duration: "6 weeks · Interactive Labs"
            },
            {
                title: "Cloud Security Architecture & Zero Trust",
                provider: "Coursera (ISC2)",
                url: "https://www.coursera.org/specializations/isc2-ccsp-cloud-security",
                duration: "5 weeks · Certificate"
            }
        ]
    },
    cloud: {
        Beginner: [
            {
                title: "AWS Cloud Practitioner Essentials",
                provider: "Coursera (AWS)",
                url: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Introduction to Linux & Bash Scripting",
                provider: "edX (Linux Foundation)",
                url: "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
                duration: "4 weeks · Free"
            },
            {
                title: "Computer Networking Fundamentals",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/learn/computer-networking",
                duration: "4 weeks · Certificate"
            }
        ],
        Intermediate: [
            {
                title: "Docker, Kubernetes & OpenShift Containers",
                provider: "Coursera (IBM)",
                url: "https://www.coursera.org/learn/ibm-containers-docker-kubernetes-openshift",
                duration: "5 weeks · Certificate"
            },
            {
                title: "DevOps and AI on AWS Specialization (CI/CD)",
                provider: "Coursera (AWS)",
                url: "https://www.coursera.org/specializations/aws-devops",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Terraform Infrastructure as Code Tutorials",
                provider: "HashiCorp Developer",
                url: "https://developer.hashicorp.com/terraform/tutorials",
                duration: "4 weeks · Free"
            }
        ],
        Advanced: [
            {
                title: "Preparing for Google Cloud Architect Certificate",
                provider: "Coursera (Google Cloud)",
                url: "https://www.coursera.org/professional-certificates/gcp-cloud-architect",
                duration: "7 weeks · Certificate"
            },
            {
                title: "Site Reliability Engineering (SRE): Measuring & Managing Reliability",
                provider: "Coursera (Google Cloud)",
                url: "https://www.coursera.org/learn/site-reliability-engineering-slos",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Kubernetes & Cloud Native Associate (KCNA)",
                provider: "edX (Linux Foundation)",
                url: "https://www.edx.org/learn/kubernetes",
                duration: "6 weeks · Certificate"
            }
        ]
    },
    design: {
        Beginner: [
            {
                title: "Google UX Design Professional Certificate",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/professional-certificates/google-ux-design",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Graphic Design Specialization (Typography & Color)",
                provider: "Coursera (CalArts)",
                url: "https://www.coursera.org/specializations/graphic-design",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Figma UI/UX Design Essentials",
                provider: "Figma Learn",
                url: "https://help.figma.com/hc/en-us/categories/360002051613-Get-started",
                duration: "3 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "UI / UX Design Specialization (Wireframes & Prototypes)",
                provider: "Coursera (CalArts)",
                url: "https://www.coursera.org/specializations/ui-ux-design",
                duration: "6 weeks · Certificate"
            },
            {
                title: "User Experience Research and Design",
                provider: "Coursera (Univ. of Michigan)",
                url: "https://www.coursera.org/specializations/michiganux",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Interaction Design Specialization",
                provider: "Coursera (UC San Diego)",
                url: "https://www.coursera.org/specializations/interaction-design",
                duration: "6 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "Design Systems & Component Architecture in Figma",
                provider: "DesignSystems.com",
                url: "https://www.designsystems.com/",
                duration: "4 weeks · Free"
            },
            {
                title: "Web Accessibility (WCAG) by W3C",
                provider: "edX (W3Cx)",
                url: "https://www.edx.org/learn/web-accessibility/the-world-wide-web-consortium-w3c-introduction-to-web-accessibility",
                duration: "4 weeks · Free"
            },
            {
                title: "Digital Product Management & Design Leadership",
                provider: "Coursera (Univ. of Virginia)",
                url: "https://www.coursera.org/specializations/uva-darden-digital-product-management",
                duration: "5 weeks · Certificate"
            }
        ]
    },
    business: {
        Beginner: [
            {
                title: "Business Analysis & Process Management",
                provider: "Coursera",
                url: "https://www.coursera.org/projects/business-analysis-process-management",
                duration: "3 weeks · Certificate"
            },
            {
                title: "Google Business Intelligence & Analytics Certificate",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/professional-certificates/google-business-intelligence",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Google Project Management Professional Certificate",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/professional-certificates/google-project-management",
                duration: "6 weeks · Certificate"
            }
        ],
        Intermediate: [
            {
                title: "Digital Product Management Specialization",
                provider: "Coursera (Univ. of Virginia)",
                url: "https://www.coursera.org/specializations/uva-darden-digital-product-management",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Agile with Atlassian Jira & Scrum Workflows",
                provider: "Coursera (Atlassian)",
                url: "https://www.coursera.org/learn/agile-atlassian-jira",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Business Analytics Specialization (SQL & KPIs)",
                provider: "Coursera (Wharton)",
                url: "https://www.coursera.org/specializations/business-analytics",
                duration: "6 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "Strategic Leadership and Management Specialization",
                provider: "Coursera (Univ. of Illinois)",
                url: "https://www.coursera.org/specializations/strategic-leadership",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Operations & Supply Chain Analytics",
                provider: "edX (MITx)",
                url: "https://www.edx.org/masters/micromasters/mitx-supply-chain-management",
                duration: "8 weeks · Certificate"
            },
            {
                title: "AI Product Management Specialization",
                provider: "Coursera (Duke University)",
                url: "https://www.coursera.org/specializations/ai-product-management-duke",
                duration: "5 weeks · Certificate"
            }
        ]
    },
    finance: {
        Beginner: [
            {
                title: "Financial Markets (by Prof. Robert Shiller)",
                provider: "Coursera (Yale University)",
                url: "https://www.coursera.org/learn/financial-markets-global",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Introduction to Financial Accounting",
                provider: "Coursera (Wharton)",
                url: "https://www.coursera.org/learn/wharton-accounting",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Excel for Corporate Finance & Accounting",
                provider: "Corporate Finance Institute (CFI)",
                url: "https://corporatefinanceinstitute.com/course/excel-fundamentals-formulas-for-finance/",
                duration: "3 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "Business and Financial Modeling Specialization",
                provider: "Coursera (Wharton)",
                url: "https://www.coursera.org/specializations/wharton-business-financial-modeling",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Corporate Finance & Valuation Essentials",
                provider: "Coursera (NYU Stern / Wharton)",
                url: "https://www.coursera.org/learn/wharton-finance",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Financial Statement Analysis & Reporting",
                provider: "edX (New York Institute of Finance)",
                url: "https://www.edx.org/learn/financial-analysis",
                duration: "5 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "Investment Management & Portfolio Optimization",
                provider: "Coursera (Univ. of Geneva)",
                url: "https://www.coursera.org/specializations/investment-management",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Financial Risk Management & Derivatives",
                provider: "Coursera (Columbia University)",
                url: "https://www.coursera.org/specializations/financialengineering",
                duration: "7 weeks · Certificate"
            },
            {
                title: "Python and Statistics for Financial Analysis",
                provider: "Coursera (HKUST)",
                url: "https://www.coursera.org/learn/python-statistics-financial-analysis",
                duration: "4 weeks · Certificate"
            }
        ]
    },
    healthcare: {
        Beginner: [
            {
                title: "Design and Interpretation of Clinical Trials",
                provider: "Coursera (Johns Hopkins)",
                url: "https://www.coursera.org/learn/clinical-trials",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Epidemiology: The Basic Science of Public Health",
                provider: "Coursera (UNC Chapel Hill)",
                url: "https://www.coursera.org/learn/epidemiology",
                duration: "4 weeks · Certificate"
            },
            {
                title: "Healthcare Organization & Delivery Systems",
                provider: "Coursera (Rutgers University)",
                url: "https://www.coursera.org/specializations/healthcare-organization-operations",
                duration: "4 weeks · Certificate"
            }
        ],
        Intermediate: [
            {
                title: "Health Informatics Specialization (EHR, HL7 & FHIR)",
                provider: "Coursera (Johns Hopkins)",
                url: "https://www.coursera.org/specializations/health-informatics",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Data Management for Clinical Research (REDCap & CDISC)",
                provider: "Coursera (Vanderbilt University)",
                url: "https://www.coursera.org/learn/clinical-data-management",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Biostatistics in Public Health Specialization",
                provider: "Coursera (Johns Hopkins)",
                url: "https://www.coursera.org/specializations/biostatistics-public-health",
                duration: "6 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "Drug Development, Pharmacovigilance & Regulatory Affairs",
                provider: "Coursera (UC San Diego)",
                url: "https://www.coursera.org/specializations/drug-development-product-management",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Clinical Data Science & Healthcare Analytics",
                provider: "Coursera (Univ. of Colorado)",
                url: "https://www.coursera.org/specializations/clinical-data-science",
                duration: "6 weeks · Certificate"
            },
            {
                title: "WHO OpenWHO Public Health & Pharmacovigilance Courses",
                provider: "World Health Organization (WHO)",
                url: "https://openwho.org/",
                duration: "4 weeks · Free Certificate"
            }
        ]
    },
    general: {
        Beginner: [
            {
                title: "Learning How to Learn & Research Foundations",
                provider: "Coursera (DeepTeaching Solutions)",
                url: "https://www.coursera.org/learn/learning-how-to-learn",
                duration: "4 weeks · Free"
            },
            {
                title: "Professional Communication & Technical Writing",
                provider: "Coursera (UC Irvine)",
                url: "https://www.coursera.org/specializations/career-success",
                duration: "4 weeks · Certificate"
            },
            {
                title: "SWAYAM / NPTEL National Online Courses Catalog",
                provider: "NPTEL (IITs & IISc)",
                url: "https://onlinecourses.nptel.ac.in/",
                duration: "4–8 weeks · Free"
            }
        ],
        Intermediate: [
            {
                title: "Data Literacy & Evidence-Based Decision Making",
                provider: "edX",
                url: "https://www.edx.org/",
                duration: "5 weeks · Certificate"
            },
            {
                title: "Project Planning, Compliance & Stakeholder Management",
                provider: "Coursera (Google)",
                url: "https://www.coursera.org/professional-certificates/google-project-management",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Digital Tools & Domain Workflows Specialization",
                provider: "Coursera",
                url: "https://www.coursera.org/browse",
                duration: "5 weeks · Certificate"
            }
        ],
        Advanced: [
            {
                title: "Capstone Project, Portfolio & Industry Readiness",
                provider: "Coursera",
                url: "https://www.coursera.org/",
                duration: "6 weeks · Certificate"
            },
            {
                title: "Advanced Leadership, Governance & Ethics",
                provider: "edX",
                url: "https://www.edx.org/",
                duration: "5 weeks · Certificate"
            },
            {
                title: "NPTEL Advanced Domain Certification Track",
                provider: "NPTEL (IITs)",
                url: "https://onlinecourses.nptel.ac.in/",
                duration: "8 weeks · Certificate"
            }
        ]
    }
};

function detectDomainKey(careerName = "") {
    const name = careerName.toLowerCase();
    if (name.includes("web")) return "web";
    if (name.includes("ai/ml") || name.includes("machine learning") || name.includes("data scientist")) return "ai";
    if (name.includes("data analyst") || name.includes("analytics")) return "data";
    if (name.includes("cyber") || name.includes("security")) return "cyber";
    if (name.includes("cloud") || name.includes("devops") || name.includes("database")) return "cloud";
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
    if (name.includes("ui/ux") || name.includes("graphic") || name.includes("product design") || name.includes("instructional design") || name.includes("design")) {
        return "design";
    }
    if (name.includes("financial") || name.includes("account") || name.includes("investment") || name.includes("compliance")) {
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

function buildExtraStep(careerName, stepIndex, level, domainKey) {
    const templates = [
        {
            title: `${careerName} industry project & case study`,
            description: `Apply your ${level.toLowerCase()} skills to an end-to-end ${careerName} project modeled on real organization workflows.`,
            whyItMatters: `Hands-on project artifacts prove to hiring managers that you can translate theory into practical ${careerName} deliverables.`,
            topics: [
                "End-to-end problem framing",
                "Real-world dataset / workflow execution",
                "Documentation & stakeholder presentation",
                "Quality review & best practices"
            ],
            practice: `Complete and document one full ${careerName} case study and publish your structured write-up in your portfolio.`,
            estimatedWeeks: 4
        },
        {
            title: `Advanced ${careerName} systems, standards & optimization`,
            description: `Master industry standards, quality assurance, and scalable workflows used by senior ${careerName} professionals.`,
            whyItMatters: `Senior teams expect you to work reliably under production constraints, regulatory standards, and cross-functional reviews.`,
            topics: [
                "Industry standards & governance",
                "Workflow optimization & automation",
                "Cross-functional collaboration",
                "Performance & quality auditing"
            ],
            practice: `Audit an existing ${careerName} workflow or project and produce an optimization & compliance checklist.`,
            estimatedWeeks: 4
        },
        {
            title: `Portfolio capstone & interview readiness for ${careerName}`,
            description: `Package your projects into a job-ready portfolio and practice technical/case interviews for ${careerName} roles.`,
            whyItMatters: `A clear portfolio with 2–3 well-explained projects and confident case walkthroughs is the fastest way to land interviews.`,
            topics: [
                "Capstone portfolio presentation",
                "Case study storytelling (Problem → Approach → Impact)",
                "Role-specific technical & scenario questions",
                "Resume & LinkedIn optimization"
            ],
            practice: `Publish your 3 best projects and conduct two timed mock interviews covering core ${careerName} scenarios.`,
            estimatedWeeks: 3
        }
    ];
    return templates[stepIndex % templates.length];
}

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB:", MONGO_URI);

    const roadmaps = await Roadmap.find()
        .populate("career", "name")
        .populate("careerId", "name");

    console.log(`Found ${roadmaps.length} roadmaps to enrich...`);

    for (const roadmap of roadmaps) {
        const careerName =
            roadmap.career?.name ||
            roadmap.careerId?.name ||
            roadmap.title?.replace(/ Roadmap$/i, "") ||
            "Career";

        const existingSteps = Array.isArray(roadmap.steps) ? [...roadmap.steps] : [];
        const domainKey = detectDomainKey(careerName, existingSteps);
        const domainPack = DOMAIN_COURSES[domainKey] || DOMAIN_COURSES.general;

        // Ensure we have 9 steps (3 Beginner, 3 Intermediate, 3 Advanced) while preserving all existing steps & their _ids
        const paddedSteps = [...existingSteps];
        let extraIdx = 0;
        while (paddedSteps.length < 9) {
            const extra = buildExtraStep(careerName, extraIdx, "Advanced", domainKey);
            paddedSteps.push(extra);
            extraIdx++;
        }

        // Assign level and courses to each step:
        // First 3 -> Beginner, Next 3 -> Intermediate, Remaining (3+) -> Advanced
        const updatedSteps = paddedSteps.map((s, idx) => {
            const plain = s.toObject ? s.toObject() : { ...s };
            let level = "Advanced";
            if (idx < 3) level = "Beginner";
            else if (idx < 6) level = "Intermediate";

            const levelCourses = domainPack[level] || DOMAIN_COURSES.general[level];
            const primaryCourse = levelCourses[idx % levelCourses.length];
            const secondaryCourse = levelCourses[(idx + 1) % levelCourses.length];

            return {
                ...plain,
                stepNumber: idx + 1,
                order: idx + 1,
                level,
                courses: [primaryCourse, secondaryCourse].filter(Boolean)
            };
        });

        roadmap.steps = updatedSteps;
        roadmap.set("levelCourses", domainPack, { strict: false });
        await roadmap.save();
        console.log(
            `Updated roadmap for "${careerName}" (${domainKey}) -> ${updatedSteps.length} steps (3 Beginner, 3 Intermediate, ${updatedSteps.length - 6} Advanced)`
        );
    }

    console.log("All roadmaps enriched successfully!");
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("Error updating roadmaps:", err);
    process.exit(1);
});
