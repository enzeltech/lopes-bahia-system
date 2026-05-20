import type { CapacitacaoTema } from '@/types/capacitacao'

export const capacitacaoTemas: CapacitacaoTema[] = [
  {
    id: 'tecnicas-de-vendas',
    nome: 'Técnicas de Vendas',
    descricao: 'Fundamentos e práticas avançadas para conduzir negociações e fechar negócios com consistência.',
    videos: [
      {
        id: 'venda-rapport',
        temaId: 'tecnicas-de-vendas',
        titulo: 'Rapport: criando conexão com o cliente',
        descricao: 'Como gerar confiança nos primeiros minutos de uma negociação.',
        youtubeId: 'dQw4w9WgXcQ',
        duracaoMin: 12,
      },
      {
        id: 'venda-objecoes',
        temaId: 'tecnicas-de-vendas',
        titulo: 'Quebrando objeções comuns',
        descricao: 'As 5 objeções mais frequentes em imóveis e como contorná-las.',
        youtubeId: '9bZkp7q19f0',
        duracaoMin: 18,
      },
      {
        id: 'venda-fechamento',
        temaId: 'tecnicas-de-vendas',
        titulo: 'O fechamento natural',
        descricao: 'Técnicas para conduzir o cliente à decisão sem pressão.',
        youtubeId: 'kJQP7kiw5Fk',
        duracaoMin: 14,
      },
    ],
  },
  {
    id: 'atendimento',
    nome: 'Atendimento ao Cliente',
    descricao: 'Construindo relacionamento de longo prazo com clientes em diferentes momentos da jornada.',
    videos: [
      {
        id: 'atendimento-jornada',
        temaId: 'atendimento',
        titulo: 'Mapeando a jornada do cliente',
        descricao: 'Pontos de contato e expectativas em cada etapa.',
        youtubeId: 'JGwWNGJdvx8',
        duracaoMin: 10,
      },
      {
        id: 'atendimento-pos-venda',
        temaId: 'atendimento',
        titulo: 'Pós-venda que gera indicações',
        descricao: 'Como transformar clientes em promotores da marca.',
        youtubeId: 'RgKAFK5djSk',
        duracaoMin: 15,
      },
    ],
  },
  {
    id: 'mercado-imobiliario',
    nome: 'Mercado Imobiliário',
    descricao: 'Panorama do setor, indicadores e tendências que afetam o dia a dia do corretor.',
    videos: [
      {
        id: 'mercado-indicadores',
        temaId: 'mercado-imobiliario',
        titulo: 'Lendo indicadores econômicos',
        descricao: 'Selic, IPCA, INCC e como impactam o financiamento.',
        youtubeId: 'OPf0YbXqDm0',
        duracaoMin: 16,
      },
      {
        id: 'mercado-tendencias',
        temaId: 'mercado-imobiliario',
        titulo: 'Tendências para os próximos anos',
        descricao: 'Mudanças no perfil do comprador e novos formatos.',
        youtubeId: 'fJ9rUzIMcZQ',
        duracaoMin: 20,
      },
      {
        id: 'mercado-financiamento',
        temaId: 'mercado-imobiliario',
        titulo: 'Modalidades de financiamento',
        descricao: 'SBPE, SFH, Pró-cotista e Casa Verde e Amarela.',
        youtubeId: 'hT_nvWreIhg',
        duracaoMin: 22,
      },
    ],
  },
  {
    id: 'lideranca',
    nome: 'Liderança e Gestão',
    descricao: 'Para coordenadores e gerentes que querem desenvolver equipes de alta performance.',
    videos: [
      {
        id: 'lideranca-feedback',
        temaId: 'lideranca',
        titulo: 'Cultura de feedback',
        descricao: 'Como dar e receber feedback com efetividade.',
        youtubeId: 'CevxZvSJLk8',
        duracaoMin: 14,
      },
      {
        id: 'lideranca-metas',
        temaId: 'lideranca',
        titulo: 'Definindo metas claras',
        descricao: 'Do macro mensal ao indicador diário individual.',
        youtubeId: 'YqeW9_5kURI',
        duracaoMin: 12,
      },
    ],
  },
]
