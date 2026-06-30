import React, { useState, useEffect } from 'react';
import { BarChart2, Download, Filter, TrendingUp, Users, UserX, CheckCircle, PieChart } from 'lucide-react';
import { classesApi, type ClassDto } from '@/shared/api/classes';
import { reportsApi, type FrequencyReportEntryDto, type FunnelReportDto } from '@/shared/api/reports';

export const ReportsPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [frequencyData, setFrequencyData] = useState<FrequencyReportEntryDto[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelReportDto | null>(null);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await classesApi.getAll();
        setClasses(data);
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const classParam = selectedClassId || undefined;
        const [freq, fun] = await Promise.all([
          reportsApi.getFrequency(classParam),
          reportsApi.getFunnel(classParam),
        ]);
        setFrequencyData(freq);
        setFunnelData(fun);
      } catch (err) {
        console.error('Failed to load report data', err);
        setError('Erro ao carregar os dados dos relatórios.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedClassId]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.downloadCsv(selectedClassId || undefined);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_frequencia_${selectedClassId || 'geral'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV', err);
      setError('Erro ao baixar o arquivo CSV.');
    } finally {
      setExporting(false);
    }
  };

  const evasionRate = funnelData && funnelData.entered > 0 
    ? Math.round((funnelData.evaded / funnelData.entered) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" />
            Relatórios e Métricas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitore o engajamento, frequência escolar e taxas de evasão de beneficiários.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={exporting || frequencyData.length === 0}
          className="flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 transition-colors px-4 py-2.5 rounded-xl font-medium text-sm shadow-md disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exportando...' : 'Exportar Frequência (CSV)'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Filter bar */}
      <div className="p-6 bg-card border border-border/40 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-muted/30 border border-border rounded-xl px-3 py-2 w-full text-sm text-foreground placeholder-muted-foreground outline-none"
          >
            <option value="">Todas as Turmas (Geral)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomeCurso} ({c.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-card border border-border/40 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="text-sm text-muted-foreground">Processando relatórios e métricas de impacto...</span>
        </div>
      ) : (
        <>
          {/* Funnel Metrics */}
          {funnelData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-card border border-border/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Total de Inscritos</span>
                  <span className="text-2xl font-bold text-foreground block mt-0.5">{funnelData.entered}</span>
                </div>
              </div>

              <div className="bg-card border border-border/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Alunos Ativos</span>
                  <span className="text-2xl font-bold text-foreground block mt-0.5">{funnelData.active}</span>
                </div>
              </div>

              <div className="bg-card border border-border/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Casos de Evasão</span>
                  <span className="text-2xl font-bold text-foreground block mt-0.5">{funnelData.evaded}</span>
                </div>
              </div>

              <div className="bg-card border border-border/40 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">Taxa de Evasão</span>
                  <span className="text-2xl font-bold text-foreground block mt-0.5">{evasionRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Evasion Rate progress card */}
          {funnelData && funnelData.entered > 0 && (
            <div className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <PieChart className="w-4.5 h-4.5 text-primary" />
                    Funil de Permanência Escolar
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Comparativo entre alunos matriculados que persistiram versus os casos de evasão escolar.
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${evasionRate > 20 ? 'bg-rose-500/10 text-rose-700' : 'bg-emerald-500/10 text-emerald-700'}`}>
                  {evasionRate > 20 ? 'Atenção: Evasão Alta' : 'Evasão Controlada'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${100 - evasionRate}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Permanência: ${100 - evasionRate}%`}
                  />
                  <div
                    style={{ width: `${evasionRate}%` }}
                    className="bg-rose-500 h-full transition-all"
                    title={`Evasão: ${evasionRate}%`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                    Ativos / Concluídos ({100 - evasionRate}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" />
                    Evasão ({evasionRate}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Frequency Report table */}
          <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h4 className="font-bold text-sm text-foreground">Relatório de Frequência de Chamadas</h4>
              <span className="text-xs text-muted-foreground">
                Total de alunos: <span className="font-bold text-foreground">{frequencyData.length}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/30 font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="p-4">Aluno</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Matrícula</th>
                    <th className="p-4">Turma</th>
                    <th className="p-4 text-center">Aulas</th>
                    <th className="p-4 text-center">Presenças</th>
                    <th className="p-4 text-center">Faltas</th>
                    <th className="p-4 text-center">Justificativas</th>
                    <th className="p-4 text-right">Frequência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {frequencyData.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-muted/5 transition-colors">
                      <td className="p-4 font-semibold text-foreground">{entry.studentName}</td>
                      <td className="p-4 text-muted-foreground">{entry.studentEmail}</td>
                      <td className="p-4 font-mono font-medium">{entry.codigoMatricula}</td>
                      <td className="p-4 text-muted-foreground">{entry.className}</td>
                      <td className="p-4 text-center font-semibold">{entry.totalClasses}</td>
                      <td className="p-4 text-center text-emerald-600 font-semibold">{entry.presenceCount}</td>
                      <td className="p-4 text-center text-rose-600 font-semibold">{entry.absenceCount}</td>
                      <td className="p-4 text-center text-amber-600 font-semibold">{entry.justifiedCount}</td>
                      <td className="p-4 text-right font-extrabold">
                        <span className={entry.attendanceRate >= 75 ? 'text-emerald-500' : 'text-rose-500'}>
                          {entry.attendanceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {frequencyData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-muted-foreground">
                        Nenhum dado de frequência encontrado para esta seleção.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
