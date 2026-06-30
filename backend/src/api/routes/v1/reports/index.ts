import { Router } from 'express'
import { authMiddleware } from '@/api/middleware/auth-middleware'
import { UserRole } from '@/domain'
import { container } from '@/infra/container/container'

const router = Router()

router.get('/frequency', authMiddleware([UserRole.ADMIN]), async (req, res, next) => {
  try {
    const classId = req.query.classId as string | undefined
    const format = req.query.format as string | undefined

    const usecase = container.GetFrequencyReportUsecase
    const data = await usecase.execute({ classId, mask: true })

    if (format === 'csv') {
      let csvContent = '\uFEFF' // UTF-8 BOM
      csvContent += 'Nome do Aluno,E-mail,Código de Matrícula,Turma,Total de Aulas,Presenças,Faltas,Justificativas,Frequência (%)\n'

      for (const entry of data) {
        csvContent += `"${entry.studentName}","${entry.studentEmail}","${entry.codigoMatricula}","${entry.className}",${entry.totalClasses},${entry.presenceCount},${entry.absenceCount},${entry.justifiedCount},${entry.attendanceRate}\n`
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio_frequencia.csv')
      return res.status(200).send(csvContent)
    }

    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/funnel', authMiddleware([UserRole.ADMIN]), async (req, res, next) => {
  try {
    const classId = req.query.classId as string | undefined

    const usecase = container.GetFunnelReportUsecase
    const data = await usecase.execute({ classId })

    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
})

export default router
