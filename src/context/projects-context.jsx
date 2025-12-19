import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const ProjectsContext = createContext();

// Mock current user
const CURRENT_USER = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "/img/team-1.jpeg",
};

// Generate simulated extracted text
const generateExtractedText = (filename) => {
  const sections = [
    {
      title: "Introduction",
      content: `This is the introduction section of ${filename}. It provides an overview of the main topics covered in this document. The content has been extracted and processed for analysis.`,
    },
    {
      title: "Main Content",
      content: `This section contains the primary information and detailed analysis. Multiple paragraphs of content would appear here, discussing various aspects of the subject matter in depth.`,
    },
    {
      title: "Methodology",
      content: `The methodology section describes the approach taken in this document. It outlines the processes, techniques, and frameworks used throughout the analysis.`,
    },
    {
      title: "Conclusion",
      content: `In conclusion, this document summarizes the key findings and provides recommendations for future work. The extracted text is now ready for question generation and summarization.`,
    },
  ];

  const fullText = sections.map((s) => `${s.title}\n\n${s.content}`).join("\n\n");

  return {
    fullText,
    sections,
    wordCount: fullText.split(" ").length,
    language: Math.random() > 0.5 ? "Español" : "English",
  };
};

// Helper function to generate document metadata
const generateDocumentMetadata = (file, projectId) => {
  const fileExtension = file.name.split(".").pop().toLowerCase();
  const fileType = fileExtension.toUpperCase();
  const pages = fileType === "PDF" ? Math.floor(Math.random() * 50) + 1 : null;

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    filename: file.name,
    type: fileType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    status: "pending", // pending | processing | ready | failed
    hash: `hash-${Math.random().toString(36).substr(2, 16)}`,
    pages: pages,
    tags: [],
    file: file,
    // Extended fields for RF-05
    extractedText: null,
    sections: null,
    processingError: null,
    retryCount: 0,
  };
};

// Simulate document processing pipeline
const simulateProcessing = (documentId, setDocuments) => {
  // Phase 1: Set to processing
  setDocuments((prev) =>
    prev.map((doc) =>
      doc.id === documentId ? { ...doc, status: "processing" } : doc
    )
  );

  // Phase 2: Extract text (2-3 seconds)
  setTimeout(() => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const extracted = generateExtractedText(doc.filename);
          return {
            ...doc,
            extractedText: extracted.fullText,
            sections: extracted.sections,
          };
        }
        return doc;
      })
    );

    // Phase 3: Complete or fail (1-2 seconds later)
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            // 85% success, 15% failure
            const success = Math.random() > 0.15;
            return {
              ...doc,
              status: success ? "ready" : "failed",
              processingError: success
                ? null
                : "Failed to extract text from document. Please try again.",
            };
          }
          return doc;
        })
      );
    }, Math.floor(Math.random() * 1000) + 1000);
  }, Math.floor(Math.random() * 1000) + 2000);
};

// Initial mock projects
const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    name: "Material XD Version",
    description: "Design system implementation in Adobe XD",
    owner: CURRENT_USER,
    members: [
      { id: "user-1", name: "John Doe", avatar: "/img/team-1.jpeg" },
      { id: "user-2", name: "Ryan Tompson", avatar: "/img/team-2.jpeg" },
      { id: "user-3", name: "Jessica Doe", avatar: "/img/team-3.jpeg" },
    ],
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-20").toISOString(),
    archived: false,
    logo: "/img/logo-xd.svg",
    topics: ["Design", "UI/UX"],
  },
  {
    id: "proj-2",
    name: "Mobile App Launch",
    description: "Launch our new mobile application",
    owner: CURRENT_USER,
    members: [
      { id: "user-1", name: "John Doe", avatar: "/img/team-1.jpeg" },
      { id: "user-4", name: "Alexander Smith", avatar: "/img/team-4.jpeg" },
    ],
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-10").toISOString(),
    archived: false,
    logo: "/img/logo-spotify.svg",
    topics: ["Mobile", "Development"],
  },
  {
    id: "proj-3",
    name: "Platform Errors Fix",
    description: "Fix critical platform errors",
    owner: {
      id: "user-2",
      name: "Ryan Tompson",
      email: "ryan@example.com",
      avatar: "/img/team-2.jpeg",
    },
    members: [
      { id: "user-2", name: "Ryan Tompson", avatar: "/img/team-2.jpeg" },
      { id: "user-1", name: "John Doe", avatar: "/img/team-1.jpeg" },
    ],
    createdAt: new Date("2024-01-10").toISOString(),
    updatedAt: new Date("2024-01-25").toISOString(),
    archived: false,
    logo: "/img/logo-slack.svg",
    topics: ["Bug Fix", "Backend"],
  },
];

// Create fake file object
const createFakeFile = (name, size) => {
  const blob = new Blob(["Fake file content for testing"], { type: "application/pdf" });
  const file = new File([blob], name, { type: "application/pdf" });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Initial fake documents for testing
const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    projectId: "proj-1",
    filename: "Design_Guidelines.pdf",
    type: "PDF",
    size: 2458000,
    uploadedAt: new Date("2024-01-16").toISOString(),
    status: "ready",
    hash: "hash-abc123def456",
    pages: 25,
    tags: ["design", "guidelines"],
    file: createFakeFile("Design_Guidelines.pdf", 2458000),
    extractedText: "This is the extracted text from Design Guidelines...",
    sections: [
      { title: "Introduction", content: "Design guidelines introduction..." },
      { title: "Color Palette", content: "Color palette specifications..." },
      { title: "Typography", content: "Typography guidelines..." },
    ],
    processingError: null,
    retryCount: 0,
  },
  {
    id: "doc-2",
    projectId: "proj-1",
    filename: "Component_Library.pdf",
    type: "PDF",
    size: 3200000,
    uploadedAt: new Date("2024-01-17").toISOString(),
    status: "ready",
    hash: "hash-xyz789ghi012",
    pages: 42,
    tags: ["components", "library"],
    file: createFakeFile("Component_Library.pdf", 3200000),
    extractedText: "Component library documentation...",
    sections: [
      { title: "Buttons", content: "Button component specifications..." },
      { title: "Forms", content: "Form component guidelines..." },
      { title: "Navigation", content: "Navigation patterns..." },
    ],
    processingError: null,
    retryCount: 0,
  },
  {
    id: "doc-3",
    projectId: "proj-2",
    filename: "App_Requirements.pdf",
    type: "PDF",
    size: 1800000,
    uploadedAt: new Date("2024-02-02").toISOString(),
    status: "ready",
    hash: "hash-jkl345mno678",
    pages: 18,
    tags: ["requirements"],
    file: createFakeFile("App_Requirements.pdf", 1800000),
    extractedText: "Mobile app requirements document...",
    sections: [
      { title: "Overview", content: "App overview and objectives..." },
      { title: "Features", content: "Required features list..." },
      { title: "Technical Specs", content: "Technical specifications..." },
    ],
    processingError: null,
    retryCount: 0,
  },
];

// Initial fake topics for testing
const INITIAL_TOPICS = [
  {
    id: "topic-1",
    projectId: "proj-1",
    name: "UI Components",
    description: "Questions about UI component design and implementation",
    assignedDocuments: ["doc-1", "doc-2"],
    questionsCount: 15,
    batteries: [],
    archived: false,
    createdAt: new Date("2024-01-18").toISOString(),
    updatedAt: new Date("2024-01-18").toISOString(),
  },
  {
    id: "topic-2",
    projectId: "proj-1",
    name: "Design Principles",
    description: "Core design principles and guidelines",
    assignedDocuments: ["doc-1"],
    questionsCount: 10,
    batteries: [],
    archived: false,
    createdAt: new Date("2024-01-19").toISOString(),
    updatedAt: new Date("2024-01-19").toISOString(),
  },
  {
    id: "topic-3",
    projectId: "proj-2",
    name: "App Features",
    description: "Questions about mobile app features and functionality",
    assignedDocuments: ["doc-3"],
    questionsCount: 20,
    batteries: [],
    archived: false,
    createdAt: new Date("2024-02-03").toISOString(),
    updatedAt: new Date("2024-02-03").toISOString(),
  },
];

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [rules, setRules] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [currentUser] = useState(CURRENT_USER);

  // ===== PROJECT FUNCTIONS =====

  const createProject = (projectData, files = []) => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: projectData.name,
      description: projectData.description || "",
      owner: currentUser,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false,
      logo: projectData.logo || "/img/logo-invision.svg",
      topics: [],
    };

    setProjects((prev) => [newProject, ...prev]);

    if (files && files.length > 0) {
      const newDocuments = files.map((file) =>
        generateDocumentMetadata(file, newProject.id)
      );

      setDocuments((prev) => [...prev, ...newDocuments]);

      newDocuments.forEach((doc) => {
        simulateProcessing(doc.id, setDocuments);
      });
    }

    return newProject;
  };

  const updateProject = (projectId, updates) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId && project.owner.id === currentUser.id) {
          return {
            ...project,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return project;
      })
    );
  };

  const duplicateProject = (projectId) => {
    const projectToDuplicate = projects.find((p) => p.id === projectId);
    if (!projectToDuplicate || projectToDuplicate.owner.id !== currentUser.id) {
      return null;
    }

    const duplicatedProject = {
      ...projectToDuplicate,
      id: `proj-${Date.now()}`,
      name: `${projectToDuplicate.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [duplicatedProject, ...prev]);

    const projectDocs = documents.filter((d) => d.projectId === projectId);
    const duplicatedDocs = projectDocs.map((doc) => ({
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: duplicatedProject.id,
      uploadedAt: new Date().toISOString(),
    }));

    setDocuments((prev) => [...prev, ...duplicatedDocs]);

    return duplicatedProject;
  };

  const archiveProject = (projectId) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId && project.owner.id === currentUser.id) {
          return {
            ...project,
            archived: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return project;
      })
    );
  };

  const deleteProject = (projectId) => {
    setProjects((prev) =>
      prev.filter(
        (project) =>
          !(project.id === projectId && project.owner.id === currentUser.id)
      )
    );
    setDocuments((prev) => prev.filter((doc) => doc.projectId !== projectId));
    setTopics((prev) => prev.filter((topic) => topic.projectId !== projectId));
  };

  // ===== DOCUMENT FUNCTIONS =====

  const uploadDocuments = (projectId, files) => {
    const newDocuments = files.map((file) =>
      generateDocumentMetadata(file, projectId)
    );

    setDocuments((prev) => [...prev, ...newDocuments]);

    newDocuments.forEach((doc) => {
      simulateProcessing(doc.id, setDocuments);
    });

    updateProject(projectId, {});

    return newDocuments;
  };

  const deleteDocument = (documentId, projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || project.owner.id !== currentUser.id) {
      return false;
    }

    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

    // Remove from topics
    setTopics((prev) =>
      prev.map((topic) => ({
        ...topic,
        assignedDocuments: topic.assignedDocuments.filter((id) => id !== documentId),
      }))
    );

    updateProject(projectId, {});
    return true;
  };

  const retryDocumentProcessing = (documentId) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.status === "failed") {
          return {
            ...doc,
            status: "pending",
            processingError: null,
            retryCount: doc.retryCount + 1,
          };
        }
        return doc;
      })
    );

    setTimeout(() => {
      simulateProcessing(documentId, setDocuments);
    }, 500);
  };

  const getProjectDocuments = (projectId) => {
    return documents.filter((doc) => doc.projectId === projectId);
  };

  const getDocument = (documentId) => {
    return documents.find((doc) => doc.id === documentId);
  };

  const hasReadyDocuments = (projectId) => {
    const projectDocs = getProjectDocuments(projectId);
    return projectDocs.some((doc) => doc.status === "ready");
  };

  const getProjectProgress = (projectId) => {
    const projectDocs = getProjectDocuments(projectId);
    if (projectDocs.length === 0) return 0;

    const readyDocs = projectDocs.filter((doc) => doc.status === "ready").length;
    return Math.round((readyDocs / projectDocs.length) * 100);
  };

  // ===== TOPIC FUNCTIONS =====

  const createTopic = (projectId, topicData) => {
    const newTopic = {
      id: `topic-${Date.now()}`,
      projectId,
      name: topicData.name,
      description: topicData.description || "",
      assignedDocuments: topicData.assignedDocuments || [],
      questionsCount: topicData.questionsCount || 10,
      batteries: topicData.batteries || [],
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTopics((prev) => [newTopic, ...prev]);
    updateProject(projectId, {});
    return newTopic;
  };

  const updateTopic = (topicId, updates) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return topic;
      })
    );
  };

  const archiveTopic = (topicId) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            archived: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return topic;
      })
    );
  };

  const assignDocumentToTopic = (topicId, documentId) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId && !topic.assignedDocuments.includes(documentId)) {
          return {
            ...topic,
            assignedDocuments: [...topic.assignedDocuments, documentId],
            updatedAt: new Date().toISOString(),
          };
        }
        return topic;
      })
    );
  };

  const unassignDocumentFromTopic = (topicId, documentId) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            assignedDocuments: topic.assignedDocuments.filter((id) => id !== documentId),
            updatedAt: new Date().toISOString(),
          };
        }
        return topic;
      })
    );
  };

  const getProjectTopics = (projectId) => {
    return topics.filter((topic) => topic.projectId === projectId && !topic.archived);
  };

  const getTopic = (topicId) => {
    return topics.find((topic) => topic.id === topicId);
  };

  // ===== UTILITY FUNCTIONS =====

  const isOwner = (project) => {
    return project.owner.id === currentUser.id;
  };

  const getActiveProjects = () => {
    return projects.filter((p) => !p.archived);
  };

  const getOwnedProjects = () => {
    return projects.filter((p) => p.owner.id === currentUser.id && !p.archived);
  };

  const getMemberProjects = () => {
    return projects.filter(
      (p) =>
        !p.archived &&
        p.owner.id !== currentUser.id &&
        p.members.some((m) => m.id === currentUser.id)
    );
  };

  const getProject = (projectId) => {
    return projects.find((p) => p.id === projectId);
  };

  // ===== RULES FUNCTIONS =====

  const calculateScoring = (topicQuestions, distribution, weights) => {
    const totalQuestions = topicQuestions.reduce((sum, tq) => sum + tq.questionCount, 0);

    if (distribution === "equal") {
      const pointsPerQuestion = 100 / totalQuestions;
      return {
        totalPoints: 100,
        distribution: "equal",
        pointsPerQuestion: Math.round(pointsPerQuestion * 100) / 100,
        topicWeights: null
      };
    } else {
      // Weighted distribution
      return {
        totalPoints: 100,
        distribution: "weighted",
        pointsPerQuestion: null, // Varies by topic
        topicWeights: weights
      };
    }
  };

  const validateRule = (ruleData) => {
    const errors = [];

    if (!ruleData.name || !ruleData.name.trim()) {
      errors.push("Please enter a rule name");
    }

    // Validate distribution
    const dist = ruleData.distribution || { singleChoice: 0, multiSelect: 0, trueFalse: 0 };
    const totalQuestions = (parseInt(dist.singleChoice) || 0) +
      (parseInt(dist.multiSelect) || 0) +
      (parseInt(dist.trueFalse) || 0);

    if (totalQuestions <= 0) {
      errors.push("Total questions must be greater than 0");
    }

    if (!ruleData.topicQuestions || ruleData.topicQuestions.length === 0) {
      errors.push("Add at least one topic scope");
    }

    if (ruleData.scoring?.distribution === "weighted") {
      const totalWeight = Object.values(ruleData.scoring.topicWeights || {}).reduce((sum, w) => sum + w, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        errors.push("Topic weights must sum to 100%");
      }
    }

    return errors;
  };

  const createRule = (projectId, ruleData) => {
    const errors = validateRule(ruleData);
    if (errors.length > 0) {
      console.error("Validation errors:", errors);
      return { success: false, errors };
    }

    // Total counts driven by distribution now
    const dist = ruleData.distribution || { singleChoice: 0, multiSelect: 0, trueFalse: 0 };
    const totalQuestions = (parseInt(dist.singleChoice) || 0) +
      (parseInt(dist.multiSelect) || 0) +
      (parseInt(dist.trueFalse) || 0);

    // Update topicQuestions to reflect this total purely for scoring calculation reference
    // In a real app, we might distribute this total across topics
    const updatedTopicQuestions = ruleData.topicQuestions.map(tq => ({
      ...tq,
      questionCount: totalQuestions // Simplify: each topic candidate considers the full battery size for weight calc
    }));

    const scoring = calculateScoring(
      updatedTopicQuestions, // Pass updated to calc total points correctly if needed
      ruleData.scoring?.distribution || "equal",
      ruleData.scoring?.topicWeights || null
    );

    // Override calculateScoring result because it sums all topic counts, 
    // but here the total is fixed by distribution.
    if (scoring.distribution === "equal") {
      scoring.pointsPerQuestion = Math.round((100 / totalQuestions) * 100) / 100;
    }

    const newRule = {
      id: `rule-${Date.now()}`,
      projectId,
      name: ruleData.name,
      distribution: dist, // New field
      questionTypes: { // Keep for backward compat or UI
        singleChoice: (dist.singleChoice > 0),
        multiSelect: (dist.multiSelect > 0),
        trueFalse: (dist.trueFalse > 0)
      },
      topicQuestions: ruleData.topicQuestions, // Keep original scopes
      scoring,
      randomization: ruleData.randomization || { enabled: false, seed: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRules((prev) => [newRule, ...prev]);
    return { success: true, rule: newRule };
  };

  const updateRule = (ruleId, updates) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          const updatedRule = { ...rule, ...updates, updatedAt: new Date().toISOString() };

          // Recalculate scoring if topicQuestions or distribution changed
          if (updates.topicQuestions || updates.scoring) {
            updatedRule.scoring = calculateScoring(
              updatedRule.topicQuestions,
              updatedRule.scoring.distribution,
              updatedRule.scoring.topicWeights
            );
          }

          return updatedRule;
        }
        return rule;
      })
    );
  };

  const deleteRule = (ruleId) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    // Also delete associated batteries
    setBatteries((prev) => prev.filter((battery) => battery.ruleId !== ruleId));
  };

  const getProjectRules = (projectId) => {
    return rules.filter((rule) => rule.projectId === projectId);
  };

  const getRule = (ruleId) => {
    return rules.find((rule) => rule.id === ruleId);
  };

  // ===== BATTERY FUNCTIONS =====

  // Question generation templates
  const QUESTION_TEMPLATES = {
    singleChoice: [
      {
        template: "¿Cuál es el propósito principal de {topic}?",
        options: [
          "Proporcionar una estructura base para el desarrollo",
          "Facilitar la comunicación entre componentes",
          "Optimizar el rendimiento del sistema",
          "Gestionar el estado de la aplicación"
        ]
      },
      {
        template: "¿Qué característica define mejor a {topic}?",
        options: [
          "Su capacidad de reutilización",
          "Su facilidad de mantenimiento",
          "Su escalabilidad",
          "Su rendimiento optimizado"
        ]
      },
      {
        template: "En el contexto de {topic}, ¿cuál es la mejor práctica recomendada?",
        options: [
          "Mantener la simplicidad y claridad",
          "Priorizar la optimización prematura",
          "Evitar la documentación",
          "Maximizar la complejidad"
        ]
      }
    ],
    multiSelect: [
      {
        template: "Selecciona todas las afirmaciones correctas sobre {topic}:",
        options: [
          "Es fundamental para la arquitectura del sistema",
          "Mejora la experiencia del usuario",
          "Reduce la complejidad del código",
          "Facilita las pruebas automatizadas"
        ],
        correctCount: 2
      },
      {
        template: "¿Cuáles de los siguientes son beneficios de {topic}?",
        options: [
          "Mayor productividad del equipo",
          "Mejor mantenibilidad del código",
          "Reducción de errores",
          "Aumento de la complejidad"
        ],
        correctCount: 3
      }
    ],
    trueFalse: [
      {
        template: "{topic} es fundamental para el diseño de interfaces modernas.",
        options: ["Verdadero", "Falso"]
      },
      {
        template: "El uso de {topic} siempre mejora el rendimiento de la aplicación.",
        options: ["Verdadero", "Falso"]
      },
      {
        template: "{topic} requiere conocimientos avanzados para su implementación.",
        options: ["Verdadero", "Falso"]
      }
    ]
  };

  const generateQuestions = (rule, type, topicId) => {
    const questions = [];
    const dist = rule.distribution || { singleChoice: 0, multiSelect: 0, trueFalse: 0 };

    // Determine which topics are available for question generation
    const availableTopics = type === "topic" && topicId
      ? rule.topicQuestions.filter(tq => tq.topicId === topicId)
      : rule.topicQuestions;

    if (availableTopics.length === 0) return [];

    // For each question type in distribution
    Object.entries(dist).forEach(([qType, count]) => {
      const numCount = parseInt(count);
      if (numCount <= 0) return;

      const templates = QUESTION_TEMPLATES[qType];

      for (let i = 0; i < numCount; i++) {
        // Round-robin selection of topics or random
        const topicIndex = i % availableTopics.length;
        const topicQuestion = availableTopics[topicIndex];
        const topic = getTopic(topicQuestion.topicId);

        if (!topic) continue;

        const template = templates[Math.floor(Math.random() * templates.length)];
        const questionText = template.template.replace("{topic}", topic.name);

        // Calculate points
        let points;
        if (rule.scoring.distribution === "equal") {
          points = rule.scoring.pointsPerQuestion;
        } else {
          // Simplified weighted logic for MVP: just split evenly if weighted not fully implemented per question
          points = rule.scoring.pointsPerQuestion || 0;
        }

        // Generate options
        let options;
        if (qType === "singleChoice") {
          const correctIndex = Math.floor(Math.random() * template.options.length);
          options = template.options.map((text, idx) => ({
            id: String.fromCharCode(97 + idx),
            text,
            correct: idx === correctIndex
          }));
        } else if (qType === "multiSelect") {
          const correctCount = template.correctCount || 2;
          const shuffled = [...template.options].sort(() => Math.random() - 0.5);
          options = shuffled.map((text, idx) => ({
            id: String.fromCharCode(97 + idx),
            text,
            correct: idx < correctCount
          }));
        } else { // trueFalse
          const correctAnswer = Math.random() > 0.5;
          options = template.options.map((text, idx) => ({
            id: idx === 0 ? "true" : "false",
            text,
            correct: (idx === 0) === correctAnswer
          }));
        }

        questions.push({
          id: `q-${Date.now()}-${questions.length}`,
          type: qType,
          topicId: topic.id,
          topicName: topic.name,
          question: questionText,
          options,
          points,
          explanation: `Generated for ${topic.name}`
        });
      }
    });

    // Randomize order if enabled
    if (rule.randomization.enabled) {
      return questions.sort(() => Math.random() - 0.5);
    }

    return questions;
  };



  const generateBattery = (ruleId, type, topicId = null, difficulty = "Medium") => {
    const rule = getRule(ruleId);
    if (!rule) {
      return { success: false, error: "Rule not found" };
    }

    // Validate
    if (type === "topic" && !topicId) {
      return { success: false, error: "Topic ID required for topic-specific battery" };
    }

    const questions = generateQuestions(rule, type, topicId);

    const newBattery = {
      id: `battery-${Date.now()}`,
      projectId: rule.projectId,
      ruleId: rule.id,
      name: type === "topic"
        ? `Batería - ${getTopic(topicId)?.name || "Unknown"}`
        : `Batería Global - ${rule.name}`,
      type,
      topicId: type === "topic" ? topicId : null,
      difficulty, // Stored metadata
      status: "draft",
      config: {
        questionTypes: rule.questionTypes,
        topicQuestions: rule.topicQuestions,
        scoring: rule.scoring,
        randomization: rule.randomization
      },
      questions,
      variantOf: null,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBatteries((prev) => [newBattery, ...prev]);
    return { success: true, battery: newBattery };
  };

  const generateBatteryVariant = (batteryId) => {
    const originalBattery = batteries.find(b => b.id === batteryId);
    if (!originalBattery) {
      return { success: false, error: "Battery not found" };
    }

    const rule = getRule(originalBattery.ruleId);
    if (!rule) {
      return { success: false, error: "Original rule not found" };
    }

    // Generate new questions with same configuration
    const questions = generateQuestions(rule, originalBattery.type, originalBattery.topicId);

    const variantBattery = {
      ...originalBattery,
      id: `battery-${Date.now()}`,
      name: `${originalBattery.name} (Variante)`,
      questions,
      variantOf: batteryId,
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update original battery to track this variant
    setBatteries((prev) =>
      prev.map((b) => {
        if (b.id === batteryId) {
          return {
            ...b,
            variants: [...b.variants, variantBattery.id]
          };
        }
        return b;
      })
    );

    setBatteries((prev) => [variantBattery, ...prev]);
    return { success: true, battery: variantBattery };
  };

  const updateBatteryStatus = (batteryId, status) => {
    setBatteries((prev) =>
      prev.map((battery) => {
        if (battery.id === batteryId) {
          return {
            ...battery,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return battery;
      })
    );
  };

  const deleteBattery = (batteryId) => {
    setBatteries((prev) => prev.filter((battery) => battery.id !== batteryId));
  };

  const getProjectBatteries = (projectId) => {
    return batteries.filter((battery) => battery.projectId === projectId);
  };

  const getRuleBatteries = (ruleId) => {
    return batteries.filter((battery) => battery.ruleId === ruleId);
  };

  const getBattery = (batteryId) => {
    return batteries.find((battery) => battery.id === batteryId);
  };

  const value = {
    projects,
    documents,
    topics,
    rules,
    batteries,
    currentUser,
    // Project functions
    createProject,
    updateProject,
    duplicateProject,
    archiveProject,
    deleteProject,
    // Document functions
    uploadDocuments,
    deleteDocument,
    retryDocumentProcessing,
    getProjectDocuments,
    getDocument,
    hasReadyDocuments,
    getProjectProgress,
    // Topic functions
    createTopic,
    updateTopic,
    archiveTopic,
    assignDocumentToTopic,
    unassignDocumentFromTopic,
    getProjectTopics,
    getTopic,
    // Rules functions
    createRule,
    updateRule,
    deleteRule,
    getProjectRules,
    getRule,
    validateRule,
    calculateScoring,
    // Battery functions
    generateBattery,
    generateBatteryVariant,
    updateBatteryStatus,
    deleteBattery,
    getProjectBatteries,
    getRuleBatteries,
    getBattery,
    // Utility functions
    isOwner,
    getActiveProjects,
    getOwnedProjects,
    getMemberProjects,
    getProject,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

ProjectsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}

export default ProjectsContext;
