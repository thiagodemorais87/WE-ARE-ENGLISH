export type ActivityStatus = 'CONCLUÍDO' | 'EM ANDAMENTO' | 'NOVO'

export const activities = [
  {
    id: 'pronunciation',
    title: 'PRÁTICA DE PRONÚNCIA',
    duration: '10 min',
    difficulty: 'Intermediário',
    progress: 100,
    status: 'CONCLUÍDO' as ActivityStatus,
    icon: 'P',
  },
  {
    id: 'listening',
    title: 'DESAFIO DE COMPREENSÃO',
    duration: '15 min',
    difficulty: 'Intermediário',
    progress: 45,
    status: 'EM ANDAMENTO' as ActivityStatus,
    icon: 'L',
  },
  {
    id: 'vocabulary',
    title: 'BOOST DE VOCABULÁRIO',
    duration: '10 min',
    difficulty: 'Iniciante',
    progress: 0,
    status: 'NOVO' as ActivityStatus,
    icon: 'V',
  },
  {
    id: 'speaking',
    title: 'PRÁTICA DE CONVERSAÇÃO',
    duration: '20 min',
    difficulty: 'Avançado',
    progress: 0,
    status: 'NOVO' as ActivityStatus,
    icon: 'S',
  },
] as const
