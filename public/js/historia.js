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

const milestones = [
  { year: "1500", title: "Chegada da expedição de Cabral", description: "A expedição portuguesa comandada por Pedro Álvares Cabral chega ao território que posteriormente seria chamado Brasil.", period: "colonial" },
  { year: "1530", title: "Início da colonização sistemática", description: "A Coroa portuguesa passa a organizar de forma mais estruturada a ocupação e exploração do território.", period: "colonial" },
  { year: "1534", title: "Capitanias hereditárias", description: "A Coroa divide o território em capitanias para estimular a ocupação e a administração colonial.", period: "colonial" },
  { year: "1549", title: "Criação do Governo-Geral", description: "Tomé de Sousa assume como primeiro governador-geral, reforçando a centralização administrativa da colônia.", period: "colonial" },
  { year: "1580", title: "União Ibérica", description: "Portugal passa a ser governado pela mesma monarquia que governava a Espanha, período que se estende até 1640.", period: "colonial" },
  { year: "1690s", title: "Expansão da mineração", description: "A descoberta de ouro em grande escala intensifica a ocupação do interior e transforma a economia colonial.", period: "colonial" },
  { year: "1750s", title: "Reformas pombalinas", description: "O governo português promove reformas administrativas, econômicas e educacionais que alteram a organização da colônia.", period: "colonial" },
  { year: "1789", title: "Inconfidência Mineira", description: "Movimento conspiratório em Minas Gerais contra a ordem colonial portuguesa, reprimido pelas autoridades.", period: "colonial" },
  { year: "1808", title: "Chegada da corte portuguesa", description: "A família real portuguesa chega ao Rio de Janeiro após a transferência da corte para o Brasil.", period: "joanino" },
  { year: "1808", title: "Abertura dos portos", description: "D. João decreta a abertura dos portos brasileiros às nações amigas, alterando o sistema comercial colonial.", period: "joanino" },
  { year: "1815", title: "Brasil elevado a Reino", description: "O Brasil passa a integrar o Reino Unido de Portugal, Brasil e Algarves.", period: "joanino" },
  { year: "1817", title: "Revolução Pernambucana", description: "Movimento republicano e separatista em Pernambuco, derrotado pelas forças do governo.", period: "joanino" },
  { year: "1822", title: "Independência do Brasil", description: "D. Pedro declara a separação política do Brasil em relação a Portugal.", period: "primeiro-reinado" },
  { year: "1824", title: "Constituição do Império", description: "D. Pedro I outorga a primeira Constituição brasileira, que estabelece a monarquia constitucional e o Poder Moderador.", period: "primeiro-reinado" },
  { year: "1824", title: "Confederação do Equador", description: "Revolta de caráter republicano e federalista no Nordeste é reprimida pelo governo imperial.", period: "primeiro-reinado" },
  { year: "1831", title: "Abdicação de D. Pedro I", description: "D. Pedro I abdica em favor de seu filho, que ainda era menor de idade, iniciando o período regencial.", period: "regencias" },
  { year: "1834", title: "Ato Adicional", description: "Reforma constitucional amplia a autonomia provincial e cria as Assembleias Legislativas Provinciais.", period: "regencias" },
  { year: "1835", title: "Início da Cabanagem e Farroupilha", description: "Duas das principais revoltas do período regencial começam em diferentes regiões do país.", period: "regencias" },
  { year: "1840", title: "Golpe da Maioridade", description: "D. Pedro II é declarado maior de idade aos 14 anos e assume o governo do Império.", period: "segundo-reinado" },
  { year: "1850", title: "Lei Eusébio de Queirós", description: "A legislação reprime o tráfico transatlântico de escravizados para o Brasil.", period: "segundo-reinado" },
  { year: "1864", title: "Início da Guerra do Paraguai", description: "O Brasil entra no maior conflito armado da América do Sul no século XIX.", period: "segundo-reinado" },
  { year: "1871", title: "Lei do Ventre Livre", description: "A lei declara livres os filhos de mulheres escravizadas nascidos a partir de sua vigência, sob condições estabelecidas pela própria legislação.", period: "segundo-reinado" },
  { year: "1888", title: "Lei Áurea", description: "A escravidão é abolida legalmente no Brasil pela Lei nº 3.353.", period: "segundo-reinado" },
  { year: "1889", title: "Proclamação da República", description: "A monarquia é derrubada e o Brasil passa a adotar a forma republicana de governo.", period: "primeira-republica" },
  { year: "1891", title: "Constituição republicana", description: "É promulgada a primeira Constituição republicana, estabelecendo o federalismo e o presidencialismo.", period: "primeira-republica" },
  { year: "1896–1897", title: "Guerra de Canudos", description: "Conflito no sertão da Bahia termina com a destruição do arraial de Canudos pelas forças republicanas.", period: "primeira-republica" },
  { year: "1904", title: "Revolta da Vacina", description: "Revolta popular no Rio de Janeiro ocorre em meio às reformas urbanas e à campanha de vacinação obrigatória contra a varíola.", period: "primeira-republica" },
  { year: "1922", title: "Semana de Arte Moderna", description: "Evento realizado em São Paulo torna-se um marco do modernismo brasileiro.", period: "primeira-republica" },
  { year: "1930", title: "Revolução de 1930", description: "A ruptura política de 1930 encerra a Primeira República e leva Getúlio Vargas ao poder.", period: "vargas" },
  { year: "1934", title: "Constituição de 1934", description: "Nova Constituição amplia direitos políticos e sociais, incluindo o voto feminino e secreto.", period: "vargas" },
  { year: "1937", title: "Estado Novo", description: "Getúlio Vargas fecha o Congresso e instaura um regime autoritário, acompanhado de censura e repressão política.", period: "vargas" },
  { year: "1943", title: "Consolidação das Leis do Trabalho", description: "A CLT reúne e sistematiza normas trabalhistas durante o governo Vargas.", period: "vargas" },
  { year: "1946", title: "Nova Constituição democrática", description: "A Constituição de 1946 reorganiza as instituições após o fim do Estado Novo.", period: "republica-1946" },
  { year: "1953", title: "Criação da Petrobras", description: "A Petrobras é criada durante o segundo governo de Getúlio Vargas.", period: "republica-1946" },
  { year: "1956", title: "Início do governo Juscelino Kubitschek", description: "O governo inicia o Plano de Metas, com forte investimento em indústria, energia, transporte e infraestrutura.", period: "republica-1946" },
  { year: "1960", title: "Inauguração de Brasília", description: "A nova capital federal é inaugurada durante o governo Juscelino Kubitschek.", period: "republica-1946" },
  { year: "1961", title: "Renúncia de Jânio Quadros", description: "A renúncia presidencial desencadeia uma crise política que antecede a posse de João Goulart.", period: "republica-1946" },
  { year: "1964", title: "Ruptura institucional", description: "João Goulart é deposto e inicia-se o período de governo militar que se estende até 1985.", period: "regime-militar" },
  { year: "1968", title: "AI-5", description: "O Ato Institucional nº 5 amplia os poderes do regime e intensifica a repressão política e a censura.", period: "regime-militar" },
  { year: "1979", title: "Lei da Anistia", description: "A Lei nº 6.683 concede anistia em condições definidas pelo texto legal e integra o processo de abertura política.", period: "regime-militar" },
  { year: "1983–1984", title: "Diretas Já", description: "Movimento nacional mobiliza a sociedade em defesa de eleições diretas para presidente.", period: "regime-militar" },
  { year: "1985", title: "Transição para o governo civil", description: "José Sarney assume a Presidência após a eleição indireta de Tancredo Neves e o início da Nova República.", period: "nova-republica" },
  { year: "1988", title: "Constituição Federal", description: "É promulgada a Constituição de 1988, reorganizando o Estado democrático de direito e ampliando direitos e garantias.", period: "nova-republica" },
  { year: "1989", title: "Primeira eleição presidencial direta desde 1960", description: "Os brasileiros elegem diretamente o presidente da República após o período de transição democrática.", period: "nova-republica" },
  { year: "1992", title: "Impeachment de Fernando Collor", description: "Fernando Collor deixa a Presidência após o processo de impeachment aprovado pelo Congresso Nacional.", period: "nova-republica" },
  { year: "1994", title: "Plano Real", description: "O Plano Real estabelece uma nova moeda e contribui para a estabilização da inflação.", period: "nova-republica" },
  { year: "2003", title: "Início do primeiro governo Lula", description: "Luiz Inácio Lula da Silva assume a Presidência após a eleição de 2002.", period: "nova-republica" },
  { year: "2010", title: "Eleição de Dilma Rousseff", description: "Dilma Rousseff é eleita presidente e inicia seu primeiro mandato em 2011.", period: "nova-republica" },
  { year: "2016", title: "Impeachment de Dilma Rousseff", description: "Dilma Rousseff é afastada definitivamente da Presidência após processo de impeachment no Senado.", period: "nova-republica" },
  { year: "2018", title: "Eleição presidencial", description: "Jair Bolsonaro é eleito presidente para o mandato iniciado em 2019.", period: "nova-republica" },
  { year: "2020", title: "Pandemia de COVID-19", description: "A pandemia provoca uma crise sanitária, econômica e social de grande escala no Brasil.", period: "nova-republica" },
  { year: "2022", title: "Eleição presidencial", description: "Luiz Inácio Lula da Silva é eleito para um terceiro mandato presidencial, iniciado em 2023.", period: "nova-republica" },
  { year: "2023", title: "Início do terceiro governo Lula", description: "Luiz Inácio Lula da Silva assume novamente a Presidência da República.", period: "nova-republica" },
  { year: "2023–2024", title: "Reforma tributária", description: "O Congresso aprova a Emenda Constitucional nº 132, que altera a estrutura da tributação sobre o consumo.", period: "nova-republica" }
];

const filters = ["Todos", "Colônia", "Império", "República"];
const timeline = document.getElementById("timeline");
const detail = document.getElementById("history-detail");
const filterContainer = document.getElementById("history-filters");
const search = document.getElementById("history-search");
const count = document.getElementById("timeline-count");
let activeFilter = "Todos";
let activePeriod = null;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function filteredMilestones() {
  const query = search.value.trim().toLocaleLowerCase("pt-BR");

  return milestones.filter(milestone => {
    const period = periods.find(item => item.id === milestone.period);
    if (!period) return false;

    const matchesFilter = activeFilter === "Todos" || period.era === activeFilter;
    const searchable = [
      milestone.year,
      milestone.title,
      milestone.description,
      period.label,
      period.era,
      ...period.leaders.map(leader => leader.name)
    ].join(" ").toLocaleLowerCase("pt-BR");

    return matchesFilter && (!query || searchable.includes(query));
  });
}

function renderFilters() {
  filterContainer.innerHTML = filters.map(filter =>
    '<button class="history-filter ' + (filter === activeFilter ? "active" : "") + '" data-filter="' + filter + '">' + filter + '</button>'
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
  const visible = filteredMilestones();
  count.textContent = visible.length + (visible.length === 1 ? " marco" : " marcos");

  if (!visible.length) {
    timeline.innerHTML = '<div class="history-no-results"><h3>Nenhum marco encontrado</h3><p>Tente outro termo ou filtro.</p></div>';
    return;
  }

  timeline.innerHTML = visible.map(milestone => {
    const period = periods.find(item => item.id === milestone.period);
    const active = activePeriod === milestone.period ? "active" : "";

    return '<button class="timeline-item ' + active + '" data-period="' + escapeHtml(milestone.period) + '">' +
      '<span class="timeline-year">' + escapeHtml(milestone.year) + '</span>' +
      '<span class="timeline-dot"></span>' +
      '<span class="timeline-card"><small>' + escapeHtml(period.era) + ' · ' + escapeHtml(period.label) + '</small><strong>' + escapeHtml(milestone.title) + '</strong><span>' + escapeHtml(milestone.description) + '</span></span>' +
      '</button>';
  }).join("");

  timeline.querySelectorAll(".timeline-item").forEach(item => {
    item.addEventListener("click", () => selectPeriod(item.dataset.period));
  });

  centerActivePeriod();
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
  timeline.scrollTo({
    top: Math.max(0, target),
    behavior
  });
}

function centerActivePeriod() {
  const item = timeline.querySelector(".timeline-item.active") || timeline.querySelector(".timeline-item");
  centerTimelineItem(item, "auto");
  requestAnimationFrame(updateTimelineFocus);
}

function selectPeriod(id) {
  const period = periods.find(item => item.id === id);
  if (!period) return;

  activePeriod = id;
  renderTimeline();

  detail.innerHTML =
    '<div class="detail-header">' +
      '<div><span class="detail-kicker">' + escapeHtml(period.era) + '</span><h2>' + escapeHtml(period.label) + '</h2><span class="detail-years">' + escapeHtml(period.years) + '</span></div>' +
      '<button class="detail-close" type="button" aria-label="Fechar detalhes"><i class="fas fa-times"></i></button>' +
    '</div>' +
    '<div class="detail-intro"><p class="history-lead">' + escapeHtml((periodNarratives[period.id] && periodNarratives[period.id].lead) || period.description) + '</p>' +
    ((periodNarratives[period.id] && periodNarratives[period.id].sections) || []).map(section =>
      '<section class="history-story-section"><h3>' + escapeHtml(section[0]) + '</h3><p>' + escapeHtml(section[1]) + '</p></section>'
    ).join("") +
    '<div class="history-source-note"><strong>Contexto administrativo:</strong> ' + escapeHtml(period.context) + '</div>' +
    '<div class="period-history"><div class="detail-section-title"><span>O que aconteceu neste período</span><small>' + milestones.filter(item => item.period === period.id).length + ' marcos</small></div>' +
      '<div class="period-history-list">' + milestones.filter(item => item.period === period.id).map(item =>
        '<article class="period-history-item"><time>' + escapeHtml(item.year) + '</time><div><h4>' + escapeHtml(item.title) + '</h4><p>' + escapeHtml(item.description) + '</p></div></article>'
      ).join("") + '</div></div>' +
    '<div class="leaders"><div class="detail-section-title"><span>Governantes e ocupantes do poder</span><small>' + period.leaders.length + ' registro' + (period.leaders.length === 1 ? "" : "s") + '</small></div>' +
    period.leaders.map(leader =>
      '<article class="leader-card">' +
        '<div class="leader-heading"><div><h3>' + escapeHtml(leader.name) + '</h3><span>' + escapeHtml(leader.role) + '</span></div><time>' + escapeHtml(leader.years) + '</time></div>' +
        '<div class="leader-columns">' +
          '<div><h4>Realizações e medidas</h4><ul>' + leader.achievements.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul></div>' +
          '<div><h4>Problemas e controvérsias</h4><ul>' + leader.controversies.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul></div>' +
        '</div>' +
      '</article>'
    ).join("") +
    '</div>' +
    '<div class="events"><h3>Principais acontecimentos</h3><div class="event-list">' + period.events.map(event => '<span>' + escapeHtml(event) + '</span>').join("") + '</div></div>';

  const closeModal = () => {
    activePeriod = null;
    detail.classList.remove("open");
    document.body.classList.remove("history-modal-open");
    renderTimeline();
    detail.innerHTML = '<div class="history-detail-empty"><span class="detail-kicker">Selecione um período</span><h2>Explore a história política do Brasil.</h2><p>Escolha um marco na linha do tempo para abrir o período histórico, seus ocupantes do poder, principais medidas e controvérsias.</p></div>';
  };

  detail.querySelector(".detail-close").addEventListener("click", closeModal);

  detail.addEventListener("click", event => {
    if (event.target === detail) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && detail.classList.contains("open")) closeModal();
  });

  detail.classList.add("open");
  document.body.classList.add("history-modal-open");
  detail.querySelector(".detail-close").focus();
}

search.addEventListener("input", renderTimeline);
renderFilters();
renderTimeline();
