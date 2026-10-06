const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const savedTheme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", savedTheme);

const updateThemeControl = theme => {
  if (!themeToggle || !themeIcon) return;
  const isDark = theme === "dark";
  themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  themeToggle.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
};

updateThemeControl(savedTheme);

themeToggle?.addEventListener("click", () => {
  const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  updateThemeControl(theme);
});

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
      { name: "Junta Governativa Provisória de 1930", years: "1930", role: "Governo provisório", achievements: ["Exerceu o poder após a deposição de Washington Luís e antes da posse de Getúlio Vargas"], controversies: ["Assunção do poder sem eleição durante a ruptura política de 1930"] },
      { name: "Getúlio Vargas", years: "1930–1945", role: "Chefe do Governo Provisório, presidente e chefe do Estado Novo", achievements: ["Criação e consolidação de legislação trabalhista", "Criação de instituições econômicas e administrativas", "Industrialização e fortalecimento do Estado nacional"], controversies: ["Fechamento do Congresso e suspensão de direitos no Estado Novo", "Censura e repressão política", "Perseguição a opositores"] }
    ],
    events: ["Revolução de 1930", "Constituição de 1934", "Estado Novo (1937)", "CLT (1943)", "Entrada do Brasil na Segunda Guerra Mundial"]
  },
  {
    id: "republica-1946",
    era: "República",
    label: "Transição democrática e República de 1946",
    years: "1945–1964",
    description: "Período de transição iniciado com a queda do Estado Novo em 1945, seguido pela ordem constitucional de 1946. Incluiu eleições, pluralismo partidário e crises políticas até a ruptura institucional de 1964.",
    context: "José Linhares assumiu a Presidência em outubro de 1945 durante a transição. A Constituição de 1946 reorganizou as instituições democráticas; a fase terminou com a deposição de João Goulart em 1964.",
    leaders: [
      { name: "José Linhares", years: "1945–1946", role: "Presidente interino", achievements: ["Condução da transição para eleições e nova ordem constitucional"], controversies: ["Governo de transição em contexto de forte disputa política"] },
      { name: "Eurico Gaspar Dutra", years: "1946–1951", role: "Presidente", achievements: ["Promulgação e implementação da Constituição de 1946", "Reorganização institucional do pós-Estado Novo"], controversies: ["Proibição do PCB e cassação de seus mandatos", "Política econômica com problemas de inflação e reservas externas"] },
      { name: "Getúlio Vargas", years: "1951–1954", role: "Presidente eleito", achievements: ["Criação da Petrobras", "Políticas de desenvolvimento e nacionalismo econômico"], controversies: ["Crise política de 1954", "Conflitos entre governo, oposição e imprensa"] },
      { name: "Café Filho", years: "1954–1955", role: "Presidente", achievements: ["Transição após a morte de Vargas", "Organização do processo eleitoral de 1955"], controversies: ["Crise política envolvendo a sucessão presidencial"] },
      { name: "Carlos Luz", years: "1955", role: "Presidente interino", achievements: ["Exercício da Presidência durante a crise sucessória de 1955"], controversies: ["Deposto pelo movimento militar liderado pelo general Lott"] },
      { name: "Nereu Ramos", years: "1955–1956", role: "Presidente interino", achievements: ["Garantia da transição para a posse de Juscelino Kubitschek"], controversies: ["Governo marcado pela crise institucional de 1955"] },
      { name: "Juscelino Kubitschek", years: "1956–1961", role: "Presidente", achievements: ["Plano de Metas", "Construção e inauguração de Brasília", "Expansão da indústria e infraestrutura"], controversies: ["Aumento da inflação e da dívida pública", "Desigualdades regionais e críticas ao modelo de desenvolvimento"] },
      { name: "Jânio Quadros", years: "1961", role: "Presidente", achievements: ["Política externa independente em alguns temas", "Medidas de austeridade e reformas administrativas"], controversies: ["Renúncia após poucos meses", "Crise política que antecedeu a posse de João Goulart"] },
      { name: "Ranieri Mazzilli", years: "1961", role: "Presidente interino", achievements: ["Exercício interino da Presidência durante a crise sucessória após a renúncia de Jânio Quadros"], controversies: ["Instabilidade institucional que antecedeu a adoção do parlamentarismo e a posse de João Goulart"] },
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
      { name: "Dilma Rousseff", years: "2011–2016", role: "Presidenta", achievements: ["Expansão de programas sociais e de infraestrutura", "Políticas de ampliação do acesso à educação e moradia"], controversies: ["Recessão e crise fiscal", "Impeachment concluído em 2016, formalmente relacionado a decretos orçamentários e atrasos em repasses; a interpretação jurídica e política do processo é objeto de debate"] },
      { name: "Michel Temer", years: "2016–2019", role: "Presidente", achievements: ["Reforma trabalhista", "Teto de gastos instituído pela Emenda Constitucional 95", "Medidas de ajuste fiscal"], controversies: ["Denúncias apresentadas pela Procuradoria-Geral da República em 2017; a Câmara dos Deputados barrou a autorização para processá-lo enquanto ocupava a Presidência", "Controvérsias sobre reformas e austeridade"] },
      { name: "Jair Bolsonaro", years: "2019–2023", role: "Presidente", achievements: ["Reforma da Previdência", "Marco legal de alguns setores de infraestrutura", "Auxílio emergencial durante a pandemia"], controversies: ["Condução e conflitos políticos durante a pandemia de COVID-19", "Questionamentos públicos sobre o sistema eleitoral; o TSE confirmou o resultado oficial da eleição de 2022"] },
      { name: "Luiz Inácio Lula da Silva", years: "2023–atualidade", role: "Presidente", achievements: ["Retomada e criação de programas e políticas federais", "Reforma tributária aprovada durante o mandato", "Atuação internacional em fóruns multilaterais"], controversies: ["Debates sobre política fiscal e gastos públicos", "Conflitos políticos e divergências sobre prioridades econômicas e sociais"] }
    ],
    events: ["Constituição de 1988", "Plano Real (1994)", "Impeachment de Fernando Collor (1992)", "Impeachment de Dilma Rousseff (2016)", "Pandemia de COVID-19", "Eleição presidencial de 2022"]
  }
];

const presidentNames = new Set([
  "Deodoro da Fonseca", "Floriano Peixoto", "Prudente de Morais", "Campos Sales",
  "Rodrigues Alves", "Afonso Pena", "Nilo Peçanha", "Hermes da Fonseca",
  "Venceslau Brás", "Delfim Moreira", "Epitácio Pessoa", "Artur Bernardes",
  "Washington Luís", "Getúlio Vargas", "José Linhares", "Eurico Gaspar Dutra",
  "Café Filho", "Carlos Luz", "Nereu Ramos", "Juscelino Kubitschek",
  "Jânio Quadros", "Ranieri Mazzilli", "João Goulart", "Humberto Castelo Branco",
  "Artur da Costa e Silva", "Emílio Garrastazu Médici", "Ernesto Geisel",
  "João Figueiredo", "José Sarney", "Fernando Collor", "Itamar Franco",
  "Fernando Henrique Cardoso", "Luiz Inácio Lula da Silva", "Dilma Rousseff",
  "Michel Temer", "Jair Bolsonaro", "Junta Militar",
  "Junta Governativa Provisória de 1930"
]);

const presidents = [];
const presidentByName = new Map();

periods.forEach(period => {
  period.leaders.forEach(leader => {
    if (!presidentNames.has(leader.name)) return;
    let president = presidentByName.get(leader.name);
    if (!president) {
      president = {
        name: leader.name,
        years: [],
        roles: [],
        achievements: [],
        controversies: [],
        periods: [],
        periodIds: [],
        collective: leader.name.startsWith("Junta"),
        trajectory: leader.name === "Junta Militar"
          ? "Governo colegiado formado pelos ministros militares durante o impedimento de Costa e Silva; não corresponde a uma presidência individual."
          : leader.name === "Junta Governativa Provisória de 1930"
            ? "Governo colegiado que assumiu após a Revolução de 1930 e transferiu o poder a Getúlio Vargas em novembro daquele ano."
            : ""
      };
      presidentByName.set(leader.name, president);
      presidents.push(president);
    }
    [leader.years].forEach(year => {
      if (!president.years.includes(year)) president.years.push(year);
    });
    if (!president.roles.includes(leader.role)) president.roles.push(leader.role);
    if (!president.periods.includes(period.label)) president.periods.push(period.label);
    if (!president.periodIds.includes(period.id)) president.periodIds.push(period.id);
    leader.achievements.forEach(item => {
      if (!president.achievements.includes(item)) president.achievements.push(item);
    });
    leader.controversies.forEach(item => {
      if (!president.controversies.includes(item)) president.controversies.push(item);
    });
  });
});


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
    title: "Transição democrática e República de 1946",
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


deepDives.push(
  {
    id: "capitanias-1534", period: "colonial", year: "1534", title: "As capitanias hereditárias",
    summary: "A Coroa portuguesa dividiu parte do território em grandes faixas entregues a donatários para estimular a ocupação e reduzir os custos da colonização.",
    sections: [
      ["O problema da ocupação", "Portugal precisava transformar uma costa extensa em território efetivamente ocupado. A presença de outros europeus e os custos de defesa aumentavam a pressão para criar núcleos permanentes de povoamento."],
      ["O sistema", "As capitanias eram grandes porções de terra concedidas a particulares por meio de cartas de doação e forais. Os donatários recebiam atribuições administrativas e econômicas, mas o território continuava submetido à soberania da Coroa."],
      ["Resultados desiguais", "Poucas capitanias conseguiram desenvolver núcleos coloniais duradouros. Pernambuco e São Vicente se destacaram, enquanto outras enfrentaram dificuldades financeiras, conflitos locais e resistência indígena."],
      ["O que veio depois", "A experiência ajudou a demonstrar a necessidade de maior coordenação central. Em 1549, a Coroa criou o Governo-Geral, sem eliminar as capitanias."]
    ]
  },
  {
    id: "governo-geral-1549", period: "colonial", year: "1549", title: "O Governo-Geral",
    summary: "A criação do Governo-Geral procurou coordenar a colonização portuguesa e fortalecer a administração na América.",
    sections: [
      ["A criação", "Tomé de Sousa chegou à Bahia em 1549 como primeiro governador-geral. A cidade de Salvador foi fundada para funcionar como sede administrativa."],
      ["Administração", "O novo sistema reuniu funções militares, judiciais e administrativas e buscou articular as capitanias. A administração também envolveu relações com povos indígenas, missões religiosas e organização da produção."],
      ["Igreja e colonização", "Jesuítas acompanharam o processo de colonização e atuaram na catequese e na educação. As relações entre missionários, colonos e povos indígenas foram marcadas tanto por alianças quanto por conflitos sobre escravização e controle territorial."],
      ["Legado", "O Governo-Geral foi uma etapa importante na construção de uma administração colonial centralizada, embora as autoridades locais e os poderes econômicos continuassem fundamentais."]
    ]
  },
  {
    id: "uniao-iberica-1580", period: "colonial", year: "1580", title: "A União Ibérica",
    summary: "A crise sucessória portuguesa colocou Portugal e seus domínios sob a mesma monarquia dos Habsburgo espanhóis por seis décadas.",
    sections: [
      ["A crise sucessória", "Em 1578, o rei português D. Sebastião morreu sem deixar herdeiro. Depois de uma sucessão disputada, Filipe II da Espanha tornou-se Filipe I de Portugal em 1580."],
      ["Dois reinos, um monarca", "Portugal manteve instituições próprias, mas passou a compartilhar o soberano com a monarquia espanhola. O período ficou conhecido como União Ibérica e durou até 1640."],
      ["Efeitos no Brasil", "A mudança facilitou a expansão territorial portuguesa para áreas além dos limites definidos pelo Tratado de Tordesilhas, já que a divisão entre domínios portugueses e espanhóis perdeu parte de sua função política."],
      ["O fim", "A restauração da independência portuguesa em 1640 encerrou a União Ibérica. A experiência deixou consequências duradouras nas fronteiras e nas disputas coloniais."]
    ]
  },
  {
    id: "ouro-1690", period: "colonial", year: "1690s", title: "A mineração e o ouro",
    summary: "A descoberta de grandes jazidas de ouro deslocou o centro econômico da colônia para o interior e acelerou a ocupação de novas áreas.",
    sections: [
      ["A descoberta", "No final do século XVII, descobertas de ouro em Minas Gerais atraíram pessoas de diferentes partes da colônia e de Portugal. Novos arraiais cresceram rapidamente."],
      ["A economia", "A mineração estimulou comércio, transporte, criação de animais e abastecimento. O ouro também aumentou a arrecadação da Coroa e a circulação monetária."],
      ["Controle e impostos", "Portugal criou mecanismos para controlar a produção e cobrar tributos. O quinto, correspondente a uma parcela do ouro extraído, tornou-se símbolo da fiscalização metropolitana."],
      ["Uma nova sociedade", "A região mineradora produziu uma sociedade urbana e diversificada, mas profundamente desigual, dependente do trabalho escravizado e marcada por conflitos entre autoridades, mineradores e população."]
    ]
  },
  {
    id: "inconfidencia-1789", period: "colonial", year: "1789", title: "A Inconfidência Mineira",
    summary: "Uma conspiração articulada em Minas Gerais contestou o domínio português e foi reprimida antes de chegar à ação planejada.",
    sections: [
      ["O contexto", "A queda da produção de ouro e a cobrança de tributos alimentaram tensões entre setores da elite mineira e a administração portuguesa. Ideias políticas vindas do Iluminismo e da independência dos Estados Unidos também circulavam entre grupos letrados."],
      ["A conspiração", "Participaram militares, religiosos, proprietários e intelectuais. O movimento discutia a criação de uma república em Minas e outras mudanças, mas não chegou a iniciar uma rebelião aberta."],
      ["A denúncia", "A conspiração foi denunciada às autoridades. Joaquim Silvério dos Reis entregou informações ao governador, e os envolvidos foram presos."],
      ["Tiradentes", "Joaquim José da Silva Xavier, o Tiradentes, foi executado em 1792. Outros participantes receberam penas diferentes, posteriormente comutadas ou reduzidas."],
      ["Memória", "O episódio ganhou novos significados ao longo dos séculos. Durante a República, Tiradentes foi transformado em símbolo nacional, embora o movimento original tenha reunido interesses e projetos variados."]
    ]
  },
  {
    id: "revolucao-pernambucana-1817", period: "joanino", year: "1817", title: "A Revolução Pernambucana",
    summary: "Uma revolta republicana e separatista tomou o poder em Pernambuco por algumas semanas antes de ser derrotada pelas forças do governo.",
    sections: [
      ["As causas", "Impostos, dificuldades econômicas, insatisfação com a presença da corte no Rio de Janeiro e circulação de ideias republicanas contribuíram para o movimento."],
      ["O governo revolucionário", "Em março de 1817, os revoltosos derrubaram o governo provincial e formaram um governo provisório. O movimento buscou apoio em outras capitanias, mas não conseguiu consolidar uma revolução de escala nacional."],
      ["A repressão", "Forças leais à monarquia cercaram os rebeldes. A experiência terminou em maio de 1817 e seus principais líderes foram presos e executados ou condenados."],
      ["Importância", "A Revolução Pernambucana demonstrou que a presença da corte não eliminara os conflitos regionais e políticos. Pernambuco voltaria a ser centro de oposição durante a Confederação do Equador."]
    ]
  },
  {
    id: "confederacao-equador-1824", period: "primeiro-reinado", year: "1824", title: "A Confederação do Equador",
    summary: "Uma revolta republicana e federalista surgiu no Nordeste contra a centralização do novo Império e foi derrotada militarmente.",
    sections: [
      ["O conflito", "A dissolução da Assembleia Constituinte em 1823 e a Constituição outorgada em 1824 provocaram forte oposição em Pernambuco e outras províncias."],
      ["O projeto", "Os revoltosos defendiam maior autonomia provincial e organizaram uma confederação de inspiração republicana. Frei Caneca tornou-se uma das figuras mais conhecidas do movimento."],
      ["A repressão", "O governo imperial enviou forças militares e bloqueou a região. A revolta foi derrotada ainda em 1824."],
      ["Consequências", "A repressão consolidou temporariamente a autoridade central do Império, mas também deixou uma memória duradoura de resistência ao centralismo imperial."]
    ]
  },
  {
    id: "abdicao-1831", period: "primeiro-reinado", year: "1831", title: "A abdicação de D. Pedro I",
    summary: "A crise política que se agravou no final do Primeiro Reinado levou D. Pedro I a abdicar do trono em favor de seu filho.",
    sections: [
      ["A crise", "Conflitos entre grupos políticos, dificuldades econômicas, a Guerra da Cisplatina e a intensa disputa em torno da influência portuguesa desgastaram o governo."],
      ["A pressão política", "No Rio de Janeiro, manifestações e confrontos entre grupos políticos e portugueses aumentaram. O imperador perdeu apoio de setores que antes sustentavam sua autoridade."],
      ["7 de abril", "D. Pedro I abdicou em 7 de abril de 1831. Seu filho Pedro de Alcântara tinha cinco anos, o que tornou impossível um governo pessoal imediato."],
      ["O novo período", "A Constituição previa regência durante a menoridade. Começava uma década de experiências institucionais e conflitos provinciais."]
    ]
  },
  {
    id: "cabanagem-1835", period: "regencias", year: "1835", title: "A Cabanagem",
    summary: "Uma das maiores revoltas do período regencial levou grupos populares ao controle de Belém e provocou uma guerra prolongada no Grão-Pará.",
    sections: [
      ["A sociedade amazônica", "A população do Grão-Pará era marcada por profundas desigualdades e pela distância em relação ao centro político do Império. Indígenas, mestiços, negros, pobres urbanos e setores das elites participaram do conflito em diferentes momentos."],
      ["A tomada de Belém", "Em 1835, os rebeldes ocuparam a capital provincial e estabeleceram governos próprios. O movimento passou por diferentes lideranças e alianças."],
      ["A guerra", "As forças imperiais retomaram Belém, mas a resistência continuou no interior. A repressão foi extremamente violenta e provocou grande número de mortes."],
      ["Significado", "A Cabanagem mostrou que a construção do Estado imperial enfrentava conflitos profundos sobre poder local, condições sociais e integração territorial."]
    ]
  },
  {
    id: "farroupilha-1835", period: "regencias", year: "1835", title: "A Revolução Farroupilha",
    summary: "A mais longa revolta do período regencial começou no Rio Grande do Sul e chegou a formar uma república separatista.",
    sections: [
      ["As causas", "Disputas sobre impostos, comércio de charque, autonomia provincial e relações com o governo central contribuíram para a revolta."],
      ["A República Rio-Grandense", "Os farroupilhas proclamaram uma república em 1836. A guerra também alcançou Santa Catarina, onde foi proclamada a República Juliana em 1839."],
      ["A longa guerra", "O conflito atravessou o período regencial e parte do Segundo Reinado. Giuseppe Garibaldi participou da luta ao lado dos farroupilhas antes de retornar à Europa."],
      ["O acordo", "Em 1845, o governo imperial negociou a paz. Parte das reivindicações foi acomodada por meio da anistia e de acordos com os líderes rebeldes."]
    ]
  },
  {
    id: "guerra-paraguai-1864", period: "segundo-reinado", year: "1864", title: "A Guerra do Paraguai",
    summary: "O maior conflito armado do Brasil no século XIX envolveu a Tríplice Aliança contra o Paraguai e produziu profundas consequências humanas, econômicas e políticas.",
    sections: [
      ["A formação do conflito", "As disputas pelo controle político e econômico da região do Prata envolveram Brasil, Argentina, Paraguai e Uruguai. Em 1864, tropas paraguaias invadiram Mato Grosso e, posteriormente, territórios argentinos e brasileiros."],
      ["A Tríplice Aliança", "Brasil, Argentina e Uruguai formaram uma aliança contra o Paraguai em 1865. O conflito se prolongou por cinco anos."],
      ["A guerra", "Batalhas como Tuiuti, Curupaiti, Humaitá e a campanha final no Paraguai marcaram o conflito. O Brasil mobilizou grande quantidade de soldados, incluindo escravizados e libertos em diferentes condições."],
      ["Consequências", "A guerra ampliou o peso político das Forças Armadas brasileiras e aumentou os custos financeiros do Estado. O Paraguai sofreu destruição e enorme perda populacional, embora as estimativas históricas sobre o número exato de mortos variem."],
      ["Depois da guerra", "A experiência militar contribuiu para mudanças na sociedade brasileira e para o fortalecimento de setores do Exército que posteriormente participariam da crise da monarquia."]
    ]
  },
  {
    id: "lei-eusebio-1850", period: "segundo-reinado", year: "1850", title: "A Lei Eusébio de Queirós",
    summary: "A lei de 1850 reprimiu o tráfico transatlântico de africanos escravizados e alterou profundamente a dinâmica do sistema escravista.",
    sections: [
      ["O tráfico", "Milhões de africanos foram transportados à força para as Américas ao longo de séculos. O Brasil recebeu a maior parcela dos africanos desembarcados nas Américas."],
      ["A pressão contra o tráfico", "A Grã-Bretanha pressionava o Brasil para cumprir acordos anteriores de combate ao comércio transatlântico. A legislação brasileira contra o tráfico existia, mas sua aplicação havia sido limitada."],
      ["A lei", "A Lei nº 581, de 4 de setembro de 1850, estabeleceu medidas mais efetivas contra a entrada de africanos escravizados. A repressão naval e administrativa aumentou."],
      ["Consequências", "O tráfico transatlântico diminuiu fortemente. O sistema escravista, porém, continuou por quase quatro décadas, agora dependendo principalmente do crescimento natural da população escravizada e do tráfico interno entre províncias."]
    ]
  },
  {
    id: "revolta-vacina-1904", period: "primeira-republica", year: "1904", title: "A Revolta da Vacina",
    summary: "A campanha obrigatória de vacinação contra a varíola desencadeou uma revolta urbana no Rio de Janeiro em meio a reformas profundas da cidade.",
    sections: [
      ["A cidade em transformação", "O governo Rodrigues Alves promoveu reformas urbanas e sanitárias no Rio de Janeiro. A abertura de avenidas e demolições alterou bairros e deslocou moradores."],
      ["As campanhas sanitárias", "Oswaldo Cruz coordenou ações contra doenças como febre amarela, peste bubônica e varíola. Algumas medidas eram coercitivas e provocavam forte reação social."],
      ["A revolta", "Em novembro de 1904, protestos contra a vacinação obrigatória se transformaram em confrontos e barricadas. Também participaram grupos políticos que buscavam aproveitar a crise."],
      ["Depois", "O governo reprimiu o movimento e suspendeu a obrigatoriedade temporariamente. O episódio mostrou que políticas públicas de saúde podiam gerar resistência quando aplicadas sem consenso social e em meio a profundas desigualdades urbanas."]
    ]
  },
  {
    id: "canudos-1896", period: "primeira-republica", year: "1896–1897", title: "A Guerra de Canudos",
    summary: "O conflito no sertão baiano colocou a comunidade de Canudos contra expedições militares da República e terminou com sua destruição.",
    sections: [
      ["Antônio Conselheiro", "Antônio Vicente Mendes Maciel, conhecido como Antônio Conselheiro, reuniu seguidores no sertão nordestino. A comunidade de Belo Monte, em Canudos, cresceu rapidamente."],
      ["O conflito", "Autoridades locais e setores das elites passaram a enxergar Canudos como ameaça. Expedições militares foram enviadas contra a comunidade e as primeiras foram derrotadas."],
      ["A campanha final", "Uma grande expedição do Exército cercou Canudos em 1897. Após combates prolongados, a comunidade foi destruída."],
      ["A memória", "Euclides da Cunha registrou o conflito em Os Sertões. Canudos tornou-se um dos episódios mais estudados da Primeira República e revelou as tensões entre Estado, elites regionais, pobreza rural e comunidades sertanejas."]
    ]
  },
  {
    id: "revolucao-1932", period: "vargas", year: "1932", title: "A Revolução Constitucionalista",
    summary: "São Paulo se levantou contra o Governo Provisório de Vargas em 1932, defendendo a convocação de uma Constituinte e maior autonomia política.",
    sections: [
      ["O Governo Provisório", "Após 1930, Vargas governava sem uma Constituição nacional em vigor. São Paulo perdeu parte da autonomia política que possuía durante a Primeira República."],
      ["O movimento", "Em julho de 1932, forças paulistas iniciaram a luta armada. O movimento recebeu apoio social significativo no estado e mobilizou uma campanha de propaganda e arrecadação."],
      ["A derrota", "As tropas federais cercaram os revoltosos. Após cerca de três meses de combates, São Paulo se rendeu em outubro."],
      ["O resultado político", "Embora militarmente derrotado, o movimento acelerou a convocação de eleições para uma Assembleia Constituinte. Em 1934, o Brasil recebeu uma nova Constituição."]
    ]
  },
  {
    id: "clt-1943", period: "vargas", year: "1943", title: "A Consolidação das Leis do Trabalho",
    summary: "A CLT reuniu e sistematizou normas trabalhistas construídas durante a Era Vargas e tornou-se uma das principais referências da legislação do trabalho no Brasil.",
    sections: [
      ["Antes da CLT", "Durante as décadas anteriores a 1943, o governo federal criou diversas normas sobre jornada, descanso, salário, sindicatos e relações de trabalho. A legislação estava espalhada em diferentes atos."],
      ["A consolidação", "O Decreto-Lei nº 5.452, de 1º de maio de 1943, aprovou a Consolidação das Leis do Trabalho. A CLT organizou normas já existentes e criou uma estrutura sistemática para as relações trabalhistas."],
      ["Trabalho e Estado", "A legislação fortaleceu a presença do Estado nas relações entre trabalhadores e empregadores e vinculou sindicatos a regras de organização e reconhecimento oficial."],
      ["Legado e debates", "A CLT atravessou diferentes regimes políticos e foi modificada muitas vezes. Sua existência se tornou central nos debates sobre direitos trabalhistas, sindicalismo e relações entre Estado, empresas e trabalhadores."]
    ]
  },
  {
    id: "petrobras-1953", period: "republica-1946", year: "1953", title: "A criação da Petrobras",
    summary: "A criação da Petrobras consolidou uma política estatal de exploração de petróleo e se tornou um marco do nacionalismo econômico brasileiro.",
    sections: [
      ["A campanha do petróleo", "Desde a década de 1940, o petróleo era tema de intenso debate. A campanha 'O petróleo é nosso' defendia maior participação do Estado na exploração do recurso."],
      ["A criação", "Em 1953, o governo Getúlio Vargas sancionou a lei que criou a Petrobras, estabelecendo um modelo estatal para a exploração, produção, refino e transporte de petróleo."],
      ["O papel econômico", "A empresa passou a ocupar posição central na política energética brasileira e posteriormente ampliou sua atuação com descobertas de novas reservas e desenvolvimento tecnológico."],
      ["Debate histórico", "A criação refletiu uma disputa maior sobre o papel do Estado na economia, a participação estrangeira e o controle de recursos estratégicos."]
    ]
  },
  {
    id: "brasilia-1960", period: "republica-1946", year: "1960", title: "A construção de Brasília",
    summary: "A transferência da capital para o interior foi um dos maiores projetos do governo Juscelino Kubitschek e marcou a arquitetura, a infraestrutura e a ocupação territorial do país.",
    sections: [
      ["Um projeto antigo", "A ideia de transferir a capital para o interior aparecia em projetos anteriores e foi incorporada à Constituição de 1891. Juscelino Kubitschek decidiu executá-la como parte de seu programa de desenvolvimento."],
      ["A construção", "O Plano de Metas incluiu a construção de Brasília. Lúcio Costa elaborou o plano urbanístico e Oscar Niemeyer projetou os principais edifícios públicos."],
      ["A inauguração", "Brasília foi inaugurada em 21 de abril de 1960 e tornou-se a nova capital federal."],
      ["Impactos", "A nova capital estimulou a abertura de estradas e a ocupação do Centro-Oeste, mas também envolveu grandes deslocamentos de trabalhadores e produziu debates sobre custos, urbanização e desigualdade."]
    ]
  },
  {
    id: "ai5-1968", period: "regime-militar", year: "1968", title: "O AI-5",
    summary: "O Ato Institucional nº 5 ampliou drasticamente os poderes do regime militar e marcou uma fase de maior repressão política.",
    sections: [
      ["O contexto", "Em 1968, o país vivia protestos estudantis, greves, manifestações políticas e confrontos entre grupos de diferentes orientações ideológicas. O governo também enfrentava oposição no Congresso."],
      ["A edição", "Em 13 de dezembro de 1968, o governo Costa e Silva decretou o AI-5. O ato permitiu fechar o Congresso, intervir em estados e municípios e suspender direitos políticos, entre outras medidas."],
      ["A repressão", "A censura se intensificou e órgãos de segurança passaram a atuar com maior alcance contra opositores. Prisões, tortura, desaparecimentos e outras violações de direitos humanos ocorreram durante o regime."],
      ["A revogação", "O AI-5 foi revogado em 1978, durante o governo Ernesto Geisel, como parte do processo de abertura política."]
    ]
  },
  {
    id: "anistia-1979", period: "regime-militar", year: "1979", title: "A Lei da Anistia",
    summary: "A Lei de Anistia de 1979 foi um marco da transição política e permitiu o retorno de exilados e a libertação de parte dos presos por crimes políticos.",
    sections: [
      ["A pressão pela anistia", "Movimentos sociais, familiares de presos e desaparecidos e setores políticos passaram a exigir anistia ampla e retorno dos exilados. A campanha ganhou força durante a abertura política."],
      ["A lei", "A Lei nº 6.683, de agosto de 1979, concedeu anistia a pessoas atingidas por atos políticos entre determinados períodos, incluindo crimes políticos e conexos previstos no texto."],
      ["Retorno", "A medida permitiu o retorno de numerosos brasileiros que estavam no exílio e alterou o cenário político, que também passava por reorganização partidária."],
      ["Controvérsia histórica", "A interpretação da extensão da anistia a agentes estatais envolvidos em violações de direitos humanos tornou-se objeto de disputas jurídicas e políticas posteriores."]
    ]
  },
  {
    id: "diretas-1984", period: "regime-militar", year: "1983–1984", title: "Diretas Já",
    summary: "A campanha pelas eleições diretas para presidente mobilizou grandes manifestações e se tornou um marco da redemocratização.",
    sections: [
      ["A proposta", "O deputado Dante de Oliveira apresentou uma emenda constitucional para restabelecer a eleição direta para presidente. A proposta ganhou apoio de diferentes partidos e movimentos sociais."],
      ["As manifestações", "Entre 1983 e 1984, comícios reuniram grandes multidões em diversas cidades. Artistas, políticos, sindicatos, estudantes e organizações da sociedade civil participaram da campanha."],
      ["A votação", "Em abril de 1984, a emenda não alcançou os votos necessários na Câmara dos Deputados. A eleição presidencial de 1985 permaneceu indireta."],
      ["O resultado histórico", "Mesmo sem aprovar a eleição direta naquele momento, a campanha fortaleceu a mobilização pela abertura política e se tornou símbolo da transição democrática."]
    ]
  },
  {
    id: "collor-1992", period: "nova-republica", year: "1992", title: "O impeachment de Fernando Collor",
    summary: "Uma crise política iniciada por denúncias de corrupção culminou na abertura e conclusão de um processo de impeachment presidencial em 1992.",
    sections: [
      ["O governo", "Fernando Collor assumiu em 1990 após a primeira eleição presidencial direta desde 1960. Seu governo adotou medidas de abertura econômica e tentou combater a inflação."],
      ["As denúncias", "Em 1992, Pedro Collor acusou Paulo César Farias de operar um esquema de arrecadação ligado ao governo. Uma comissão parlamentar de inquérito e investigações ampliaram a crise."],
      ["O processo", "A Câmara dos Deputados autorizou a abertura do processo de impeachment em setembro de 1992. Collor renunciou em dezembro, durante o julgamento no Senado."],
      ["A sucessão", "Itamar Franco assumiu a Presidência. O processo representou um teste das instituições estabelecidas pela Constituição de 1988."]
    ]
  },
  {
    id: "eleicao-2002", period: "nova-republica", year: "2003", title: "A eleição de Lula e a mudança de governo",
    summary: "A eleição de 2002 levou Luiz Inácio Lula da Silva à Presidência e marcou uma importante alternância política na Nova República.",
    sections: [
      ["A campanha", "Lula disputou a Presidência pela quarta vez e venceu José Serra no segundo turno de 2002. A transição ocorreu em ambiente de preocupação com inflação, dívida e estabilidade econômica."],
      ["A transição", "O governo Fernando Henrique Cardoso conduziu a passagem de poder para a equipe de Lula. O novo governo assumiu em janeiro de 2003."],
      ["As políticas", "O governo combinou manutenção de pilares de estabilidade macroeconômica com expansão de políticas sociais e programas de transferência de renda, além de políticas de valorização do salário mínimo."],
      ["O período", "Os anos seguintes foram marcados por crescimento econômico, redução de pobreza em diversos indicadores e expansão do consumo, mas também pelo escândalo do mensalão e outras disputas políticas."]
    ]
  },
  {
    id: "dilma-2016", period: "nova-republica", year: "2016", title: "O impeachment de Dilma Rousseff",
    summary: "O processo de impeachment de 2016 encerrou o segundo mandato de Dilma Rousseff e transferiu a Presidência a Michel Temer.",
    sections: [
      ["O segundo mandato", "Dilma Rousseff foi reeleita em 2014. O governo enfrentou recessão, dificuldades fiscais, queda da arrecadação e forte conflito político no Congresso."],
      ["A abertura do processo", "Em dezembro de 2015, o então presidente da Câmara, Eduardo Cunha, aceitou denúncia que deu início ao processo de impeachment. A Câmara autorizou a abertura em abril de 2016."],
      ["O julgamento", "O Senado aprovou o afastamento definitivo em 31 de agosto de 2016. A acusação se concentrou em decretos de crédito suplementar e atrasos em repasses relacionados ao Plano Safra, enquadrados pelos acusadores como crimes de responsabilidade."],
      ["A sucessão", "Michel Temer, que já exercia interinamente a Presidência desde maio, assumiu definitivamente após a decisão do Senado."]
    ]
  },
  {
    id: "pandemia-2020", period: "nova-republica", year: "2020", title: "A pandemia de COVID-19",
    summary: "A pandemia provocou uma crise sanitária, econômica e social de escala nacional e alterou profundamente a rotina do Brasil.",
    sections: [
      ["A chegada", "Os primeiros casos foram confirmados no Brasil no final de fevereiro de 2020. O vírus se espalhou rapidamente e os estados começaram a adotar medidas de distanciamento e restrição de atividades."],
      ["O sistema de saúde", "Hospitais e unidades do SUS enfrentaram aumento da demanda, enquanto profissionais de saúde trabalhavam em condições de emergência. A vacinação começou no país em janeiro de 2021."],
      ["Economia e proteção social", "A pandemia provocou queda de atividade econômica e levou o governo federal e o Congresso a criar medidas emergenciais, incluindo o auxílio emergencial para milhões de brasileiros."],
      ["Conflitos institucionais", "Houve disputas entre União, estados e municípios sobre medidas sanitárias, aquisição de vacinas e comunicação pública. O período também foi marcado por uma CPI da Pandemia no Senado."],
      ["Consequências", "A pandemia deixou centenas de milhares de mortes no Brasil, impactos educacionais, econômicos e sociais e acelerou mudanças no trabalho, na saúde digital e nos hábitos cotidianos."]
    ]
  },
  {
    id: "eleicao-2022", period: "nova-republica", year: "2022", title: "A eleição presidencial de 2022",
    summary: "A eleição de 2022 ocorreu em um ambiente de forte polarização e terminou com a vitória de Luiz Inácio Lula da Silva no segundo turno.",
    sections: [
      ["A disputa", "Jair Bolsonaro buscou a reeleição e Luiz Inácio Lula da Silva voltou a disputar a Presidência. Outros candidatos participaram do primeiro turno, que não produziu maioria absoluta."],
      ["O segundo turno", "Lula venceu Bolsonaro no segundo turno por uma diferença inferior a dois pontos percentuais dos votos válidos, em uma das eleições presidenciais mais disputadas da história recente."],
      ["A transição", "O resultado foi reconhecido pelas instituições responsáveis pelo processo eleitoral. A equipe de transição iniciou os trabalhos ainda em novembro."],
      ["A posse", "Lula tomou posse em 1º de janeiro de 2023, iniciando seu terceiro mandato presidencial."]
    ]
  },
  {
    id: "reforma-tributaria-2023", period: "nova-republica", year: "2023–2024", title: "A reforma tributária do consumo",
    summary: "A Emenda Constitucional 132 mudou a estrutura constitucional da tributação sobre o consumo e abriu uma longa etapa de regulamentação.",
    sections: [
      ["O problema histórico", "O sistema brasileiro de tributação sobre o consumo era composto por vários tributos distribuídos entre União, estados e municípios, com regras complexas e diferentes bases de incidência."],
      ["A aprovação", "Em dezembro de 2023, o Congresso promulgou a Emenda Constitucional 132. O texto criou bases constitucionais para um novo modelo de tributação sobre o consumo."],
      ["O novo modelo", "A reforma estabeleceu o Imposto sobre Bens e Serviços, de competência compartilhada entre estados e municípios, e a Contribuição sobre Bens e Serviços, federal, além do Imposto Seletivo. A implementação foi planejada de forma gradual."],
      ["Regulamentação", "Em 2024 e nos anos seguintes, leis complementares passaram a detalhar alíquotas, regimes específicos, cashback, transição e funcionamento dos novos tributos. A mudança, portanto, não se encerrou na aprovação da emenda constitucional."]
    ]
  }
);

const restoredMilestones = [
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

const milestoneDeepDiveMap = {
  "1534|Capitanias hereditárias":"capitanias-1534","1580|União Ibérica":"uniao-iberica-1580","1789|Inconfidência Mineira":"inconfidencia-1789",
  "1808|Chegada da corte portuguesa":"corte-1808","1817|Revolução Pernambucana":"revolucao-pernambucana-1817","1822|Independência do Brasil":"independencia-1822",
  "1824|Confederação do Equador":"confederacao-equador-1824","1831|Abdicação de D. Pedro I":"abdicao-1831","1850|Lei Eusébio de Queirós":"lei-eusebio-1850",
  "1864|Início da Guerra do Paraguai":"guerra-paraguai-1864","1888|Lei Áurea":"abolição-1888","1889|Proclamação da República":"republica-1889",
  "1896–1897|Guerra de Canudos":"canudos-1896","1904|Revolta da Vacina":"revolta-vacina-1904","1930|Revolução de 1930":"revolucao-1930",
  "1937|Estado Novo":"estado-novo-1937","1943|Consolidação das Leis do Trabalho":"clt-1943","1953|Criação da Petrobras":"petrobras-1953",
  "1964|Ruptura institucional":"ruptura-1964","1968|AI-5":"ai5-1968","1979|Lei da Anistia":"anistia-1979","1983–1984|Diretas Já":"diretas-1984",
  "1992|Impeachment de Fernando Collor":"collor-1992","1994|Plano Real":"plano-real-1994","2003|Início do primeiro governo Lula":"eleicao-2002",
  "2016|Impeachment de Dilma Rousseff":"dilma-2016","2020|Pandemia de COVID-19":"pandemia-2020","2022|Eleição presidencial":"eleicao-2022",
  "2023–2024|Reforma tributária":"reforma-tributaria-2023"
};

const milestoneDetails = {
  "Chegada da expedição de Cabral":[["O contexto","A chegada portuguesa ocorreu em um território já ocupado por numerosas sociedades indígenas e fazia parte da expansão marítima portuguesa."],["O encontro","A expedição alcançou a costa em abril de 1500. Os primeiros contatos envolveram observação, trocas e comunicação limitada."],["O processo posterior","A ocupação permanente não começou imediatamente. Nas décadas seguintes, a Coroa intensificou a exploração do pau-brasil e a organização territorial."],["Importância","O acontecimento abriu uma nova etapa das relações entre Portugal e os povos do território, mas a formação colonial foi gradual."]],
  "Início da colonização sistemática":[["Contexto","A partir de 1530, a Coroa investiu de forma mais sistemática na ocupação e defesa do território diante de outros interesses europeus."],["Martim Afonso","A expedição de Martim Afonso combinou exploração, defesa, reconhecimento e criação de núcleos de povoamento."],["Capitanias","A experiência abriu caminho para as capitanias hereditárias e para a expansão da agricultura, especialmente do açúcar."],["Consequência","A presença portuguesa passou de uma exploração principalmente comercial para um projeto de ocupação permanente."]],
  "Criação do Governo-Geral":[["Por que foi criado","Os resultados desiguais das capitanias levaram a Coroa a procurar maior coordenação administrativa."],["Tomé de Sousa","Em 1549, Tomé de Sousa chegou como primeiro governador-geral e Salvador tornou-se centro administrativo."],["Administração","O Governo-Geral coordenava defesa, justiça, arrecadação e relações com as capitanias, sem eliminá-las."],["Legado","A criação reforçou a centralização da administração portuguesa na América."]],
  "Expansão da mineração":[["Descobertas","No final do século XVII, descobertas de ouro atraíram população e atividades econômicas para Minas Gerais e outras áreas."],["Nova economia","A mineração criou vilas, mercados, rotas e atividades de abastecimento, alterando o peso econômico do interior."],["Fiscalização","A Coroa ampliou a cobrança de tributos e o controle sobre a produção mineral."],["Consequências","A mineração contribuiu para a interiorização e para a transferência da capital de Salvador para o Rio de Janeiro em 1763."]],
  "Reformas pombalinas":[["Projeto político","O marquês de Pombal buscou reforçar a centralização e o poder da monarquia portuguesa."],["Jesuítas","A expulsão dos jesuítas em 1759 alterou profundamente missões e estruturas educacionais."],["Economia","Companhias de comércio e novas medidas procuraram aumentar arrecadação e controle metropolitano."],["Legado","As reformas modificaram as relações entre Coroa, Igreja e populações coloniais."]],
  "Abertura dos portos":[["Contexto","A transferência da corte ocorreu durante as guerras napoleônicas e sob proteção britânica."],["A medida","Em janeiro de 1808, D. João abriu os portos brasileiros às nações amigas, reduzindo o antigo exclusivo comercial."],["Efeitos","Comerciantes estrangeiros passaram a negociar diretamente com os portos brasileiros e a Grã-Bretanha ganhou posição privilegiada."],["Limites","A abertura não encerrou a escravidão nem as desigualdades sociais."]],
  "Brasil elevado a Reino":[["Contexto","Em 1815, após a permanência da corte no Rio e o fim das guerras napoleônicas, a estrutura do Reino Unido foi reorganizada."],["A mudança","O Brasil foi elevado à condição de reino e passou a integrar o Reino Unido de Portugal, Brasil e Algarves."],["Significado","A medida formalizou a centralidade política adquirida pelo território desde 1808."],["Consequência","A relação entre Brasil e Portugal já era diferente quando a Revolução do Porto começou em 1820."]],
  "Constituição do Império":[["Constituinte","A Assembleia Constituinte de 1823 foi dissolvida por D. Pedro I após conflitos sobre os limites do poder imperial."],["A Carta","A Constituição de 1824 foi outorgada e estabeleceu monarquia constitucional e quatro poderes, incluindo o Moderador."],["Cidadania","O sistema eleitoral era censitário e a escravidão permaneceu como estrutura social e econômica."],["Legado","A Carta organizou a vida política do Império por grande parte do século XIX."]],
  "Ato Adicional":[["Reforma","O Ato Adicional de 1834 modificou a Constituição como resposta às disputas da Regência."],["Autonomia","Foram criadas Assembleias Legislativas Provinciais e ampliadas competências locais."],["Limites","A descentralização não eliminou revoltas e o governo central buscou recuperar instrumentos de controle."],["Legado","A experiência alimentou o debate entre centralização e autonomia no restante do Império."]],
  "Início da Cabanagem e Farroupilha":[["Dois conflitos","Cabanagem e Farroupilha começaram em 1835, mas tiveram causas, participantes e objetivos diferentes."],["Cabanagem","No Grão-Pará, o movimento envolveu setores populares, indígenas, mestiços e elites locais e chegou a controlar Belém."],["Farroupilha","No Rio Grande do Sul, a revolta esteve ligada a interesses regionais e questões fiscais e durou até 1845."],["Legado","Os conflitos mostram as dificuldades de construir autoridade central em um território extenso."]],
  "Golpe da Maioridade":[["Crise","A sequência de revoltas e disputas políticas alimentou a percepção de que o Império precisava de maior estabilidade."],["Decisão","Em 1840, setores políticos anteciparam a maioridade de D. Pedro II, então com 14 anos."],["Governo","D. Pedro II assumiu o poder e formou seu primeiro gabinete."],["Consequência","A decisão encerrou a Regência e iniciou o Segundo Reinado."]],
  "Início da Guerra do Paraguai":[["Contexto","A guerra surgiu em meio às disputas políticas e territoriais na região do Rio da Prata."],["Início","Em 1864, o Paraguai capturou o navio Marquês de Olinda e invadiu Mato Grosso; o conflito se ampliou no ano seguinte."],["Aliança","Brasil, Argentina e Uruguai formaram a Tríplice Aliança contra o Paraguai."],["Consequências","O conflito deixou enormes perdas humanas e econômicas e alterou o peso político das Forças Armadas brasileiras."]],
  "Lei do Ventre Livre":[["A lei","Em 1871, a lei declarou livres os filhos de mulheres escravizadas nascidos após sua vigência, sob condições previstas no próprio texto."],["Limites","A liberdade não era imediata em todos os casos e havia mecanismos que prolongavam vínculos com os senhores."],["Processo","A lei integrou uma sequência de medidas que reduziram gradualmente a escravidão."],["Consequência","O debate avançou até a Lei dos Sexagenários e a Lei Áurea."]],
  "Constituição republicana":[["Mudança de regime","Após a Proclamação da República, o Governo Provisório convocou uma Assembleia Constituinte."],["A Carta de 1891","A Constituição adotou federalismo, presidencialismo e separação entre Estado e Igreja."],["Participação","O voto continuou limitado e mulheres e analfabetos permaneceram excluídos."],["Legado","A Carta definiu instituições básicas da primeira experiência republicana."]],
  "Semana de Arte Moderna":[["O evento","A Semana ocorreu no Teatro Municipal de São Paulo entre 13 e 17 de fevereiro de 1922."],["Artistas","Participaram nomes como Mário de Andrade, Oswald de Andrade, Anita Malfatti e Heitor Villa-Lobos."],["Debate","O modernismo questionava padrões acadêmicos e discutia identidade nacional e linguagem."],["Legado","A Semana tornou-se marco simbólico, embora o modernismo brasileiro fosse muito mais amplo."]],
  "Constituição de 1934":[["Contexto","A Revolução Constitucionalista de 1932 pressionou o governo provisório a convocar uma Constituinte."],["A Carta","Promulgada em 1934, estabeleceu voto secreto, confirmou o voto feminino e incorporou direitos sociais."],["Participação","A Constituição ampliou mecanismos de representação, mas durou poucos anos."],["Fim","Em 1937, Vargas fechou o Congresso e instaurou o Estado Novo."]],
  "Nova Constituição democrática":[["Transição","A deposição de Vargas em 1945 abriu caminho para eleições e reorganização partidária."],["Constituição de 1946","A nova Carta restabeleceu direitos políticos, eleições e instituições representativas."],["Contexto","O Brasil entrou no pós-guerra em meio à Guerra Fria e à industrialização acelerada."],["Legado","A Constituição organizou a vida institucional até a ruptura de 1964."]],
  "Início do governo Juscelino Kubitschek":[["Eleição","Juscelino Kubitschek foi eleito em 1955 e tomou posse em janeiro de 1956."],["Plano de Metas","O governo organizou investimentos em energia, transporte, indústria e infraestrutura."],["Indústria","A indústria automobilística e outros setores receberam incentivos e investimentos."],["Contradições","O crescimento veio acompanhado de inflação, aumento da dívida e desigualdades regionais."]],
  "Inauguração de Brasília":[["Projeto","A transferência da capital para o interior fazia parte de uma ideia antiga presente em projetos políticos brasileiros."],["Construção","JK acelerou a construção a partir de 1956. Lúcio Costa elaborou o plano urbanístico e Oscar Niemeyer projetou edifícios centrais."],["Trabalhadores","Milhares de trabalhadores participaram da construção. A cidade foi inaugurada em 21 de abril de 1960."],["Legado","Brasília tornou-se símbolo da modernização e da interiorização administrativa."]],
  "Renúncia de Jânio Quadros":[["Eleição","Jânio Quadros venceu a eleição presidencial de 1960."],["Renúncia","Em 25 de agosto de 1961, Jânio renunciou inesperadamente à Presidência."],["Crise","Setores militares e políticos resistiram à posse de João Goulart e o parlamentarismo foi adotado como solução."],["Consequência","A crise aprofundou a instabilidade que antecedeu 1964."]],
  "Transição para o governo civil":[["Eleição","Tancredo Neves foi eleito pelo Colégio Eleitoral em janeiro de 1985."],["Doença e morte","Tancredo adoeceu antes da posse e morreu em abril de 1985. José Sarney assumiu a Presidência."],["Nova República","O novo governo marcou o retorno do poder civil após 21 anos de regime militar."],["Desafio","A transição ainda precisava reconstruir instituições e elaborar uma nova Constituição."]],
  "Constituição Federal":[["Constituinte","A Assembleia Nacional Constituinte foi instalada em 1987 e recebeu participação de movimentos sociais e entidades organizadas."],["Promulgação","Em 5 de outubro de 1988, Ulysses Guimarães promulgou a Constituição."],["Direitos","A Carta fortaleceu garantias individuais, direitos sociais, federalismo e mecanismos de controle."],["Importância","A Constituição tornou-se a base jurídica do atual período democrático."]],
  "Primeira eleição presidencial direta desde 1960":[["Retorno das diretas","Em 1989, os brasileiros voltaram a escolher diretamente o presidente da República."],["Campanha","A eleição reuniu grande número de candidatos e teve segundo turno entre Fernando Collor e Luiz Inácio Lula da Silva."],["Resultado","Collor venceu e tomou posse em março de 1990."],["Significado","A eleição completou uma etapa central da redemocratização."]],
  "Início do primeiro governo Lula":[["Eleição","Lula venceu a eleição presidencial de 2002 e tomou posse em janeiro de 2003."],["Economia","O governo manteve inicialmente pilares de estabilidade macroeconômica."],["Políticas sociais","Programas de transferência de renda foram integrados e ampliados, com destaque para o Bolsa Família."],["Contexto","O período também foi marcado por crescimento econômico em parte dos anos e grandes crises políticas."]],
  "Eleição de Dilma Rousseff":[["Eleição","Dilma Rousseff foi eleita em 2010 e tomou posse em 2011, tornando-se a primeira mulher na Presidência."],["Primeiro mandato","O governo deu continuidade a políticas sociais e econômicas e enfrentou as manifestações de 2013."],["Segundo mandato","A reeleição de 2014 ocorreu em ambiente de desaceleração econômica e forte polarização."],["Crise","A crise política e econômica se aprofundou até o processo de impeachment em 2016."]],
  "Início do terceiro governo Lula":[["Eleição","Lula venceu a eleição presidencial de 2022 e tomou posse em 1º de janeiro de 2023."],["Novo contexto","O governo encontrou Congresso fragmentado e sociedade politicamente polarizada."],["Temas","Políticas sociais, meio ambiente, investimento e política fiscal estiveram entre os temas centrais."],["Reforma tributária","Em 2023, a Emenda Constitucional 132 alterou a tributação sobre o consumo."]]
};


const milestoneDetailsExtra = {
  "Capitanias hereditárias": [
    ["Por que foram criadas", "A Coroa portuguesa precisava ocupar e administrar um território muito extenso, mas não dispunha de recursos suficientes para financiar diretamente todos os núcleos de povoamento. Em 1534, D. João III dividiu grande parte do litoral em capitanias e entregou sua administração a donatários."],
    ["Como funcionavam", "Os donatários recebiam direitos e obrigações definidos por cartas de doação e forais. Podiam distribuir terras, fundar vilas, cobrar determinados tributos e organizar a defesa local, mas continuavam submetidos à autoridade da Coroa. O modelo combinava iniciativa privada, ocupação territorial e controle português."],
    ["Sucessos e fracassos", "Algumas capitanias tiveram dificuldades por falta de recursos, conflitos com populações indígenas, distância de Portugal e problemas de abastecimento. Pernambuco e São Vicente conseguiram desenvolver núcleos coloniais mais estáveis, apoiados principalmente pela produção açucareira."],
    ["Mudança administrativa", "As dificuldades do sistema contribuíram para a criação do Governo-Geral em 1549. As capitanias não desapareceram imediatamente, mas passaram a coexistir com uma estrutura de coordenação mais centralizada."],
    ["Importância histórica", "O sistema ajudou a consolidar a ocupação portuguesa e deixou marcas na concentração fundiária e na formação territorial. Também mostra que a colonização foi um processo gradual, desigual e dependente da combinação entre interesses privados e autoridade da monarquia."]
  ],
  "União Ibérica": [
    ["A crise dinástica", "Em 1580, a morte do rei português D. Sebastião e a crise sucessória que se seguiu permitiram que Filipe II da Espanha assumisse também a Coroa portuguesa. Começou a União Ibérica, que manteve Portugal e Espanha sob o mesmo monarca, embora os dois reinos conservassem instituições próprias."],
    ["O Brasil nesse contexto", "A união das coroas alterou o ambiente político da América portuguesa. A separação formal entre as áreas de influência portuguesa e espanhola perdeu parte de sua força, facilitando a circulação e a expansão de grupos portugueses para áreas além dos limites inicialmente estabelecidos."],
    ["Invasões e disputas", "Os inimigos da Espanha passaram a atacar também territórios portugueses. No Nordeste, holandeses ocuparam partes da região açucareira a partir de 1630. A experiência revelou como a posição internacional da monarquia afetava diretamente a economia colonial."],
    ["O fim da união", "Em 1640, uma revolta em Portugal levou à restauração da independência portuguesa e à ascensão da dinastia de Bragança. A separação, porém, não encerrou imediatamente os conflitos militares e econômicos entre Portugal, Espanha e seus aliados."],
    ["Consequências para a América portuguesa", "O período contribuiu para a expansão territorial portuguesa para além das antigas linhas de divisão e alterou as relações comerciais e militares no Atlântico. É um marco importante para entender a formação posterior das fronteiras brasileiras."]
  ],
  "Inconfidência Mineira": [
    ["O cenário de Minas Gerais", "No final do século XVIII, a mineração já não produzia os mesmos volumes das décadas anteriores, mas a administração portuguesa mantinha mecanismos rígidos de tributação. A possibilidade de cobrança de tributos atrasados aumentava a tensão entre autoridades e parte da elite local."],
    ["Quem participou", "A conspiração reuniu proprietários, militares, religiosos e homens letrados. Não havia um único projeto social para o futuro de Minas: os participantes tinham interesses econômicos e políticos diferentes, embora compartilhassem oposição a aspectos do domínio português."],
    ["O plano e a denúncia", "Os conspiradores discutiram a criação de uma república e outras mudanças administrativas. Antes que o levante começasse, Joaquim Silvério dos Reis denunciou a conspiração ao governador. A repressão levou à prisão dos envolvidos."],
    ["Tiradentes e as sentenças", "Joaquim José da Silva Xavier, o Tiradentes, recebeu a pena de morte e foi executado em 21 de abril de 1792. Outros condenados tiveram suas penas modificadas ou foram enviados para o exílio."],
    ["A memória posterior", "A importância simbólica do movimento cresceu muito depois de 1889. A República transformou Tiradentes em personagem central da memória nacional. A interpretação atual distingue esse processo de construção do símbolo dos objetivos e limites da conspiração original."]
  ],
  "Revolução Pernambucana": [
    ["Pernambuco antes da revolta", "A economia pernambucana enfrentava dificuldades, enquanto impostos e despesas associadas à presença da corte no Rio de Janeiro alimentavam insatisfação. Circulavam também ideias liberais, republicanas e autonomistas entre setores da sociedade."],
    ["A tomada do poder", "Em março de 1817, militares e civis revoltosos derrubaram o governador e organizaram um governo provisório. O movimento procurou estabelecer uma república e buscou apoio em outras capitanias do Nordeste."],
    ["Um projeto regional", "A revolta não foi apenas uma reação fiscal. Seus participantes discutiam representação política, liberdade comercial e autonomia. Ao mesmo tempo, a sociedade continuava marcada pela escravidão, e os diferentes grupos envolvidos não necessariamente defendiam as mesmas mudanças sociais."],
    ["A repressão", "O governo de D. João enviou forças militares e bloqueou Pernambuco. O movimento foi derrotado após algumas semanas, e seus principais líderes foram presos e executados ou condenados."],
    ["Legado", "A Revolução Pernambucana tornou-se uma referência de resistência ao centralismo e reapareceu na memória política da região durante a Confederação do Equador, em 1824."]
  ],
  "Confederação do Equador": [
    ["A crise de 1824", "A dissolução da Assembleia Constituinte por D. Pedro I, em 1823, e a outorga da Constituição de 1824 provocaram oposição em várias províncias. Em Pernambuco, setores políticos criticavam a centralização do novo Império."],
    ["O projeto político", "Os revoltosos defendiam maior autonomia provincial e organizaram uma confederação de caráter republicano. Frei Caneca foi uma das figuras mais conhecidas da resistência e participou da defesa intelectual do movimento."],
    ["Expansão e dificuldades", "A revolta alcançou outras áreas do Nordeste, mas não conseguiu construir uma coalizão duradoura. Divergências entre grupos locais, falta de recursos militares e a reação do governo imperial enfraqueceram o movimento."],
    ["A repressão", "Forças imperiais cercaram as áreas controladas pelos rebeldes e retomaram o controle. Frei Caneca foi executado em 1825, depois de sua condenação."],
    ["Significado", "O episódio revelou que a Independência não havia resolvido a disputa sobre a organização do Estado. Centralização imperial, autonomia provincial e formas republicanas continuariam sendo temas importantes da política brasileira."]
  ],
  "Abdicação de D. Pedro I": [
    ["Desgaste do Primeiro Reinado", "D. Pedro I enfrentou oposição de grupos políticos brasileiros, dificuldades financeiras e críticas relacionadas à Guerra da Cisplatina. A derrota e a independência do Uruguai contribuíram para o desgaste do governo."],
    ["A crise política", "A relação do imperador com portugueses residentes no Brasil também provocava conflitos. A imprensa e setores da Câmara dos Deputados criticavam a concentração de poder e a influência do monarca sobre a política."],
    ["A abdicação", "Em 7 de abril de 1831, diante do agravamento da crise, D. Pedro I abdicou do trono em favor de seu filho Pedro de Alcântara, que tinha apenas cinco anos. O imperador deixou o Brasil e retornou à Europa."],
    ["A Regência", "Como o herdeiro era menor de idade, a Constituição determinava que o país fosse governado por regentes. Começou então uma fase de experimentação institucional e intensa disputa entre centralizadores e defensores de maior autonomia provincial."],
    ["Consequência histórica", "A abdicação encerrou o Primeiro Reinado, mas não encerrou as disputas que haviam marcado o período. Muitas delas reapareceriam nas revoltas regenciais e no debate sobre a maioridade de Pedro II."]
  ],
  "Lei Eusébio de Queirós": [
    ["O tráfico atlântico", "Durante séculos, o Brasil recebeu milhões de africanos escravizados. O tráfico transatlântico sustentava a reprodução do sistema escravista e envolvia redes comerciais que conectavam África, Brasil e outras partes do Atlântico."],
    ["Pressão internacional e legislação", "A Grã-Bretanha pressionava o Brasil para cumprir acordos de proibição do tráfico. Leis anteriores haviam declarado o comércio ilegal, mas a fiscalização era insuficiente e o tráfico continuava em grande escala."],
    ["A lei de 1850", "A Lei nº 581, de 4 de setembro de 1850, fortaleceu os mecanismos de repressão ao tráfico e permitiu uma atuação mais efetiva das autoridades. A medida reduziu drasticamente a entrada de africanos escravizados pelo Atlântico."],
    ["O escravismo continuou", "O fim do tráfico internacional não significou o fim da escravidão. A mão de obra escravizada continuou sendo utilizada e cresceu o tráfico interno entre províncias, especialmente em direção às áreas cafeeiras do Sudeste."],
    ["Importância", "A lei foi um passo decisivo na transformação do sistema escravista. Nas décadas seguintes vieram outras medidas, como a Lei do Ventre Livre e a Lei dos Sexagenários, até a abolição em 1888."]
  ],
  "Guerra de Canudos": [
    ["O sertão e Belo Monte", "No sertão da Bahia, comunidades rurais conviviam com pobreza, secas, concentração de terras e relações de dependência. Antônio Conselheiro reuniu seguidores e estabeleceu em Belo Monte, conhecido como Canudos, uma comunidade que cresceu rapidamente."],
    ["A percepção de ameaça", "Autoridades locais e setores das elites passaram a apresentar Canudos como ameaça à ordem republicana. O conflito também foi interpretado por diferentes grupos como questão religiosa, social e política, embora essas dimensões não possam ser reduzidas a uma única causa."],
    ["As primeiras expedições", "As primeiras expedições militares enviadas contra a comunidade foram derrotadas. O fracasso levou o governo republicano a mobilizar forças cada vez maiores para a região."],
    ["A campanha final", "Em 1897, uma grande expedição cercou Canudos. Depois de combates prolongados, a comunidade foi destruída e grande parte de seus habitantes morreu. As estimativas sobre as perdas variam conforme as fontes."],
    ["Memória e historiografia", "Euclides da Cunha registrou o conflito em Os Sertões, obra que influenciou profundamente a memória nacional. Estudos posteriores passaram a analisar Canudos também a partir da experiência dos sertanejos, das estruturas sociais regionais e da violência praticada pelo Estado."]
  ],
  "Revolta da Vacina": [
    ["Rio de Janeiro em transformação", "No início do século XX, o governo Rodrigues Alves promoveu grandes reformas urbanas e sanitárias no Rio de Janeiro. A abertura de avenidas, demolições e remoções alterou profundamente áreas populares da cidade."],
    ["A política sanitária", "Oswaldo Cruz coordenou campanhas contra febre amarela, peste bubônica e varíola. Algumas ações eram coercitivas, e a vacinação contra a varíola tornou-se obrigatória em 1904."],
    ["A revolta", "Em novembro de 1904, protestos contra a obrigatoriedade da vacina se transformaram em confrontos, barricadas e ataques a instalações públicas. A revolta também foi aproveitada por grupos políticos que se opunham ao governo."],
    ["Repressão e desfecho", "O governo mobilizou forças policiais e militares, reprimiu os participantes e suspendeu temporariamente a obrigatoriedade da vacinação. Houve prisões, deportações e mortes."],
    ["O que o episódio revela", "A Revolta da Vacina não pode ser explicada apenas como rejeição à ciência. Ela ocorreu em meio a reformas urbanas coercitivas, desigualdade, falta de informação e desconfiança em relação às autoridades. O episódio se tornou referência nos estudos sobre saúde pública e cidadania."]
  ],
  "Consolidação das Leis do Trabalho": [
    ["A legislação antes de 1943", "Durante a Era Vargas, o governo federal criou sucessivamente normas sobre jornada, férias, salário, sindicatos, Justiça do Trabalho e outras relações trabalhistas. Antes da CLT, essas regras estavam distribuídas por diferentes decretos e leis."],
    ["A consolidação", "O Decreto-Lei nº 5.452, de 1º de maio de 1943, aprovou a Consolidação das Leis do Trabalho. O objetivo foi reunir e sistematizar a legislação existente em um conjunto organizado de normas."],
    ["O papel do Estado", "A legislação ampliou a presença do Estado na relação entre trabalhadores e empregadores. A organização sindical passou a operar sob regras de reconhecimento e enquadramento definidas pelo poder público, característica do modelo corporativista do período."],
    ["Direitos e limites", "A CLT estabeleceu e organizou direitos importantes, mas sua aplicação não alcançava todos os trabalhadores da mesma maneira. Trabalhadores rurais, domésticos e outras categorias ficaram durante longos períodos fora de partes relevantes da proteção prevista."],
    ["Legado", "A CLT atravessou diferentes regimes e recebeu inúmeras alterações. Mesmo após a Constituição de 1988 e reformas posteriores, continua sendo uma referência central para compreender a legislação trabalhista brasileira."]
  ],
  "Criação da Petrobras": [
    ["O debate sobre o petróleo", "Desde a década de 1930, o petróleo passou a ser tratado como recurso estratégico para a industrialização e a segurança energética. Nas décadas de 1940 e 1950, a campanha 'O petróleo é nosso' mobilizou diferentes setores da sociedade."],
    ["A decisão de 1953", "Em 3 de outubro de 1953, o governo Getúlio Vargas sancionou a lei que criou a Petrobras. A empresa recebeu papel central na exploração, produção, refino e transporte de petróleo no país."],
    ["Nacionalismo econômico", "A criação da empresa ocorreu em meio ao debate sobre o grau de participação do Estado e do capital estrangeiro na economia. Para seus defensores, o controle estatal de um recurso estratégico era importante para o desenvolvimento nacional."],
    ["Expansão da empresa", "A Petrobras passou a investir em pesquisa, exploração e refino. Décadas depois, o desenvolvimento tecnológico da empresa seria decisivo para a exploração de petróleo em águas profundas e, posteriormente, no pré-sal."],
    ["Importância histórica", "A criação da Petrobras consolidou uma das principais empresas estatais brasileiras e marcou a política energética do país. Também se tornou referência permanente no debate sobre soberania, investimento público e participação privada."]
  ],
  "AI-5": [
    ["O ambiente de 1968", "O ano de 1968 foi marcado por manifestações estudantis, greves, conflitos políticos e aumento da oposição ao regime militar. Ao mesmo tempo, organizações armadas começaram a atuar contra o governo e a repressão já estava em expansão."],
    ["A edição do ato", "Em 13 de dezembro de 1968, o governo Artur da Costa e Silva decretou o Ato Institucional nº 5. O texto permitiu ao presidente fechar o Congresso, intervir em estados e municípios, suspender direitos políticos e ampliar mecanismos de repressão."],
    ["O endurecimento do regime", "Depois do AI-5, a censura prévia foi ampliada e órgãos de segurança ganharam maior liberdade de atuação. Prisões arbitrárias, tortura, desaparecimentos e outras violações de direitos humanos ocorreram durante essa fase."],
    ["Impacto institucional", "O ato reduziu ainda mais os espaços de oposição institucional e enfraqueceu mecanismos de controle sobre o Executivo. O Congresso permaneceu fechado em diferentes momentos e a atividade política sofreu fortes restrições."],
    ["Fim do AI-5", "O ato foi revogado em dezembro de 1978, durante o governo Ernesto Geisel. A revogação ocorreu dentro de um processo gradual de abertura que continuaria nos anos seguintes."]
  ],
  "Lei da Anistia": [
    ["A campanha pela anistia", "Durante a abertura política, familiares de presos e desaparecidos, organizações de direitos humanos, movimentos estudantis, sindicatos e grupos políticos pressionaram pela anistia e pelo retorno de brasileiros exilados."],
    ["A lei de 1979", "A Lei nº 6.683 foi aprovada em agosto de 1979 e concedeu anistia a pessoas atingidas por atos políticos nos períodos e condições previstos em seu texto. A medida também permitiu o retorno de muitos exilados."],
    ["A reorganização política", "A anistia coincidiu com a reorganização partidária e com o crescimento de movimentos sociais. Políticos anteriormente afastados puderam voltar à atividade, modificando o cenário da transição."],
    ["A questão dos agentes do Estado", "A interpretação sobre a extensão da anistia a agentes públicos acusados de violações de direitos humanos tornou-se uma questão jurídica e política nas décadas seguintes. O tema permanece objeto de controvérsia e decisões judiciais."],
    ["Importância histórica", "A lei foi um dos marcos da abertura política, mas não encerrou as disputas sobre memória, responsabilização e reparação relacionadas à repressão do regime militar."]
  ],
  "Diretas Já": [
    ["O contexto", "No início dos anos 1980, a crise econômica e a pressão social por abertura política aumentaram. A proposta de restabelecer eleições diretas para presidente ganhou força com a Emenda Dante de Oliveira."],
    ["A mobilização", "Entre 1983 e 1984, comícios e manifestações reuniram grandes públicos em cidades brasileiras. Partidos de oposição, sindicatos, estudantes, artistas e organizações da sociedade civil participaram da campanha."],
    ["A votação da emenda", "Em 25 de abril de 1984, a emenda não alcançou na Câmara dos Deputados o número de votos necessário para alterar a Constituição. A eleição presidencial de 1985 continuou sendo indireta."],
    ["A eleição de 1985", "Tancredo Neves foi escolhido pelo Colégio Eleitoral em janeiro de 1985. Ele adoeceu antes da posse e morreu em abril daquele ano, levando José Sarney a assumir a Presidência."],
    ["Legado", "A campanha não conseguiu produzir a eleição direta naquele momento, mas ampliou a pressão social pela democratização e tornou-se um dos símbolos da transição para a Nova República."]
  ],
  "Impeachment de Fernando Collor": [
    ["A crise do governo", "Fernando Collor assumiu em 1990 após a primeira eleição presidencial direta desde 1960. O governo adotou abertura comercial, medidas de desestatização e planos de combate à inflação, incluindo o bloqueio de ativos financeiros no início do mandato."],
    ["As denúncias", "Em 1992, Pedro Collor fez denúncias contra Paulo César Farias, tesoureiro da campanha presidencial e personagem central das acusações que atingiram o governo. Uma CPI no Congresso aprofundou a investigação."],
    ["A autorização", "Após manifestações e crescente pressão política, a Câmara dos Deputados autorizou a abertura do processo de impeachment em 29 de setembro de 1992. Collor foi afastado e Itamar Franco passou a exercer interinamente a Presidência."],
    ["A renúncia e o Senado", "Em 29 de dezembro de 1992, Collor renunciou durante o julgamento no Senado. Mesmo assim, o processo continuou, e o Senado aprovou a perda de seus direitos políticos pelo período previsto na decisão."],
    ["Significado institucional", "O episódio foi o primeiro impeachment presidencial concluído sob a Constituição de 1988 e demonstrou o funcionamento conjunto de manifestações sociais, Congresso, Judiciário e regras constitucionais de sucessão."]
  ],
  "Impeachment de Dilma Rousseff": [
    ["O segundo mandato", "Dilma Rousseff iniciou o segundo mandato em janeiro de 2015 em meio à desaceleração econômica, dificuldades fiscais, queda da atividade e forte disputa política. A relação do governo com o Congresso tornou-se progressivamente mais conflituosa."],
    ["A abertura", "Em dezembro de 2015, o presidente da Câmara dos Deputados aceitou uma denúncia por crime de responsabilidade. A Câmara autorizou a abertura do processo em abril de 2016, e o Senado instaurou o julgamento."],
    ["O afastamento", "Dilma foi afastada temporariamente em maio de 2016. A acusação no processo concentrou-se principalmente em decretos de crédito suplementar e operações relacionadas ao Plano Safra, enquadradas pelos acusadores como infrações à legislação orçamentária."],
    ["A decisão do Senado", "Em 31 de agosto de 2016, o Senado aprovou por maioria qualificada o impeachment e a perda definitiva do cargo. Michel Temer, que já exercia interinamente a Presidência, assumiu definitivamente."],
    ["Debate histórico e jurídico", "O processo gerou intenso debate sobre a caracterização jurídica das condutas, o papel do Congresso e a natureza política do impeachment. As diferentes interpretações continuam presentes na literatura e no debate público."]
  ],
  "Eleição presidencial de 2018": [
    ["O contexto eleitoral", "A eleição de 2018 ocorreu após anos de crise política, recessão, mudanças no sistema partidário e forte polarização. O ex-presidente Luiz Inácio Lula da Silva foi inicialmente registrado como candidato, mas sua candidatura foi indeferida pela Justiça Eleitoral com base na Lei da Ficha Limpa."],
    ["O primeiro turno", "Jair Bolsonaro, então deputado federal, e Fernando Haddad, que substituiu Lula na chapa do Partido dos Trabalhadores, avançaram para o segundo turno. Outros candidatos receberam parcelas relevantes dos votos."],
    ["O segundo turno", "Bolsonaro venceu Haddad no segundo turno e tomou posse em 1º de janeiro de 2019. Foi a primeira eleição presidencial desde a redemocratização em que nenhum dos dois principais partidos das disputas anteriores chegou ao segundo turno."],
    ["O governo que se iniciou", "A nova administração apresentou uma agenda de reformas econômicas, mudanças na segurança pública e revisão de políticas anteriores. O governo também enfrentou conflitos políticos, mudanças ministeriais e disputas institucionais ao longo do mandato."],
    ["Importância histórica", "A eleição alterou significativamente a composição política do Executivo federal e expressou mudanças no comportamento eleitoral, na força dos partidos tradicionais e no ambiente de polarização que marcou a década de 2010."]
  ],
  "Pandemia de COVID-19": [
    ["A chegada ao Brasil", "O primeiro caso confirmado de COVID-19 no Brasil foi registrado em fevereiro de 2020. Nas semanas seguintes, a transmissão comunitária se expandiu e estados e municípios adotaram medidas de distanciamento e restrição de atividades."],
    ["Saúde pública", "O Sistema Único de Saúde enfrentou forte pressão sobre hospitais, unidades de terapia intensiva, profissionais e equipamentos. A vacinação começou em janeiro de 2021, depois da autorização de uso das primeiras vacinas pela Anvisa."],
    ["Economia e proteção social", "As medidas de contenção reduziram a atividade econômica em diversos setores. O Congresso e o governo criaram programas emergenciais, incluindo o auxílio emergencial, enquanto empresas e trabalhadores enfrentaram mudanças rápidas nas condições de trabalho."],
    ["Conflitos institucionais", "União, estados e municípios divergiram sobre medidas sanitárias, compra de vacinas, restrições e comunicação pública. O Supremo Tribunal Federal também decidiu sobre competências federativas durante a crise. A CPI da Pandemia, instalada no Senado em 2021, investigou ações e omissões do governo federal."],
    ["Consequências", "A pandemia causou centenas de milhares de mortes no país e deixou impactos duradouros na educação, saúde, mercado de trabalho e economia. Também acelerou a digitalização de serviços e modificou hábitos sociais."]
  ],
  "Eleição presidencial de 2022": [
    ["O cenário", "A eleição de 2022 ocorreu em ambiente de forte polarização política. Jair Bolsonaro buscou a reeleição e Luiz Inácio Lula da Silva retornou à disputa presidencial depois de ter recuperado seus direitos políticos após decisões judiciais que anularam condenações anteriores."],
    ["O primeiro turno", "Lula e Bolsonaro avançaram para o segundo turno. A disputa mobilizou diferentes forças partidárias e ocorreu em meio a debates sobre economia, políticas sociais, meio ambiente, instituições e o papel das Forças Armadas."],
    ["O segundo turno", "Em 30 de outubro de 2022, Lula venceu Bolsonaro por margem inferior a dois pontos percentuais dos votos válidos. O Tribunal Superior Eleitoral proclamou o resultado e o processo de transição começou em novembro."],
    ["A transição", "A equipe de transição reuniu representantes de diferentes áreas para levantar informações sobre programas, orçamento e funcionamento da administração federal. O processo ocorreu em ambiente de elevada tensão política."],
    ["A posse e o novo governo", "Lula tomou posse em 1º de janeiro de 2023, iniciando seu terceiro mandato presidencial. A nova administração encontrou Congresso fragmentado e um país politicamente dividido."]
  ],
  "Reforma tributária": [
    ["Um problema antigo", "A tributação brasileira sobre o consumo era distribuída entre diferentes impostos federais, estaduais e municipais, com numerosas regras, exceções e disputas sobre créditos e competência. A simplificação do sistema era discutida havia décadas."],
    ["A mudança constitucional", "Em dezembro de 2023, o Congresso promulgou a Emenda Constitucional 132. O texto criou as bases constitucionais para uma reforma ampla da tributação sobre bens e serviços."],
    ["O novo desenho", "A reforma criou a Contribuição sobre Bens e Serviços, de competência federal, e o Imposto sobre Bens e Serviços, compartilhado por estados e municípios. Também criou o Imposto Seletivo para determinados bens e serviços."],
    ["Transição", "A mudança foi planejada para ocorrer gradualmente. A regulamentação posterior precisou definir regimes específicos, alíquotas, cashback, regras de crédito, transição entre os sistemas e funcionamento do Comitê Gestor."],
    ["Por que é um marco", "A reforma não terminou com a promulgação da emenda constitucional. Sua importância histórica está também no longo processo de implementação e na mudança da distribuição de competências tributárias entre os diferentes níveis de governo."]
  ]
};

const milestoneEntries = restoredMilestones.map((milestone, index) => {
  const id = milestoneDeepDiveMap[milestone.year + "|" + milestone.title];
  const deepDive = id ? deepDives.find(item => item.id === id) : null;
  return {
    ...milestone,
    type: "event",
    summary: milestone.description,
    sections: deepDive?.sections || milestoneDetails[milestone.title] || milestoneDetailsExtra[milestone.title] || [
      ["Contexto", milestone.description],
      ["O acontecimento", milestone.description],
      ["Consequências", "Este marco integra o processo histórico do período e ajuda a compreender os acontecimentos posteriores."]
    ],
    key: "event|" + milestone.year + "|" + milestone.title + "|" + index
  };
});

const periodMilestoneMap = restoredMilestones.reduce((acc, milestone, index) => {
  (acc[milestone.period] ||= []).push(milestoneEntries[index]);
  return acc;
}, {});


const timelineEntries = [
  ...chapters.map(chapter => ({ ...chapter, key: "chapter|" + chapter.id })),
  ...milestoneEntries
];

const filters = ["Todos", "Colônia", "Império", "República"];
const timeline = document.getElementById("timeline");
const detail = document.getElementById("history-detail");
const filterContainer = document.getElementById("history-filters");
const search = document.getElementById("history-search");
const count = document.getElementById("timeline-count");
const timelineViewButtons = document.querySelectorAll("[data-timeline-view]");
const timelineViews = ["globe", "reel", "list", "grid"];
const compactTimelineQuery = window.matchMedia("(max-width: 768px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const savedTimelineView = localStorage.getItem("history-timeline-view");
let activeFilter = "Todos";
let activeTimelineView = timelineViews.includes(savedTimelineView) ? savedTimelineView : "globe";
if (compactTimelineQuery.matches && activeTimelineView === "grid") {
  activeTimelineView = "list";
  localStorage.setItem("history-timeline-view", activeTimelineView);
}
let activeEntry = null;
let lockedScrollY = 0;
let reelDrag = null;
let suppressReelClick = false;
let reelWheelTarget = 0;
let reelWheelFrame = 0;
let reelWheelIdle = true;
let reelWheelIdleTimeout;

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

function periodFor(entry) {
  return periods.find(period => period.id === entry.period);
}

const presidentsGrid = document.getElementById("presidents-grid");
const presidentsSearch = document.getElementById("presidents-search");
const presidentsCount = document.getElementById("presidents-count");
const presidentPortraitCache = new Map();
let presidentObserver;
const presidentPortraitFiles = {
  "Fernando Collor": {
    title: "File:Fernando Collor 1992 B&W.jpg",
    requiredDescription: ["imagem oficial em preto e branco do presidente da republica federativa do brasil"]
  },
  "Junta Governativa Provisória de 1930": {
    title: "File:Osvaldo Aranha com a Junta Governativa (2).jpg",
    requiredDescription: ["izaias de noronha", "menna barreto", "tasso fragoso"]
  },
  "Junta Militar": {
    title: "File:Junta militar de 1969.jpg",
    requiredDescription: ["military junta of 1969", "aurelio lira", "marcio melo", "augusto rademaker"]
  },
  "João Goulart": {
    title: "File:MO 63.2240.2 - Photograph of João Goulart President of the Republic of Brazil.jpg",
    requiredDescription: ["black and white portrait photograph", "joao goulart"]
  }
};
const presidentFgvEntries = {
  "Getúlio Vargas": "getulio-dornelles-vargas",
  "José Linhares": "linhares-jose-1",
  "Luiz Inácio Lula da Silva": "luis-inacio-da-silva",
  "Venceslau Brás": "venceslau-bras-pereira-gomes",
  "Washington Luís": "washington-luis-pereira-de-sousa",
  "Eurico Gaspar Dutra": "dutra-eurico-gaspar",
  "Café Filho": "joao-cafe-filho",
  "Carlos Luz": "carlos-coimbra-da-luz",
  "Nereu Ramos": "nereu-de-oliveira-ramos",
  "Juscelino Kubitschek": "juscelino-kubitschek-de-oliveira",
  "Jânio Quadros": "janio-da-silva-quadros",
  "Ranieri Mazzilli": "pascoal-ranieri-mazzilli",
  "João Goulart": "joao-belchior-marques-goulart",
  "Humberto Castelo Branco": "humberto-de-alencar-castelo-branco",
  "Artur da Costa e Silva": "artur-da-costa-e-silva",
  "Emílio Garrastazu Médici": "medici-emilio-garrastazzu",
  "Ernesto Geisel": "geisel-ernesto",
  "João Figueiredo": "joao-batista-de-oliveira-figueiredo",
  "José Sarney": "jose-ribamar-ferreira-de-araujo-costa",
  "Fernando Collor": "collor-fernando",
  "Itamar Franco": "itamar-augusto-cautiero-franco",
  "Fernando Henrique Cardoso": "cardoso-fernando-henrique",
  "Dilma Rousseff": "dilma-vana-rousseff",
  "Michel Temer": "michel-miguel-elias-temer-lulia",
  "Jair Bolsonaro": "jair-messias-bolsonaro"
};

function buildPresidentBiography(president) {
  if (president.collective) return president.trajectory;

  const period = president.periodIds
    .map(id => periods.find(item => item.id === id))
    .find(Boolean);
  const narrative = periodNarratives[period?.id]?.lead || "";
  const role = president.roles.join(" e ");
  const years = president.years.join(" e ");
  const context = narrative ? " " + narrative : "";

  return "Exerceu a Presidência como " + role + " em " + years + "." + context;
}

function renderPresidentCard(president) {
  const isInterim = president.collective ||
    president.roles.some(role => /interin|junta|regênc/i.test(role)) ||
    president.name === "José Linhares" ||
    president.name === "Ranieri Mazzilli" ||
    president.name === "Carlos Luz" ||
    president.name === "Nereu Ramos" ||
    president.name === "Delfim Moreira";

  const biography = buildPresidentBiography(president);
  const fgvSlug = presidentFgvEntries[president.name];
  const fgvUrl = fgvSlug
    ? "https://www18.fgv.br/CPDOC/acervo/dicionarios/verbete-biografico/" + fgvSlug
    : "https://www18.fgv.br/CPDOC/acervo/arquivo?busca=" + encodeURIComponent(president.name) + "&TipoUD=3&MacroTipoUD=2&nItens=30";
  const fgvLinkLabel = fgvSlug ? "Verbete biográfico — FGV CPDOC" : "Buscar no DHBB da FGV CPDOC";
  const periodLinks = president.periodIds.map(periodId => {
    const period = periods.find(item => item.id === periodId);
    if (!period) return "";
    return '<button class="president-context-link" type="button" data-period-entry="chapter|' + escapeHtml(periodId) + '">' +
      'Ver contexto: ' + escapeHtml(period.label) + '</button>';
  }).filter(Boolean).join("");

  return '<article class="president-card' + (isInterim ? " president-card-interim" : "") + '" data-president-name="' + escapeHtml(president.name) + '">' +
    '<figure class="president-portrait">' +
      '<div class="president-portrait-placeholder"><i class="fas fa-user-tie" aria-hidden="true"></i><span>Retrato de acervo não disponível</span></div>' +
      '<img class="president-portrait-image" alt="' + (president.collective ? "Fotografia histórica de " : "Retrato de ") + escapeHtml(president.name) + '" loading="lazy" hidden>' +
      '<figcaption class="president-image-credit" hidden></figcaption>' +
    '</figure>' +
    '<div class="president-card-content">' +
      '<div class="president-heading">' +
        '<div><p class="president-years">' + escapeHtml(president.years.join(" · ")) + '</p><h3>' + escapeHtml(president.name) + '</h3></div>' +
        (isInterim ? '<span class="president-status">Interino / transição</span>' : '') +
      '</div>' +
      '<p class="president-role">' + escapeHtml(president.roles.join(" · ")) + '</p>' +
      '<section class="president-trajectory"><h4>Trajetória</h4><p class="president-biography">' + escapeHtml(biography) + '</p>' +
        '<div class="president-context-links">' + periodLinks + '</div>' +
        '<div class="president-source-list">' +
          '<a class="president-source" href="' + escapeHtml(fgvUrl) + '" target="_blank" rel="noopener noreferrer">' + fgvLinkLabel + '</a>' +
          '<a class="president-source" href="https://biblioteca.presidencia.gov.br/presidencia/ex-presidentes" target="_blank" rel="noopener noreferrer">Biblioteca da Presidência</a>' +
          '<a class="president-source" href="https://presidentes.an.gov.br/" target="_blank" rel="noopener noreferrer">Arquivo Nacional — acervo presidencial</a>' +
        '</div></section>' +
      '<details class="history-accordion-item president-facts">' +
        '<summary><span class="accordion-title"><strong>Medidas e atuação</strong><small>Principais decisões e iniciativas do mandato.</small></span><span class="accordion-icon"><i class="fas fa-chevron-down" aria-hidden="true"></i></span></summary>' +
        '<div class="accordion-content"><ul>' +
          president.achievements.map(item => '<li>' + escapeHtml(item) + '</li>').join("") +
        '</ul></div>' +
      '</details>' +
      '<details class="history-accordion-item president-facts">' +
        '<summary><span class="accordion-title"><strong>Conflitos e controvérsias</strong><small>Crises, disputas e temas controversos do período.</small></span><span class="accordion-icon"><i class="fas fa-chevron-down" aria-hidden="true"></i></span></summary>' +
        '<div class="accordion-content"><ul>' +
          president.controversies.map(item => '<li>' + escapeHtml(item) + '</li>').join("") +
        '</ul></div>' +
      '</details>' +
    '</div>' +
  '</article>';
}

function commonsText(value) {
  const parsed = new DOMParser().parseFromString(String(value || ""), "text/html");
  return parsed.body.textContent.replace(/\s+/g, " ").trim();
}

function commonsSourceUrl(value) {
  const parsed = new DOMParser().parseFromString(String(value || ""), "text/html");
  const href = parsed.querySelector("a[href]")?.getAttribute("href") || parsed.body.textContent.trim();
  if (!/^https?:\/\//i.test(href)) return "";
  try {
    const url = new URL(href);
    if (url.username || url.password) return "";
    if (url.protocol === "http:") {
      if (!/(^|\.)gov\.br$|(^|\.)senado\.leg\.br$|(^|\.)flickr\.com$/.test(url.hostname)) return "";
      url.protocol = "https:";
    }
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function normalizedSearchText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function isReusablePortraitLicense(license) {
  const normalized = String(license || "").toLowerCase();
  if (/\b(nc|nd)\b/.test(normalized)) return false;
  return normalized.includes("public domain") || normalized.includes("cc0") || /\bcc by(?:-sa)?\b/.test(normalized);
}

function hasUrlOrigin(value, origin) {
  try {
    return new URL(value).origin === origin;
  } catch {
    return false;
  }
}

function fetchCommonsPortrait(president) {
  const cached = presidentPortraitCache.get(president.name);
  if (cached) return cached;

  const url = new URL("https://commons.wikimedia.org/w/api.php");
  const searchParameters = new URLSearchParams({
    action: "query",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "440",
    format: "json",
    origin: "*"
  });
  const portraitFile = presidentPortraitFiles[president.name];
  if (portraitFile) {
    searchParameters.set("titles", portraitFile.title);
  } else {
    searchParameters.set("generator", "search");
    searchParameters.set("gsrsearch", 'filetype:bitmap "' + president.name + '"');
    searchParameters.set("gsrnamespace", "6");
    searchParameters.set("gsrlimit", "20");
  }
  url.search = searchParameters;

  const result = fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Commons respondeu com HTTP " + response.status);
      return response.json();
    })
    .then(data => {
      const name = normalizedSearchText(president.name);
      const nameWords = name.split(/\s+/).filter(word => word.length > 2);
      const pages = Object.values(data.query?.pages || {});
      const candidates = pages.map(page => {
        const image = page.imageinfo?.[0];
        const metadata = image?.extmetadata || {};
        const title = normalizedSearchText(page.title.replace(/^File:/, ""));
        const description = normalizedSearchText(commonsText(metadata.ImageDescription?.value));
        const combined = title + " " + description;
        const nameMatches = portraitFile || combined.includes(name) || nameWords.every(word => combined.includes(word));
        const presidentContext = portraitFile
        ? portraitFile.requiredDescription.every(term => description.includes(term))
        : /(president|presidente|presidenta|portrait|retrato|fotografia|photograph|official photo)/.test(combined);
        const nonPortrait = /(signature|assinatura|autograph|autografo|logo|logotipo|coat of arms|brasao)/.test(title);
        const license = commonsText(metadata.LicenseShortName?.value);
        const artist = commonsText(metadata.Artist?.value);
        const creator = !artist || /^(unknown|desconhecido)/i.test(artist)
          ? "Autoria não identificada"
          : artist;
        const credit = commonsText(metadata.Credit?.value);
        const sourceLabel = /^file:/i.test(credit) ? "" : credit;
        const sourceUrl = commonsSourceUrl(metadata.Credit?.value) || commonsSourceUrl(metadata.Source?.value);
        if (!image || !nameMatches || !presidentContext || nonPortrait || !creator || !isReusablePortraitLicense(license)) return null;
        if (!hasUrlOrigin(image.thumburl, "https://thumb.wikimedia.org") &&
            !hasUrlOrigin(image.thumburl, "https://upload.wikimedia.org")) return null;
        if (!hasUrlOrigin(image.descriptionurl, "https://commons.wikimedia.org") ||
            !new URL(image.descriptionurl).pathname.startsWith("/wiki/File:")) return null;
        const licenseUrl = metadata.LicenseUrl?.value;
        if (licenseUrl && (!hasUrlOrigin(licenseUrl, "https://creativecommons.org") ||
            !/^\/(licenses|publicdomain)\//.test(new URL(licenseUrl).pathname))) return null;
        const knownCreator = creator !== "Autoria não identificada";
        const officialSource = /galeria de presidentes|governo do brasil/i.test(credit + " " + artist);
        const portraitDescription = /(foto oficial|official portrait|official photo|presidente do brasil)/.test(description);
        return {
          score: (knownCreator ? 3 : 0) + (officialSource ? 5 : 0) + (portraitDescription ? 2 : 0),
          imageUrl: image.thumburl,
          fileUrl: image.descriptionurl,
          creator,
          license,
          licenseUrl,
          sourceLabel,
          sourceUrl
        };
      }).filter(Boolean).sort((left, right) => right.score - left.score);
      const portrait = candidates[0] || null;
      return portrait || null;
    });
  presidentPortraitCache.set(president.name, result);
  return result;
}

async function loadPresidentPortrait(card) {
  const president = presidentByName.get(card.dataset.presidentName);
  if (!president || (president.collective && !presidentPortraitFiles[president.name])) return;

  const placeholder = card.querySelector(".president-portrait-placeholder");
  const image = card.querySelector(".president-portrait-image");
  const credit = card.querySelector(".president-image-credit");
  let portrait;
  try {
    portrait = await fetchCommonsPortrait(president);
  } catch (error) {
    console.error("Não foi possível consultar os retratos do Wikimedia Commons para " + president.name + ".", error);
    if (card.isConnected) placeholder.querySelector("span").textContent = "Não foi possível validar retrato e licença agora";
    return;
  }
  if (!card.isConnected) return;
  if (!portrait) {
    placeholder.querySelector("span").textContent = "Retrato com licença reutilizável não localizado";
    return;
  }

  const showPortrait = () => {
    image.classList.add("is-loaded");
    placeholder.hidden = true;
    credit.hidden = false;
  };
  image.addEventListener("load", showPortrait, { once: true });
  image.addEventListener("error", () => {
    image.hidden = true;
    placeholder.querySelector("span").textContent = "Retrato indisponível";
    console.error("O arquivo de retrato do Wikimedia Commons não pôde ser carregado para " + president.name + ".", portrait.fileUrl);
  }, { once: true });
  image.hidden = false;
  image.loading = "eager";
  image.src = portrait.imageUrl;
  if (image.complete && image.naturalWidth > 0) showPortrait();
  const licenseHref = portrait.licenseUrl || portrait.fileUrl;
  const licenseLink = '<a href="' + escapeHtml(licenseHref) + '" target="_blank" rel="noopener noreferrer">' +
    escapeHtml(portrait.license) + '</a>';
  const sourceLabel = portrait.sourceLabel && portrait.sourceLabel !== portrait.creator
    ? ' · Fonte informada: ' + (portrait.sourceUrl
      ? '<a href="' + escapeHtml(portrait.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(portrait.sourceLabel) + '</a>'
      : escapeHtml(portrait.sourceLabel))
    : "";
  credit.innerHTML = '<a href="' + escapeHtml(portrait.fileUrl) + '" target="_blank" rel="noopener noreferrer">Foto: ' +
    escapeHtml(portrait.creator) + '</a>' + sourceLabel + ' · ' + licenseLink;
}

const presidentFilterContainer = document.getElementById("presidents-filters");
const presidentFilters = ["Todos", "República", "Regime Militar"];
let activePresidentFilter = "Todos";

function presidentMatchesFilter(president) {
  if (activePresidentFilter === "Todos") return true;

  const isMilitaryRegime = president.periodIds.includes("regime-militar");
  if (activePresidentFilter === "Regime Militar") return isMilitaryRegime;

  return president.periodIds.some(periodId => {
    const period = periods.find(item => item.id === periodId);
    return period?.era === "República" && period.id !== "regime-militar";
  });
}

function renderPresidentFilters() {
  presidentFilterContainer.innerHTML = presidentFilters.map(filter =>
    '<button class="history-filter ' + (filter === activePresidentFilter ? "active" : "") + '" type="button" data-president-filter="' + escapeHtml(filter) + '">' +
      escapeHtml(filter) +
    '</button>'
  ).join("");

  presidentFilterContainer.querySelectorAll("[data-president-filter]").forEach(button => {
    button.addEventListener("click", () => {
      activePresidentFilter = button.dataset.presidentFilter;
      renderPresidentFilters();
      renderPresidents();
    });
  });
}

function renderPresidents() {
  presidentObserver?.disconnect();
  const query = normalizedSearchText(presidentsSearch?.value || "");
  const matching = presidents.filter(president => {
    if (!presidentMatchesFilter(president)) return false;
    return normalizedSearchText([
      president.name,
      president.years.join(" "),
      president.roles.join(" "),
      president.periods.join(" ")
    ].join(" ")).includes(query);
  });

  presidentsGrid.innerHTML = matching.length
    ? matching.map(renderPresidentCard).join("")
    : '<p class="presidents-empty">Nenhum presidente corresponde aos filtros atuais.</p>';
  presidentsCount.textContent = matching.length + (matching.length === 1 ? " perfil" : " perfis");

  presidentsGrid.querySelectorAll(".president-facts").forEach(item => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      item.parentElement.querySelectorAll(".president-facts[open]").forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });

  presidentsGrid.querySelectorAll(".president-context-link").forEach(button => {
    button.addEventListener("click", () => openEntry(button.dataset.periodEntry));
  });

  const cards = presidentsGrid.querySelectorAll(".president-card");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        loadPresidentPortrait(entry.target);
      });
    }, { rootMargin: "180px" });
    presidentObserver = observer;
    cards.forEach(card => observer.observe(card));
  } else {
    cards.forEach(loadPresidentPortrait);
  }
}

const backToTop = document.getElementById("back-to-top");

function updateBackToTop() {
  const shouldShow = window.scrollY > 600;
  backToTop.classList.toggle("is-visible", shouldShow);
  backToTop.setAttribute("aria-hidden", String(!shouldShow));
  backToTop.tabIndex = shouldShow ? 0 : -1;
}

window.addEventListener("scroll", updateBackToTop, { passive: true });
backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
  });
});

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

function updateTimelineViewButtons() {
  timelineViewButtons.forEach(button => {
    const isActive = button.dataset.timelineView === activeTimelineView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

timelineViewButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeTimelineView = button.dataset.timelineView;
    localStorage.setItem("history-timeline-view", activeTimelineView);
    updateTimelineViewButtons();
    renderTimeline();
  });
});

compactTimelineQuery.addEventListener("change", event => {
  if (!event.matches || activeTimelineView !== "grid") return;

  activeTimelineView = "list";
  localStorage.setItem("history-timeline-view", activeTimelineView);
  updateTimelineViewButtons();
  renderTimeline();
});

function renderTimeline() {
  const previousScrollTop = timeline.scrollTop;
  const previousScrollLeft = timeline.scrollLeft;
  timeline.className = "timeline mode-" + activeTimelineView;
  const visible = filteredEntries();
  count.textContent = visible.length + (visible.length === 1 ? " entrada" : " entradas");

  if (!visible.length) {
    timeline.innerHTML = '<div class="history-no-results"><h3>Nenhuma história encontrada</h3><p>Tente outro termo ou filtro.</p></div>';
    return;
  }

  timeline.innerHTML = visible.map(entry => {
    const period = periodFor(entry);
    const active = activeEntry === entry.key ? "active" : "";
    const description = entry.type === "event" ? entry.summary : entry.lead;

    return '<button class="timeline-item ' + active + '" data-entry="' + escapeHtml(entry.key) + '">' +
      '<span class="timeline-year">' + escapeHtml(entry.year) + '</span>' +
      '<span class="timeline-dot"></span>' +
      '<span class="timeline-card"><small>' + escapeHtml(period.era) + '</small><strong>' + escapeHtml(entry.title) + '</strong><span>' + escapeHtml(description) + '</span></span>' +
      '</button>';
  }).join("");

  timeline.querySelectorAll(".timeline-item").forEach(item => {
    item.addEventListener("click", () => openEntry(item.dataset.entry));
  });

  if (activeTimelineView === "globe") {
    if (activeEntry) {
      centerActiveEntry();
    } else {
      timeline.scrollTop = previousScrollTop;
      requestAnimationFrame(updateTimelineFocus);
    }
  } else {
    timeline.scrollLeft = previousScrollLeft;
    updateTimelineFocus();
  }
}

function updateTimelineFocus() {
  if (activeTimelineView === "reel") {
    const timelineRect = timeline.getBoundingClientRect();
    const center = timelineRect.left + timeline.clientWidth / 2;
    timeline.querySelectorAll(".timeline-item").forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(itemCenter - center);
      const focus = Math.max(0, 1 - distance / (itemRect.width * 1.25));
      item.style.setProperty("--reel-focus", focus.toFixed(3));
      item.style.setProperty("--reel-scale", (0.94 + focus * 0.06).toFixed(3));
      item.style.setProperty("--reel-opacity", (0.48 + focus * 0.52).toFixed(3));
      item.classList.toggle("is-center", focus >= 0.6);
    });
    return;
  }

  if (activeTimelineView !== "globe") {
    timeline.querySelectorAll(".timeline-item").forEach(item => {
      item.classList.remove("is-center", "is-near", "is-far", "is-above", "is-below");
    });
    return;
  }

  const center = timeline.scrollTop + timeline.clientHeight / 2;
  timeline.querySelectorAll(".timeline-item").forEach(item => {
    const itemCenter = item.offsetTop + item.offsetHeight / 2;
    const offset = itemCenter - center;
    const distance = Math.abs(offset);
    const ratio = Math.min(distance / (timeline.clientHeight / 2), 1);
    item.classList.toggle("is-center", distance < item.offsetHeight * .42);
    item.classList.toggle("is-near", distance >= item.offsetHeight * .42 && ratio < .95);
    item.classList.toggle("is-far", ratio >= .62);
    item.classList.toggle("is-above", offset < 0);
    item.classList.toggle("is-below", offset > 0);
  });
}

timeline.addEventListener("scroll", updateTimelineFocus, { passive: true });

function animateReelWheel() {
  const distance = reelWheelTarget - timeline.scrollLeft;

  if (reelWheelIdle && Math.abs(distance) < 2.5) {
    timeline.scrollLeft = reelWheelTarget;
    reelWheelFrame = 0;
    updateTimelineFocus();
    return;
  }

  timeline.scrollLeft += distance * 0.2;
  reelWheelFrame = window.requestAnimationFrame(animateReelWheel);
}

timeline.addEventListener("wheel", event => {
  if (activeTimelineView !== "reel") return;

  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? timeline.clientWidth : 1;
  const delta = (event.deltaX || event.deltaY) * unit;
  const maxScroll = timeline.scrollWidth - timeline.clientWidth;
  const start = reelWheelFrame ? reelWheelTarget : timeline.scrollLeft;
  const nextScroll = Math.max(0, Math.min(maxScroll, start + delta));
  if (!delta || nextScroll === start) return;

  event.preventDefault();
  reelWheelTarget = nextScroll;
  if (reducedMotionQuery.matches) {
    timeline.scrollLeft = reelWheelTarget;
    updateTimelineFocus();
    return;
  }

  reelWheelIdle = false;
  window.clearTimeout(reelWheelIdleTimeout);
  reelWheelIdleTimeout = window.setTimeout(() => {
    reelWheelIdle = true;
  }, 120);

  if (!reelWheelFrame) {
    reelWheelFrame = window.requestAnimationFrame(animateReelWheel);
  }
}, { passive: false });

timeline.addEventListener("pointerdown", event => {
  if (activeTimelineView !== "reel" || event.pointerType !== "mouse" || event.button !== 0) return;

  if (reelWheelFrame) {
    window.cancelAnimationFrame(reelWheelFrame);
    reelWheelFrame = 0;
    reelWheelTarget = timeline.scrollLeft;
  }
  window.clearTimeout(reelWheelIdleTimeout);
  reelWheelIdle = true;
  reelDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startScrollLeft: timeline.scrollLeft,
    moved: false
  };
  timeline.setPointerCapture(event.pointerId);
});

timeline.addEventListener("pointermove", event => {
  if (!reelDrag || event.pointerId !== reelDrag.pointerId) return;

  const distance = event.clientX - reelDrag.startX;
  if (!reelDrag.moved && Math.abs(distance) < 5) return;

  reelDrag.moved = true;
  timeline.classList.add("is-dragging");
  timeline.scrollLeft = reelDrag.startScrollLeft - distance;
});

function finishReelDrag(event) {
  if (!reelDrag || event.pointerId !== reelDrag.pointerId) return;

  suppressReelClick = reelDrag.moved;
  reelDrag = null;
  timeline.classList.remove("is-dragging");
  if (timeline.hasPointerCapture(event.pointerId)) {
    timeline.releasePointerCapture(event.pointerId);
  }
}

timeline.addEventListener("pointerup", finishReelDrag);
timeline.addEventListener("pointercancel", finishReelDrag);
timeline.addEventListener("click", event => {
  if (!suppressReelClick) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  suppressReelClick = false;
}, true);

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

function lockPageScroll() {
  lockedScrollY = window.scrollY;
  document.body.style.setProperty("--history-scroll-lock-top", "-" + lockedScrollY + "px");
  document.body.classList.add("history-modal-open");
}

function unlockPageScroll() {
  document.body.classList.remove("history-modal-open");
  document.body.style.removeProperty("--history-scroll-lock-top");
  window.scrollTo(0, lockedScrollY);
}

function resetDetail() {
  activeEntry = null;
  detail.classList.remove("open");
  unlockPageScroll();
  detail.innerHTML = "";
  renderTimeline();
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
  const references = {
    cpdoc: { label: "FGV CPDOC — Dicionário Histórico-Biográfico", href: "https://cpdoc.fgv.br/acervo/dicionarios/dhbb" },
    archive: { label: "Arquivo Nacional", href: "https://www.gov.br/arquivonacional/pt-br" },
    library: { label: "Biblioteca da Presidência — ex-presidentes", href: "https://biblioteca.presidencia.gov.br/presidencia/ex-presidentes" },
    anPresidents: { label: "Arquivo Nacional — Acervos Presidenciais", href: "https://presidentes.an.gov.br/" },
    tse: { label: "Tribunal Superior Eleitoral", href: "https://www.tse.jus.br/" },
    senate: { label: "Senado Federal", href: "https://www12.senado.leg.br/" },
    chamber: { label: "Câmara dos Deputados", href: "https://www.camara.leg.br/" },
    planalto: { label: "Planalto — legislação", href: "https://www.gov.br/planalto/pt-br" }
  };
  const sourceIds = {
    colonial: ["archive", "cpdoc"],
    joanino: ["archive", "cpdoc"],
    "primeiro-reinado": ["archive", "cpdoc", "planalto"],
    regencias: ["archive", "cpdoc"],
    "segundo-reinado": ["archive", "cpdoc"],
    "primeira-republica": ["archive", "cpdoc"],
    vargas: ["archive", "cpdoc", "planalto"],
    "republica-1946": ["archive", "cpdoc", "senate", "planalto"],
    "regime-militar": ["archive", "cpdoc", "planalto"],
    "nova-republica": ["cpdoc", "library", "anPresidents", "tse", "senate", "chamber", "planalto"]
  };
  const names = (sourceIds[entry.period] || ["archive", "cpdoc"])
    .map(id => references[id])
    .map(reference => '<a href="' + escapeHtml(reference.href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(reference.label) + '</a>')
    .join(" · ");
  return '<div class="history-source-note"><strong>Referências para consulta:</strong> ' + names + '. São acervos institucionais e uma obra de referência acadêmica; confira a cobertura de cada tema e a documentação correspondente.</div>';
}


function buildMilestoneAccordion(entries) {
  if (!entries.length) return "";
  return '<section class="history-accordion-section"><div class="detail-section-title"><span>Marcos importantes</span><small>' + entries.length + ' acontecimentos</small></div><div class="history-accordion-list">' +
    entries.map(entry => {
      const isOpen = activeEntry === entry.key ? " open" : "";
      return '<details class="history-accordion-item"' + isOpen + ' data-accordion-key="' + escapeHtml(entry.key) + '">' +
        '<summary><span class="accordion-year">' + escapeHtml(entry.year) + '</span><span class="accordion-title"><strong>' + escapeHtml(entry.title) + '</strong><small>' + escapeHtml(entry.summary) + '</small></span><span class="accordion-icon"><i class="fas fa-chevron-down"></i></span></summary>' +
        '<div class="accordion-content">' +
          '<div class="accordion-intro"><p>' + escapeHtml(entry.summary) + '</p></div>' +
          buildSections(entry.sections) +
          buildSources(entry) +
        '</div></details>';
    }).join("") +
  '</div></section>';
}

function openEntry(key) {
  const entry = timelineEntries.find(item => item.key === key);
  if (!entry) return;

  activeEntry = key;
  const period = periodFor(entry);
  const milestoneEntriesForPeriod = periodMilestoneMap[entry.period] || [];

  detail.innerHTML =
    '<div class="history-detail-backdrop" aria-hidden="true"></div>' +
    '<div class="history-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="history-detail-title">' +
    '<div class="history-accordion-header">' +
      '<div><span class="detail-kicker">' + escapeHtml(period.era) + '</span>' +
      '<h2>' + escapeHtml(entry.title) + '</h2><span class="detail-years">' + escapeHtml(entry.year) + '</span></div>' +
      '<button class="accordion-close" type="button" aria-label="Fechar história"><i class="fas fa-times"></i></button>' +
    '</div>' +
    '<div class="history-accordion-lead"><p>' + escapeHtml(entry.type === "event" ? entry.summary : entry.lead) + '</p></div>' +
    (entry.type === "chapter"
      ? buildSections(entry.sections) + buildLeaderCards(period) + buildMilestoneAccordion(milestoneEntriesForPeriod) + buildSources(entry)
      : buildSections(entry.sections) + buildSources(entry)) +
    '</div>';

  detail.classList.add("open");
  lockPageScroll();

  detail.querySelector(".accordion-close").addEventListener("click", resetDetail);
  detail.querySelector(".history-detail-backdrop").addEventListener("click", resetDetail);

  detail.querySelectorAll("details[data-accordion-key]").forEach(item => {
    item.addEventListener("click", event => {
      if (!event.target.closest("summary")) return;
      item.classList.add("is-interacting");
      window.setTimeout(() => item.classList.remove("is-interacting"), 420);
    });
  });
  detail.querySelectorAll("details[data-accordion-key]").forEach(item => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      detail.querySelectorAll("details[data-accordion-key][open]").forEach(other => {
        if (other !== item) other.open = false;
      });

      activeEntry = item.dataset.accordionKey;
      renderTimeline();
    });
  });

  detail.querySelectorAll(".history-accordion-item").forEach(item => {
    item.addEventListener("click", event => {
      if (!event.target.closest("summary")) return;
      requestAnimationFrame(() => {
        if (!item.open) return;

        const dialog = detail.querySelector(".history-detail-dialog");
        const header = detail.querySelector(".history-accordion-header");
        if (!dialog) return;

        const dialogRect = dialog.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const targetTop = dialog.scrollTop + itemRect.top - dialogRect.top - headerHeight - 12;

        dialog.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reducedMotionQuery.matches ? "auto" : "smooth"
        });
      });
    });
  });

  renderTimeline();
  requestAnimationFrame(() => detail.querySelector(".accordion-close")?.focus());
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && detail.classList.contains("open")) {
    resetDetail();
  }
});



search.addEventListener("input", renderTimeline);
presidentsSearch.addEventListener("input", renderPresidents);
updateTimelineViewButtons();
renderFilters();
renderTimeline();
renderPresidentFilters();
renderPresidents();
updateBackToTop();
