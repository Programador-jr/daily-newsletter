/**
 * Atlas político — modelo de 12 eixos.
 *
 * Cada eixo é uma escala independente de 0 a 100. O valor representa a
 * afinidade com o primeiro polo (A): 100 fica no polo A, 0 no polo B e 50
 * no centro. Os vetores dos catálogos são leituras editoriais aproximadas,
 * não resultados de questionário.
 *
 * O modelo de doze eixos é inspirado no teste 12 Axes
 * (https://12axes.vercel.app/). Os textos, vetores e perfis deste site são
 * próprios.
 */
(function () {
  const eixos = [
    {
      id: "estrutura",
      rotulo: "Estrutura",
      a: "Federal",
      b: "Unitário",
      pergunta: "Onde ficam as decisões: nas unidades federadas ou no governo central?",
      aDesc: "Distribui competências entre União e unidades locais, com espaço para autonomia regional.",
      bDesc: "Concentra competências no governo central e trata a uniformidade como valor político."
    },
    {
      id: "representacao",
      rotulo: "Representação",
      a: "Democracia",
      b: "Autocracia",
      pergunta: "Como o poder político se legitima e se renova?",
      aDesc: "Eleições competitivas, pluralismo partidário, oposição livre e alternância no poder.",
      bDesc: "Poder concentrado, competição política restrita ou ausente e permanência no governo."
    },
    {
      id: "poder",
      rotulo: "Poder",
      a: "Segurança",
      b: "Liberdade",
      pergunta: "Como equilibrar ordem pública e liberdades individuais?",
      aDesc: "Prioriza capacidade do Estado de impor regras, manter a ordem e proteger a coletividade.",
      bDesc: "Prioriza autonomia individual, direitos civis e limites ao poder coercitivo."
    },
    {
      id: "imigracao",
      rotulo: "Imigração",
      a: "Multiculturalismo",
      b: "Assimilação",
      pergunta: "Como uma sociedade deve lidar com a diversidade de origens?",
      aDesc: "Reconhece identidades plurais e acomoda diferenças culturais na vida pública.",
      bDesc: "Espera integração à cultura majoritária e valoriza coesão e identidade comum."
    },
    {
      id: "diplomacia",
      rotulo: "Diplomacia",
      a: "Militarista",
      b: "Pacifista",
      pergunta: "Qual deve ser o papel da força na política externa?",
      aDesc: "Aceita o uso ou a ameaça da força e valoriza capacidade militar como instrumento de política.",
      bDesc: "Prioriza negociação, desarmamento e soluções multilaterais para conflitos."
    },
    {
      id: "intervencao",
      rotulo: "Intervenção",
      a: "Não intervencionista",
      b: "Nacionalista",
      pergunta: "Como o país deve se posicionar diante de compromissos e conflitos externos?",
      aDesc: "Prefere abstenção, regras comuns e instituições internacionais que limitem decisões unilaterais.",
      bDesc: "Prioriza soberania, interesse nacional e autonomia decisória diante de terceiros."
    },
    {
      id: "economia",
      rotulo: "Economia",
      a: "Público",
      b: "Privado",
      pergunta: "Quem deve protagonizar a atividade econômica?",
      aDesc: "Amplia empresas, serviços e investimentos sob controle ou financiamento público.",
      bDesc: "Amplia o espaço da iniciativa privada, da propriedade e da gestão empresarial."
    },
    {
      id: "controle",
      rotulo: "Controle",
      a: "Planejamento",
      b: "Livre mercado",
      pergunta: "Como coordenar produção, preços e investimentos?",
      aDesc: "Usa planejamento, metas e direção estatal para coordenar a economia.",
      bDesc: "Confia em preços, concorrência e decisões descentralizadas para coordenar a economia."
    },
    {
      id: "comercio",
      rotulo: "Comércio",
      a: "Protecionismo",
      b: "Globalismo",
      pergunta: "Como o país deve se relacionar com o comércio internacional?",
      aDesc: "Protege a produção doméstica com barreiras, tarifas e exigências de conteúdo local.",
      bDesc: "Reduz barreiras e integra a economia a cadeias produtivas e mercados globais."
    },
    {
      id: "religiao",
      rotulo: "Religião",
      a: "Irreligioso",
      b: "Religioso",
      pergunta: "Qual deve ser o peso da religião na vida coletiva?",
      aDesc: "Defende laicidade forte e mantém crenças religiosas fora das decisões públicas.",
      bDesc: "Reconhece a religião como parte da identidade coletiva e da ordem pública."
    },
    {
      id: "moral",
      rotulo: "Moral",
      a: "Progressista",
      b: "Tradicionalista",
      pergunta: "Como lidar com costumes, família e mudanças culturais?",
      aDesc: "Apoia reformas de costumes, ampliação de direitos e revisão de normas herdadas.",
      bDesc: "Valoriza continuidade de costumes, instituições e normas tradicionais."
    },
    {
      id: "tecnologia",
      rotulo: "Tecnologia",
      a: "Tecnologia",
      b: "Biologia",
      pergunta: "Qual deve ser o lugar da técnica diante dos limites naturais?",
      aDesc: "Confia em inovação, indústria e intervenção técnica para resolver problemas coletivos.",
      bDesc: "Prioriza limites biológicos, equilíbrio ecológico e cautela diante de mudanças artificiais."
    }
  ];

  const familias = [
    {
      id: "esquerda-radical",
      rotulo: "Esquerda radical",
      cor: "#8E2F2F",
      descricao: "Tradições que tratam a propriedade e o poder econômico como raízes da desigualdade e defendem transformações profundas."
    },
    {
      id: "esquerda",
      rotulo: "Esquerda",
      cor: "#A65330",
      descricao: "Correntes que combinam críticas ao mercado com reformas sociais, proteção coletiva e ação estatal."
    },
    {
      id: "centro",
      rotulo: "Centro",
      cor: "#586B70",
      descricao: "Posições que combinam mercado e proteção social, com ênfase em instituições, moderação e acordos."
    },
    {
      id: "direita",
      rotulo: "Direita",
      cor: "#2F4E78",
      descricao: "Tradições que valorizam propriedade, ordem, continuidade institucional e limites à ação estatal."
    },
    {
      id: "extrema-direita",
      rotulo: "Extrema-direita",
      cor: "#5A3B28",
      descricao: "Correntes autoritárias, ultranacionalistas ou racialistas que rejeitam o pluralismo democrático."
    },
    {
      id: "libertario",
      rotulo: "Libertário",
      cor: "#8A6A1A",
      descricao: "Família que coloca a liberdade individual e a propriedade no centro e desconfia do poder estatal."
    },
    {
      id: "anarquista",
      rotulo: "Anarquista",
      cor: "#5B4B84",
      descricao: "Tradições que criticam o Estado e outras hierarquias coercitivas e propõem organização voluntária."
    },
    {
      id: "terceira-posicao",
      rotulo: "Terceira posição",
      cor: "#6B5137",
      descricao: "Projetos que rejeitam liberalismo e socialismo e combinam corporativismo, nação e autoridade."
    }
  ];

  const areas = {
    personalidades: [
      { id: "filosofo", rotulo: "Filósofos" },
      { id: "economista", rotulo: "Economistas" },
      { id: "revolucionario", rotulo: "Revolucionários" },
      { id: "estadista", rotulo: "Estadistas" },
      { id: "autoritario", rotulo: "Autoritários" },
      { id: "intelectual", rotulo: "Intelectuais" }
    ],
    livros: [
      { id: "politica", rotulo: "Política" },
      { id: "teoria-politica", rotulo: "Teoria política" },
      { id: "filosofia", rotulo: "Filosofia" },
      { id: "economia", rotulo: "Economia" },
      { id: "vida-intelectual", rotulo: "Vida intelectual" },
      { id: "ativismo", rotulo: "Ativismo" },
      { id: "religiao", rotulo: "Religião" },
      { id: "empresariado", rotulo: "Empresariado" }
    ]
  };

  globalThis.AtlasData = globalThis.AtlasData || {};
  globalThis.AtlasData.eixos = eixos;
  globalThis.AtlasData.familias = familias;
  globalThis.AtlasData.areas = areas;
})();
