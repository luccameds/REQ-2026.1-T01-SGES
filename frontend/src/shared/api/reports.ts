import { apiClient } from './client';

export interface FrequencyReportEntryDto {
  studentId: string;
  studentName: string;
  studentEmail: string;
  codigoMatricula: string;
  classId: string;
  className: string;
  totalClasses: number;
  presenceCount: number;
  absenceCount: number;
  justifiedCount: number;
  attendanceRate: number;
}

export interface FunnelReportDto {
  entered: number;
  active: number;
  evaded: number;
  completed: number;
}

export const reportsApi = {
  async getFrequency(classId?: string): Promise<FrequencyReportEntryDto[]> {
    const { data } = await apiClient.get<FrequencyReportEntryDto[]>('/reports/frequency', {
      params: { classId },
    });
    return data;
  },

  async getFunnel(classId?: string): Promise<FunnelReportDto> {
    const { data } = await apiClient.get<FunnelReportDto>('/reports/funnel', {
      params: { classId },
    });
    return data;
  },

  getDownloadUrl(classId?: string): string {
    const params = new URLSearchParams();
    params.append('format', 'csv');
    if (classId) {
      params.append('classId', classId);
    }
    // Include auth token if needed, but standard browser download might need token in query param or we can fetch it via blob!
    // Fetching via blob is actually better because we can pass headers (authorization)!
    // Let's implement CSV download via blob in the frontend, which is way more robust and keeps auth headers.
    return '';
  },

  async downloadCsv(classId?: string): Promise<Blob> {
    const { data } = await apiClient.get('/reports/frequency', {
      params: { classId, format: 'csv' },
      responseType: 'blob',
    });
    return data;
  },
};
