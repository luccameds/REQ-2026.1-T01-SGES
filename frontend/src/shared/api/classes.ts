import { apiClient } from './client';
import type { StudentDto } from './students';

export interface ClassDto {
  id: string;
  name: string;
  semester: string;
  schedule: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'FT';

export interface AttendanceInput {
  studentId: string;
  status: AttendanceStatus;
  justification?: string;
}

export const classesApi = {
  async getAll(): Promise<ClassDto[]> {
    const { data } = await apiClient.get<ClassDto[]>('/classes');
    return data;
  },

  async getStudents(classId: string): Promise<StudentDto[]> {
    const { data } = await apiClient.get<StudentDto[]>(`/classes/${classId}/students`);
    return data;
  },

  async saveAttendance(classId: string, date: string, attendances: AttendanceInput[]): Promise<void> {
    await apiClient.post(`/classes/${classId}/attendances`, {
      date,
      attendances,
    });
  },
};
