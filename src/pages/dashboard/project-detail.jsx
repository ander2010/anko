import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Tooltip,
  Spinner,
  Tabs,
  TabsHeader,
  Tab,
  Progress,
  Alert,
} from "@material-tailwind/react";
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  FolderIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  BoltIcon,
  PlayIcon,
  ViewColumnsIcon,
  Square2StackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import projectService from "@/services/projectService";
import { API_BASE } from "@/services/api";
import { UploadDocumentsDialog } from "@/widgets/dialogs/upload-documents-dialog";
import { UppyUploadDialog } from "@/widgets/dialogs/uppy-upload-dialog";
import { DocumentMetadataDialog } from "@/widgets/dialogs/document-metadata-dialog";
import { ConfirmDialog } from "@/widgets/dialogs/confirm-dialog";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import { useJobs } from "@/context/job-context";

// Si todavía no tienes Topics/Rules/Batteries en API, puedes dejar esto así (arrays vacíos)
import { ExamSimulatorDialog } from "@/widgets/dialogs/exam-simulator-dialog";
import { CreateTopicDialog } from "@/widgets/dialogs/create-topic-dialog";
import { EditTopicDialog } from "@/widgets/dialogs/edit-topic-dialog";
import { TopicCard } from "@/widgets/cards/topic-card";
import { DeckCard } from "@/widgets/cards/deck-card";
import { ProjectProcessingProgress } from "@/widgets/project/project-processing-progress";
import { CreateDeckDialog } from "@/widgets/dialogs/create-deck-dialog";
import FlashcardViewDialog from "@/widgets/dialogs/flashcard-view-dialog";
import { FlashcardLearnDialog } from "@/widgets/dialogs/flashcard-learn-dialog";
import { DocumentViewerDialog } from "@/widgets/dialogs/document-viewer-dialog";
import { CookingLoader } from "@/widgets/loaders/cooking-loader";
import { AddFlashcardsDialog } from "@/widgets/dialogs/add-flashcards-dialog";
import { UpgradePromptDialog } from "@/widgets/dialogs/upgrade-prompt-dialog";

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { activeJobs: globalActiveJobs, addJob, removeJob } = useJobs();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "documents");

  const [showGenerateBattery, setShowGenerateBattery] = useState(false);
  const [batteryForm, setBatteryForm] = useState({
    rule: "",
    query_text: "",
    sections: [],
    quantity: 10,
    difficulty: "medium",
    question_format: "true_false"
  });
  const [sectionSearch, setSectionSearch] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [batteryProgress, setBatteryProgress] = useState({});
  const [batteryErrors, setBatteryErrors] = useState({});

  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);

  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingBatteries, setLoadingBatteries] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [documentsWithSections, setDocumentsWithSections] = useState([]); // Store full data
  const [sectionsCounts, setSectionsCounts] = useState({});

  // dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uppyUploadDialogOpen, setUppyUploadDialogOpen] = useState(false);
  const [upgradePromptOpen, setUpgradePromptOpen] = useState(false);
  const [membership, setMembership] = useState(null);
  const [uploadLimitError, setUploadLimitError] = useState(null);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  // Topics dialogs
  const [createTopicDialogOpen, setCreateTopicDialogOpen] = useState(false);
  const [editTopicDialogOpen, setEditTopicDialogOpen] = useState(false);
  const [confirmTopicDialogOpen, setConfirmTopicDialogOpen] = useState(false);

  const [confirmDeleteTopicDialogOpen, setConfirmDeleteTopicDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

  // topics/rules/batteries state
  const [topics, setTopics] = useState([]);
  const [topicsSearch, setTopicsSearch] = useState("");
  const [rules, setRules] = useState([]);
  const [rulesSearch, setRulesSearch] = useState("");
  const [batteries, setBatteries] = useState([]);
  const [batteriesSearch, setBatteriesSearch] = useState("");
  const [decks, setDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [deckSearch, setDeckSearch] = useState("");
  const [simulationBattery, setSimulationBattery] = useState(null);

  const activeJobs = useMemo(() => {
    const jobs = {};
    const pid = String(projectId);
    const filtered = globalActiveJobs.filter(
      (j) => j.type === "document" && String(j.projectId) === pid
    );

    // TRACE: Help debug why persistence might fail
    if (globalActiveJobs.length > 0) {
      console.group("[Persistence Trace] Project: " + pid);
      console.log("Global jobs (raw):", globalActiveJobs);
      console.log("Filtered for this project:", filtered);
      console.groupEnd();
    }

    filtered.forEach((j) => {
      if (j.docId) {
        const sid = String(j.docId);
        jobs[sid] = j.id;
        console.log("[ProjectDetail] Mapping job", j.id, "to docId", sid);
      }
    });
    return jobs;
  }, [globalActiveJobs, projectId]);

  const activeFlashcardJobs = useMemo(() => {
    const jobs = {};
    const filtered = globalActiveJobs.filter(
      (j) => j.type === "flashcard" && String(j.projectId) === String(projectId)
    );
    if (filtered.length > 0) {
      console.log("[ProjectDetail] Found active flashcard jobs:", filtered);
    }
    filtered.forEach((j) => {
      if (j.deckId) {
        jobs[String(j.deckId)] = { job_id: j.id, ws_progress: j.ws_url };
      }
    });
    return jobs;
  }, [globalActiveJobs, projectId]);

  const [createDeckDialogOpen, setCreateDeckDialogOpen] = useState(false);
  const [flashcardViewDialogOpen, setFlashcardViewDialogOpen] = useState(false);
  const [learnDialogOpen, setLearnDialogOpen] = useState(false);
  const [learnDeck, setLearnDeck] = useState(null);
  const [confirmDeleteDeckDialogOpen, setConfirmDeleteDeckDialogOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  const [addFlashcardsOpen, setAddFlashcardsOpen] = useState(false);
  const [selectedDeckForAdd, setSelectedDeckForAdd] = useState(null);

  const handleOpenAddCards = (deck) => {
    setSelectedDeckForAdd(deck);
    setAddFlashcardsOpen(true);
  };

  const isOwner = useMemo(() => {
    if (!project || !user) return false;
    return project?.owner?.id === user?.id;
  }, [project, user]);

  const [showCreateRule, setShowCreateRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    global_count: 10,
    time_limit: 30,
    distribution_strategy: "mixed",
    difficulty: "Medium",
    topic_scope: null, // o id
  });
  const handleGenerateBattery = async () => {
    try {
      setError(null);
      setBatteryErrors({});

      // Case A: No sections available in the project
      if (availableSections.length === 0) {
        const msg = language === "es"
          ? "Usted no tiene secciones disponibles. Debe subir un documento para que el sistema procese el contenido."
          : "You don't have any sections. You should upload a document so the system can process the content.";
        setBatteryErrors({ sections: msg });
        return;
      }

      // Case B: Sections exist but none were selected
      if (batteryForm.sections.length === 0) {
        const msg = language === "es"
          ? "Usted debe seleccionar al menos una sección."
          : "You must select at least one section.";
        setBatteryErrors({ sections: msg });
        return;
      }

      // query_text is now optional

      const name = batteryForm.query_text.trim() || (language === "es" ? "Batería" : "Battery");

      // Check for duplicates
      if (batteries.some(b => (b.name || "").toLowerCase() === name.toLowerCase())) {
        const msg = language === "es"
          ? "Ya existe una batería con este nombre. Por favor, elige uno diferente."
          : "A battery with this name already exists. Please choose a different one.";
        setBatteryErrors({ query_text: msg });
        return;
      }

      const payload = {
        project: Number(projectId),
        name: name,
        query_text: batteryForm.query_text,
        sections: batteryForm.sections.map(s => s.id),
        quantity: Number(batteryForm.quantity),
        difficulty: batteryForm.difficulty,
        question_format: batteryForm.question_format,
      };

      // Add optional fields
      if (batteryForm.rule) {
        payload.rule = Number(batteryForm.rule);
      }

      const res = await projectService.startGenerateBattery(payload);


      setShowGenerateBattery(false);

      // Reset form
      setBatteryForm({
        rule: "",
        query_text: "",
        sections: [],
        quantity: 10,
        difficulty: "medium",
        question_format: "true_false"
      });
      setSectionSearch("");

      await fetchBatteries(Number(projectId));

      // Init SSE for progress
      const batteryId = res?.battery?.id;
      if (batteryId) {
        addJob({
          id: String(batteryId),
          type: 'battery',
          projectId: String(projectId)
        });
        resumeBatterySSE(batteryId);
      }
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to generate battery");
    }
  };

  const handleCreateRule = async () => {
    try {
      setError(null);

      if (!ruleForm.name) {
        setError("Rule name is required");
        return;
      }

      await projectService.createRule(Number(projectId), {
        name: ruleForm.name,
        global_count: Number(ruleForm.global_count) || 0,
        time_limit: Number(ruleForm.time_limit) || 0,
        distribution_strategy: ruleForm.distribution_strategy,
        difficulty: ruleForm.difficulty,
        topic_scope: ruleForm.topic_scope || null,
      });

      setShowCreateRule(false);
      setRuleForm({
        name: "",
        global_count: 10,
        time_limit: 30,
        distribution_strategy: "mixed",
        difficulty: "Medium",
        topic_scope: null,
      });

      await fetchRules(Number(projectId));
    } catch (err) {
      setError(err?.response?.data || err?.error || err?.detail || "Failed to create rule");
    }
  };



  useEffect(() => {
    const id = Number(projectId);
    if (!id) return;
    fetchAll(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Resume persistent battery jobs on mount/projectId change
  useEffect(() => {
    if (!projectId || !globalActiveJobs.length) return;

    const projectJobs = globalActiveJobs.filter(j => j && String(j.projectId) === String(projectId));

    // Resume battery jobs (re-trigger SSE logic) if not active
    projectJobs.filter(j => j && j.type === 'battery').forEach(j => {
      if (!batteryProgress[j.id]) {
        resumeBatterySSE(j.id);
      }
    });

  }, [projectId, globalActiveJobs]);

  // Auto-dismiss upload limit error after 4 seconds
  useEffect(() => {
    if (uploadLimitError) {
      const timer = setTimeout(() => {
        setUploadLimitError(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [uploadLimitError]);

  const resumeBatterySSE = (batteryId) => {
    // Use API_BASE to construct absolute URL for production support.
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const sseUrl = `${base}/batteries/${batteryId}/progress-stream-bat/`;
    console.log("[ProjectDetail] Resuming battery SSE:", sseUrl);
    const es = new EventSource(sseUrl);

    es.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      setBatteryProgress(prev => ({ ...prev, [batteryId]: data }));
    });

    es.addEventListener("end", async (e) => {
      es.close();
      try { await projectService.saveQuestionsFromQa(batteryId); } catch (err) { }
      fetchBatteries(Number(projectId));
      setBatteryProgress(prev => {
        const newState = { ...prev };
        delete newState[batteryId];
        return newState;
      });
      removeJob(batteryId); // Clear from persistence
    });

    es.addEventListener("error", (e) => {
      console.error("SSE error", e);
      es.close();
      // Optional: don't removeJob yet so it can retry next refresh?
      // Or remove if it's a permanent error.
    });
  };

  const fetchSectionsCounts = async () => {
    try {
      if (!projectId) return;

      const data = await projectService.getDocumentsWithSections(projectId);

      // Store full list involved in sections
      setDocumentsWithSections(data.documents || []);

      const counts = {};
      data.documents?.forEach(doc => {
        counts[doc.id] = doc.sections ? doc.sections.length : 0;
      });
      setSectionsCounts(counts);
    } catch (err) {
      console.error("Failed to fetch section counts", err);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSectionsCounts();
    }
  }, [projectId, documents.length]);

  useEffect(() => {
    const sections = [];
    documentsWithSections.forEach(doc => {
      if (doc.sections && Array.isArray(doc.sections)) {
        doc.sections.forEach(sec => {
          sections.push({
            id: sec.id,
            name: sec.title || sec.name || `Section ${sec.id} `,
            documentName: doc.filename || doc.name || "Unknown Doc",
            docId: doc.id
          });
        });
      }
    });
    setAvailableSections(sections.sort((a, b) => a.name.localeCompare(b.name)));
  }, [documentsWithSections]);




  const fetchTopics = async (id) => {
    const data = await projectService.getProjectTopics(id);
    setTopics(Array.isArray(data) ? data : data?.results || []);
  };


  const readyDocuments = useMemo(
    () => documents.filter((d) => d.status === "ready"),
    [documents]
  );

  const handleCreateTopic = async (topicData) => {
    try {
      setError(null);
      await projectService.createTopic(Number(projectId), topicData);
      setCreateTopicDialogOpen(false);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to create topic");
    }
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setEditTopicDialogOpen(true);
  };
  const fetchRules = async (id) => {
    try {
      setLoadingRules(true);
      const data = await projectService.getProjectRules(id);
      setRules(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setRules([]);
      setError(err?.error || err?.detail || "Failed to load rules");
    } finally {
      setLoadingRules(false);
    }
  };
  const handleSaveEditTopic = async (updates) => {
    if (!selectedTopic) return;
    try {
      setError(null);
      await projectService.updateTopic(selectedTopic.id, updates);
      setEditTopicDialogOpen(false);
      setSelectedTopic(null);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to update topic");
    }
  };




  const handleArchiveTopic = (topic) => {
    setSelectedTopic(topic);
    setConfirmTopicDialogOpen(true);
  };

  const handleConfirmArchiveTopic = async () => {
    if (!selectedTopic) return;
    try {
      setError(null);
      await projectService.archiveTopic(selectedTopic.id);
      setConfirmTopicDialogOpen(false);
      setSelectedTopic(null);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to archive topic");
    }
  };

  const handleDeleteTopic = (topic) => {
    setSelectedTopic(topic);
    setConfirmDeleteTopicDialogOpen(true);
  };

  const handleConfirmDeleteTopic = async () => {
    if (!selectedTopic) return;
    try {
      setError(null);
      await projectService.deleteTopic(selectedTopic.id);
      setConfirmDeleteTopicDialogOpen(false);
      setSelectedTopic(null);
      await fetchTopics(Number(projectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to delete topic");
    }
  };

  const handleStudyDeck = (deck) => {
    setSelectedDeck(deck);
    setFlashcardViewDialogOpen(true);
  };

  const handleLearnDeck = (deck) => {
    setLearnDeck(deck);
    setLearnDialogOpen(true);
  };

  const handleCloseSimulator = async () => {
    setSimulationBattery(null);
    await fetchBatteries(Number(projectId)); // <-- refresca para ver intentos/last_attempt
  };

  const fetchAll = async (id) => {
    setError(null);
    await Promise.all([
      fetchProject(id),
      fetchDocuments(id),
      fetchTopics(id),
      fetchRules(id),
      fetchBatteries(id),
      fetchDecks(id)
    ]);
  };

  const fetchProject = async (id) => {
    try {
      setLoadingProject(true);
      const data = await projectService.getProjectDetail(id);
      setProject(data);
    } catch (err) {
      setProject(null);
      setError(err?.error || "Failed to load project");
    } finally {
      setLoadingProject(false);
    }
  };
  const fetchBatteries = async (id) => {
    try {
      setLoadingBatteries(true);
      const data = await projectService.getProjectBatteries(id);
      setBatteries(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setBatteries([]);
      setError(err?.error || err?.detail || "Failed to load batteries");
    } finally {
      setLoadingBatteries(false);
    }
  };

  const fetchDecks = async (id) => {
    try {
      setLoadingDecks(true);
      const data = await projectService.getProjectDecks(id);
      const rawDecks = Array.isArray(data) ? data : data?.results || [];

      // Backend already provides flashcards_count, no need to loop
      setDecks(rawDecks);
    } catch (err) {
      setDecks([]);
      setError(err?.error || err?.detail || "Failed to load decks");
    } finally {
      setLoadingDecks(false);
    }
  };

  const fetchDocuments = async (id) => {
    try {
      setLoadingDocs(true);
      // Necesitas tener este método (te lo dejo abajo)
      const data = await projectService.getProjectDocuments(id);
      setDocuments(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      setDocuments([]);
      setError(err?.error || "Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleCreateDeck = async (deckData) => {
    try {
      setError(null);
      if (selectedDeck) {
        // Edit mode (assuming manual edits for now or just metadata)
        await projectService.updateDeck(selectedDeck.id, deckData);
        // Refresh to get updates
        await fetchDecks(Number(projectId));
      } else {
        // CHECK MODE
        if (deckData.mode === 'manual') {
          // Manual Creation
          const payload = {
            project_id: Number(projectId),
            title: deckData.title,
            description: deckData.description,
            visibility: deckData.visibility,
            section_ids: deckData.section_ids,
            cards: deckData.cards
          };
          await projectService.createDeckManual(payload);
          // Refresh list from DB as requested
          await fetchDecks(Number(projectId));
        } else {
          // AI Creation (Default)
          const payload = {
            project_id: Number(projectId),
            ...deckData,
            cards_count: Number(deckData.cards_count || 0)
          };
          // Remove mode from payload if it exists
          delete payload.mode;
          delete payload.cards; // Ensure no manual cards are sent to AI endpoint

          const res = await projectService.createDeckWithCards(payload);
          console.log("[ProjectDetail] createDeckWithCards response:", res);

          // Refresh list from DB as requested
          await fetchDecks(Number(projectId));

          // Correctly extract job_id from nested job object or root (fallback)
          const jobId = res.job?.job_id || res.job_id;

          if (jobId) {
            console.log("Job ID found:", jobId);
            // Robust deckId extraction: check res.deck.id, res.deck_id, res.id, or res.deck (if it's an ID)
            const deckId = res.deck?.id || res.deck_id || res.id || (typeof res.deck === 'number' || typeof res.deck === 'string' ? res.deck : null);

            if (!deckId) {
              console.error("[ProjectDetail] CRITICAL: Could not extract deckId from response:", res);
              setError("Deck created but failed to track progress (missing ID).");
              return;
            }
            // Use res.job.ws_progress if available, else res.ws_progress
            const wsUrl = res.job?.ws_progress || res.ws_progress;
            console.log("[ProjectDetail] Registering flashcard job:", jobId, "for deck:", deckId, "WS:", wsUrl);
            addJob({
              id: String(jobId),
              type: "flashcard",
              projectId: String(projectId),
              deckId: String(deckId),
              ws_url: wsUrl
            });

            // CRITICAL: Call sync immediately to ensure flashcards appear
            // This handles cases where WebSocket completes too fast or fails
            console.log("[ProjectDetail] Starting immediate sync for deck:", deckId, "job:", res.job_id);

            // Poll for completion with exponential backoff
            const pollForCompletion = async (attempts = 0, maxAttempts = 20) => {
              try {
                // Wait a bit before first attempt (backend needs time to generate)
                // EDITED: Start with shorter delay to catch fast jobs, but retry implies waiting
                const delay = attempts === 0 ? 500 : Math.min(1000 * Math.pow(1.5, attempts), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));

                console.log(`[ProjectDetail] Sync attempt ${attempts + 1}/${maxAttempts} for deck ${deckId}`);

                // Try to sync
                try {
                  await projectService.syncFlashcardsFromJob(deckId, jobId);
                } catch (e) {
                  console.warn("[ProjectDetail] Sync call failed (may be too early):", e);
                  // Don't abort, checking flashcards count is the real test
                }

                // Fetch updated deck to get flashcard count
                const updatedCards = await projectService.getDeckFlashcards(deckId);

                if (updatedCards && updatedCards.length > 0) {
                  console.log(`[ProjectDetail] Sync successful! Found ${updatedCards.length} flashcards`);

                  // Update deck count
                  setDecks(prevDecks => prevDecks.map(d =>
                    d.id === deckId ? { ...d, flashcards_count: updatedCards.length } : d
                  ));

                  // Remove job from queue
                  removeJob(String(jobId));
                  return true;
                }

                // If no cards yet and we have attempts left, try again
                if (attempts < maxAttempts - 1) {
                  console.log(`[ProjectDetail] No cards yet, will retry...`);
                  return pollForCompletion(attempts + 1, maxAttempts);
                } else {
                  console.warn(`[ProjectDetail] Max attempts reached, flashcards may not be ready yet`);
                  removeJob(String(jobId));
                  return false;
                }
              } catch (err) {
                console.error(`[ProjectDetail] Sync attempt ${attempts + 1} failed:`, err);

                // Retry on error if attempts remain
                if (attempts < maxAttempts - 1) {
                  return pollForCompletion(attempts + 1, maxAttempts);
                } else {
                  console.error("[ProjectDetail] Sync failed after max attempts");
                  removeJob(String(jobId));
                  return false;
                }
              }
            };

            // Start polling in background
            pollForCompletion();
          }
        }
      }
      setCreateDeckDialogOpen(false);
      setSelectedDeck(null);
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to save deck");
    }
  };

  const handleFlashcardJobComplete = async (deckId, jobId, lastData) => {
    console.log("[ProjectDetail] Flashcard job complete for deck:", deckId, "Job:", jobId);
    if (jobId) removeJob(jobId);

    // Use the new sync method via POST
    await projectService.syncFlashcardsFromJob(deckId, jobId);

    // Update state locally for the specific deck to avoid global loading/spinner
    // We only fetch flashcards for this specific deck once to get the final count
    const updatedCards = await projectService.getDeckFlashcards(deckId);

    setDecks(prevDecks => prevDecks.map(d =>
      d.id === deckId ? { ...d, flashcards_count: updatedCards.length } : d
    ));
  };

  const handleEditDeck = (deck) => {
    setSelectedDeck(deck);
    setCreateDeckDialogOpen(true);
  };

  const handleCreateDeckFromTopic = (topic) => {
    setSelectedDeck({
      title: topic.name,
      description: topic.description,
      section_ids: topic.related_sections || [],
      // topic doesn't have document_ids explicitly but we could infer them if needed
      // however, related_sections is the main thing the user wants
    });
    setCreateDeckDialogOpen(true);
  };

  const handleDeleteDeck = (deck) => {
    setSelectedDeck(deck);
    setConfirmDeleteDeckDialogOpen(true);
  };

  const handleConfirmDeleteDeck = async () => {
    if (!selectedDeck) return;
    try {
      setError(null);
      await projectService.deleteDeck(selectedDeck.id);

      // Update state locally to avoid global loading spinner
      setDecks(prev => prev.filter(d => d.id !== selectedDeck.id));

      setConfirmDeleteDeckDialogOpen(false);
      setSelectedDeck(null);
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to delete deck");
    }
  };

  const handleUploadDocuments = useCallback(async (pId, filesOrResponse) => {
    try {
      const targetProjectId = pId || projectId;
      setError(null);

      // If it's a direct response from Uppy (via UploadDocumentsDialog),
      // the jobs are already registered internally by the dialog.
      if (filesOrResponse && !Array.isArray(filesOrResponse) && filesOrResponse.processing) {
        // Just refresh
      } else if (Array.isArray(filesOrResponse)) {
        // Fallback for legacy calls if any
        await projectService.uploadProjectDocuments(Number(targetProjectId), filesOrResponse);
      }

      await fetchDocuments(Number(targetProjectId));
    } catch (err) {
      setError(err?.error || err?.detail || "Failed to upload documents");
    }
  }, [projectId, fetchDocuments]);

  // Check membership before allowing upload
  const handleOpenUploadDialog = async () => {
    try {
      // Fetch membership status
      const membershipData = await projectService.getMembershipStatus();
      setMembership(membershipData);

      // Check if user is on Free tier and has reached limit
      if (membershipData?.tier === "Free") {
        const documentCount = documents.length;
        const limit = membershipData?.limit || 2;

        if (documentCount >= limit) {
          // Show upgrade prompt instead of upload dialog
          setUpgradePromptOpen(true);
          return;
        }
      }

      // If not Free or under limit, open upload dialog
      setUppyUploadDialogOpen(true);
    } catch (err) {
      console.error("Failed to check membership", err);
      // On error, allow upload (graceful degradation)
      setUppyUploadDialogOpen(true);
    }
  };

  const handleJobComplete = useCallback(async (docId, jobId) => {
    try {
      console.log("[ProjectDetail] Job complete:", { docId, jobId });
      if (docId) {
        await projectService.getDocumentTags(docId);
      }
      if (jobId) removeJob(jobId);
      await fetchDocuments(Number(projectId));

      setTimeout(() => {
        fetchSectionsCounts();
      }, 1000);
    } catch (err) {
      console.error("Error handling job completion:", err);
    }
  }, [projectId, removeJob, fetchDocuments, fetchSectionsCounts]);

  const handleDownloadDocument = async (doc) => {
    try {
      if (!doc?.id) return;

      const { url } = await projectService.getDocumentDownloadUrl(doc.id, 'download');
      if (!url) return;

      // Normalize relative URLs
      let targetUrl = url;
      if (targetUrl.startsWith("/")) {
        const origin = API_BASE.replace("/api", "");
        targetUrl = `${origin}${targetUrl}`;
      }

      const a = document.createElement("a");
      a.href = targetUrl;
      a.download = doc?.filename || "document";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading document:", err);
    }
  };

  const handleOpenDocument = (doc) => {
    setSelectedDocument(doc);
    setViewingDocument(doc);
  };

  const handleDeleteDocument = (doc) => {
    setSelectedDocument(doc);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDocument) return;
    try {
      setError(null);
      await projectService.deleteDocument(selectedDocument.id);
      setSelectedDocument(null);
      setConfirmDialogOpen(false);
      await fetchDocuments(Number(projectId));
    } catch (err) {
      setError(err?.error || "Failed to delete document");
    }
  };

  const handleViewMetadata = (doc) => {
    setSelectedDocument(doc);
    setMetadataDialogOpen(true);
  };

  const getStatusBadge = (doc) => {
    if (!doc) return "—";

    // Heuristic: If it has sections, it's definitely ready/finalizado
    const hasSections = (sectionsCounts[doc.id] || 0) > 0;
    const rawStatus = (doc.status || "").toLowerCase();

    // Normalize status: treat 'completed' or 'finalized' as 'ready'
    let status = rawStatus;
    if (hasSections || status === "completed" || status === "finalized") {
      status = "ready";
    }

    const statusMap = {
      pending: t("project_detail.docs.status.pending"),
      processing: t("project_detail.docs.status.processing"),
      ready: t("project_detail.docs.status.ready"),
      failed: t("project_detail.docs.status.failed")
    };

    const val = statusMap[status] || doc.status || "—";

    switch (status) {
      case "pending":
        return <Chip value={val} size="sm" color="gray" className="rounded-full" />;
      case "processing":
        return (
          <Chip
            value={val}
            icon={<Spinner className="h-3 w-3" />}
            size="sm"
            color="blue-gray"
            className="rounded-full"
          />
        );
      case "ready":
        return (
          <Chip
            value={val}
            icon={<CheckCircleIcon className="h-4 w-4" />}
            size="sm"
            color="green"
            className="rounded-full shadow-sm shadow-green-200"
          />
        );
      case "failed":
        return (
          <Chip
            value={val}
            icon={<ExclamationCircleIcon className="h-4 w-4" />}
            size="sm"
            color="red"
            className="rounded-full"
          />
        );
      default:
        return <Chip value={val} size="sm" color="blue-gray" className="rounded-full" />;
    }
  };

  const formatFileSize = (bytes) => {
    const b = Number(bytes || 0);
    if (!b) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${Math.round((b / Math.pow(k, i)) * 100) / 100} ${sizes[i]} `;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const processingCount = documents.filter((d) => d.status === "processing").length;

  if (loadingProject) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-12">
        <Spinner className="h-10 w-10" />
        <Typography className="mt-3 text-blue-gray-600">{t("project_detail.loading")}</Typography>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center py-12">
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {t("project_detail.not_found")}
        </Typography>
        {error && <Typography color="red" className="mb-4">{error}</Typography>}
        <Button onClick={() => navigate("/dashboard/projects")}>{t("project_detail.back")}</Button>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          <Typography className="text-sm font-bold text-red-900">{error}</Typography>
        </div>
      )}

      {/* Blocking Loader when processing documents */}
      {processingCount > 0 && <CookingLoader />}

      {/* Header Area */}
      <div className="flex flex-col gap-6 pb-2">
        <button
          onClick={() => navigate("/dashboard/projects")}
          className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl text-zinc-500 font-bold text-xs hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("project_detail.back").toUpperCase()}
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Typography variant="h2" className="font-black tracking-tight text-zinc-900">
                {project.title || project.name || "Untitled"}
              </Typography>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOwner ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-zinc-100 text-zinc-500"} `}>
                {isOwner ? "Owner" : "Member"}
              </div>
            </div>
            <Typography className="text-zinc-500 font-medium max-w-2xl leading-relaxed">
              {project.description || (language === "es" ? "Sin descripción" : "No description")}
            </Typography>

            {processingCount > 0 && (
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl w-fit">
                <Spinner className="h-4 w-4 text-indigo-500" />
                <Typography variant="small" className="font-bold text-indigo-600">
                  {t("project_detail.processing", {
                    count: processingCount,
                    item: processingCount === 1 ? t("project_detail.document") : t("project_detail.documents")
                  })}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-4 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/60 transition-all">
        <div className="max-w-screen-2xl mx-auto flex overflow-x-auto no-scrollbar gap-2">
          {[
            { id: "documents", label: t("project_detail.tabs.documents"), count: documents.length, icon: DocumentTextIcon },
            { id: "topics", label: t("project_detail.tabs.topics"), count: topics.length, icon: FolderIcon },
            { id: "rules", label: t("project_detail.tabs.rules"), count: rules.length, icon: ClipboardDocumentListIcon },
            { id: "batteries", label: t("project_detail.tabs.batteries"), count: batteries.length, icon: BoltIcon },
            { id: "decks", label: t("project_detail.tabs.decks"), count: decks.length, icon: Square2StackIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-premium ring-1 ring-zinc-200/50"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50"
                }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-500"}`} />
              {tab.label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? "bg-indigo-50 text-indigo-600" : "bg-zinc-100 text-zinc-400"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Documents tab */}
      {activeTab === "documents" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                {t("project_detail.tabs.documents")}
              </Typography>
              <Typography className="text-zinc-500 text-sm font-medium">
                {language === "es" ? "Gestiona y analiza los archivos de este proyecto." : "Manage and analyze the files for this project."}
              </Typography>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-6 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 text-white"
                onClick={handleOpenUploadDialog}
              >
                <DocumentArrowUpIcon className="h-5 w-5" />
                {t("project_detail.docs.btn_upload")}
              </Button>
            </div>
          </div>

          {/* Upload Limit Error Alert */}
          {uploadLimitError && (
            <Alert
              color="amber"
              className="rounded-2xl border-2 border-amber-200 bg-amber-50 shadow-lg"
              icon={
                <ExclamationCircleIcon className="h-6 w-6 text-amber-600" />
              }
            >
              <div>
                <Typography className="font-bold text-amber-900 mb-1">
                  {language === 'es' ? 'Límite de Plan Alcanzado' : 'Plan Limit Reached'}
                </Typography>
                <Typography className="text-sm text-amber-800">
                  {uploadLimitError}
                </Typography>
              </div>
            </Alert>
          )}

          <Card className="border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium rounded-[2rem] overflow-hidden">
            <CardBody className="p-0">
              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Spinner className="h-8 w-8 text-indigo-500 mb-4" />
                  <Typography className="text-zinc-500 font-bold text-sm tracking-tight uppercase tracking-widest">{t("project_detail.docs.loading")}</Typography>
                </div>
              ) : documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] table-auto text-left">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50">
                        {[
                          t("project_detail.docs.table.name"),
                          t("project_detail.docs.table.type"),
                          t("project_detail.docs.table.size"),
                          t("project_detail.docs.table.sections"),
                          t("project_detail.docs.table.uploaded"),
                          t("project_detail.docs.table.status"),
                          t("project_detail.docs.table.actions")
                        ].map((el, idx) => (
                          <th key={el} className={`py-4 px-6 ${idx === 0 ? "pl-8" : ""}`}>
                            <Typography className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              {el}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {documents.map((doc, index) => {
                        const isLast = index === documents.length - 1;
                        const rowClass = `group transition-all hover:bg-zinc-50/50 ${isLast ? "" : "border-b border-zinc-100"}`;

                        return (
                          <tr key={doc.id} className={rowClass}>
                            <td className="py-4 px-6 pl-8">
                              <div
                                className="flex items-center gap-3 cursor-pointer group/item"
                                onClick={() => setViewingDocument(doc)}
                              >
                                <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-all">
                                  <DocumentTextIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <Typography className="font-bold text-zinc-900 text-sm group-hover/item:text-indigo-600 transition-colors truncate max-w-[200px]">
                                    {doc.filename || doc.file || "Untitled"}
                                  </Typography>
                                  <Typography className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                                    {language === "es" ? "Documento" : "Document"}
                                  </Typography>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase w-fit tracking-widest">
                                {doc.type}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <Typography className="text-zinc-600 font-bold text-xs font-mono">
                                {formatFileSize(doc.size)}
                              </Typography>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Typography className="text-zinc-600 font-black text-sm">
                                  {sectionsCounts[doc.id] || 0}
                                </Typography>
                                <Tooltip content={t("project_detail.docs.actions.view")}>
                                  <IconButton
                                    size="sm"
                                    variant="text"
                                    className="rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                                    onClick={() => handleViewMetadata(doc)}
                                  >
                                    <ViewColumnsIcon className="h-4 w-4" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <Typography className="text-zinc-500 font-medium text-xs">
                                {formatDate(doc.uploaded_at || doc.created_at || doc.uploadedAt)}
                              </Typography>
                            </td>

                            <td className="py-4 px-6">
                              {activeJobs[String(doc.id)] ? (
                                <div className="w-32">
                                  <ProjectProcessingProgress
                                    jobId={activeJobs[String(doc.id)]}
                                    onComplete={() => handleJobComplete(String(doc.id), activeJobs[String(doc.id)])}
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(doc)}
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              <Menu placement="left-start">
                                <MenuHandler>
                                  <IconButton variant="text" className="rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900" size="sm">
                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                  </IconButton>
                                </MenuHandler>
                                <MenuList className="p-2 border-zinc-200/60 shadow-xl rounded-2xl backdrop-blur-md bg-white/90">
                                  <MenuItem
                                    onClick={() => handleDownloadDocument(doc)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                                  >
                                    <ArrowDownTrayIcon className="h-4 w-4 text-zinc-400" />
                                    {t("project_detail.docs.actions.download")}
                                  </MenuItem>

                                  <MenuItem
                                    onClick={() => setViewingDocument(doc)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                                  >
                                    <EyeIcon className="h-4 w-4 text-zinc-400" />
                                    {language === "es" ? "Ver Documento" : "View Document"}
                                  </MenuItem>

                                  <MenuItem
                                    onClick={() => handleViewMetadata(doc)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-700 font-bold text-xs hover:bg-zinc-50 hover:text-zinc-900 transition-all"
                                  >
                                    <InformationCircleIcon className="h-4 w-4 text-zinc-400" />
                                    {t("project_detail.docs.actions.metadata")}
                                  </MenuItem>

                                  {isOwner && (
                                    <>
                                      <div className="my-2 border-t border-zinc-100" />
                                      <MenuItem
                                        onClick={() => handleDeleteDocument(doc)}
                                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 font-bold text-xs hover:bg-red-50 hover:text-red-700 transition-all"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                        {t("project_detail.docs.actions.delete")}
                                      </MenuItem>
                                    </>
                                  )}
                                </MenuList>
                              </Menu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] py-12 text-center px-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center text-zinc-300 mb-6 shadow-inner">
                    <DocumentTextIcon className="h-10 w-10" />
                  </div>
                  <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                    {t("project_detail.docs.empty.title")}
                  </Typography>
                  <Typography className="text-zinc-500 text-sm max-w-sm font-medium mb-8">
                    {t("project_detail.docs.empty.desc")}
                  </Typography>
                  <div className="flex gap-4">
                    <Button
                      className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-8 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 text-white"
                      onClick={handleOpenUploadDialog}
                    >
                      <DocumentArrowUpIcon className="h-5 w-5" />
                      {t("project_detail.docs.btn_upload")}
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card >
        </div >
      )
      }

      {
        activeTab === "topics" && (
          <>
            {/* Header + Actions Row */}
            {/* Header + Actions Row */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                    {t("project_detail.topics.title")}
                  </Typography>
                  <Typography className="text-zinc-500 text-sm font-medium max-w-2xl">
                    {t("project_detail.topics.description_text")}
                  </Typography>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  {/* Search Topics */}
                  <div className="relative flex-1 min-w-[240px]">
                    <input
                      type="text"
                      placeholder={language === "es" ? "Buscar temas..." : "Search topics..."}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-400 text-sm bg-white"
                      value={topicsSearch}
                      onChange={(e) => setTopicsSearch(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                  </div>

                  <Button
                    className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-6 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 shrink-0"
                    onClick={() => setCreateTopicDialogOpen(true)}
                  >
                    <PlusIcon className="h-5 w-5" />
                    {t("project_detail.topics.btn_create")}
                  </Button>
                </div>
              </div>

              {topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {topics
                    .filter(t => t.name.toLowerCase().includes(topicsSearch.toLowerCase()))
                    .map((topic) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        allDocumentsWithSections={documentsWithSections}
                        onEdit={handleEditTopic}
                        onArchive={handleArchiveTopic}
                        onDelete={handleDeleteTopic}
                        onCreateDeck={handleCreateDeckFromTopic}
                      />
                    ))}
                </div>
              ) : (
                <Card className="border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium rounded-[2rem] min-h-[400px]">
                  <CardBody className="flex flex-col items-center justify-center text-center px-6 h-full">
                    <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 flex items-center justify-center text-zinc-300 mb-6 shadow-inner">
                      <FolderIcon className="h-10 w-10" />
                    </div>
                    <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                      {t("project_detail.topics.empty.title")}
                    </Typography>
                    <Typography className="text-zinc-500 text-sm max-w-sm font-medium mb-8">
                      {t("project_detail.topics.empty.desc")}
                    </Typography>
                    <Button
                      className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-8 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 text-white"
                      onClick={() => setCreateTopicDialogOpen(true)}
                    >
                      <PlusIcon className="h-5 w-5" />
                      {t("project_detail.topics.btn_create")}
                    </Button>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Dialogs - Topics */}
            <CreateTopicDialog
              open={createTopicDialogOpen}
              onClose={() => setCreateTopicDialogOpen(false)}
              onCreate={handleCreateTopic}
              projectId={projectId}
            />

            <EditTopicDialog
              open={editTopicDialogOpen}
              onClose={() => setEditTopicDialogOpen(false)}
              onSave={handleSaveEditTopic}
              topic={selectedTopic}
              availableDocuments={readyDocuments}
            />

            <ConfirmDialog
              open={confirmTopicDialogOpen}
              onClose={() => setConfirmTopicDialogOpen(false)}
              onConfirm={handleConfirmArchiveTopic}
              title="Archive Topic"
              message={`Are you sure you want to archive "${selectedTopic?.name}" ? You can restore it later.`}
              confirmText="Archive"
              variant="info"
            />
            <ConfirmDialog
              open={confirmTopicDialogOpen}
              onClose={() => setConfirmTopicDialogOpen(false)}
              onConfirm={handleConfirmArchiveTopic}
              title="Archive Topic"
              message={`Are you sure you want to archive "${selectedTopic?.name}" ? You can restore it later.`}
              confirmText="Archive"
              variant="info"
            />

            <ConfirmDialog
              open={confirmDeleteTopicDialogOpen}
              onClose={() => setConfirmDeleteTopicDialogOpen(false)}
              onConfirm={handleConfirmDeleteTopic}
              title="Delete Topic"
              message={`Are you sure you want to delete "${selectedTopic?.name}" ? This action cannot be undone.`}
              confirmText="Delete"
              variant="danger"
            />
          </>
        )
      }

      {
        activeTab === "rules" && (
          <>
            {/* Header + Actions Row */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                    {t("project_detail.rules.title")}
                  </Typography>
                  <Typography className="text-zinc-500 text-sm font-medium max-w-2xl">
                    {t("project_detail.rules.description_text")}
                  </Typography>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  {/* Search Rules */}
                  <div className="relative flex-1 min-w-[240px]">
                    <input
                      type="text"
                      placeholder={language === "es" ? "Buscar reglas..." : "Search rules..."}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-400 text-sm bg-white"
                      value={rulesSearch}
                      onChange={(e) => setRulesSearch(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                  </div>

                  <Button
                    className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-6 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 shrink-0"
                    onClick={() => setShowCreateRule(true)}
                  >
                    <PlusIcon className="h-5 w-5" />
                    {t("project_detail.rules.btn_create")}
                  </Button>
                </div>
              </div>

              {showCreateRule && (
                <Card className="mb-6 border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium rounded-[2rem]">
                  <CardBody>
                    <Typography variant="h6" className="font-bold text-zinc-900 mb-4">
                      {t("project_detail.rules.btn_create")}
                    </Typography>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Typography variant="small" className="mb-1 text-blue-gray-600">
                          {language === "es" ? "Nombre" : "Name"}
                        </Typography>
                        <input
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={ruleForm.name}
                          onChange={(e) => setRuleForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Typography variant="small" className="mb-1 text-blue-gray-600">Global Count</Typography>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={ruleForm.global_count}
                          onChange={(e) => setRuleForm((p) => ({ ...p, global_count: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Typography variant="small" className="mb-1 text-blue-gray-600">Time Limit (minutes)</Typography>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={ruleForm.time_limit}
                          onChange={(e) => setRuleForm((p) => ({ ...p, time_limit: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Typography variant="small" className="mb-1 text-blue-gray-600">Strategy</Typography>
                        <select
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={ruleForm.distribution_strategy}
                          onChange={(e) => setRuleForm((p) => ({ ...p, distribution_strategy: e.target.value }))}
                        >
                          <option value="singleChoice">Single Choice</option>
                          <option value="multiSelect">Multi Select</option>
                          <option value="trueFalse">True False</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>

                      <div>
                        <Typography variant="small" className="mb-1 text-blue-gray-600">Difficulty</Typography>
                        <select
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={ruleForm.difficulty}
                          onChange={(e) => setRuleForm((p) => ({ ...p, difficulty: e.target.value }))}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <Typography variant="small" className="mb-1 text-blue-gray-600">Topic Scope (optional)</Typography>
                        <select
                          className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                          value={ruleForm.topic_scope || ""}
                          onChange={(e) =>
                            setRuleForm((p) => ({ ...p, topic_scope: e.target.value ? Number(e.target.value) : null }))
                          }
                        >
                          <option value="">(Global)</option>
                          {topics.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="text" onClick={() => setShowCreateRule(false)}>
                        {language === "es" ? "Cancelar" : "Cancel"}
                      </Button>
                      <Button color="blue-gray" onClick={handleCreateRule} disabled={!ruleForm.name}>
                        {language === "es" ? "Guardar Regla" : "Save Rule"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {loadingRules ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner className="h-10 w-10 mb-4" />
                  <Typography className="text-blue-gray-600">{t("global.rules.loading")}</Typography>
                </div>
              ) : rules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {rules
                    .filter(r => r.name.toLowerCase().includes(rulesSearch.toLowerCase()))
                    .map((rule) => (
                      <Card key={rule.id} className="border border-blue-gray-100 shadow-sm">
                        <CardBody>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <Typography variant="h6" color="blue-gray">{rule.name}</Typography>
                              <Typography variant="small" className="text-blue-gray-500">
                                {t("global.rules.table.strategy")}: {rule.distribution_strategy} • {t("global.rules.table.difficulty")}: {rule.difficulty}
                              </Typography>
                            </div>

                            {isOwner && (
                              <IconButton
                                size="sm"
                                variant="text"
                                color="red"
                                onClick={async () => {
                                  try {
                                    setError(null);
                                    await projectService.deleteRule(rule.id);
                                    await fetchRules(Number(projectId));
                                  } catch (err) {
                                    setError(err?.error || err?.detail || "Failed to delete rule");
                                  }
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            )}
                          </div>

                          <div className="space-y-1 text-sm text-blue-gray-600">
                            <div className="flex justify-between">
                              <span>{t("global.rules.table.questions")}</span>
                              <span className="font-medium text-blue-gray-900">{rule.global_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{language === "es" ? "Límite de Tiempo" : "Time Limit"}</span>
                              <span className="font-medium text-blue-gray-900">{rule.time_limit} min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("global.rules.table.topic")}</span>
                              <span className="font-medium text-blue-gray-900">
                                {rule.topic_scope ? `${t("project_detail.tabs.topics")} #${rule.topic_scope} ` : (language === "es" ? "Global" : "Global")}
                              </span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium rounded-[2rem] min-h-[400px]">
                  <CardBody className="flex flex-col items-center justify-center text-center px-6 h-full">
                    <ClipboardDocumentListIcon className="h-16 w-16 mb-4 text-zinc-300" />
                    <Typography variant="h6" className="mb-2 text-zinc-900">{t("global.rules.no_rules")}</Typography>
                    <Typography className="text-zinc-500 mb-6">
                      {language === "es"
                        ? "Crea una regla para definir cómo se generan las baterías."
                        : "Create a rule to define how batteries are generated."}
                    </Typography>
                    <div>
                      <Button
                        className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-8 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 text-white"
                        onClick={() => setShowCreateRule(true)}
                      >
                        <PlusIcon className="h-5 w-5" />
                        {t("project_detail.rules.btn_create")}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        )
      } {
        activeTab === "batteries" && (
          <>
            {/* Header + Actions Row */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                    {t("project_detail.batteries.title")}
                  </Typography>
                  <Typography className="text-zinc-500 text-sm font-medium max-w-2xl">
                    {t("project_detail.batteries.description_text")}
                  </Typography>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  {/* Search Batteries */}
                  <div className="relative flex-1 min-w-[240px]">
                    <input
                      type="text"
                      placeholder={t("project_detail.batteries.search_placeholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-400 text-sm bg-white"
                      value={batteriesSearch}
                      onChange={(e) => setBatteriesSearch(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                  </div>

                  <Button
                    className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-6 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 shrink-0"
                    onClick={() => {
                      setBatteryErrors({});
                      setShowGenerateBattery(true);
                    }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    {t("project_detail.batteries.btn_create")}
                  </Button>
                </div>
              </div>

              {showGenerateBattery && (
                <Card className="mb-6 border border-blue-gray-100 shadow-sm">
                  <CardBody>
                    <Typography variant="h6" color="blue-gray" className="mb-4">
                      {language === "es" ? "Generar Nueva Batería" : "Generate New Battery"}
                    </Typography>

                    <div className="space-y-4">
                      {/* Query Text */}
                      <div>
                        <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                          {language === "es" ? "Sobre qué quieres las preguntas (opcional)" : "What do you want questions about? (optional)"}
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 border rounded-md transition-all ${batteryErrors.query_text ? "border-red-500 bg-red-50/10 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "border-blue-gray-200 focus:border-indigo-500"} `}
                          placeholder={language === "es" ? "Ej: Barca, Historia de España, etc." : "E.g: Barcelona, Spanish History, etc."}
                          value={batteryForm.query_text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatteryForm(prev => ({ ...prev, query_text: val }));

                            // Real-time validation
                            const trimmed = val.trim().toLowerCase() || (language === "es" ? "batería" : "battery");
                            if (batteries.some(b => (b.name || "").toLowerCase() === trimmed)) {
                              setBatteryErrors(prev => ({
                                ...prev,
                                query_text: language === "es"
                                  ? "Ya existe una batería con este nombre o información."
                                  : "A battery with this name or info already exists."
                              }));
                            } else {
                              setBatteryErrors(prev => ({ ...prev, query_text: null }));
                            }
                          }}
                        />
                        {batteryErrors.query_text && (
                          <Typography variant="small" color="red" className="mt-1 font-medium flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-red-500" /> {batteryErrors.query_text}
                          </Typography>
                        )}
                      </div>

                      {/* Sections Selection */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${(batteryErrors.sections || availableSections.length === 0) ? "text-red-500" : "text-blue-gray-700"} `}>
                          {language === "es" ? "Secciones *" : "Sections *"}
                        </label>

                        {availableSections.length === 0 ? (
                          <div className="p-4 text-center bg-red-50/50 rounded-xl border border-dashed border-red-200 animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex flex-col items-center gap-2">
                              <ExclamationCircleIcon className="h-6 w-6 text-red-400 mb-1" />
                              <Typography variant="small" className="text-red-900 font-bold leading-relaxed px-4">
                                {language === "es"
                                  ? "Usted no tiene secciones disponibles. Debe subir un documento para que el sistema procese el contenido."
                                  : "You don't have any sections available. You should upload a document so the system can process the content."}
                              </Typography>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2">
                              <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-md transition-colors ${batteryErrors.sections ? "border-red-500 bg-red-50/10" : "border-blue-gray-200 focus:border-indigo-500"} `}
                                placeholder={language === "es" ? "Buscar secciones..." : "Search sections..."}
                                value={sectionSearch}
                                onChange={(e) => setSectionSearch(e.target.value)}
                              />
                            </div>

                            {batteryErrors.sections && (
                              <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                {batteryErrors.sections}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-2">
                              {batteryForm.sections.map((sec) => (
                                <Chip
                                  key={sec.id}
                                  value={`${sec.documentName}: ${sec.name} `}
                                  onClose={() => {
                                    setBatteryForm(prev => ({
                                      ...prev,
                                      sections: prev.sections.filter((s) => s.id !== sec.id)
                                    }));
                                  }}
                                  className="rounded-full bg-blue-50 text-blue-900"
                                />
                              ))}
                            </div>
                            <div className={`max-h-32 overflow-y-auto border rounded-md transition-colors ${batteryErrors.sections ? "border-red-200" : "border-blue-gray-100"} `}>
                              {availableSections
                                .filter(sec =>
                                  sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
                                  sec.documentName.toLowerCase().includes(sectionSearch.toLowerCase())
                                )
                                .filter(sec => !batteryForm.sections.some(s => s.id === sec.id))
                                .map((sec) => (
                                  <div
                                    key={sec.id}
                                    className="px-3 py-2 hover:bg-blue-gray-50 cursor-pointer text-sm flex flex-col items-start"
                                    onClick={() => {
                                      setBatteryForm(prev => ({
                                        ...prev,
                                        sections: [...prev.sections, sec]
                                      }));
                                      setSectionSearch("");
                                      if (batteryErrors.sections) setBatteryErrors(prev => ({ ...prev, sections: null }));
                                    }}
                                  >
                                    <span className="font-medium text-blue-gray-800">{sec.name}</span>
                                    <span className="text-xs text-gray-500">{sec.documentName}</span>
                                  </div>
                                ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Rule Selection (Optional) */}
                        <div>
                          <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                            {language === "es" ? "Regla (opcional)" : "Rule (optional)"}
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                            value={batteryForm.rule}
                            onChange={(e) => setBatteryForm(prev => ({ ...prev, rule: e.target.value }))}
                          >
                            <option value="">{language === "es" ? "Sin regla" : "No rule"}</option>
                            {rules.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity (conditional) */}
                        {!batteryForm.rule && (
                          <div>
                            <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                              {language === "es" ? "Cantidad de Preguntas *" : "Number of Questions *"}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                              value={batteryForm.quantity}
                              onChange={(e) => setBatteryForm(prev => ({ ...prev, quantity: e.target.value }))}
                            />
                          </div>
                        )}

                        {/* Difficulty */}
                        <div>
                          <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                            {language === "es" ? "Dificultad *" : "Difficulty *"}
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                            value={batteryForm.difficulty}
                            onChange={(e) => setBatteryForm(prev => ({ ...prev, difficulty: e.target.value }))}
                          >
                            <option value="easy">{language === "es" ? "Fácil" : "Easy"}</option>
                            <option value="medium">{language === "es" ? "Medio" : "Medium"}</option>
                            <option value="hard">{language === "es" ? "Difícil" : "Hard"}</option>
                          </select>
                        </div>

                        {/* Question Format */}
                        <div>
                          <label className="block text-sm font-medium text-blue-gray-700 mb-2">
                            {language === "es" ? "Formato de Pregunta *" : "Question Format *"}
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-blue-gray-200 rounded-md"
                            value={batteryForm.question_format}
                            onChange={(e) => setBatteryForm(prev => ({ ...prev, question_format: e.target.value }))}
                          >
                            <option value="true_false">{language === "es" ? "Verdadero/Falso" : "True/False"}</option>
                            <option value="single_choice">{language === "es" ? "Opción Única" : "Single Choice"}</option>
                            <option value="multiple_choice">{language === "es" ? "Selección Múltiple" : "Multiple Choice"}</option>
                            <option value="variety">{language === "es" ? "Variado" : "Variety"}</option>
                          </select>
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="text" onClick={() => setShowGenerateBattery(false)}>
                          {language === "es" ? "Cancelar" : "Cancel"}
                        </Button>
                        <Button
                          color="blue-gray"
                          onClick={handleGenerateBattery}
                          disabled={!!batteryErrors.query_text || availableSections.length === 0}
                        >
                          {language === "es" ? "Generar Batería" : "Generate Battery"}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {batteries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batteries
                    .filter(b => b.name.toLowerCase().includes(batteriesSearch.toLowerCase()))
                    .map((battery) => (
                      <Card key={battery.id} className="border border-blue-gray-100 shadow-sm">
                        <CardBody>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1">
                              <Chip
                                value={battery.status}
                                color={battery.status === "Ready" ? "green" : "blue-gray"}
                                size="sm"
                                variant="ghost"
                                className="rounded-full"
                              />
                              <Tooltip content="Simulate Exam">
                                <IconButton
                                  size="sm"
                                  variant="text"
                                  color="green"
                                  onClick={() => setSimulationBattery(battery)}
                                >
                                  <PlayIcon className="h-4 w-4" />
                                </IconButton>
                              </Tooltip>
                            </div>

                            {isOwner && (
                              <Menu placement="bottom-end">
                                <MenuHandler>
                                  <IconButton size="sm" variant="text" color="blue-gray">
                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                  </IconButton>
                                </MenuHandler>
                                <MenuList>

                                  <MenuItem
                                    onClick={async () => {
                                      await projectService.deleteBattery(battery.id);
                                      await fetchBatteries(Number(projectId));
                                    }}
                                    className="text-red-500"
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            )}
                          </div>

                          <Typography variant="h6" color="blue-gray" className="mb-1 truncate">
                            {battery.name}
                          </Typography>

                          <div className="flex gap-2 mb-4">
                            <Chip
                              value={battery.difficulty || "Medium"}
                              size="sm"
                              variant="outlined"
                              className="rounded-full text-[10px] py-0 px-2 border-blue-gray-200 text-blue-gray-500"
                            />
                            <Typography variant="small" className="text-blue-gray-500 text-xs">
                              {(battery.questions?.length || 0)} {language === "es" ? "preguntas" : "questions"} •{" "}
                              {formatDate(battery.created_at || battery.createdAt)}
                            </Typography>
                          </div>

                          {/* Generation Progress */}
                          {batteryProgress[String(battery.id)] && (
                            <div className="mt-4 pt-4 border-t border-blue-gray-50 group/batprog">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                  <Typography variant="small" className="font-medium text-blue-600">
                                    {batteryProgress[String(battery.id)].status}
                                  </Typography>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Typography variant="small" className="font-bold text-blue-600">
                                    {Math.round(batteryProgress[String(battery.id)].percent || 0)}%
                                  </Typography>
                                  <IconButton
                                    size="sm"
                                    variant="text"
                                    color="blue-gray"
                                    className="h-5 w-5 rounded-md opacity-0 group-hover/batprog:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setBatteryProgress(prev => {
                                        const ns = { ...prev };
                                        delete ns[battery.id];
                                        return ns;
                                      });
                                      removeJob(battery.id);
                                    }}
                                    title={language === "es" ? "Quitar" : "Dismiss"}
                                  >
                                    <XMarkIcon className="h-3.5 w-3.5" />
                                  </IconButton>
                                </div>
                              </div>
                              <Progress value={Math.round(batteryProgress[String(battery.id)].percent || 0)} size="sm" color="blue" />
                            </div>
                          )}

                          {/* Attempts summary */}
                          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs">
                            {battery.attempts_count > 0 ? (
                              <div className="flex items-center justify-between">
                                <span className="text-blue-gray-700 font-semibold">
                                  {language === "es" ? "Intentos" : "Attempts"}: {battery.attempts_count}
                                </span>

                                <span className="text-blue-gray-600">
                                  {language === "es" ? "Último" : "Last"}: {Number(battery.last_attempt?.percent || 0).toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-blue-gray-400">{language === "es" ? "Sin intentos aún" : "No attempts yet"}</span>
                            )}
                          </div>

                        </CardBody>
                      </Card>
                    ))}
                </div>
              ) : (
                <Card className="border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium rounded-[2rem] min-h-[400px]">
                  <CardBody className="flex flex-col items-center justify-center text-center px-6 h-full">
                    <BoltIcon className="h-16 w-16 mb-4 text-zinc-300" />
                    <Typography variant="h6" className="mb-2 text-zinc-900">
                      {t("global.batteries.no_batteries")}
                    </Typography>
                    <Typography className="text-zinc-500 mb-6">
                      {language === "es"
                        ? "Genera baterías a partir de tus reglas configuradas."
                        : "Generate batteries from your configured rules."}
                    </Typography>
                    <div>
                      <Button
                        className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-8 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 text-white"
                        onClick={() => {
                          setBatteryErrors({});
                          setShowGenerateBattery(true);
                        }}
                      >
                        <PlusIcon className="h-5 w-5" />
                        {t("project_detail.batteries.btn_create")}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        )
      }

      {
        activeTab === "decks" && (
          <>
            {/* Header + Actions Row */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <Typography variant="h5" className="font-bold text-zinc-900 mb-2">
                    {t("project_detail.decks.title")}
                  </Typography>
                  <Typography className="text-zinc-500 text-sm font-medium max-w-2xl">
                    {t("project_detail.decks.description_text")}
                  </Typography>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                  {/* Search Decks */}
                  <div className="relative flex-1 min-w-[240px]">
                    <input
                      type="text"
                      placeholder={t("project_detail.decks.search_placeholder")}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-400 text-sm bg-white"
                      value={deckSearch}
                      onChange={(e) => setDeckSearch(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </div>
                  </div>

                  <Button
                    className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-6 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 shrink-0"
                    onClick={() => {
                      setSelectedDeck(null);
                      setCreateDeckDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    {t("project_detail.decks.btn_create")}
                  </Button>
                </div>
              </div>

              {loadingDecks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner className="h-10 w-10 mb-4" />
                  <Typography className="text-blue-gray-600">{language === "es" ? "Cargando mazos..." : "Loading decks..."}</Typography>
                </div>
              ) : decks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {decks
                    .filter(deck => deck.title.toLowerCase().includes(deckSearch.toLowerCase()))
                    .map((deck) => (
                      <DeckCard
                        key={deck.id}
                        deck={deck}
                        onEdit={handleEditDeck}
                        onDelete={handleDeleteDeck}
                        onStudy={handleStudyDeck}
                        onLearn={handleLearnDeck}
                        onAddCards={handleOpenAddCards}
                        job={activeFlashcardJobs[String(deck.id)]}
                        onJobComplete={(lastData) => handleFlashcardJobComplete(String(deck.id), activeFlashcardJobs[String(deck.id)]?.job_id, lastData)}
                      />
                    ))}
                </div>
              ) : (
                <Card className="border border-zinc-200/60 bg-white/70 backdrop-blur-sm shadow-premium rounded-[2rem] min-h-[400px]">
                  <CardBody className="flex flex-col items-center justify-center text-center px-6 h-full">
                    <Square2StackIcon className="h-16 w-16 text-zinc-300 mb-4" />
                    <Typography variant="h5" color="blue-gray" className="mb-2 font-bold text-zinc-900">
                      {t("project_detail.decks.empty.title")}
                    </Typography>
                    <Typography className="text-zinc-500 mb-4 text-center text-sm font-medium">
                      {t("project_detail.decks.empty.desc")}
                    </Typography>
                    <Button
                      className="flex items-center gap-2 bg-zinc-900 shadow-lg shadow-zinc-200 rounded-2xl normal-case font-black px-8 py-3 transition-all hover:bg-indigo-600 hover:shadow-indigo-500/20 active:scale-95 text-white"
                      onClick={() => {
                        setSelectedDeck(null);
                        setCreateDeckDialogOpen(true);
                      }}
                    >
                      <PlusIcon className="h-5 w-5" />
                      {t("project_detail.decks.btn_create")}
                    </Button>
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        )
      }








      {/* (Los otros tabs los puedes mantener como UI-only por ahora) */}

      <UploadDocumentsDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUpload={handleUploadDocuments}
        project={project}
      />

      <UppyUploadDialog
        open={uppyUploadDialogOpen}
        onClose={() => {
          console.log("UppyUploadDialog closing");
          setUppyUploadDialogOpen(false);
        }}
        project={project}
        onUploadSuccess={() => {
          console.log("Upload success!");
          fetchDocuments(Number(projectId));
          setUppyUploadDialogOpen(false);
          setUploadLimitError(null); // Clear any previous errors
        }}
        onUploadError={(errorMessage) => {
          console.log("🔴 onUploadError called with message:", errorMessage);
          setUploadLimitError(errorMessage);
          console.log("🔴 uploadLimitError state set to:", errorMessage);
        }}
      />

      <UpgradePromptDialog
        open={upgradePromptOpen}
        onClose={() => setUpgradePromptOpen(false)}
        featureName={language === 'es' ? 'documentos' : 'documents'}
        currentCount={documents.length}
        limit={membership?.limit || 2}
      />

      <DocumentMetadataDialog
        open={metadataDialogOpen}
        onClose={() => setMetadataDialogOpen(false)}
        document={selectedDocument}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("project_detail.docs.actions.delete")}
        message={t("project_detail.dialogs.delete_message", { name: selectedDocument?.filename || "this document" })}
        confirmText={t("project_detail.docs.actions.delete")}
        variant="danger"
      />

      <ExamSimulatorDialog
        open={!!simulationBattery}
        handler={handleCloseSimulator}
        battery={simulationBattery}
      />

      <CreateDeckDialog
        open={createDeckDialogOpen}
        onClose={() => {
          setCreateDeckDialogOpen(false);
          setSelectedDeck(null);
        }}
        onCreate={handleCreateDeck}
        projectId={projectId}
        deck={selectedDeck}
        existingDecks={decks}
      />

      <AddFlashcardsDialog
        open={addFlashcardsOpen}
        onClose={() => {
          setAddFlashcardsOpen(false);
          setSelectedDeckForAdd(null);
        }}
        onSuccess={() => fetchDecks(projectId)}
        deckId={selectedDeckForAdd?.id}
        deckTitle={selectedDeckForAdd?.title}
      />

      {
        selectedDeck && (
          <FlashcardViewDialog
            open={flashcardViewDialogOpen}
            onClose={() => {
              setFlashcardViewDialogOpen(false);
              setSelectedDeck(null);
            }}
            deckId={selectedDeck.id}
            deckTitle={selectedDeck.title}
          />
        )
      }

      {
        learnDeck && (
          <FlashcardLearnDialog
            open={learnDialogOpen}
            onClose={() => {
              setLearnDialogOpen(false);
              setLearnDeck(null);
            }}
            deckId={learnDeck.id}
            deckTitle={learnDeck.title}
          />
        )
      }

      <ConfirmDialog
        open={confirmDeleteDeckDialogOpen}
        onClose={() => setConfirmDeleteDeckDialogOpen(false)}
        onConfirm={handleConfirmDeleteDeck}
        title={language === "es" ? "Eliminar Mazo" : "Delete Deck"}
        message={language === "es" ? `¿Estás seguro de que quieres eliminar el mazo "${selectedDeck?.title}" ? ` : `Are you sure you want to delete deck "${selectedDeck?.title}" ? `}
        confirmText={t("global.actions.delete")}
        variant="danger"
      />

      <DocumentViewerDialog
        open={!!viewingDocument}
        onClose={() => setViewingDocument(null)}
        document={viewingDocument}
      />
    </div >
  );
}

export default ProjectDetail;
