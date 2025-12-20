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
};

export default projectService;
