import React from 'react'
import { BookMarked } from 'lucide-react'
import { SectionPlaceholder } from '../components/SectionPlaceholder'

export default function AdminGuestbookPage() {
  return (
    <SectionPlaceholder
      title="Guestbook & Mensagens"
      subtitle="Moderação de depoimentos públicos e leitura de mensagens de contato"
      icon={BookMarked}
      phaseTag="Fase 8"
      phaseTitle="Guestbook & Mensagens — Moderação e contatos"
      description="Esta seção será implementada na Fase 8 do roadmap. Permitirá moderar os comentários deixados pelos visitantes no Guestbook (aprovar, ocultar ou remover) e visualizar as mensagens enviadas através do formulário de contato."
      deliverables={[
        'Painel de moderação de comentários com aprovação em 1 clique',
        'Filtro por status (pendente, aprovado, rejeitado)',
        'Caixa de entrada das mensagens recebidas por contato',
        'Exportação de registros e métricas de engajamento',
      ]}
    />
  )
}
