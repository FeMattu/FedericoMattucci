export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// Interfacce per i progetti e le traduzioni
export interface ProjectData {
  id?: string;
  slug: string;
  published: boolean;
  featuredImage?: string;
  order: number;
  tags: string[];
  translations: TranslationData[];
  images?: ImageData[];
}

export interface TranslationData {
  id?: string;
  projectId?: string;
  language: string;
  key: string;
  value: string;
}

export interface ImageData {
  id?: string;
  filename: string;
  key: string;
  projectId?: string;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
}

// Tipi per le risposte API specifiche
export type ProjectsResponse = ApiResponse<ProjectData[]>;
export type ProjectResponse = ApiResponse<ProjectData>;
export type ImageResponse = ApiResponse<ImageData>;
export type ImagesResponse = ApiResponse<ImageData[]>;
