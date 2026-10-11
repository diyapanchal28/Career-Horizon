require("dotenv").config();
const mongoose = require("mongoose");
const Field = require("./models/Field");
const Subfield = require("./models/Subfield");
const Career = require("./models/Career");
const Roadmap = require("./models/Roadmap");

async function seedHealthcareData() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Ensure all existing Subfields have both `field` and `fieldId` populated
    const allSubs = await Subfield.find().lean();
    for (const sub of allSubs) {
        const fId = sub.fieldId || sub.field;
        if (fId && (!sub.field || !sub.fieldId)) {
            await Subfield.updateOne(
                { _id: sub._id },
                { $set: { field: fId, fieldId: fId } }
            );
        }
    }

    // Remove temporary "Test Career" if present
    await Career.deleteMany({ name: "Test Career" });

    // 2. Locate Healthcare Field
    let healthcareField = await Field.findOne({ name: "Healthcare" });
    if (!healthcareField) {
        healthcareField = await Field.create({
            name: "Healthcare",
            description:
                "Clinical operations, medical technology, public health, clinical research, health informatics and pharmaceutical sciences.",
            icon: "HeartPulse"
        });
    } else {
        healthcareField.description =
            "Clinical operations, medical technology, public health, clinical research, health informatics and pharmaceutical sciences.";
        await healthcareField.save();
    }

    const healthcareFieldId = healthcareField._id;

    // 3. Upsert the 3 new Healthcare Subfields (plus ensure existing 3 are present = 6 total)
    const healthcareSubfieldsData = [
        {
            name: "Healthcare Management",
            slug: "healthcare-management",
            description: "Running hospitals, clinics and health programmes."
        },
        {
            name: "Medical Technology",
            slug: "medical-technology",
            description: "Clinical systems, diagnostics and health data coordination."
        },
        {
            name: "Public Health",
            slug: "public-health",
            description: "Disease prevention, epidemiology and community health policy."
        },
        {
            name: "Clinical Research & Trials",
            slug: "clinical-research-trials",
            description:
                "Designing, managing and monitoring clinical trials for new medicines, therapies and medical devices."
        },
        {
            name: "Health Informatics & Analytics",
            slug: "health-informatics-analytics",
            description:
                "Using electronic health records, clinical data and analytics to improve patient care and hospital outcomes."
        },
        {
            name: "Pharmaceutical & Biotech Sciences",
            slug: "pharmaceutical-biotech-sciences",
            description:
                "Developing, evaluating and monitoring the safety and regulatory compliance of medicines and biologics."
        }
    ];

    const subfieldMap = {};
    for (const subData of healthcareSubfieldsData) {
        let sub = await Subfield.findOne({
            name: subData.name,
            $or: [{ fieldId: healthcareFieldId }, { field: healthcareFieldId }]
        });

        if (!sub) {
            sub = await Subfield.create({
                name: subData.name,
                slug: subData.slug,
                description: subData.description,
                field: healthcareFieldId,
                fieldId: healthcareFieldId,
                isActive: true
            });
            console.log(`Created Healthcare subfield: ${sub.name}`);
        } else {
            sub.slug = subData.slug;
            sub.description = subData.description;
            sub.field = healthcareFieldId;
            sub.fieldId = healthcareFieldId;
            sub.isActive = true;
            await sub.save();
            console.log(`Updated Healthcare subfield: ${sub.name}`);
        }
        subfieldMap[subData.name] = sub._id;
    }

    // Update existing Healthcare careers with activity-based workPreferences
    await Career.updateOne(
        { name: "Healthcare Administrator" },
        {
            $set: {
                workInterests: ["Management", "Helping People", "Communication", "Problem Solving"],
                workPreferences: [
                    "Planning & Organizing",
                    "Explaining & Communicating",
                    "Finding & Solving Problems",
                    "Analyzing Data"
                ]
            }
        }
    );

    await Career.updateOne(
        { name: "Clinical Data Coordinator" },
        {
            $set: {
                workInterests: ["Working with Data", "Research", "Technology", "Helping People"],
                workPreferences: [
                    "Analyzing Data",
                    "Research & Investigation",
                    "Finding & Solving Problems",
                    "Planning & Organizing"
                ]
            }
        }
    );

    // 4. Define the new Healthcare Careers + Roadmaps
    const newHealthcareCareers = [
        {
            career: {
                name: "Clinical Research Associate (CRA)",
                slug: "clinical-research-associate",
                fieldId: healthcareFieldId,
                subfieldId: subfieldMap["Clinical Research & Trials"],
                shortDescription:
                    "Monitors clinical trials at hospital sites to ensure new medicines and treatments are tested safely, ethically and accurately.",
                description:
                    "A Clinical Research Associate (CRA) acts as the primary bridge between pharmaceutical sponsors and hospital trial sites. They verify patient safety, audit clinical trial data against protocol requirements, and ensure strict adherence to Good Clinical Practice (ICH-GCP) regulations.",
                suitableFor:
                    "Detail-oriented life science, pharmacy or healthcare graduates who enjoy research investigation, structured compliance and improving patient treatments.",
                education: {
                    minimumQualification: "Undergraduate",
                    preferredDegrees: [
                        "B.Pharm / M.Pharm",
                        "B.Sc. / M.Sc. Clinical Research",
                        "Biotechnology / Microbiology",
                        "BDS / Nursing / Allied Health Sciences"
                    ],
                    certifications: [
                        "ICH-GCP Clinical Trial Monitoring Certification",
                        "Postgraduate Diploma in Clinical Research (PGDCR)",
                        "ACRP or SOCRA Clinical Research Certification"
                    ],
                    entryLevelNote:
                        "Many professionals start as a Clinical Trial Assistant (CTA) or Site Coordinator before advancing to CRA."
                },
                technicalSkills: [
                    "ICH-GCP Guidelines",
                    "Clinical Trial Monitoring",
                    "Electronic Data Capture (EDC)",
                    "Protocol & Regulatory Compliance",
                    "Adverse Event Reporting (SAE)",
                    "Source Data Verification (SDV)"
                ],
                professionalSkills: [
                    "Attention to Detail",
                    "Ethical Judgment",
                    "Clear Documentation",
                    "Communication with Investigators",
                    "Time & Site Management"
                ],
                responsibilities: [
                    "Conduct site initiation, routine monitoring and close-out visits at hospitals",
                    "Verify that patient consent and trial procedures follow the approved protocol",
                    "Perform Source Data Verification (SDV) against electronic case report forms",
                    "Review and escalate Serious Adverse Events (SAEs) within regulatory timelines",
                    "Maintain Trial Master File (TMF) documentation and audit readiness"
                ],
                workInterests: [
                    "Research",
                    "Helping People",
                    "Working with Data",
                    "Problem Solving",
                    "Communication"
                ],
                workPreferences: [
                    "Research & Investigation",
                    "Planning & Organizing",
                    "Analyzing Data",
                    "Finding & Solving Problems"
                ],
                salary: {
                    bands: [
                        {
                            label: "Entry Level",
                            min: 400000,
                            max: 700000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Mid Level",
                            min: 800000,
                            max: 1600000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Experienced",
                            min: 1700000,
                            max: 3000000,
                            currency: "INR",
                            period: "per year"
                        }
                    ],
                    note: "Example ranges for demonstration. Global CROs and pharmaceutical sponsors typically offer higher packages."
                },
                demand: {
                    level: "High",
                    note: "Strong demand across global Contract Research Organisations (CROs) and pharmaceutical R&D centres in India."
                },
                careerGrowth: [
                    { order: 1, title: "Clinical Trial Assistant (CTA)", experience: "0-1.5 years" },
                    { order: 2, title: "Clinical Research Associate (CRA I / II)", experience: "1.5-4 years" },
                    { order: 3, title: "Senior CRA / Lead Monitor", experience: "4-7 years" },
                    { order: 4, title: "Clinical Trial Manager (CTM)", experience: "7+ years" }
                ],
                sources: [
                    {
                        label: "Career Horizon healthcare dataset (illustrative example data)",
                        url: ""
                    }
                ],
                lastUpdated: new Date(),
                isActive: true
            },
            roadmap: {
                title: "Clinical Research Associate (CRA) Roadmap",
                summary:
                    "Build a foundation in clinical pharmacology and ICH-GCP ethics, then master site monitoring, EDC systems and regulatory documentation.",
                steps: [
                    {
                        stepNumber: 1,
                        order: 1,
                        title: "Drug development lifecycle & clinical trial phases",
                        description:
                            "Learn how a new molecule moves from preclinical discovery through Phase I, II, III and IV human trials.",
                        whyItMatters:
                            "Every monitoring decision depends on understanding the objective and risk profile of the trial phase you are managing.",
                        topics: [
                            "Preclinical toxicology basics",
                            "Phase I safety & dosing studies",
                            "Phase II/III randomized controlled trials",
                            "Phase IV post-marketing surveillance",
                            "Roles of Sponsor, CRO, Investigator and Ethics Committee"
                        ],
                        practice:
                            "Summarize the study design, endpoints and inclusion criteria of a real trial listed on ClinicalTrials.gov or CTRI.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 2,
                        order: 2,
                        title: "ICH-GCP guidelines, ethics & Indian regulatory framework",
                        description:
                            "Master Good Clinical Practice (ICH E6 R2/R3), informed consent rules, and New Drugs and Clinical Trials (NDCT) Rules.",
                        whyItMatters:
                            "Protecting patient rights and data integrity is the core legal and ethical duty of a CRA.",
                        topics: [
                            "Declaration of Helsinki & Belmont Report",
                            "ICH-GCP E6 principles",
                            "Informed Consent Form (ICF) process",
                            "Institutional Ethics Committee (IEC) submissions",
                            "CDSCO & NDCT Rules in India"
                        ],
                        practice:
                            "Review a sample Informed Consent Form and checklist all mandatory elements required by ICH-GCP.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 3,
                        order: 3,
                        title: "Essential trial documents & Trial Master File (eTMF)",
                        description:
                            "Learn the essential documents required before, during and after a clinical study.",
                        whyItMatters:
                            "In clinical research, if it is not documented in the TMF/ISF, it did not happen.",
                        topics: [
                            "Clinical Study Protocol & Investigator's Brochure (IB)",
                            "Investigator Site File (ISF) vs Trial Master File (eTMF)",
                            "ALCOA+ data integrity principles",
                            "Delegation of Authority Log",
                            "Investigational Product (IP) accountability logs"
                        ],
                        practice:
                            "Create an audit checklist for an Investigator Site File using ALCOA+ standards.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 4,
                        order: 4,
                        title: "Electronic Data Capture (EDC) & Source Data Verification",
                        description:
                            "Understand how hospital source records are entered into eCRFs and verified by monitors.",
                        whyItMatters:
                            "CRAs spend a large portion of site visits cross-checking patient medical charts against EDC entries.",
                        topics: [
                            "Electronic Case Report Forms (eCRF)",
                            "Source Data Verification (SDV) & Source Data Review (SDR)",
                            "Query raising and resolution workflows",
                            "Medidata Rave / Oracle Clinical overview",
                            "Protocol deviation identification"
                        ],
                        practice:
                            "Compare a mock patient hospital chart with an eCRF entry, spot 5 discrepancies, and write clear data queries.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 5,
                        order: 5,
                        title: "Safety reporting & Serious Adverse Events (SAEs)",
                        description:
                            "Learn how adverse events are graded, documented and reported within strict regulatory timelines.",
                        whyItMatters:
                            "Missing a 24-hour Serious Adverse Event reporting window can endanger patients and halt a trial.",
                        topics: [
                            "AE vs SAE vs SUSAR definitions",
                            "Causality and severity assessment",
                            "24-hour SAE reporting workflows",
                            "Safety narratives and follow-up reports",
                            "Risk-Based Monitoring (RBM) signals"
                        ],
                        practice:
                            "Draft a mock SAE initial notification report from a clinical case scenario.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 6,
                        order: 6,
                        title: "Site visits & monitoring report writing",
                        description:
                            "Learn how to conduct Site Selection, Site Initiation (SIV), Routine Monitoring (RMV) and Close-Out Visits (COV).",
                        whyItMatters:
                            "Clear, objective monitoring visit reports and follow-up letters are the primary deliverables of a working CRA.",
                        topics: [
                            "Pre-visit preparation and agenda planning",
                            "Site Initiation Visit (SIV) training delivery",
                            "Routine Monitoring Visit execution",
                            "Writing Monitoring Visit Reports (MVR) & Follow-Up Letters",
                            "CAPA (Corrective and Preventive Action) plans"
                        ],
                        practice:
                            "Write a structured Monitoring Visit Follow-Up Letter addressing two protocol deviations and a Corrective Action plan.",
                        estimatedWeeks: 4
                    }
                ]
            }
        },
        {
            career: {
                name: "Health Informatics Specialist",
                slug: "health-informatics-specialist",
                fieldId: healthcareFieldId,
                subfieldId: subfieldMap["Health Informatics & Analytics"],
                shortDescription:
                    "Connects clinical care with data systems — designing electronic health workflows, interoperability pipelines and clinical dashboards.",
                description:
                    "A Health Informatics Specialist bridges clinicians, hospital administrators and IT teams. They configure Electronic Health Record (EHR) systems, ensure health data interoperability using standards like HL7 FHIR, and build clinical analytics that reduce medical errors and improve patient outcomes.",
                suitableFor:
                    "People who enjoy both healthcare and technology, and want to use data and digital systems to make clinical care safer and faster.",
                education: {
                    minimumQualification: "Undergraduate",
                    preferredDegrees: [
                        "B.Tech / B.Sc. Health Informatics or Computer Science",
                        "M.Sc. IT / Data Science with Healthcare focus",
                        "B.Pharm / Allied Health + Health Informatics Postgraduate",
                        "MHA / MBA Healthcare IT"
                    ],
                    certifications: [
                        "HL7 FHIR Fundamentals Certification",
                        "CAHIMS / CPHIMS (HIMSS Health Informatics)",
                        "SQL & Healthcare Data Analytics Certification"
                    ],
                    entryLevelNote:
                        "Candidates enter either from IT/Analytics by learning clinical workflows, or from healthcare by learning SQL, EHR systems and data analytics."
                },
                technicalSkills: [
                    "Electronic Health Records (EHR / HIS)",
                    "HL7 & FHIR Interoperability",
                    "SQL & Clinical Databases",
                    "ICD-10 & SNOMED-CT Terminologies",
                    "Power BI / Tableau Clinical Dashboards",
                    "Health Data Privacy & Security"
                ],
                professionalSkills: [
                    "Clinical Workflow Analysis",
                    "Cross-Functional Communication",
                    "Problem Solving",
                    "Change Management",
                    "Requirements Gathering"
                ],
                responsibilities: [
                    "Configure and optimize Electronic Health Record (EHR) and Hospital Information Systems",
                    "Build clinical quality, bed-occupancy and patient-outcome dashboards",
                    "Map clinical data across systems using HL7, FHIR, ICD-10 and SNOMED-CT standards",
                    "Collaborate with doctors and nurses to streamline digital charting workflows",
                    "Ensure compliance with health data security, audit trails and patient privacy standards"
                ],
                workInterests: [
                    "Technology",
                    "Working with Data",
                    "Problem Solving",
                    "Helping People",
                    "Communication"
                ],
                workPreferences: [
                    "Analyzing Data",
                    "Building Technology",
                    "Finding & Solving Problems",
                    "Planning & Organizing"
                ],
                salary: {
                    bands: [
                        {
                            label: "Entry Level",
                            min: 500000,
                            max: 900000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Mid Level",
                            min: 1000000,
                            max: 1850000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Experienced",
                            min: 1900000,
                            max: 3500000,
                            currency: "INR",
                            period: "per year"
                        }
                    ],
                    note: "Example ranges for demonstration. Health-tech companies, hospital chains and global healthcare capability centres pay competitively."
                },
                demand: {
                    level: "High",
                    note: "Rapid digitisation of hospitals, ABDM (Ayushman Bharat Digital Mission) and telemedicine are driving strong demand."
                },
                careerGrowth: [
                    { order: 1, title: "Health Informatics Analyst", experience: "0-2 years" },
                    { order: 2, title: "Health Informatics Specialist", experience: "2-5 years" },
                    { order: 3, title: "Clinical Systems Lead / Architect", experience: "5-8 years" },
                    { order: 4, title: "Director of Health Informatics", experience: "8+ years" }
                ],
                sources: [
                    {
                        label: "Career Horizon healthcare dataset (illustrative example data)",
                        url: ""
                    }
                ],
                lastUpdated: new Date(),
                isActive: true
            },
            roadmap: {
                title: "Health Informatics Specialist Roadmap",
                summary:
                    "Master clinical data workflows, EHR systems, medical terminologies (ICD-10, SNOMED) and HL7 FHIR interoperability along with SQL and analytics.",
                steps: [
                    {
                        stepNumber: 1,
                        order: 1,
                        title: "Clinical workflows & Electronic Health Records (EHR)",
                        description:
                            "Understand how patient data flows across outpatient, inpatient, laboratory, pharmacy and billing modules.",
                        whyItMatters:
                            "You cannot design or troubleshoot a hospital information system without knowing how clinicians actually use it during patient care.",
                        topics: [
                            "EHR vs EMR vs PHR architecture",
                            "Order Entry (CPOE) & Clinical Decision Support (CDS)",
                            "Laboratory (LIS) and Radiology (RIS/PACS) workflows",
                            "Revenue cycle & e-claim basics",
                            "Usability challenges for doctors and nurses"
                        ],
                        practice:
                            "Diagram the complete data flow of an inpatient admission from emergency triage to lab orders, medication administration and discharge summary.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 2,
                        order: 2,
                        title: "Standard medical terminologies & coding systems",
                        description:
                            "Learn how diagnoses, procedures, lab tests and medications are standardized across healthcare systems.",
                        whyItMatters:
                            "Structured coding is what turns messy clinical notes into searchable, interoperable health data.",
                        topics: [
                            "ICD-10 / ICD-11 diagnosis coding",
                            "SNOMED-CT clinical terms",
                            "LOINC for laboratory observations",
                            "RxNorm for clinical drugs",
                            "Mapping local hospital codes to standard vocabularies"
                        ],
                        practice:
                            "Map a sample set of 10 hospital diagnoses and lab tests to their standard ICD-10 and LOINC codes.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 3,
                        order: 3,
                        title: "SQL & clinical database querying",
                        description:
                            "Write SQL queries to extract patient cohorts, readmission rates, turnaround times and clinical quality metrics.",
                        whyItMatters:
                            "Almost all EHR reporting and population health analytics rely on relational databases.",
                        topics: [
                            "Patient, encounter, observation and medication tables",
                            "Complex JOINs, aggregations and window functions",
                            "Cohort identification queries",
                            "Handling longitudinal patient timestamps",
                            "Data cleaning for missing clinical values"
                        ],
                        practice:
                            "Query a public synthetic healthcare dataset (such as Synthea) to calculate 30-day hospital readmission rates by department.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 4,
                        order: 4,
                        title: "Healthcare interoperability: HL7 v2 & FHIR APIs",
                        description:
                            "Learn how modern health apps, wearables, labs and hospitals exchange clinical records securely.",
                        whyItMatters:
                            "FHIR (Fast Healthcare Interoperability Resources) REST APIs are the global and Indian (ABDM) standard for health data exchange.",
                        topics: [
                            "HL7 v2 ADT and ORU messages",
                            "FHIR Resources (Patient, Encounter, Observation, MedicationRequest)",
                            "RESTful JSON FHIR APIs",
                            "Ayushman Bharat Digital Mission (ABDM) health data standards",
                            "SMART on FHIR app integration"
                        ],
                        practice:
                            "Use a public FHIR sandbox server to fetch a Patient resource and their recent Observation vital signs via REST API.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 5,
                        order: 5,
                        title: "Clinical analytics & quality dashboards",
                        description:
                            "Build actionable dashboards for hospital operations, infection control and clinical outcomes.",
                        whyItMatters:
                            "Decision-makers need clear visual KPIs—like ICU bed occupancy, average length of stay (ALOS) and lab turnaround time.",
                        topics: [
                            "Clinical KPIs (ALOS, mortality, readmission, infection rates)",
                            "Operational KPIs (OPD wait time, bed occupancy)",
                            "Power BI / Tableau dashboard design for clinicians",
                            "Predictive risk stratification basics",
                            "Data storytelling for hospital boards"
                        ],
                        practice:
                            "Build an interactive hospital clinical & operational KPI dashboard using synthetic EHR data.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 6,
                        order: 6,
                        title: "Health data privacy, security & governance",
                        description:
                            "Learn how to protect sensitive patient health information and maintain regulatory compliance.",
                        whyItMatters:
                            "Healthcare data breaches carry severe legal penalties and erode patient trust.",
                        topics: [
                            "DPDP Act (India) & HIPAA privacy principles",
                            "De-identification and anonymization of patient records",
                            "Role-Based Access Control (RBAC) & break-glass access",
                            "Audit logging and encryption in transit/at rest",
                            "Ethical governance of clinical AI models"
                        ],
                        practice:
                            "Design a data de-identification and access-control policy for a hospital research analytics warehouse.",
                        estimatedWeeks: 3
                    }
                ]
            }
        },
        {
            career: {
                name: "Public Health Specialist",
                slug: "public-health-specialist",
                fieldId: healthcareFieldId,
                subfieldId: subfieldMap["Public Health"],
                shortDescription:
                    "Studies population health trends, designs disease-prevention programmes and shapes health policy at community or national scale.",
                description:
                    "While doctors treat individual patients, a Public Health Specialist protects entire communities. They analyse epidemiological data, investigate disease outbreaks, design maternal/child health and vaccination campaigns, and evaluate whether public health interventions actually work.",
                suitableFor:
                    "People who care deeply about community impact and want to combine data analysis, field research and health communication.",
                education: {
                    minimumQualification: "Undergraduate",
                    preferredDegrees: [
                        "Master of Public Health (MPH)",
                        "B.Sc. / M.Sc. Public Health or Epidemiology",
                        "MBBS / BDS / BAMS / BHMS / Nursing + MPH",
                        "MSW / Demography / Health Economics"
                    ],
                    certifications: [
                        "Field Epidemiology & Surveillance Training",
                        "Biostatistics & R / SPSS for Public Health",
                        "WHO Public Health Emergency Management courses"
                    ],
                    entryLevelNote:
                        "Entry roles are available in public health NGOs, research institutes, CSR health foundations, state health missions and international agencies."
                },
                technicalSkills: [
                    "Epidemiology & Disease Surveillance",
                    "Biostatistics (R / SPSS / Stata)",
                    "Health Programme Monitoring & Evaluation (M&E)",
                    "Survey Design & Field Data Collection",
                    "Public Health Policy Analysis",
                    "GIS Health Mapping"
                ],
                professionalSkills: [
                    "Community & Stakeholder Engagement",
                    "Health Communication",
                    "Report & Grant Writing",
                    "Program Planning",
                    "Cross-Cultural Empathy"
                ],
                responsibilities: [
                    "Collect and analyse epidemiological data on infectious and non-communicable diseases",
                    "Design, implement and evaluate community health and preventive screening programmes",
                    "Develop Monitoring & Evaluation (M&E) frameworks and impact indicators",
                    "Write policy briefs, technical reports and funding proposals for health initiatives",
                    "Coordinate with government health departments, frontline workers (ASHAs/ANMs) and NGOs"
                ],
                workInterests: [
                    "Helping People",
                    "Research",
                    "Working with Data",
                    "Communication",
                    "Planning & Management"
                ],
                workPreferences: [
                    "Research & Investigation",
                    "Analyzing Data",
                    "Planning & Organizing",
                    "Explaining & Communicating"
                ],
                salary: {
                    bands: [
                        {
                            label: "Entry Level",
                            min: 400000,
                            max: 750000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Mid Level",
                            min: 800000,
                            max: 1500000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Experienced",
                            min: 1600000,
                            max: 2800000,
                            currency: "INR",
                            period: "per year"
                        }
                    ],
                    note: "Example ranges for demonstration. Multilateral agencies (WHO, UNICEF, PATH), research institutes and large foundations offer higher bands."
                },
                demand: {
                    level: "High",
                    note: "Expanding focus on preventive healthcare, epidemiological surveillance, nutrition and digital public health programmes."
                },
                careerGrowth: [
                    { order: 1, title: "Public Health Research Associate / M&E Officer", experience: "0-2 years" },
                    { order: 2, title: "Public Health Specialist / Epidemiologist", experience: "2-5 years" },
                    { order: 3, title: "Senior Programme Manager — Public Health", experience: "5-9 years" },
                    { order: 4, title: "Director of Public Health Programmes / Policy Advisor", experience: "9+ years" }
                ],
                sources: [
                    {
                        label: "Career Horizon healthcare dataset (illustrative example data)",
                        url: ""
                    }
                ],
                lastUpdated: new Date(),
                isActive: true
            },
            roadmap: {
                title: "Public Health Specialist Roadmap",
                summary:
                    "Build strong foundations in epidemiology and biostatistics, then master field survey design, programme evaluation (M&E) and health policy communication.",
                steps: [
                    {
                        stepNumber: 1,
                        order: 1,
                        title: "Foundations of epidemiology",
                        description:
                            "Learn how disease frequency, risk factors and transmission patterns are measured across populations.",
                        whyItMatters:
                            "Epidemiology is the core science of public health—it tells you who is affected, where, and why.",
                        topics: [
                            "Incidence, prevalence and mortality rates",
                            "Cohort, case-control and cross-sectional study designs",
                            "Relative risk and odds ratios",
                            "Confounding, bias and screening test validity",
                            "Outbreak investigation steps"
                        ],
                        practice:
                            "Calculate incidence, prevalence and odds ratios from a sample foodborne outbreak dataset.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 2,
                        order: 2,
                        title: "Biostatistics & public health data analysis",
                        description:
                            "Learn to clean, analyse and interpret population health datasets using statistical tools.",
                        whyItMatters:
                            "Public health recommendations must be backed by statistically sound evidence.",
                        topics: [
                            "Descriptive statistics and confidence intervals",
                            "Hypothesis testing (t-test, chi-square, ANOVA)",
                            "Linear and logistic regression in health research",
                            "Analysing NFHS (National Family Health Survey) data",
                            "Using R, SPSS or Excel for biostatistics"
                        ],
                        practice:
                            "Analyse a district-level maternal or child health dataset (such as NFHS summary data) and visualize key disparities.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 3,
                        order: 3,
                        title: "Survey design & community health needs assessment",
                        description:
                            "Learn how to design valid questionnaires, sample populations and conduct ethical field surveys.",
                        whyItMatters:
                            "Poorly designed field surveys produce biased data that misdirects health funding.",
                        topics: [
                            "Sampling methods (cluster, stratified, systematic)",
                            "Designing structured KoboToolbox / ODK digital surveys",
                            "Qualitative methods (focus group discussions & key informant interviews)",
                            "Research ethics and community consent",
                            "Social determinants of health"
                        ],
                        practice:
                            "Build a mobile-ready community nutrition or hypertension screening survey form with validation logic.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 4,
                        order: 4,
                        title: "Health programme planning & Monitoring and Evaluation (M&E)",
                        description:
                            "Learn to design interventions using Logic Models and track their real-world impact.",
                        whyItMatters:
                            "Governments and donors fund programmes that can prove measurable improvements in health outcomes.",
                        topics: [
                            "Theory of Change & LogFrame (Inputs, Outputs, Outcomes, Impact)",
                            "Defining SMART public health indicators",
                            "Baseline, midline and endline evaluations",
                            "HMIS (Health Management Information System) reporting",
                            "Budgeting and resource allocation"
                        ],
                        practice:
                            "Create a complete LogFrame and M&E indicator matrix for a district anaemia-reduction programme.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 5,
                        order: 5,
                        title: "Health systems, national programmes & policy",
                        description:
                            "Understand India's public health architecture, national health missions and health financing.",
                        whyItMatters:
                            "Effective public health work operates through existing primary health centres, frontline workers and government schemes.",
                        topics: [
                            "Three-tier public health system (Sub-centres, PHCs, CHCs, District Hospitals)",
                            "National Health Mission (NHM) & Ayushman Bharat (PM-JAY & HWCs)",
                            "Role of ASHA, ANM and Anganwadi workers",
                            "Health economics and out-of-pocket expenditure",
                            "Writing evidence-based policy briefs"
                        ],
                        practice:
                            "Write a 2-page policy brief proposing a targeted intervention to improve immunization or NCD screening coverage.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 6,
                        order: 6,
                        title: "Social & Behaviour Change Communication (SBCC)",
                        description:
                            "Learn how to translate scientific findings into public health campaigns that change community behaviour.",
                        whyItMatters:
                            "Even the best medical intervention fails if communities do not understand or trust it.",
                        topics: [
                            "Behaviour change models (Health Belief Model, Socio-Ecological Model)",
                            "Designing culturally sensitive health messaging",
                            "Risk communication during outbreaks",
                            "Partnering with local community leaders",
                            "Measuring campaign reach and adoption"
                        ],
                        practice:
                            "Design a behaviour-change campaign strategy and field communication toolkit for dengue prevention or maternal nutrition.",
                        estimatedWeeks: 3
                    }
                ]
            }
        },
        {
            career: {
                name: "Pharmacovigilance & Drug Safety Associate",
                slug: "pharmacovigilance-drug-safety-associate",
                fieldId: healthcareFieldId,
                subfieldId: subfieldMap["Pharmaceutical & Biotech Sciences"],
                shortDescription:
                    "Monitors the safety of medicines after they reach patients, investigating adverse drug reactions and reporting safety signals to regulators.",
                description:
                    "A Pharmacovigilance (PV) & Drug Safety Associate investigates Adverse Drug Reactions (ADRs) reported by doctors, patients and clinical trials worldwide. They code medical events using MedDRA, write clinical case narratives in safety databases, detect emerging safety signals and ensure pharmaceutical companies meet FDA, EMA and CDSCO regulatory timelines.",
                suitableFor:
                    "Pharmacy, medical and life science graduates who enjoy medical case analysis, scientific writing and protecting patient safety.",
                education: {
                    minimumQualification: "Undergraduate",
                    preferredDegrees: [
                        "B.Pharm / M.Pharm",
                        "Pharm.D (Doctor of Pharmacy)",
                        "BDS / MBBS / BHMS / BAMS / Nursing",
                        "M.Sc. Pharmacology / Life Sciences"
                    ],
                    certifications: [
                        "Professional Certificate in Pharmacovigilance & Drug Safety",
                        "MedDRA Coding & Argus Safety Database Training",
                        "Uppsala Monitoring Centre (UMC) Signal Detection Basics"
                    ],
                    entryLevelNote:
                        "One of the largest entry pathways in India for Pharmacy, Pharm.D and Life Science graduates across global pharma capability centres and CROs."
                },
                technicalSkills: [
                    "ICSR Case Processing (Triage, Data Entry, Narratives)",
                    "MedDRA & WHO-DD Medical Coding",
                    "Oracle Argus / ArisG Safety Databases",
                    "Causality & Expectedness Assessment",
                    "Aggregate Safety Reports (PSUR / PBRER)",
                    "Global PV Regulations (ICH E2A-E2F, FDA, EMA, PvPI)"
                ],
                professionalSkills: [
                    "Medical & Scientific Writing",
                    "Critical Clinical Reasoning",
                    "High Precision & Quality Control",
                    "Regulatory Timeline Management",
                    "Team Collaboration"
                ],
                responsibilities: [
                    "Triage and process Individual Case Safety Reports (ICSRs) from clinical trials and post-marketing sources",
                    "Code adverse events and concomitant medications accurately using MedDRA and WHO-DD dictionaries",
                    "Write clear, medically accurate case narratives summarizing the patient's clinical course",
                    "Assess seriousness, listedness/expectedness and causality of adverse drug events",
                    "Support preparation of Periodic Safety Update Reports (PSURs) and safety signal detection"
                ],
                workInterests: [
                    "Research",
                    "Helping People",
                    "Working with Data",
                    "Problem Solving",
                    "Communication"
                ],
                workPreferences: [
                    "Research & Investigation",
                    "Analyzing Data",
                    "Finding & Solving Problems",
                    "Explaining & Communicating"
                ],
                salary: {
                    bands: [
                        {
                            label: "Entry Level",
                            min: 380000,
                            max: 680000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Mid Level",
                            min: 750000,
                            max: 1450000,
                            currency: "INR",
                            period: "per year"
                        },
                        {
                            label: "Experienced",
                            min: 1500000,
                            max: 2700000,
                            currency: "INR",
                            period: "per year"
                        }
                    ],
                    note: "Example ranges for demonstration. Global pharmaceutical hubs and specialist signal-detection / aggregate-reporting roles command higher pay."
                },
                demand: {
                    level: "High",
                    note: "India is a major global hub for pharmacovigilance operations, with steady hiring across pharma MNCs and CROs."
                },
                careerGrowth: [
                    { order: 1, title: "Drug Safety Associate (DSA)", experience: "0-2 years" },
                    { order: 2, title: "Senior Drug Safety Associate / Quality Reviewer", experience: "2-4.5 years" },
                    { order: 3, title: "Aggregate Report / Signal Detection Specialist", experience: "4.5-7 years" },
                    { order: 4, title: "Pharmacovigilance Team Lead / Safety Scientist", experience: "7+ years" }
                ],
                sources: [
                    {
                        label: "Career Horizon healthcare dataset (illustrative example data)",
                        url: ""
                    }
                ],
                lastUpdated: new Date(),
                isActive: true
            },
            roadmap: {
                title: "Pharmacovigilance & Drug Safety Associate Roadmap",
                summary:
                    "Learn clinical pharmacology and global drug safety regulations, then master ICSR case processing, MedDRA coding, medical narratives and signal detection.",
                steps: [
                    {
                        stepNumber: 1,
                        order: 1,
                        title: "Pharmacology fundamentals & Adverse Drug Reactions (ADRs)",
                        description:
                            "Understand how drugs act in the body, drug-drug interactions and the classification of adverse reactions.",
                        whyItMatters:
                            "Evaluating whether a medicine plausibly caused an adverse event requires solid pharmacological reasoning.",
                        topics: [
                            "Pharmacokinetics (ADME) & pharmacodynamics",
                            "Type A (augmented) vs Type B (bizarre) adverse reactions",
                            "Drug-drug and drug-disease interactions",
                            "Minimum 4 criteria of a valid ICSR (Patient, Reporter, Drug, Event)",
                            "Spontaneous vs clinical trial safety reports"
                        ],
                        practice:
                            "Evaluate 5 sample adverse event reports to determine whether each meets the 4 minimum criteria for a valid case.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 2,
                        order: 2,
                        title: "Global pharmacovigilance regulations & timelines",
                        description:
                            "Learn ICH E2 guidelines and reporting timelines across FDA, EMA, MHRA and India's PvPI/CDSCO.",
                        whyItMatters:
                            "Expedited safety reports (7-day and 15-day cases) are strictly enforced by health authorities worldwide.",
                        topics: [
                            "ICH E2A, E2B (R3), E2C and E2D guidelines",
                            "Seriousness criteria (Death, Life-threatening, Hospitalization, Disability, Congenital anomaly, IME)",
                            "7-day fatal/life-threatening vs 15-day expedited reporting",
                            "Pharmacovigilance Programme of India (PvPI)",
                            "Company Core Data Sheet (CCDS) & Summary of Product Characteristics (SmPC)"
                        ],
                        practice:
                            "Classify 10 clinical vignettes by seriousness, expectedness (against a sample drug label) and regulatory reporting timeline.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 3,
                        order: 3,
                        title: "MedDRA & WHO-DD medical dictionary coding",
                        description:
                            "Learn to code reported symptoms, diagnoses and medications into standardized regulatory dictionaries.",
                        whyItMatters:
                            "Accurate MedDRA coding allows regulators to aggregate thousands of global reports and spot safety trends.",
                        topics: [
                            "MedDRA 5-level hierarchy (SOC, HLGT, HLT, PT, LLT)",
                            " MedDRA Points to Consider (PTC) coding rules",
                            "Selecting the correct Lowest Level Term (LLT) and Preferred Term (PT)",
                            "WHO Drug Dictionary (WHO-DD) & ATC classification",
                            "Avoiding common coding errors"
                        ],
                        practice:
                            "Code 15 verbatim physician and patient event descriptions into accurate MedDRA LLTs and PTs.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 4,
                        order: 4,
                        title: "ICSR case processing & clinical narrative writing",
                        description:
                            "Learn end-to-end case processing in safety databases (such as Oracle Argus) and write structured medical narratives.",
                        whyItMatters:
                            "The case narrative is the clinical story read by medical reviewers and health authority inspectors.",
                        topics: [
                            "Case triage, duplicate search and data entry workflow",
                            "Structure of a clinical safety narrative",
                            "WHO-UMC and Naranjo causality assessment scales",
                            "Dechallenge and rechallenge evaluation",
                            "Quality review and E2B XML submission basics"
                        ],
                        practice:
                            "Write a complete, structured clinical safety narrative and causality assessment from a hospital discharge summary.",
                        estimatedWeeks: 4
                    },
                    {
                        stepNumber: 5,
                        order: 5,
                        title: "Aggregate safety reporting (PSUR / PBRER / DSUR)",
                        description:
                            "Understand how cumulative safety data is analysed periodically over a drug's lifecycle.",
                        whyItMatters:
                            "Moving from individual case processing to aggregate reports is a major career progression step in PV.",
                        topics: [
                            "Periodic Benefit-Risk Evaluation Report (PBRER / PSUR)",
                            "Development Safety Update Report (DSUR) for clinical trials",
                            "Line listings and summary tabulations",
                            "Benefit-risk balance evaluation",
                            "Risk Management Plans (RMP) & Risk Evaluation and Mitigation Strategies (REMS)"
                        ],
                        practice:
                            "Review a sample drug's quarterly adverse event line listing and draft a summary of key safety findings.",
                        estimatedWeeks: 3
                    },
                    {
                        stepNumber: 6,
                        order: 6,
                        title: "Signal detection & risk management",
                        description:
                            "Learn how safety scientists identify previously unknown risks from large pharmacovigilance databases.",
                        whyItMatters:
                            "Signal detection leads directly to updated drug warnings, dosage changes and safer patient care.",
                        topics: [
                            "Qualitative vs quantitative signal detection",
                            "Disproportionality analysis basics (PRR, ROR, ROR confidence intervals)",
                            "FDA FAERS and WHO VigiBase public dashboards",
                            "Signal validation, prioritization and evaluation",
                            "Label updates and Dear Healthcare Professional Letters (DHPL)"
                        ],
                        practice:
                            "Explore the public FDA FAERS or VigiAccess dashboard for a common medication and summarize its top reported adverse event profile.",
                        estimatedWeeks: 3
                    }
                ]
            }
        }
    ];

    for (const item of newHealthcareCareers) {
        let careerDoc = await Career.findOne({ name: item.career.name });
        if (!careerDoc) {
            careerDoc = await Career.create(item.career);
            console.log(`Created Healthcare career: ${careerDoc.name}`);
        } else {
            Object.assign(careerDoc, item.career);
            await careerDoc.save();
            console.log(`Updated Healthcare career: ${careerDoc.name}`);
        }

        let roadmapDoc = await Roadmap.findOne({
            $or: [{ careerId: careerDoc._id }, { career: careerDoc._id }]
        });

        const roadmapPayload = {
            careerId: careerDoc._id,
            career: careerDoc._id,
            title: item.roadmap.title,
            summary: item.roadmap.summary,
            steps: item.roadmap.steps
        };

        if (!roadmapDoc) {
            roadmapDoc = await Roadmap.create(roadmapPayload);
            console.log(`Created Roadmap for: ${careerDoc.name}`);
        } else {
            Object.assign(roadmapDoc, roadmapPayload);
            await roadmapDoc.save();
            console.log(`Updated Roadmap for: ${careerDoc.name}`);
        }
    }

    await mongoose.disconnect();
    console.log("Healthcare seed completed successfully!");
}

seedHealthcareData().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
});
