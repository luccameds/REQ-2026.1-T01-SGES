import { apiClient } from './client';

export interface StudentDto {
  id: string;
  codigo_matricula: string;
  name: string;
  email: string;
  profissao: string;
  createdAt: string;
}

export interface CreateStudentInput {
  name: string;
  email: string;
  profissao: string;
}

export interface StudentHistoryDto {
  student: {
    id: string;
    name: string;
    email: string;
    codigoMatricula: string;
    profissao?: string | null;
  };
  enrollments: Array<{
    classId: string;
    className: string;
    status: string;
    semester: string;
    createdAt: string;
  }>;
  attendanceStats: Array<{
    classId: string;
    className: string;
    totalClasses: number;
    presenceCount: number;
    absenceCount: number;
    justifiedCount: number;
    attendanceRate: number;
  }>;
  attendanceTimeline: Array<{
    date: string;
    className: string;
    status: string;
    observacao: string | null;
    justificativaDetalhes: string | null;
  }>;
  evasionAlerts: Array<{
    classId: string;
    className: string;
    absencesCount: number;
    evaded: boolean;
  }>;
}

export const studentsApi = {
  async getAll(): Promise<StudentDto[]> {
    const { data } = await apiClient.get<StudentDto[]>('/students');
    return data;
  },

  async create(input: CreateStudentInput): Promise<StudentDto> {
    const { data } = await apiClient.post<StudentDto>('/students', input);
    return data;
  },

  async update(id: string, input: Partial<CreateStudentInput>): Promise<StudentDto> {
    const { data } = await apiClient.put<StudentDto>(`/students/${id}`, input);
    return data;
  },

  async getHistory(studentId: string): Promise<StudentHistoryDto> {
    const { data } = await apiClient.get<StudentHistoryDto>(`/students/${studentId}/history`);
    return data;
  },
};
