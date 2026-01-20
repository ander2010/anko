import api, { API_BASE } from "./api";

export { API_BASE };

const BASE = "/projects/";
const BASE_FLASHCARDS = "/flashcards";

const projectService = {
  async createProject(projectData, logoFile = null, documentFiles = []) {
    try {
      // 1) Crear proyecto (multipart porque puede incluir logo)
      const formData = new FormData();

      const title = (projectData.title ?? projectData.name ?? "").trim();
      formData.append("title", title);
      formData.append("description", projectData.description?.trim() || "");
      if (logoFile) formData.append("logo", logoFile);

      const res = await api.post(`${BASE}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const project = res.data;
      const projectId = project?.id;

      // 2) Subir documentos si existen (requiere endpoint backend)
      if (projectId && documentFiles && documentFiles.length > 0) {
        await this.uploadDocuments(projectId, documentFiles);
      }

      return project;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to create project" };
    }
  },

  async uploadDocuments(projectId, files) {
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await api.post(`/projects/${projectId}/documents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to upload documents" };
    }
  },


  async getProjects(params = {}) {
    try {
      const res = await api.get(`${BASE}`, { params });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch projects" };
    }
  },

  async getProjectDetail(id) {
    try {
      const res = await api.get(`${BASE}${id}/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch project" };
    }
  },

  async getProjectCounts(projectId) {
    try {
      const res = await api.get(`${BASE}${projectId}/counts/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch counts" };
    }
  },
  async getProjectDocuments(projectId) {
    try {
      const res = await api.get(`/projects/${projectId}/documents/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch documents" };
    }
  },

  async uploadProjectDocuments(projectId, files) {
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await api.post(`/projects/${projectId}/documents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to upload documents" };
    }
  },

  async getDocumentsWithSections(projectId) {
    try {
      const res = await api.get(`/projects/${projectId}/documents-with-sections/`);
      return res.data; // Expected: { projectId: ..., documents: [...] }
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch document sections" };
    }
  },

  async deleteDocument(documentId) {
    try {
      await api.delete(`/documents/${documentId}/`);
    } catch (err) {
      throw err?.response?.data || { error: "Failed to delete document" };
    }
  },

  async getDocumentTags(documentId) {
    try {
      const res = await api.get(`/documents/${documentId}/tags/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch document tags" };
    }
  },

  async getDocumentDownloadUrl(documentId, mode = 'view') {
    try {
      // mode can be 'view' or 'download'
      const res = await api.get(`/documents/${documentId}/download-url/`, {
        params: { mode }
      });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch download URL" };
    }
  },

  async fetchDocumentWithAuth(url) {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Token ${token}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`Failed to fetch file from storage: ${response.statusText}`);
      const blob = await response.blob();
      return window.URL.createObjectURL(blob);
    } catch (err) {
      console.error("fetchDocumentWithAuth error:", err);
      throw err;
    }
  },

  async updateProject(id, projectData) {
    try {
      const res = await api.patch(`${BASE}${id}/`, projectData);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to update project" };
    }
  },

  async deleteProject(id) {
    try {
      await api.delete(`${BASE}${id}/`);
    } catch (err) {
      throw err?.response?.data || { error: "Failed to delete project" };
    }
  },

  // -------- TOPICS --------
  async getProjectTopics(projectId) {
    const res = await api.get("/topics/", {
      params: { project: projectId },
    });
    return res.data;
  },

  async createTopic(projectId, payload) {
    const res = await api.post("/topics/", {
      project: projectId,
      status: "active",
      ...payload,
    });
    return res.data;
  },

  async updateTopic(topicId, payload) {
    const res = await api.patch(`/topics/${topicId}/`, payload);
    return res.data;
  },

  async deleteTopic(topicId) {
    const res = await api.delete(`/topics/${topicId}/`);
    return res.data;
  },


  async getAllRules() {
    const res = await api.get("/rules/");
    return res.data;
  }

  ,

  async getAllBatteries() {
    const res = await api.get("/batteries/");
    return res.data;
  }
  ,

  async archiveTopic(topicId) {
    const res = await api.patch(`/topics/${topicId}/`, {
      status: "archived",
    });
    return res.data;
  },

  async getProjectRules(projectId) {
    const res = await api.get(`/rules/?project=${projectId}`);
    return res.data;
  },

  async createRule(projectId, payload) {
    // payload debe incluir fields requeridos
    const res = await api.post(`/rules/`, {
      ...payload,
      project: projectId,
    });
    return res.data;
  },

  async updateRule(ruleId, payload) {
    const res = await api.patch(`/rules/${ruleId}/`, payload);
    return res.data;
  },

  async deleteRule(ruleId) {
    const res = await api.delete(`/rules/${ruleId}/`);
    return res.data;
  },


  // -------- BATTERIES --------
  async getProjectBatteries(projectId) {
    try {
      const res = await api.get("/batteries/", {
        params: { project: projectId },
      });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch batteries" };
    }
  },

  async getUserBatteries() {
    try {
      const res = await api.get("/batteries/");
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to fetch user batteries" };
    }
  },

  async createBattery(projectId, payload) {
    try {
      const res = await api.post("/batteries/", {
        project: projectId,
        status: "Draft",              // default
        questions: [],                // MVP
        ...payload,
      });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to create battery" };
    }
  },

  async updateBattery(batteryId, payload) {
    try {
      const res = await api.patch(`/batteries/${batteryId}/`, payload);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to update battery" };
    }
  },

  async deleteBattery(batteryId) {
    try {
      const res = await api.delete(`/batteries/${batteryId}/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to delete battery" };
    }
  },

  async markBatteryReady(batteryId) {
    try {
      // ✅ opción A: si hiciste el action mark_ready en backend
      const res = await api.post(`/batteries/${batteryId}/mark_ready/`);
      return res.data;

      // ✅ opción B (si NO hiciste action): usa updateBattery:
      // return await this.updateBattery(batteryId, { status: "Ready" });
    } catch (err) {
      throw err?.response?.data || { error: "Failed to mark battery as ready" };
    }
  },

  async markBatteryDraft(batteryId) {
    try {
      // ✅ opción A: si hiciste el action mark_draft en backend
      const res = await api.post(`/batteries/${batteryId}/mark_draft/`);
      return res.data;

      // ✅ opción B (si NO hiciste action): usa updateBattery:
      // return await this.updateBattery(batteryId, { status: "Draft" });
    } catch (err) {
      throw err?.response?.data || { error: "Failed to mark battery as draft" };
    }
  },

  async startGenerateBattery(payload) {
    try {
      const res = await api.post("/batteries/start-generate/", payload);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to start battery generation" };
    }
  },

  async saveQuestionsFromQa(batteryId) {
    try {
      const res = await api.post(`/batteries/${batteryId}/save-questions-from-qa/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to save questions from QA" };
    }
  },



  async getTopics() {
    const res = await api.get("/topics/");
    return res.data;
  },

  // -------- BATTERY ATTEMPTS --------
  async startBatteryAttempt(batteryId) {
    try {
      const res = await api.post(`/batteries/${batteryId}/start_attempt/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to start attempt" };
    }
  },

  async submitBatteryAnswers(batteryId, payload) {
    try {
      const res = await api.post(`/batteries/${batteryId}/submit_answers/`, payload);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to submit answers" };
    }
  },

  async finishBatteryAttempt(batteryId, payload) {
    try {
      const res = await api.post(`/batteries/${batteryId}/finish_attempt/`, payload);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to finish attempt" };
    }
  },

  // -------- SECTIONS (GLOBAL) --------
  async getAllSections() {
    // Ajusta el endpoint según tu backend. Por defecto asumimos /sections/
    const res = await api.get("/sections/");
    return res.data;
  },

  async deleteSection(sectionId) {
    const res = await api.delete(`/sections/${sectionId}/`);
    return res.data;
  },




  // -------- GENERIC CRUD (GLOBAL) --------
  async getList(resource, params = {}) {
    const res = await api.get(`/${resource}/`, { params });
    return res.data;
  },

  async createItem(resource, payload) {
    const res = await api.post(`/${resource}/`, payload);
    return res.data;
  },

  async updateItem(resource, id, payload) {
    const res = await api.patch(`/${resource}/${id}/`, payload);
    return res.data;
  },

  async deleteItem(resource, id) {
    const res = await api.delete(`/${resource}/${id}/`);
    return res.data;
  },

  // -------- DECKS --------
  async getProjectDecks(projectId) {
    const res = await api.get("/decks/", {
      params: { project: projectId },
    });
    return res.data;
  },

  async getUserDecks() {
    const res = await api.get("/decks/");
    return res.data;
  },

  async createDeck(projectId, payload) {
    const res = await api.post("/decks/", {
      project: projectId,
      ...payload,
    });
    return res.data;
  },

  async createDeckWithCards(payload) {
    const res = await api.post("/decks/create-with-cards/", payload);
    return res.data;
  },

  async createDeckManual(payload) {
    const res = await api.post("/decks/create-with-flashcards/", payload);

    return res.data;
  },

  async getDeckFlashcards(deckId, jobId = null) {
    const params = { deck: deckId };
    if (jobId) params.job_id = jobId;
    const res = await api.get("/flashcards/", {
      params,
    });
    return res.data;
  },



  async syncFlashcardsFromJob(deckId, jobId) {
    try {
      // Backend expects query params: /flashcards/sync-from-job/?deck=...&job_id=...
      const res = await api.post(`/flashcards/sync-from-job/?deck=${deckId}&job_id=${jobId}`, {});
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to sync flashcards from job" };
    }
  },

  async updateDeck(deckId, payload) {
    const res = await api.patch(`/decks/${deckId}/`, payload);
    return res.data;
  },

  async deleteDeck(deckId) {
    const res = await api.delete(`/decks/${deckId}/`);
    return res.data;
  },

  async wsPullCard({ deckId, jobId, lastSeq = 0 }) {
    try {
      const res = await api.post(`${BASE_FLASHCARDS}/ws-pull-card/`, {
        deck_id: deckId,
        job_id: jobId,
        last_seq: lastSeq,
      });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to pull card" };
    }
  },

  async wsPushFeedback({ deckId, jobId, seq, cardId, rating, timeToAnswerMs = 500 }) {
    try {
      const res = await api.post(`${BASE_FLASHCARDS}/ws-push-feedback/`, {
        deck_id: deckId,
        job_id: jobId,
        seq,
        card_id: cardId,
        rating,
        time_to_answer_ms: timeToAnswerMs,
      });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to push feedback" };
    }
  },

  async shuffleDeckCards(deckId) {
    try {
      const res = await api.post(`${BASE_FLASHCARDS}/shuffle-deck-cards/`, {
        deck_id: deckId,
      });
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to shuffle deck" };
    }
  },

  async askProject(payload) {
    try {
      const res = await api.post(`${BASE}ask/`, payload);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Failed to get AI response" };
    }
  },
};

export default projectService;
