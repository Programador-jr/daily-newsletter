/**
 * Atlas político — catálogo de países e regimes históricos.
 *
 * Vetores: doze valores de 0 a 100, na ordem de atlas-axes.js, com 100 no
 * primeiro polo. São leituras editoriais aproximadas do funcionamento do
 * Estado em determinado período, não uma medida objetiva de liberdade,
 * desenvolvimento ou qualidade institucional.
 *
 * Países atuais usam o quadro constitucional e as políticas predominantes do
 * século XXI. Regimes históricos descrevem o período indicado, não o país em
 * toda a sua história.
 */
(function () {
  const paises = [
    {
      id: "brasil",
      nome: "Brasil",
      bandeira: "🇧🇷",
      sigla: "BRA",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República federal presidencialista",
      historico: false,
      resumo:
        "Federação de 26 estados e do Distrito Federal, com presidencialismo, eleições competitivas e um Supremo Tribunal com papel político relevante. A economia combina mercados abertos com bancos públicos, empresas estatais e políticas sociais de grande escala.",
      vetor: [80, 72, 58, 72, 12, 72, 66, 55, 62, 58, 62, 62],
      caracteristicas: [
        "Constituição de 1988, com amplos direitos sociais e federativos.",
        "Presidencialismo de coalizão e Congresso fragmentado.",
        "Economia mista com bancos e empresas estatais estratégicas.",
        "Política externa de vocação multilateral e integração regional."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "trabalhismo", "conservadorismo", "desenvolvimentismo"],
      partidos: ["pt", "psdb", "pl", "psol", "pdt", "mdb", "pp", "republicanos", "novo", "pcdo-b"]
    },
    {
      id: "estados-unidos",
      nome: "Estados Unidos",
      bandeira: "🇺🇸",
      sigla: "EUA",
      regiao: "América do Norte",
      periodo: "Século XXI",
      categoria: "República federal presidencialista",
      historico: false,
      resumo:
        "Federação de 50 estados com presidencialismo forte, bipartidarismo e um Judiciário de grande peso constitucional. O país combina uma economia de mercado altamente dinâmica com gasto militar elevado e forte projeção internacional.",
      vetor: [95, 78, 76, 35, 75, 45, 24, 14, 28, 38, 38, 94],
      caracteristicas: [
        "Federalismo robusto e competências estaduais amplas.",
        "Bipartidarismo com polarização crescente.",
        "Economia de mercado com regulação setorial e gasto público relevante.",
        "Poder militar global e alianças de segurança."
      ],
      ideologias: ["liberalismo-social", "conservadorismo", "liberalismo-classico", "neoliberalismo"],
      partidos: ["partido-democrata-eua", "partido-republicano-eua"]
    },
    {
      id: "canada",
      nome: "Canadá",
      bandeira: "🇨🇦",
      sigla: "CAN",
      regiao: "América do Norte",
      periodo: "Século XXI",
      categoria: "Monarquia constitucional federal",
      historico: false,
      resumo:
        "Federação parlamentarista ligada à Coroa britânica, com províncias fortes e tradição de bem-estar social. O país é marcado por políticas de imigração e multiculturalismo e por um sistema partidário competitivo.",
      vetor: [90, 96, 45, 88, 6, 80, 52, 38, 30, 86, 90, 82],
      caracteristicas: [
        "Federação com províncias dotadas de competências amplas.",
        "Parlamentarismo e monarquia constitucional simbólica.",
        "Saúde pública universal e rede de proteção social.",
        "Política de imigração e multiculturalismo."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "conservadorismo"],
      partidos: []
    },
    {
      id: "mexico",
      nome: "México",
      bandeira: "🇲🇽",
      sigla: "MEX",
      regiao: "América do Norte",
      periodo: "Século XXI",
      categoria: "República federal presidencialista",
      historico: false,
      resumo:
        "Federação presidencialista marcada pela alternância partidária desde 2000 e por forte centralidade da Presidência. A economia é aberta, com grande peso do comércio com os Estados Unidos e setores energéticos historicamente estatais.",
      vetor: [70, 65, 68, 60, 12, 68, 60, 48, 58, 55, 55, 62],
      caracteristicas: [
        "Federalismo com estados e municípios relevantes.",
        "Presidencialismo e partidos de alcance nacional.",
        "Economia aberta e dependência comercial regional.",
        "Debate público intenso sobre segurança e justiça."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "conservadorismo"],
      partidos: []
    },
    {
      id: "argentina",
      nome: "Argentina",
      bandeira: "🇦🇷",
      sigla: "ARG",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República federal presidencialista",
      historico: false,
      resumo:
        "Federação presidencialista com tradição peronista e forte mobilização sindical. A economia convive com inflação crônica, controles estatais e ciclos de liberalização e intervenção.",
      vetor: [70, 72, 65, 70, 10, 68, 62, 48, 60, 60, 65, 60],
      caracteristicas: [
        "Federalismo com províncias politicamente decisivas.",
        "Peronismo como força estruturante do sistema partidário.",
        "Economia com históricos controles de câmbio e preços.",
        "Forte presença de sindicatos e movimentos sociais."
      ],
      ideologias: ["peronismo", "social-democracia", "liberalismo-classico"],
      partidos: ["partido-justicialista"]
    },
    {
      id: "chile",
      nome: "Chile",
      bandeira: "🇨🇱",
      sigla: "CHL",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista unitária, com partidos disciplinados e forte legado da Constituição de 1980. A economia é aberta e orientada à exportação, enquanto a política social e o debate constitucional ganharam centralidade nas últimas décadas.",
      vetor: [60, 88, 65, 65, 8, 78, 45, 28, 32, 72, 62, 72],
      caracteristicas: [
        "Estado unitário com regiões administrativas.",
        "Presidencialismo e sistema partidário competitivo.",
        "Economia aberta, com peso da mineração e das exportações.",
        "Legado institucional da ditadura e processos constituintes."
      ],
      ideologias: ["socialismo-democratico", "neoliberalismo", "conservadorismo"],
      partidos: ["partido-socialista-chile", "partido-comunista-chile", "chile-vamos"]
    },
    {
      id: "uruguai",
      nome: "Uruguai",
      bandeira: "🇺🇾",
      sigla: "URY",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista unitária com tradição de partidos programáticos e políticas sociais universais. O país combina abertura econômica, regulação estatal e uma das democracias mais estáveis da região.",
      vetor: [55, 95, 45, 85, 4, 85, 66, 52, 50, 88, 90, 62],
      caracteristicas: [
        "Estado unitário com forte tradição de partidos históricos.",
        "Eleições competitivas e alternância regular.",
        "Políticas sociais universais e empresas públicas.",
        "Economia pequena, aberta e dependente de exportações."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "conservadorismo"],
      partidos: ["frente-ampla"]
    },
    {
      id: "paraguai",
      nome: "Paraguai",
      bandeira: "🇵🇾",
      sigla: "PRY",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista unitária com longa hegemonia do Partido Colorado e economia agroexportadora. A política combina clientelismo, alternância recente e disputas por terra e infraestrutura.",
      vetor: [55, 68, 75, 50, 20, 55, 55, 45, 62, 35, 25, 52],
      caracteristicas: [
        "Estado unitário com departamentos e municípios.",
        "Partido Colorado como força dominante por décadas.",
        "Economia agroexportadora e informalidade elevada.",
        "Disputas fundiárias e infraestrutura energética."
      ],
      ideologias: ["conservadorismo", "liberalismo-classico"],
      partidos: []
    },
    {
      id: "bolivia",
      nome: "Bolívia",
      bandeira: "🇧🇴",
      sigla: "BOL",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista plurinacional",
      historico: false,
      resumo:
        "Estado plurinacional com presidencialismo e forte presença de movimentos indígenas e camponeses. A Constituição de 2009 reconheceu direitos coletivos e ampliou o papel do Estado na economia.",
      vetor: [60, 68, 72, 75, 8, 60, 72, 62, 62, 55, 62, 48],
      caracteristicas: [
        "Estado plurinacional e reconhecimento de autonomias indígenas.",
        "Presidencialismo com instabilidade política recorrente.",
        "Economia dependente de hidrocarbonetos e mineração.",
        "Forte organização sindical e camponesa."
      ],
      ideologias: ["socialismo-democratico", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "peru",
      nome: "Peru",
      bandeira: "🇵🇪",
      sigla: "PER",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista unitária marcada por fragmentação partidária e crises institucionais frequentes. A economia é aberta e mineradora, com grande informalidade e desigualdade regional.",
      vetor: [60, 68, 70, 60, 12, 65, 58, 48, 58, 55, 45, 55],
      caracteristicas: [
        "Estado unitário com descentralização recente.",
        "Fragmentação partidária e instabilidade ministerial.",
        "Economia mineradora e aberta ao comércio.",
        "Grande informalidade e desigualdade regional."
      ],
      ideologias: ["liberalismo-social", "conservadorismo", "socialismo-democratico"],
      partidos: []
    },
    {
      id: "colombia",
      nome: "Colômbia",
      bandeira: "🇨🇴",
      sigla: "COL",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista unitária com tradição bipartidária e conflito armado prolongado. O acordo de paz de 2016 abriu espaço para novos atores políticos, enquanto segurança e política social seguem no centro do debate.",
      vetor: [60, 75, 78, 55, 30, 60, 52, 38, 48, 45, 32, 58],
      caracteristicas: [
        "Estado unitário com departamentos e municípios.",
        "Conflito armado e processo de paz de 2016.",
        "Economia diversificada, com petróleo e serviços.",
        "Forte debate sobre segurança e justiça transicional."
      ],
      ideologias: ["liberalismo-social", "conservadorismo", "socialismo-democratico"],
      partidos: []
    },
    {
      id: "venezuela",
      nome: "Venezuela",
      bandeira: "🇻🇪",
      sigla: "VEN",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista em disputa",
      historico: false,
      resumo:
        "República presidencialista com forte concentração de poder no Executivo e eleições contestadas. A economia dependente do petróleo passou por colapso e controles estatais, enquanto a oposição denuncia perseguição política.",
      vetor: [65, 25, 85, 65, 45, 25, 88, 90, 82, 65, 45, 45],
      caracteristicas: [
        "Presidencialismo com concentração de poder e reeleição.",
        "Eleições marcadas por restrições e contestação internacional.",
        "Economia petroleira sob controles e sanções.",
        "Crise humanitária e emigração em larga escala."
      ],
      ideologias: ["socialismo-democratico", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "equador",
      nome: "Equador",
      bandeira: "🇪🇨",
      sigla: "ECU",
      regiao: "América do Sul",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista com forte mobilização indígena e ciclos de governos de esquerda e de liberalização. A economia é dependente de petróleo, com dolarização e vulnerabilidade externa.",
      vetor: [60, 72, 70, 70, 10, 65, 62, 52, 58, 55, 58, 52],
      caracteristicas: [
        "Estado unitário com governos locais relevantes.",
        "Movimento indígena com papel político central.",
        "Economia dolarizada e dependente de petróleo.",
        "Alternância entre projetos de esquerda e liberalização."
      ],
      ideologias: ["socialismo-democratico", "liberalismo-classico"],
      partidos: []
    },
    {
      id: "reino-unido",
      nome: "Reino Unido",
      bandeira: "🇬🇧",
      sigla: "GBR",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "Monarquia constitucional parlamentarista",
      historico: false,
      resumo:
        "Monarquia constitucional sem Constituição codificada, com Parlamento soberano e forte tradição de governo majoritário. O país deixou a União Europeia em 2020 e mantém um Estado de bem-estar com serviços públicos universais.",
      vetor: [70, 92, 65, 70, 20, 65, 55, 40, 40, 65, 75, 88],
      caracteristicas: [
        "Parlamentarismo de Westminster e monarquia simbólica.",
        "Constituição não codificada e soberania parlamentar.",
        "Saída da União Europeia em 2020.",
        "Saúde pública universal e forte setor financeiro."
      ],
      ideologias: ["social-democracia", "conservadorismo", "liberalismo-classico"],
      partidos: ["partido-trabalhista-reino-unido", "partido-conservador-reino-unido"]
    },
    {
      id: "franca",
      nome: "França",
      bandeira: "🇫🇷",
      sigla: "FRA",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República semipresidencialista",
      historico: false,
      resumo:
        "República semipresidencialista com Presidência forte, Parlamento e tradição de Estado centralizado. O país combina proteção social ampla, laicidade militante e intensa disputa sobre imigração e identidade.",
      vetor: [65, 93, 65, 75, 15, 70, 62, 48, 42, 85, 80, 90],
      caracteristicas: [
        "Semipresidencialismo e Executivo dual.",
        "Laicidade estatal e centralidade da escola pública.",
        "Proteção social ampla e setor público robusto.",
        "Debate intenso sobre imigração e integração."
      ],
      ideologias: ["liberalismo-social", "socialismo-democratico", "nacionalismo-civico", "conservadorismo"],
      partidos: ["renaissance", "rassemblement-national", "la-france-insoumise"]
    },
    {
      id: "alemanha",
      nome: "Alemanha",
      bandeira: "🇩🇪",
      sigla: "DEU",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República federal parlamentarista",
      historico: false,
      resumo:
        "Federação parlamentarista com federalismo forte, partidos de massa e cultura de consenso. A economia social de mercado combina setor industrial exportador, proteção social e regras fiscais rígidas.",
      vetor: [75, 96, 55, 85, 4, 85, 58, 45, 30, 75, 82, 94],
      caracteristicas: [
        "Federalismo com Länder dotados de competências próprias.",
        "Parlamentarismo e sistema partidário multipartidário.",
        "Economia social de mercado e forte setor industrial.",
        "Cultura de consenso e memória do regime nazista."
      ],
      ideologias: ["social-democracia", "democracia-crista", "ecossocialismo", "nacionalismo-civico", "ordoliberalismo"],
      partidos: ["spd", "cdu", "afd", "die-linke", "gruene"]
    },
    {
      id: "italia",
      nome: "Itália",
      bandeira: "🇮🇹",
      sigla: "ITA",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista com governos instáveis, multipartidarismo e forte peso da Presidência na formação de coalizões. O país convive com desigualdade regional, dívida pública elevada e legado de movimentos autoritários do século XX.",
      vetor: [65, 92, 62, 65, 12, 75, 55, 42, 42, 70, 65, 82],
      caracteristicas: [
        "Parlamentarismo com coalizões e crises frequentes.",
        "Desigualdade entre norte industrial e sul.",
        "Dívida pública elevada e economia exportadora.",
        "Legado do fascismo e disputas sobre memória."
      ],
      ideologias: ["democracia-crista", "social-democracia", "conservadorismo", "nacionalismo-civico", "fascismo"],
      partidos: ["pd-italia", "fratelli-ditalia", "lega", "movimento-5-estrelas"]
    },
    {
      id: "espanha",
      nome: "Espanha",
      bandeira: "🇪🇸",
      sigla: "ESP",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "Monarquia parlamentarista",
      historico: false,
      resumo:
        "Monarquia parlamentarista com Estado autonômico e forte descentralização regional. A política é marcada pela questão territorial catalã e basca, pelo legado franquista e por um sistema multipartidário.",
      vetor: [80, 94, 55, 80, 8, 82, 58, 42, 38, 88, 82, 80],
      caracteristicas: [
        "Estado autonômico com comunidades com ampla autonomia.",
        "Monarquia parlamentarista e multipartidarismo.",
        "Questão territorial catalã e basca.",
        "Legado do franquismo e políticas de memória."
      ],
      ideologias: ["social-democracia", "conservadorismo", "nacionalismo-civico", "nacional-sindicalismo"],
      partidos: ["psoe", "pp-espanha", "vox"]
    },
    {
      id: "portugal",
      nome: "Portugal",
      bandeira: "🇵🇹",
      sigla: "PRT",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República semipresidencialista",
      historico: false,
      resumo:
        "República semipresidencialista com Parlamento forte e Presidência moderadora. O país consolidou a democracia após 1974, entrou na União Europeia e convive com envelhecimento populacional e crescimento de partidos à direita.",
      vetor: [60, 95, 55, 80, 4, 85, 55, 40, 38, 88, 78, 75],
      caracteristicas: [
        "Semipresidencialismo e Parlamento com centralidade.",
        "Democracia consolidada após a Revolução dos Cravos.",
        "Economia aberta e integração europeia.",
        "Envelhecimento populacional e emigração."
      ],
      ideologias: ["social-democracia", "socialismo-democratico", "nacionalismo-civico", "salazarismo"],
      partidos: ["partido-socialista-portugues", "partido-socialdemocrata-portugues", "chega"]
    },
    {
      id: "suecia",
      nome: "Suécia",
      bandeira: "🇸🇪",
      sigla: "SWE",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "Monarquia parlamentarista",
      historico: false,
      resumo:
        "Monarquia parlamentarista com tradição de Estado de bem-estar universal, sindicatos fortes e consenso político. O país combina economia aberta, alto gasto social e debate crescente sobre imigração e criminalidade.",
      vetor: [60, 98, 45, 95, 2, 90, 55, 35, 25, 95, 96, 96],
      caracteristicas: [
        "Modelo nórdico de proteção social universal.",
        "Parlamentarismo e cultura de consenso.",
        "Economia aberta e intensiva em tecnologia.",
        "Debate sobre imigração e integração."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "noruega",
      nome: "Noruega",
      bandeira: "🇳🇴",
      sigla: "NOR",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "Monarquia parlamentarista",
      historico: false,
      resumo:
        "Monarquia parlamentarista com forte setor público, fundo soberano e tradição de consenso. O país combina economia aberta, proteção social ampla e centralidade da questão climática e energética.",
      vetor: [60, 98, 45, 95, 2, 90, 58, 38, 28, 95, 96, 94],
      caracteristicas: [
        "Estado de bem-estar universal e fundo soberano.",
        "Parlamentarismo e partidos de massa.",
        "Economia aberta com petróleo e energia hidrelétrica.",
        "Forte debate sobre clima e transição energética."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "ecossocialismo"],
      partidos: []
    },
    {
      id: "dinamarca",
      nome: "Dinamarca",
      bandeira: "🇩🇰",
      sigla: "DNK",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "Monarquia parlamentarista",
      historico: false,
      resumo:
        "Monarquia parlamentarista com modelo nórdico de bem-estar, mercado de trabalho flexível e forte tradição de coalizões. A política migratória tornou-se um dos eixos centrais do debate público.",
      vetor: [60, 98, 45, 92, 2, 90, 55, 35, 25, 95, 94, 95],
      caracteristicas: [
        "Modelo de flexicurity no mercado de trabalho.",
        "Parlamentarismo com coalizões multipartidárias.",
        "Proteção social universal e impostos elevados.",
        "Política migratória restritiva nas últimas décadas."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "finlandia",
      nome: "Finlândia",
      bandeira: "🇫🇮",
      sigla: "FIN",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista com tradição de consenso, educação pública forte e inovação tecnológica. A política externa passou por mudança histórica com a entrada na OTAN em 2023.",
      vetor: [60, 98, 50, 90, 2, 90, 58, 40, 30, 94, 92, 98],
      caracteristicas: [
        "Parlamentarismo e cultura de coalizão.",
        "Educação pública e inovação tecnológica.",
        "Estado de bem-estar universal.",
        "Adesão à OTAN em 2023."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "ecossocialismo"],
      partidos: []
    },
    {
      id: "suica",
      nome: "Suíça",
      bandeira: "🇨🇭",
      sigla: "CHE",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República federal com democracia direta",
      historico: false,
      resumo:
        "Federação com forte autonomia cantonal, democracia direta e Executivo colegiado. O país combina neutralidade histórica, setor financeiro internacional e políticas sociais descentralizadas.",
      vetor: [75, 96, 55, 75, 2, 88, 40, 25, 20, 82, 78, 96],
      caracteristicas: [
        "Federalismo cantonal e municípios fortes.",
        "Democracia direta por referendos frequentes.",
        "Neutralidade e não participação em alianças militares.",
        "Setor financeiro e indústria de alta precisão."
      ],
      ideologias: ["liberalismo-classico", "democracia-crista", "social-democracia"],
      partidos: []
    },
    {
      id: "polonia",
      nome: "Polônia",
      bandeira: "🇵🇱",
      sigla: "POL",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista com Presidência relevante e forte influência da Igreja Católica. O país viveu disputas intensas sobre Judiciário, mídia e direitos sociais após a entrada na União Europeia.",
      vetor: [60, 85, 65, 30, 30, 55, 50, 38, 45, 25, 20, 78],
      caracteristicas: [
        "Parlamentarismo com Presidente eleito diretamente.",
        "Forte peso cultural e político do catolicismo.",
        "Disputas sobre Estado de direito e Judiciário.",
        "Economia integrada à União Europeia."
      ],
      ideologias: ["conservadorismo", "democracia-crista", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "hungria",
      nome: "Hungria",
      bandeira: "🇭🇺",
      sigla: "HUN",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista com Executivo fortalecido desde 2010 e críticas de erosão democrática. O governo combina nacionalismo, políticas familiares e confronto com instituições da União Europeia.",
      vetor: [60, 55, 78, 15, 55, 25, 55, 50, 50, 30, 15, 72],
      caracteristicas: [
        "Parlamentarismo com concentração de poder no Executivo.",
        "Nacionalismo e políticas de identidade.",
        "Disputas com a União Europeia sobre Estado de direito.",
        "Política familiar e demografia no centro do debate."
      ],
      ideologias: ["conservadorismo", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "russia",
      nome: "Rússia",
      bandeira: "🇷🇺",
      sigla: "RUS",
      regiao: "Eurásia",
      periodo: "Século XXI",
      categoria: "República federal semipresidencialista",
      historico: false,
      resumo:
        "Federação com Presidência dominante, competição política restrita e economia dependente de energia. O país invadiu a Ucrânia em 2022 e passou a enfrentar sanções e isolamento ocidental.",
      vetor: [55, 25, 85, 20, 70, 15, 65, 70, 55, 80, 20, 85],
      caracteristicas: [
        "Federalismo nominal com forte centralização política.",
        "Presidência dominante e oposição limitada.",
        "Economia dependente de petróleo, gás e commodities.",
        "Guerra contra a Ucrânia e sanções internacionais."
      ],
      ideologias: ["nacionalismo-civico", "conservadorismo", "marxismo-leninismo"],
      partidos: []
    },
    {
      id: "ucrania",
      nome: "Ucrânia",
      bandeira: "🇺🇦",
      sigla: "UKR",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República semipresidencialista",
      historico: false,
      resumo:
        "República semipresidencialista que resiste à invasão russa iniciada em 2022. A guerra reforçou a identidade nacional, a centralização decisória e a dependência de apoio militar e financeiro externo.",
      vetor: [65, 75, 75, 60, 60, 30, 55, 45, 55, 75, 55, 72],
      caracteristicas: [
        "Semipresidencialismo e Parlamento ativo.",
        "Guerra defensiva e mobilização nacional.",
        "Economia devastada e dependência de ajuda externa.",
        "Fortalecimento da identidade nacional."
      ],
      ideologias: ["nacionalismo-civico", "liberalismo-social", "social-democracia"],
      partidos: []
    },
    {
      id: "grecia",
      nome: "Grécia",
      bandeira: "🇬🇷",
      sigla: "GRC",
      regiao: "Europa",
      periodo: "Século XXI",
      categoria: "República parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista marcada pela crise da dívida, por programas de ajuste e por alternância entre esquerda e centro-direita. O país combina turismo, marinha mercante e forte debate sobre austeridade.",
      vetor: [60, 92, 55, 80, 10, 82, 58, 42, 40, 85, 75, 72],
      caracteristicas: [
        "Parlamentarismo e partidos com forte tradição.",
        "Crises da dívida e programas de ajuste.",
        "Economia dependente de turismo e transporte marítimo.",
        "Debate sobre austeridade e proteção social."
      ],
      ideologias: ["socialismo-democratico", "social-democracia", "liberalismo-social"],
      partidos: ["syriza", "nova-democracia"]
    },
    {
      id: "turquia",
      nome: "Turquia",
      bandeira: "🇹🇷",
      sigla: "TUR",
      regiao: "Eurásia",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista após 2018, com forte concentração de poder no Executivo e papel central da religião no debate público. O país ocupa posição estratégica entre Europa, Oriente Médio e Ásia.",
      vetor: [55, 45, 78, 15, 65, 20, 50, 45, 55, 10, 15, 72],
      caracteristicas: [
        "Presidencialismo instituído em 2018.",
        "Concentração de poder e restrições à imprensa.",
        "Posição geopolítica entre Europa e Ásia.",
        "Religião e laicidade no centro do debate."
      ],
      ideologias: ["conservadorismo", "nacionalismo-civico", "social-democracia"],
      partidos: ["akp", "chp"]
    },
    {
      id: "china",
      nome: "China",
      bandeira: "🇨🇳",
      sigla: "CHN",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "República socialista de partido único",
      historico: false,
      resumo:
        "Estado de partido único dirigido pelo Partido Comunista Chinês, com economia de mercado sob controle estatal e crescente projeção global. O país combina industrialização acelerada, controle político e disputa estratégica com os Estados Unidos.",
      vetor: [20, 10, 85, 15, 35, 10, 85, 98, 45, 92, 20, 96],
      caracteristicas: [
        "Partido único e ausência de eleições competitivas nacionais.",
        "Economia de mercado com forte direção estatal.",
        "Industrialização e política de inovação tecnológica.",
        "Projeção global e tensões com os Estados Unidos."
      ],
      ideologias: ["marxismo-leninismo", "maoismo", "nacionalismo-civico"],
      partidos: ["partido-comunista-chines"]
    },
    {
      id: "japao",
      nome: "Japão",
      bandeira: "🇯🇵",
      sigla: "JPN",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "Monarquia constitucional parlamentarista",
      historico: false,
      resumo:
        "Monarquia constitucional com Parlamento e predominância histórica do Partido Liberal Democrata. O país combina economia avançada, baixa imigração e debate sobre envelhecimento e defesa.",
      vetor: [70, 95, 55, 25, 20, 85, 40, 25, 35, 75, 55, 96],
      caracteristicas: [
        "Monarquia simbólica e parlamentarismo.",
        "Predominância do Partido Liberal Democrata.",
        "Economia avançada e envelhecimento populacional.",
        "Baixa imigração e debate sobre defesa."
      ],
      ideologias: ["conservadorismo", "liberalismo-social", "democracia-crista"],
      partidos: []
    },
    {
      id: "india",
      nome: "Índia",
      bandeira: "🇮🇳",
      sigla: "IND",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "República federal parlamentarista",
      historico: false,
      resumo:
        "Federação parlamentarista com grande diversidade linguística e religiosa. O país combina democracia eleitoral robusta, crescimento econômico acelerado e tensões entre nacionalismo hindu e pluralismo constitucional.",
      vetor: [65, 85, 55, 55, 15, 65, 50, 38, 45, 65, 55, 80],
      caracteristicas: [
        "Federalismo e enorme diversidade regional.",
        "Parlamentarismo com eleições competitivas.",
        "Crescimento econômico e desigualdade social.",
        "Tensões entre nacionalismo hindu e pluralismo."
      ],
      ideologias: ["liberalismo-social", "nacionalismo-civico", "social-democracia"],
      partidos: ["congresso-nacional-indiano", "bjp"]
    },
    {
      id: "coreia-do-sul",
      nome: "Coreia do Sul",
      bandeira: "🇰🇷",
      sigla: "KOR",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista com democracia consolidada após a ditadura militar. O país combina industrialização tecnológica, forte sociedade civil e tensão permanente com a Coreia do Norte.",
      vetor: [70, 92, 55, 45, 25, 80, 42, 30, 35, 55, 55, 95],
      caracteristicas: [
        "Presidencialismo com mandato único.",
        "Democracia consolidada e sociedade civil ativa.",
        "Economia tecnológica e exportadora.",
        "Tensão com a Coreia do Norte e aliança com os EUA."
      ],
      ideologias: ["liberalismo-social", "conservadorismo", "social-democracia"],
      partidos: []
    },
    {
      id: "coreia-do-norte",
      nome: "Coreia do Norte",
      bandeira: "🇰🇵",
      sigla: "PRK",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "Estado socialista de partido único",
      historico: false,
      resumo:
        "Regime de partido único sob a dinastia Kim, com economia centralizada, culto à personalidade e programa nuclear. O país é um dos sistemas políticos mais fechados do mundo.",
      vetor: [5, 2, 95, 2, 60, 2, 98, 100, 100, 98, 5, 80],
      caracteristicas: [
        "Partido único e sucessão dinástica.",
        "Economia centralizada e isolamento internacional.",
        "Programa nuclear e forte aparato militar.",
        "Culto à personalidade e controle da informação."
      ],
      ideologias: ["marxismo-leninismo", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "indonesia",
      nome: "Indonésia",
      bandeira: "🇮🇩",
      sigla: "IDN",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista com a maior população muçulmana do mundo e grande diversidade étnica. A democracia consolidou-se após 1998, combinando descentralização, crescimento econômico e disputas religiosas.",
      vetor: [55, 72, 65, 35, 15, 70, 55, 45, 55, 45, 35, 72],
      caracteristicas: [
        "Presidencialismo e descentralização regional.",
        "Maior população muçulmana do mundo.",
        "Democracia consolidada após 1998.",
        "Crescimento econômico e diversidade étnica."
      ],
      ideologias: ["democracia-crista", "nacionalismo-civico", "liberalismo-social"],
      partidos: []
    },
    {
      id: "paquistao",
      nome: "Paquistão",
      bandeira: "🇵🇰",
      sigla: "PAK",
      regiao: "Ásia",
      periodo: "Século XXI",
      categoria: "República federal parlamentarista",
      historico: false,
      resumo:
        "Federação parlamentarista com histórico de intervenções militares e instabilidade política. O país combina pluralismo eleitoral, fragilidade institucional e tensões com a Índia e o Afeganistão.",
      vetor: [55, 55, 80, 10, 65, 10, 55, 50, 60, 5, 8, 62],
      caracteristicas: [
        "Federalismo e províncias com forte identidade.",
        "Intervenções militares e instabilidade política.",
        "Economia agrônoma e remessas externas.",
        "Tensões regionais com Índia e Afeganistão."
      ],
      ideologias: ["nacionalismo-civico", "conservadorismo", "democracia-crista"],
      partidos: []
    },
    {
      id: "israel",
      nome: "Israel",
      bandeira: "🇮🇱",
      sigla: "ISR",
      regiao: "Oriente Médio",
      periodo: "Século XXI",
      categoria: "República parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista com sistema multipartidário e forte centralidade da segurança e da questão palestina. A política interna combina disputas sobre religião, Judiciário e ocupação territorial.",
      vetor: [70, 88, 85, 30, 70, 60, 45, 30, 40, 15, 45, 97],
      caracteristicas: [
        "Parlamentarismo com coalizões frágeis.",
        "Questão palestina e ocupação territorial.",
        "Forte setor de tecnologia e defesa.",
        "Debate sobre religião e Estado."
      ],
      ideologias: ["nacionalismo-civico", "social-democracia", "conservadorismo"],
      partidos: ["likud", "partido-trabalhista-israelense"]
    },
    {
      id: "ira",
      nome: "Irã",
      bandeira: "🇮🇷",
      sigla: "IRN",
      regiao: "Oriente Médio",
      periodo: "Século XXI",
      categoria: "República islâmica",
      historico: false,
      resumo:
        "República islâmica com poder dividido entre instituições eleitas e autoridades religiosas, sob a liderança suprema do aiatolá. O país combina eleições limitadas, controle político e forte influência regional.",
      vetor: [20, 8, 90, 5, 60, 5, 75, 85, 75, 2, 5, 70],
      caracteristicas: [
        "República islâmica com liderança suprema religiosa.",
        "Eleições limitadas e filtro de candidaturas.",
        "Economia dependente de petróleo e sanções.",
        "Influência regional e disputa com potências do Golfo."
      ],
      ideologias: ["conservadorismo", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "arabia-saudita",
      nome: "Arábia Saudita",
      bandeira: "🇸🇦",
      sigla: "SAU",
      regiao: "Oriente Médio",
      periodo: "Século XXI",
      categoria: "Monarquia absoluta",
      historico: false,
      resumo:
        "Monarquia absoluta governada pela família Saud, com forte vínculo entre Estado e religião wahhabita. O país iniciou reformas sociais e econômicas recentes, mantendo controle político rígido.",
      vetor: [25, 10, 88, 5, 60, 10, 40, 45, 55, 2, 3, 82],
      caracteristicas: [
        "Monarquia absoluta sem Parlamento eleito.",
        "Estado e religião profundamente entrelaçados.",
        "Economia petrolífera e planos de diversificação.",
        "Reformas sociais recentes com controle político."
      ],
      ideologias: ["conservadorismo", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "africa-do-sul",
      nome: "África do Sul",
      bandeira: "🇿🇦",
      sigla: "ZAF",
      regiao: "África",
      periodo: "Século XXI",
      categoria: "República federal parlamentarista",
      historico: false,
      resumo:
        "República parlamentarista com nove províncias e democracia consolidada após o fim do apartheid. O país combina pluralismo racial e linguístico, desigualdade persistente e debate sobre justiça social.",
      vetor: [65, 88, 65, 80, 8, 75, 60, 45, 50, 80, 72, 66],
      caracteristicas: [
        "Parlamentarismo e federalismo provincial.",
        "Democracia após 1994 e legado do apartheid.",
        "Desigualdade racial e social persistente.",
        "Diversidade linguística e cultural."
      ],
      ideologias: ["social-democracia", "pan-africanismo", "socialismo-democratico", "liberalismo-social"],
      partidos: ["anc", "eff"]
    },
    {
      id: "nigeria",
      nome: "Nigéria",
      bandeira: "🇳🇬",
      sigla: "NGA",
      regiao: "África",
      periodo: "Século XXI",
      categoria: "República federal presidencialista",
      historico: false,
      resumo:
        "Federação presidencialista com grande população e diversidade étnico-religiosa. O país combina eleições competitivas, petróleo, informalidade e desafios de segurança em diferentes regiões.",
      vetor: [60, 62, 75, 45, 30, 50, 50, 40, 55, 45, 30, 55],
      caracteristicas: [
        "Federalismo com estados e equilíbrio regional.",
        "Presidencialismo e rotatividade entre regiões.",
        "Economia petroleira e grande informalidade.",
        "Desafios de segurança e infraestrutura."
      ],
      ideologias: ["democracia-crista", "nacionalismo-civico", "liberalismo-social"],
      partidos: []
    },
    {
      id: "egito",
      nome: "Egito",
      bandeira: "🇪🇬",
      sigla: "EGY",
      regiao: "África",
      periodo: "Século XXI",
      categoria: "República presidencialista",
      historico: false,
      resumo:
        "República presidencialista com forte papel militar e competição política restrita. Após 2011 e o golpe de 2013, o país voltou a um regime de concentração de poder e controle da sociedade civil.",
      vetor: [40, 25, 85, 10, 60, 15, 60, 65, 55, 20, 15, 62],
      caracteristicas: [
        "Presidencialismo com forte influência militar.",
        "Competição política restrita e controle da sociedade civil.",
        "Economia com papel estatal e ajuda externa.",
        "Posição estratégica no mundo árabe e no Canal de Suez."
      ],
      ideologias: ["nacionalismo-civico", "conservadorismo"],
      partidos: []
    },
    {
      id: "australia",
      nome: "Austrália",
      bandeira: "🇦🇺",
      sigla: "AUS",
      regiao: "Oceania",
      periodo: "Século XXI",
      categoria: "Monarquia constitucional federal",
      historico: false,
      resumo:
        "Federação parlamentarista ligada à Coroa britânica, com Senado forte e tradição de alternância entre trabalho e coalizão liberal-nacional. O país combina economia de recursos, imigração e aliança estratégica com os EUA.",
      vetor: [85, 96, 55, 85, 15, 85, 45, 30, 25, 86, 88, 86],
      caracteristicas: [
        "Federalismo e Parlamento bicameral.",
        "Monarquia constitucional e vínculo com a Commonwealth.",
        "Economia de recursos naturais e serviços.",
        "Imigração e aliança estratégica com os EUA."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "conservadorismo"],
      partidos: []
    },
    {
      id: "nova-zelandia",
      nome: "Nova Zelândia",
      bandeira: "🇳🇿",
      sigla: "NZL",
      regiao: "Oceania",
      periodo: "Século XXI",
      categoria: "Monarquia constitucional parlamentarista",
      historico: false,
      resumo:
        "Monarquia constitucional parlamentarista com sistema proporcional e forte tradição de políticas sociais. O país é marcado pela relação com os povos Māori e por debate ambiental e de imigração.",
      vetor: [80, 98, 45, 90, 2, 92, 52, 38, 25, 92, 94, 82],
      caracteristicas: [
        "Parlamentarismo proporcional e coalizões.",
        "Tratado de Waitangi e direitos Māori.",
        "Estado de bem-estar e políticas ambientais.",
        "Economia agroexportadora e turismo."
      ],
      ideologias: ["social-democracia", "liberalismo-social", "ecossocialismo"],
      partidos: []
    },
    {
      id: "uniao-sovietica",
      nome: "União Soviética",
      bandeira: "",
      sigla: "URSS",
      regiao: "Eurásia",
      periodo: "1922–1991",
      categoria: "Estado socialista de partido único",
      historico: true,
      resumo:
        "Federação nominal de repúblicas dirigida pelo Partido Comunista, com economia planificada, censura e repressão política. O regime passou por coletivização, industrialização forçada, guerra e reformas que culminaram em sua dissolução em 1991.",
      vetor: [10, 5, 92, 20, 50, 8, 96, 100, 100, 100, 25, 85],
      caracteristicas: [
        "Partido único e centralismo democrático.",
        "Economia planificada e coletivização.",
        "Repressão política, censura e campos de trabalho.",
        "Superpotência militar e disputa com os EUA."
      ],
      ideologias: ["marxismo-leninismo", "comunismo"],
      partidos: ["partido-bolchevique", "partido-comunista-da-uniao-sovietica"]
    },
    {
      id: "alemanha-nazista",
      nome: "Alemanha Nazista",
      bandeira: "",
      sigla: "III R.",
      regiao: "Europa",
      periodo: "1933–1945",
      categoria: "Ditadura totalitária",
      historico: true,
      resumo:
        "Regime liderado por Adolf Hitler e pelo Partido Nazista, baseado em racismo biológico, antissemitismo, expansionismo e terror de Estado. O regime desencadeou a Segunda Guerra Mundial e o Holocausto, no qual foram assassinadas milhões de pessoas.",
      vetor: [20, 2, 98, 3, 92, 3, 38, 72, 58, 15, 2, 82],
      caracteristicas: [
        "Partido único, Führerprinzip e propaganda de massas.",
        "Racismo biológico, antissemitismo e eugenia.",
        "Expansionismo territorial e guerra de extermínio.",
        "Holocausto e perseguição sistemática de opositores."
      ],
      ideologias: ["nazismo", "fascismo"],
      partidos: ["partido-nazista"]
    },
    {
      id: "italia-fascista",
      nome: "Itália Fascista",
      bandeira: "",
      sigla: "1922",
      regiao: "Europa",
      periodo: "1922–1943",
      categoria: "Ditadura fascista",
      historico: true,
      resumo:
        "Regime de Benito Mussolini e do Partido Nacional Fascista, com culto ao líder, violência paramilitar, censura e corporativismo. O regime aliou-se à Alemanha nazista e entrou na Segunda Guerra Mundial.",
      vetor: [25, 8, 95, 10, 75, 8, 50, 68, 65, 20, 8, 72],
      caracteristicas: [
        "Culto ao Duce e partido único.",
        "Violência paramilitar e repressão política.",
        "Corporativismo e propaganda de massas.",
        "Aliança com a Alemanha nazista na Segunda Guerra."
      ],
      ideologias: ["fascismo", "nacional-sindicalismo"],
      partidos: ["partido-fascista-italiano"]
    },
    {
      id: "portugal-salazarista",
      nome: "Portugal Salazarista",
      bandeira: "",
      sigla: "1933",
      regiao: "Europa",
      periodo: "1933–1974",
      categoria: "Ditadura autoritária",
      historico: true,
      resumo:
        "Regime autoritário de António de Oliveira Salazar, conhecido como Estado Novo, com partido único, censura, polícia política e corporativismo católico. O regime manteve colônias africanas e caiu com a Revolução dos Cravos em 1974.",
      vetor: [25, 12, 88, 10, 40, 10, 55, 62, 82, 3, 3, 45],
      caracteristicas: [
        "Estado Novo, censura e polícia política.",
        "Corporativismo católico e partido único.",
        "Guerras coloniais na África.",
        "Queda em 1974 com a Revolução dos Cravos."
      ],
      ideologias: ["salazarismo", "nacional-sindicalismo", "conservadorismo"],
      partidos: ["uniao-nacional-portuguesa"]
    },
    {
      id: "espanha-franquista",
      nome: "Espanha Franquista",
      bandeira: "",
      sigla: "1939",
      regiao: "Europa",
      periodo: "1939–1975",
      categoria: "Ditadura autoritária",
      historico: true,
      resumo:
        "Regime de Francisco Franco instalado após a Guerra Civil, com partido único, repressão política e forte vínculo com a Igreja Católica. O regime combinou nacionalismo, corporativismo e alinhamento parcial com o Ocidente durante a Guerra Fria.",
      vetor: [30, 15, 92, 10, 45, 12, 50, 65, 80, 3, 3, 50],
      caracteristicas: [
        "Partido único e concentração de poder em Franco.",
        "Repressão política e memória da Guerra Civil.",
        "Nacionalismo espanhol e catolicismo oficial.",
        "Transição para a democracia após 1975."
      ],
      ideologias: ["nacional-sindicalismo", "conservadorismo", "fascismo"],
      partidos: ["falange"]
    },
    {
      id: "chile-pinochetista",
      nome: "Chile de Pinochet",
      bandeira: "",
      sigla: "1973",
      regiao: "América do Sul",
      periodo: "1973–1990",
      categoria: "Ditadura militar",
      historico: true,
      resumo:
        "Ditadura militar liderada por Augusto Pinochet, instalada com o golpe contra Salvador Allende. O regime combinou repressão, desaparecimentos e tortura com reformas econômicas neoliberais e uma Constituição de 1980.",
      vetor: [80, 12, 94, 20, 65, 18, 16, 8, 35, 30, 12, 66],
      caracteristicas: [
        "Golpe militar e repressão sistemática.",
        "Reformas neoliberais e privatizações.",
        "Constituição de 1980 e plebiscito de 1988.",
        "Desaparecimentos, tortura e exílio."
      ],
      ideologias: ["neoliberalismo", "conservadorismo", "nacionalismo-civico"],
      partidos: []
    },
    {
      id: "brasil-ditadura-militar",
      nome: "Brasil da Ditadura Militar",
      bandeira: "",
      sigla: "1964",
      regiao: "América do Sul",
      periodo: "1964–1985",
      categoria: "Ditadura militar",
      historico: true,
      resumo:
        "Regime militar instaurado em 1964, com bipartidarismo controlado, censura, tortura e cassação de direitos políticos. O período combinou milagre econômico, endividamento externo e abertura política gradual até 1985.",
      vetor: [80, 10, 94, 30, 40, 30, 52, 62, 70, 28, 12, 68],
      caracteristicas: [
        "Governos militares e Atos Institucionais.",
        "Censura, tortura e repressão política.",
        "Milagre econômico e endividamento externo.",
        "Abertura lenta e transição em 1985."
      ],
      ideologias: ["conservadorismo", "nacionalismo-civico"],
      partidos: ["arena"]
    },
    {
      id: "africa-do-sul-apartheid",
      nome: "África do Sul do Apartheid",
      bandeira: "",
      sigla: "1948",
      regiao: "África",
      periodo: "1948–1994",
      categoria: "Regime de segregação racial",
      historico: true,
      resumo:
        "Regime de segregação racial institucionalizada que privou a maioria negra de direitos políticos e civis. O apartheid foi sustentado por leis, violência estatal e isolamento internacional até a transição democrática de 1994.",
      vetor: [65, 12, 92, 2, 65, 8, 35, 28, 62, 35, 8, 58],
      caracteristicas: [
        "Segregação racial institucionalizada.",
        "Privação de direitos políticos da maioria negra.",
        "Violência estatal e resistência organizada.",
        "Sanções internacionais e transição em 1994."
      ],
      ideologias: ["nacionalismo-civico", "conservadorismo"],
      partidos: []
    }
  ];

  globalThis.AtlasData = globalThis.AtlasData || {};
  globalThis.AtlasData.paises = paises;
})();
