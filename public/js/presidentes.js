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
const republicPeriodIds=new Set(["primeira-republica","vargas","republica-1946","regime-militar","nova-republica"]);
const phaseOverrides=[
{id:"vargas-1930-1934",periodId:"vargas",era:"Era Vargas",name:"Getúlio Vargas",years:"1930–1934",role:"Chefe do Governo Provisório",context:"Após a Revolução de 1930, Vargas assumiu sem eleição presidencial direta e reorganizou o Estado com forte centralização do poder federal.",achievements:["Criação do Ministério do Trabalho, Indústria e Comércio","Código Eleitoral de 1932 e voto feminino","Nomeação de interventores e reorganização administrativa dos estados"],controversies:["Dissolução do Congresso e concentração de poder no Executivo","Ausência de eleições presidenciais durante o Governo Provisório"]},
{id:"vargas-1934-1937",periodId:"vargas",era:"Era Vargas",name:"Getúlio Vargas",years:"1934–1937",role:"Presidente constitucional",context:"A Constituição de 1934 reorganizou as instituições e Vargas foi eleito indiretamente pela Assembleia Nacional Constituinte.",achievements:["Constituição de 1934","Ampliação de direitos sociais e trabalhistas","Criação de instituições voltadas à organização econômica e do trabalho"],controversies:["Polarização política crescente entre grupos de esquerda e direita","Repressão a movimentos e opositores em ambiente de crescente excepcionalidade institucional"]},
{id:"vargas-1937-1945",periodId:"vargas",era:"Estado Novo",name:"Getúlio Vargas",years:"1937–1945",role:"Chefe do Estado Novo",context:"Em 1937, Vargas fechou o Congresso e instaurou uma ditadura que concentrou poderes no Executivo até 1945.",achievements:["CLT e consolidação da legislação trabalhista em 1943","Criação e fortalecimento de empresas e instituições estatais, incluindo a Companhia Siderúrgica Nacional","Industrialização e atuação econômica mais ampla do Estado"],controversies:["Censura, propaganda oficial e repressão política","Suspensão de liberdades e ausência de eleições presidenciais durante o Estado Novo"]}
];
const additionalMandates=[
{id:"lula-2003-2011",name:"Luiz Inácio Lula da Silva",years:"2003–2011",role:"Presidente",era:"Nova República",periodId:"nova-republica",context:"Primeiro período de Lula na Presidência, iniciado em 2003 e encerrado em 2010, com continuidade de políticas de estabilidade macroeconômica e forte expansão de políticas sociais.",achievements:["Bolsa Família e ampliação das políticas de transferência de renda","Programa de Aceleração do Crescimento (PAC)","Luz para Todos e expansão de políticas de inclusão social","Prouni e expansão do acesso ao ensino superior","Minha Casa, Minha Vida, lançado em 2009"],controversies:["Escândalo do mensalão e crise política de 2005","Casos de corrupção envolvendo integrantes e aliados do governo, posteriormente investigados em diferentes processos"]},
{id:"lula-2023-atual",name:"Luiz Inácio Lula da Silva",years:"2023–atualidade",role:"Presidente",era:"Nova República",periodId:"nova-republica",context:"Terceiro mandato presidencial de Lula, iniciado em 2023. Como o mandato ainda está em curso, resultados de longo prazo não devem ser tratados como encerrados.",achievements:["Reforma tributária — Emenda Constitucional 132/2023","Novo PAC","Novo Minha Casa, Minha Vida","Retomada e reformulação de políticas como Bolsa Família, Farmácia Popular e Mais Médicos","Regime Fiscal Sustentável, instituído pela Lei Complementar 200/2023"],controversies:["Debates sobre trajetória das despesas públicas e sustentabilidade fiscal","Divergências sobre carga tributária, prioridades de gasto e execução das políticas públicas"]},
{id:"bolsonaro-2019-2023",name:"Jair Bolsonaro",years:"2019–2023",role:"Presidente",era:"Nova República",periodId:"nova-republica",context:"Mandato iniciado em 2019 e marcado pela agenda de reformas econômicas, pela pandemia de COVID-19 e por forte polarização política.",achievements:["Reforma da Previdência — Emenda Constitucional 103/2019","Marco Legal do Saneamento — Lei 14.026/2020","Auxílio Emergencial durante a pandemia","Autonomia do Banco Central — Lei Complementar 179/2021"],controversies:["Conflitos políticos e controvérsias na condução da resposta à pandemia de COVID-19","Questionamentos públicos sobre o sistema eleitoral e conflitos institucionais com o TSE e o STF"]},
{id:"fhc-1995-2003",name:"Fernando Henrique Cardoso",years:"1995–2003",role:"Presidente",era:"Nova República",periodId:"nova-republica",context:"Dois mandatos consecutivos sob o desafio de preservar a estabilidade monetária do Plano Real e reformar a estrutura do Estado.",achievements:["Consolidação da estabilidade monetária","Lei de Responsabilidade Fiscal","Programa de privatizações e abertura de setores à iniciativa privada","Reformas administrativa e previdenciária","Expansão de programas sociais federais"],controversies:["Crises cambiais e aumento da dívida pública","Debates sobre privatizações, política econômica e impactos sociais das reformas"]},
{id:"itamar-1992-1995",name:"Itamar Franco",years:"1992–1995",role:"Presidente",era:"Nova República",periodId:"nova-republica",context:"Assumiu após o afastamento e renúncia de Fernando Collor, conduzindo a transição até a eleição de 1994.",achievements:["Plano Real e criação da nova moeda em 1994","Reconstrução da estabilidade econômica após anos de inflação elevada"],controversies:["Instabilidade ministerial e conflitos políticos durante a transição","O plano de estabilização foi acompanhado de debates sobre seus custos e efeitos distributivos"]}
];
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const normalized=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
const richMandateNames=new Set(["Luiz Inácio Lula da Silva","Jair Bolsonaro","Fernando Henrique Cardoso","Itamar Franco"]);function baseMandates(){const result=[];periods.filter(p=>republicPeriodIds.has(p.id)).forEach(period=>period.leaders.forEach((leader,index)=>{if(period.id==="vargas"&&leader.name==="Getúlio Vargas")return;if(period.id==="nova-republica"&&richMandateNames.has(leader.name))return;result.push({id:period.id+"-"+index+"-"+normalized(leader.name).replace(/[^a-z0-9]+/g,"-"),periodId:period.id,era:period.label,name:leader.name,years:leader.years,role:leader.role,context:period.context,achievements:leader.achievements||[],controversies:leader.controversies||[]})}));return result}
const mandates=[...baseMandates(),...phaseOverrides,...additionalMandates].map(m=>({...m,start:Number(String(m.years).match(/\d{4}/)?.[0]||9999)})).sort((a,b)=>a.start-b.start||a.name.localeCompare(b.name,"pt-BR"));
const filterDefinitions=[["Todos",()=>true],["Primeira República",m=>m.periodId==="primeira-republica"],["Era Vargas",m=>m.periodId==="vargas"],["1946–1964",m=>m.periodId==="republica-1946"],["Regime Militar",m=>m.periodId==="regime-militar"],["Nova República",m=>m.periodId==="nova-republica"]];
const positiveOpinion=m=>m.achievements.length?"Uma leitura favorável pode destacar "+m.achievements.slice(0,2).join("; ")+".":"Não há elementos suficientes nesta síntese para formular uma leitura favorável específica.";
const criticalOpinion=m=>m.controversies.length?"Uma leitura crítica pode destacar "+m.controversies.slice(0,2).join("; ")+".":"Não há elementos suficientes nesta síntese para formular uma crítica específica.";
const themeToggle=document.getElementById("theme-toggle"),themeIcon=document.getElementById("theme-icon"),savedTheme=localStorage.getItem("theme")||"light";
document.documentElement.setAttribute("data-theme",savedTheme);
function updateThemeControl(theme){if(!themeToggle||!themeIcon)return;const dark=theme==="dark";themeIcon.className=dark?"fas fa-sun":"fas fa-moon";themeToggle.setAttribute("aria-label",dark?"Ativar tema claro":"Ativar tema escuro");themeToggle.setAttribute("title",dark?"Ativar tema claro":"Ativar tema escuro");themeToggle.setAttribute("aria-pressed",String(dark))}
updateThemeControl(savedTheme);themeToggle?.addEventListener("click",()=>{const theme=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",theme);localStorage.setItem("theme",theme);updateThemeControl(theme)});
const timeline=document.getElementById("mandates-timeline"),searchInput=document.getElementById("mandates-search"),filters=document.getElementById("mandates-filters"),count=document.getElementById("mandates-count");let activeFilter="Todos";
function renderFilters(){filters.innerHTML=filterDefinitions.map(([label])=>'<button class="history-filter '+(label===activeFilter?"active":"")+'" type="button" data-filter="'+escapeHtml(label)+'">'+escapeHtml(label)+"</button>").join("");filters.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;renderFilters();renderMandates()}))}
function renderMandate(m){
  const interim=/interin|junta|provisório|provisoria/i.test(m.role+" "+m.name);
  const photo=m.photo||"";
  const photoHtml=photo
    ? '<img class="mandate-portrait-image" src="'+escapeHtml(photo)+'" alt="Retrato de '+escapeHtml(m.name)+'" loading="lazy">'
    : '<div class="mandate-portrait-placeholder"><i class="fas fa-user-tie" aria-hidden="true"></i></div>';
  const list=(items)=>items.length?'<ul>'+items.map(x=>"<li>"+escapeHtml(x)+"</li>").join("")+"</ul>":'<p class="mandate-empty">Não há itens específicos registrados nesta síntese.</p>';
  return '<article class="mandate-entry'+(interim?" mandate-interim":"")+'">'+
    '<div class="mandate-marker"><span>'+escapeHtml(m.years)+'</span><i></i></div>'+
    '<div class="mandate-card">'+
      '<div class="mandate-card-top">'+
        '<figure class="mandate-portrait">'+photoHtml+'</figure>'+
        '<header class="mandate-card-header"><div><span class="mandate-era">'+escapeHtml(m.era)+'</span><h3>'+escapeHtml(m.name)+'</h3><p>'+escapeHtml(m.role)+'</p></div>'+(interim?'<span class="mandate-badge">Interino / transição</span>':"")+'</header>'+
      '</div>'+
      '<div class="mandate-context"><strong>Contexto</strong><p>'+escapeHtml(m.context)+'</p></div>'+
      '<div class="mandate-accordions">'+
        '<details class="history-accordion-item mandate-accordion"><summary><span class="accordion-title"><strong>Projetos e medidas</strong><small>O que o governo fez ou colocou em prática.</small></span><span class="accordion-icon"><i class="fas fa-chevron-down"></i></span></summary><div class="accordion-content">'+list(m.achievements)+'</div></details>'+
        '<details class="history-accordion-item mandate-accordion"><summary><span class="accordion-title"><strong>Prós — leitura analítica</strong><small>Argumentos que podem sustentar uma avaliação favorável.</small></span><span class="accordion-icon"><i class="fas fa-chevron-down"></i></span></summary><div class="accordion-content"><p class="opinion-text positive">'+escapeHtml(positiveOpinion(m))+'</p></div></details>'+
        '<details class="history-accordion-item mandate-accordion"><summary><span class="accordion-title"><strong>Contras — leitura analítica</strong><small>Argumentos usados em avaliações críticas do mandato.</small></span><span class="accordion-icon"><i class="fas fa-chevron-down"></i></span></summary><div class="accordion-content"><p class="opinion-text critical">'+escapeHtml(criticalOpinion(m))+'</p></div></details>'+
        '<details class="history-accordion-item mandate-accordion"><summary><span class="accordion-title"><strong>Controvérsias e limites</strong><small>Crises, conflitos e problemas documentados.</small></span><span class="accordion-icon"><i class="fas fa-chevron-down"></i></span></summary><div class="accordion-content">'+list(m.controversies)+'</div></details>'+
      '</div>'+
      '<footer class="mandate-card-footer"><span><i class="fas fa-clock"></i> '+escapeHtml(m.years)+'</span><a href="/historia#linha-do-tempo">Ver contexto histórico geral</a></footer>'+
    '</div></article>';
}
let selectedMandateId="";
function renderTimelineNavigator(visible){
  const items=visible.map((m,index)=>'<button class="president-timeline-node'+(m.id===selectedMandateId?' active':'')+'" type="button" data-mandate-id="'+escapeHtml(m.id)+'" aria-label="Ver '+escapeHtml(m.name)+' — '+escapeHtml(m.years)+'"><span class="timeline-node-year">'+escapeHtml(m.years)+'</span><span class="timeline-node-dot"></span><strong>'+escapeHtml(m.name)+'</strong><small>'+escapeHtml(m.role)+'</small></button>').join("");
  return '<div class="president-timeline-wrap"><div class="president-timeline-header"><div><span class="eyebrow">Selecione um período</span><p>Clique em um ano para abrir o presidente e o mandato correspondente.</p></div><button class="timeline-collapse" type="button" aria-expanded="true"><i class="fas fa-chevron-up"></i><span>Recolher</span></button></div><div class="president-timeline-scroll"><div class="president-timeline-track">'+items+'</div></div></div>';
}
function bindTimeline(visible){
  timeline.querySelectorAll(".president-timeline-node").forEach(node=>node.addEventListener("click",()=>{
    selectedMandateId=node.dataset.mandateId;
    renderMandates();
    requestAnimationFrame(()=>document.getElementById("mandate-detail")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"}));
  }));
  const wrap=timeline.querySelector(".president-timeline-wrap"),collapse=timeline.querySelector(".timeline-collapse");
  collapse?.addEventListener("click",()=>{
    const collapsed=wrap.classList.toggle("is-collapsed");
    collapse.setAttribute("aria-expanded",String(!collapsed));
    collapse.querySelector("span").textContent=collapsed?"Expandir":"Recolher";
    collapse.querySelector("i").className=collapsed?"fas fa-chevron-down":"fas fa-chevron-up";
  });
}
function renderMandates(){
  const q=normalized(searchInput.value),pred=filterDefinitions.find(([l])=>l===activeFilter)?.[1]||(()=>true),visible=mandates.filter(m=>pred(m)&&normalized([m.name,m.years,m.role,m.era,m.context,m.achievements.join(" "),m.controversies.join(" ")].join(" ")).includes(q));
  count.textContent=visible.length+(visible.length===1?" mandato":" mandatos");
  if(!visible.length){timeline.innerHTML='<div class="history-no-results"><h3>Nenhum mandato encontrado</h3><p>Tente outro termo ou filtro.</p></div>';return;}
  if(!visible.some(m=>m.id===selectedMandateId)) selectedMandateId=visible[0].id;
  const selected=visible.find(m=>m.id===selectedMandateId)||visible[0];
  timeline.innerHTML=renderTimelineNavigator(visible)+'<div class="mandate-detail" id="mandate-detail">'+renderMandate(selected)+'</div>';
  bindTimeline(visible);
  timeline.querySelectorAll(".mandate-accordion").forEach(item=>item.addEventListener("toggle",()=>{if(!item.open)return;item.closest(".mandate-accordions").querySelectorAll(".mandate-accordion[open]").forEach(other=>{if(other!==item)other.open=false})}));
  const activeNode=timeline.querySelector(".president-timeline-node.active");
  activeNode?.scrollIntoView({behavior:"auto",block:"nearest",inline:"center"});
}
searchInput.addEventListener("input",renderMandates);renderFilters();renderMandates();
const backToTop=document.getElementById("back-to-top");function updateBackToTop(){const visible=window.scrollY>600;backToTop.classList.toggle("is-visible",visible);backToTop.setAttribute("aria-hidden",String(!visible));backToTop.tabIndex=visible?0:-1}window.addEventListener("scroll",updateBackToTop,{passive:true});backToTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
