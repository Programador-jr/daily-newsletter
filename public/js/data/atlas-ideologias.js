/**
 * Atlas político — catálogo de ideologias.
 *
 * Vetores: doze valores de 0 a 100, na ordem definida em atlas-axes.js.
 * 100 corresponde ao primeiro polo de cada eixo. São leituras editoriais
 * aproximadas, não resultados de questionário.
 */
(function () {
  const ideologias = [
    {
      id: "social-democracia",
      nome: "Social-democracia",
      familia: "esquerda",
      periodo: "Fim do século XIX – hoje",
      ideia: "Reformas graduais, economia mista e proteção social.",
      resumo:
        "Corrente que, a partir do fim do século XIX, trocou a ruptura revolucionária pela disputa eleitoral e pela construção de direitos sociais. Combina economia de mercado, regulação pública, serviços universais e negociação com sindicatos, com diferenças entre os modelos nórdicos e as experiências latino-americanas.",
      vetor: [55, 90, 60, 75, 10, 65, 68, 55, 40, 55, 72, 60],
      tensoes: [
        "Universalismo dos serviços públicos convive com a pressão por programas focalizados e cortes fiscais.",
        "Acordos com o mercado e com o centro político podem diluir a ambição redistributiva."
      ],
      pensadores: ["keynes", "gramsci"],
      partidos: ["spd", "pt", "psdb"],
      livros: ["teoria-geral-do-emprego-do-juro-e-da-moeda"]
    },
    {
      id: "socialismo-democratico",
      nome: "Socialismo democrático",
      familia: "esquerda",
      periodo: "Século XX – hoje",
      ideia: "Superar o capitalismo sem abrir mão da democracia.",
      resumo:
        "Família de posições que quer ir além da regulação do mercado sem abandonar eleições, liberdades civis e pluralismo. Propõe propriedade coletiva em setores estratégicos, planejamento democrático e participação de trabalhadores, rejeitando tanto o partido único quanto a social-democracia entendida como administração do capitalismo.",
      vetor: [55, 95, 40, 85, 5, 80, 82, 68, 50, 78, 85, 55],
      tensoes: [
        "Socializar a economia sem concentrar poder político no Estado.",
        "Conciliar alianças eleitorais amplas com transformações estruturais."
      ],
      pensadores: ["rosa-luxemburgo", "gramsci"],
      partidos: ["psol", "la-france-insoumise"],
      livros: ["reforma-ou-revolucao"]
    },
    {
      id: "trabalhismo",
      nome: "Trabalhismo",
      familia: "esquerda",
      periodo: "1930 – hoje",
      ideia: "Direitos trabalhistas, Estado indutor e aliança popular.",
      resumo:
        "Tradição brasileira consolidada a partir de 1930 e da legislação trabalhista, combinando direitos sociais, sindicatos ligados ao Estado e projetos de industrialização. Em versões posteriores, aproximou-se da social-democracia e do nacionalismo desenvolvimentista, com forte apelo à cidadania pelo trabalho.",
      vetor: [45, 80, 58, 55, 25, 45, 72, 58, 52, 58, 62, 55],
      tensoes: [
        "Sindicatos tutelados pelo Estado convivem com a reivindicação de autonomia sindical.",
        "A base popular ampla exige concessões a setores empresariais e regionais."
      ],
      pensadores: ["getulio-vargas", "joao-goulart", "lula"],
      partidos: ["ptb-1945", "pdt", "pt"],
      livros: ["raizes-do-brasil"]
    },
    {
      id: "marxismo",
      nome: "Marxismo",
      familia: "esquerda-radical",
      periodo: "Século XIX – hoje",
      ideia: "Crítica da economia política e centralidade da luta de classes.",
      resumo:
        "Tradição intelectual aberta por Karl Marx e Friedrich Engels, que analisa o capitalismo a partir da exploração do trabalho, da propriedade privada e das contradições entre forças produtivas e relações sociais. Não é uma doutrina única: gerou correntes filosóficas, econômicas e políticas muito diferentes entre si.",
      vetor: [30, 35, 60, 45, 20, 50, 93, 92, 80, 90, 65, 78],
      tensoes: [
        "A análise do capitalismo não define sozinha o modelo de sociedade futura.",
        "Leituras deterministas da história convivem com interpretações abertas à ação política."
      ],
      pensadores: ["karl-marx", "friedrich-engels"],
      partidos: [],
      livros: ["o-manifesto-comunista", "o-capital"]
    },
    {
      id: "marxismo-leninismo",
      nome: "Marxismo-leninismo",
      familia: "esquerda-radical",
      periodo: "1900 – hoje",
      ideia: "Partido de vanguarda, ditadura do proletariado e planejamento.",
      resumo:
        "Doutrina que se tornou base dos regimes comunistas do século XX. Defende a tomada do poder por um partido disciplinado, a ditadura do proletariado como fase de transição e a coletivização dos meios de produção sob planejamento estatal. Suas experiências históricas divergiram entre si e acumularam debates sobre burocracia, repressão e legitimidade.",
      vetor: [18, 25, 80, 30, 45, 25, 92, 95, 85, 90, 55, 75],
      tensoes: [
        "A vanguarda esclarecida tende a substituir a participação das bases.",
        "Planejamento central enfrenta problemas de informação, incentivos e eficiência."
      ],
      pensadores: ["lenin", "karl-marx", "friedrich-engels"],
      partidos: ["pcdo-b"],
      livros: ["o-estado-e-a-revolucao", "o-manifesto-comunista"]
    },
    {
      id: "comunismo-de-conselhos",
      nome: "Comunismo de conselhos",
      familia: "esquerda-radical",
      periodo: "1910 – hoje",
      ideia: "Poder dos conselhos operários contra o partido e o Estado.",
      resumo:
        "Corrente surgida no início do século XX que criticou a centralização bolchevique e defendeu os conselhos de trabalhadores como forma de organização política e econômica. Recusa a ideia de partido de vanguarda e propõe que a produção e a vida social sejam geridas coletivamente pelos próprios produtores.",
      vetor: [75, 60, 30, 85, 10, 80, 90, 88, 75, 88, 85, 62],
      tensoes: [
        "Coordenar conselhos sem reconstruir um centro de poder.",
        "Definir como ocorre a transição e como lidar com a resistência organizada."
      ],
      pensadores: ["rosa-luxemburgo", "gramsci"],
      partidos: [],
      livros: []
    },
    {
      id: "ecossocialismo",
      nome: "Ecossocialismo",
      familia: "esquerda-radical",
      periodo: "1970 – hoje",
      ideia: "Justiça social e limites ecológicos no mesmo projeto.",
      resumo:
        "Corrente que articula a crítica ao capitalismo com a crítica à crise ecológica. Defende planejamento democrático da economia, transição energética e redução do consumo material, argumentando que o mercado e o crescimento contínuo são incompatíveis com os limites planetários.",
      vetor: [55, 88, 40, 85, 5, 85, 85, 65, 60, 80, 90, 30],
      tensoes: [
        "Transição rápida colide com emprego e renda em regiões dependentes de carbono.",
        "Planejamento ecológico pode limitar escolhas individuais e consumo."
      ],
      pensadores: ["karl-marx"],
      partidos: ["psol"],
      livros: []
    },
    {
      id: "liberalismo-social",
      nome: "Liberalismo social",
      familia: "centro",
      periodo: "Século XX – hoje",
      ideia: "Liberdades individuais com redes de proteção.",
      resumo:
        "Vertente liberal que aceita um Estado ativo para garantir oportunidades, saúde, educação e seguridade, sem abandonar eleições, direitos civis e economia de mercado. Distingue-se do liberalismo clássico pela ênfase em desigualdades estruturais e pela defesa de serviços universais.",
      vetor: [60, 92, 45, 75, 12, 78, 52, 40, 28, 50, 65, 65],
      tensoes: [
        "Expandir direitos e serviços impõe custos fiscais e escolhas de prioridade.",
        "Regulação pública pode entrar em conflito com autonomia individual e mercados."
      ],
      pensadores: ["keynes", "mill"],
      partidos: ["partido-democrata-eua", "partido-trabalhista-reino-unido", "psdb"],
      livros: ["teoria-geral-do-emprego-do-juro-e-da-moeda"]
    },
    {
      id: "democracia-crista",
      nome: "Democracia cristã",
      familia: "centro",
      periodo: "Século XIX – hoje",
      ideia: "Democracia, dignidade humana e economia social de mercado.",
      resumo:
        "Família política que combina instituições democráticas, princípios de inspiração cristã e responsabilidade social. Historiamente apoiou a integração europeia, a economia social de mercado e políticas familiares, com posições variadas sobre costumes e imigração.",
      vetor: [55, 90, 55, 65, 10, 70, 58, 48, 38, 30, 35, 45],
      tensoes: [
        "A doutrina religiosa convive com o pluralismo de sociedades seculares.",
        "A proteção da família tradicional colide com a ampliação de direitos civis."
      ],
      pensadores: ["burke"],
      partidos: ["cdu", "psdb"],
      livros: []
    },
    {
      id: "desenvolvimentismo",
      nome: "Desenvolvimentismo",
      familia: "centro",
      periodo: "1930 – hoje",
      ideia: "Estado indutor da industrialização e do crescimento.",
      resumo:
        "Conjunto de projetos latino-americanos que atribui ao Estado o papel de planejar, financiar e coordenar a industrialização. Ganhou força no século XX com a substituição de importações e voltou ao debate com o novo desenvolvimentismo, voltado a câmbio, investimento e capacitação produtiva.",
      vetor: [35, 80, 62, 40, 40, 30, 80, 70, 55, 50, 45, 70],
      tensoes: [
        "Proteção à indústria pode elevar preços e reduzir competitividade.",
        "Autonomia nacional convive com dependência de capital e tecnologia externos."
      ],
      pensadores: ["celso-furtado", "getulio-vargas"],
      partidos: ["psdb", "mdb", "pdt"],
      livros: ["formacao-economica-do-brasil"]
    },
    {
      id: "liberalismo-classico",
      nome: "Liberalismo clássico",
      familia: "direita",
      periodo: "Século XVII – hoje",
      ideia: "Direitos naturais, propriedade e governo limitado.",
      resumo:
        "Tradição que surge na modernidade em defesa da liberdade individual, da propriedade e de limites ao poder arbitrário. No plano econômico, critica monopólios, corporações e intervenções amplas; no plano político, sustenta Constituição, divisão de poderes e consentimento dos governados.",
      vetor: [80, 92, 25, 75, 15, 85, 18, 10, 8, 45, 38, 65],
      tensoes: [
        "Propriedade e liberdade formal não eliminam desigualdades materiais.",
        "O Estado mínimo ainda precisa de instituições fortes para garantir direitos."
      ],
      pensadores: ["locke", "adam-smith", "mill"],
      partidos: ["novo", "partido-republicano-eua"],
      livros: ["dois-tratados-sobre-o-governo", "a-riqueza-das-nacoes"]
    },
    {
      id: "conservadorismo",
      nome: "Conservadorismo",
      familia: "direita",
      periodo: "Século XVIII – hoje",
      ideia: "Continuidade, instituições e mudança prudente.",
      resumo:
        "Família de posições que desconfia de rupturas amplas e valoriza instituições, costumes e vínculos locais. Não é uma doutrina única: convive com versões liberais, religiosas, nacionalistas e paternalistas, variando conforme o país e o momento histórico.",
      vetor: [45, 85, 70, 20, 45, 35, 30, 25, 30, 25, 15, 45],
      tensoes: [
        "Preservar a ordem pode perpetuar injustiças que exigem reforma.",
        "A tradição nacional convive com o pluralismo cultural e religioso."
      ],
      pensadores: ["burke", "montesquieu"],
      partidos: ["partido-conservador-reino-unido", "partido-republicano-eua", "pp"],
      livros: ["reflexoes-sobre-a-revolucao-na-franca"]
    },
    {
      id: "nacionalismo-civico",
      nome: "Nacionalismo cívico",
      familia: "direita",
      periodo: "Século XIX – hoje",
      ideia: "Nação como comunidade política de cidadãos.",
      resumo:
        "Vertente nacionalista que define a nação por instituições, história e cidadania, não por origem étnica. Pode conviver com democracia e pluralismo, mas tende a dar peso à coesão, à língua e a símbolos nacionais na educação e na política externa.",
      vetor: [40, 72, 65, 25, 60, 25, 55, 45, 55, 45, 35, 55],
      tensoes: [
        "Coesão nacional pode entrar em conflito com proteção de minorias.",
        "Soberania nacional limita compromissos e instituições internacionais."
      ],
      pensadores: [],
      partidos: ["fidesz", "bjp"],
      livros: []
    },
    {
      id: "ordoliberalismo",
      nome: "Ordoliberalismo",
      familia: "direita",
      periodo: "1930 – hoje",
      ideia: "Concorrência protegida por regras estatais fortes.",
      resumo:
        "Escola alemã que defende uma economia de mercado com regras antitruste, estabilidade monetária e Estado forte na definição do marco legal. Rejeita tanto o laissez-faire quanto o planejamento central e inspirou a economia social de mercado do pós-guerra.",
      vetor: [55, 90, 45, 70, 15, 80, 32, 22, 15, 55, 45, 55],
      tensoes: [
        "Regras estáveis enfrentam pressões políticas por flexibilização.",
        "A defesa da concorrência convive com tendências de concentração econômica."
      ],
      pensadores: ["hayek"],
      partidos: ["cdu"],
      livros: []
    },
    {
      id: "republicanismo",
      nome: "Republicanismo",
      familia: "centro",
      periodo: "Antiguidade – hoje",
      ideia: "Liberdade como não dominação e virtude cívica.",
      resumo:
        "Tradição que entende a liberdade como ausência de dominação arbitrária e valoriza participação cívica, leis comuns e instituições que fiscalizam o poder. Difere do liberalismo por enfatizar deveres cívicos e a corrupção das instituições, e do socialismo por não ter a propriedade como eixo central.",
      vetor: [45, 88, 45, 70, 12, 78, 60, 50, 35, 70, 65, 60],
      tensoes: [
        "A participação cívica intensa é difícil em sociedades grandes e complexas.",
        "A unidade da comunidade política pode esconder conflitos sociais reais."
      ],
      pensadores: ["rousseau", "montesquieu"],
      partidos: [],
      livros: ["do-contrato-social"]
    },
    {
      id: "fascismo",
      nome: "Fascismo",
      familia: "extrema-direita",
      periodo: "1919 – 1945",
      ideia: "Estado autoritário, nação mítica e mobilização de massas.",
      resumo:
        "Movimento e regime histórico surgido na Itália após a Primeira Guerra Mundial. Combinou ultranacionalismo, liderança carismática, partido único, propaganda, violência política e corporativismo, rejeitando liberalismo e socialismo. Chegou ao poder em 1922 e ruiu com a Segunda Guerra Mundial.",
      vetor: [10, 5, 95, 5, 85, 10, 55, 72, 80, 20, 20, 60],
      tensoes: [
        "A mobilização de massas convive com hierarquia, obediência e culto ao líder.",
        "O discurso revolucionário se combina com alianças com elites tradicionais."
      ],
      pensadores: ["mussolini"],
      partidos: [],
      livros: ["doutrina-do-fascismo"]
    },
    {
      id: "nazismo",
      nome: "Nazismo",
      familia: "extrema-direita",
      periodo: "1920 – 1945",
      ideia: "Racismo biológico, ditadura totalitária e expansionismo.",
      resumo:
        "Movimento liderado pelo Partido Nazista na Alemanha, no poder entre 1933 e 1945. Baseou-se em racismo biológico, antissemitismo, ultranacionalismo, culto ao líder e expansionismo militar. O regime promoveu o Holocausto e a perseguição e o extermínio de povos considerados inferiores, sendo derrotado em 1945.",
      vetor: [5, 2, 98, 2, 95, 5, 50, 85, 95, 15, 5, 70],
      tensoes: [
        "A propaganda de comunidade nacional dependia da exclusão e do extermínio de minorias.",
        "A modernização técnica conviveu com um culto ao passado mítico e à pureza racial."
      ],
      pensadores: ["hitler"],
      partidos: [],
      livros: ["minha-luta"]
    },
    {
      id: "integralismo",
      nome: "Integralismo",
      familia: "extrema-direita",
      periodo: "1932 – 1937",
      ideia: "Nacionalismo católico e Estado corporativo brasileiro.",
      resumo:
        "Movimento brasileiro fundado por Plínio Salgado em 1932, inspirado em correntes autoritárias europeias e no catolicismo social. Defendia Estado forte, corporativismo, disciplina nacional e combate ao comunismo e ao liberalismo; foi proibido em 1937 após o golpe do Estado Novo.",
      vetor: [30, 18, 85, 15, 55, 20, 58, 65, 75, 5, 10, 45],
      tensoes: [
        "A moral católica convive com o culto da nação como valor supremo.",
        "O discurso de ordem conviveu com milícias e violência política."
      ],
      pensadores: ["plinio-salgado"],
      partidos: ["aib"],
      livros: ["o-integralismo-de-plinio-salgado"]
    },
    {
      id: "minarquismo",
      nome: "Minarquismo",
      familia: "libertario",
      periodo: "Século XX – hoje",
      ideia: "Estado mínimo para proteger direitos.",
      resumo:
        "Corrente libertária que aceita um Estado reduzido a funções de defesa, justiça e segurança, financiado por impostos limitados. Defende propriedade, contratos e liberdades civis amplas, rejeitando redistribuição e regulação econômica extensa.",
      vetor: [70, 78, 15, 85, 15, 90, 5, 5, 5, 45, 50, 75],
      tensoes: [
        "Financiar o Estado mínimo sem tributos amplos é um dilema recorrente.",
        "Proteger direitos sem redistribuição deixa desigualdades extremas sem resposta."
      ],
      pensadores: ["hayek"],
      partidos: [],
      livros: ["anarquia-estado-e-utopia"]
    },
    {
      id: "anarcocapitalismo",
      nome: "Anarcocapitalismo",
      familia: "libertario",
      periodo: "1970 – hoje",
      ideia: "Ordem privada sem Estado.",
      resumo:
        "Vertente radical do libertarianismo que rejeita o Estado e imagina a produção de segurança, justiça e infraestrutura por empresas e associações voluntárias. Sustenta que propriedade e contratos podem funcionar sem autoridade política central.",
      vetor: [95, 45, 5, 95, 5, 95, 2, 2, 2, 35, 45, 85],
      tensoes: [
        "A concorrência de agências de segurança pode gerar monopólios privados e conflitos armados.",
        "A liberdade contratual pode conviver com concentrações extremas de poder econômico."
      ],
      pensadores: [],
      partidos: [],
      livros: ["a-etica-da-liberdade"]
    },
    {
      id: "georgismo",
      nome: "Georgismo",
      familia: "libertario",
      periodo: "1879 – hoje",
      ideia: "Imposto único sobre o valor da terra.",
      resumo:
        "Doutrina econômica de Henry George que propõe tributar o valor da terra e dos recursos naturais, reduzindo outros impostos. Acredita que a renda fundiária captura ganhos não produzidos pelo proprietário e alimenta desigualdade e especulação.",
      vetor: [65, 88, 35, 85, 12, 85, 62, 52, 12, 45, 68, 65],
      tensoes: [
        "A justiça fundiária pode atingir pequenos proprietários e arranjos locais.",
        "A arrecadação do imposto único pode não bastar para financiar o Estado."
      ],
      pensadores: [],
      partidos: [],
      livros: ["progresso-e-pobreza"]
    },
    {
      id: "anarcocomunismo",
      nome: "Anarcocomunismo",
      familia: "anarquista",
      periodo: "Século XIX – hoje",
      ideia: "Comunismo libertário sem Estado.",
      resumo:
        "Corrente anarquista que propõe a abolição do Estado, do dinheiro e da propriedade privada dos meios de produção, com bens distribuídos conforme necessidades e decisões tomadas em comunas e conselhos. Teve expressão em experiências revolucionárias e em debates com o marxismo.",
      vetor: [85, 65, 20, 88, 5, 85, 92, 55, 70, 88, 88, 55],
      tensoes: [
        "Organizar a produção em larga escala sem Estado é um desafio prático.",
        "Decisões coletivas podem pressionar liberdades individuais."
      ],
      pensadores: ["kropotkin", "bakunin"],
      partidos: [],
      livros: ["a-conquista-do-pao"]
    },
    {
      id: "anarcossindicalismo",
      nome: "Anarcossindicalismo",
      familia: "anarquista",
      periodo: "Fim do século XIX – hoje",
      ideia: "Sindicatos como base da transformação e da gestão.",
      resumo:
        "Vertente anarquista que vê os sindicatos e as organizações de trabalhadores como instrumentos centrais de luta e de gestão da economia após a revolução. Defende ação direta, greve geral e federações de trabalhadores no lugar de partidos e do Estado.",
      vetor: [90, 65, 15, 85, 5, 88, 85, 80, 60, 85, 80, 50],
      tensoes: [
        "A autonomia sindical dificulta a coordenação entre setores e regiões.",
        "A ação direta convive com a tentação de negociar dentro das instituições."
      ],
      pensadores: ["bakunin"],
      partidos: [],
      livros: []
    },
    {
      id: "mutualismo",
      nome: "Mutualismo",
      familia: "anarquista",
      periodo: "Século XIX – hoje",
      ideia: "Propriedade ligada ao trabalho e trocas sem exploração.",
      resumo:
        "Tradição anarquista formulada por Proudhon que defende a propriedade resultante do trabalho, cooperativas e bancos de crédito mútuo, sem abolir imediatamente o mercado. Critica a renda, os juros e os monopólios, propondo uma economia de produtores associados.",
      vetor: [85, 70, 25, 80, 10, 85, 78, 45, 25, 70, 75, 55],
      tensoes: [
        "Um mercado sem capitalismo tem limites e riscos de reconstruir desigualdades.",
        "A propriedade do trabalho convive com a defesa de recursos comuns."
      ],
      pensadores: ["proudhon", "bakunin"],
      partidos: [],
      livros: ["o-que-e-a-propriedade"]
    },
    {
      id: "peronismo",
      nome: "Peronismo",
      familia: "terceira-posicao",
      periodo: "1945 – hoje",
      ideia: "Justiça social, Estado forte e aliança de massas.",
      resumo:
        "Movimento argentino criado em torno de Juan Domingo Perón, que combinou sindicatos, Estado indutor, políticas sociais e apelo nacional-popular. Conheceu versões de esquerda e de direita e permanece como uma das principais identidades políticas da Argentina.",
      vetor: [45, 55, 65, 30, 40, 30, 75, 65, 70, 40, 45, 55],
      tensoes: [
        "A liderança carismática pode enfraquecer instituições e contrapesos.",
        "A distribuição de renda enfrenta limites de estabilidade fiscal e inflação."
      ],
      pensadores: ["juan-peron"],
      partidos: [],
      livros: []
    },
    {
      id: "nacional-sindicalismo",
      nome: "Nacional-sindicalismo",
      familia: "terceira-posicao",
      periodo: "Século XX",
      ideia: "Sindicatos e nação sob um Estado autoritário.",
      resumo:
        "Corrente autoritária e corporativista que rejeita partidos liberais e a luta de classes, propondo sindicatos únicos organizados pelo Estado e subordinados a um projeto nacional. Aproximou-se de regimes fascistas em Portugal, Espanha e na América Latina.",
      vetor: [20, 10, 90, 5, 70, 10, 60, 75, 85, 8, 15, 60],
      tensoes: [
        "A representação corporativa substitui a liberdade sindical por controle estatal.",
        "A retórica nacional convive com alianças com elites econômicas."
      ],
      pensadores: ["salazar"],
      partidos: [],
      livros: []
    },
    {
      id: "salazarismo",
      nome: "Salazarismo",
      familia: "terceira-posicao",
      periodo: "1932 – 1968",
      ideia: "Ditadura corporativa, catolicismo e colonialismo.",
      resumo:
        "Regime autoritário português liderado por António de Oliveira Salazar entre 1932 e 1968. Combinou censura, polícia política, corporativismo, catolicismo oficial e defesa do império colonial, mantendo eleições sem competição real e forte controle social.",
      vetor: [15, 10, 85, 10, 45, 20, 55, 55, 75, 3, 5, 30],
      tensoes: [
        "A ordem e a estabilidade conviveram com atraso econômico e repressão política.",
        "O catolicismo oficial excluía o pluralismo religioso e político."
      ],
      pensadores: ["salazar"],
      partidos: [],
      livros: []
    },
    {
      id: "comunismo",
      nome: "Comunismo",
      familia: "esquerda-radical",
      periodo: "Século XIX – hoje",
      ideia: "Horizonte de sociedade sem classes e propriedade coletiva.",
      resumo:
        "Família ampla de projetos que defende a abolição da propriedade privada dos meios de produção e a superação das classes sociais. Historicamente se dividiu entre estratégias revolucionárias, eleitorais, conselhistas e de partido único; por isso, comunismo não é sinônimo de um único regime ou de uma única tática.",
      vetor: [30, 45, 50, 55, 15, 65, 92, 88, 80, 92, 75, 70],
      tensoes: [
        "A meta de igualdade convive com disputas sobre meios, instituições e liberdades durante a transição.",
        "Experiências de partido único afastaram o ideal de autogoverno dos produtores."
      ],
      pensadores: ["karl-marx", "friedrich-engels", "rosa-luxemburgo"],
      partidos: ["pcdo-b"],
      livros: ["o-manifesto-comunista", "o-capital"]
    },
    {
      id: "trotskismo",
      nome: "Trotskismo",
      familia: "esquerda-radical",
      periodo: "1920 – hoje",
      ideia: "Revolução permanente e internacionalismo operário.",
      resumo:
        "Corrente marxista que se define pela crítica ao stalinismo e pela defesa da revolução permanente, da democracia interna nos partidos e da expansão internacional do socialismo. Teve papel relevante em sindicatos e organizações de esquerda, sobretudo na América Latina e na Europa.",
      vetor: [35, 50, 50, 65, 20, 60, 90, 88, 75, 92, 82, 72],
      tensoes: [
        "O internacionalismo convive com a necessidade de organizar lutas nacionais concretas.",
        "A crítica à burocracia soviética nem sempre se traduziu em formas organizativas menos centralizadas."
      ],
      pensadores: ["trotsky", "rosa-luxemburgo"],
      partidos: ["psol"],
      livros: ["a-revolucao-permanente", "reforma-ou-revolucao"]
    },
    {
      id: "maoismo",
      nome: "Maoismo",
      familia: "esquerda-radical",
      periodo: "1930 – hoje",
      ideia: "Revolução camponesa, partido e luta contínua.",
      resumo:
        "Corrente derivada da experiência chinesa que deslocou a centralidade operária para o campesinato e enfatizou a guerra popular, a disciplina partidária e a luta contra a burocracia. Teve influência em movimentos anticoloniais e em organizações comunistas de vários países.",
      vetor: [15, 20, 85, 20, 55, 15, 90, 95, 90, 95, 45, 82],
      tensoes: [
        "A mobilização popular convive com hierarquia partidária e campanhas de controle político.",
        "A crítica ao revisionismo soviético não impediu novas formas de centralização."
      ],
      pensadores: ["mao"],
      partidos: ["partido-comunista-chines"],
      livros: ["livro-vermelho"]
    },
    {
      id: "anarcoindividualismo",
      nome: "Anarcoindividualismo",
      familia: "anarquista",
      periodo: "Século XIX – hoje",
      ideia: "Indivíduo soberano contra toda autoridade imposta.",
      resumo:
        "Vertente anarquista que parte da autonomia radical do indivíduo e rejeita Estado, Igreja e normas coletivas impostas. Diferencia-se do anarcocomunismo por admitir propriedade pessoal e contratos voluntários, aproximando-se em alguns pontos de posições libertárias de mercado.",
      vetor: [95, 55, 10, 85, 8, 90, 30, 10, 10, 70, 80, 82],
      tensoes: [
        "A soberania individual dificulta a construção de instituições coletivas duradouras.",
        "A recusa de toda autoridade convive com a necessidade de resolver conflitos entre indivíduos."
      ],
      pensadores: ["stirner"],
      partidos: [],
      livros: ["o-unico-e-sua-propriedade"]
    },
    {
      id: "feminismo",
      nome: "Feminismo",
      familia: "esquerda",
      periodo: "Século XVIII – hoje",
      ideia: "Igualdade de gênero e crítica às hierarquias patriarcais.",
      resumo:
        "Tradição política e intelectual que denuncia a subordinação das mulheres e disputa direitos, representação e autonomia. Reúne correntes liberais, socialistas, negras, interseccionais e pós-coloniais, com agendas que variam conforme o contexto e o período.",
      vetor: [65, 95, 30, 90, 4, 88, 62, 45, 45, 86, 98, 70],
      tensoes: [
        "Pautas universalistas podem apagar diferenças de classe, raça e território.",
        "Conquistas jurídicas não eliminam desigualdades materiais e culturais persistentes."
      ],
      pensadores: ["wollstonecraft", "beauvoir"],
      partidos: ["psol", "pt"],
      livros: ["vindicacao-dos-direitos-da-mulher", "o-segundo-sexo"]
    },
    {
      id: "pan-africanismo",
      nome: "Pan-africanismo",
      familia: "esquerda",
      periodo: "Século XIX – hoje",
      ideia: "Unidade africana, anticolonialismo e soberania.",
      resumo:
        "Conjunto de projetos que articula a luta contra o colonialismo e o racismo à ideia de cooperação e unidade entre os povos africanos e a diáspora. Influenciou independências, movimentos de libertação e debates sobre desenvolvimento, identidade e reparação histórica.",
      vetor: [50, 80, 45, 65, 12, 70, 70, 58, 60, 72, 84, 58],
      tensoes: [
        "A unidade continental convive com diferenças nacionais, étnicas e de projeto político.",
        "A soberania recém-conquistada enfrenta pressões econômicas e heranças coloniais."
      ],
      pensadores: ["nkrumah", "fanon", "nelson-mandela"],
      partidos: ["anc"],
      livros: ["os-condenados-da-terra", "neocolonialismo-ultimo-estagio-do-imperialismo"]
    },
    {
      id: "neoliberalismo",
      nome: "Neoliberalismo",
      familia: "direita",
      periodo: "1930 – hoje",
      ideia: "Mercados, disciplina fiscal e Estado gerencial.",
      resumo:
        "Conjunto de ideias e políticas que ganhou força nos anos 1970 e 1980, combinando desregulação, privatizações, abertura comercial, disciplina fiscal e gestão pública orientada por resultados. Não é idêntico ao liberalismo clássico: propõe um Estado ativo na criação e garantia de mercados.",
      vetor: [65, 88, 20, 80, 12, 88, 8, 5, 5, 52, 52, 84],
      tensoes: [
        "A promessa de eficiência convive com concentração de renda e perda de proteções sociais.",
        "O Estado mínimo na economia pode ser forte na segurança e na disciplina fiscal."
      ],
      pensadores: ["friedman", "hayek"],
      partidos: ["novo", "partido-republicano-eua", "partido-conservador-reino-unido"],
      livros: ["capitalismo-e-liberdade", "o-caminho-da-servidao"]
    },
    {
      id: "populismo",
      nome: "Populismo",
      familia: "centro",
      periodo: "Século XIX – hoje",
      ideia: "Povo contra elites, sem programa fixo.",
      resumo:
        "Conceito que descreve uma forma de fazer política centrada na oposição entre um povo imaginado e uma elite acusada de trair seus interesses. Pode assumir versões de esquerda e de direita, personalistas ou partidárias, e costuma tensionar instituições de mediação, imprensa e oposição.",
      vetor: [50, 75, 55, 45, 28, 45, 60, 50, 58, 52, 55, 55],
      tensoes: [
        "A proximidade com o povo pode conviver com liderança personalista e baixa accountability.",
        "A crítica às elites pode ser democrática ou servir para deslegitimar contrapesos institucionais."
      ],
      pensadores: ["juan-peron"],
      partidos: ["movimento-5-estrelas"],
      livros: []
    }
  ];

  globalThis.AtlasData = globalThis.AtlasData || {};
  globalThis.AtlasData.ideologias = ideologias;
})();
