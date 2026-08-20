export const teacher = {
  name: '[NOME DA PROFESSORA]',
  role: 'Professora Particular de Inglês',
  location: 'São Paulo, Brazil',
  yearsInNewYork: 15,
  specialties: ['Pronúncia', 'Fluência', 'Conversação', 'Confiança'] as const,
  photo: null as string | null,
  photoAlt: 'Espaço reservado para a foto profissional da professora',
  instagram: '#',
  whatsapp: '#',
  email: 'hello@weareenglish.com',
  bio: [
    'O inglês faz parte da minha vida há mais de 15 anos.',
    'Depois de viver em New York, vivenciar o inglês em situações reais e trabalhar com alunos de diferentes trajetórias, minha abordagem ficou clara:',
    'Inglês não deve ser sobre decorar regras.',
    'Deve ser sobre se comunicar, ser compreendida e se sentir confiante na própria voz.',
  ],
} as const

export type Teacher = typeof teacher
