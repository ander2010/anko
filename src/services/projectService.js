import api from "./api";

const BASE = "/projects/";

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


  async getProjects() {
    try {
      const res = await api.get(`${BASE}`);
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

async deleteDocument(documentId) {
  try {
    await api.delete(`/documents/${documentId}/`);
  } catch (err) {
    throw err?.response?.data || { error: "Failed to delete document" };
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



};

export default projectService;
