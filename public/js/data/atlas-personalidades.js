/**
 * Atlas político — catálogo de personalidades.
 *
 * Vetores: doze valores de 0 a 100, na ordem de atlas-axes.js, com 100 no
 * primeiro polo. São leituras editoriais aproximadas, não resultados de
 * questionário.
 */
(function () {
  const personalidades = [
    {
      id: "hobbes",
      nome: "Thomas Hobbes",
      papel: "Filósofo do contrato social",
      area: "filosofo",
      pais: "Inglaterra",
      periodo: "1588–1679",
      resumo:
        "Testemunhou a guerra civil inglesa e escreveu que a vida sem um poder comum seria solitária, pobre e breve. Em Leviatã, justifica um soberano absoluto como forma de evitar a guerra de todos contra todos, ainda que reconheça direitos naturais ligados à autopreservação.",
      vetor: [10, 10, 95, 15, 70, 20, 45, 50, 65, 60, 20, 30],
      ideologia: "conservadorismo",
      obras: ["leviata"],
      marcas: [
        "Soberania absoluta como remédio para o conflito civil.",
        "Direito natural à autopreservação, sem direito de resistência ao soberano."
      ]
    },
    {
      id: "locke",
      nome: "John Locke",
      papel: "Fundador do liberalismo clássico",
      area: "filosofo",
      pais: "Inglaterra",
      periodo: "1632–1704",
      resumo:
        "Defendeu direitos naturais à vida, à liberdade e à propriedade, governo baseado no consentimento e direito de resistência à tirania. Suas teses sobre tolerância e governo limitado influenciaram as revoluções liberais e as constituições modernas.",
      vetor: [80, 92, 25, 70, 15, 85, 25, 15, 10, 65, 45, 60],
      ideologia: "liberalismo-classico",
      obras: ["dois-tratados-sobre-o-governo"],
      marcas: [
        "Governo limitado e legitimado pelo consentimento dos governados.",
        "Propriedade como extensão do trabalho e direito natural."
      ]
    },
    {
      id: "rousseau",
      nome: "Jean-Jacques Rousseau",
      papel: "Filósofo da soberania popular",
      area: "filosofo",
      pais: "Suíça/França",
      periodo: "1712–1778",
      resumo:
        "Criticou a desigualdade produzida pela propriedade e pela vida social e propôs a soberania popular como fundamento da legitimidade. Sua ideia de vontade geral influenciou o republicanismo e a Revolução Francesa, ao mesmo tempo que levantou debates sobre o risco de unanimismo.",
      vetor: [55, 85, 35, 65, 10, 75, 60, 45, 40, 50, 70, 55],
      ideologia: "republicanismo",
      obras: ["do-contrato-social"],
      marcas: [
        "Soberania popular e vontade geral como base da lei.",
        "Crítica da desigualdade e da propriedade concentrada."
      ]
    },
    {
      id: "montesquieu",
      nome: "Montesquieu",
      papel: "Teórico da separação de poderes",
      area: "filosofo",
      pais: "França",
      periodo: "1689–1755",
      resumo:
        "Comparou regimes e leis em diferentes sociedades e defendeu a divisão do poder em Executivo, Legislativo e Judiciário como proteção contra o despotismo. Sua análise das instituições e dos costumes influenciou o constitucionalismo moderno.",
      vetor: [55, 90, 45, 60, 15, 75, 45, 35, 30, 55, 40, 50],
      ideologia: "republicanismo",
      obras: ["o-espirito-das-leis"],
      marcas: [
        "Separação de poderes com freios e contrapesos.",
        "Leis devem ser compreendidas a partir do contexto social e histórico."
      ]
    },
    {
      id: "burke",
      nome: "Edmund Burke",
      papel: "Pensador do conservadorismo",
      area: "filosofo",
      pais: "Irlanda/Reino Unido",
      periodo: "1729–1797",
      resumo:
        "Criticou a ruptura radical da Revolução Francesa em nome da continuidade institucional e da experiência acumulada. Defendeu reformas graduais e o valor de instituições, costumes e vínculos locais, sendo lido como referência do conservadorismo moderno.",
      vetor: [50, 80, 65, 20, 45, 35, 30, 25, 30, 40, 10, 40],
      ideologia: "conservadorismo",
      obras: ["reflexoes-sobre-a-revolucao-na-franca"],
      marcas: [
        "Mudança prudente em vez de ruptura revolucionária.",
        "Instituições e costumes como depósitos de experiência coletiva."
      ]
    },
    {
      id: "mill",
      nome: "John Stuart Mill",
      papel: "Liberal, economista e reformador",
      area: "filosofo",
      pais: "Reino Unido",
      periodo: "1806–1873",
      resumo:
        "Formulou uma defesa influente da liberdade individual, limitando a coerção estatal aos danos a terceiros. Também defendeu o voto das mulheres, reformas sociais e uma economia com maior preocupação distributiva, afastando-se do liberalismo mais ortodoxo.",
      vetor: [70, 95, 20, 85, 10, 85, 30, 20, 10, 70, 85, 65],
      ideologia: "liberalismo-classico",
      obras: ["da-liberdade"],
      marcas: [
        "Princípio do dano como limite à intervenção sobre a vida privada.",
        "Liberalismo político com abertura para reformas sociais."
      ]
    },
    {
      id: "adam-smith",
      nome: "Adam Smith",
      papel: "Economista da divisão do trabalho",
      area: "economista",
      pais: "Escócia",
      periodo: "1723–1790",
      resumo:
        "Descreveu a divisão do trabalho, a formação dos preços e a importância da concorrência, mas também analisou monopólios, corporações e os efeitos sociais do comércio. Não foi um defensor da ausência total de regras, e sim de instituições que permitissem mercados amplos e produtivos.",
      vetor: [75, 80, 30, 70, 15, 85, 20, 10, 5, 55, 50, 65],
      ideologia: "liberalismo-classico",
      obras: ["a-riqueza-das-nacoes"],
      marcas: [
        "Mercados amplos e concorrência como motores da produtividade.",
        "Crítica a monopólios e corporações que restringem a competição."
      ]
    },
    {
      id: "keynes",
      nome: "John Maynard Keynes",
      papel: "Economista da demanda efetiva",
      area: "economista",
      pais: "Reino Unido",
      periodo: "1883–1946",
      resumo:
        "Argumentou que a economia pode permanecer abaixo do pleno emprego e que o Estado deve agir para sustentar a demanda em crises. Sua obra reorganizou a macroeconomia e influenciou o Estado de bem-estar, a regulação financeira e as políticas anticíclicas do pós-guerra.",
      vetor: [55, 88, 50, 70, 15, 75, 65, 55, 35, 50, 70, 65],
      ideologia: "liberalismo-social",
      obras: ["teoria-geral-do-emprego-do-juro-e-da-moeda"],
      marcas: [
        "Intervenção pública para sustentar emprego e demanda.",
        "Instituições internacionais de coordenação econômica."
      ]
    },
    {
      id: "hayek",
      nome: "Friedrich Hayek",
      papel: "Economista da ordem espontânea",
      area: "economista",
      pais: "Áustria/Reino Unido",
      periodo: "1899–1992",
      resumo:
        "Defendeu que preços e concorrência transmitem informação dispersa que nenhum planejador central consegue reunir. Criticou o planejamento econômico e o Estado de bem-estar amplo como ameaças à liberdade, e teve influência decisiva no liberalismo econômico do século XX.",
      vetor: [70, 85, 25, 80, 15, 90, 10, 5, 5, 50, 45, 70],
      ideologia: "liberalismo-classico",
      obras: ["o-caminho-da-servidao"],
      marcas: [
        "Conhecimento disperso torna o planejamento central problemático.",
        "Estado de direito e mercados como garantias da liberdade."
      ]
    },
    {
      id: "friedman",
      nome: "Milton Friedman",
      papel: "Economista monetarista",
      area: "economista",
      pais: "Estados Unidos",
      periodo: "1912–2006",
      resumo:
        "Defendeu regras monetárias estáveis, mercados competitivos e redução da intervenção estatal. Popularizou teses sobre escolha individual, liberdade econômica e políticas como o imposto de renda negativo, influenciando governos e debates sobre política econômica.",
      vetor: [65, 85, 20, 80, 20, 85, 5, 5, 5, 45, 50, 75],
      ideologia: "liberalismo-classico",
      obras: ["capitalismo-e-liberdade"],
      marcas: [
        "Política monetária por regras, não por discricionariedade.",
        "Liberdade econômica como parte da liberdade política."
      ]
    },
    {
      id: "celso-furtado",
      nome: "Celso Furtado",
      papel: "Economista do subdesenvolvimento",
      area: "economista",
      pais: "Brasil",
      periodo: "1920–2004",
      resumo:
        "Analisou a formação econômica brasileira e a dependência estrutural dos países periféricos. Foi um dos formuladores do desenvolvimentismo latino-americano e teve papel central na criação da Sudene e no debate sobre planejamento e distribuição de renda.",
      vetor: [35, 85, 60, 45, 35, 30, 82, 65, 55, 50, 55, 65],
      ideologia: "desenvolvimentismo",
      obras: ["formacao-economica-do-brasil"],
      marcas: [
        "Industrialização planejada como saída para o subdesenvolvimento.",
        "Distribuição de renda e reforma agrária como parte do desenvolvimento."
      ]
    },
    {
      id: "karl-marx",
      nome: "Karl Marx",
      papel: "Filósofo e crítico da economia política",
      area: "revolucionario",
      pais: "Alemanha/Reino Unido",
      periodo: "1818–1883",
      resumo:
        "Desenvolveu uma crítica do capitalismo centrada na exploração do trabalho, na mercadoria e na acumulação de capital. Sua obra inspirou movimentos socialistas e comunistas, além de correntes acadêmicas, e permanece objeto de interpretações divergentes.",
      vetor: [25, 30, 65, 50, 25, 45, 95, 95, 80, 90, 65, 80],
      ideologia: "marxismo",
      obras: ["o-manifesto-comunista", "o-capital"],
      marcas: [
        "Luta de classes como motor das transformações históricas.",
        "Superação da propriedade privada dos meios de produção."
      ]
    },
    {
      id: "friedrich-engels",
      nome: "Friedrich Engels",
      papel: "Teórico e organizador socialista",
      area: "revolucionario",
      pais: "Alemanha/Reino Unido",
      periodo: "1820–1895",
      resumo:
        "Colaborador de Marx e autor de estudos sobre a condição operária e a origem da família e do Estado. Ajudou a organizar partidos socialistas e a difundir o materialismo histórico, com uma leitura própria sobre ciência e evolução social.",
      vetor: [25, 35, 65, 45, 25, 50, 92, 90, 80, 92, 65, 82],
      ideologia: "marxismo",
      obras: ["o-manifesto-comunista"],
      marcas: [
        "Estudo da condição operária na primeira industrialização.",
        "Estado como produto histórico da divisão de classes."
      ]
    },
    {
      id: "lenin",
      nome: "Vladimir Lênin",
      papel: "Líder da Revolução Russa",
      area: "revolucionario",
      pais: "Rússia",
      periodo: "1870–1924",
      resumo:
        "Liderou a tomada do poder pelos bolcheviques em 1917 e fundou a União Soviética. Defendeu o partido de vanguarda, a ditadura do proletariado e o imperialismo como fase do capitalismo, moldando o comunismo do século XX e suas instituições de partido único.",
      vetor: [18, 25, 80, 30, 45, 25, 92, 95, 85, 90, 55, 75],
      ideologia: "marxismo-leninismo",
      obras: ["o-estado-e-a-revolucao"],
      marcas: [
        "Partido de vanguarda como instrumento da revolução.",
        "Estado soviético e ditadura do proletariado como transição."
      ]
    },
    {
      id: "trotsky",
      nome: "Leon Trotsky",
      papel: "Revolucionário e crítico de Stalin",
      area: "revolucionario",
      pais: "Rússia",
      periodo: "1879–1940",
      resumo:
        "Dirigente bolchevique e comandante do Exército Vermelho, defendeu a revolução permanente e a expansão internacional do socialismo. Rompeu com Stalin, foi exilado e assassinado, tornando-se referência de correntes críticas ao stalinismo.",
      vetor: [35, 45, 55, 60, 25, 60, 90, 85, 75, 92, 70, 75],
      ideologia: "trotskismo",
      obras: ["a-revolucao-permanente"],
      marcas: [
        "Revolução permanente e internacionalismo socialista.",
        "Crítica à burocratização do Estado soviético."
      ]
    },
    {
      id: "rosa-luxemburgo",
      nome: "Rosa Luxemburgo",
      papel: "Teórica marxista e revolucionária",
      area: "revolucionario",
      pais: "Polônia/Alemanha",
      periodo: "1871–1919",
      resumo:
        "Criticou tanto o reformismo social-democrata quanto a centralização bolchevique, defendendo a greve de massas e a participação espontânea dos trabalhadores. Foi assassinada em 1919, após a repressão à revolta espartaquista em Berlim.",
      vetor: [50, 80, 30, 80, 10, 80, 88, 75, 65, 90, 85, 60],
      ideologia: "socialismo-democratico",
      obras: ["reforma-ou-revolucao"],
      marcas: [
        "Greve de massas e ação coletiva contra o reformismo gradual.",
        "Liberdade de crítica como condição do socialismo."
      ]
    },
    {
      id: "bakunin",
      nome: "Mikhail Bakunin",
      papel: "Fundador do anarquismo coletivista",
      area: "revolucionario",
      pais: "Rússia",
      periodo: "1814–1876",
      resumo:
        "Criticou o Estado e a autoridade como fontes de opressão e defendeu a revolução social conduzida por trabalhadores e camponeses. Rivalizou com Marx na Primeira Internacional e influenciou o anarquismo, o sindicalismo revolucionário e a crítica ao socialismo estatal.",
      vetor: [90, 60, 15, 85, 5, 85, 85, 60, 60, 85, 80, 45],
      ideologia: "anarcocomunismo",
      obras: ["deus-e-o-estado"],
      marcas: [
        "Rejeição do Estado e de toda autoridade imposta.",
        "Revolução social por trabalhadores e camponeses organizados."
      ]
    },
    {
      id: "kropotkin",
      nome: "Piotr Kropotkin",
      papel: "Teórico do anarcocomunismo",
      area: "revolucionario",
      pais: "Rússia",
      periodo: "1842–1921",
      resumo:
        "Defendeu o apoio mútuo como fator de evolução e a organização comunal como alternativa ao Estado e ao mercado. Suas obras combinaram geografia, biologia e teoria política, e deram forma ao anarcocomunismo moderno.",
      vetor: [85, 70, 20, 85, 5, 85, 90, 55, 70, 90, 85, 40],
      ideologia: "anarcocomunismo",
      obras: ["a-conquista-do-pao"],
      marcas: [
        "Apoio mútuo e cooperação como bases da vida social.",
        "Comunas livres e federações no lugar do Estado."
      ]
    },
    {
      id: "proudhon",
      nome: "Pierre-Joseph Proudhon",
      papel: "Teórico do mutualismo",
      area: "revolucionario",
      pais: "França",
      periodo: "1809–1865",
      resumo:
        "Ficou conhecido pela frase de que a propriedade é um roubo, mas defendia a posse ligada ao trabalho e a organização de produtores associados. Propôs bancos mútuos e trocas sem exploração, sendo uma das primeiras vozes do anarquismo moderno.",
      vetor: [85, 70, 25, 80, 10, 85, 78, 45, 25, 70, 75, 50],
      ideologia: "mutualismo",
      obras: ["o-que-e-a-propriedade"],
      marcas: [
        "Propriedade do trabalho contra rendas e privilégios.",
        "Crédito mútuo e cooperativas como alternativa ao capital."
      ]
    },
    {
      id: "gramsci",
      nome: "Antonio Gramsci",
      papel: "Teórico da hegemonia",
      area: "revolucionario",
      pais: "Itália",
      periodo: "1891–1937",
      resumo:
        "Fundador do Partido Comunista Italiano, analisou a cultura, a educação e a sociedade civil como terrenos de disputa política. Preso pelo regime fascista, escreveu os Cadernos do Cárcere, nos quais desenvolveu os conceitos de hegemonia e intelectual orgânico.",
      vetor: [55, 80, 40, 70, 10, 75, 85, 75, 65, 85, 80, 60],
      ideologia: "socialismo-democratico",
      obras: ["os-cadernos-do-carcere"],
      marcas: [
        "Hegemonia cultural como condição da transformação política.",
        "Intelectuais orgânicos e educação como disputa de sentido."
      ]
    },
    {
      id: "getulio-vargas",
      nome: "Getúlio Vargas",
      papel: "Presidente e líder do trabalhismo",
      area: "estadista",
      pais: "Brasil",
      periodo: "1882–1954",
      resumo:
        "Governou o Brasil entre 1930 e 1945 e de 1951 a 1954, centralizando o poder, criando instituições econômicas e consolidando a legislação trabalhista. Seu governo combinou modernização, nacionalismo econômico e repressão política, sobretudo no Estado Novo.",
      vetor: [40, 60, 75, 30, 40, 35, 75, 65, 60, 45, 40, 55],
      ideologia: "trabalhismo",
      obras: [],
      marcas: [
        "Legislação trabalhista e sindicatos vinculados ao Estado.",
        "Industrialização e centralização do poder federal."
      ]
    },
    {
      id: "joao-goulart",
      nome: "João Goulart",
      papel: "Presidente e líder trabalhista",
      area: "estadista",
      pais: "Brasil",
      periodo: "1919–1976",
      resumo:
        "Foi vice-presidente e presidente do Brasil entre 1961 e 1964, defendendo as reformas de base e a ampliação de direitos sociais. Seu governo enfrentou forte polarização e foi interrompido pelo golpe militar de 1964, que o levou ao exílio.",
      vetor: [45, 75, 55, 50, 25, 45, 75, 60, 55, 55, 60, 55],
      ideologia: "trabalhismo",
      obras: [],
      marcas: [
        "Reformas de base, incluindo agrária, urbana e educacional.",
        "Defesa da legalidade e da ampliação de direitos sociais."
      ]
    },
    {
      id: "lula",
      nome: "Luiz Inácio Lula da Silva",
      papel: "Presidente e líder sindical",
      area: "estadista",
      pais: "Brasil",
      periodo: "1945–",
      resumo:
        "Líder sindical do ABC paulista, foi um dos fundadores do Partido dos Trabalhadores e governou o Brasil entre 2003 e 2010 e a partir de 2023. Seus governos combinaram transferência de renda, valorização do salário mínimo, expansão do ensino superior e políticas de crédito e investimento.",
      vetor: [50, 85, 55, 60, 15, 60, 70, 55, 50, 50, 65, 55],
      ideologia: "trabalhismo",
      obras: [],
      marcas: [
        "Programas de transferência de renda e redução da pobreza.",
        "Estado indutor do investimento e da inclusão social."
      ]
    },
    {
      id: "fernando-henrique-cardoso",
      nome: "Fernando Henrique Cardoso",
      papel: "Sociólogo e presidente",
      area: "estadista",
      pais: "Brasil",
      periodo: "1931–",
      resumo:
        "Sociólogo dedicado ao estudo da dependência e da democracia, foi presidente do Brasil entre 1995 e 2003. Seu governo consolidou o Plano Real, a estabilização monetária, as privatizações e a expansão de programas sociais, em uma agenda liberal-social.",
      vetor: [60, 88, 45, 65, 15, 75, 48, 35, 25, 50, 60, 65],
      ideologia: "liberalismo-social",
      obras: [],
      marcas: [
        "Estabilização monetária e abertura econômica.",
        "Reformas do Estado com políticas sociais focalizadas."
      ]
    },
    {
      id: "bolsonaro",
      nome: "Jair Bolsonaro",
      papel: "Presidente e líder da direita",
      area: "estadista",
      pais: "Brasil",
      periodo: "1955–",
      resumo:
        "Militar reformado e deputado por quase três décadas, foi presidente do Brasil entre 2019 e 2023. Seu governo combinou agenda liberal na economia, pauta conservadora nos costumes, discurso nacionalista e críticas às instituições, além de polêmicas na condução da pandemia.",
      vetor: [30, 55, 85, 10, 75, 15, 45, 55, 60, 20, 10, 50],
      ideologia: "conservadorismo",
      obras: [],
      marcas: [
        "Pauta conservadora nos costumes e retórica nacionalista.",
        "Tensão com instituições e questionamentos ao sistema eleitoral."
      ]
    },
    {
      id: "juan-peron",
      nome: "Juan Domingo Perón",
      papel: "Presidente e fundador do peronismo",
      area: "estadista",
      pais: "Argentina",
      periodo: "1895–1974",
      resumo:
        "Militar e político, governou a Argentina em três períodos e construiu uma coalizão entre sindicatos, Estado e setores populares. Combinou políticas sociais, nacionalização e corporativismo, deixando uma herança disputada por diferentes correntes do peronismo.",
      vetor: [45, 55, 65, 30, 40, 30, 75, 65, 70, 40, 45, 55],
      ideologia: "peronismo",
      obras: [],
      marcas: [
        "Justiça social e aliança entre Estado, sindicatos e massas.",
        "Liderança carismática com forte controle sobre a vida política."
      ]
    },
    {
      id: "margaret-thatcher",
      nome: "Margaret Thatcher",
      papel: "Primeira-ministra britânica",
      area: "estadista",
      pais: "Reino Unido",
      periodo: "1925–2013",
      resumo:
        "Governou o Reino Unido entre 1979 e 1990 e ficou associada à desregulação, às privatizações e ao enfrentamento dos sindicatos. Combinou liberalização econômica com um discurso conservador sobre nação, família e autoridade.",
      vetor: [35, 85, 65, 35, 45, 30, 10, 5, 5, 40, 20, 65],
      ideologia: "conservadorismo",
      obras: [],
      marcas: [
        "Privatizações e redução do papel econômico do Estado.",
        "Centralização do poder e confronto com sindicatos."
      ]
    },
    {
      id: "ronald-reagan",
      nome: "Ronald Reagan",
      papel: "Presidente dos Estados Unidos",
      area: "estadista",
      pais: "Estados Unidos",
      periodo: "1911–2004",
      resumo:
        "Governou os Estados Unidos entre 1981 e 1989, defendendo cortes de impostos, desregulação e aumento dos gastos militares. Sua política externa confrontou a União Soviética e seu discurso conservador marcou o realinhamento do Partido Republicano.",
      vetor: [50, 80, 60, 35, 70, 25, 15, 10, 10, 25, 30, 65],
      ideologia: "conservadorismo",
      obras: [],
      marcas: [
        "Cortes de impostos e desregulação econômica.",
        "Confronto militar com a União Soviética e discurso nacionalista."
      ]
    },
    {
      id: "mussolini",
      nome: "Benito Mussolini",
      papel: "Fundador do fascismo italiano",
      area: "autoritario",
      pais: "Itália",
      periodo: "1883–1945",
      resumo:
        "Jornalista e político socialista convertido ao nacionalismo, fundou os Fasci di Combattimento em 1919 e governou a Itália como ditador a partir de 1922. Combinou culto ao líder, partido único, propaganda e violência política, até a derrota e morte em 1945.",
      vetor: [10, 5, 95, 5, 85, 10, 55, 72, 80, 20, 20, 60],
      ideologia: "fascismo",
      obras: ["doutrina-do-fascismo"],
      marcas: [
        "Estado totalitário e culto ao líder.",
        "Ultranacionalismo, expansionismo e violência política."
      ]
    },
    {
      id: "hitler",
      nome: "Adolf Hitler",
      papel: "Ditador da Alemanha nazista",
      area: "autoritario",
      pais: "Alemanha",
      periodo: "1889–1945",
      resumo:
        "Líder do Partido Nazista e chanceler da Alemanha a partir de 1933, impôs uma ditadura racialista que perseguiu e exterminou judeus, ciganos, pessoas com deficiência e outros grupos. Sua política expansionista levou à Segunda Guerra Mundial e ao Holocausto.",
      vetor: [5, 2, 98, 2, 95, 5, 50, 85, 95, 15, 5, 70],
      ideologia: "nazismo",
      obras: ["minha-luta"],
      marcas: [
        "Racismo biológico e antissemitismo de Estado.",
        "Expansionismo militar e extermínio organizado."
      ]
    },
    {
      id: "salazar",
      nome: "António de Oliveira Salazar",
      papel: "Ditador do Estado Novo português",
      area: "autoritario",
      pais: "Portugal",
      periodo: "1889–1970",
      resumo:
        "Professor de economia e chefe do governo português entre 1932 e 1968, construiu um regime autoritário, corporativo e católico. Manteve o império colonial, censurou a imprensa e usou a polícia política contra opositores, em nome de ordem e estabilidade.",
      vetor: [15, 10, 85, 10, 45, 20, 55, 55, 75, 3, 5, 25],
      ideologia: "salazarismo",
      obras: [],
      marcas: [
        "Corporativismo, censura e polícia política.",
        "Catolicismo oficial e defesa do império colonial."
      ]
    },
    {
      id: "pinochet",
      nome: "Augusto Pinochet",
      papel: "Ditador do Chile",
      area: "autoritario",
      pais: "Chile",
      periodo: "1915–2006",
      resumo:
        "Liderou o golpe de 1973 que derrubou Salvador Allende e governou o Chile até 1990. Seu regime combinou repressão, tortura e desaparecimentos com uma das primeiras aplicações radicais de políticas de mercado, com forte impacto social.",
      vetor: [15, 5, 90, 15, 80, 10, 20, 15, 10, 30, 15, 55],
      ideologia: "conservadorismo",
      obras: [],
      marcas: [
        "Repressão política e violações sistemáticas de direitos humanos.",
        "Reformas econômicas de mercado conduzidas sob ditadura."
      ]
    },
    {
      id: "plinio-salgado",
      nome: "Plínio Salgado",
      papel: "Fundador do integralismo brasileiro",
      area: "autoritario",
      pais: "Brasil",
      periodo: "1895–1975",
      resumo:
        "Escritor e líder da Ação Integralista Brasileira, fundada em 1932, defendeu um Estado nacional-corporativo, o catolicismo social e a disciplina nacional. Após a proibição do movimento em 1937, afastou-se da política até retornar em partidos de direita nas décadas seguintes.",
      vetor: [30, 18, 85, 15, 55, 20, 58, 65, 75, 5, 10, 45],
      ideologia: "integralismo",
      obras: ["o-integralismo-de-plinio-salgado"],
      marcas: [
        "Estado forte, corporativo e de inspiração católica.",
        "Nacionalismo e combate ao comunismo e ao liberalismo."
      ]
    },
    {
      id: "olavo-de-carvalho",
      nome: "Olavo de Carvalho",
      papel: "Ensaísta e ideólogo da nova direita",
      area: "intelectual",
      pais: "Brasil",
      periodo: "1947–2022",
      resumo:
        "Ensaísta e professor autodidata, tornou-se referência de setores conservadores brasileiros com críticas ao que chamava de gramscianismo cultural e ao politicamente correto. Sua produção misturou filosofia, religião e polêmica, exercendo forte influência sobre a direita bolsonarista.",
      vetor: [35, 60, 70, 15, 65, 25, 40, 40, 45, 10, 10, 50],
      ideologia: "conservadorismo",
      obras: [],
      marcas: [
        "Crítica cultural conservadora e anticomunismo.",
        "Influência sobre a formação intelectual da nova direita brasileira."
      ]
    },
    {
      id: "paulo-freire",
      nome: "Paulo Freire",
      papel: "Educador e teórico da pedagogia crítica",
      area: "intelectual",
      pais: "Brasil",
      periodo: "1921–1997",
      resumo:
        "Desenvolveu uma pedagogia que parte da experiência dos estudantes e entende a educação como prática de liberdade. Exilado durante a ditadura militar, teve sua obra difundida internacionalmente e se tornou referência em alfabetização e educação popular.",
      vetor: [60, 90, 30, 80, 5, 80, 70, 50, 45, 65, 90, 60],
      ideologia: "socialismo-democratico",
      obras: ["pedagogia-do-oprimido"],
      marcas: [
        "Educação dialógica como prática de liberdade.",
        "Alfabetização ligada à leitura crítica do mundo."
      ]
    },
    {
      id: "nelson-mandela",
      nome: "Nelson Mandela",
      papel: "Líder antiapartheid e presidente",
      area: "intelectual",
      pais: "África do Sul",
      periodo: "1918–2013",
      resumo:
        "Líder do Congresso Nacional Africano, passou 27 anos preso por sua luta contra o apartheid e tornou-se o primeiro presidente negro da África do Sul, em 1994. Seu governo priorizou reconciliação, instituições democráticas e políticas de reparação social.",
      vetor: [55, 92, 45, 80, 5, 85, 65, 50, 45, 60, 85, 55],
      ideologia: "social-democracia",
      obras: [],
      marcas: [
        "Fim do apartheid por negociação e mobilização de massas.",
        "Reconciliação nacional e construção institucional democrática."
      ]
    },
    {
      id: "maquiavel",
      nome: "Nicolau Maquiavel",
      papel: "Secretário florentino e teórico do poder",
      area: "filosofo",
      pais: "Itália",
      periodo: "1469–1527",
      resumo:
        "Servidor da República de Florença, escreveu sobre a conquista e a conservação do poder separando a análise política da moral cristã. Em O Príncipe, descreve a ação dos governantes como ela é; nos Discursos, defende com mais clareza a república e o conflito civil como fonte de liberdade.",
      vetor: [55, 50, 65, 65, 60, 40, 55, 50, 55, 70, 55, 55],
      ideologia: "republicanismo",
      obras: ["o-principe"],
      marcas: [
        "Realismo político e autonomia da política diante da moral religiosa.",
        "República, virtù cívica e conflito como antídoto contra a tirania."
      ]
    },
    {
      id: "tocqueville",
      nome: "Alexis de Tocqueville",
      papel: "Teórico da democracia de massas",
      area: "filosofo",
      pais: "França",
      periodo: "1805–1859",
      resumo:
        "Viajou pelos Estados Unidos e descreveu a igualdade de condições como tendência profunda das sociedades modernas. Ao mesmo tempo que defendeu a liberdade política e o associativismo, alertou para o conformismo e para um despotismo brando que poderia se instalar em nome da segurança.",
      vetor: [70, 90, 45, 70, 10, 80, 40, 30, 20, 45, 55, 60],
      ideologia: "liberalismo-classico",
      obras: ["a-democracia-na-america"],
      marcas: [
        "Liberdade política depende de associações e costumes cívicos.",
        "Igualdade democrática pode produzir conformismo e centralização."
      ]
    },
    {
      id: "henry-george",
      nome: "Henry George",
      papel: "Economista da justiça fundiária",
      area: "economista",
      pais: "Estados Unidos",
      periodo: "1839–1897",
      resumo:
        "Jornalista e economista autodidata, sustentou que a pobreza persiste em meio ao progresso porque a renda da terra absorve o valor criado pela comunidade. Sua proposta de imposto único sobre o valor fundiário influenciou reformas tributárias e correntes de esquerda e de mercado.",
      vetor: [65, 88, 40, 80, 12, 82, 62, 52, 20, 55, 65, 65],
      ideologia: "georgismo",
      obras: ["progresso-e-pobreza"],
      marcas: [
        "Renda da terra como fonte de desigualdade e especulação.",
        "Imposto único sobre o valor fundiário no lugar de outros tributos."
      ]
    },
    {
      id: "mises",
      nome: "Ludwig von Mises",
      papel: "Economista da escola austríaca",
      area: "economista",
      pais: "Áustria/Estados Unidos",
      periodo: "1881–1973",
      resumo:
        "Defendeu que a economia não pode ser planejada centralmente porque os preços de mercado transmitem informação dispersa e permitem calcular custos. Sua crítica ao intervencionismo e sua teoria da ação humana deram base a correntes liberais e libertárias do século XX.",
      vetor: [75, 75, 15, 85, 15, 90, 5, 2, 2, 55, 50, 80],
      ideologia: "liberalismo-classico",
      obras: ["acao-humana"],
      marcas: [
        "Impossibilidade do cálculo econômico sem preços livres.",
        "Mercado como processo de coordenação da ação individual."
      ]
    },
    {
      id: "nozick",
      nome: "Robert Nozick",
      papel: "Filósofo libertário",
      area: "filosofo",
      pais: "Estados Unidos",
      periodo: "1938–2002",
      resumo:
        "Partiu dos direitos individuais para justificar um Estado mínimo e rejeitar a redistribuição obrigatória. Seu debate com John Rawls redefiniu a filosofia política contemporânea e deu forma acadêmica ao libertarianismo de mercado.",
      vetor: [80, 80, 15, 85, 12, 88, 8, 5, 5, 60, 55, 80],
      ideologia: "minarquismo",
      obras: ["anarquia-estado-e-utopia"],
      marcas: [
        "Direitos individuais como limite à coerção estatal.",
        "Estado mínimo como solução compatível com a liberdade."
      ]
    },
    {
      id: "rothbard",
      nome: "Murray Rothbard",
      papel: "Teórico do anarcocapitalismo",
      area: "economista",
      pais: "Estados Unidos",
      periodo: "1926–1995",
      resumo:
        "Combinou economia austríaca e ética dos direitos naturais para defender a abolição do Estado. Imaginou segurança, justiça e infraestrutura produzidas por agências privadas e associações voluntárias, tornando-se uma das principais referências do anarcocapitalismo.",
      vetor: [95, 50, 5, 95, 5, 95, 2, 2, 2, 60, 45, 85],
      ideologia: "anarcocapitalismo",
      obras: ["a-etica-da-liberdade"],
      marcas: [
        "Autopropriedade e não agressão como princípios centrais.",
        "Ordem privada substituta de todas as funções estatais."
      ]
    },
    {
      id: "arendt",
      nome: "Hannah Arendt",
      papel: "Teórica do totalitarismo e da ação política",
      area: "intelectual",
      pais: "Alemanha/Estados Unidos",
      periodo: "1906–1975",
      resumo:
        "Analisou o totalitarismo, o antissemitismo e a condição humana, defendendo a política como espaço de pluralidade e ação conjunta. Sua obra combina filosofia, história e crítica cultural, e permanece central para pensar burocracia, violência e responsabilidade.",
      vetor: [55, 92, 35, 85, 5, 85, 50, 40, 35, 80, 80, 60],
      ideologia: "republicanismo",
      obras: ["a-origem-do-totalitarismo"],
      marcas: [
        "Totalitarismo como ruptura da pluralidade e da ação política.",
        "Liberdade pública ligada à participação e ao aparecimento em comum."
      ]
    },
    {
      id: "orwell",
      nome: "George Orwell",
      papel: "Escritor e crítico do totalitarismo",
      area: "intelectual",
      pais: "Reino Unido",
      periodo: "1903–1950",
      resumo:
        "Romancista e ensaísta socialista, lutou na Guerra Civil Espanhola e escreveu contra o totalitarismo soviético e as manipulações da linguagem política. Em 1984 e A Revolução dos Bichos, transformou a crítica política em imagens duradouras sobre poder, vigilância e propaganda.",
      vetor: [55, 90, 25, 80, 5, 85, 75, 55, 50, 85, 85, 55],
      ideologia: "socialismo-democratico",
      obras: ["1984"],
      marcas: [
        "Linguagem e memória como terrenos de controle político.",
        "Socialismo democrático contra o totalitarismo de partido único."
      ]
    },
    {
      id: "darcy-ribeiro",
      nome: "Darcy Ribeiro",
      papel: "Antropólogo, educador e político",
      area: "intelectual",
      pais: "Brasil",
      periodo: "1922–1997",
      resumo:
        "Antropólogo e indigenista, dedicou-se à formação do povo brasileiro, à educação pública e à defesa dos povos indígenas. Sua obra combina pesquisa, ensaio e projeto político, e sua atuação incluiu a criação de universidades e a resistência à ditadura militar.",
      vetor: [55, 88, 35, 85, 5, 75, 78, 55, 55, 75, 90, 60],
      ideologia: "socialismo-democratico",
      obras: ["o-povo-brasileiro"],
      marcas: [
        "Formação brasileira como encontro violento e projeto inconcluso.",
        "Educação pública e direitos indígenas como tarefas democráticas."
      ]
    },
    {
      id: "fanon",
      nome: "Frantz Fanon",
      papel: "Psiquiatra e teórico anticolonial",
      area: "revolucionario",
      pais: "Martinica/Argélia",
      periodo: "1925–1961",
      resumo:
        "Psiquiatra e militante da independência argelina, analisou o colonialismo como sistema de violência e desumanização. Seus escritos sobre racismo, linguagem e libertação nacional influenciaram movimentos anticoloniais e estudos pós-coloniais.",
      vetor: [40, 65, 55, 65, 15, 60, 75, 60, 65, 75, 85, 65],
      ideologia: "pan-africanismo",
      obras: ["os-condenados-da-terra"],
      marcas: [
        "Colonialismo como violência estrutural e negação de humanidade.",
        "Libertação nacional e reconstrução da subjetividade colonizada."
      ]
    },
    {
      id: "nkrumah",
      nome: "Kwame Nkrumah",
      papel: "Líder da independência de Gana",
      area: "estadista",
      pais: "Gana",
      periodo: "1909–1972",
      resumo:
        "Liderou a independência de Gana em 1957 e tornou-se um dos principais defensores do pan-africanismo e da unidade continental. Seu governo combinou investimento estatal, projetos de industrialização e crítica ao neocolonialismo, até ser deposto em 1966.",
      vetor: [50, 60, 55, 55, 20, 55, 75, 65, 70, 65, 80, 65],
      ideologia: "pan-africanismo",
      obras: ["neocolonialismo-ultimo-estagio-do-imperialismo"],
      marcas: [
        "Independência política sem independência econômica não basta.",
        "Unidade africana como resposta ao neocolonialismo."
      ]
    },
    {
      id: "mao",
      nome: "Mao Tsé-Tung",
      papel: "Líder revolucionário chinês",
      area: "revolucionario",
      pais: "China",
      periodo: "1893–1976",
      resumo:
        "Dirigiu o Partido Comunista Chinês na revolução de 1949 e governou a República Popular da China até 1976. Combinou mobilização camponesa, coletivização, campanhas de massa e rupturas políticas, deixando uma herança disputada e profundamente marcada por custos humanos.",
      vetor: [15, 20, 85, 20, 55, 15, 90, 95, 90, 95, 45, 82],
      ideologia: "maoismo",
      obras: ["livro-vermelho"],
      marcas: [
        "Revolução camponesa e guerra popular como estratégia.",
        "Campanhas de massa e centralização partidária."
      ]
    },
    {
      id: "beauvoir",
      nome: "Simone de Beauvoir",
      papel: "Filósofa e teórica feminista",
      area: "filosofo",
      pais: "França",
      periodo: "1908–1986",
      resumo:
        "Filósofa existencialista e escritora, analisou a condição das mulheres como construção social e histórica. O Segundo Sexo tornou-se obra fundadora do feminismo contemporâneo ao separar biologia de destino e denunciar a subordinação feminina na cultura e na vida material.",
      vetor: [60, 90, 30, 90, 5, 85, 60, 45, 40, 85, 98, 70],
      ideologia: "feminismo",
      obras: ["o-segundo-sexo"],
      marcas: [
        "A mulher não nasce mulher: torna-se, em condições históricas dadas.",
        "Liberdade existencial e crítica das estruturas que a limitam."
      ]
    },
    {
      id: "wollstonecraft",
      nome: "Mary Wollstonecraft",
      papel: "Pioneira do feminismo moderno",
      area: "filosofo",
      pais: "Reino Unido",
      periodo: "1759–1797",
      resumo:
        "Escritora e filósofa, defendeu a educação das mulheres e sua participação como cidadãs racionais. Em Reivindicação dos Direitos da Mulher, criticou a educação ornamental e a exclusão política feminina, articulando liberalismo, república e emancipação.",
      vetor: [60, 85, 35, 85, 10, 80, 55, 40, 35, 75, 95, 60],
      ideologia: "feminismo",
      obras: ["vindicacao-dos-direitos-da-mulher"],
      marcas: [
        "Educação igualitária como base da cidadania feminina.",
        "Crítica da dependência econômica e da exclusão política das mulheres."
      ]
    },
    {
      id: "rawls",
      nome: "John Rawls",
      papel: "Filósofo da justiça como equidade",
      area: "filosofo",
      pais: "Estados Unidos",
      periodo: "1921–2002",
      resumo:
        "Propôs pensar a justiça a partir de um contrato hipotético em que pessoas escolheriam princípios sem saber sua posição social. Sua teoria combina liberdades básicas com a defesa de que desigualdades só se justificam se beneficiarem os menos favorecidos.",
      vetor: [65, 95, 40, 80, 12, 80, 55, 45, 30, 55, 75, 65],
      ideologia: "liberalismo-social",
      obras: ["uma-teoria-da-justica"],
      marcas: [
        "Posição original e véu da ignorância como experimento moral.",
        "Princípio da diferença e prioridade das liberdades básicas."
      ]
    },
    {
      id: "popper",
      nome: "Karl Popper",
      papel: "Filósofo da ciência e da sociedade aberta",
      area: "filosofo",
      pais: "Áustria/Reino Unido",
      periodo: "1902–1994",
      resumo:
        "Formulou a falseabilidade como critério de cientificidade e defendeu a sociedade aberta contra o historicismo e o autoritarismo. Sua crítica a Platão, Hegel e Marx combinou epistemologia e política, em defesa de instituições corrigíveis e pluralismo.",
      vetor: [70, 95, 40, 85, 12, 85, 45, 35, 25, 70, 75, 70],
      ideologia: "liberalismo-social",
      obras: ["a-sociedade-aberta-e-seus-inimigos"],
      marcas: [
        "Conhecimento como conjectura e refutação, não revelação.",
        "Sociedade aberta e reformas graduais contra o historicismo."
      ]
    },
    {
      id: "schmitt",
      nome: "Carl Schmitt",
      papel: "Jurista e teórico da soberania",
      area: "autoritario",
      pais: "Alemanha",
      periodo: "1888–1985",
      resumo:
        "Jurista conservador que definiu o político pela distinção entre amigo e inimigo e criticou o liberalismo por diluir a soberania. Sua obra influenciou debates sobre exceção e poder constituinte, mas seu envolvimento com o regime nazista torna sua recepção inseparável dessa história.",
      vetor: [25, 15, 85, 10, 70, 15, 50, 60, 70, 25, 15, 50],
      ideologia: "conservadorismo",
      obras: ["o-conceito-do-politico"],
      marcas: [
        "Soberania como decisão sobre o estado de exceção.",
        "Crítica ao liberalismo e à mediação parlamentar."
      ]
    },
    {
      id: "stirner",
      nome: "Max Stirner",
      papel: "Filósofo do individualismo radical",
      area: "filosofo",
      pais: "Alemanha",
      periodo: "1806–1856",
      resumo:
        "Autor de O Único e sua Propriedade, atacou Estado, religião e moral como poderes que subordinam o indivíduo a abstrações. Sua obra influenciou o anarquismo individualista e correntes libertárias, embora ofereça pouca orientação para organização coletiva.",
      vetor: [95, 50, 10, 85, 10, 85, 15, 5, 5, 65, 80, 80],
      ideologia: "anarcoindividualismo",
      obras: ["o-unico-e-sua-propriedade"],
      marcas: [
        "O indivíduo como única realidade e limite de toda autoridade.",
        "Crítica de Estado, Igreja e moral como poderes alienantes."
      ]
    },
    {
      id: "sergio-buarque",
      nome: "Sérgio Buarque de Holanda",
      papel: "Historiador e intérprete do Brasil",
      area: "intelectual",
      pais: "Brasil",
      periodo: "1902–1982",
      resumo:
        "Historiador e crítico literário, interpretou a formação brasileira a partir da família patriarcal, do personalismo e da dificuldade de construir instituições impessoais. Raízes do Brasil tornou-se leitura central sobre patrimonialismo, cordialidade e modernização.",
      vetor: [60, 85, 45, 75, 10, 70, 55, 40, 35, 60, 80, 65],
      ideologia: "desenvolvimentismo",
      obras: ["raizes-do-brasil"],
      marcas: [
        "Patrimonialismo e personalismo como heranças da formação brasileira.",
        "Modernização sem ruptura completa com o privado no espaço público."
      ]
    },
    {
      "id": "angela-davis",
      "nome": "Angela Davis",
      "papel": "Filósofa, ativista e teórica crítica",
      "area": "revolucionario",
      "pais": "Estados Unidos",
      "periodo": "1944–",
      "resumo": "Filósofa e ativista cuja crítica ao racismo, ao encarceramento e às desigualdades de classe articula feminismo negro, abolicionismo penal e tradição socialista.",
      "vetor": [55, 82, 25, 78, 18, 75, 18, 12, 20, 58, 88, 72],
      "ideologia": "socialismo-democratico",
      "obras": [
      ],
      "marcas": [
        "Crítica interseccional de raça, classe e gênero.",
        "Abolicionismo penal e transformação estrutural."
      ]
    },
    {
      "id": "ayn-rand",
      "nome": "Ayn Rand",
      "papel": "Filósofa do objetivismo",
      "area": "filosofo",
      "pais": "Rússia/Estados Unidos",
      "periodo": "1905–1982",
      "resumo": "Defendeu o individualismo racional, os direitos de propriedade e o capitalismo laissez-faire, rejeitando o altruísmo obrigatório e a intervenção estatal na economia.",
      "vetor": [92, 76, 15, 72, 12, 90, 8, 5, 5, 35, 55, 82],
      "ideologia": "liberalismo-classico",
      "obras": [
      ],
      "marcas": [
        "Individualismo como princípio moral.",
        "Capitalismo laissez-faire e direitos de propriedade."
      ]
    },
    {
      "id": "golda-meir",
      "nome": "Golda Meir",
      "papel": "Primeira-ministra de Israel",
      "area": "estadista",
      "pais": "Israel",
      "periodo": "1898–1978",
      "resumo": "Líder sionista e primeira-ministra de Israel, combinou social-democracia trabalhista, forte centralidade estatal e uma política de segurança marcada pelos conflitos regionais.",
      "vetor": [20, 55, 74, 28, 78, 18, 38, 52, 60, 52, 35, 48],
      "ideologia": "sionismo",
      "obras": [],
      "marcas": [
        "Construção nacional e centralidade do Estado.",
        "Segurança nacional em contexto de conflito permanente."
      ]
    },
    {
      "id": "indira-gandhi",
      "nome": "Indira Gandhi",
      "papel": "Primeira-ministra da Índia",
      "area": "estadista",
      "pais": "Índia",
      "periodo": "1917–1984",
      "resumo": "Primeira-ministra indiana que ampliou o papel econômico do Estado e projetou o país no Sul Global, mas também concentrou poder durante o Estado de Emergência.",
      "vetor": [18, 28, 82, 48, 52, 35, 25, 62, 52, 42, 55, 46],
      "ideologia": "socialismo-democratico",
      "obras": [],
      "marcas": [
        "Nacionalismo desenvolvimentista e não alinhamento.",
        "Centralização executiva durante o Estado de Emergência."
      ]
    },
    {
      "id": "emmeline-pankhurst",
      "nome": "Emmeline Pankhurst",
      "papel": "Líder sufragista",
      "area": "revolucionario",
      "pais": "Reino Unido",
      "periodo": "1858–1928",
      "resumo": "Organizadora do movimento sufragista britânico, defendeu ação direta e mobilização radical para conquistar o voto feminino e a participação política das mulheres.",
      "vetor": [62, 94, 30, 85, 20, 78, 42, 18, 20, 58, 92, 70],
      "ideologia": "feminismo",
      "obras": [],
      "marcas": [
        "Voto feminino como condição de cidadania.",
        "Ação direta e organização militante."
      ]
    },
    {
      "id": "simone-weil",
      "nome": "Simone Weil",
      "papel": "Filósofa e ativista",
      "area": "filosofo",
      "pais": "França",
      "periodo": "1909–1943",
      "resumo": "Filósofa francesa que aproximou mística, crítica da opressão e experiência operária, defendendo enraizamento comunitário e atenção radical aos vulneráveis.",
      "vetor": [48, 86, 30, 82, 14, 80, 28, 20, 30, 72, 92, 62],
      "ideologia": "socialismo-democratico",
      "obras": [
      ],
      "marcas": [
        "Crítica da opressão industrial e burocrática.",
        "Enraizamento, responsabilidade e atenção ao outro."
      ]
    },
    {
      "id": "rosa-parks",
      "nome": "Rosa Parks",
      "papel": "Ativista pelos direitos civis",
      "area": "revolucionario",
      "pais": "Estados Unidos",
      "periodo": "1913–2005",
      "resumo": "Ativista dos direitos civis cuja resistência à segregação racial ajudou a desencadear o boicote aos ônibus de Montgomery e a ampliar a luta por igualdade jurídica.",
      "vetor": [56, 94, 18, 82, 14, 84, 38, 18, 24, 62, 94, 68],
      "ideologia": "liberalismo-social",
      "obras": [],
      "marcas": [
        "Desobediência civil contra a segregação.",
        "Direitos civis e igualdade perante a lei."
      ]
    },
    {
      "id": "wangari-maathai",
      "nome": "Wangari Maathai",
      "papel": "Ambientalista e ativista queniana",
      "area": "intelectual",
      "pais": "Quênia",
      "periodo": "1940–2011",
      "resumo": "Fundadora do Movimento Cinturão Verde, articulou defesa ambiental, direitos das mulheres, democracia e desenvolvimento comunitário no Quênia.",
      "vetor": [62, 92, 24, 78, 12, 82, 44, 20, 30, 72, 92, 74],
      "ideologia": "ecossocialismo",
      "obras": [],
      "marcas": [
        "Ecologia ligada à autonomia comunitária.",
        "Direitos das mulheres e democracia ambiental."
      ]
    },
    {
      "id": "malala-yousafzai",
      "nome": "Malala Yousafzai",
      "papel": "Ativista pela educação",
      "area": "intelectual",
      "pais": "Paquistão/Reino Unido",
      "periodo": "1997–",
      "resumo": "Ativista pela educação de meninas e pelo direito universal à escola, transformou a experiência de violência extremista em uma campanha internacional por educação e igualdade.",
      "vetor": [66, 96, 20, 88, 10, 86, 48, 16, 28, 76, 96, 78],
      "ideologia": "liberalismo-social",
      "obras": [
      ],
      "marcas": [
        "Educação universal como direito humano.",
        "Mobilização internacional contra a exclusão de meninas."
      ]
    },
    {
      "id": "djamila-ribeiro",
      "nome": "Djamila Ribeiro",
      "papel": "Filósofa e escritora feminista",
      "area": "intelectual",
      "pais": "Brasil",
      "periodo": "1980–",
      "resumo": "Filósofa e escritora brasileira que popularizou debates sobre lugar de fala, feminismo negro, racismo estrutural e participação política.",
      "vetor": [68, 94, 22, 84, 10, 82, 42, 18, 25, 60, 94, 76],
      "ideologia": "feminismo",
      "obras": [
      ],
      "marcas": [
        "Feminismo negro e crítica ao racismo estrutural.",
        "Ampliação da participação política de grupos subalternizados."
      ]
    }
  ];

  globalThis.AtlasData = globalThis.AtlasData || {};
  globalThis.AtlasData.personalidades = personalidades;
})();
