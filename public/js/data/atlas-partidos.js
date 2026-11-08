/**
 * Atlas político — catálogo de partidos.
 *
 * Vetores: doze valores de 0 a 100, na ordem de atlas-axes.js, com 100 no
 * primeiro polo. O vetor procura resumir o programa e a prática predominante
 * do partido no período indicado. Coligações, governos e mudanças de posição
 * podem afastar a prática do programa; a leitura é editorial e aproximada.
 */
(function () {
  const partidos = [
    {
      id: "pt",
      nome: "Partido dos Trabalhadores",
      sigla: "PT",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1980–hoje",
      orientacao: "Esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Nascido de sindicatos, movimentos sociais e comunidades eclesiais de base, o PT combina defesa de direitos trabalhistas, políticas sociais e um papel indutor do Estado. Esteve no governo federal entre 2003 e 2016 e voltou ao poder em 2023.",
      vetor: [60, 92, 42, 82, 4, 78, 82, 72, 55, 84, 88, 60],
      marcos: [
        "Fundação em 1980, durante a abertura política.",
        "Governos Lula (2003–2010) e Dilma (2011–2016).",
        "Retorno à Presidência em 2023."
      ],
      ideologia: "trabalhismo"
    },
    {
      id: "psdb",
      nome: "Partido da Social Democracia Brasileira",
      sigla: "PSDB",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1988–hoje",
      orientacao: "Centro-esquerda",
      espectro: "centro",
      historico: false,
      resumo:
        "Surgiu de uma dissidência do PMDB e se consolidou como partido de centro-esquerda liberal-social, associado ao Plano Real, à estabilização monetária e a reformas do Estado. Governou o país entre 1995 e 2002.",
      vetor: [70, 92, 52, 72, 8, 72, 62, 45, 42, 66, 72, 66],
      marcos: [
        "Plano Real e estabilização monetária nos anos 1990.",
        "Governo Fernando Henrique Cardoso (1995–2002).",
        "Crise e fragmentação interna após 2014."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "pl",
      nome: "Partido Liberal",
      sigla: "PL",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "2006–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de direita que se tornou a principal legenda do campo bolsonarista. Combina pautas conservadoras nos costumes, defesa da propriedade e do agronegócio e crítica ao tamanho do Estado.",
      vetor: [65, 66, 82, 32, 55, 32, 24, 18, 42, 28, 22, 70],
      marcos: [
        "Fusão que deu origem ao PL em 2006.",
        "Base do governo Bolsonaro (2019–2022).",
        "Maior bancada da Câmara em 2023."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "psol",
      nome: "Partido Socialismo e Liberdade",
      sigla: "PSOL",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "2004–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Formado por dissidentes do PT, reúne correntes socialistas, trotskistas e de esquerda radical. Defende reformas estruturais, direitos de minorias e crítica ao presidencialismo de coalizão.",
      vetor: [55, 94, 35, 88, 4, 80, 90, 82, 62, 90, 94, 58],
      marcos: [
        "Fundação em 2004 por dissidentes do PT.",
        "Candidaturas presidenciais de Heloísa Helena e Guilherme Boulos.",
        "Presença forte em movimentos sociais e direitos humanos."
      ],
      ideologia: "socialismo-democratico"
    },
    {
      id: "pdt",
      nome: "Partido Democrático Trabalhista",
      sigla: "PDT",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1979–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Herdeiro do trabalhismo de Getúlio Vargas e João Goulart, fundado por Leonel Brizola. Defende nacionalismo desenvolvimentista, direitos trabalhistas e um Estado forte na promoção social.",
      vetor: [50, 90, 55, 68, 10, 62, 74, 60, 58, 65, 76, 55],
      marcos: [
        "Fundação por Leonel Brizola em 1979.",
        "Governos estaduais no Rio de Janeiro e no Rio Grande do Sul.",
        "Defesa histórica do trabalhismo e do nacionalismo."
      ],
      ideologia: "trabalhismo"
    },
    {
      id: "mdb",
      nome: "Movimento Democrático Brasileiro",
      sigla: "MDB",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1966–hoje",
      orientacao: "Centro",
      espectro: "centro",
      historico: false,
      resumo:
        "Surgiu como partido de oposição consentida à ditadura e se transformou em legenda de centro com forte presença municipal e parlamentar. É marcado pelo pragmatismo, por alianças amplas e por governos de coalizão.",
      vetor: [75, 82, 58, 58, 14, 58, 62, 45, 50, 55, 52, 58],
      marcos: [
        "Oposição legal à ditadura militar.",
        "Constituinte de 1988 e governos de coalizão.",
        "Principal legenda no Congresso em diversos momentos."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "pp",
      nome: "Progressistas",
      sigla: "PP",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1995–hoje",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Legenda de centro-direita com forte presença no agronegócio, em prefeituras e no Congresso. Combina liberalismo econômico moderado com pautas conservadoras e pragmatismo eleitoral.",
      vetor: [60, 72, 78, 38, 45, 35, 30, 22, 48, 34, 28, 62],
      marcos: [
        "Origem no PDS e no bloco de sustentação do regime militar.",
        "Forte bancada ruralista e municipalista.",
        "Participação em governos de centro-direita."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "republicanos",
      nome: "Republicanos",
      sigla: "REP",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "2005–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de direita ligado a setores evangélicos e conservadores, com forte atuação municipal e parlamentar. Defende pautas religiosas, propriedade privada e redução da intervenção estatal.",
      vetor: [55, 70, 80, 35, 45, 35, 35, 28, 45, 28, 20, 62],
      marcos: [
        "Fundação como Partido Republicano Brasileiro.",
        "Crescimento eleitoral no campo evangélico.",
        "Presença em coalizões de governo e oposição."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "novo",
      nome: "Partido Novo",
      sigla: "NOVO",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "2011–hoje",
      orientacao: "Direita liberal",
      espectro: "libertario",
      historico: false,
      resumo:
        "Partido de orientação liberal, com defesa de Estado mínimo, livre mercado, responsabilidade fiscal e redução de privilégios. Adota processo interno de seleção de candidatos e discurso antipolítica.",
      vetor: [75, 88, 35, 60, 30, 45, 15, 8, 8, 72, 52, 88],
      marcos: [
        "Fundação em 2011 com inspiração liberal.",
        "Eleição de deputados e prefeitos a partir de 2018.",
        "Defesa de privatizações e ajuste fiscal."
      ],
      ideologia: "liberalismo-classico"
    },
    {
      id: "pcdo-b",
      nome: "Partido Comunista do Brasil",
      sigla: "PCdoB",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1962–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Organização marxista-leninista fundada em 1962, com longa trajetória de luta armada e depois de atuação institucional. Integrou governos petistas e mantém vínculos com movimentos sindicais e estudantis.",
      vetor: [45, 80, 50, 75, 10, 65, 90, 86, 65, 86, 82, 58],
      marcos: [
        "Fundação em 1962.",
        "Participação na guerrilha do Araguaia.",
        "Apoio aos governos do PT e presença institucional."
      ],
      ideologia: "marxismo-leninismo"
    },
    {
      id: "ptb-1945",
      nome: "Partido Trabalhista Brasileiro (1945–1965)",
      sigla: "PTB",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1945–1965",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: true,
      resumo:
        "Partido criado no contexto do Estado Novo e ligado a Getúlio Vargas, com base sindical e defesa da legislação trabalhista. Foi uma das principais legendas do período democrático de 1945 a 1964.",
      vetor: [50, 75, 55, 50, 25, 40, 75, 62, 62, 55, 58, 55],
      marcos: [
        "Criação em 1945 e vínculo com Getúlio Vargas.",
        "Protagonismo no governo João Goulart.",
        "Extinção pelo AI-2 em 1965."
      ],
      ideologia: "trabalhismo"
    },
    {
      id: "udn",
      nome: "União Democrática Nacional",
      sigla: "UDN",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1945–1965",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: true,
      resumo:
        "Partido liberal-conservador que se opôs ao getulismo e defendeu descentralização, liberalismo econômico e moralidade administrativa. Teve papel central na crise de 1964.",
      vetor: [70, 78, 65, 35, 45, 30, 28, 20, 55, 30, 25, 58],
      marcos: [
        "Fundação em 1945.",
        "Oposição a Vargas e a Jango.",
        "Apoio ao golpe de 1964."
      ],
      ideologia: "liberalismo-classico"
    },
    {
      id: "arena",
      nome: "Aliança Renovadora Nacional",
      sigla: "ARENA",
      paisId: "brasil-ditadura-militar",
      regiao: "Brasil",
      periodo: "1966–1979",
      orientacao: "Direita autoritária",
      espectro: "direita",
      historico: true,
      resumo:
        "Partido de sustentação do regime militar criado após o AI-2. Serviu como base parlamentar dos governos militares e foi extinto no processo de abertura.",
      vetor: [70, 20, 90, 25, 55, 25, 45, 55, 65, 30, 15, 60],
      marcos: [
        "Criação em 1966 sob o bipartidarismo.",
        "Base de sustentação dos governos militares.",
        "Extinção em 1979 com o fim do bipartidarismo."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "aib",
      nome: "Ação Integralista Brasileira",
      sigla: "AIB",
      paisId: "brasil",
      regiao: "Brasil",
      periodo: "1932–1937",
      orientacao: "Terceira posição",
      espectro: "terceira-posicao",
      historico: true,
      resumo:
        "Movimento nacionalista de massa liderado por Plínio Salgado, com inspiração corporativista, católica e anticomunista. Foi proibido após a instauração do Estado Novo em 1937.",
      vetor: [45, 15, 85, 10, 60, 5, 58, 65, 70, 5, 5, 55],
      marcos: [
        "Fundação em 1932.",
        "Marchas e mobilização de massas com camisas verdes.",
        "Proibição em 1937 e posterior aproximação do Estado Novo."
      ],
      ideologia: "integralismo"
    },
    {
      id: "partido-democrata-eua",
      nome: "Partido Democrata",
      sigla: "DEM",
      paisId: "estados-unidos",
      regiao: "América do Norte",
      periodo: "1828–hoje",
      orientacao: "Centro-esquerda",
      espectro: "centro",
      historico: false,
      resumo:
        "Um dos dois grandes partidos dos Estados Unidos, com base urbana, sindical e em minorias. Defende programas sociais, direitos civis e maior regulação econômica, com alas moderadas e progressistas.",
      vetor: [80, 95, 55, 80, 18, 60, 45, 30, 30, 80, 88, 78],
      marcos: [
        "Novo Deal de Franklin D. Roosevelt.",
        "Direitos civis nos anos 1960.",
        "Governos Clinton, Obama e Biden."
      ],
      ideologia: "liberalismo-social"
    },
    {
      id: "partido-republicano-eua",
      nome: "Partido Republicano",
      sigla: "GOP",
      paisId: "estados-unidos",
      regiao: "América do Norte",
      periodo: "1854–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de direita com base no empresariado, no interior e em setores religiosos. Combina defesa de mercados, corte de impostos, conservadorismo cultural e, em períodos recentes, forte nacionalismo.",
      vetor: [85, 70, 75, 30, 75, 35, 22, 12, 25, 30, 22, 82],
      marcos: [
        "Fundação em 1854 e abolição da escravidão.",
        "Revolução conservadora de Reagan nos anos 1980.",
        "Governos de George W. Bush e Donald Trump."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "partido-trabalhista-reino-unido",
      nome: "Partido Trabalhista",
      sigla: "Labour",
      paisId: "reino-unido",
      regiao: "Europa",
      periodo: "1900–hoje",
      orientacao: "Centro-esquerda",
      espectro: "centro",
      historico: false,
      resumo:
        "Partido ligado ao movimento sindical e à social-democracia britânica. Construiu o NHS e o Estado de bem-estar e alterna entre governos reformistas e versões mais centristas.",
      vetor: [75, 95, 58, 80, 8, 70, 68, 55, 45, 82, 82, 66],
      marcos: [
        "Fundação em 1900 pelo movimento sindical.",
        "Criação do NHS em 1948.",
        "Governos Attlee, Wilson, Blair, Brown e Starmer."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "partido-conservador-reino-unido",
      nome: "Partido Conservador",
      sigla: "Tory",
      paisId: "reino-unido",
      regiao: "Europa",
      periodo: "1834–hoje",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de centro-direita com tradição unionista e liberal-conservadora. Defende mercado, ordem fiscal e identidade nacional, com alas moderadas e eurocéticas.",
      vetor: [70, 88, 75, 35, 60, 30, 25, 15, 40, 35, 28, 72],
      marcos: [
        "Origem no século XIX.",
        "Governos Thatcher e Major.",
        "Brexit e governos de Cameron, Johnson, Truss e Sunak."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "spd",
      nome: "Partido Social-Democrata da Alemanha",
      sigla: "SPD",
      paisId: "alemanha",
      regiao: "Europa",
      periodo: "1863–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Um dos partidos social-democratas mais antigos do mundo, com papel central na construção do Estado de bem-estar alemão. Oscila entre reformismo social e alianças de governo com a centro-direita.",
      vetor: [65, 96, 60, 78, 6, 72, 70, 55, 40, 78, 82, 64],
      marcos: [
        "Fundação no século XIX.",
        "Programa de Bad Godesberg em 1959.",
        "Governos Brandt, Schmidt e Scholz."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "cdu",
      nome: "União Democrata-Cristã",
      sigla: "CDU",
      paisId: "alemanha",
      regiao: "Europa",
      periodo: "1945–hoje",
      orientacao: "Centro-direita",
      espectro: "centro",
      historico: false,
      resumo:
        "Partido democrata-cristão de centro-direita, com base no federalismo, na economia social de mercado e na integração europeia. Governou a Alemanha por longos períodos após 1949.",
      vetor: [70, 95, 65, 50, 10, 55, 55, 40, 35, 45, 42, 65],
      marcos: [
        "Fundação em 1945.",
        "Governo Konrad Adenauer e reconstrução do pós-guerra.",
        "Governo Angela Merkel (2005–2021)."
      ],
      ideologia: "democracia-crista"
    },
    {
      id: "afd",
      nome: "Alternativa para a Alemanha",
      sigla: "AfD",
      paisId: "alemanha",
      regiao: "Europa",
      periodo: "2013–hoje",
      orientacao: "Extrema-direita",
      espectro: "extrema-direita",
      historico: false,
      resumo:
        "Partido nacionalista e eurocético que cresceu com o discurso anti-imigração e com a oposição às políticas climáticas. Setores do partido são monitorados por agências de segurança alemãs.",
      vetor: [62, 55, 85, 8, 65, 18, 30, 25, 60, 10, 8, 62],
      marcos: [
        "Fundação em 2013.",
        "Entrada no Bundestag em 2017.",
        "Fortalecimento eleitoral no leste alemão."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "die-linke",
      nome: "A Esquerda",
      sigla: "Linke",
      paisId: "alemanha",
      regiao: "Europa",
      periodo: "2007–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Partido de esquerda radical formado pela fusão do PDS e do WASG. Defende redistribuição, nacionalizações setoriais e política externa pacifista.",
      vetor: [55, 92, 45, 82, 5, 75, 88, 80, 60, 90, 90, 58],
      marcos: [
        "Fundação em 2007.",
        "Forte base no leste alemão.",
        "Crises internas e cisões recentes."
      ],
      ideologia: "socialismo-democratico"
    },
    {
      id: "gruene",
      nome: "Os Verdes",
      sigla: "Grüne",
      paisId: "alemanha",
      regiao: "Europa",
      periodo: "1980–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Partido ecologista nascido dos movimentos antinucleares e pacifistas. Combina proteção ambiental, direitos civis e políticas sociais, com uma ala pragmática e outra mais radical.",
      vetor: [65, 96, 40, 92, 4, 82, 68, 60, 45, 88, 94, 72],
      marcos: [
        "Fundação em 1980.",
        "Primeiro governo federal com SPD em 1998.",
        "Protagonismo na transição energética."
      ],
      ideologia: "ecossocialismo"
    },
    {
      id: "renaissance",
      nome: "Renascimento",
      sigla: "RE",
      paisId: "franca",
      regiao: "Europa",
      periodo: "2016–hoje",
      orientacao: "Centro",
      espectro: "centro",
      historico: false,
      resumo:
        "Partido fundado por Emmanuel Macron em torno de um projeto liberal-social e europeísta. Combina reformas de mercado, investimento público e defesa da integração europeia.",
      vetor: [65, 92, 50, 75, 12, 60, 40, 25, 20, 75, 78, 82],
      marcos: [
        "Fundação em 2016.",
        "Eleição de Macron em 2017 e 2022.",
        "Reformas previdenciária e trabalhista."
      ],
      ideologia: "liberalismo-social"
    },
    {
      id: "rassemblement-national",
      nome: "Reunião Nacional",
      sigla: "RN",
      paisId: "franca",
      regiao: "Europa",
      periodo: "1972–hoje",
      orientacao: "Extrema-direita",
      espectro: "extrema-direita",
      historico: false,
      resumo:
        "Partido nacionalista e anti-imigração, antigo Front National, comandado pela família Le Pen. Buscou moderar a imagem sem abandonar o núcleo identitário e eurocético.",
      vetor: [55, 60, 88, 5, 70, 10, 35, 30, 65, 10, 5, 62],
      marcos: [
        "Fundação como Front National em 1972.",
        "Segundo turno presidencial em 2002, 2017 e 2022.",
        "Mudança de nome para Reunião Nacional em 2018."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "la-france-insoumise",
      nome: "França Insubmissa",
      sigla: "LFI",
      paisId: "franca",
      regiao: "Europa",
      periodo: "2016–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Movimento liderado por Jean-Luc Mélenchon, com forte crítica à austeridade e ao presidencialismo. Defende planejamento ecológico, redistribuição e uma Europa social.",
      vetor: [55, 94, 38, 85, 4, 72, 85, 75, 60, 88, 92, 58],
      marcos: [
        "Fundação em 2016.",
        "Terceiro lugar nas presidenciais de 2022.",
        "Papel central na Nova Frente Popular em 2024."
      ],
      ideologia: "socialismo-democratico"
    },
    {
      id: "pd-italia",
      nome: "Partido Democrata",
      sigla: "PD",
      paisId: "italia",
      regiao: "Europa",
      periodo: "2007–hoje",
      orientacao: "Centro-esquerda",
      espectro: "centro",
      historico: false,
      resumo:
        "Partido de centro-esquerda formado pela fusão de correntes social-democratas e democrata-cristãs. Defende integração europeia, proteção social e reformas institucionais.",
      vetor: [60, 95, 55, 70, 8, 62, 55, 40, 35, 72, 65, 68],
      marcos: [
        "Fundação em 2007.",
        "Governos de Matteo Renzi e Paolo Gentiloni.",
        "Participação em coalizões de centro-esquerda."
      ],
      ideologia: "democracia-crista"
    },
    {
      id: "fratelli-ditalia",
      nome: "Irmãos da Itália",
      sigla: "FdI",
      paisId: "italia",
      regiao: "Europa",
      periodo: "2012–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de direita com raízes pós-fascistas e forte discurso nacionalista. Chegou ao governo em 2022 com Giorgia Meloni e combina conservadorismo cultural com atlantismo.",
      vetor: [55, 80, 80, 25, 65, 20, 40, 30, 50, 25, 12, 65],
      marcos: [
        "Fundação em 2012.",
        "Vitória eleitoral em 2022.",
        "Governo Giorgia Meloni."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "lega",
      nome: "Liga",
      sigla: "Lega",
      paisId: "italia",
      regiao: "Europa",
      periodo: "1991–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido originalmente regionalista do norte da Itália, transformado em legenda nacional de direita. Combina federalismo fiscal, anti-imigração e crítica à União Europeia.",
      vetor: [50, 70, 85, 5, 65, 10, 35, 30, 65, 12, 8, 60],
      marcos: [
        "Fundação em 1991 como Liga Norte.",
        "Governo de Matteo Salvini com o M5S em 2018.",
        "Transformação em partido nacional."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "movimento-5-estrelas",
      nome: "Movimento 5 Estrelas",
      sigla: "M5S",
      paisId: "italia",
      regiao: "Europa",
      periodo: "2009–hoje",
      orientacao: "Centro",
      espectro: "centro",
      historico: false,
      resumo:
        "Movimento antipartido fundado por Beppe Grillo, com bandeiras de transparência, renda básica e democracia digital. Governou em coalizões com a direita e com a centro-esquerda.",
      vetor: [55, 80, 55, 55, 20, 50, 65, 55, 55, 65, 60, 75],
      marcos: [
        "Fundação em 2009.",
        "Governo com a Liga em 2018.",
        "Introdução da renda de cidadania em 2019."
      ],
      ideologia: "populismo"
    },
    {
      id: "partido-fascista-italiano",
      nome: "Partido Nacional Fascista",
      sigla: "PNF",
      paisId: "italia-fascista",
      regiao: "Europa",
      periodo: "1921–1943",
      orientacao: "Fascismo",
      espectro: "extrema-direita",
      historico: true,
      resumo:
        "Partido de Benito Mussolini que chegou ao poder em 1922 e construiu a ditadura fascista italiana. Organizava milícias, corporações e propaganda de massas até sua queda em 1943.",
      vetor: [20, 5, 95, 20, 85, 5, 55, 70, 75, 10, 5, 65],
      marcos: [
        "Fundação em 1921.",
        "Marcha sobre Roma em 1922.",
        "Queda de Mussolini em 1943."
      ],
      ideologia: "fascismo"
    },
    {
      id: "psoe",
      nome: "Partido Socialista Operário Espanhol",
      sigla: "PSOE",
      paisId: "espanha",
      regiao: "Europa",
      periodo: "1879–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Partido social-democrata histórico, protagonista da transição espanhola e de governos de modernização. Combina proteção social, federalismo e integração europeia.",
      vetor: [60, 95, 55, 82, 6, 72, 65, 50, 40, 82, 85, 66],
      marcos: [
        "Fundação em 1879.",
        "Governo Felipe González (1982–1996).",
        "Governo Pedro Sánchez desde 2018."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "pp-espanha",
      nome: "Partido Popular",
      sigla: "PP",
      paisId: "espanha",
      regiao: "Europa",
      periodo: "1976–hoje",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de centro-direita com raízes democrata-cristãs e liberais. Defende unidade da Espanha, mercado e ordem fiscal, com alas mais moderadas e mais conservadoras.",
      vetor: [65, 90, 70, 30, 50, 35, 35, 25, 45, 30, 18, 64],
      marcos: [
        "Fundação em 1976 como Aliança Popular.",
        "Governo José María Aznar (1996–2004).",
        "Governo Mariano Rajoy (2011–2018)."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "vox",
      nome: "Vox",
      sigla: "VOX",
      paisId: "espanha",
      regiao: "Europa",
      periodo: "2013–hoje",
      orientacao: "Extrema-direita",
      espectro: "extrema-direita",
      historico: false,
      resumo:
        "Partido nacionalista e conservador que cresceu com pautas anti-imigração, contra o separatismo e contra o governo progressista. Defende centralização e valores tradicionais.",
      vetor: [55, 72, 85, 5, 65, 15, 30, 25, 60, 10, 5, 60],
      marcos: [
        "Fundação em 2013.",
        "Entrada no Congresso em 2019.",
        "Participação em governos regionais com o PP."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "partido-socialista-portugues",
      nome: "Partido Socialista",
      sigla: "PS",
      paisId: "portugal",
      regiao: "Europa",
      periodo: "1973–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Partido social-democrata português, fundado antes da Revolução dos Cravos e central na consolidação democrática. Alterna entre governos de proteção social e ajustes fiscais.",
      vetor: [60, 96, 55, 82, 6, 72, 65, 50, 40, 84, 85, 66],
      marcos: [
        "Fundação em 1973.",
        "Governos de Mário Soares e António Guterres.",
        "Governo António Costa (2015–2024)."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "partido-socialdemocrata-portugues",
      nome: "Partido Social Democrata",
      sigla: "PSD",
      paisId: "portugal",
      regiao: "Europa",
      periodo: "1974–hoje",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de centro-direita fundado após a Revolução dos Cravos, apesar do nome social-democrata. Defende mercado, responsabilidade fiscal e integração europeia.",
      vetor: [65, 94, 62, 45, 12, 50, 42, 28, 35, 45, 35, 66],
      marcos: [
        "Fundação em 1974.",
        "Governo Aníbal Cavaco Silva.",
        "Governos de Pedro Passos Coelho e Luís Montenegro."
      ],
      ideologia: "liberalismo-social"
    },
    {
      id: "chega",
      nome: "Chega",
      sigla: "CH",
      paisId: "portugal",
      regiao: "Europa",
      periodo: "2019–hoje",
      orientacao: "Extrema-direita",
      espectro: "extrema-direita",
      historico: false,
      resumo:
        "Partido nacionalista e populista de direita, com discurso anti-imigração, anticorrupção e críticas ao sistema político. Cresceu rapidamente no Parlamento português.",
      vetor: [55, 65, 88, 5, 65, 12, 30, 25, 65, 8, 3, 58],
      marcos: [
        "Fundação em 2019.",
        "Eleição de André Ventura em 2019.",
        "Fortalecimento nas eleições de 2022 e 2024."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "syriza",
      nome: "Coalizão da Esquerda Radical",
      sigla: "SYRIZA",
      paisId: "grecia",
      regiao: "Europa",
      periodo: "2004–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Coalizão de esquerda que chegou ao governo em 2015 durante a crise da dívida. Defendeu renegociação da austeridade e depois aplicou um novo programa de ajuste.",
      vetor: [55, 94, 42, 85, 6, 70, 85, 78, 62, 88, 90, 58],
      marcos: [
        "Fundação em 2004.",
        "Governo Alexis Tsipras (2015–2019).",
        "Referendo sobre a austeridade em 2015."
      ],
      ideologia: "socialismo-democratico"
    },
    {
      id: "nova-democracia",
      nome: "Nova Democracia",
      sigla: "ND",
      paisId: "grecia",
      regiao: "Europa",
      periodo: "1974–hoje",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de centro-direita fundado após a queda da ditadura dos coronéis. Alterna no poder com o PASOK e o SYRIZA e defende mercado, ordem fiscal e Ocidente.",
      vetor: [65, 95, 65, 45, 15, 50, 45, 30, 35, 45, 38, 66],
      marcos: [
        "Fundação em 1974.",
        "Governo Konstantinos Mitsotakis.",
        "Governo Kyriakos Mitsotakis desde 2019."
      ],
      ideologia: "liberalismo-social"
    },
    {
      id: "akp",
      nome: "Partido da Justiça e Desenvolvimento",
      sigla: "AKP",
      paisId: "turquia",
      regiao: "Eurásia",
      periodo: "2001–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido conservador de raízes islâmicas que governa a Turquia desde 2002. Combinou crescimento econômico e reformas iniciais com crescente concentração de poder.",
      vetor: [55, 45, 82, 10, 60, 10, 50, 50, 55, 5, 8, 62],
      marcos: [
        "Fundação em 2001.",
        "Governo Recep Tayyip Erdoğan desde 2003.",
        "Presidencialismo após 2018."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "chp",
      nome: "Partido Republicano do Povo",
      sigla: "CHP",
      paisId: "turquia",
      regiao: "Eurásia",
      periodo: "1923–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Partido fundado por Atatürk, social-democrata e laicista. Defende secularismo, direitos civis e instituições republicanas.",
      vetor: [60, 88, 58, 60, 12, 60, 60, 45, 50, 80, 72, 64],
      marcos: [
        "Fundação em 1923.",
        "Partido único até 1945.",
        "Principal força de oposição no século XXI."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "partido-comunista-chines",
      nome: "Partido Comunista da China",
      sigla: "PCC",
      paisId: "china",
      regiao: "Ásia",
      periodo: "1921–hoje",
      orientacao: "Partido único",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Partido único no poder desde 1949, com controle sobre o Estado, as forças armadas e amplas áreas da sociedade. Combina marxismo-leninismo oficial com reformas de mercado e nacionalismo.",
      vetor: [10, 5, 88, 15, 35, 10, 85, 98, 60, 95, 25, 88],
      marcos: [
        "Fundação em 1921.",
        "Revolução de 1949.",
        "Reformas de mercado a partir de 1978."
      ],
      ideologia: "marxismo-leninismo"
    },
    {
      id: "congresso-nacional-indiano",
      nome: "Congresso Nacional Indiano",
      sigla: "INC",
      paisId: "india",
      regiao: "Ásia",
      periodo: "1885–hoje",
      orientacao: "Centro",
      espectro: "centro",
      historico: false,
      resumo:
        "Partido histórico da independência indiana, liderado por Gandhi e Nehru. Defende secularismo, democracia e políticas sociais, com forte tradição dinástica.",
      vetor: [70, 92, 55, 80, 5, 65, 55, 40, 50, 85, 75, 66],
      marcos: [
        "Fundação em 1885.",
        "Independência em 1947.",
        "Governos Nehru, Indira Gandhi e Manmohan Singh."
      ],
      ideologia: "liberalismo-social"
    },
    {
      id: "bjp",
      nome: "Partido do Povo Indiano",
      sigla: "BJP",
      paisId: "india",
      regiao: "Ásia",
      periodo: "1980–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido nacionalista hindu, principal força do governo desde 2014. Combina liberalização econômica, centralização e agenda cultural majoritária.",
      vetor: [55, 70, 82, 10, 70, 15, 40, 35, 55, 15, 5, 78],
      marcos: [
        "Fundação em 1980.",
        "Governo Atal Bihari Vajpayee.",
        "Governo Narendra Modi desde 2014."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "likud",
      nome: "Likud",
      sigla: "Likud",
      paisId: "israel",
      regiao: "Oriente Médio",
      periodo: "1973–hoje",
      orientacao: "Direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido de direita israelense, com posições nacionalistas sobre segurança e territórios. Liderado por Benjamin Netanyahu por longos períodos.",
      vetor: [55, 72, 88, 15, 80, 5, 35, 25, 55, 12, 8, 82],
      marcos: [
        "Fundação em 1973.",
        "Primeiro governo Menachem Begin em 1977.",
        "Governos de Benjamin Netanyahu."
      ],
      ideologia: "nacionalismo-civico"
    },
    {
      id: "partido-trabalhista-israelense",
      nome: "Partido Trabalhista Israelense",
      sigla: "Avodá",
      paisId: "israel",
      regiao: "Oriente Médio",
      periodo: "1968–hoje",
      orientacao: "Centro-esquerda",
      espectro: "centro",
      historico: false,
      resumo:
        "Partido social-democrata e sionista trabalhista, dominante nos primeiros anos do Estado de Israel. Defende soluções negociadas e um Estado de bem-estar.",
      vetor: [65, 94, 60, 70, 10, 55, 55, 40, 45, 72, 68, 72],
      marcos: [
        "Fundação em 1968.",
        "Governos de Golda Meir, Yitzhak Rabin e Shimon Peres.",
        "Acordos de Oslo em 1993."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "anc",
      nome: "Congresso Nacional Africano",
      sigla: "ANC",
      paisId: "africa-do-sul",
      regiao: "África",
      periodo: "1912–hoje",
      orientacao: "Centro-esquerda",
      espectro: "centro",
      historico: false,
      resumo:
        "Movimento de libertação que derrotou o apartheid e governa a África do Sul desde 1994. Combina políticas sociais, alianças com sindicatos e comunistas e desafios de corrupção e desigualdade.",
      vetor: [55, 82, 55, 85, 6, 65, 65, 50, 50, 85, 80, 60],
      marcos: [
        "Fundação em 1912.",
        "Luta contra o apartheid e prisão de Mandela.",
        "Governo desde 1994."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "eff",
      nome: "Lutadores pela Liberdade Econômica",
      sigla: "EFF",
      paisId: "africa-do-sul",
      regiao: "África",
      periodo: "2013–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Partido liderado por Julius Malema, com pautas de redistribuição de terra, nacionalização de minas e justiça racial. Tem forte base entre jovens e trabalhadores.",
      vetor: [45, 78, 50, 90, 10, 60, 88, 82, 70, 90, 90, 55],
      marcos: [
        "Fundação em 2013.",
        "Entrada no Parlamento em 2014.",
        "Pauta de expropriação de terra sem indenização."
      ],
      ideologia: "socialismo-democratico"
    },
    {
      id: "partido-justicialista",
      nome: "Partido Justicialista",
      sigla: "PJ",
      paisId: "argentina",
      regiao: "América do Sul",
      periodo: "1946–hoje",
      orientacao: "Peronismo",
      espectro: "terceira-posicao",
      historico: false,
      resumo:
        "Partido fundado por Juan Domingo Perón, com base sindical e forte identificação popular. O peronismo combinou nacionalização, proteção social, corporativismo e diferentes orientações ao longo do tempo.",
      vetor: [45, 72, 70, 55, 20, 35, 78, 68, 72, 40, 45, 60],
      marcos: [
        "Fundação em 1946.",
        "Governos de Perón e Evita.",
        "Governos de Néstor e Cristina Kirchner."
      ],
      ideologia: "peronismo"
    },
    {
      id: "frente-ampla",
      nome: "Frente Ampla",
      sigla: "FA",
      paisId: "uruguai",
      regiao: "América do Sul",
      periodo: "1971–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Coalizão de esquerda e centro-esquerda que governou o Uruguai por vários períodos. Combina social-democracia, movimentos sociais e empresas públicas.",
      vetor: [55, 94, 55, 82, 4, 72, 72, 55, 55, 85, 85, 62],
      marcos: [
        "Fundação em 1971.",
        "Governo Tabaré Vázquez em 2005.",
        "Governo José Mujica (2010–2015)."
      ],
      ideologia: "social-democracia"
    },
    {
      id: "partido-socialista-chile",
      nome: "Partido Socialista do Chile",
      sigla: "PS",
      paisId: "chile",
      regiao: "América do Sul",
      periodo: "1933–hoje",
      orientacao: "Centro-esquerda",
      espectro: "esquerda",
      historico: false,
      resumo:
        "Partido socialista com papel central no governo de Salvador Allende e na transição democrática. Combina social-democracia, derechos sociales e alianças de centro-esquerda.",
      vetor: [55, 94, 52, 82, 5, 72, 78, 66, 55, 86, 88, 60],
      marcos: [
        "Fundação em 1933.",
        "Governo Salvador Allende (1970–1973).",
        "Participação na Concertación após 1990."
      ],
      ideologia: "socialismo-democratico"
    },
    {
      id: "partido-comunista-chile",
      nome: "Partido Comunista do Chile",
      sigla: "PCCh",
      paisId: "chile",
      regiao: "América do Sul",
      periodo: "1922–hoje",
      orientacao: "Esquerda radical",
      espectro: "esquerda-radical",
      historico: false,
      resumo:
        "Partido marxista-leninista com longa trajetória, legalizado e integrado à coalizão de governo em períodos recentes. Atua em sindicatos e movimentos sociais.",
      vetor: [45, 85, 55, 80, 8, 65, 90, 88, 65, 92, 85, 58],
      marcos: [
        "Fundação em 1922.",
        "Participação no governo Allende.",
        "Integração à coalizão de Gabriel Boric."
      ],
      ideologia: "marxismo-leninismo"
    },
    {
      id: "chile-vamos",
      nome: "Chile Vamos",
      sigla: "ChV",
      paisId: "chile",
      regiao: "América do Sul",
      periodo: "2015–hoje",
      orientacao: "Centro-direita",
      espectro: "direita",
      historico: false,
      resumo:
        "Coalizão de partidos de centro-direita e direita, herdeira da Alianza por Chile. Defende mercado, ordem fiscal e reformas graduais.",
      vetor: [70, 88, 65, 50, 25, 50, 40, 28, 30, 55, 40, 68],
      marcos: [
        "Criação em 2015.",
        "Governo Sebastián Piñera (2018–2022).",
        "Oposição ao governo de Gabriel Boric."
      ],
      ideologia: "conservadorismo"
    },
    {
      id: "partido-bolchevique",
      nome: "Partido Operário Social-Democrata Russo (bolchevique)",
      sigla: "POSDR(b)",
      paisId: "uniao-sovietica",
      regiao: "Eurásia",
      periodo: "1903–1925",
      orientacao: "Esquerda revolucionária",
      espectro: "esquerda-radical",
      historico: true,
      resumo:
        "Fração bolchevique do POSDR liderada por Lênin, defensora de um partido disciplinado de vanguarda e da revolução socialista. Tomou o poder na Rússia em 1917.",
      vetor: [15, 10, 85, 30, 55, 10, 95, 98, 95, 98, 75, 80],
      marcos: [
        "Cisão com os mencheviques em 1903.",
        "Revolução de Outubro de 1917.",
        "Base para o Partido Comunista da União Soviética."
      ],
      ideologia: "marxismo-leninismo"
    },
    {
      id: "partido-comunista-da-uniao-sovietica",
      nome: "Partido Comunista da União Soviética",
      sigla: "PCUS",
      paisId: "uniao-sovietica",
      regiao: "Eurásia",
      periodo: "1925–1991",
      orientacao: "Partido único",
      espectro: "esquerda-radical",
      historico: true,
      resumo:
        "Partido único da União Soviética, responsável pela direção do Estado, da economia planificada e do aparato repressivo. Entrou em crise e foi suspenso após o golpe fracassado de 1991.",
      vetor: [10, 5, 92, 20, 45, 8, 96, 100, 100, 100, 25, 85],
      marcos: [
        "Consolidação sob Stalin.",
        "Direção da URSS durante a Guerra Fria.",
        "Suspensão em 1991."
      ],
      ideologia: "marxismo-leninismo"
    },
    {
      id: "partido-nazista",
      nome: "Partido Nacional-Socialista dos Trabalhadores Alemães",
      sigla: "NSDAP",
      paisId: "alemanha-nazista",
      regiao: "Europa",
      periodo: "1920–1945",
      orientacao: "Nazismo",
      espectro: "extrema-direita",
      historico: true,
      resumo:
        "Partido totalitário liderado por Adolf Hitler, base do regime nazista. Combinava racismo biológico, antissemitismo, ultranacionalismo, propaganda e violência de massa.",
      vetor: [15, 2, 98, 5, 90, 5, 40, 75, 60, 15, 2, 72],
      marcos: [
        "Fundação em 1920.",
        "Putsch da Cervejaria em 1923.",
        "Chegada ao poder em 1933 e Holocausto."
      ],
      ideologia: "nazismo"
    },
    {
      id: "falange",
      nome: "Falange Espanhola",
      sigla: "FE",
      paisId: "espanha-franquista",
      regiao: "Europa",
      periodo: "1933–1977",
      orientacao: "Fascismo espanhol",
      espectro: "terceira-posicao",
      historico: true,
      resumo:
        "Movimento nacional-sindicalista fundado por José Antonio Primo de Rivera. Foi incorporado ao regime franquista, perdendo autonomia política.",
      vetor: [25, 8, 92, 10, 65, 5, 55, 70, 75, 8, 5, 55],
      marcos: [
        "Fundação em 1933.",
        "Fusão com os carlistas em 1937.",
        "Papel subordinado no regime franquista."
      ],
      ideologia: "nacional-sindicalismo"
    },
    {
      id: "uniao-nacional-portuguesa",
      nome: "União Nacional",
      sigla: "UN",
      paisId: "portugal-salazarista",
      regiao: "Europa",
      periodo: "1930–1974",
      orientacao: "Partido único",
      espectro: "terceira-posicao",
      historico: true,
      resumo:
        "Partido único do Estado Novo português, criado para sustentar Salazar e o regime corporativo. Não era um partido de massas competitivo, mas um instrumento de controle político.",
      vetor: [25, 5, 88, 10, 40, 5, 55, 65, 82, 3, 3, 45],
      marcos: [
        "Criação em 1930.",
        "Sustentação do Estado Novo.",
        "Extinção após a Revolução dos Cravos."
      ],
      ideologia: "salazarismo"
    },
    {
      id: "fidesz",
      nome: "Fidesz – União Cívica Húngara",
      sigla: "Fidesz",
      paisId: "hungria",
      regiao: "Europa",
      periodo: "1988–hoje",
      orientacao: "Direita nacional-conservadora",
      espectro: "direita",
      historico: false,
      resumo:
        "Partido fundado por jovens liberais em 1988 e transformado, a partir dos anos 1990, em uma força nacional-conservadora. Sob Viktor Orbán, combinou defesa da família tradicional, soberania nacional, críticas à integração europeia e reformas institucionais controversas.",
      vetor: [55, 55, 78, 25, 55, 20, 32, 28, 55, 25, 20, 55],
      marcos: [
        "Fundação em 1988, ainda como movimento liberal.",
        "Vitória eleitoral em 2010 e governo de Viktor Orbán.",
        "Confrontos com a União Europeia sobre Estado de direito."
      ],
      ideologia: "nacionalismo-civico"
    }
  ];

  globalThis.AtlasData = globalThis.AtlasData || {};
  globalThis.AtlasData.partidos = partidos;
})();
