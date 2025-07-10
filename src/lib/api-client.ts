import { ApiResponse, ProjectData, ImageData, TranslationData } from '@/lib/types';

/**
 * Client API per le comunicazioni con il backend
 * Gestisce tutte le richieste API in modo centralizzato
 */
export class ApiClient {
  /**
   * Helper generico per effettuare chiamate API
   */
  private static async fetchApi<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api/admin/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        // Gestisce gli errori HTTP
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || `Error: ${response.status}`,
        };
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // === API Progetti ===
  static getProjects() {
    return this.fetchApi<ProjectData[]>('projects');
  }

  static getProject(id: string) {
    return this.fetchApi<ProjectData>(`projects/${id}`);
  }

  static createProject(project: ProjectData) {
    return this.fetchApi<ProjectData>('projects', 'POST', project);
  }

  static updateProject(id: string, project: ProjectData) {
    return this.fetchApi<ProjectData>(`projects/${id}`, 'PUT', project);
  }

  static deleteProject(id: string) {
    return this.fetchApi<void>(`projects/${id}`, 'DELETE');
  }

  // === API Immagini ===
  static getImages() {
    return this.fetchApi<ImageData[]>('images');
  }

  static getProjectImages(projectId: string) {
    return this.fetchApi<ImageData[]>(`images/project/${projectId}`);
  }

  static updateImage(id: string, image: Partial<ImageData>) {
    return this.fetchApi<ImageData>(`images/${id}`, 'PUT', image);
  }

  static deleteImage(id: string) {
    return this.fetchApi<void>(`images/${id}`, 'DELETE');
  }

  /**
   * Ottiene un URL firmato per l'upload diretto su S3
   */
  static getUploadUrl(filename: string, contentType: string) {
    return this.fetchApi<{ uploadUrl: string; key: string }>(
      'upload', 
      'POST', 
      { filename, contentType }
    );
  }

  /**
   * Finalizza un upload registrando i metadata nel DB
   */
  static finalizeUpload(imageData: Partial<ImageData>) {
    return this.fetchApi<ImageData>('images', 'POST', imageData);
  }

  // === API Traduzioni ===
  static getTranslations(projectId: string, language: string) {
    return this.fetchApi<TranslationData[]>(`translations/${projectId}/${language}`);
  }

  static updateTranslation(id: string, translation: Partial<TranslationData>) {
    return this.fetchApi<TranslationData>(`translations/${id}`, 'PUT', translation);
  }
}
