const switchInput = document.getElementById("theme-switch");
const themeLabel = document.getElementById("theme-label");
const savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", savedTheme);
if (switchInput) switchInput.checked = savedTheme === "dark";

if (switchInput) {
  switchInput.addEventListener("change", event => {
    const theme = event.target.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

const periods = [
  {
    id: "colonial",
    era: "Colônia",
    label: "Brasil Colonial",
    years: "1500–1808",
    description: "Período em que o território brasileiro esteve integrado ao Império Português, marcado pela colonização, exploração econômica, escravização e formação de estruturas administrativas e sociais que influenciaram o Brasil posterior.",
    context: "A administração passou por diferentes formas e autoridades ao longo dos séculos. Não existia uma Presidência da República nem um Estado brasileiro independente.",
    leaders: [
      { name: "Governadores-gerais e vice-reis", years: "1549–1808", role: "Administração colonial", achievements: ["Centralização progressiva da administração portuguesa na colônia", "Formação de instituições administrativas e jurídicas"], controversies: ["Escravização de indígenas e africanos", "Concentração fundiária e exploração econômica colonial"] }
    ],
    events: ["Criação do Governo-Geral (1549)", "União Ibérica (1580–1640)", "Inconfidência Mineira (1789)", "Chegada da corte portuguesa ao Brasil (1808)"]
  },
  {
    id: "joanino",
    era: "Império",
    label: "Período Joanino e Reino Unido",
    years: "1808–1822",
    description: "A transferência da corte portuguesa para o Rio de Janeiro alterou profundamente a estrutura política e econômica do território. Em 1815, o Brasil foi elevado a Reino e integrado ao Reino Unido de Portugal, Brasil e Algarves.",
    context: "D. João governou como príncipe regente e depois como rei. Em 1821, retornou a Portugal e deixou D. Pedro como príncipe regente no Brasil.",
    leaders: [
      { name: "D. João VI", years: "1808–1821 no Brasil", role: "Príncipe regente e rei", achievements: ["Abertura dos portos em 1808", "Criação e transferência de instituições administrativas para o Rio de Janeiro", "Elevação do Brasil a Reino em 1815"], controversies: ["Manutenção da escravidão", "Custos e privilégios associados à corte e à estrutura colonial"] },
      { name: "D. Pedro de Alcântara", years: "1821–1822", role: "Príncipe regente do Brasil", achievements: ["Permanência no Brasil diante das pressões das Cortes portuguesas", "Condução do processo político que antecedeu a Independência"], controversies: ["Conflitos políticos com as Cortes de Lisboa", "Centralização do poder no processo de ruptura"] }
    ],
    events: ["Abertura dos portos (1808)", "Criação do Banco do Brasil (1808)", "Revolução Pernambucana (1817)", "Independência do Brasil (1822)"]
  },
  {
    id: "primeiro-reinado",
    era: "Império",
    label: "Primeiro Reinado",
    years: "1822–1831",
    description: "Período do governo de D. Pedro I após a Independência, marcado pela organização do novo Estado, pela Constituição de 1824 e por conflitos políticos e regionais.",
    context: "A monarquia constitucional brasileira foi organizada após a ruptura com Portugal. O Poder Moderador tornou-se uma característica central da Constituição de 1824.",
    leaders: [
      { name: "D. Pedro I", years: "1822–1831", role: "Imperador do Brasil", achievements: ["Condução da independência e organização inicial do Estado brasileiro", "Outorga da Constituição de 1824", "Reconhecimento internacional gradual da independência"], controversies: ["Dissolução da Assembleia Constituinte em 1823", "Confederação do Equador e conflitos políticos", "Guerra da Cisplatina e crise política"] }
    ],
    events: ["Independência (1822)", "Constituição de 1824", "Confederação do Equador (1824)", "Abdicação de D. Pedro I (1831)"]
  },
  {
    id: "regencias",
    era: "Império",
    label: "Período Regencial",
    years: "1831–1840",
    description: "Período entre a abdicação de D. Pedro I e a antecipação da maioridade de D. Pedro II, caracterizado por intensa disputa entre projetos de organização do Estado e numerosas revoltas.",
    context: "O país foi governado por regentes em nome do imperador menor de idade.",
    leaders: [
      { name: "Regência Trina e Regências Unas", years: "1831–1840", role: "Governo regencial", achievements: ["Ato Adicional de 1834", "Maior autonomia provincial em parte do período", "Experiências institucionais de descentralização"], controversies: ["Cabanagem", "Farroupilha", "Sabinada", "Balaiada", "Instabilidade política e conflitos entre centralização e autonomia"] }
    ],
    events: ["Ato Adicional (1834)", "Cabanagem (1835–1840)", "Revolução Farroupilha (1835–1845)", "Golpe da Maioridade (1840)"]
  },
  {
    id: "segundo-reinado",
    era: "Império",
    label: "Segundo Reinado",
    years: "1840–1889",
    description: "Longo período de governo de D. Pedro II, com consolidação institucional, expansão da economia cafeeira, imigração, conflitos externos e transformações que culminaram na abolição da escravidão e na queda da monarquia.",
    context: "O sistema político funcionava sob uma monarquia constitucional. O período também foi marcado pela continuidade da escravidão até 1888.",
    leaders: [
      { name: "D. Pedro II", years: "1840–1889", role: "Imperador do Brasil", achievements: ["Expansão de ferrovias, telégrafos e instituições culturais", "Estabilidade institucional prolongada em comparação com o período regencial", "Abolição da escravidão em 1888"], controversies: ["Manutenção da escravidão durante grande parte do reinado", "Guerra do Paraguai e seus altos custos humanos e materiais", "Conflitos com setores militares, religiosos e escravistas no fim do Império"] }
    ],
    events: ["Parlamentarismo do Segundo Reinado", "Guerra do Paraguai (1864–1870)", "Lei do Ventre Livre (1871)", "Lei Áurea (1888)", "Proclamação da República (1889)"]
  },
  {
    id: "primeira-republica",
    era: "República",
    label: "Primeira República",
    years: "1889–1930",
    description: "Primeira fase republicana, iniciada com a queda da monarquia. Foi marcada pelo predomínio das oligarquias estaduais, federalismo, política dos governadores e diferentes conflitos sociais e políticos.",
    context: "A Constituição de 1891 estabeleceu o regime republicano presidencialista e federalista.",
    leaders: [
      { name: "Deodoro da Fonseca", years: "1889–1891", role: "Chefe do Governo Provisório e presidente", achievements: ["Implantação das instituições republicanas", "Promulgação da Constituição de 1891 durante a transição"], controversies: ["Fechamento do Congresso em 1891", "Crise política que levou à renúncia"] },
      { name: "Floriano Peixoto", years: "1891–1894", role: "Presidente", achievements: ["Consolidação inicial do novo regime republicano", "Enfrentamento das revoltas que ameaçavam a continuidade do governo"], controversies: ["Uso de medidas de força contra adversários", "Revolta da Armada e Revolução Federalista"] },
      { name: "Prudente de Morais", years: "1894–1898", role: "Presidente", achievements: ["Primeiro presidente civil eleito pela Constituição republicana", "Transição do predomínio militar para governos civis"], controversies: ["Guerra de Canudos", "Conflitos políticos e atentado de 1897"] },
      { name: "Campos Sales", years: "1898–1902", role: "Presidente", achievements: ["Política de estabilização das finanças públicas", "Acordo político conhecido como política dos governadores"], controversies: ["Políticas econômicas com forte impacto social", "Restrição da competição política por meio de mecanismos oligárquicos"] },
      { name: "Rodrigues Alves", years: "1902–1906", role: "Presidente", achievements: ["Reformas urbanas e sanitárias no Rio de Janeiro", "Campanhas de saneamento e modernização urbana"], controversies: ["Revolta da Vacina em meio às reformas urbanas e sanitárias", "Desapropriações e remoções associadas às reformas"] },
      { name: "Afonso Pena", years: "1906–1909", role: "Presidente", achievements: ["Investimentos em infraestrutura e expansão ferroviária", "Incentivo à imigração e desenvolvimento econômico"], controversies: ["Conflitos políticos internos da sucessão presidencial"] },
      { name: "Nilo Peçanha", years: "1909–1910", role: "Presidente", achievements: ["Criação das Escolas de Aprendizes Artífices", "Continuidade de políticas de infraestrutura"], controversies: ["Disputas políticas da sucessão e crise eleitoral"] },
      { name: "Hermes da Fonseca", years: "1910–1914", role: "Presidente", achievements: ["Reformas e reorganização de setores militares e administrativos"], controversies: ["Política das salvações", "Revolta da Chibata e repressão aos revoltosos"] },
      { name: "Venceslau Brás", years: "1914–1918", role: "Presidente", achievements: ["Administração durante a Primeira Guerra Mundial", "Industrialização ganhou impulso durante a guerra"], controversies: ["Greves e conflitos trabalhistas", "Repressão a movimentos sociais"] },
      { name: "Delfim Moreira", years: "1918–1919", role: "Presidente interino", achievements: ["Condução da transição após a morte de Rodrigues Alves"], controversies: ["Instabilidade política e doença do presidente eleito"] },
      { name: "Epitácio Pessoa", years: "1919–1922", role: "Presidente", achievements: ["Investimentos em obras contra secas e infraestrutura", "Participação na reorganização internacional do pós-guerra"], controversies: ["Conflitos com setores militares", "Revoltas tenentistas de 1922"] },
      { name: "Artur Bernardes", years: "1922–1926", role: "Presidente", achievements: ["Reformas administrativas e econômicas em período de forte instabilidade"], controversies: ["Estado de sítio durante grande parte do mandato", "Revoltas tenentistas"] },
      { name: "Washington Luís", years: "1926–1930", role: "Presidente", achievements: ["Investimentos em rodovias", "Políticas de modernização da infraestrutura"], controversies: ["Crise econômica de 1929", "Ruptura política que antecedeu a Revolução de 1930"] }
    ],
    events: ["Constituição de 1891", "Guerra de Canudos (1896–1897)", "Revolta da Vacina (1904)", "Semana de Arte Moderna (1922)", "Revolução de 1930"]
  },
  {
    id: "vargas",
    era: "República",
    label: "Era Vargas",
    years: "1930–1945",
    description: "Período iniciado com a Revolução de 1930 e marcado por forte centralização política, criação de instituições trabalhistas e pelo Estado Novo, regime autoritário instalado em 1937.",
    context: "Getúlio Vargas governou primeiro como chefe do Governo Provisório, depois como presidente constitucional e, a partir de 1937, como chefe do Estado Novo.",
    leaders: [
      { name: "Getúlio Vargas", years: "1930–1945", role: "Chefe do Governo Provisório, presidente e chefe do Estado Novo", achievements: ["Criação e consolidação de legislação trabalhista", "Criação de instituições econômicas e administrativas", "Industrialização e fortalecimento do Estado nacional"], controversies: ["Fechamento do Congresso e suspensão de direitos no Estado Novo", "Censura e repressão política", "Perseguição a opositores"] }
    ],
    events: ["Revolução de 1930", "Constituição de 1934", "Estado Novo (1937)", "CLT (1943)", "Entrada do Brasil na Segunda Guerra Mundial"]
  },
  {
    id: "republica-1946",
    era: "República",
    label: "República de 1946",
    years: "1946–1964",
    description: "Período democrático iniciado após a queda do Estado Novo, com eleições, pluralismo partidário e sucessivas crises políticas até a ruptura institucional de 1964.",
    context: "A Constituição de 1946 reorganizou as instituições democráticas. O período incluiu governos de diferentes orientações e crises políticas.",
    leaders: [
      { name: "José Linhares", years: "1945–1946", role: "Presidente interino", achievements: ["Condução da transição para eleições e nova ordem constitucional"], controversies: ["Governo de transição em contexto de forte disputa política"] },
      { name: "Eurico Gaspar Dutra", years: "1946–1951", role: "Presidente", achievements: ["Promulgação e implementação da Constituição de 1946", "Reorganização institucional do pós-Estado Novo"], controversies: ["Proibição do PCB e cassação de seus mandatos", "Política econômica com problemas de inflação e reservas externas"] },
      { name: "Getúlio Vargas", years: "1951–1954", role: "Presidente eleito", achievements: ["Criação da Petrobras", "Políticas de desenvolvimento e nacionalismo econômico"], controversies: ["Crise política de 1954", "Conflitos entre governo, oposição e imprensa"] },
      { name: "Café Filho", years: "1954–1955", role: "Presidente", achievements: ["Transição após a morte de Vargas", "Organização do processo eleitoral de 1955"], controversies: ["Crise política envolvendo a sucessão presidencial"] },
      { name: "Carlos Luz", years: "1955", role: "Presidente interino", achievements: ["Exercício da Presidência durante a crise sucessória de 1955"], controversies: ["Deposto pelo movimento militar liderado pelo general Lott"] },
      { name: "Nereu Ramos", years: "1955–1956", role: "Presidente interino", achievements: ["Garantia da transição para a posse de Juscelino Kubitschek"], controversies: ["Governo marcado pela crise institucional de 1955"] },
      { name: "Juscelino Kubitschek", years: "1956–1961", role: "Presidente", achievements: ["Plano de Metas", "Construção e inauguração de Brasília", "Expansão da indústria e infraestrutura"], controversies: ["Aumento da inflação e da dívida pública", "Desigualdades regionais e críticas ao modelo de desenvolvimento"] },
      { name: "Jânio Quadros", years: "1961", role: "Presidente", achievements: ["Política externa independente em alguns temas", "Medidas de austeridade e reformas administrativas"], controversies: ["Renúncia após poucos meses", "Crise política que antecedeu a posse de João Goulart"] },
      { name: "João Goulart", years: "1961–1964", role: "Presidente", achievements: ["Propostas de reformas de base", "Ampliação do debate sobre direitos sociais e reforma agrária"], controversies: ["Polarização política e crise econômica", "Ruptura institucional de 1964"] }
    ],
    events: ["Constituição de 1946", "Criação da Petrobras (1953)", "Plano de Metas", "Construção de Brasília", "Renúncia de Jânio Quadros", "Golpe de 1964"]
  },
  {
    id: "regime-militar",
    era: "República",
    label: "Regime Militar",
    years: "1964–1985",
    description: "Período de governo autoritário instaurado após a deposição de João Goulart, marcado por suspensão de direitos políticos, censura, repressão, crescimento econômico em determinados anos e posterior crise econômica e abertura política.",
    context: "O Poder Executivo foi exercido por militares escolhidos indiretamente pelo Congresso em diferentes momentos. Em 1969, uma junta militar governou durante a doença de Costa e Silva.",
    leaders: [
      { name: "Ranieri Mazzilli", years: "1964", role: "Presidente interino", achievements: ["Exercício formal da Presidência durante a transição de abril de 1964"], controversies: ["Governo inserido na ruptura institucional que depôs João Goulart"] },
      { name: "Humberto Castelo Branco", years: "1964–1967", role: "Presidente", achievements: ["Reformas administrativas e econômicas", "Criação de mecanismos institucionais para reorganização fiscal"], controversies: ["Atos Institucionais e cassações", "Restrição de direitos políticos"] },
      { name: "Artur da Costa e Silva", years: "1967–1969", role: "Presidente", achievements: ["Políticas de desenvolvimento econômico", "Início do período de forte expansão econômica que seria associado ao milagre econômico"], controversies: ["AI-5 em 1968", "Ampliação da censura e repressão política"] },
      { name: "Junta Militar", years: "1969", role: "Governo provisório", achievements: ["Condução da transição durante o afastamento de Costa e Silva"], controversies: ["Manutenção e aprofundamento de medidas autoritárias"] },
      { name: "Emílio Garrastazu Médici", years: "1969–1974", role: "Presidente", achievements: ["Forte crescimento econômico em parte do mandato", "Grandes projetos de infraestrutura"], controversies: ["Intensificação da repressão política", "Censura e graves violações de direitos humanos"] },
      { name: "Ernesto Geisel", years: "1974–1979", role: "Presidente", achievements: ["Início da abertura política gradual", "Investimentos em energia e infraestrutura"], controversies: ["Continuidade da repressão durante parte do governo", "Crise econômica e aumento da dívida externa"] },
      { name: "João Figueiredo", years: "1979–1985", role: "Presidente", achievements: ["Lei da Anistia", "Continuidade da abertura política", "Transição para o governo civil"], controversies: ["Inflação, recessão e crise da dívida", "Persistência de estruturas autoritárias"] }
    ],
    events: ["AI-5 (1968)", "Milagre Econômico", "Anistia (1979)", "Diretas Já (1983–1984)", "Fim do regime militar (1985)"]
  },
  {
    id: "nova-republica",
    era: "República",
    label: "Nova República",
    years: "1985–atualidade",
    description: "Período iniciado com a transição para o governo civil e marcado pela Constituição de 1988, consolidação democrática, crises econômicas e políticas e alternância de diferentes projetos de governo.",
    context: "A Constituição de 1988 reorganizou o Estado democrático de direito e permanece como marco institucional da República contemporânea.",
    leaders: [
      { name: "José Sarney", years: "1985–1990", role: "Presidente", achievements: ["Condução do governo civil de transição", "Convocação e conclusão da Assembleia Nacional Constituinte", "Promulgação da Constituição de 1988"], controversies: ["Hiperinflação e planos econômicos", "Crise fiscal e econômica"] },
      { name: "Fernando Collor", years: "1990–1992", role: "Presidente", achievements: ["Abertura comercial e medidas de desestatização", "Tentativas de estabilização econômica"], controversies: ["Confisco da poupança", "Crise política e processo de impeachment"] },
      { name: "Itamar Franco", years: "1992–1995", role: "Presidente", achievements: ["Plano Real", "Estabilização monetária a partir de 1994"], controversies: ["Instabilidade ministerial e disputas políticas durante a transição"] },
      { name: "Fernando Henrique Cardoso", years: "1995–2003", role: "Presidente", achievements: ["Continuidade da estabilidade monetária", "Reformas administrativas e privatizações", "Expansão de programas sociais federais"], controversies: ["Crises cambiais e aumento da dívida pública", "Debates sobre privatizações e política econômica"] },
      { name: "Luiz Inácio Lula da Silva", years: "2003–2011", role: "Presidente", achievements: ["Expansão de políticas de transferência de renda", "Crescimento econômico e redução de indicadores de pobreza em parte do período", "Ampliação do acesso ao ensino superior"], controversies: ["Escândalo do mensalão", "Casos de corrupção envolvendo integrantes e aliados do governo"] },
      { name: "Dilma Rousseff", years: "2011–2016", role: "Presidenta", achievements: ["Expansão de programas sociais e de infraestrutura", "Políticas de ampliação do acesso à educação e moradia"], controversies: ["Recessão e crise fiscal", "Operação Lava Jato e crise política", "Impeachment em 2016"] },
      { name: "Michel Temer", years: "2016–2019", role: "Presidente", achievements: ["Reforma trabalhista", "Teto de gastos instituído pela Emenda Constitucional 95", "Medidas de ajuste fiscal"], controversies: ["Baixa popularidade", "Denúncias e investigações envolvendo integrantes do governo", "Controvérsias sobre reformas e austeridade"] },
      { name: "Jair Bolsonaro", years: "2019–2023", role: "Presidente", achievements: ["Reforma da Previdência", "Marco legal de alguns setores de infraestrutura", "Auxílio emergencial durante a pandemia"], controversies: ["Condução e conflitos políticos durante a pandemia de COVID-19", "Conflitos institucionais e questionamentos sobre o processo eleitoral"] },
      { name: "Luiz Inácio Lula da Silva", years: "2023–atualidade", role: "Presidente", achievements: ["Retomada e criação de programas e políticas federais", "Reforma tributária aprovada durante o mandato", "Atuação internacional em fóruns multilaterais"], controversies: ["Debates sobre política fiscal e gastos públicos", "Conflitos políticos e divergências sobre prioridades econômicas e sociais"] }
    ],
    events: ["Constituição de 1988", "Plano Real (1994)", "Impeachment de Fernando Collor (1992)", "Impeachment de Dilma Rousseff (2016)", "Pandemia de COVID-19", "Eleição presidencial de 2022"]
  }
];


const periodNarratives = {
  "colonial": {
    "lead": "Entre 1500 e 1808, o território que hoje corresponde ao Brasil foi integrado ao Império Português e passou por profundas transformações políticas, econômicas, demográficas e culturais. Não foi um período de um único governo: a administração mudou ao longo dos séculos e conviveu com povos indígenas, africanos escravizados, colonos, religiosos, comerciantes e autoridades da Coroa.",
    "sections": [
      [
        "A chegada portuguesa e os primeiros anos",
        "A expedição comandada por Pedro Álvares Cabral chegou à costa em abril de 1500. Nas décadas seguintes, a Coroa portuguesa combinou exploração do pau-brasil, presença militar e expedições de reconhecimento com esforços de ocupação. A partir de 1530, a política portuguesa passou a priorizar a colonização permanente. Em 1534, foram instituídas as capitanias hereditárias, e em 1549 Tomé de Sousa chegou como primeiro governador-geral, estabelecendo Salvador como centro da administração do Estado do Brasil."
      ],
      [
        "Economia, sociedade e escravidão",
        "A economia colonial foi organizada em torno de atividades voltadas ao comércio atlântico, inicialmente com o pau-brasil e depois sobretudo com a produção açucareira. Engenhos, grandes propriedades e trabalho compulsório formaram parte importante da estrutura econômica. A escravização de indígenas ocorreu desde os primeiros tempos e, progressivamente, a escravização de africanos tornou-se central. A sociedade colonial também foi marcada pela ação de ordens religiosas, pela formação de núcleos urbanos e por relações complexas entre portugueses, indígenas e africanos."
      ],
      [
        "Expansão territorial e conflitos",
        "A ocupação ultrapassou gradualmente os limites inicialmente definidos pelo Tratado de Tordesilhas. Entradas, bandeiras, missões religiosas, criação de gado e atividades econômicas no interior contribuíram para a expansão territorial. A presença portuguesa também provocou guerras e resistências indígenas. No litoral e em outras áreas ocorreram disputas com franceses e holandeses; a ocupação holandesa no Nordeste entre 1630 e 1654 foi um dos principais conflitos do período."
      ],
      [
        "Mineração, reformas e crise do sistema colonial",
        "No final do século XVII e durante o XVIII, a descoberta de ouro e diamantes deslocou parte do dinamismo econômico para o interior. A Coroa criou mecanismos de fiscalização e cobrança de tributos, enquanto vilas mineradoras cresceram. No século XVIII, as reformas pombalinas procuraram aumentar o controle da Coroa, reorganizar a administração e reduzir a autonomia de instituições religiosas, incluindo a expulsão dos jesuítas em 1759. Conflitos como a Inconfidência Mineira, em 1789, expressaram tensões entre grupos locais e o poder metropolitano. Em 1808, a chegada da corte portuguesa encerrou esta fase e iniciou uma transformação institucional decisiva."
      ]
    ]
  },
  "joanino": {
    "lead": "A chegada da família real portuguesa em 1808 transformou o Rio de Janeiro em centro do Império Português e acelerou a formação de instituições que depois seriam aproveitadas pelo Estado brasileiro. O período também foi marcado pela continuidade da escravidão, pela guerra e por conflitos entre interesses portugueses e americanos.",
    "sections": [
      [
        "A transferência da corte",
        "A invasão napoleônica de Portugal levou a corte portuguesa a transferir-se para o Brasil. D. João chegou em 1808 e instalou no Rio de Janeiro órgãos da administração central. A abertura dos portos às nações amigas rompeu parte das restrições comerciais do antigo pacto colonial e aproximou a economia brasileira do comércio internacional."
      ],
      [
        "Construção de um centro de governo",
        "Foram criados ou reorganizados órgãos administrativos, militares, judiciais, financeiros e culturais. O Banco do Brasil, a Imprensa Régia e instituições de ensino foram instalados ou reorganizados. A Biblioteca Real também chegou ao Brasil com a corte. O Rio de Janeiro passou a concentrar decisões que antes eram tomadas em Lisboa."
      ],
      [
        "Brasil elevado a Reino",
        "Em 1815, o Brasil foi elevado à condição de Reino e passou a integrar o Reino Unido de Portugal, Brasil e Algarves. Em 1817, a Revolução Pernambucana contestou o governo e foi reprimida. Em 1820, a Revolução Liberal do Porto exigiu o retorno do rei e a reorganização constitucional da monarquia."
      ],
      [
        "Da volta de D. João à Independência",
        "D. João VI retornou a Portugal em 1821 e deixou D. Pedro como príncipe regente. As Cortes portuguesas passaram a exigir o retorno de D. Pedro, mas ele permaneceu no Brasil. O conflito político evoluiu para a ruptura de 1822. A Independência não eliminou imediatamente estruturas herdadas do período colonial, entre elas a escravidão e a concentração fundiária."
      ]
    ]
  },
  "primeiro-reinado": {
    "lead": "Após a Independência, o novo Império precisou construir instituições nacionais, definir a relação entre Executivo, Legislativo e províncias e obter reconhecimento externo. O governo de D. Pedro I foi curto e marcado por disputas sobre centralização, representação política e organização territorial.",
    "sections": [
      [
        "Independência e organização do Estado",
        "A separação de Portugal foi declarada em 1822 e consolidada militarmente nos anos seguintes. D. Pedro I tornou-se imperador e o novo Estado precisou organizar arrecadação, forças armadas, justiça e administração. A Assembleia Constituinte de 1823 entrou em conflito com o imperador e foi dissolvida."
      ],
      [
        "Constituição de 1824",
        "A Constituição foi outorgada em 1824. Criou quatro poderes — Executivo, Legislativo, Judiciário e Moderador — e estabeleceu uma monarquia constitucional centralizada. O sistema eleitoral era indireto e baseado em critérios censitários. A Carta permaneceu como fundamento institucional do Império durante grande parte do século XIX."
      ],
      [
        "Conflitos internos e externos",
        "A Confederação do Equador, movimento ocorrido principalmente em Pernambuco e outras províncias do Nordeste em 1824, contestou a centralização imperial e foi reprimida. Externamente, o Império enfrentou a Guerra da Cisplatina, que terminou com a independência da região que se tornou o Uruguai. O conflito contribuiu para dificuldades financeiras e desgaste político."
      ],
      [
        "Abdicação",
        "A oposição política cresceu e D. Pedro I enfrentou conflitos com grupos liberais, jornais e setores das elites provinciais. Após uma sequência de crises, abdicou em favor de seu filho em 1831. Como D. Pedro II era menor de idade, iniciou-se o período regencial."
      ]
    ]
  },
  "regencias": {
    "lead": "De 1831 a 1840, o Brasil foi governado em nome de D. Pedro II, que ainda era menor. Foi uma fase de experimentação institucional e intensa disputa entre projetos centralizadores e descentralizadores, acompanhada por revoltas em várias regiões.",
    "sections": [
      [
        "A regência e a disputa pelo poder",
        "Após a abdicação de D. Pedro I, uma Regência Trina Provisória foi substituída por uma Regência Trina Permanente. Em seguida, o Ato Adicional de 1834 alterou a organização política, ampliando a autonomia provincial e criando assembleias legislativas provinciais. Diogo Antônio Feijó e depois Pedro de Araújo Lima exerceram a Regência Una."
      ],
      [
        "As revoltas provinciais",
        "A Cabanagem, no Grão-Pará, a Farroupilha, no Rio Grande do Sul, a Sabinada, na Bahia, e a Balaiada, no Maranhão e Piauí, tiveram causas e composições distintas. Em comum, demonstraram a dificuldade de conciliar interesses locais, autoridade imperial e condições sociais muito desiguais. Algumas mobilizações envolveram elites regionais; outras tiveram forte participação popular e foram reprimidas militarmente."
      ],
      [
        "Centralização e Maioridade",
        "A instabilidade alimentou o debate sobre a necessidade de fortalecer o poder central. Em 1840, setores políticos anteciparam a maioridade de D. Pedro II, então com 14 anos. O chamado Golpe da Maioridade encerrou a Regência e iniciou o Segundo Reinado."
      ]
    ]
  },
  "segundo-reinado": {
    "lead": "O Segundo Reinado foi o período mais longo da monarquia brasileira. Houve expansão da economia cafeeira, construção de ferrovias e telégrafos, crescimento urbano e fortalecimento de instituições, mas a escravidão permaneceu como base importante da economia até 1888. O Império também enfrentou uma grande guerra e conflitos que contribuíram para sua crise final.",
    "sections": [
      [
        "Consolidação do Império",
        "D. Pedro II assumiu o governo em 1840. O sistema político combinava monarquia constitucional, Parlamento e alternância de gabinetes. Liberais e conservadores disputavam o governo dentro de um sistema eleitoral restrito. A centralização do Estado aumentou em relação ao período regencial."
      ],
      [
        "Café, ferrovias e transformação econômica",
        "A produção de café se expandiu pelo Vale do Paraíba e, depois, pelo oeste paulista. Ferrovias foram construídas para escoar a produção, enquanto portos e cidades cresceram. A imigração europeia aumentou, especialmente no Sudeste, e novas formas de trabalho ganharam espaço nas áreas cafeeiras, embora a escravidão continuasse relevante até a abolição."
      ],
      [
        "Escravidão e processo abolicionista",
        "A Lei Eusébio de Queirós, de 1850, reprimiu o tráfico transatlântico de africanos escravizados. Nas décadas seguintes vieram a Lei do Ventre Livre, em 1871, e a Lei dos Sexagenários, em 1885. Movimentos abolicionistas, fugas, quilombos e pressão política contribuíram para a crise do sistema escravista. Em 13 de maio de 1888, a Lei Áurea extinguiu juridicamente a escravidão, sem estabelecer políticas de integração social e econômica para a população liberta."
      ],
      [
        "Guerra do Paraguai e crise da monarquia",
        "A Guerra do Paraguai, entre 1864 e 1870, mobilizou grande parte das forças brasileiras e produziu elevados custos humanos e materiais. No final do Império cresceram conflitos entre governo e setores militares, Igreja e grupos republicanos. A monarquia perdeu apoio entre parcelas das elites e dos militares, e a República foi proclamada em 15 de novembro de 1889."
      ]
    ]
  },
  "primeira-republica": {
    "lead": "A Primeira República começou com a derrubada da monarquia e a criação de uma federação presidencialista. O período combinou eleições e instituições republicanas com forte poder das oligarquias estaduais, restrições à participação política e conflitos sociais que atravessaram diferentes regiões do país.",
    "sections": [
      [
        "Criação da República",
        "O Governo Provisório de Deodoro da Fonseca reorganizou o Estado e convocou uma Assembleia Constituinte. A Constituição de 1891 estabeleceu a República federativa e presidencialista, separou Igreja e Estado e instituiu o voto direto para determinados cargos, embora a participação política permanecesse limitada, entre outros fatores, pela exclusão dos analfabetos."
      ],
      [
        "Oligarquias e política dos governadores",
        "Ao longo da Primeira República, São Paulo e Minas Gerais tiveram grande peso na política nacional, embora outros estados também exercessem influência. A chamada política dos governadores articulava o governo federal com elites estaduais. O coronelismo, o controle local do voto e fraudes eleitorais eram características de partes do sistema político."
      ],
      [
        "Conflitos sociais",
        "O período foi marcado por Canudos, Contestado, Revolta da Vacina, Revolta da Chibata, greves operárias e movimentos tenentistas. Esses episódios tiveram causas diferentes, envolvendo desigualdade social, condições de trabalho, conflitos fundiários, políticas públicas e disputas dentro das Forças Armadas."
      ],
      [
        "Crise e Revolução de 1930",
        "A crise econômica mundial iniciada em 1929 atingiu fortemente a economia cafeeira. A sucessão presidencial agravou a ruptura entre grupos políticos. A Revolução de 1930 depôs Washington Luís e impediu a posse de Júlio Prestes, levando Getúlio Vargas ao poder e encerrando a Primeira República."
      ]
    ]
  },
  "vargas": {
    "lead": "De 1930 a 1945, Getúlio Vargas comandou diferentes formas de governo. O período começou com um governo provisório, passou por uma fase constitucional e terminou no Estado Novo, regime autoritário. Ao mesmo tempo, o Estado ampliou sua presença na economia e nas relações de trabalho.",
    "sections": [
      [
        "1930 e a centralização do Estado",
        "Vargas assumiu após a Revolução de 1930 e dissolveu o Congresso e as assembleias estaduais. Interventores foram nomeados nos estados e o governo federal ampliou seu controle administrativo. A Revolução Constitucionalista de 1932 pressionou pela convocação de uma Constituinte."
      ],
      [
        "Constituição de 1934",
        "A Constituição de 1934 ampliou direitos sociais e instituiu mudanças eleitorais, incluindo o voto feminino. Vargas foi eleito indiretamente pela Assembleia Constituinte. A disputa entre grupos políticos de esquerda e direita se intensificou nos anos seguintes."
      ],
      [
        "Estado Novo",
        "Em 1937, Vargas fechou o Congresso e outorgou uma nova Constituição, iniciando o Estado Novo. O regime concentrou poderes no Executivo, restringiu liberdades políticas, utilizou censura e reprimiu opositores. O Departamento de Imprensa e Propaganda atuou no controle e divulgação da comunicação oficial."
      ],
      [
        "Trabalho, indústria e guerra",
        "O governo criou instituições econômicas e trabalhistas e consolidou normas que culminaram na CLT de 1943. Também promoveu projetos de industrialização e empresas estatais. Durante a Segunda Guerra Mundial, o Brasil rompeu com o Eixo e enviou a Força Expedicionária Brasileira à Itália. Em 1945, Vargas foi deposto."
      ]
    ]
  },
  "republica-1946": {
    "lead": "A queda do Estado Novo abriu um período de eleições e reorganização constitucional. Entre 1945 e 1964, o país passou por governos civis, mudanças econômicas, crescimento industrial e crises políticas sucessivas que culminaram na ruptura institucional de 1964.",
    "sections": [
      [
        "Redemocratização e Constituição de 1946",
        "José Linhares presidiu a transição após a deposição de Vargas. A Constituição de 1946 restabeleceu instituições democráticas, separação de poderes e eleições. Eurico Gaspar Dutra venceu a eleição presidencial de 1945 e governou até 1951. O período também registrou a cassação dos mandatos de parlamentares comunistas e a ilegalidade do PCB."
      ],
      [
        "O retorno de Vargas e a Petrobras",
        "Vargas voltou ao poder por eleição direta em 1951. Seu governo combinou nacionalismo econômico, políticas trabalhistas e desenvolvimento. Em 1953 foi criada a Petrobras. A crise política de 1954 terminou com o suicídio de Vargas em agosto daquele ano."
      ],
      [
        "JK e a industrialização",
        "Juscelino Kubitschek governou de 1956 a 1961 com o Plano de Metas, buscando acelerar investimentos em energia, transporte, indústria e alimentação. Brasília foi inaugurada em 1960. O crescimento foi acompanhado por inflação, expansão do endividamento e debates sobre desigualdades regionais e custos do modelo de desenvolvimento."
      ],
      [
        "Jânio, Goulart e a crise de 1964",
        "Jânio Quadros renunciou em 1961, provocando uma crise sucessória. João Goulart assumiu após uma solução parlamentarista temporária e voltou ao presidencialismo após o plebiscito de 1963. Seu governo apresentou as chamadas reformas de base em ambiente de forte polarização política. Em março e abril de 1964, setores civis e militares derrubaram o governo, iniciando uma nova fase autoritária."
      ]
    ]
  },
  "regime-militar": {
    "lead": "O regime iniciado em 1964 concentrou poder no Executivo, restringiu direitos políticos e utilizou censura e repressão. Ao mesmo tempo, promoveu reformas econômicas, grandes projetos de infraestrutura e, durante parte dos anos 1960 e 1970, forte crescimento. A abertura política ocorreu de forma gradual e terminou com a transição para um governo civil em 1985.",
    "sections": [
      [
        "Ruptura de 1964 e Atos Institucionais",
        "João Goulart foi deposto e Ranieri Mazzilli ocupou formalmente a Presidência durante a transição inicial. O Ato Institucional nº 1 permitiu cassações e suspensão de direitos políticos. Castelo Branco assumiu a Presidência em 1964 e promoveu reformas econômicas e institucionais, enquanto a repressão política se ampliava."
      ],
      [
        "AI-5 e endurecimento",
        "Em 1968, o AI-5 ampliou drasticamente os poderes do governo, permitindo fechamento do Congresso, intervenções e suspensão de garantias políticas. A censura e os órgãos de repressão se fortaleceram. A documentação histórica do período registra prisões, tortura, desaparecimentos e outras graves violações de direitos humanos."
      ],
      [
        "Crescimento e crise econômica",
        "Durante o governo Médici, o país registrou elevadas taxas de crescimento em parte do período, acompanhadas por grandes investimentos em infraestrutura. O chamado milagre econômico também conviveu com concentração de renda, repressão e limitações à organização política. A partir da década de 1970, choques internacionais do petróleo, inflação e endividamento contribuíram para a deterioração das condições econômicas."
      ],
      [
        "Abertura e transição",
        "Geisel iniciou uma abertura política descrita como gradual e controlada. Figueiredo deu continuidade ao processo, sancionou a Lei da Anistia em 1979 e acompanhou o avanço da reorganização partidária. As campanhas pelas Diretas Já, em 1983–1984, mobilizaram grandes manifestações. A eleição indireta de Tancredo Neves e José Sarney marcou a transição para o governo civil em 1985."
      ]
    ]
  },
  "nova-republica": {
    "lead": "A Nova República começou com a transição para o governo civil em 1985 e ganhou seu marco constitucional com a Constituição de 1988. Desde então, o Brasil passou por estabilização monetária, expansão de políticas sociais, reformas econômicas, crises políticas, impeachments, mudanças de orientação governamental e novas disputas institucionais.",
    "sections": [
      [
        "Constituição e redemocratização",
        "O governo José Sarney conduziu parte da transição e acompanhou a Assembleia Nacional Constituinte. A Constituição de 1988 ampliou direitos civis, políticos e sociais, reorganizou competências entre União, estados e municípios e estabeleceu as bases do atual Estado democrático de direito."
      ],
      [
        "Inflação, impeachment e Plano Real",
        "Fernando Collor iniciou um programa de abertura comercial e mudanças econômicas, mas sofreu crise política e foi afastado pelo processo de impeachment em 1992. Itamar Franco assumiu e seu governo conduziu a implementação do Plano Real, que introduziu uma nova moeda e estabilizou a inflação a partir de 1994."
      ],
      [
        "FHC e Lula",
        "Fernando Henrique Cardoso governou de 1995 a 2002, mantendo a estabilidade monetária e promovendo reformas administrativas, privatizações e programas sociais. Luiz Inácio Lula da Silva governou de 2003 a 2010 e ampliou políticas de transferência de renda, educação e crédito, em contexto de crescimento econômico em parte de seus mandatos. Seus governos também foram atingidos por grandes investigações e crises políticas."
      ],
      [
        "Dilma, Temer e Bolsonaro",
        "Dilma Rousseff governou de 2011 a 2016 e foi afastada definitivamente pelo processo de impeachment em agosto de 2016. Michel Temer assumiu e promoveu medidas econômicas e reformas. Jair Bolsonaro governou de 2019 a 2022, período que incluiu a pandemia de COVID-19, conflitos políticos e debates sobre políticas econômicas, ambientais e institucionais."
      ],
      [
        "Brasil contemporâneo",
        "Luiz Inácio Lula da Silva voltou à Presidência em 2023. O período atual inclui a reforma tributária aprovada pelo Congresso, políticas de transição e investimentos, além de disputas políticas e institucionais. A história da Nova República continua em andamento, portanto acontecimentos recentes devem ser tratados como fatos contemporâneos, sujeitos a novas informações e interpretações."
      ]
    ]
  }
};



const chapters = [
  {
    id: "colonial",
    type: "chapter",
    period: "colonial",
    year: "1500–1808",
    title: "Brasil Colonial",
    lead: "A formação do Brasil começou como parte do império português e foi marcada por ocupação territorial, exploração econômica, escravização, conflitos e diferentes formas de resistência.",
    sections: [
      ["A chegada e a ocupação", "A chegada da expedição de Pedro Álvares Cabral, em 1500, não significou a criação imediata de um Estado brasileiro. Durante as primeiras décadas, a Coroa portuguesa concentrou-se na exploração do pau-brasil e na disputa pela ocupação efetiva do território. A partir da década de 1530, a colonização tornou-se mais sistemática, com capitanias hereditárias, núcleos de povoamento e mecanismos de administração vinculados à Coroa."],
      ["A sociedade colonial", "A economia colonial foi organizada em torno de atividades como açúcar, pecuária e, posteriormente, mineração. A escravidão de africanos tornou-se estrutural e coexistiu com diferentes formas de exploração e violência contra povos indígenas. Ao mesmo tempo, indígenas e africanos escravizados desenvolveram formas diversas de resistência, negociação, fuga e preservação cultural."],
      ["Administração e território", "O Governo-Geral, criado em 1549, procurou coordenar a administração portuguesa, enquanto as fronteiras efetivamente ocupadas avançavam para além da faixa litorânea inicialmente controlada. A União Ibérica entre 1580 e 1640 alterou o contexto internacional de Portugal e de seus territórios. Nos séculos XVII e XVIII, expedições, pecuária, missões, conflitos e mineração contribuíram para a expansão territorial."],
      ["Crises do sistema colonial", "No século XVIII, a mineração transformou a economia e aumentou a importância do interior, mas também intensificou a fiscalização e a cobrança de tributos. Reformas promovidas pela Coroa portuguesa buscaram aumentar o controle administrativo e econômico. No final do período, movimentos como a Inconfidência Mineira expressaram conflitos com a ordem colonial."],
      ["O que fica deste período", "O Brasil colonial deixou estruturas econômicas, sociais e territoriais que continuariam influenciando o país independente. A escravidão, a concentração da terra, a diversidade cultural e a formação desigual do território são elementos indispensáveis para compreender os períodos posteriores."]
    ]
  },
  {
    id: "joanino",
    type: "chapter",
    period: "joanino",
    year: "1808–1822",
    title: "A Corte no Brasil e o Reino Unido",
    lead: "A transferência da corte portuguesa para o Rio de Janeiro mudou o centro político do império português e acelerou transformações que contribuíram para a formação do Estado brasileiro.",
    sections: [
      ["A transferência da corte", "Em 1808, diante das guerras napoleônicas na Europa, a família real portuguesa e a corte chegaram ao Rio de Janeiro. A cidade passou a sediar órgãos centrais da monarquia portuguesa. A mudança trouxe milhares de pessoas, reorganizou o abastecimento, ampliou a burocracia e modificou a vida política e econômica da América portuguesa."],
      ["Abertura e instituições", "A abertura dos portos às nações amigas rompeu o antigo sistema comercial exclusivo e aproximou o Brasil de outros mercados. Também foram criadas ou reorganizadas instituições administrativas, financeiras, militares, culturais e judiciais. O Banco do Brasil e outras estruturas ajudaram a formar uma máquina estatal mais complexa."],
      ["O Reino Unido", "Em 1815, o Brasil foi elevado à condição de Reino e passou a integrar o Reino Unido de Portugal, Brasil e Algarves. A medida refletia a importância política que o território havia adquirido dentro da monarquia portuguesa. Ao mesmo tempo, persistiam escravidão, desigualdades e conflitos regionais."],
      ["A crise política", "A Revolução Liberal do Porto, em 1820, exigiu o retorno do rei e a reorganização constitucional de Portugal. D. João VI voltou em 1821 e deixou D. Pedro no Brasil. As Cortes portuguesas passaram a exigir medidas que muitos grupos no Brasil interpretaram como tentativa de reduzir a autonomia adquirida desde 1808."],
      ["A ruptura se aproxima", "A permanência de D. Pedro no Brasil, a formação de alianças políticas e os conflitos em províncias como Bahia e Pernambuco prepararam o terreno para a separação política. A Independência não foi apenas um episódio de setembro de 1822: foi o resultado de uma crise que envolveu interesses locais, portugueses, instituições e conflitos armados em diferentes partes do território."]
    ]
  },
  {
    id: "primeiro-reinado",
    type: "chapter",
    period: "primeiro-reinado",
    year: "1822–1831",
    title: "Primeiro Reinado",
    lead: "Depois da Independência, o desafio passou a ser construir um Estado capaz de governar um território extenso, integrar as províncias e definir quem teria autoridade na nova monarquia.",
    sections: [
      ["Construir um novo Estado", "A separação de Portugal não encerrou os conflitos. Era necessário organizar Exército, administração, finanças, Justiça e relações entre o governo central e as províncias. A guerra pela independência continuou em algumas regiões, especialmente na Bahia, até 1823."],
      ["A Constituição de 1824", "A Assembleia Constituinte instalada em 1823 foi dissolvida por D. Pedro I. Em 25 de março de 1824, o imperador outorgou a primeira Constituição brasileira. O texto estabeleceu uma monarquia constitucional, quatro poderes — Executivo, Legislativo, Judiciário e Moderador — e regras de representação política. A Carta combinava instituições constitucionais com forte autoridade imperial."],
      ["Conflitos regionais e políticos", "A Confederação do Equador, em 1824, reuniu forças contrárias à centralização imperial em parte do Nordeste e foi reprimida. O governo também enfrentou dificuldades econômicas e a Guerra da Cisplatina, encerrada em 1828 com a independência da região que se tornou o Uruguai."],
      ["A abdicação", "A oposição a D. Pedro I cresceu em meio a conflitos políticos, econômicos e disputas sobre sua relação com Portugal. Em 7 de abril de 1831, o imperador abdicou em favor de seu filho Pedro de Alcântara, que era menor de idade. O país entrou então em um período de regências."]
    ]
  },
  {
    id: "regencias",
    type: "chapter",
    period: "regencias",
    year: "1831–1840",
    title: "Período Regencial",
    lead: "Sem um imperador adulto, o Brasil experimentou novas formas de governo enquanto diferentes grupos disputavam o grau de centralização do Estado e enfrentavam revoltas em várias províncias.",
    sections: [
      ["Um governo sem imperador adulto", "Pedro de Alcântara tinha apenas cinco anos quando seu pai abdicou. O país passou a ser governado por regentes em seu nome. O período teve Regência Trina Provisória, Regência Trina Permanente e, depois, regências unas, com figuras como Diogo Feijó e Pedro de Araújo Lima."],
      ["Descentralização e reação", "O Ato Adicional de 1834 alterou a Constituição de 1824 e ampliou a autonomia provincial, criando Assembleias Legislativas Provinciais. A experiência, entretanto, conviveu com preocupações sobre a fragmentação política e com a necessidade de manter a unidade territorial."],
      ["As revoltas", "A década foi marcada por revoltas de naturezas distintas, entre elas Cabanagem, Farroupilha, Sabinada e Balaiada. Participaram desses conflitos elites provinciais, grupos populares, pessoas escravizadas, libertas e setores militares. As causas variaram conforme a região, e a resposta do governo combinou negociação, anistias e repressão militar."],
      ["A Maioridade", "A instabilidade favoreceu a campanha pela antecipação da maioridade de Pedro de Alcântara. Em 1840, o Parlamento declarou o jovem com idade suficiente para governar, embora tivesse apenas 14 anos. D. Pedro II assumiu o trono e iniciou o Segundo Reinado."]
    ]
  },
  {
    id: "segundo-reinado",
    type: "chapter",
    period: "segundo-reinado",
    year: "1840–1889",
    title: "Segundo Reinado",
    lead: "O longo governo de D. Pedro II foi marcado pela expansão econômica e territorial, pela consolidação de instituições, pela escravidão e pelo processo gradual que levou à sua abolição e ao fim da monarquia.",
    sections: [
      ["Consolidação do Império", "A maioridade de D. Pedro II encerrou o período regencial. O sistema político passou a funcionar com alternância entre liberais e conservadores, sob uma monarquia constitucional. O governo central fortaleceu sua capacidade de administrar o território e controlar conflitos provinciais."],
      ["Café, trabalho e infraestrutura", "A expansão do café transformou a economia brasileira, especialmente no Sudeste. Ferrovias, portos, telégrafo e novas instituições acompanharam o crescimento econômico. A imigração europeia aumentou, sobretudo nas regiões cafeeiras, enquanto a escravidão continuava sustentando parte importante da produção."],
      ["A escravidão em transformação", "A interrupção do tráfico transatlântico, a Lei do Ventre Livre e a Lei dos Sexagenários foram etapas de um processo de crise do sistema escravista. A resistência de pessoas escravizadas, movimentos abolicionistas, mudanças econômicas e pressões políticas internas e externas contribuíram para a ruptura final com a escravidão."],
      ["Guerra e crise da monarquia", "A Guerra do Paraguai foi o maior conflito armado da história do Brasil independente no século XIX e teve consequências humanas, econômicas e políticas profundas. No pós-guerra, setores militares ganharam peso. Nas últimas décadas do Império, também cresceram conflitos entre governo e Igreja, entre militares e autoridades civis e entre monarquistas e republicanos."],
      ["O fim do Império", "A abolição em 1888 retirou do sistema monárquico parte importante de seu apoio entre proprietários escravistas, mas a queda da monarquia resultou de um conjunto mais amplo de fatores. Em 15 de novembro de 1889, um movimento militar derrubou o governo imperial e instaurou a República."]
    ]
  },
  {
    id: "primeira-republica",
    type: "chapter",
    period: "primeira-republica",
    year: "1889–1930",
    title: "Primeira República",
    lead: "A nova República substituiu a monarquia por um regime presidencialista e federativo, mas manteve fortes desigualdades sociais e uma participação política limitada.",
    sections: [
      ["A nova ordem constitucional", "A República foi organizada inicialmente por um Governo Provisório e ganhou uma nova Constituição em 1891. O federalismo ampliou a autonomia dos estados e o presidencialismo substituiu a monarquia. O voto, entretanto, permaneceu restrito e a maior parte da população continuou afastada da participação política."],
      ["O poder das oligarquias", "Ao longo das primeiras décadas republicanas, as elites estaduais tiveram grande influência sobre a política nacional. A chamada política dos governadores, alianças entre governos estaduais e União e mecanismos eleitorais ajudaram a sustentar esse arranjo, embora ele nunca tenha sido absoluto nem livre de disputas."],
      ["Conflitos sociais", "A República enfrentou Canudos, Contestado, revoltas urbanas e movimentos militares. A Revolta da Vacina, por exemplo, ocorreu em 1904 em meio às reformas urbanas e sanitárias do Rio de Janeiro. Esses episódios revelaram conflitos entre projetos de modernização, autoridade estatal e condições de vida da população."],
      ["Transformações culturais e econômicas", "A urbanização, a industrialização inicial, a expansão das ferrovias e a imigração modificaram a sociedade. Em 1922, a Semana de Arte Moderna tornou-se um marco cultural do modernismo brasileiro. No campo político, o tenentismo expressou críticas de setores militares à ordem vigente."],
      ["A crise de 1930", "A crise econômica internacional de 1929 atingiu a economia brasileira. A sucessão presidencial de 1930 rompeu alianças políticas e aprofundou a disputa entre grupos estaduais. O movimento iniciado em outubro de 1930 derrubou Washington Luís e levou Getúlio Vargas ao poder, encerrando a Primeira República."]
    ]
  },
  {
    id: "vargas",
    type: "chapter",
    period: "vargas",
    year: "1930–1945",
    title: "Era Vargas",
    lead: "Quinze anos de governo de Getúlio Vargas transformaram a administração federal, as relações de trabalho e a estrutura do Estado, ao mesmo tempo em que atravessaram fases de concentração de poder e autoritarismo.",
    sections: [
      ["O Governo Provisório", "Vargas assumiu em novembro de 1930 após a queda de Washington Luís. O novo governo dissolveu o Congresso, substituiu a Constituição de 1891 e reorganizou a administração federal. Foram criados, entre outros, os ministérios do Trabalho e da Educação e Saúde Pública. O Governo Provisório durou até a Constituição de 1934."],
      ["A Constituição de 1934", "A nova Constituição reorganizou o regime e incorporou mudanças políticas e sociais, como voto secreto e voto feminino. Vargas foi eleito presidente pela Assembleia Constituinte. O país, entretanto, permaneceu politicamente polarizado entre correntes de esquerda, direita, tenentes, oligarquias estaduais e grupos ligados ao governo."],
      ["O Estado Novo", "Em novembro de 1937, Vargas fechou o Congresso e outorgou uma nova Constituição, iniciando o Estado Novo. O regime concentrou poder no Executivo, restringiu a atividade política e utilizou censura e repressão. Ao mesmo tempo, ampliou a capacidade administrativa do Estado e aprofundou a legislação trabalhista."],
      ["Trabalho e industrialização", "Durante o período foram estruturadas normas que culminaram na Consolidação das Leis do Trabalho, em 1943. O Estado também ampliou sua participação na economia e criou instituições voltadas ao desenvolvimento industrial e à regulação de setores estratégicos."],
      ["A guerra e o fim do regime", "O Brasil entrou na Segunda Guerra Mundial ao lado dos Aliados, enviando a Força Expedicionária Brasileira à Itália. A participação em uma guerra contra regimes autoritários expôs uma contradição com o Estado Novo. A pressão por redemocratização cresceu e Vargas foi deposto em outubro de 1945."]
    ]
  },
  {
    id: "republica-1946",
    type: "chapter",
    period: "republica-1946",
    year: "1945–1964",
    title: "República de 1946",
    lead: "A queda de Vargas abriu uma nova fase constitucional, com eleições e competição partidária, mas também com crises sucessivas que terminaram na ruptura institucional de 1964.",
    sections: [
      ["A redemocratização", "José Linhares assumiu interinamente após a queda de Vargas e conduziu a transição para eleições. A Constituição de 1946 restabeleceu instituições representativas e ampliou garantias políticas, embora o período continuasse marcado por restrições a determinados grupos e organizações."],
      ["Dutra e a Guerra Fria", "O governo Eurico Gaspar Dutra foi marcado pelo início da Guerra Fria e por mudanças na política interna. O Partido Comunista Brasileiro teve seu registro cancelado e seus parlamentares perderam os mandatos. O governo também enfrentou questões econômicas relacionadas à inflação e ao uso das reservas acumuladas durante a guerra."],
      ["O retorno de Vargas", "Eleito em 1950, Vargas voltou ao Palácio do Catete em um ambiente democrático. Seu governo criou a Petrobras e adotou políticas de desenvolvimento e nacionalismo econômico. A crise política de 1954, intensificada após o atentado da rua Tonelero e o conflito com setores da oposição, terminou com o suicídio de Vargas em agosto daquele ano."],
      ["JK e a transformação econômica", "Juscelino Kubitschek adotou o Plano de Metas, priorizando energia, transporte, alimentação, indústria e educação. A construção de Brasília simbolizou a interiorização da capital e a política de desenvolvimento. O crescimento foi acompanhado por inflação, aumento do endividamento e debates sobre desigualdades regionais."],
      ["A crise final", "Jânio Quadros renunciou em 1961 e abriu uma crise sucessória. João Goulart assumiu após um acordo que inicialmente instituiu o parlamentarismo, posteriormente revertido por plebiscito. Seu governo defendeu reformas de base em meio a forte polarização. Em março e abril de 1964, as Forças Armadas depuseram Goulart e iniciou-se um novo regime."]
    ]
  },
  {
    id: "regime-militar",
    type: "chapter",
    period: "regime-militar",
    year: "1964–1985",
    title: "Regime Militar",
    lead: "O regime instaurado em 1964 restringiu direitos políticos e liberdades civis, reorganizou a economia e ampliou o poder do Executivo antes de iniciar uma abertura política gradual que terminou na transição civil.",
    sections: [
      ["A ruptura institucional", "João Goulart foi deposto em 1964 e o Congresso declarou vaga a Presidência. Ranieri Mazzilli ocupou formalmente o cargo por curto período, enquanto a nova ordem política era consolidada. O governo Castelo Branco iniciou uma sequência de Atos Institucionais que alteraram o funcionamento das instituições."],
      ["Centralização e repressão", "Cassações de mandatos, suspensão de direitos políticos, censura e repressão a opositores tornaram-se características do regime. O AI-5, editado em 1968, ampliou de forma significativa os poderes do Executivo e marcou uma fase mais intensa da repressão política."],
      ["Economia e desenvolvimento", "Entre o fim dos anos 1960 e o início dos anos 1970, o Brasil registrou altas taxas de crescimento econômico, período conhecido como milagre econômico. Grandes obras de infraestrutura e expansão industrial coexistiram com concentração de renda, endividamento e limitações à organização política."],
      ["A abertura", "No governo Ernesto Geisel começou uma abertura política gradual, marcada por avanços e recuos. O governo enfrentou crise econômica, inflação e aumento da dívida externa. Durante a gestão de João Figueiredo, a Lei da Anistia de 1979 e a reorganização partidária acompanharam o processo de transição."],
      ["A transição civil", "As campanhas das Diretas Já mobilizaram milhões de pessoas, embora a emenda que previa eleição direta para presidente não tenha sido aprovada. Em 1985, Tancredo Neves foi eleito indiretamente, mas morreu antes da posse. José Sarney assumiu e iniciou a Nova República."]
    ]
  },
  {
    id: "nova-republica",
    type: "chapter",
    period: "nova-republica",
    year: "1985–atualidade",
    title: "Nova República",
    lead: "A Nova República reúne a reconstrução democrática, a estabilização monetária, mudanças econômicas, alternância de governos e crises políticas que moldaram o Brasil contemporâneo.",
    sections: [
      ["A reconstrução democrática", "O governo José Sarney conduziu a transição civil e a Assembleia Nacional Constituinte. A Constituição promulgada em 5 de outubro de 1988 reorganizou as instituições, ampliou direitos e estabeleceu o Estado Democrático de Direito. Ela se tornou o principal marco constitucional da República contemporânea."],
      ["A eleição direta e a crise de Collor", "Em 1989, os brasileiros voltaram a eleger diretamente o presidente. Fernando Collor assumiu em 1990 com um programa de abertura econômica e estabilização, mas seu governo foi atingido por uma crise política que resultou no impeachment em 1992. Itamar Franco assumiu e conduziu a transição seguinte."],
      ["A estabilização monetária", "O Plano Real, lançado durante o governo Itamar Franco, reorganizou a política monetária e criou uma nova moeda em 1994. Fernando Henrique Cardoso foi eleito naquele ano e governou entre 1995 e 2003, com continuidade da estabilidade monetária, reformas, privatizações e expansão de políticas sociais."],
      ["Os governos do século XXI", "Luiz Inácio Lula da Silva governou de 2003 a 2011, seguido por Dilma Rousseff, de 2011 a 2016. Nesse período houve expansão de políticas sociais, mudanças econômicas e crescimento do acesso a serviços e educação, além de crises políticas e investigações de corrupção. Dilma deixou o cargo após processo de impeachment em 2016."],
      ["2016 em diante", "Michel Temer governou até 2019. Jair Bolsonaro presidiu de 2019 a 2023, período marcado por disputas políticas intensas e pela pandemia de COVID-19. Em 2023, Lula iniciou seu terceiro mandato. A etapa recente inclui debates sobre política fiscal, programas sociais, meio ambiente, reforma tributária e a relação entre Executivo, Congresso e demais instituições."],
      ["Uma história ainda em andamento", "A Nova República não é um período encerrado. Seus acontecimentos mais recentes ainda são objeto de documentação, pesquisa e disputa interpretativa. Por isso, a seção distingue fatos institucionais de interpretações e evita apresentar controvérsias contemporâneas como conclusões definitivas."]
    ]
  }
];

const deepDives = [
  {
    id: "corte-1808",
    period: "joanino",
    year: "1808",
    title: "A chegada da corte portuguesa",
    summary: "A transferência da corte transformou o Rio de Janeiro no centro político do Império Português.",
    sections: [
      ["O contexto", "As guerras napoleônicas alteraram o equilíbrio europeu. Portugal enfrentou a pressão francesa para aderir ao bloqueio continental contra a Grã-Bretanha. A família real e parte da corte partiram para o Brasil sob proteção britânica."],
      ["A mudança", "A chegada ao Rio de Janeiro em 1808 deslocou para a América instituições que antes funcionavam em Lisboa. A presença da monarquia exigiu reorganização administrativa, abastecimento, defesa, Justiça e finanças."],
      ["As consequências", "A abertura dos portos e a criação ou reorganização de instituições mudaram a posição econômica do Brasil dentro do império. A cidade do Rio tornou-se sede de uma estrutura política que permaneceria no território até a Independência."],
      ["O que mudou", "A transferência não significou independência imediata. O Brasil continuou parte da monarquia portuguesa, mas a concentração de instituições e poder no Rio criou condições que facilitaram a autonomia política posterior."]
    ]
  },
  {
    id: "independencia-1822",
    period: "primeiro-reinado",
    year: "1822",
    title: "A Independência do Brasil",
    summary: "A separação de Portugal foi resultado de uma crise política que envolveu as Cortes de Lisboa, D. Pedro, elites provinciais e conflitos armados em diferentes regiões.",
    sections: [
      ["Antes do 7 de setembro", "Depois da Revolução do Porto de 1820, as Cortes portuguesas tentaram reorganizar o império e exigiram o retorno de D. Pedro. No Brasil, grupos políticos passaram a defender maior autonomia e a permanência do príncipe."],
      ["O processo", "Em janeiro de 1822, D. Pedro decidiu permanecer no Brasil. Ao longo do ano, foram criadas instituições políticas próprias e aumentaram os conflitos com forças portuguesas. A separação foi apoiada por diferentes grupos, mas não ocorreu de forma idêntica em todas as províncias."],
      ["A guerra", "Na Bahia, tropas e grupos locais favoráveis à separação enfrentaram forças portuguesas até a retirada destas em julho de 1823. Houve conflitos também em outras áreas. A Independência, portanto, foi acompanhada por operações militares e disputas pelo controle territorial."],
      ["Depois da ruptura", "Em 1822, D. Pedro foi proclamado imperador e o novo Estado precisou consolidar sua autoridade. A Constituição de 1824 e o reconhecimento internacional fizeram parte dessa etapa de construção institucional."]
    ]
  },
  {
    id: "abolição-1888",
    period: "segundo-reinado",
    year: "1888",
    title: "A abolição da escravidão",
    summary: "A Lei Áurea encerrou juridicamente a escravidão, mas não criou políticas de integração social e econômica para os libertos.",
    sections: [
      ["Uma longa crise", "A abolição foi resultado de décadas de resistência de pessoas escravizadas, movimentos abolicionistas, mudanças econômicas e pressões políticas. Antes de 1888, leis como Eusébio de Queirós, Ventre Livre e Sexagenários já haviam limitado partes do sistema."],
      ["O ano de 1888", "Em maio de 1888, o gabinete de João Alfredo levou ao Parlamento um projeto de abolição. A princesa Isabel, como regente, assinou a Lei nº 3.353 em 13 de maio. O texto tinha apenas dois artigos e extinguiu a escravidão sem estabelecer indenização ou programa de integração dos libertos."],
      ["Depois da Lei Áurea", "A liberdade jurídica não veio acompanhada de reforma agrária, política educacional ampla ou garantia de inserção econômica. Muitos ex-escravizados permaneceram em condições precárias de trabalho e moradia."],
      ["Consequências políticas", "A abolição alterou as alianças políticas da monarquia. Parte dos proprietários escravistas se afastou do regime, enquanto militares e republicanos já questionavam a ordem imperial. A monarquia seria derrubada no ano seguinte."]
    ]
  },
  {
    id: "republica-1889",
    period: "primeira-republica",
    year: "1889",
    title: "A Proclamação da República",
    summary: "Em novembro de 1889, um movimento militar derrubou a monarquia e instalou um Governo Provisório republicano.",
    sections: [
      ["As tensões do fim do Império", "Nas últimas décadas do século XIX, a monarquia enfrentava conflitos com setores militares, a Igreja e grupos republicanos. A abolição da escravidão em 1888 também modificou as relações entre o governo imperial e parte das elites econômicas."],
      ["15 de novembro", "Em 15 de novembro de 1889, tropas lideradas pelo marechal Deodoro da Fonseca ocuparam posições no Rio de Janeiro. O governo imperial caiu e foi formado um Governo Provisório republicano."],
      ["A nova forma de Estado", "A República precisava definir suas instituições. O Governo Provisório reorganizou símbolos, administração e relações federativas, enquanto uma Assembleia Constituinte elaborava uma nova Constituição."],
      ["A Constituição de 1891", "O novo texto estabeleceu a República Federativa, o presidencialismo e a separação entre Igreja e Estado. A mudança de regime, entretanto, não significou democratização ampla: o voto continuou restrito e grande parte da população permaneceu sem participação política."]
    ]
  },
  {
    id: "revolucao-1930",
    period: "vargas",
    year: "1930",
    title: "A Revolução de 1930",
    summary: "A ruptura de 1930 encerrou a Primeira República e levou Getúlio Vargas ao poder após uma crise sucessória e uma mobilização político-militar.",
    sections: [
      ["A crise sucessória", "A eleição de 1930 opôs Júlio Prestes, apoiado pelo governo Washington Luís, a Getúlio Vargas, candidato da Aliança Liberal. Prestes venceu, mas a oposição contestou o processo em um ambiente já tensionado pela crise econômica internacional."],
      ["O movimento", "O assassinato de João Pessoa, embora não tenha sido causado diretamente pela disputa presidencial, tornou-se símbolo da mobilização oposicionista. Em outubro de 1930, movimentos armados começaram em diferentes estados e avançaram em direção ao Rio de Janeiro."],
      ["A queda do governo", "Antes que Vargas chegasse à capital, uma junta militar depôs Washington Luís. Pouco depois, Vargas assumiu o comando do Governo Provisório em 3 de novembro de 1930."],
      ["O novo Estado", "O novo governo dissolveu o Congresso e substituiu a Constituição de 1891. A administração federal foi reorganizada e o poder central ganhou peso. O processo que começou em 1930 abriria caminho para novas instituições, a Constituição de 1934 e, posteriormente, o Estado Novo."]
    ]
  },
  {
    id: "estado-novo-1937",
    period: "vargas",
    year: "1937",
    title: "O Estado Novo",
    summary: "Em 10 de novembro de 1937, Getúlio Vargas fechou o Congresso e instaurou um regime autoritário que durou até 1945.",
    sections: [
      ["A escalada política", "Durante o governo constitucional iniciado em 1934, a política brasileira foi marcada por forte polarização. A Aliança Nacional Libertadora e a Ação Integralista Brasileira representavam projetos distintos, enquanto o governo ampliava sua preocupação com movimentos considerados subversivos."],
      ["O golpe de 1937", "Em 1937, o governo apresentou o chamado Plano Cohen como justificativa para medidas de segurança. Em novembro, Vargas fechou o Congresso e outorgou uma nova Constituição, iniciando o Estado Novo."],
      ["O funcionamento do regime", "O Estado Novo concentrou poder no Executivo, restringiu a atividade partidária, utilizou censura e repressão e reorganizou a administração federal. Ao mesmo tempo, consolidou políticas trabalhistas e instituições estatais que permaneceriam depois de 1945."],
      ["O fim", "A participação brasileira na Segunda Guerra Mundial ao lado dos Aliados aumentou a contradição entre combater regimes autoritários no exterior e manter um regime autoritário internamente. Em 1945, pressões políticas levaram à deposição de Vargas e à abertura de uma nova fase constitucional."]
    ]
  },
  {
    id: "ruptura-1964",
    period: "regime-militar",
    year: "1964",
    title: "A ruptura institucional de 1964",
    summary: "A deposição de João Goulart inaugurou um regime que permaneceu no poder por duas décadas.",
    sections: [
      ["A crise política", "O governo João Goulart enfrentava inflação, conflitos sociais e forte polarização sobre as chamadas reformas de base. O ambiente internacional da Guerra Fria também influenciava os grupos políticos brasileiros."],
      ["A deposição", "Entre 31 de março e 1º de abril de 1964, setores das Forças Armadas iniciaram a movimentação que levou à saída de Goulart. O Congresso declarou a Presidência vaga, e Ranieri Mazzilli ocupou formalmente o cargo por curto período."],
      ["A nova ordem", "O novo regime editou o Ato Institucional nº 1, que permitiu cassações e suspensões de direitos políticos. Humberto Castelo Branco assumiu a Presidência em abril de 1964."],
      ["As décadas seguintes", "O regime passou por diferentes fases sob Castelo Branco, Costa e Silva, Médici, Geisel e Figueiredo, além da Junta Militar de 1969. O AI-5 de 1968 marcou a ampliação da repressão, enquanto a abertura política iniciada na década de 1970 conduziu à transição civil de 1985."]
    ]
  },
  {
    id: "constituicao-1988",
    period: "nova-republica",
    year: "1988",
    title: "A Constituição de 1988",
    summary: "A Constituição promulgada em 5 de outubro de 1988 reorganizou as instituições democráticas e ampliou direitos e garantias fundamentais.",
    sections: [
      ["A Constituinte", "A Assembleia Nacional Constituinte foi instalada em 1987, durante o governo José Sarney, após a transição do regime militar para o governo civil. Deputados e senadores participaram de debates sobre direitos, organização do Estado, economia, saúde, educação e participação social."],
      ["O texto", "A Constituição definiu o Brasil como Estado Democrático de Direito e manteve a República presidencialista e federativa. O texto ampliou direitos sociais e garantias individuais e reorganizou competências entre União, estados e municípios."],
      ["Mudanças sociais", "A Carta incorporou direitos relacionados a saúde, educação, trabalho, assistência social, meio ambiente, proteção de grupos vulneráveis e participação política. O Sistema Único de Saúde foi estruturado constitucionalmente como política pública universal."],
      ["Um novo marco", "A Constituição de 1988 é a sétima Constituição brasileira segundo a série histórica apresentada pelo Senado, após as Cartas de 1824, 1891, 1934, 1937, 1946 e 1967. Sua aplicação passou a orientar a vida institucional da Nova República."]
    ]
  },
  {
    id: "plano-real-1994",
    period: "nova-republica",
    year: "1994",
    title: "O Plano Real",
    summary: "O Plano Real mudou a política monetária brasileira e encerrou um longo ciclo de inflação elevada.",
    sections: [
      ["O problema", "Desde a década de 1980, o Brasil convivia com inflação muito elevada e havia tentado diferentes planos de estabilização. Mudanças de moeda, congelamentos de preços e outras medidas anteriores não produziram estabilidade duradoura."],
      ["A preparação", "No governo Itamar Franco, a equipe econômica estruturou o Plano Real em etapas, incluindo a Unidade Real de Valor, que serviu como referência de preços antes da criação da nova moeda."],
      ["A nova moeda", "Em 1º de julho de 1994, o real entrou em circulação. A estabilização reduziu rapidamente a inflação em comparação com os níveis anteriores e alterou a dinâmica da economia brasileira."],
      ["O período seguinte", "Fernando Henrique Cardoso foi eleito em 1994 e assumiu em 1995. A manutenção da estabilidade monetária tornou-se um eixo central de sua política econômica, ao lado de reformas e mudanças na atuação do Estado."]
    ]
  }
];

const timelineEntries = [
  ...chapters.map(chapter => ({ ...chapter, key: "chapter|" + chapter.id })),
  ...deepDives.map(event => ({ ...event, type: "event", key: "event|" + event.id }))
];

const filters = ["Todos", "Colônia", "Império", "República"];
const timeline = document.getElementById("timeline");
const detail = document.getElementById("history-detail");
const filterContainer = document.getElementById("history-filters");
const search = document.getElementById("history-search");
const count = document.getElementById("timeline-count");
let activeFilter = "Todos";
let activeEntry = null;

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function periodFor(entry) {
  return periods.find(period => period.id === entry.period);
}

function matchesFilter(entry) {
  const period = periodFor(entry);
  return period && (activeFilter === "Todos" || period.era === activeFilter);
}

function searchableText(entry) {
  const period = periodFor(entry);
  const leaders = period ? period.leaders.map(leader => leader.name).join(" ") : "";
  const body = entry.sections ? entry.sections.flat().join(" ") : "";
  return [entry.year, entry.title, entry.summary, entry.lead, body, period?.label, period?.era, leaders]
    .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
}

function filteredEntries() {
  const query = search.value.trim().toLocaleLowerCase("pt-BR");
  return timelineEntries.filter(entry => matchesFilter(entry) && (!query || searchableText(entry).includes(query)));
}

function renderFilters() {
  filterContainer.innerHTML = filters.map(filter =>
    '<button class="history-filter ' + (filter === activeFilter ? "active" : "") + '" data-filter="' + escapeHtml(filter) + '">' + escapeHtml(filter) + '</button>'
  ).join("");

  filterContainer.querySelectorAll(".history-filter").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      renderFilters();
      renderTimeline();
    });
  });
}

function renderTimeline() {
  const visible = filteredEntries();
  count.textContent = visible.length + (visible.length === 1 ? " entrada" : " entradas");

  if (!visible.length) {
    timeline.innerHTML = '<div class="history-no-results"><h3>Nenhuma história encontrada</h3><p>Tente outro termo ou filtro.</p></div>';
    return;
  }

  timeline.innerHTML = visible.map(entry => {
    const period = periodFor(entry);
    const active = activeEntry === entry.key ? "active" : "";
    const label = entry.type === "event" ? "Marco aprofundado" : "Capítulo histórico";
    const description = entry.type === "event" ? entry.summary : entry.lead;

    return '<button class="timeline-item ' + active + ' ' + entry.type + '" data-entry="' + escapeHtml(entry.key) + '">' +
      '<span class="timeline-year">' + escapeHtml(entry.year) + '</span>' +
      '<span class="timeline-dot"></span>' +
      '<span class="timeline-card"><small>' + escapeHtml(period.era) + ' · ' + label + '</small><strong>' + escapeHtml(entry.title) + '</strong><span>' + escapeHtml(description) + '</span></span>' +
      '</button>';
  }).join("");

  timeline.querySelectorAll(".timeline-item").forEach(item => {
    item.addEventListener("click", () => openEntry(item.dataset.entry));
  });

  centerActiveEntry();
}

function updateTimelineFocus() {
  const center = timeline.scrollTop + timeline.clientHeight / 2;
  timeline.querySelectorAll(".timeline-item").forEach(item => {
    const itemCenter = item.offsetTop + item.offsetHeight / 2;
    const distance = Math.abs(center - itemCenter);
    const ratio = Math.min(distance / (timeline.clientHeight / 2), 1);
    item.classList.toggle("is-center", distance < item.offsetHeight * .65);
    item.classList.toggle("is-near", distance >= item.offsetHeight * .65 && ratio < .62);
    item.classList.toggle("is-far", ratio >= .62);
  });
}

timeline.addEventListener("scroll", updateTimelineFocus, { passive: true });

function centerTimelineItem(item, behavior = "smooth") {
  if (!item) return;
  const target = item.offsetTop - (timeline.clientHeight - item.offsetHeight) / 2;
  timeline.scrollTo({ top: Math.max(0, target), behavior });
}

function centerActiveEntry() {
  const item = timeline.querySelector(".timeline-item.active") || timeline.querySelector(".timeline-item");
  centerTimelineItem(item, "auto");
  requestAnimationFrame(updateTimelineFocus);
}

function resetDetail() {
  activeEntry = null;
  detail.classList.remove("open");
  document.body.classList.remove("history-modal-open");
  detail.innerHTML = '<div class="history-detail-empty"><span class="detail-kicker">Selecione uma história</span><h2>Explore a História do Brasil.</h2><p>A linha do tempo apresenta capítulos completos e alguns acontecimentos que merecem uma narrativa própria. Clique em uma entrada para abrir os detalhes.</p></div>';
  renderTimeline();
}

function closeEntryModal(event) {
  if (event && event.target !== detail) return;
  resetDetail();
}

function buildLeaderCards(period, relevantYear) {
  if (!period) return "";
  return '<section class="leaders"><div class="detail-section-title"><span>Quem estava no poder</span><small>' + period.leaders.length + ' registros</small></div>' +
    period.leaders.map(leader =>
      '<article class="leader-card"><div class="leader-heading"><div><h3>' + escapeHtml(leader.name) + '</h3><span>' + escapeHtml(leader.role) + '</span></div><time>' + escapeHtml(leader.years) + '</time></div><div class="leader-columns"><div><h4>Medidas e atuação</h4><ul>' + leader.achievements.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul></div><div><h4>Conflitos e controvérsias</h4><ul>' + leader.controversies.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul></div></div></article>'
    ).join("") + '</section>';
}

function buildSections(sections) {
  return '<div class="history-story">' + sections.map(([title, text]) =>
    '<section class="history-story-section"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(text) + '</p></section>'
  ).join("") + '</div>';
}

function buildSources(entry) {
  const sourceLinks = {
    colonial: ["Arquivo Nacional"],
    joanino: ["Arquivo Nacional"],
    "primeiro-reinado": ["Arquivo Nacional"],
    regencias: ["Arquivo Nacional"],
    "segundo-reinado": ["Arquivo Nacional"],
    "primeira-republica": ["Arquivo Nacional"],
    vargas: ["Arquivo Nacional"],
    "republica-1946": ["Arquivo Nacional"],
    "regime-militar": ["Arquivo Nacional"],
    "nova-republica": ["Arquivo Nacional", "Senado Federal"]
  };
  const names = sourceLinks[entry.period] || ["Arquivo Nacional"];
  return '<div class="history-source-note"><strong>Base documental:</strong> ' + names.map(escapeHtml).join(" · ") + '. A narrativa foi estruturada a partir de fontes institucionais e documentação histórica; questões interpretativas são apresentadas como contexto, não como conclusão.</div>';
}

function openEntry(key) {
  const entry = timelineEntries.find(item => item.key === key);
  if (!entry) return;

  activeEntry = key;
  renderTimeline();

  const period = periodFor(entry);
  const kicker = entry.type === "event" ? "Marco aprofundado" : "Capítulo histórico";
  const intro = entry.type === "event" ? entry.summary : entry.lead;

  detail.innerHTML =
    '<div class="detail-header"><div><span class="detail-kicker">' + escapeHtml(kicker) + ' · ' + escapeHtml(period.era) + '</span><h2>' + escapeHtml(entry.title) + '</h2><span class="detail-years">' + escapeHtml(entry.year) + '</span></div><button class="detail-close" type="button" aria-label="Fechar detalhes"><i class="fas fa-times"></i></button></div>' +
    '<div class="detail-intro"><p class="history-lead">' + escapeHtml(intro) + '</p></div>' +
    buildSections(entry.sections) +
    (entry.type === "chapter" ? buildLeaderCards(period) : "") +
    buildSources(entry);

  detail.classList.add("open");
  document.body.classList.add("history-modal-open");
  detail.querySelector(".detail-close").focus();
}

detail.addEventListener("click", closeEntryModal);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && detail.classList.contains("open")) resetDetail();
});

search.addEventListener("input", renderTimeline);
renderFilters();
renderTimeline();
