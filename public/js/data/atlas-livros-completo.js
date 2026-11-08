/**
 * Biblioteca completa baseada no books.json oficial do 12 Axes (321 obras).
 * Os metadados editoriais locais são preservados quando há correspondência.
 */
(function () {
  const livrosOficiais = [
  {
    "id": "o-estado-e-a-revolucao",
    "titulo": "O Estado e a Revolução",
    "autor": "Vladimir Lênin",
    "autorId": "lenin",
    "ano": 1917,
    "vetor": [18, 25, 80, 30, 45, 25, 92, 95, 85, 90, 55, 75],
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Lênin argumenta que o Estado é um instrumento de domínio de classe e deve ser destruído, não capturado, pela revolução, que instituiria um governo dos trabalhadores até o desaparecimento do Estado.",
    "porque": "Fundamenta teoricamente a via revolucionária bolchevique e o modelo de partido e de Estado que ela produziu. A leitura crítica deve confrontar a doutrina com a experiência soviética e com as críticas de socialistas democráticos.",
    "ideologias": [
      "marxismo-leninismo"
    ],
    "temas": [
      "Estado",
      "ditadura do proletariado",
      "revolução",
      "partido"
    ],
    "link": "https://openlibrary.org/search?q=O+Estado+e+a+Revolu%C3%A7%C3%A3o+L%C3%AAnin",
    "imagePath": "/personalities/portraits/lenin.jpg",
    "imageAlt": "Retrato de Vladimir Lênin"
  },
  {
    "id": "stalin-fundamentosdoleninismo",
    "titulo": "Fundamentos do Leninismo",
    "autor": "Josef Stálin",
    "autorId": "stalin",
    "ano": 1924,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Fundamentos do Leninismo é uma obra de Josef Stálin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Fundamentos do Leninismo para conhecer os argumentos e o contexto de Josef Stálin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Fundamentos%20do%20Leninismo%20Josef%20St%C3%A1lin",
    "vetor": [0, 7.5, 98.8, 20, 17.5, 18.8, 93.8, 100, 93.8, 97.5, 26.2, 76.2],
    "imagePath": "/personalities/portraits/stalin.jpg",
    "imageAlt": "Retrato de Josef Stálin"
  },
  {
    "id": "mao-zedong-olivrovermelho",
    "titulo": "O Livro Vermelho",
    "autor": "mao-zedong",
    "autorId": "mao-zedong",
    "ano": 1964,
    "area": "teoria-politica",
    "dificuldade": "intermediario",
    "resumo": "O Livro Vermelho é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Livro Vermelho para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "teoria-politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Livro%20Vermelho%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de mao-zedong"
  },
  {
    "id": "trotsky-arevolucaotraida",
    "titulo": "A Revolução Traída",
    "autor": "Leon Trotsky",
    "autorId": "trotsky",
    "ano": 1936,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Revolução Traída é uma obra de Leon Trotsky que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Revolução Traída para conhecer os argumentos e o contexto de Leon Trotsky e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "trotskismo"
    ],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Revolu%C3%A7%C3%A3o%20Tra%C3%ADda%20Leon%20Trotsky",
    "vetor": [35, 45, 55, 60, 25, 60, 90, 85, 75, 92, 70, 75],
    "imagePath": "/personalities/portraits/trotsky.jpg",
    "imageAlt": "Retrato de Leon Trotsky"
  },
  {
    "id": "anton-pannekoek-conselhosoperarios",
    "titulo": "Conselhos Operários",
    "autor": "Anton Pannekoek",
    "autorId": "anton-pannekoek",
    "ano": 1946,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Conselhos Operários é uma obra de Anton Pannekoek que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Conselhos Operários para conhecer os argumentos e o contexto de Anton Pannekoek e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Conselhos%20Oper%C3%A1rios%20Anton%20Pannekoek",
    "vetor": [78.8, 85, 16.3, 85, 86.2, 83.8, 85, 70, 57.5, 87.5, 73.8, 66.3],
    "imagePath": "/personalities/portraits/anton-pannekoek.jpg",
    "imageAlt": "Retrato de Anton Pannekoek"
  },
  {
    "id": "ferdinand-lassalle-aessenciadaconstituicao",
    "titulo": "A Essência da Constituição",
    "autor": "Ferdinand Lassalle",
    "autorId": "ferdinand-lassalle",
    "ano": 1862,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Essência da Constituição é uma obra de Ferdinand Lassalle que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Essência da Constituição para conhecer os argumentos e o contexto de Ferdinand Lassalle e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Ess%C3%AAncia%20da%20Constitui%C3%A7%C3%A3o%20Ferdinand%20Lassalle",
    "vetor": [13.8, 63.7, 28.7, 36.3, 32.5, 36.3, 90, 85, 70, 85, 70, 73.8],
    "imagePath": "/personalities/portraits/ferdinand-lassalle.jpg",
    "imageAlt": "Retrato de Ferdinand Lassalle"
  },
  {
    "id": "garrett-hardin-atragediadoscomuns",
    "titulo": "A Tragédia dos Comuns",
    "autor": "Garrett Hardin",
    "autorId": "garrett-hardin",
    "ano": 1968,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Tragédia dos Comuns é uma obra de Garrett Hardin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Tragédia dos Comuns para conhecer os argumentos e o contexto de Garrett Hardin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Trag%C3%A9dia%20dos%20Comuns%20Garrett%20Hardin",
    "vetor": [47.5, 41.3, 66.3, 20, 73.7, 60, 32.5, 52.5, 70, 85, 70, 31.2],
    "imagePath": "/personalities/portraits/garrett-hardin.jpg",
    "imageAlt": "Retrato de Garrett Hardin"
  },
  {
    "id": "eduard-bernstein-socialismoevolucionario",
    "titulo": "Socialismo Evolucionário",
    "autor": "Eduard Bernstein",
    "autorId": "eduard-bernstein",
    "ano": 1899,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Socialismo Evolucionário é uma obra de Eduard Bernstein que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Socialismo Evolucionário para conhecer os argumentos e o contexto de Eduard Bernstein e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Socialismo%20Evolucion%C3%A1rio%20Eduard%20Bernstein",
    "vetor": [28.7, 86.2, 33.8, 70, 83.8, 77.5, 73.8, 72.5, 38.8, 70, 65, 61.3],
    "imagePath": "/personalities/portraits/eduard-bernstein.jpg",
    "imageAlt": "Retrato de Eduard Bernstein"
  },
  {
    "id": "mussolini-adoutrinadofascismo",
    "titulo": "A Doutrina do Fascismo",
    "autor": "Benito Mussolini",
    "autorId": "mussolini",
    "ano": 1932,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Doutrina do Fascismo é uma obra de Benito Mussolini que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Doutrina do Fascismo para conhecer os argumentos e o contexto de Benito Mussolini e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "fascismo"
    ],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Doutrina%20do%20Fascismo%20Benito%20Mussolini",
    "vetor": [10, 5, 95, 5, 85, 10, 55, 72, 80, 20, 20, 60],
    "imagePath": "/personalities/portraits/mussolini.jpg",
    "imageAlt": "Retrato de Benito Mussolini"
  },
  {
    "id": "plinio-salgado-psicologiadarevolucao",
    "titulo": "Psicologia da Revolução",
    "autor": "Plínio Salgado",
    "autorId": "plinio-salgado",
    "ano": 1933,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Psicologia da Revolução é uma obra de Plínio Salgado que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Psicologia da Revolução para conhecer os argumentos e o contexto de Plínio Salgado e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "integralismo"
    ],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Psicologia%20da%20Revolu%C3%A7%C3%A3o%20Pl%C3%ADnio%20Salgado",
    "vetor": [30, 18, 85, 15, 55, 20, 58, 65, 75, 5, 10, 45],
    "imagePath": "/personalities/portraits/plinio-salgado.jpg",
    "imageAlt": "Retrato de Plínio Salgado"
  },
  {
    "id": "lee-kuan-yew-doterceiromundoaoprimeiro",
    "titulo": "Do Terceiro Mundo ao Primeiro",
    "autor": "Lee Kuan Yew",
    "autorId": "lee-kuan-yew",
    "ano": 2000,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Do Terceiro Mundo ao Primeiro é uma obra de Lee Kuan Yew que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Do Terceiro Mundo ao Primeiro para conhecer os argumentos e o contexto de Lee Kuan Yew e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Do%20Terceiro%20Mundo%20ao%20Primeiro%20Lee%20Kuan%20Yew",
    "vetor": [12.5, 20, 90, 35, 35, 38.8, 32.5, 52.5, 16.2, 61.3, 26.2, 63.7],
    "imagePath": "/personalities/portraits/lee-kuan-yew.jpg",
    "imageAlt": "Retrato de Lee Kuan Yew"
  },
  {
    "id": "nick-land-oiluminismosombrio",
    "titulo": "O Iluminismo Sombrio",
    "autor": "Nick Land",
    "autorId": "nick-land",
    "ano": 2012,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Iluminismo Sombrio é uma obra de Nick Land que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Iluminismo Sombrio para conhecer os argumentos e o contexto de Nick Land e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Iluminismo%20Sombrio%20Nick%20Land",
    "vetor": [80.4, 16.2, 47.1, 38.6, 21.7, 47.9, 5.3, 13.5, 5.3, 79, 55, 96],
    "imagePath": "/personalities/portraits/nick-land.jpg",
    "imageAlt": "Retrato de Nick Land"
  },
  {
    "id": "irving-kristol-neoconservadorismoautobiografiadeumaideia",
    "titulo": "Neoconservadorismo: Autobiografia de uma Ideia",
    "autor": "Irving Kristol",
    "autorId": "irving-kristol",
    "ano": 1995,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Neoconservadorismo: Autobiografia de uma Ideia é uma obra de Irving Kristol que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Neoconservadorismo: Autobiografia de uma Ideia para conhecer os argumentos e o contexto de Irving Kristol e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Neoconservadorismo%3A%20Autobiografia%20de%20uma%20Ideia%20Irving%20Kristol",
    "vetor": [51.2, 57.5, 67.5, 28.7, 15, 16.3, 28.7, 25, 30, 26.3, 15, 57.5],
    "imagePath": "/personalities/portraits/irving-kristol.jpg",
    "imageAlt": "Retrato de Irving Kristol"
  },
  {
    "id": "benjamin-disraeli-sybilouasduasnacoes",
    "titulo": "Sybil, ou as Duas Nações",
    "autor": "Benjamin Disraeli",
    "autorId": "benjamin-disraeli",
    "ano": 1845,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Sybil, ou as Duas Nações é uma obra de Benjamin Disraeli que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sybil, ou as Duas Nações para conhecer os argumentos e o contexto de Benjamin Disraeli e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Sybil%2C%20ou%20as%20Duas%20Na%C3%A7%C3%B5es%20Benjamin%20Disraeli",
    "vetor": [30, 61.3, 62.5, 41.2, 56.2, 51.2, 57.5, 65, 58.8, 25, 20, 48.8],
    "imagePath": "/personalities/portraits/benjamin-disraeli.jpg",
    "imageAlt": "Retrato de Benjamin Disraeli"
  },
  {
    "id": "khomeini-ogovernoislamico",
    "titulo": "O Governo Islâmico",
    "autor": "Ruhollah Khomeini",
    "autorId": "khomeini",
    "ano": 1970,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "O Governo Islâmico é uma obra de Ruhollah Khomeini que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Governo Islâmico para conhecer os argumentos e o contexto de Ruhollah Khomeini e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=O%20Governo%20Isl%C3%A2mico%20Ruhollah%20Khomeini",
    "vetor": [18.5, 47.1, 85.2, 42.6, 19.8, 30.5, 76.2, 78.1, 82.4, 2.4, 14.1, 40.5],
    "imagePath": "/personalities/portraits/khomeini.jpg",
    "imageAlt": "Retrato de Ruhollah Khomeini"
  },
  {
    "id": "jabotinsky-amuralhadeferro",
    "titulo": "A Muralha de Ferro",
    "autor": "Zeev Jabotinsky",
    "autorId": "jabotinsky",
    "ano": 1923,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Muralha de Ferro é uma obra de Zeev Jabotinsky que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Muralha de Ferro para conhecer os argumentos e o contexto de Zeev Jabotinsky e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Muralha%20de%20Ferro%20Zeev%20Jabotinsky",
    "vetor": [35, 73.8, 51.2, 20, 18.7, 16.3, 65, 65, 73.8, 75, 63.7, 62.5],
    "imagePath": "/personalities/portraits/jabotinsky.jpg",
    "imageAlt": "Retrato de Zeev Jabotinsky"
  },
  {
    "id": "curtis-yarvin-umaintroducaogentilaunqualifiedreservations",
    "titulo": "Uma Introdução Gentil a Unqualified Reservations",
    "autor": "Curtis Yarvin",
    "autorId": "curtis-yarvin",
    "ano": 2009,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Uma Introdução Gentil a Unqualified Reservations é uma obra de Curtis Yarvin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Uma Introdução Gentil a Unqualified Reservations para conhecer os argumentos e o contexto de Curtis Yarvin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Uma%20Introdu%C3%A7%C3%A3o%20Gentil%20a%20Unqualified%20Reservations%20Curtis%20Yarvin",
    "vetor": [74.4, 19.8, 38.8, 32.6, 39.5, 59.8, 22, 25.4, 30.3, 74.1, 48.8, 86.8],
    "imagePath": "/personalities/portraits/curtis-yarvin.jpg",
    "imageAlt": "Retrato de Curtis Yarvin"
  },
  {
    "id": "frederico-ii-da-prussia-oantimaquiavel",
    "titulo": "O Anti-Maquiavel",
    "autor": "Frederico, o Grande",
    "autorId": "frederico-ii-da-prussia",
    "ano": 1740,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "O Anti-Maquiavel é uma obra de Frederico, o Grande que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Anti-Maquiavel para conhecer os argumentos e o contexto de Frederico, o Grande e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Anti-Maquiavel%20Frederico%2C%20o%20Grande",
    "vetor": [7.5, 10, 66.3, 33.7, 13.7, 21.3, 52.5, 75, 77.5, 63.7, 41.3, 58.8],
    "imagePath": "/personalities/portraits/frederico-ii-da-prussia.jpg",
    "imageAlt": "Retrato de Frederico, o Grande"
  },
  {
    "id": "joseph-de-maistre-consideracoessobreafranca",
    "titulo": "Considerações sobre a França",
    "autor": "Joseph de Maistre",
    "autorId": "joseph-de-maistre",
    "ano": 1797,
    "area": "ativismo",
    "dificuldade": "avancado",
    "resumo": "Considerações sobre a França é uma obra de Joseph de Maistre que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Considerações sobre a França para conhecer os argumentos e o contexto de Joseph de Maistre e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Considera%C3%A7%C3%B5es%20sobre%20a%20Fran%C3%A7a%20Joseph%20de%20Maistre",
    "vetor": [50, 7.5, 82.5, 36.3, 26.2, 30, 40, 60, 52.5, 0, 6.2, 36.2],
    "imagePath": "/personalities/portraits/joseph-de-maistre.jpg",
    "imageAlt": "Retrato de Joseph de Maistre"
  },
  {
    "id": "aleksandr-dugin-aquartateoriapolitica",
    "titulo": "A Quarta Teoria Política",
    "autor": "Aleksandr Dugin",
    "autorId": "aleksandr-dugin",
    "ano": 2009,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Quarta Teoria Política é uma obra de Aleksandr Dugin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Quarta Teoria Política para conhecer os argumentos e o contexto de Aleksandr Dugin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Quarta%20Teoria%20Pol%C3%ADtica%20Aleksandr%20Dugin",
    "vetor": [15, 20, 78.8, 11.2, 10, 17.5, 66.2, 71.2, 85, 6.2, 12.5, 33.8],
    "imagePath": "/personalities/portraits/aleksandr-dugin.jpg",
    "imageAlt": "Retrato de Aleksandr Dugin"
  },
  {
    "id": "leon-kass-rumoaumacienciamaisnatural",
    "titulo": "Rumo a uma Ciência Mais Natural",
    "autor": "Leon Kass",
    "autorId": "leon-kass",
    "ano": 1985,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Rumo a uma Ciência Mais Natural é uma obra de Leon Kass que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Rumo a uma Ciência Mais Natural para conhecer os argumentos e o contexto de Leon Kass e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Rumo%20a%20uma%20Ci%C3%AAncia%20Mais%20Natural%20Leon%20Kass",
    "vetor": [67.5, 66.3, 57.5, 38.7, 46.2, 36.3, 40, 41.3, 41.3, 25, 18.8, 25],
    "imagePath": "/personalities/portraits/leon-kass.jpg",
    "imageAlt": "Retrato de Leon Kass"
  },
  {
    "id": "william-f-buckley-deuseohomememyale",
    "titulo": "Deus e o Homem em Yale",
    "autor": "William F. Buckley Jr.",
    "autorId": "william-f-buckley",
    "ano": 1951,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Deus e o Homem em Yale é uma obra de William F. Buckley Jr. que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Deus e o Homem em Yale para conhecer os argumentos e o contexto de William F. Buckley Jr. e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Deus%20e%20o%20Homem%20em%20Yale%20William%20F.%20Buckley%20Jr.",
    "vetor": [72.5, 57.5, 45, 31.2, 23.8, 21.2, 20, 22.5, 25, 17.5, 13.8, 65],
    "imagePath": "/personalities/portraits/william-f-buckley.jpg",
    "imageAlt": "Retrato de William F. Buckley Jr."
  },
  {
    "id": "cicero-darepublica",
    "titulo": "Da República",
    "autor": "Cícero",
    "autorId": "cicero",
    "ano": -51,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Da República é uma obra de Cícero que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Da República para conhecer os argumentos e o contexto de Cícero e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Da%20Rep%C3%BAblica%20C%C3%ADcero",
    "vetor": [33.8, 58.8, 58.8, 30, 41.2, 30, 28.7, 30, 55, 36.2, 21.2, 35],
    "imagePath": "/personalities/portraits/cicero.jpg",
    "imageAlt": "Retrato de Cícero"
  },
  {
    "id": "o-espirito-das-leis",
    "titulo": "O Espírito das Leis",
    "autor": "Montesquieu",
    "autorId": "montesquieu",
    "ano": 1748,
    "vetor": [55, 90, 45, 60, 15, 75, 45, 35, 30, 55, 40, 50],
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Montesquieu compara repúblicas, monarquias e despotismos e mostra como leis, clima, comércio e costumes se combinam em cada regime, defendendo a separação dos poderes contra a concentração arbitrária.",
    "porque": "A obra inaugura a sociologia comparada do poder e inspira o desenho constitucional moderno. Vale lê-la como investigação sobre contextos, não como manual de receitas, notando o peso que Montesquieu dá às tradições locais.",
    "ideologias": [
      "republicanismo",
      "liberalismo-classico"
    ],
    "temas": [
      "separação dos poderes",
      "regimes políticos",
      "costumes",
      "comércio"
    ],
    "link": "https://openlibrary.org/search?q=O+Esp%C3%ADrito+das+Leis+Montesquieu",
    "imagePath": "/personalities/portraits/montesquieu.jpg",
    "imageAlt": "Retrato de Montesquieu"
  },
  {
    "id": "milton-friedman-capitalismoeliberdade",
    "titulo": "Capitalismo e Liberdade",
    "autor": "milton-friedman",
    "autorId": "milton-friedman",
    "ano": 1962,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Capitalismo e Liberdade é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Capitalismo e Liberdade para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Capitalismo%20e%20Liberdade%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de milton-friedman"
  },
  {
    "id": "ludwig-erhard-bemestarparatodos",
    "titulo": "Bem-Estar para Todos",
    "autor": "Ludwig Erhard",
    "autorId": "ludwig-erhard",
    "ano": 1957,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Bem-Estar para Todos é uma obra de Ludwig Erhard que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Bem-Estar para Todos para conhecer os argumentos e o contexto de Ludwig Erhard e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Bem-Estar%20para%20Todos%20Ludwig%20Erhard",
    "vetor": [42.5, 80, 38.8, 38.7, 66.2, 52.5, 32.5, 27.5, 18, 41.3, 40, 65],
    "imagePath": "/personalities/portraits/ludwig-erhard.jpg",
    "imageAlt": "Retrato de Ludwig Erhard"
  },
  {
    "id": "gk-chesterton-ortodoxia",
    "titulo": "Ortodoxia",
    "autor": "G. K. Chesterton",
    "autorId": "gk-chesterton",
    "ano": 1908,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Ortodoxia é uma obra de G. K. Chesterton que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ortodoxia para conhecer os argumentos e o contexto de G. K. Chesterton e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Ortodoxia%20G.%20K.%20Chesterton",
    "vetor": [73.8, 80, 36.3, 30, 65, 68.8, 61.3, 48.8, 76.3, 8.8, 18.8, 26.3],
    "imagePath": "/personalities/portraits/gk-chesterton.jpg",
    "imageAlt": "Retrato de G. K. Chesterton"
  },
  {
    "id": "henri-de-saint-simon-onovocristianismo",
    "titulo": "O Novo Cristianismo",
    "autor": "Henri de Saint-Simon",
    "autorId": "henri-de-saint-simon",
    "ano": 1825,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Novo Cristianismo é uma obra de Henri de Saint-Simon que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Novo Cristianismo para conhecer os argumentos e o contexto de Henri de Saint-Simon e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Novo%20Cristianismo%20Henri%20de%20Saint-Simon",
    "vetor": [22.5, 35, 70, 71.3, 76.2, 72.5, 71.2, 73.8, 35, 71.2, 68.8, 73.8],
    "imagePath": "/personalities/portraits/henri-de-saint-simon.jpg",
    "imageAlt": "Retrato de Henri de Saint-Simon"
  },
  {
    "id": "michael-sandel-justicaoqueefazeracoisacerta",
    "titulo": "Justiça: O que É Fazer a Coisa Certa",
    "autor": "Michael Sandel",
    "autorId": "michael-sandel",
    "ano": 2009,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Justiça: O que É Fazer a Coisa Certa é uma obra de Michael Sandel que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Justiça: O que É Fazer a Coisa Certa para conhecer os argumentos e o contexto de Michael Sandel e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Justi%C3%A7a%3A%20O%20que%20%C3%89%20Fazer%20a%20Coisa%20Certa%20Michael%20Sandel",
    "vetor": [66.3, 82.5, 43.8, 60, 67.5, 66.3, 70, 70, 66.3, 40, 57.5, 32.5],
    "imagePath": "/personalities/portraits/michael-sandel.jpg",
    "imageAlt": "Retrato de Michael Sandel"
  },
  {
    "id": "adrian-wooldridge-aaristocraciadotalento",
    "titulo": "A Aristocracia do Talento",
    "autor": "Adrian Wooldridge",
    "autorId": "adrian-wooldridge",
    "ano": 2021,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Aristocracia do Talento é uma obra de Adrian Wooldridge que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Aristocracia do Talento para conhecer os argumentos e o contexto de Adrian Wooldridge e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Aristocracia%20do%20Talento%20Adrian%20Wooldridge",
    "vetor": [38.8, 66.3, 32.5, 63.7, 61.2, 50, 33.8, 30, 25, 67.5, 57.5, 70],
    "imagePath": "/personalities/portraits/adrian-wooldridge.jpg",
    "imageAlt": "Retrato de Adrian Wooldridge"
  },
  {
    "id": "john-stuart-mill-sobrealiberdade",
    "titulo": "Sobre a Liberdade",
    "autor": "john-stuart-mill",
    "autorId": "john-stuart-mill",
    "ano": 1859,
    "area": "teoria-politica",
    "dificuldade": "intermediario",
    "resumo": "Sobre a Liberdade é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sobre a Liberdade para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "teoria-politica"
    ],
    "link": "https://openlibrary.org/search?q=Sobre%20a%20Liberdade%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de john-stuart-mill"
  },
  {
    "id": "john-locke-segundotratadosobreogoverno",
    "titulo": "Segundo Tratado sobre o Governo",
    "autor": "john-locke",
    "autorId": "john-locke",
    "ano": 1689,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Segundo Tratado sobre o Governo é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Segundo Tratado sobre o Governo para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Segundo%20Tratado%20sobre%20o%20Governo%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de john-locke"
  },
  {
    "id": "robert-nozick-anarquiaestadoeutopia",
    "titulo": "Anarquia, Estado e Utopia",
    "autor": "robert-nozick",
    "autorId": "robert-nozick",
    "ano": 1974,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Anarquia, Estado e Utopia é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Anarquia, Estado e Utopia para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Anarquia%2C%20Estado%20e%20Utopia%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de robert-nozick"
  },
  {
    "id": "al-gore-umaverdadeinconveniente",
    "titulo": "Uma Verdade Inconveniente",
    "autor": "Al Gore",
    "autorId": "al-gore",
    "ano": 2006,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Uma Verdade Inconveniente é uma obra de Al Gore que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Uma Verdade Inconveniente para conhecer os argumentos e o contexto de Al Gore e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Uma%20Verdade%20Inconveniente%20Al%20Gore",
    "vetor": [42.5, 78.8, 38.8, 55, 65, 41.3, 55, 58.8, 35, 57.5, 75, 32.5],
    "imagePath": "/personalities/portraits/al-gore.jpg",
    "imageAlt": "Retrato de Al Gore"
  },
  {
    "id": "beveridge-relatoriobeveridgesegurosocialeservicosafins",
    "titulo": "Relatório Beveridge: Seguro Social e Serviços Afins",
    "autor": "William Beveridge",
    "autorId": "beveridge",
    "ano": 1942,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Relatório Beveridge: Seguro Social e Serviços Afins é uma obra de William Beveridge que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Relatório Beveridge: Seguro Social e Serviços Afins para conhecer os argumentos e o contexto de William Beveridge e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Relat%C3%B3rio%20Beveridge%3A%20Seguro%20Social%20e%20Servi%C3%A7os%20Afins%20William%20Beveridge",
    "vetor": [25, 72.5, 41.3, 53.7, 66.2, 65, 61.3, 71.3, 52.5, 66.3, 47.5, 55],
    "imagePath": "/personalities/portraits/beveridge.jpg",
    "imageAlt": "Retrato de William Beveridge"
  },
  {
    "id": "thomas-paine-sensocomum",
    "titulo": "Senso Comum",
    "autor": "Thomas Paine",
    "autorId": "thomas-paine",
    "ano": 1776,
    "area": "vida-intelectual",
    "dificuldade": "avancado",
    "resumo": "Senso Comum é uma obra de Thomas Paine que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Senso Comum para conhecer os argumentos e o contexto de Thomas Paine e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Senso%20Comum%20Thomas%20Paine",
    "vetor": [61.3, 83.8, 23.8, 78.7, 66.2, 68.8, 65, 55, 27.5, 90, 67.5, 61.3],
    "imagePath": "/personalities/portraits/thomas-paine.jpg",
    "imageAlt": "Retrato de Thomas Paine"
  },
  {
    "id": "edmund-burke-reflexoessobrearevolucaonafranca",
    "titulo": "Reflexões sobre a Revolução na França",
    "autor": "edmund-burke",
    "autorId": "edmund-burke",
    "ano": 1790,
    "area": "ativismo",
    "dificuldade": "avancado",
    "resumo": "Reflexões sobre a Revolução na França é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Reflexões sobre a Revolução na França para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Reflex%C3%B5es%20sobre%20a%20Revolu%C3%A7%C3%A3o%20na%20Fran%C3%A7a%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de edmund-burke"
  },
  {
    "id": "o-caminho-da-servidao",
    "titulo": "O Caminho da Servidão",
    "autor": "Friedrich Hayek",
    "autorId": "hayek",
    "ano": 1944,
    "vetor": [70, 85, 25, 80, 15, 90, 10, 5, 5, 50, 45, 70],
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Hayek argumenta que o planejamento central, mesmo com intenções benignas, concentra poder e leva à perda gradual das liberdades, defendendo mercados e império da lei.",
    "porque": "Obra de intervenção da Guerra Fria, divulgou uma leitura liberal sobre os riscos do dirigismo estatal. Hoje serve para discutir limites do planejamento e também para notar os serviços que Hayek supõe que o Estado deva prestar.",
    "ideologias": [
      "liberalismo-classico",
      "ordoliberalismo"
    ],
    "temas": [
      "planejamento",
      "liberdade",
      "Estado de direito",
      "mercado"
    ],
    "link": "https://openlibrary.org/search?q=O+Caminho+da+Servid%C3%A3o+Hayek",
    "imagePath": "/personalities/portraits/hayek.jpg",
    "imageAlt": "Retrato de Friedrich Hayek"
  },
  {
    "id": "gustave-de-molinari-aproducaodaseguranca",
    "titulo": "A Produção da Segurança",
    "autor": "Gustave de Molinari",
    "autorId": "gustave-de-molinari",
    "ano": 1849,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "A Produção da Segurança é uma obra de Gustave de Molinari que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Produção da Segurança para conhecer os argumentos e o contexto de Gustave de Molinari e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=A%20Produ%C3%A7%C3%A3o%20da%20Seguran%C3%A7a%20Gustave%20de%20Molinari",
    "vetor": [93.8, 73.8, 7.5, 71.3, 85, 80, 7.5, 6.3, 3.8, 68.8, 51.2, 67.5],
    "imagePath": "/personalities/portraits/gustave-de-molinari.jpg",
    "imageAlt": "Retrato de Gustave de Molinari"
  },
  {
    "id": "progresso-e-pobreza",
    "titulo": "Progresso e Pobreza",
    "autor": "Henry George",
    "autorId": "henry-george",
    "ano": 1879,
    "vetor": [65, 88, 40, 80, 12, 82, 62, 52, 20, 55, 65, 65],
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "George sustenta que a pobreza persiste apesar do progresso porque a renda da terra captura o valor criado pela comunidade, e propõe um imposto único sobre o valor fundiário.",
    "porque": "Influenciou reformas tributárias e correntes que separam renda fundiária de trabalho e capital. O argumento é simples e pode ser lido como introdução à economia política, embora subestime outros fatores da desigualdade.",
    "ideologias": [
      "georgismo"
    ],
    "temas": [
      "renda da terra",
      "imposto único",
      "desigualdade",
      "especulação"
    ],
    "link": "https://openlibrary.org/search?q=Progresso+e+Pobreza+Henry+George",
    "imagePath": "/personalities/portraits/henry-george.jpg",
    "imageAlt": "Retrato de Henry George"
  },
  {
    "id": "charles-fourier-ateoriadosquatromovimentos",
    "titulo": "A Teoria dos Quatro Movimentos",
    "autor": "Charles Fourier",
    "autorId": "charles-fourier",
    "ano": 1808,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Teoria dos Quatro Movimentos é uma obra de Charles Fourier que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Teoria dos Quatro Movimentos para conhecer os argumentos e o contexto de Charles Fourier e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Teoria%20dos%20Quatro%20Movimentos%20Charles%20Fourier",
    "vetor": [77.5, 85, 15, 86.2, 92.5, 80, 86.3, 81.3, 47.5, 73.8, 85, 51.2],
    "imagePath": "/personalities/portraits/charles-fourier.jpg",
    "imageAlt": "Retrato de Charles Fourier"
  },
  {
    "id": "nicolas-de-condorcet-esbocodeumquadrohistoricodosprogressosdoespiritohumano",
    "titulo": "Esboço de um Quadro Histórico dos Progressos do Espírito Humano",
    "autor": "Nicolas de Condorcet",
    "autorId": "nicolas-de-condorcet",
    "ano": 1795,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Esboço de um Quadro Histórico dos Progressos do Espírito Humano é uma obra de Nicolas de Condorcet que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Esboço de um Quadro Histórico dos Progressos do Espírito Humano para conhecer os argumentos e o contexto de Nicolas de Condorcet e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Esbo%C3%A7o%20de%20um%20Quadro%20Hist%C3%B3rico%20dos%20Progressos%20do%20Esp%C3%ADrito%20Humano%20Nicolas%20de%20Condorcet",
    "vetor": [28.7, 83.8, 28.7, 72.5, 72.5, 67.5, 53.8, 42.5, 27.5, 87.5, 71.3, 76.3],
    "imagePath": "/personalities/portraits/nicolas-de-condorcet.png",
    "imageAlt": "Retrato de Nicolas de Condorcet"
  },
  {
    "id": "john-rawls-umateoriadajustica",
    "titulo": "Uma Teoria da Justiça",
    "autor": "john-rawls",
    "autorId": "john-rawls",
    "ano": 1971,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Uma Teoria da Justiça é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Uma Teoria da Justiça para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Uma%20Teoria%20da%20Justi%C3%A7a%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de john-rawls"
  },
  {
    "id": "aldo-leopold-umalmanaquedesandcounty",
    "titulo": "Um Almanaque de Sand County",
    "autor": "Aldo Leopold",
    "autorId": "aldo-leopold",
    "ano": 1949,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Um Almanaque de Sand County é uma obra de Aldo Leopold que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Um Almanaque de Sand County para conhecer os argumentos e o contexto de Aldo Leopold e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Um%20Almanaque%20de%20Sand%20County%20Aldo%20Leopold",
    "vetor": [62.5, 78.8, 33.8, 63.7, 66.2, 68.8, 62.5, 52.5, 48.8, 66.3, 51.2, 22.5],
    "imagePath": "/personalities/portraits/aldo-leopold.jpg",
    "imageAlt": "Retrato de Aldo Leopold"
  },
  {
    "id": "theodore-roosevelt-onovonacionalismo",
    "titulo": "O Novo Nacionalismo",
    "autor": "Theodore Roosevelt",
    "autorId": "theodore-roosevelt",
    "ano": 1910,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Novo Nacionalismo é uma obra de Theodore Roosevelt que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Novo Nacionalismo para conhecer os argumentos e o contexto de Theodore Roosevelt e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Novo%20Nacionalismo%20Theodore%20Roosevelt",
    "vetor": [21.3, 55, 73.8, 30, 22, 10, 61.3, 70, 66.3, 33.8, 40, 52.5],
    "imagePath": "/personalities/portraits/theodore-roosevelt.jpg",
    "imageAlt": "Retrato de Theodore Roosevelt"
  },
  {
    "id": "srnicek-inventarofuturo",
    "titulo": "Inventar o Futuro",
    "autor": "Nick Srnicek",
    "autorId": "srnicek",
    "ano": 2015,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Inventar o Futuro é uma obra de Nick Srnicek que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Inventar o Futuro para conhecer os argumentos e o contexto de Nick Srnicek e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Inventar%20o%20Futuro%20Nick%20Srnicek",
    "vetor": [56.9, 88.2, 23.4, 77.6, 81.9, 74.4, 87.7, 84.1, 51.4, 84.5, 84.8, 74.9],
    "imagePath": "/personalities/portraits/srnicek.jpg",
    "imageAlt": "Retrato de Nick Srnicek"
  },
  {
    "id": "ray-kurzweil-asingularidadeestaproxima",
    "titulo": "A Singularidade Está Próxima",
    "autor": "Ray Kurzweil",
    "autorId": "ray-kurzweil",
    "ano": 2005,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "A Singularidade Está Próxima é uma obra de Ray Kurzweil que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Singularidade Está Próxima para conhecer os argumentos e o contexto de Ray Kurzweil e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=A%20Singularidade%20Est%C3%A1%20Pr%C3%B3xima%20Ray%20Kurzweil",
    "vetor": [47.5, 70, 25, 73.7, 75, 65, 37.5, 32.5, 23.8, 76.3, 67.5, 86.3],
    "imagePath": "/personalities/portraits/ray-kurzweil.jpg",
    "imageAlt": "Retrato de Ray Kurzweil"
  },
  {
    "id": "ernest-renan-oqueeumanacao",
    "titulo": "O que É uma Nação?",
    "autor": "Ernest Renan",
    "autorId": "ernest-renan",
    "ano": 1882,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "O que É uma Nação? é uma obra de Ernest Renan que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O que É uma Nação? para conhecer os argumentos e o contexto de Ernest Renan e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=O%20que%20%C3%89%20uma%20Na%C3%A7%C3%A3o%3F%20Ernest%20Renan",
    "vetor": [33.8, 68.8, 35, 57.5, 81.2, 65, 51.2, 58.8, 40, 88.8, 38.8, 60],
    "imagePath": "/personalities/portraits/ernest-renan.jpg",
    "imageAlt": "Retrato de Ernest Renan"
  },
  {
    "id": "bakunin-estatismoeanarquia",
    "titulo": "Estatismo e Anarquia",
    "autor": "Mikhail Bakunin",
    "autorId": "bakunin",
    "ano": 1873,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Estatismo e Anarquia é uma obra de Mikhail Bakunin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Estatismo e Anarquia para conhecer os argumentos e o contexto de Mikhail Bakunin e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "anarcocomunismo"
    ],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Estatismo%20e%20Anarquia%20Mikhail%20Bakunin",
    "vetor": [90, 60, 15, 85, 5, 85, 85, 60, 60, 85, 80, 45],
    "imagePath": "/personalities/portraits/bakunin.jpg",
    "imageAlt": "Retrato de Mikhail Bakunin"
  },
  {
    "id": "a-conquista-do-pao",
    "titulo": "A Conquista do Pão",
    "autor": "Piotr Kropotkin",
    "autorId": "kropotkin",
    "ano": 1892,
    "vetor": [85, 70, 20, 85, 5, 85, 90, 55, 70, 90, 85, 40],
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Kropotkin descreve como a cooperação e o apoio mútuo sustentam a vida social e propõe abolir o salário, o Estado e a propriedade, distribuindo alimentos e moradia segundo a necessidade.",
    "porque": "É uma das exposições mais acessíveis do comunismo anarquista e discute trabalho, consumo e organização federativa. Serve para examinar a viabilidade prática de uma sociedade sem Estado e as objeções sobre coordenação e incentivos.",
    "ideologias": [
      "anarcocomunismo"
    ],
    "temas": [
      "apoio mútuo",
      "comunismo libertário",
      "trabalho",
      "necessidade"
    ],
    "link": "https://openlibrary.org/search?q=A+Conquista+do+P%C3%A3o+Kropotkin",
    "imagePath": "/personalities/portraits/kropotkin.jpg",
    "imageAlt": "Retrato de Piotr Kropotkin"
  },
  {
    "id": "sorel-reflexoessobreaviolencia",
    "titulo": "Reflexões sobre a Violência",
    "autor": "Georges Sorel",
    "autorId": "sorel",
    "ano": 1908,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Reflexões sobre a Violência é uma obra de Georges Sorel que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Reflexões sobre a Violência para conhecer os argumentos e o contexto de Georges Sorel e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Reflex%C3%B5es%20sobre%20a%20Viol%C3%AAncia%20Georges%20Sorel",
    "vetor": [71.3, 46.3, 38.8, 37.5, 33.7, 46.3, 75, 63.7, 68.8, 46.3, 35, 53.8],
    "imagePath": "/personalities/portraits/sorel.jpg",
    "imageAlt": "Retrato de Georges Sorel"
  },
  {
    "id": "chomsky-amanipulacaodopublico",
    "titulo": "A Manipulação do Público",
    "autor": "Noam Chomsky",
    "autorId": "chomsky",
    "ano": 1988,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "A Manipulação do Público é uma obra de Noam Chomsky que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Manipulação do Público para conhecer os argumentos e o contexto de Noam Chomsky e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=A%20Manipula%C3%A7%C3%A3o%20do%20P%C3%BAblico%20Noam%20Chomsky",
    "vetor": [80, 86.3, 13.8, 88.7, 95, 86.3, 92.5, 76.3, 71.3, 82.5, 77.5, 38.8],
    "imagePath": "/personalities/portraits/chomsky.jpg",
    "imageAlt": "Retrato de Noam Chomsky"
  },
  {
    "id": "gramsci-cadernosdocarcere",
    "titulo": "Cadernos do Cárcere",
    "autor": "Antonio Gramsci",
    "autorId": "gramsci",
    "ano": 1948,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Cadernos do Cárcere é uma obra de Antonio Gramsci que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Cadernos do Cárcere para conhecer os argumentos e o contexto de Antonio Gramsci e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "socialismo-democratico"
    ],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Cadernos%20do%20C%C3%A1rcere%20Antonio%20Gramsci",
    "vetor": [55, 80, 40, 70, 10, 75, 85, 75, 65, 85, 80, 60],
    "imagePath": "/personalities/portraits/gramsci.png",
    "imageAlt": "Retrato de Antonio Gramsci"
  },
  {
    "id": "oskar-lange-sobreateoriaeconomicadosocialismo",
    "titulo": "Sobre a Teoria Econômica do Socialismo",
    "autor": "Oskar Lange",
    "autorId": "oskar-lange",
    "ano": 1936,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Sobre a Teoria Econômica do Socialismo é uma obra de Oskar Lange que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sobre a Teoria Econômica do Socialismo para conhecer os argumentos e o contexto de Oskar Lange e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Sobre%20a%20Teoria%20Econ%C3%B4mica%20do%20Socialismo%20Oskar%20Lange",
    "vetor": [25, 35, 66.3, 72.5, 57.5, 67.5, 80, 78.8, 68.8, 78.8, 65, 60],
    "imagePath": "/personalities/portraits/oskar-lange.jpg",
    "imageAlt": "Retrato de Oskar Lange"
  },
  {
    "id": "o-que-e-a-propriedade",
    "titulo": "O que É a Propriedade?",
    "autor": "Pierre-Joseph Proudhon",
    "autorId": "proudhon",
    "ano": 1840,
    "vetor": [85, 70, 25, 80, 10, 85, 78, 45, 25, 70, 75, 50],
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Proudhon responde que a propriedade é um roubo quando gera renda sem trabalho, e propõe substituir o direito absoluto de propriedade por posse fundada no uso e na reciprocidade.",
    "porque": "Abre a tradição anarquista e antecipa críticas à renda e à especulação fundiária. O texto é polêmico e assimétrico, útil para entender o mutualismo e para contrastar seus argumentos com defesas liberais e socialistas da propriedade.",
    "ideologias": [
      "mutualismo"
    ],
    "temas": [
      "propriedade",
      "posse",
      "renda",
      "mutualismo"
    ],
    "link": "https://openlibrary.org/search?q=O+que+%C3%A9+a+propriedade+Proudhon",
    "imagePath": "/personalities/portraits/proudhon.jpg",
    "imageAlt": "Retrato de Pierre-Joseph Proudhon"
  },
  {
    "id": "ocalan-confederalismodemocratico",
    "titulo": "Confederalismo Democrático",
    "autor": "Abdullah Öcalan",
    "autorId": "ocalan",
    "ano": 2011,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Confederalismo Democrático é uma obra de Abdullah Öcalan que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Confederalismo Democrático para conhecer os argumentos e o contexto de Abdullah Öcalan e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Confederalismo%20Democr%C3%A1tico%20Abdullah%20%C3%96calan",
    "vetor": [90, 83.8, 20, 86.2, 73.7, 78.8, 80, 73.8, 77.5, 65, 80, 23.8],
    "imagePath": "/personalities/portraits/ocalan.jpg",
    "imageAlt": "Retrato de Abdullah Öcalan"
  },
  {
    "id": "benjamin-tucker-emvezdeumlivro",
    "titulo": "Em Vez de um Livro",
    "autor": "Benjamin Tucker",
    "autorId": "benjamin-tucker",
    "ano": 1893,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Em Vez de um Livro é uma obra de Benjamin Tucker que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Em Vez de um Livro para conhecer os argumentos e o contexto de Benjamin Tucker e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Em%20Vez%20de%20um%20Livro%20Benjamin%20Tucker",
    "vetor": [92.5, 80, 1.3, 81.2, 92.5, 86.3, 31.3, 8.8, 11.3, 91.3, 82.5, 65],
    "imagePath": "/personalities/portraits/benjamin-tucker.jpg",
    "imageAlt": "Retrato de Benjamin Tucker"
  },
  {
    "id": "bookchin-aecologiadaliberdade",
    "titulo": "A Ecologia da Liberdade",
    "autor": "Murray Bookchin",
    "autorId": "bookchin",
    "ano": 1982,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "A Ecologia da Liberdade é uma obra de Murray Bookchin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Ecologia da Liberdade para conhecer os argumentos e o contexto de Murray Bookchin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=A%20Ecologia%20da%20Liberdade%20Murray%20Bookchin",
    "vetor": [87.5, 82.5, 16.3, 85, 83.7, 82.5, 88.8, 77.5, 78.8, 82.5, 81.3, 55],
    "imagePath": "/personalities/portraits/bookchin.jpg",
    "imageAlt": "Retrato de Murray Bookchin"
  },
  {
    "id": "maritain-ohomemeoestado",
    "titulo": "O Homem e o Estado",
    "autor": "Jacques Maritain",
    "autorId": "maritain",
    "ano": 1951,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Homem e o Estado é uma obra de Jacques Maritain que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Homem e o Estado para conhecer os argumentos e o contexto de Jacques Maritain e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Homem%20e%20o%20Estado%20Jacques%20Maritain",
    "vetor": [61.3, 77.5, 38.8, 66.2, 75, 62.5, 63.7, 60, 46.3, 22.5, 25, 38.8],
    "imagePath": "/personalities/portraits/maritain.jpg",
    "imageAlt": "Retrato de Jacques Maritain"
  },
  {
    "id": "buber-osocialismoutopico",
    "titulo": "O Socialismo Utópico",
    "autor": "Martin Buber",
    "autorId": "buber",
    "ano": 1946,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Socialismo Utópico é uma obra de Martin Buber que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Socialismo Utópico para conhecer os argumentos e o contexto de Martin Buber e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Socialismo%20Ut%C3%B3pico%20Martin%20Buber",
    "vetor": [86.3, 85, 26.3, 71.3, 93.7, 75, 72.5, 61.3, 53.8, 31.3, 53.8, 32.5],
    "imagePath": "/personalities/portraits/buber.jpg",
    "imageAlt": "Retrato de Martin Buber"
  },
  {
    "id": "karl-marx-ocapital",
    "titulo": "O Capital",
    "autor": "Karl Marx",
    "autorId": "karl-marx",
    "ano": 1867,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "O Capital é uma obra de Karl Marx que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Capital para conhecer os argumentos e o contexto de Karl Marx e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "marxismo"
    ],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=O%20Capital%20Karl%20Marx",
    "vetor": [25, 30, 65, 50, 25, 45, 95, 95, 80, 90, 65, 80],
    "imagePath": "/personalities/portraits/karl-marx.jpg",
    "imageAlt": "Retrato de Karl Marx"
  },
  {
    "id": "rosselli-socialismoliberal",
    "titulo": "Socialismo Liberal",
    "autor": "Carlo Rosselli",
    "autorId": "rosselli",
    "ano": 1930,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Socialismo Liberal é uma obra de Carlo Rosselli que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Socialismo Liberal para conhecer os argumentos e o contexto de Carlo Rosselli e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Socialismo%20Liberal%20Carlo%20Rosselli",
    "vetor": [65, 87.5, 25, 71.3, 68.7, 57.5, 77.5, 71.3, 36.3, 77.5, 62.5, 53.8],
    "imagePath": "/personalities/portraits/rosselli.jpg",
    "imageAlt": "Retrato de Carlo Rosselli"
  },
  {
    "id": "1984",
    "titulo": "1984",
    "autor": "George Orwell",
    "autorId": "orwell",
    "ano": 1949,
    "vetor": [55, 90, 25, 80, 5, 85, 75, 55, 50, 85, 85, 55],
    "area": "vida-intelectual",
    "dificuldade": "introdutorio",
    "resumo": "Orwell narra a vida de Winston Smith num regime que controla linguagem, memória e desejo, mostrando como o poder total busca não apenas a obediência, mas moldar o que se pode pensar.",
    "porque": "Romance político que deu vocabulário duradouro à crítica do autoritarismo, da vigilância e da manipulação da verdade. Leia como literatura e alerta, lembrando que a ficção simplifica a política para torná-la visível.",
    "ideologias": [
      "socialismo-democratico"
    ],
    "temas": [
      "totalitarismo",
      "vigilância",
      "linguagem",
      "propaganda"
    ],
    "link": "https://openlibrary.org/search?q=1984+George+Orwell",
    "imagePath": "/personalities/portraits/orwell.jpg",
    "imageAlt": "Retrato de George Orwell"
  },
  {
    "id": "andre-gorz-adeusaoproletariado",
    "titulo": "Adeus ao Proletariado",
    "autor": "André Gorz",
    "autorId": "andre-gorz",
    "ano": 1980,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Adeus ao Proletariado é uma obra de André Gorz que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Adeus ao Proletariado para conhecer os argumentos e o contexto de André Gorz e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Adeus%20ao%20Proletariado%20Andr%C3%A9%20Gorz",
    "vetor": [72.5, 88.8, 20, 86.2, 88.7, 82.5, 85, 77.5, 66.3, 81.3, 81.3, 22.5],
    "imagePath": "/personalities/portraits/andre-gorz.jpg",
    "imageAlt": "Retrato de André Gorz"
  },
  {
    "id": "arne-naess-ecologiacomunidadeeestilodevida",
    "titulo": "Ecologia, Comunidade e Estilo de Vida",
    "autor": "Arne Næss",
    "autorId": "arne-naess",
    "ano": 1976,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Ecologia, Comunidade e Estilo de Vida é uma obra de Arne Næss que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ecologia, Comunidade e Estilo de Vida para conhecer os argumentos e o contexto de Arne Næss e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Ecologia%2C%20Comunidade%20e%20Estilo%20de%20Vida%20Arne%20N%C3%A6ss",
    "vetor": [82.5, 83.8, 22.5, 81.2, 97.5, 87.5, 81.3, 70, 63.7, 86.3, 80, 8.8],
    "imagePath": "/personalities/portraits/arne-naess.jpg",
    "imageAlt": "Retrato de Arne Næss"
  },
  {
    "id": "daniel-guerin-oanarquismodadoutrinaaacao",
    "titulo": "O Anarquismo: Da Doutrina à Ação",
    "autor": "Daniel Guérin",
    "autorId": "daniel-guerin",
    "ano": 1965,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Anarquismo: Da Doutrina à Ação é uma obra de Daniel Guérin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Anarquismo: Da Doutrina à Ação para conhecer os argumentos e o contexto de Daniel Guérin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Anarquismo%3A%20Da%20Doutrina%20%C3%A0%20A%C3%A7%C3%A3o%20Daniel%20Gu%C3%A9rin",
    "vetor": [87.5, 87.5, 5, 93.7, 90, 88.8, 90, 76.3, 63.7, 93.8, 90, 52.5],
    "imagePath": "/personalities/portraits/daniel-guerin.png",
    "imageAlt": "Retrato de Daniel Guérin"
  },
  {
    "id": "tolstoy-oreinodedeusestaemvos",
    "titulo": "O Reino de Deus Está em Vós",
    "autor": "Liev Tolstói",
    "autorId": "tolstoy",
    "ano": 1894,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "O Reino de Deus Está em Vós é uma obra de Liev Tolstói que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Reino de Deus Está em Vós para conhecer os argumentos e o contexto de Liev Tolstói e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=O%20Reino%20de%20Deus%20Est%C3%A1%20em%20V%C3%B3s%20Liev%20Tolst%C3%B3i",
    "vetor": [86.3, 78.8, 11.3, 80, 97.5, 88.8, 73.8, 47.5, 63.7, 36.3, 32.5, 11.3],
    "imagePath": "/personalities/portraits/tolstoy.jpg",
    "imageAlt": "Retrato de Liev Tolstói"
  },
  {
    "id": "thoreau-adesobedienciacivil",
    "titulo": "A Desobediência Civil",
    "autor": "Henry David Thoreau",
    "autorId": "thoreau",
    "ano": 1849,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "A Desobediência Civil é uma obra de Henry David Thoreau que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Desobediência Civil para conhecer os argumentos e o contexto de Henry David Thoreau e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=A%20Desobedi%C3%AAncia%20Civil%20Henry%20David%20Thoreau",
    "vetor": [87.5, 81.3, 7.5, 78.7, 91.2, 82.5, 60, 21.3, 60, 76.3, 67.5, 12.5],
    "imagePath": "/personalities/portraits/thoreau.jpg",
    "imageAlt": "Retrato de Henry David Thoreau"
  },
  {
    "id": "john-zerzan-futuroprimitivo",
    "titulo": "Futuro Primitivo",
    "autor": "John Zerzan",
    "autorId": "john-zerzan",
    "ano": 1994,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Futuro Primitivo é uma obra de John Zerzan que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Futuro Primitivo para conhecer os argumentos e o contexto de John Zerzan e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Futuro%20Primitivo%20John%20Zerzan",
    "vetor": [87.5, 83.8, 5, 73.7, 90, 82.5, 76.3, 42.5, 70, 75, 81.3, 2.5],
    "imagePath": "/personalities/portraits/john-zerzan.jpg",
    "imageAlt": "Retrato de John Zerzan"
  },
  {
    "id": "max-stirner-ounicoeasuapropriedade",
    "titulo": "O Único e a Sua Propriedade",
    "autor": "max-stirner",
    "autorId": "max-stirner",
    "ano": 1844,
    "area": "teoria-politica",
    "dificuldade": "intermediario",
    "resumo": "O Único e a Sua Propriedade é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Único e a Sua Propriedade para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "teoria-politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20%C3%9Anico%20e%20a%20Sua%20Propriedade%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de max-stirner"
  },
  {
    "id": "a-etica-da-liberdade",
    "titulo": "A Ética da Liberdade",
    "autor": "Murray Rothbard",
    "autorId": "rothbard",
    "ano": 1982,
    "vetor": [95, 50, 5, 95, 5, 95, 2, 2, 2, 60, 45, 85],
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Rothbard deriva de um princípio de autopropriedade a condenação de toda agressão e a defesa de uma ordem de propriedade privada sem Estado, com trocas e contratos voluntários.",
    "porque": "Sistematiza a ética anarcocapitalista e o argumento de que segurança e justiça podem ser oferecidas no mercado. É leitura de escola, útil para conhecer a posição em seus próprios termos e testar suas premissas sobre direito e coerção.",
    "ideologias": [
      "anarcocapitalismo"
    ],
    "temas": [
      "autopropriedade",
      "agressão",
      "propriedade privada",
      "mercado"
    ],
    "link": "https://openlibrary.org/search?q=A+%C3%89tica+da+Liberdade+Rothbard",
    "imagePath": "/personalities/portraits/rothbard.jpg",
    "imageAlt": "Retrato de Murray Rothbard"
  },
  {
    "id": "bastiat-alei",
    "titulo": "A Lei",
    "autor": "Frédéric Bastiat",
    "autorId": "bastiat",
    "ano": 1850,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "A Lei é uma obra de Frédéric Bastiat que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Lei para conhecer os argumentos e o contexto de Frédéric Bastiat e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=A%20Lei%20Fr%C3%A9d%C3%A9ric%20Bastiat",
    "vetor": [73.8, 75, 25, 71.3, 73.7, 72.5, 12.5, 10, 8.8, 50, 40, 63.7],
    "imagePath": "/personalities/portraits/bastiat.jpg",
    "imageAlt": "Retrato de Frédéric Bastiat"
  },
  {
    "id": "acao-humana",
    "titulo": "Ação Humana",
    "autor": "Ludwig von Mises",
    "autorId": "mises",
    "ano": 1949,
    "vetor": [75, 75, 15, 85, 15, 90, 5, 2, 2, 55, 50, 80],
    "area": "economia",
    "dificuldade": "avancado",
    "resumo": "Mises constrói uma teoria geral da ação individual e do mercado como processo de coordenação, argumentando que preços transmitem informação dispersa e que intervenções estatais geram distorções indesejadas.",
    "porque": "É a obra sistemática da escola austríaca e base de argumentos sobre cálculo econômico e ordem espontânea. Longa e abstrata, exige familiaridade com economia; leia com a orientação de cursos antes de enfrentar a parte técnica.",
    "ideologias": [
      "liberalismo-classico"
    ],
    "temas": [
      "ação humana",
      "ordem espontânea",
      "cálculo econômico",
      "intervencionismo"
    ],
    "link": "https://openlibrary.org/search?q=A%C3%A7%C3%A3o+Humana+Mises",
    "imagePath": "/personalities/portraits/mises.jpg",
    "imageAlt": "Retrato de Ludwig von Mises"
  },
  {
    "id": "ron-paul-ofimdofed",
    "titulo": "O Fim do Fed",
    "autor": "Ron Paul",
    "autorId": "ron-paul",
    "ano": 2009,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Fim do Fed é uma obra de Ron Paul que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Fim do Fed para conhecer os argumentos e o contexto de Ron Paul e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Fim%20do%20Fed%20Ron%20Paul",
    "vetor": [93.8, 82.5, 2.5, 46.2, 78.7, 86.3, 5, 7.5, 15, 23.8, 22.5, 58.8],
    "imagePath": "/personalities/portraits/ron-paul.jpg",
    "imageAlt": "Retrato de Ron Paul"
  },
  {
    "id": "hoppe-democraciaodeusquefalhou",
    "titulo": "Democracia: O Deus que Falhou",
    "autor": "Hans-Hermann Hoppe",
    "autorId": "hoppe",
    "ano": 2001,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Democracia: O Deus que Falhou é uma obra de Hans-Hermann Hoppe que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Democracia: O Deus que Falhou para conhecer os argumentos e o contexto de Hans-Hermann Hoppe e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Democracia%3A%20O%20Deus%20que%20Falhou%20Hans-Hermann%20Hoppe",
    "vetor": [92.5, 42.5, 6.3, 20, 80, 72.5, 2.5, 3.8, 16.3, 55, 27.5, 62.5],
    "imagePath": "/personalities/portraits/hoppe.jpg",
    "imageAlt": "Retrato de Hans-Hermann Hoppe"
  },
  {
    "id": "a-riqueza-das-nacoes",
    "titulo": "A Riqueza das Nações",
    "autor": "Adam Smith",
    "autorId": "adam-smith",
    "ano": 1776,
    "vetor": [75, 80, 30, 70, 15, 85, 20, 10, 5, 55, 50, 65],
    "area": "economia",
    "dificuldade": "avancado",
    "resumo": "Smith investiga a divisão do trabalho, a formação dos preços e os efeitos do comércio, mostrando como o interesse individual, sob concorrência, pode ampliar a produção e a riqueza das nações.",
    "porque": "É o texto inaugural da economia política moderna e ainda organiza debates sobre mercados, impostos e papel do Estado. Leia além da fórmula da mão invisível: Smith dedica boa parte do livro a instituições, salários e limites da intervenção.",
    "ideologias": [
      "liberalismo-classico"
    ],
    "temas": [
      "divisão do trabalho",
      "mercado",
      "comércio",
      "formação dos preços"
    ],
    "link": "https://openlibrary.org/search?q=A+Riqueza+das+Na%C3%A7%C3%B5es+Adam+Smith",
    "imagePath": "/personalities/portraits/adam-smith.jpg",
    "imageAlt": "Retrato de Adam Smith"
  },
  {
    "id": "leonard-peikoff-objetivismoafilosofiadeaynrand",
    "titulo": "Objetivismo: A Filosofia de Ayn Rand",
    "autor": "Leonard Peikoff",
    "autorId": "leonard-peikoff",
    "ano": 1991,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Objetivismo: A Filosofia de Ayn Rand é uma obra de Leonard Peikoff que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Objetivismo: A Filosofia de Ayn Rand para conhecer os argumentos e o contexto de Leonard Peikoff e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Objetivismo%3A%20A%20Filosofia%20de%20Ayn%20Rand%20Leonard%20Peikoff",
    "vetor": [62.5, 78.8, 16.3, 58.7, 32.5, 35, 8.8, 6.3, 12.5, 88.8, 63.7, 87.5],
    "imagePath": "/personalities/portraits/leonard-peikoff.jpg",
    "imageAlt": "Retrato de Leonard Peikoff"
  },
  {
    "id": "scruton-comoserumconservador",
    "titulo": "Como Ser um Conservador",
    "autor": "Roger Scruton",
    "autorId": "scruton",
    "ano": 2014,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Como Ser um Conservador é uma obra de Roger Scruton que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Como Ser um Conservador para conhecer os argumentos e o contexto de Roger Scruton e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Como%20Ser%20um%20Conservador%20Roger%20Scruton",
    "vetor": [55, 62.5, 56.2, 26.2, 42.5, 43.8, 28.7, 31.2, 56.2, 27.5, 25, 27.5],
    "imagePath": "/personalities/portraits/scruton.jpg",
    "imageAlt": "Retrato de Roger Scruton"
  },
  {
    "id": "friedrich-list-sistemanacionaldeeconomiapolitica",
    "titulo": "Sistema Nacional de Economia Política",
    "autor": "Friedrich List",
    "autorId": "friedrich-list",
    "ano": 1841,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Sistema Nacional de Economia Política é uma obra de Friedrich List que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sistema Nacional de Economia Política para conhecer os argumentos e o contexto de Friedrich List e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Sistema%20Nacional%20de%20Economia%20Pol%C3%ADtica%20Friedrich%20List",
    "vetor": [20, 47.5, 65, 27.5, 33.7, 30, 62.5, 72.5, 80, 53.8, 38.8, 70],
    "imagePath": "/personalities/portraits/friedrich-list.jpg",
    "imageAlt": "Retrato de Friedrich List"
  },
  {
    "id": "konkin-novomanifestolibertario",
    "titulo": "Novo Manifesto Libertário",
    "autor": "Samuel Edward Konkin III",
    "autorId": "konkin",
    "ano": 1980,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Novo Manifesto Libertário é uma obra de Samuel Edward Konkin III que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Novo Manifesto Libertário para conhecer os argumentos e o contexto de Samuel Edward Konkin III e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Novo%20Manifesto%20Libert%C3%A1rio%20Samuel%20Edward%20Konkin%20III",
    "vetor": [92.5, 75, 0, 78.7, 88.7, 88.8, 10, 5, 12.5, 86.3, 76.3, 62.5],
    "imagePath": "/personalities/portraits/konkin.jpg",
    "imageAlt": "Retrato de Samuel Edward Konkin III"
  },
  {
    "id": "javier-milei-ofimdainflacao",
    "titulo": "O Fim da Inflação",
    "autor": "Javier Milei",
    "autorId": "javier-milei",
    "ano": 2022,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "O Fim da Inflação é uma obra de Javier Milei que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Fim da Inflação para conhecer os argumentos e o contexto de Javier Milei e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=O%20Fim%20da%20Infla%C3%A7%C3%A3o%20Javier%20Milei",
    "vetor": [75, 65, 27.5, 60, 70, 41.3, 8.8, 5, 6.3, 38.8, 31.3, 91.3],
    "imagePath": "/personalities/portraits/javier-milei.jpg",
    "imageAlt": "Retrato de Javier Milei"
  },
  {
    "id": "goldwater-aconscienciadeumconservador",
    "titulo": "A Consciência de um Conservador",
    "autor": "Barry Goldwater",
    "autorId": "goldwater",
    "ano": 1960,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Consciência de um Conservador é uma obra de Barry Goldwater que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Consciência de um Conservador para conhecer os argumentos e o contexto de Barry Goldwater e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Consci%C3%AAncia%20de%20um%20Conservador%20Barry%20Goldwater",
    "vetor": [73.8, 76.2, 23.8, 37.5, 21.2, 26.2, 7.5, 13.8, 20, 68.8, 58.8, 70],
    "imagePath": "/personalities/portraits/goldwater.jpg",
    "imageAlt": "Retrato de Barry Goldwater"
  },
  {
    "id": "randolph-bourne-aguerraeasaudedoestado",
    "titulo": "A Guerra É a Saúde do Estado",
    "autor": "Randolph Bourne",
    "autorId": "randolph-bourne",
    "ano": 1918,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Guerra É a Saúde do Estado é uma obra de Randolph Bourne que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Guerra É a Saúde do Estado para conhecer os argumentos e o contexto de Randolph Bourne e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Guerra%20%C3%89%20a%20Sa%C3%BAde%20do%20Estado%20Randolph%20Bourne",
    "vetor": [73.8, 80, 15, 86.2, 93.8, 80, 30, 30, 35, 68.8, 68.8, 53.8],
    "imagePath": "/personalities/portraits/randolph-bourne.jpg",
    "imageAlt": "Retrato de Randolph Bourne"
  },
  {
    "id": "peter-maurin-ensaiosfaceis",
    "titulo": "Ensaios Fáceis",
    "autor": "Peter Maurin",
    "autorId": "peter-maurin",
    "ano": 1936,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Ensaios Fáceis é uma obra de Peter Maurin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ensaios Fáceis para conhecer os argumentos e o contexto de Peter Maurin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Ensaios%20F%C3%A1ceis%20Peter%20Maurin",
    "vetor": [85, 80, 35, 70, 96.2, 81.2, 61.3, 51.2, 71.2, 10, 21.2, 16.2],
    "imagePath": "/personalities/portraits/peter-maurin.jpg",
    "imageAlt": "Retrato de Peter Maurin"
  },
  {
    "id": "lysander-spooner-nenhumatraicaoaconstituicaosemautoridade",
    "titulo": "Nenhuma Traição: A Constituição sem Autoridade",
    "autor": "Lysander Spooner",
    "autorId": "lysander-spooner",
    "ano": 1867,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Nenhuma Traição: A Constituição sem Autoridade é uma obra de Lysander Spooner que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Nenhuma Traição: A Constituição sem Autoridade para conhecer os argumentos e o contexto de Lysander Spooner e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Nenhuma%20Trai%C3%A7%C3%A3o%3A%20A%20Constitui%C3%A7%C3%A3o%20sem%20Autoridade%20Lysander%20Spooner",
    "vetor": [95, 81.2, 1.2, 78.8, 87.5, 86.2, 13.8, 5, 12.5, 73.8, 68.8, 63.7],
    "imagePath": "/personalities/portraits/lysander-spooner.jpg",
    "imageAlt": "Retrato de Lysander Spooner"
  },
  {
    "id": "macron-revolucao",
    "titulo": "Revolução",
    "autor": "Emmanuel Macron",
    "autorId": "macron",
    "ano": 2016,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Revolução é uma obra de Emmanuel Macron que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Revolução para conhecer os argumentos e o contexto de Emmanuel Macron e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Revolu%C3%A7%C3%A3o%20Emmanuel%20Macron",
    "vetor": [25, 65, 67.5, 50, 38.7, 27.5, 43.8, 41.2, 41.2, 72.5, 68.8, 53.8],
    "imagePath": "/personalities/portraits/macron.jpg",
    "imageAlt": "Retrato de Emmanuel Macron"
  },
  {
    "id": "comte-cursodefilosofiapositiva",
    "titulo": "Curso de Filosofia Positiva",
    "autor": "Auguste Comte",
    "autorId": "comte",
    "ano": 1830,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Curso de Filosofia Positiva é uma obra de Auguste Comte que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Curso de Filosofia Positiva para conhecer os argumentos e o contexto de Auguste Comte e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Curso%20de%20Filosofia%20Positiva%20Auguste%20Comte",
    "vetor": [8.8, 25, 78.8, 53.8, 61.2, 52.5, 78.8, 70, 60, 88.8, 65, 80],
    "imagePath": "/personalities/portraits/comte.jpg",
    "imageAlt": "Retrato de Auguste Comte"
  },
  {
    "id": "leonardo-boff-igrejacarismaepoder",
    "titulo": "Igreja: Carisma e Poder",
    "autor": "Leonardo Boff",
    "autorId": "leonardo-boff",
    "ano": 1981,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Igreja: Carisma e Poder é uma obra de Leonardo Boff que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Igreja: Carisma e Poder para conhecer os argumentos e o contexto de Leonardo Boff e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Igreja%3A%20Carisma%20e%20Poder%20Leonardo%20Boff",
    "vetor": [63.7, 88.8, 28.7, 82.5, 92.5, 75, 87.5, 77.5, 72.5, 32, 73.8, 18.8],
    "imagePath": "/personalities/portraits/leonardo-boff.jpg",
    "imageAlt": "Retrato de Leonardo Boff"
  },
  {
    "id": "kissinger-diplomacia",
    "titulo": "Diplomacia",
    "autor": "Henry Kissinger",
    "autorId": "kissinger",
    "ano": 1994,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Diplomacia é uma obra de Henry Kissinger que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Diplomacia para conhecer os argumentos e o contexto de Henry Kissinger e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Diplomacia%20Henry%20Kissinger",
    "vetor": [26.2, 45, 61.3, 36.3, 35, 23.8, 38.8, 40, 46, 55, 40, 62.5],
    "imagePath": "/personalities/portraits/kissinger.jpg",
    "imageAlt": "Retrato de Henry Kissinger"
  },
  {
    "id": "peter-thiel-dezeroaum",
    "titulo": "De Zero a Um",
    "autor": "Peter Thiel",
    "autorId": "peter-thiel",
    "ano": 2014,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "De Zero a Um é uma obra de Peter Thiel que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler De Zero a Um para conhecer os argumentos e o contexto de Peter Thiel e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=De%20Zero%20a%20Um%20Peter%20Thiel",
    "vetor": [76.8, 49.8, 31.5, 39.8, 37.6, 40, 20.8, 26.6, 31.5, 38.6, 57.4, 84.1],
    "imagePath": "/personalities/portraits/peter-thiel.jpg",
    "imageAlt": "Retrato de Peter Thiel"
  },
  {
    "id": "marinetti-manifestofuturista",
    "titulo": "Manifesto Futurista",
    "autor": "Filippo Tommaso Marinetti",
    "autorId": "marinetti",
    "ano": 1909,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Manifesto Futurista é uma obra de Filippo Tommaso Marinetti que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Manifesto Futurista para conhecer os argumentos e o contexto de Filippo Tommaso Marinetti e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Manifesto%20Futurista%20Filippo%20Tommaso%20Marinetti",
    "vetor": [16.2, 21.2, 72.5, 22.5, 6.2, 13.8, 48.8, 68.8, 85, 63.7, 25, 97.5],
    "imagePath": "/personalities/portraits/marinetti.jpg",
    "imageAlt": "Retrato de Filippo Tommaso Marinetti"
  },
  {
    "id": "donald-trump-aartedanegociacao",
    "titulo": "A Arte da Negociação",
    "autor": "Donald Trump",
    "autorId": "donald-trump",
    "ano": 1987,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Arte da Negociação é uma obra de Donald Trump que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Arte da Negociação para conhecer os argumentos e o contexto de Donald Trump e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Arte%20da%20Negocia%C3%A7%C3%A3o%20Donald%20Trump",
    "vetor": [25, 38.8, 62.5, 15, 25, 38.8, 25, 37.5, 87.5, 17.5, 21.2, 67.5],
    "imagePath": "/personalities/portraits/donald-trump.jpg",
    "imageAlt": "Retrato de Donald Trump"
  },
  {
    "id": "che-guevara-aguerradeguerrilhas",
    "titulo": "A Guerra de Guerrilhas",
    "autor": "Che Guevara",
    "autorId": "che-guevara",
    "ano": 1960,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Guerra de Guerrilhas é uma obra de Che Guevara que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Guerra de Guerrilhas para conhecer os argumentos e o contexto de Che Guevara e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Guerra%20de%20Guerrilhas%20Che%20Guevara",
    "vetor": [18.8, 16.2, 81.2, 78.8, 20, 16.2, 92.5, 97.5, 90, 96.2, 50, 70],
    "imagePath": "/personalities/portraits/che-guevara.jpg",
    "imageAlt": "Retrato de Che Guevara"
  },
  {
    "id": "ho-chi-minh-caminhorevolucionario",
    "titulo": "Caminho Revolucionário",
    "autor": "Ho Chi Minh",
    "autorId": "ho-chi-minh",
    "ano": 1927,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Caminho Revolucionário é uma obra de Ho Chi Minh que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Caminho Revolucionário para conhecer os argumentos e o contexto de Ho Chi Minh e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Caminho%20Revolucion%C3%A1rio%20Ho%20Chi%20Minh",
    "vetor": [20, 33.8, 72.5, 33.8, 33.8, 48.8, 88.8, 86.2, 82.5, 85, 58.8, 70],
    "imagePath": "/personalities/portraits/ho-chi-minh.jpg",
    "imageAlt": "Retrato de Ho Chi Minh"
  },
  {
    "id": "mahatma-gandhi-hindswarajautogovernodaindia",
    "titulo": "Hind Swaraj: Autogoverno da Índia",
    "autor": "Mahatma Gandhi",
    "autorId": "mahatma-gandhi",
    "ano": 1909,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Hind Swaraj: Autogoverno da Índia é uma obra de Mahatma Gandhi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Hind Swaraj: Autogoverno da Índia para conhecer os argumentos e o contexto de Mahatma Gandhi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Hind%20Swaraj%3A%20Autogoverno%20da%20%C3%8Dndia%20Mahatma%20Gandhi",
    "vetor": [77.5, 83.8, 27.5, 60, 97.5, 80, 66.2, 51.2, 77.5, 28.7, 36.2, 8.8],
    "imagePath": "/personalities/portraits/mahatma-gandhi.jpg",
    "imageAlt": "Retrato de Mahatma Gandhi"
  },
  {
    "id": "br-ambedkar-aaniquilacaodascastas",
    "titulo": "A Aniquilação das Castas",
    "autor": "B. R. Ambedkar",
    "autorId": "br-ambedkar",
    "ano": 1936,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Aniquilação das Castas é uma obra de B. R. Ambedkar que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Aniquilação das Castas para conhecer os argumentos e o contexto de B. R. Ambedkar e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Aniquila%C3%A7%C3%A3o%20das%20Castas%20B.%20R.%20Ambedkar",
    "vetor": [25, 78.8, 43.8, 62.5, 60, 62.5, 72.5, 70, 58.8, 78.8, 71.3, 58.8],
    "imagePath": "/personalities/portraits/br-ambedkar.jpg",
    "imageAlt": "Retrato de B. R. Ambedkar"
  },
  {
    "id": "frantz-fanon-oscondenadosdaterra",
    "titulo": "Os Condenados da Terra",
    "autor": "frantz-fanon",
    "autorId": "frantz-fanon",
    "ano": 1961,
    "area": "teoria-politica",
    "dificuldade": "intermediario",
    "resumo": "Os Condenados da Terra é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Condenados da Terra para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "teoria-politica"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Condenados%20da%20Terra%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de frantz-fanon"
  },
  {
    "id": "nelson-mandela-longacaminhadaatealiberdade",
    "titulo": "Longa Caminhada até a Liberdade",
    "autor": "Nelson Mandela",
    "autorId": "nelson-mandela",
    "ano": 1994,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Longa Caminhada até a Liberdade é uma obra de Nelson Mandela que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Longa Caminhada até a Liberdade para conhecer os argumentos e o contexto de Nelson Mandela e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "social-democracia"
    ],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Longa%20Caminhada%20at%C3%A9%20a%20Liberdade%20Nelson%20Mandela",
    "vetor": [55, 92, 45, 80, 5, 85, 65, 50, 45, 60, 85, 55],
    "imagePath": "/personalities/portraits/nelson-mandela.jpg",
    "imageAlt": "Retrato de Nelson Mandela"
  },
  {
    "id": "malcolm-x-aautobiografiademalcolmx",
    "titulo": "A Autobiografia de Malcolm X",
    "autor": "Malcolm X",
    "autorId": "malcolm-x",
    "ano": 1965,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Autobiografia de Malcolm X é uma obra de Malcolm X que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Autobiografia de Malcolm X para conhecer os argumentos e o contexto de Malcolm X e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Autobiografia%20de%20Malcolm%20X%20Malcolm%20X",
    "vetor": [73.8, 75, 26.2, 58.7, 53.8, 67.5, 72.5, 70, 65, 22.5, 41.3, 46.2],
    "imagePath": "/personalities/portraits/malcolm-x.jpg",
    "imageAlt": "Retrato de Malcolm X"
  },
  {
    "id": "carl-schmitt-oconceitodopolitico",
    "titulo": "O Conceito do Político",
    "autor": "carl-schmitt",
    "autorId": "carl-schmitt",
    "ano": 1932,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Conceito do Político é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Conceito do Político para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Conceito%20do%20Pol%C3%ADtico%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de carl-schmitt"
  },
  {
    "id": "confucio-osanalectos",
    "titulo": "Os Analectos",
    "autor": "Confúcio",
    "autorId": "confucio",
    "ano": -475,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Os Analectos é uma obra de Confúcio que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Analectos para conhecer os argumentos e o contexto de Confúcio e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Analectos%20Conf%C3%BAcio",
    "vetor": [20, 22.5, 68.8, 26.2, 66.2, 55, 58.8, 63.7, 66.2, 60, 23.8, 48.8],
    "imagePath": "/personalities/portraits/confucio.jpg",
    "imageAlt": "Retrato de Confúcio"
  },
  {
    "id": "sun-yat-sen-ostresprincipiosdopovo",
    "titulo": "Os Três Princípios do Povo",
    "autor": "Sun Yat-sen",
    "autorId": "sun-yat-sen",
    "ano": 1924,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Os Três Princípios do Povo é uma obra de Sun Yat-sen que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Três Princípios do Povo para conhecer os argumentos e o contexto de Sun Yat-sen e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Tr%C3%AAs%20Princ%C3%ADpios%20do%20Povo%20Sun%20Yat-sen",
    "vetor": [27.5, 58, 68.8, 35, 45, 66.2, 70, 70, 66.2, 58.8, 35, 63.7],
    "imagePath": "/personalities/portraits/sun-yat-sen.jpg",
    "imageAlt": "Retrato de Sun Yat-sen"
  },
  {
    "id": "theodor-herzl-oestadojudeu",
    "titulo": "O Estado Judeu",
    "autor": "Theodor Herzl",
    "autorId": "theodor-herzl",
    "ano": 1896,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "O Estado Judeu é uma obra de Theodor Herzl que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Estado Judeu para conhecer os argumentos e o contexto de Theodor Herzl e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=O%20Estado%20Judeu%20Theodor%20Herzl",
    "vetor": [33.8, 45, 52.5, 40, 53.8, 41.2, 60, 55, 41.2, 51.2, 40, 61.3],
    "imagePath": "/personalities/portraits/theodor-herzl.jpg",
    "imageAlt": "Retrato de Theodor Herzl"
  },
  {
    "id": "simon-bolivar-cartadajamaica",
    "titulo": "Carta da Jamaica",
    "autor": "Simón Bolívar",
    "autorId": "simon-bolivar",
    "ano": 1815,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Carta da Jamaica é uma obra de Simón Bolívar que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Carta da Jamaica para conhecer os argumentos e o contexto de Simón Bolívar e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Carta%20da%20Jamaica%20Sim%C3%B3n%20Bol%C3%ADvar",
    "vetor": [17.5, 26.2, 65, 51.2, 27, 30, 61.3, 63.7, 62.5, 50, 40, 52.5],
    "imagePath": "/personalities/portraits/simon-bolivar.png",
    "imageAlt": "Retrato de Simón Bolívar"
  },
  {
    "id": "julius-evola-revoltacontraomundomoderno",
    "titulo": "Revolta contra o Mundo Moderno",
    "autor": "Julius Evola",
    "autorId": "julius-evola",
    "ano": 1934,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Revolta contra o Mundo Moderno é uma obra de Julius Evola que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Revolta contra o Mundo Moderno para conhecer os argumentos e o contexto de Julius Evola e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Revolta%20contra%20o%20Mundo%20Moderno%20Julius%20Evola",
    "vetor": [27.5, 13.8, 61.3, 16.2, 25, 28.7, 46.2, 60, 72.5, 27.5, 30, 27.5],
    "imagePath": "/personalities/portraits/julius-evola.jpg",
    "imageAlt": "Retrato de Julius Evola"
  },
  {
    "id": "slavoj-zizek-primeirocomotragediadepoiscomofarsa",
    "titulo": "Primeiro como Tragédia, Depois como Farsa",
    "autor": "Slavoj Žižek",
    "autorId": "slavoj-zizek",
    "ano": 2009,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Primeiro como Tragédia, Depois como Farsa é uma obra de Slavoj Žižek que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Primeiro como Tragédia, Depois como Farsa para conhecer os argumentos e o contexto de Slavoj Žižek e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Primeiro%20como%20Trag%C3%A9dia%2C%20Depois%20como%20Farsa%20Slavoj%20%C5%BDi%C5%BEek",
    "vetor": [35, 75, 28.7, 62.5, 75, 70, 80, 77.5, 66.2, 81.2, 65, 43.8],
    "imagePath": "/personalities/portraits/slavoj-zizek.jpg",
    "imageAlt": "Retrato de Slavoj Žižek"
  },
  {
    "id": "isaiah-berlin-quatroensaiossobrealiberdade",
    "titulo": "Quatro Ensaios sobre a Liberdade",
    "autor": "Isaiah Berlin",
    "autorId": "isaiah-berlin",
    "ano": 1969,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Quatro Ensaios sobre a Liberdade é uma obra de Isaiah Berlin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Quatro Ensaios sobre a Liberdade para conhecer os argumentos e o contexto de Isaiah Berlin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Quatro%20Ensaios%20sobre%20a%20Liberdade%20Isaiah%20Berlin",
    "vetor": [68.8, 80, 27.5, 63.8, 70, 63.7, 53.8, 46.2, 36.2, 63.7, 61.3, 48.8],
    "imagePath": "/personalities/portraits/isaiah-berlin.jpg",
    "imageAlt": "Retrato de Isaiah Berlin"
  },
  {
    "id": "jean-paul-sartre-oexistencialismoeumhumanismo",
    "titulo": "O Existencialismo É um Humanismo",
    "autor": "Jean-Paul Sartre",
    "autorId": "jean-paul-sartre",
    "ano": 1946,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "O Existencialismo É um Humanismo é uma obra de Jean-Paul Sartre que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Existencialismo É um Humanismo para conhecer os argumentos e o contexto de Jean-Paul Sartre e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=O%20Existencialismo%20%C3%89%20um%20Humanismo%20Jean-Paul%20Sartre",
    "vetor": [75, 86.2, 17.5, 87.5, 92.5, 82.5, 82.5, 86.2, 72.5, 92.5, 83.8, 56.2],
    "imagePath": "/personalities/portraits/jean-paul-sartre.jpg",
    "imageAlt": "Retrato de Jean-Paul Sartre"
  },
  {
    "id": "fernando-henrique-cardoso-dependenciaedesenvolvimentonaamericalatina",
    "titulo": "Dependência e Desenvolvimento na América Latina",
    "autor": "Fernando Henrique Cardoso",
    "autorId": "fernando-henrique-cardoso",
    "ano": 1969,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Dependência e Desenvolvimento na América Latina é uma obra de Fernando Henrique Cardoso que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Dependência e Desenvolvimento na América Latina para conhecer os argumentos e o contexto de Fernando Henrique Cardoso e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "liberalismo-social"
    ],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Depend%C3%AAncia%20e%20Desenvolvimento%20na%20Am%C3%A9rica%20Latina%20Fernando%20Henrique%20Cardoso",
    "vetor": [60, 88, 45, 65, 15, 75, 48, 35, 25, 50, 60, 65],
    "imagePath": "/personalities/portraits/fernando-henrique-cardoso.jpg",
    "imageAlt": "Retrato de Fernando Henrique Cardoso"
  },
  {
    "id": "ciro-gomes-projetonacionalodeverdaesperanca",
    "titulo": "Projeto Nacional: O Dever da Esperança",
    "autor": "Ciro Gomes",
    "autorId": "ciro-gomes",
    "ano": 2020,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Projeto Nacional: O Dever da Esperança é uma obra de Ciro Gomes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Projeto Nacional: O Dever da Esperança para conhecer os argumentos e o contexto de Ciro Gomes e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Projeto%20Nacional%3A%20O%20Dever%20da%20Esperan%C3%A7a%20Ciro%20Gomes",
    "vetor": [42.6, 84.7, 60.3, 59.8, 56.2, 51.4, 61.3, 85, 66.9, 51.2, 53.8, 59.4],
    "imagePath": "/personalities/portraits/ciro-gomes.jpg",
    "imageAlt": "Retrato de Ciro Gomes"
  },
  {
    "id": "barack-obama-aaudaciadaesperanca",
    "titulo": "A Audácia da Esperança",
    "autor": "Barack Obama",
    "autorId": "barack-obama",
    "ano": 2006,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Audácia da Esperança é uma obra de Barack Obama que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Audácia da Esperança para conhecer os argumentos e o contexto de Barack Obama e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Aud%C3%A1cia%20da%20Esperan%C3%A7a%20Barack%20Obama",
    "vetor": [40, 76.2, 46.2, 75, 63.8, 48.8, 55, 63.7, 28.7, 53.8, 76.2, 48.8],
    "imagePath": "/personalities/portraits/barack-obama.jpg",
    "imageAlt": "Retrato de Barack Obama"
  },
  {
    "id": "fidel-castro-ahistoriameabsolvera",
    "titulo": "A História Me Absolverá",
    "autor": "Fidel Castro",
    "autorId": "fidel-castro",
    "ano": 1953,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A História Me Absolverá é uma obra de Fidel Castro que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A História Me Absolverá para conhecer os argumentos e o contexto de Fidel Castro e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Hist%C3%B3ria%20Me%20Absolver%C3%A1%20Fidel%20Castro",
    "vetor": [5, 17.5, 85, 46.2, 26.2, 26.2, 95, 95, 78.8, 85, 25, 52.5],
    "imagePath": "/personalities/portraits/fidel-castro.jpg",
    "imageAlt": "Retrato de Fidel Castro"
  },
  {
    "id": "john-f-kennedy-perfisdecoragem",
    "titulo": "Perfis de Coragem",
    "autor": "John F. Kennedy",
    "autorId": "john-f-kennedy",
    "ano": 1956,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Perfis de Coragem é uma obra de John F. Kennedy que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Perfis de Coragem para conhecer os argumentos e o contexto de John F. Kennedy e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Perfis%20de%20Coragem%20John%20F.%20Kennedy",
    "vetor": [31.2, 68.8, 56.2, 71.3, 47.5, 28.7, 51.2, 60, 37.5, 51.2, 48.8, 73.8],
    "imagePath": "/personalities/portraits/john-f-kennedy.jpg",
    "imageAlt": "Retrato de John F. Kennedy"
  },
  {
    "id": "james-madison-ofederalista",
    "titulo": "O Federalista",
    "autor": "James Madison",
    "autorId": "james-madison",
    "ano": 1788,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "O Federalista é uma obra de James Madison que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Federalista para conhecer os argumentos e o contexto de James Madison e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Federalista%20James%20Madison",
    "vetor": [68, 70, 33.8, 51.2, 62.5, 46.2, 45, 42.5, 43.8, 68, 42.5, 50],
    "imagePath": "/personalities/portraits/james-madison.jpg",
    "imageAlt": "Retrato de James Madison"
  },
  {
    "id": "alexander-hamilton-ofederalista",
    "titulo": "O Federalista",
    "autor": "Alexander Hamilton",
    "autorId": "alexander-hamilton",
    "ano": 1788,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "O Federalista é uma obra de Alexander Hamilton que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Federalista para conhecer os argumentos e o contexto de Alexander Hamilton e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Federalista%20Alexander%20Hamilton",
    "vetor": [17.5, 42.5, 63.7, 33.8, 33.8, 36.2, 46.2, 61.3, 81.2, 32.5, 32.5, 65],
    "imagePath": "/personalities/portraits/alexander-hamilton.jpg",
    "imageAlt": "Retrato de Alexander Hamilton"
  },
  {
    "id": "maximilien-robespierre-virtudeeterror",
    "titulo": "Virtude e Terror",
    "autor": "Maximilien Robespierre",
    "autorId": "maximilien-robespierre",
    "ano": 1794,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Virtude e Terror é uma obra de Maximilien Robespierre que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Virtude e Terror para conhecer os argumentos e o contexto de Maximilien Robespierre e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Virtude%20e%20Terror%20Maximilien%20Robespierre",
    "vetor": [18.8, 50, 71.2, 38.7, 30, 45, 66.2, 70, 70, 55, 31.2, 27.5],
    "imagePath": "/personalities/portraits/maximilien-robespierre.jpg",
    "imageAlt": "Retrato de Maximilien Robespierre"
  },
  {
    "id": "julio-cesar-comentariossobreaguerragalica",
    "titulo": "Comentários sobre a Guerra Gálica",
    "autor": "Júlio César",
    "autorId": "julio-cesar",
    "ano": -50,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Comentários sobre a Guerra Gálica é uma obra de Júlio César que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Comentários sobre a Guerra Gálica para conhecer os argumentos e o contexto de Júlio César e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Coment%C3%A1rios%20sobre%20a%20Guerra%20G%C3%A1lica%20J%C3%BAlio%20C%C3%A9sar",
    "vetor": [13.8, 23.8, 76.2, 25, 17.5, 13.8, 35, 60, 66.2, 31.2, 37.5, 68.8],
    "imagePath": "/personalities/portraits/julio-cesar.jpg",
    "imageAlt": "Retrato de Júlio César"
  },
  {
    "id": "jordan-peterson-12regrasparaavida",
    "titulo": "12 Regras para a Vida",
    "autor": "Jordan Peterson",
    "autorId": "jordan-peterson",
    "ano": 2018,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "12 Regras para a Vida é uma obra de Jordan Peterson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler 12 Regras para a Vida para conhecer os argumentos e o contexto de Jordan Peterson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=12%20Regras%20para%20a%20Vida%20Jordan%20Peterson",
    "vetor": [28.7, 56.2, 47.5, 35, 46.2, 53.8, 42.5, 35, 58.8, 30, 22.5, 43.8],
    "imagePath": "/personalities/portraits/jordan-peterson.jpg",
    "imageAlt": "Retrato de Jordan Peterson"
  },
  {
    "id": "aristoteles-politica",
    "titulo": "Política",
    "autor": "Aristóteles",
    "autorId": "aristoteles",
    "ano": -350,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Política é uma obra de Aristóteles que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Política para conhecer os argumentos e o contexto de Aristóteles e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Pol%C3%ADtica%20Arist%C3%B3teles",
    "vetor": [71.2, 43.8, 63.7, 31.2, 43.8, 51.2, 56.2, 60, 70, 30, 31.2, 45],
    "imagePath": "/personalities/portraits/aristoteles.jpg",
    "imageAlt": "Retrato de Aristóteles"
  },
  {
    "id": "platao-arepublica",
    "titulo": "A República",
    "autor": "Platão",
    "autorId": "platao",
    "ano": -375,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "A República é uma obra de Platão que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A República para conhecer os argumentos e o contexto de Platão e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Rep%C3%BAblica%20Plat%C3%A3o",
    "vetor": [15, 11.2, 85, 22.5, 46.2, 67.5, 82.5, 86.2, 86.2, 30, 20, 23.8],
    "imagePath": "/personalities/portraits/platao.png",
    "imageAlt": "Retrato de Platão"
  },
  {
    "id": "foucault-vigiarepunir",
    "titulo": "Vigiar e Punir",
    "autor": "Michel Foucault",
    "autorId": "foucault",
    "ano": 1975,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Vigiar e Punir é uma obra de Michel Foucault que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Vigiar e Punir para conhecer os argumentos e o contexto de Michel Foucault e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Vigiar%20e%20Punir%20Michel%20Foucault",
    "vetor": [86.2, 82.5, 16.2, 87.5, 91.2, 85, 88.8, 67.5, 45, 90, 91.2, 38.8],
    "imagePath": "/personalities/portraits/foucault.jpg",
    "imageAlt": "Retrato de Michel Foucault"
  },
  {
    "id": "a-democracia-na-america",
    "titulo": "A Democracia na América",
    "autor": "Alexis de Tocqueville",
    "autorId": "tocqueville",
    "ano": 1835,
    "vetor": [70, 90, 45, 70, 10, 80, 40, 30, 20, 45, 55, 60],
    "area": "vida-intelectual",
    "dificuldade": "avancado",
    "resumo": "Tocqueville analisa a sociedade americana e mostra como a igualdade de condições pode sustentar tanto a liberdade cívica quanto um conformismo brando, que ele chama de despotismo democrático.",
    "porque": "Combina observação e teoria para pensar associações, costumes e riscos da democracia de massas. O segundo volume, de 1840, desloca o foco para a cultura; vale lê-lo junto com o primeiro para acompanhar o argumento completo.",
    "ideologias": [
      "liberalismo-classico",
      "republicanismo"
    ],
    "temas": [
      "democracia",
      "igualdade",
      "associativismo",
      "despotismo"
    ],
    "link": "https://openlibrary.org/search?q=A+Democracia+na+Am%C3%A9rica+Tocqueville",
    "imagePath": "/personalities/portraits/tocqueville.jpg",
    "imageAlt": "Retrato de Alexis de Tocqueville"
  },
  {
    "id": "nietzsche-assimfalouzaratustra",
    "titulo": "Assim Falou Zaratustra",
    "autor": "Friedrich Nietzsche",
    "autorId": "nietzsche",
    "ano": 1883,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Assim Falou Zaratustra é uma obra de Friedrich Nietzsche que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Assim Falou Zaratustra para conhecer os argumentos e o contexto de Friedrich Nietzsche e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Assim%20Falou%20Zaratustra%20Friedrich%20Nietzsche",
    "vetor": [78.8, 16.2, 41.2, 71.3, 25, 47.5, 33.8, 41.2, 38.8, 71.2, 41.2, 66.2],
    "imagePath": "/personalities/portraits/nietzsche.jpg",
    "imageAlt": "Retrato de Friedrich Nietzsche"
  },
  {
    "id": "rousseau-ocontratosocial",
    "titulo": "O Contrato Social",
    "autor": "Jean-Jacques Rousseau",
    "autorId": "rousseau",
    "ano": 1762,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "O Contrato Social é uma obra de Jean-Jacques Rousseau que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Contrato Social para conhecer os argumentos e o contexto de Jean-Jacques Rousseau e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "republicanismo"
    ],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=O%20Contrato%20Social%20Jean-Jacques%20Rousseau",
    "vetor": [55, 85, 35, 65, 10, 75, 60, 45, 40, 50, 70, 55],
    "imagePath": "/personalities/portraits/rousseau.jpg",
    "imageAlt": "Retrato de Jean-Jacques Rousseau"
  },
  {
    "id": "leviata",
    "titulo": "Leviatã",
    "autor": "Thomas Hobbes",
    "autorId": "hobbes",
    "ano": 1651,
    "vetor": [10, 10, 95, 15, 70, 20, 45, 50, 65, 60, 20, 30],
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Hobbes descreve o estado de natureza como guerra de todos contra todos e argumenta que só um soberano com poder indiviso garante segurança, paz e vida civil.",
    "porque": "O livro funda a ideia moderna de soberania e segue sendo a referência para discutir os custos da ordem. Leia observando o preço que Hobbes cobra em liberdade e os limites de sua antropologia.",
    "ideologias": [
      "conservadorismo"
    ],
    "temas": [
      "contrato social",
      "soberania",
      "Estado de natureza"
    ],
    "link": "https://openlibrary.org/search?q=Leviat%C3%A3+Hobbes",
    "imagePath": "/personalities/portraits/hobbes.jpg",
    "imageAlt": "Retrato de Thomas Hobbes"
  },
  {
    "id": "o-principe",
    "titulo": "O Príncipe",
    "autor": "Nicolau Maquiavel",
    "autorId": "maquiavel",
    "ano": 1532,
    "vetor": [55, 50, 65, 65, 60, 40, 55, 50, 55, 70, 55, 55],
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Maquiavel descreve como príncipes conquistam e conservam o poder, separando a análise política da moral cristã e recomendando o uso calculado da força e da aparência.",
    "porque": "Funda a ciência política moderna ao examinar o poder como ele é, e não como deveria ser. Convém lê-lo ao lado dos Discursos sobre a primeira década de Tito Lívio, onde Maquiavel defende com mais clareza a república.",
    "ideologias": [
      "republicanismo"
    ],
    "temas": [
      "poder",
      "virtú e fortuna",
      "realismo político",
      "república"
    ],
    "link": "https://openlibrary.org/search?q=O+Pr%C3%ADncipe+Maquiavel",
    "imagePath": "/personalities/portraits/maquiavel.jpg",
    "imageAlt": "Retrato de Nicolau Maquiavel"
  },
  {
    "id": "teoria-geral-do-emprego-do-juro-e-da-moeda",
    "titulo": "Teoria Geral do Emprego, do Juro e da Moeda",
    "autor": "John Maynard Keynes",
    "autorId": "keynes",
    "ano": 1936,
    "vetor": [55, 88, 50, 70, 15, 75, 65, 55, 35, 50, 70, 65],
    "area": "economia",
    "dificuldade": "avancado",
    "resumo": "Keynes sustenta que a demanda efetiva determina o emprego e que economias podem ficar presas em equilíbrio com desemprego, justificando gasto público e política monetária para sustentar a atividade.",
    "porque": "Reorienta a macroeconomia e fornece vocabulário para políticas anticíclicas. Leia conhecendo as críticas monetaristas e novo-clássicas, que contestam a eficácia de estímulos fiscais e ajudam a entender os limites do argumento.",
    "ideologias": [
      "social-democracia",
      "desenvolvimentismo"
    ],
    "temas": [
      "demanda efetiva",
      "desemprego",
      "política fiscal",
      "juros"
    ],
    "link": "https://openlibrary.org/search?q=Teoria+Geral+do+Emprego+do+Juro+e+da+Moeda+Keynes",
    "imagePath": "/personalities/portraits/keynes.jpg",
    "imageAlt": "Retrato de John Maynard Keynes"
  },
  {
    "id": "peron-acomunidadeorganizada",
    "titulo": "A Comunidade Organizada",
    "autor": "peron",
    "autorId": "peron",
    "ano": 1949,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Comunidade Organizada é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Comunidade Organizada para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Comunidade%20Organizada%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de peron"
  },
  {
    "id": "satoshi-nakamoto-bitcoinumsistemadedinheiroeletronicopeertopeer",
    "titulo": "Bitcoin: Um Sistema de Dinheiro Eletrônico Peer-to-Peer",
    "autor": "Satoshi Nakamoto",
    "autorId": "satoshi-nakamoto",
    "ano": 2008,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Bitcoin: Um Sistema de Dinheiro Eletrônico Peer-to-Peer é uma obra de Satoshi Nakamoto que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Bitcoin: Um Sistema de Dinheiro Eletrônico Peer-to-Peer para conhecer os argumentos e o contexto de Satoshi Nakamoto e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Bitcoin%3A%20Um%20Sistema%20de%20Dinheiro%20Eletr%C3%B4nico%20Peer-to-Peer%20Satoshi%20Nakamoto",
    "vetor": [89, 87.5, 10, 81.2, 88.8, 87.5, 16.2, 6.2, 11.2, 90, 72.5, 82.5],
    "imagePath": "/personalities/portraits/satoshi-nakamoto.jpg",
    "imageAlt": "Retrato de Satoshi Nakamoto"
  },
  {
    "id": "george-soros-aalquimiadasfinancas",
    "titulo": "A Alquimia das Finanças",
    "autor": "George Soros",
    "autorId": "george-soros",
    "ano": 1987,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "A Alquimia das Finanças é uma obra de George Soros que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Alquimia das Finanças para conhecer os argumentos e o contexto de George Soros e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=A%20Alquimia%20das%20Finan%C3%A7as%20George%20Soros",
    "vetor": [61.3, 83.8, 25, 88.8, 82.5, 71.2, 50, 53.8, 15, 87.5, 88.8, 53.8],
    "imagePath": "/personalities/portraits/george-soros.jpg",
    "imageAlt": "Retrato de George Soros"
  },
  {
    "id": "bill-gates-comoevitarumdesastreclimatico",
    "titulo": "Como Evitar um Desastre Climático",
    "autor": "Bill Gates",
    "autorId": "bill-gates",
    "ano": 2021,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Como Evitar um Desastre Climático é uma obra de Bill Gates que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Como Evitar um Desastre Climático para conhecer os argumentos e o contexto de Bill Gates e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Como%20Evitar%20um%20Desastre%20Clim%C3%A1tico%20Bill%20Gates",
    "vetor": [33.8, 70, 51.2, 70, 77.5, 56.2, 35, 47.5, 25, 83.8, 73.8, 71.2],
    "imagePath": "/personalities/portraits/bill-gates.jpg",
    "imageAlt": "Retrato de Bill Gates"
  },
  {
    "id": "dalai-lama-umaeticaparaonovomilenio",
    "titulo": "Uma Ética para o Novo Milênio",
    "autor": "Dalai Lama (Tenzin Gyatso)",
    "autorId": "dalai-lama",
    "ano": 1999,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Uma Ética para o Novo Milênio é uma obra de Dalai Lama (Tenzin Gyatso) que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Uma Ética para o Novo Milênio para conhecer os argumentos e o contexto de Dalai Lama (Tenzin Gyatso) e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Uma%20%C3%89tica%20para%20o%20Novo%20Mil%C3%AAnio%20Dalai%20Lama%20(Tenzin%20Gyatso)",
    "vetor": [73.8, 77.5, 43.8, 65, 97.5, 71.2, 72.5, 67.5, 33.8, 43.8, 47.5, 33.8],
    "imagePath": "/personalities/portraits/dalai-lama.jpg",
    "imageAlt": "Retrato de Dalai Lama (Tenzin Gyatso)"
  },
  {
    "id": "pentti-linkola-avidapodeprevalecer",
    "titulo": "A Vida Pode Prevalecer?",
    "autor": "Pentti Linkola",
    "autorId": "pentti-linkola",
    "ano": 2004,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "A Vida Pode Prevalecer? é uma obra de Pentti Linkola que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Vida Pode Prevalecer? para conhecer os argumentos e o contexto de Pentti Linkola e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=A%20Vida%20Pode%20Prevalecer%3F%20Pentti%20Linkola",
    "vetor": [13.8, 5, 77.5, 18.8, 71.3, 68.8, 66.2, 65, 82.5, 67.5, 47.5, 2.5],
    "imagePath": "/personalities/portraits/pentti-linkola.jpg",
    "imageAlt": "Retrato de Pentti Linkola"
  },
  {
    "id": "thomas-jefferson-notassobreoestadodavirginia",
    "titulo": "Notas sobre o Estado da Virgínia",
    "autor": "Thomas Jefferson",
    "autorId": "thomas-jefferson",
    "ano": 1785,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Notas sobre o Estado da Virgínia é uma obra de Thomas Jefferson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Notas sobre o Estado da Virgínia para conhecer os argumentos e o contexto de Thomas Jefferson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Notas%20sobre%20o%20Estado%20da%20Virg%C3%ADnia%20Thomas%20Jefferson",
    "vetor": [93.8, 71.2, 16.2, 30, 71.3, 73.8, 31.2, 20, 25, 78, 41.3, 36.2],
    "imagePath": "/personalities/portraits/thomas-jefferson.jpg",
    "imageAlt": "Retrato de Thomas Jefferson"
  },
  {
    "id": "h-l-mencken-notassobreademocracia",
    "titulo": "Notas sobre a Democracia",
    "autor": "H. L. Mencken",
    "autorId": "h-l-mencken",
    "ano": 1926,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Notas sobre a Democracia é uma obra de H. L. Mencken que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Notas sobre a Democracia para conhecer os argumentos e o contexto de H. L. Mencken e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Notas%20sobre%20a%20Democracia%20H.%20L.%20Mencken",
    "vetor": [75, 27.5, 8.8, 62.5, 77.5, 73.8, 10, 8.8, 13.8, 95, 62.5, 85],
    "imagePath": "/personalities/portraits/h-l-mencken.jpg",
    "imageAlt": "Retrato de H. L. Mencken"
  },
  {
    "id": "marcus-garvey-filosofiaeopinioesdemarcusgarvey",
    "titulo": "Filosofia e Opiniões de Marcus Garvey",
    "autor": "Marcus Garvey",
    "autorId": "marcus-garvey",
    "ano": 1923,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Filosofia e Opiniões de Marcus Garvey é uma obra de Marcus Garvey que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Filosofia e Opiniões de Marcus Garvey para conhecer os argumentos e o contexto de Marcus Garvey e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Filosofia%20e%20Opini%C3%B5es%20de%20Marcus%20Garvey%20Marcus%20Garvey",
    "vetor": [37.5, 52, 57.5, 23.7, 41.2, 56.2, 41.2, 70, 78.8, 22.5, 23.8, 62.5],
    "imagePath": "/personalities/portraits/marcus-garvey.jpg",
    "imageAlt": "Retrato de Marcus Garvey"
  },
  {
    "id": "julius-nyerere-ujamaaensaiossobreosocialismo",
    "titulo": "Ujamaa: Ensaios sobre o Socialismo",
    "autor": "Julius Nyerere",
    "autorId": "julius-nyerere",
    "ano": 1968,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Ujamaa: Ensaios sobre o Socialismo é uma obra de Julius Nyerere que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ujamaa: Ensaios sobre o Socialismo para conhecer os argumentos e o contexto de Julius Nyerere e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Ujamaa%3A%20Ensaios%20sobre%20o%20Socialismo%20Julius%20Nyerere",
    "vetor": [15, 42.5, 83.8, 58.8, 66.2, 47.5, 91.2, 92.5, 78.8, 33.8, 20, 22.5],
    "imagePath": "/personalities/portraits/julius-nyerere.jpg",
    "imageAlt": "Retrato de Julius Nyerere"
  },
  {
    "id": "papa-pio-ix-syllabusdoserros",
    "titulo": "Syllabus dos Erros",
    "autor": "Papa Pio IX",
    "autorId": "papa-pio-ix",
    "ano": 1864,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Syllabus dos Erros é uma obra de Papa Pio IX que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Syllabus dos Erros para conhecer os argumentos e o contexto de Papa Pio IX e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Syllabus%20dos%20Erros%20Papa%20Pio%20IX",
    "vetor": [10, 10, 86.2, 30, 58.8, 56.2, 45, 68.8, 83.8, 12.5, 6.2, 22.5],
    "imagePath": "/personalities/portraits/papa-pio-ix.jpg",
    "imageAlt": "Retrato de Papa Pio IX"
  },
  {
    "id": "justiniano-i-institutasdejustiniano",
    "titulo": "Institutas de Justiniano",
    "autor": "Justiniano I",
    "autorId": "justiniano-i",
    "ano": 533,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Institutas de Justiniano é uma obra de Justiniano I que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Institutas de Justiniano para conhecer os argumentos e o contexto de Justiniano I e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Institutas%20de%20Justiniano%20Justiniano%20I",
    "vetor": [10, 7.5, 82.5, 36.3, 36.3, 13.8, 52.5, 77.5, 48.8, 0, 10, 36.2],
    "imagePath": "/personalities/portraits/justiniano.jpg",
    "imageAlt": "Retrato de Justiniano I"
  },
  {
    "id": "joao-calvino-asinstitutasdareligiaocrista",
    "titulo": "As Institutas da Religião Cristã",
    "autor": "João Calvino",
    "autorId": "joao-calvino",
    "ano": 1536,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "As Institutas da Religião Cristã é uma obra de João Calvino que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler As Institutas da Religião Cristã para conhecer os argumentos e o contexto de João Calvino e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=As%20Institutas%20da%20Religi%C3%A3o%20Crist%C3%A3%20Jo%C3%A3o%20Calvino",
    "vetor": [68.8, 43.8, 85, 48.8, 53.8, 37.5, 41.2, 61.3, 42.5, 3.8, 12.5, 52.5],
    "imagePath": "/personalities/portraits/joao-calvino.png",
    "imageAlt": "Retrato de João Calvino"
  },
  {
    "id": "guillaume-faye-arqueofuturismo",
    "titulo": "Arqueofuturismo",
    "autor": "Guillaume Faye",
    "autorId": "guillaume-faye",
    "ano": 1998,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Arqueofuturismo é uma obra de Guillaume Faye que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Arqueofuturismo para conhecer os argumentos e o contexto de Guillaume Faye e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Arqueofuturismo%20Guillaume%20Faye",
    "vetor": [30, 20, 73.8, 13.8, 17.5, 25, 55, 71.2, 80, 41.2, 10, 87.5],
    "imagePath": "/personalities/portraits/guillaume-faye.jpg",
    "imageAlt": "Retrato de Guillaume Faye"
  },
  {
    "id": "jose-bonifacio-representacaoaassembleiaconstituintesobreaescravatura",
    "titulo": "Representação à Assembleia Constituinte sobre a Escravatura",
    "autor": "José Bonifácio",
    "autorId": "jose-bonifacio",
    "ano": 1825,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Representação à Assembleia Constituinte sobre a Escravatura é uma obra de José Bonifácio que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Representação à Assembleia Constituinte sobre a Escravatura para conhecer os argumentos e o contexto de José Bonifácio e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Representa%C3%A7%C3%A3o%20%C3%A0%20Assembleia%20Constituinte%20sobre%20a%20Escravatura%20Jos%C3%A9%20Bonif%C3%A1cio",
    "vetor": [16.2, 31.2, 72.5, 51.2, 45, 40, 53.8, 58.8, 55, 48.8, 40, 67.5],
    "imagePath": "/personalities/portraits/jose-bonifacio.jpg",
    "imageAlt": "Retrato de José Bonifácio"
  },
  {
    "id": "winston-churchill-asegundaguerramundial",
    "titulo": "A Segunda Guerra Mundial",
    "autor": "Winston Churchill",
    "autorId": "winston-churchill",
    "ano": 1948,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Segunda Guerra Mundial é uma obra de Winston Churchill que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Segunda Guerra Mundial para conhecer os argumentos e o contexto de Winston Churchill e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Segunda%20Guerra%20Mundial%20Winston%20Churchill",
    "vetor": [27.5, 61.3, 62.5, 31.2, 10, 22.5, 27.5, 41.2, 30, 50, 27.5, 68.8],
    "imagePath": "/personalities/portraits/winston-churchill.jpg",
    "imageAlt": "Retrato de Winston Churchill"
  },
  {
    "id": "woodrow-wilson-anovaliberdade",
    "titulo": "A Nova Liberdade",
    "autor": "Woodrow Wilson",
    "autorId": "woodrow-wilson",
    "ano": 1913,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Nova Liberdade é uma obra de Woodrow Wilson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Nova Liberdade para conhecer os argumentos e o contexto de Woodrow Wilson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Nova%20Liberdade%20Woodrow%20Wilson",
    "vetor": [30, 58.8, 74, 33.8, 63.8, 40, 46.2, 58.8, 25, 32.5, 36.3, 53.8],
    "imagePath": "/personalities/portraits/woodrow-wilson.jpg",
    "imageAlt": "Retrato de Woodrow Wilson"
  },
  {
    "id": "ted-kaczynski-asociedadeindustrialeseufuturo",
    "titulo": "A Sociedade Industrial e Seu Futuro",
    "autor": "Ted Kaczynski",
    "autorId": "ted-kaczynski",
    "ano": 1995,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "A Sociedade Industrial e Seu Futuro é uma obra de Ted Kaczynski que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Sociedade Industrial e Seu Futuro para conhecer os argumentos e o contexto de Ted Kaczynski e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=A%20Sociedade%20Industrial%20e%20Seu%20Futuro%20Ted%20Kaczynski",
    "vetor": [87.5, 61.3, 11.2, 48.8, 73.8, 72.5, 55, 45, 67.5, 65, 40, 5],
    "imagePath": "/personalities/portraits/ted-kaczynski.jpg",
    "imageAlt": "Retrato de Ted Kaczynski"
  },
  {
    "id": "richard-nixon-averdadeiraguerra",
    "titulo": "A Verdadeira Guerra",
    "autor": "Richard Nixon",
    "autorId": "richard-nixon",
    "ano": 1980,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Verdadeira Guerra é uma obra de Richard Nixon que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Verdadeira Guerra para conhecer os argumentos e o contexto de Richard Nixon e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Verdadeira%20Guerra%20Richard%20Nixon",
    "vetor": [41.2, 42.5, 73.8, 27.5, 35, 25, 36.2, 62.5, 67.5, 35, 23.8, 67.5],
    "imagePath": "/personalities/portraits/richard-nixon.jpg",
    "imageAlt": "Retrato de Richard Nixon"
  },
  {
    "id": "charles-de-gaulle-ofiodaespada",
    "titulo": "O Fio da Espada",
    "autor": "Charles de Gaulle",
    "autorId": "charles-de-gaulle",
    "ano": 1932,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Fio da Espada é uma obra de Charles de Gaulle que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Fio da Espada para conhecer os argumentos e o contexto de Charles de Gaulle e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Fio%20da%20Espada%20Charles%20de%20Gaulle",
    "vetor": [16.2, 52.5, 70, 26.2, 36.3, 41.2, 56.2, 70, 67.5, 32.5, 23.8, 57.5],
    "imagePath": "/personalities/portraits/charles-de-gaulle.jpg",
    "imageAlt": "Retrato de Charles de Gaulle"
  },
  {
    "id": "rudolf-rocker-nacionalismoecultura",
    "titulo": "Nacionalismo e Cultura",
    "autor": "Rudolf Rocker",
    "autorId": "rudolf-rocker",
    "ano": 1937,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Nacionalismo e Cultura é uma obra de Rudolf Rocker que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Nacionalismo e Cultura para conhecer os argumentos e o contexto de Rudolf Rocker e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Nacionalismo%20e%20Cultura%20Rudolf%20Rocker",
    "vetor": [90, 77.5, 10, 88.8, 88.8, 85, 77.5, 61.3, 37.5, 85, 76.2, 52.5],
    "imagePath": "/personalities/portraits/rudolf-rocker.jpg",
    "imageAlt": "Retrato de Rudolf Rocker"
  },
  {
    "id": "errico-malatesta-anarquia",
    "titulo": "Anarquia",
    "autor": "Errico Malatesta",
    "autorId": "errico-malatesta",
    "ano": 1891,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Anarquia é uma obra de Errico Malatesta que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Anarquia para conhecer os argumentos e o contexto de Errico Malatesta e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Anarquia%20Errico%20Malatesta",
    "vetor": [87.5, 81.2, 5, 88.8, 91.2, 82.5, 80, 55, 41.2, 91.2, 83.8, 41.2],
    "imagePath": "/personalities/portraits/errico-malatesta.jpg",
    "imageAlt": "Retrato de Errico Malatesta"
  },
  {
    "id": "sidney-webb-historiadosindicalismo",
    "titulo": "História do Sindicalismo",
    "autor": "Sidney Webb",
    "autorId": "sidney-webb",
    "ano": 1894,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "História do Sindicalismo é uma obra de Sidney Webb que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler História do Sindicalismo para conhecer os argumentos e o contexto de Sidney Webb e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Hist%C3%B3ria%20do%20Sindicalismo%20Sidney%20Webb",
    "vetor": [23.8, 50, 48.8, 63.8, 72.5, 67.5, 82.5, 81.2, 57.5, 77.5, 55, 57.5],
    "imagePath": "/personalities/portraits/sidney-webb.jpg",
    "imageAlt": "Retrato de Sidney Webb"
  },
  {
    "id": "papa-francisco-laudatosi",
    "titulo": "Laudato Si'",
    "autor": "Papa Francisco",
    "autorId": "papa-francisco",
    "ano": 2015,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Laudato Si' é uma obra de Papa Francisco que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Laudato Si' para conhecer os argumentos e o contexto de Papa Francisco e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Laudato%20Si'%20Papa%20Francisco",
    "vetor": [55, 68.8, 52.5, 76.2, 87.5, 65, 71.2, 66.2, 58.8, 25, 35, 25],
    "imagePath": "/personalities/portraits/papa-francisco.jpg",
    "imageAlt": "Retrato de Papa Francisco"
  },
  {
    "id": "papa-leao-xiii-rerumnovarum",
    "titulo": "Rerum Novarum",
    "autor": "Papa Leão XIII",
    "autorId": "papa-leao-xiii",
    "ano": 1891,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Rerum Novarum é uma obra de Papa Leão XIII que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Rerum Novarum para conhecer os argumentos e o contexto de Papa Leão XIII e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Rerum%20Novarum%20Papa%20Le%C3%A3o%20XIII",
    "vetor": [45, 32.5, 73.8, 37.5, 70, 70, 40, 47.5, 70, 5, 15, 45],
    "imagePath": "/personalities/portraits/papa-leao-xiii.jpg",
    "imageAlt": "Retrato de Papa Leão XIII"
  },
  {
    "id": "tomas-de-aquino-sumateologica",
    "titulo": "Suma Teológica",
    "autor": "Tomás de Aquino",
    "autorId": "tomas-de-aquino",
    "ano": 1274,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Suma Teológica é uma obra de Tomás de Aquino que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Suma Teológica para conhecer os argumentos e o contexto de Tomás de Aquino e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Suma%20Teol%C3%B3gica%20Tom%C3%A1s%20de%20Aquino",
    "vetor": [31.2, 27.5, 65, 36.3, 55, 51.2, 51.2, 52.5, 51.2, 6.2, 13.8, 43.8],
    "imagePath": "/personalities/portraits/tomas-de-aquino.jpg",
    "imageAlt": "Retrato de Tomás de Aquino"
  },
  {
    "id": "jd-vance-eraumavezumsonho",
    "titulo": "Era uma Vez um Sonho",
    "autor": "JD Vance",
    "autorId": "jd-vance",
    "ano": 2016,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Era uma Vez um Sonho é uma obra de JD Vance que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Era uma Vez um Sonho para conhecer os argumentos e o contexto de JD Vance e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Era%20uma%20Vez%20um%20Sonho%20JD%20Vance",
    "vetor": [33.8, 37.5, 56.2, 17.5, 31.2, 57.5, 35, 48.8, 85, 16.2, 11.2, 71.2],
    "imagePath": "/personalities/portraits/jd-vance.jpg",
    "imageAlt": "Retrato de JD Vance"
  },
  {
    "id": "howard-scott-introducaoatecnocracia",
    "titulo": "Introdução à Tecnocracia",
    "autor": "Howard Scott",
    "autorId": "howard-scott",
    "ano": 1933,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Introdução à Tecnocracia é uma obra de Howard Scott que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Introdução à Tecnocracia para conhecer os argumentos e o contexto de Howard Scott e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Introdu%C3%A7%C3%A3o%20%C3%A0%20Tecnocracia%20Howard%20Scott",
    "vetor": [13.8, 27.5, 68.8, 61.2, 71.3, 71.2, 82.5, 90, 73.8, 81.2, 62.5, 81.2],
    "imagePath": "/personalities/portraits/howard-scott.jpg",
    "imageAlt": "Retrato de Howard Scott"
  },
  {
    "id": "james-lovelock-gaiaumnovoolharsobreavidanaterra",
    "titulo": "Gaia: Um Novo Olhar sobre a Vida na Terra",
    "autor": "James Lovelock",
    "autorId": "james-lovelock",
    "ano": 1979,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Gaia: Um Novo Olhar sobre a Vida na Terra é uma obra de James Lovelock que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Gaia: Um Novo Olhar sobre a Vida na Terra para conhecer os argumentos e o contexto de James Lovelock e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Gaia%3A%20Um%20Novo%20Olhar%20sobre%20a%20Vida%20na%20Terra%20James%20Lovelock",
    "vetor": [41.2, 42.5, 48.8, 56.2, 57.5, 55, 48.8, 48.8, 42.5, 63.7, 57.5, 65],
    "imagePath": "/personalities/portraits/james-lovelock.jpg",
    "imageAlt": "Retrato de James Lovelock"
  },
  {
    "id": "benjamin-constant-daliberdadedosantigoscomparadaadosmodernos",
    "titulo": "Da Liberdade dos Antigos Comparada à dos Modernos",
    "autor": "Benjamin Constant",
    "autorId": "benjamin-constant",
    "ano": 1819,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Da Liberdade dos Antigos Comparada à dos Modernos é uma obra de Benjamin Constant que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Da Liberdade dos Antigos Comparada à dos Modernos para conhecer os argumentos e o contexto de Benjamin Constant e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Da%20Liberdade%20dos%20Antigos%20Comparada%20%C3%A0%20dos%20Modernos%20Benjamin%20Constant",
    "vetor": [37.5, 52.5, 22.5, 60, 75, 65, 35, 33.8, 27.5, 57.5, 55, 60],
    "imagePath": "/personalities/portraits/benjamin-constant.jpg",
    "imageAlt": "Retrato de Benjamin Constant"
  },
  {
    "id": "martin-luther-king-jr-porquenaopodemosesperar",
    "titulo": "Por que Não Podemos Esperar",
    "autor": "Martin Luther King Jr.",
    "autorId": "martin-luther-king-jr",
    "ano": 1964,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Por que Não Podemos Esperar é uma obra de Martin Luther King Jr. que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Por que Não Podemos Esperar para conhecer os argumentos e o contexto de Martin Luther King Jr. e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Por%20que%20N%C3%A3o%20Podemos%20Esperar%20Martin%20Luther%20King%20Jr.",
    "vetor": [30, 86.2, 33.8, 73.8, 91.2, 77.5, 77.5, 72.5, 48.8, 27.5, 51.2, 46.2],
    "imagePath": "/personalities/portraits/martin-luther-king-jr.jpg",
    "imageAlt": "Retrato de Martin Luther King Jr."
  },
  {
    "id": "martin-heidegger-seretempo",
    "titulo": "Ser e Tempo",
    "autor": "Martin Heidegger",
    "autorId": "martin-heidegger",
    "ano": 1927,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Ser e Tempo é uma obra de Martin Heidegger que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ser e Tempo para conhecer os argumentos e o contexto de Martin Heidegger e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Ser%20e%20Tempo%20Martin%20Heidegger",
    "vetor": [35, 17.5, 77.5, 13.8, 25, 38.8, 56.2, 63.7, 78.8, 37.5, 27.5, 10],
    "imagePath": "/personalities/portraits/martin-heidegger.jpg",
    "imageAlt": "Retrato de Martin Heidegger"
  },
  {
    "id": "hegel-principiosdafilosofiadodireito",
    "titulo": "Princípios da Filosofia do Direito",
    "autor": "Georg Wilhelm Friedrich Hegel",
    "autorId": "hegel",
    "ano": 1820,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Princípios da Filosofia do Direito é uma obra de Georg Wilhelm Friedrich Hegel que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Princípios da Filosofia do Direito para conhecer os argumentos e o contexto de Georg Wilhelm Friedrich Hegel e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Princ%C3%ADpios%20da%20Filosofia%20do%20Direito%20Georg%20Wilhelm%20Friedrich%20Hegel",
    "vetor": [22.5, 37.5, 60, 30, 25, 32.5, 53.8, 67.5, 67.5, 33.8, 28.7, 68.8],
    "imagePath": "/personalities/portraits/hegel.jpg",
    "imageAlt": "Retrato de Georg Wilhelm Friedrich Hegel"
  },
  {
    "id": "marco-aurelio-meditacoes",
    "titulo": "Meditações",
    "autor": "Marco Aurélio",
    "autorId": "marco-aurelio",
    "ano": 180,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Meditações é uma obra de Marco Aurélio que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Meditações para conhecer os argumentos e o contexto de Marco Aurélio e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Medita%C3%A7%C3%B5es%20Marco%20Aur%C3%A9lio",
    "vetor": [15, 20, 71.2, 72.5, 45, 30, 50, 63.7, 38.8, 33.8, 28.7, 35],
    "imagePath": "/personalities/portraits/marco-aurelio.jpg",
    "imageAlt": "Retrato de Marco Aurélio"
  },
  {
    "id": "agostinho-de-hipona-acidadededeus",
    "titulo": "A Cidade de Deus",
    "autor": "Agostinho de Hipona",
    "autorId": "agostinho-de-hipona",
    "ano": 426,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "A Cidade de Deus é uma obra de Agostinho de Hipona que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Cidade de Deus para conhecer os argumentos e o contexto de Agostinho de Hipona e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=A%20Cidade%20de%20Deus%20Agostinho%20de%20Hipona",
    "vetor": [21.2, 26.2, 78.8, 62.5, 75, 55, 55, 65, 41.2, 8.8, 6.2, 26.2],
    "imagePath": "/personalities/portraits/agostinho-de-hipona.jpg",
    "imageAlt": "Retrato de Agostinho de Hipona"
  },
  {
    "id": "immanuel-kant-apazperpetua",
    "titulo": "À Paz Perpétua",
    "autor": "Immanuel Kant",
    "autorId": "immanuel-kant",
    "ano": 1795,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "À Paz Perpétua é uma obra de Immanuel Kant que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler À Paz Perpétua para conhecer os argumentos e o contexto de Immanuel Kant e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=%C3%80%20Paz%20Perp%C3%A9tua%20Immanuel%20Kant",
    "vetor": [26.2, 48.8, 40, 66.2, 76.2, 78.8, 35, 31.2, 26.2, 70, 33.8, 53.8],
    "imagePath": "/personalities/portraits/immanuel-kant.jpg",
    "imageAlt": "Retrato de Immanuel Kant"
  },
  {
    "id": "david-ricardo-principiosdeeconomiapoliticaetributacao",
    "titulo": "Princípios de Economia Política e Tributação",
    "autor": "David Ricardo",
    "autorId": "david-ricardo",
    "ano": 1817,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Princípios de Economia Política e Tributação é uma obra de David Ricardo que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Princípios de Economia Política e Tributação para conhecer os argumentos e o contexto de David Ricardo e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Princ%C3%ADpios%20de%20Economia%20Pol%C3%ADtica%20e%20Tributa%C3%A7%C3%A3o%20David%20Ricardo",
    "vetor": [75, 77.5, 27.5, 76.2, 78.8, 68.8, 41.2, 31.2, 6.2, 72.5, 30, 52.5],
    "imagePath": "/personalities/portraits/david-ricardo.jpg",
    "imageAlt": "Retrato de David Ricardo"
  },
  {
    "id": "joseph-schumpeter-capitalismosocialismoedemocracia",
    "titulo": "Capitalismo, Socialismo e Democracia",
    "autor": "Joseph Schumpeter",
    "autorId": "joseph-schumpeter",
    "ano": 1942,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Capitalismo, Socialismo e Democracia é uma obra de Joseph Schumpeter que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Capitalismo, Socialismo e Democracia para conhecer os argumentos e o contexto de Joseph Schumpeter e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Capitalismo%2C%20Socialismo%20e%20Democracia%20Joseph%20Schumpeter",
    "vetor": [27.5, 46.2, 50, 32.5, 75, 71.2, 33.8, 30, 26.2, 43.8, 36.2, 72.5],
    "imagePath": "/personalities/portraits/joseph-schumpeter.jpg",
    "imageAlt": "Retrato de Joseph Schumpeter"
  },
  {
    "id": "karl-polanyi-agrandetransformacao",
    "titulo": "A Grande Transformação",
    "autor": "Karl Polanyi",
    "autorId": "karl-polanyi",
    "ano": 1944,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "A Grande Transformação é uma obra de Karl Polanyi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Grande Transformação para conhecer os argumentos e o contexto de Karl Polanyi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=A%20Grande%20Transforma%C3%A7%C3%A3o%20Karl%20Polanyi",
    "vetor": [57.5, 87.5, 38.8, 76.2, 80, 73.8, 83.8, 76.2, 73.8, 56.2, 75, 28.7],
    "imagePath": "/personalities/portraits/karl-polanyi.jpg",
    "imageAlt": "Retrato de Karl Polanyi"
  },
  {
    "id": "friedrich-engels-aorigemdafamiliadapropriedadeprivadaedoestado",
    "titulo": "A Origem da Família, da Propriedade Privada e do Estado",
    "autor": "Friedrich Engels",
    "autorId": "friedrich-engels",
    "ano": 1884,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Origem da Família, da Propriedade Privada e do Estado é uma obra de Friedrich Engels que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Origem da Família, da Propriedade Privada e do Estado para conhecer os argumentos e o contexto de Friedrich Engels e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "marxismo"
    ],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Origem%20da%20Fam%C3%ADlia%2C%20da%20Propriedade%20Privada%20e%20do%20Estado%20Friedrich%20Engels",
    "vetor": [25, 35, 65, 45, 25, 50, 92, 90, 80, 92, 65, 82],
    "imagePath": "/personalities/portraits/friedrich-engels.jpg",
    "imageAlt": "Retrato de Friedrich Engels"
  },
  {
    "id": "carl-menger-principiosdeeconomiapolitica",
    "titulo": "Princípios de Economia Política",
    "autor": "Carl Menger",
    "autorId": "carl-menger",
    "ano": 1871,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Princípios de Economia Política é uma obra de Carl Menger que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Princípios de Economia Política para conhecer os argumentos e o contexto de Carl Menger e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Princ%C3%ADpios%20de%20Economia%20Pol%C3%ADtica%20Carl%20Menger",
    "vetor": [32.5, 47.5, 23.8, 67.5, 51.2, 40, 36.2, 36.2, 23.8, 47.5, 33.8, 62.5],
    "imagePath": "/personalities/portraits/carl-menger.jpg",
    "imageAlt": "Retrato de Carl Menger"
  },
  {
    "id": "henry-ford-minhavidaeminhaobra",
    "titulo": "Minha Vida e Minha Obra",
    "autor": "Henry Ford",
    "autorId": "henry-ford",
    "ano": 1922,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Minha Vida e Minha Obra é uma obra de Henry Ford que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Minha Vida e Minha Obra para conhecer os argumentos e o contexto de Henry Ford e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Minha%20Vida%20e%20Minha%20Obra%20Henry%20Ford",
    "vetor": [51.2, 50, 70, 18.8, 77.5, 65, 27.5, 33.8, 73.8, 21.2, 16.2, 63.7],
    "imagePath": "/personalities/portraits/henry-ford.jpg",
    "imageAlt": "Retrato de Henry Ford"
  },
  {
    "id": "olavo-de-carvalho-ominimoquevoceprecisasaberparanaoserumidiota",
    "titulo": "O Mínimo que Você Precisa Saber para Não Ser um Idiota",
    "autor": "Olavo de Carvalho",
    "autorId": "olavo-de-carvalho",
    "ano": 2013,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "O Mínimo que Você Precisa Saber para Não Ser um Idiota é uma obra de Olavo de Carvalho que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Mínimo que Você Precisa Saber para Não Ser um Idiota para conhecer os argumentos e o contexto de Olavo de Carvalho e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "conservadorismo"
    ],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=O%20M%C3%ADnimo%20que%20Voc%C3%AA%20Precisa%20Saber%20para%20N%C3%A3o%20Ser%20um%20Idiota%20Olavo%20de%20Carvalho",
    "vetor": [35, 60, 70, 15, 65, 25, 40, 40, 45, 10, 10, 50],
    "imagePath": "/personalities/portraits/olavo-de-carvalho.jpg",
    "imageAlt": "Retrato de Olavo de Carvalho"
  },
  {
    "id": "charlie-kirk-adoutrinamaga",
    "titulo": "A Doutrina MAGA",
    "autor": "Charlie Kirk",
    "autorId": "charlie-kirk",
    "ano": 2020,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Doutrina MAGA é uma obra de Charlie Kirk que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Doutrina MAGA para conhecer os argumentos e o contexto de Charlie Kirk e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Doutrina%20MAGA%20Charlie%20Kirk",
    "vetor": [68.8, 68.8, 42.5, 22.5, 36.3, 45, 16.2, 20, 71.2, 7.5, 8.8, 58.8],
    "imagePath": "/personalities/portraits/charlie-kirk.jpg",
    "imageAlt": "Retrato de Charlie Kirk"
  },
  {
    "id": "formacao-economica-do-brasil",
    "titulo": "Formação Econômica do Brasil",
    "autor": "Celso Furtado",
    "autorId": "celso-furtado",
    "ano": 1959,
    "vetor": [35, 85, 60, 45, 35, 30, 82, 65, 55, 50, 55, 65],
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Furtado reconstrói a economia colonial e o café para explicar industrialização e subdesenvolvimento, argumentando que a especialização exportadora e a renda concentrada limitaram a autonomia produtiva do país.",
    "porque": "Clássico da economia brasileira, organiza a discussão sobre atraso, industrialização e dependência. Leia atentando ao diagnóstico estruturalista e às críticas posteriores, que contestam seu tratamento do mercado interno e das escolhas políticas.",
    "ideologias": [
      "desenvolvimentismo"
    ],
    "temas": [
      "subdesenvolvimento",
      "industrialização",
      "café",
      "estruturalismo"
    ],
    "link": "https://openlibrary.org/search?q=Forma%C3%A7%C3%A3o+Econ%C3%B4mica+do+Brasil+Celso+Furtado",
    "imagePath": "/personalities/portraits/celso-furtado.jpg",
    "imageAlt": "Retrato de Celso Furtado"
  },
  {
    "id": "martinho-lutero-daliberdadecrista",
    "titulo": "Da Liberdade Cristã",
    "autor": "Martinho Lutero",
    "autorId": "martinho-lutero",
    "ano": 1520,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Da Liberdade Cristã é uma obra de Martinho Lutero que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Da Liberdade Cristã para conhecer os argumentos e o contexto de Martinho Lutero e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Da%20Liberdade%20Crist%C3%A3%20Martinho%20Lutero",
    "vetor": [70, 26.2, 80, 37.5, 70, 67.5, 50, 57.5, 67.5, 6.2, 12.5, 30],
    "imagePath": "/personalities/portraits/martinho-lutero.jpg",
    "imageAlt": "Retrato de Martinho Lutero"
  },
  {
    "id": "roberto-campos-alanternanapopa",
    "titulo": "A Lanterna na Popa",
    "autor": "Roberto Campos",
    "autorId": "roberto-campos",
    "ano": 1994,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "A Lanterna na Popa é uma obra de Roberto Campos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Lanterna na Popa para conhecer os argumentos e o contexto de Roberto Campos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=A%20Lanterna%20na%20Popa%20Roberto%20Campos",
    "vetor": [35, 31.2, 63.7, 47.5, 50, 30, 21.2, 22.5, 22.5, 55, 33.8, 75],
    "imagePath": "/personalities/portraits/roberto-campos.jpg",
    "imageAlt": "Retrato de Roberto Campos"
  },
  {
    "id": "bresser-pereira-desenvolvimentoecrisenobrasil",
    "titulo": "Desenvolvimento e Crise no Brasil",
    "autor": "Luiz Carlos Bresser-Pereira",
    "autorId": "bresser-pereira",
    "ano": 1968,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Desenvolvimento e Crise no Brasil é uma obra de Luiz Carlos Bresser-Pereira que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Desenvolvimento e Crise no Brasil para conhecer os argumentos e o contexto de Luiz Carlos Bresser-Pereira e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Desenvolvimento%20e%20Crise%20no%20Brasil%20Luiz%20Carlos%20Bresser-Pereira",
    "vetor": [30, 76.2, 38.8, 63.8, 71.3, 57.5, 53.8, 67.5, 48.8, 62.5, 71.2, 66.2],
    "imagePath": "/personalities/portraits/bresser-pereira.jpg",
    "imageAlt": "Retrato de Luiz Carlos Bresser-Pereira"
  },
  {
    "id": "domenico-losurdo-contrahistoriadoliberalismo",
    "titulo": "Contra-História do Liberalismo",
    "autor": "Domenico Losurdo",
    "autorId": "domenico-losurdo",
    "ano": 2005,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Contra-História do Liberalismo é uma obra de Domenico Losurdo que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Contra-História do Liberalismo para conhecer os argumentos e o contexto de Domenico Losurdo e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Contra-Hist%C3%B3ria%20do%20Liberalismo%20Domenico%20Losurdo",
    "vetor": [21.2, 16.2, 85, 63.8, 53.8, 85, 92.5, 90, 70, 91.2, 65, 66.2],
    "imagePath": "/personalities/portraits/domenico-losurdo.jpg",
    "imageAlt": "Retrato de Domenico Losurdo"
  },
  {
    "id": "espinosa-tratadoteologicopolitico",
    "titulo": "Tratado Teológico-Político",
    "autor": "Baruch Espinosa",
    "autorId": "espinosa",
    "ano": 1670,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Tratado Teológico-Político é uma obra de Baruch Espinosa que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Tratado Teológico-Político para conhecer os argumentos e o contexto de Baruch Espinosa e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Tratado%20Teol%C3%B3gico-Pol%C3%ADtico%20Baruch%20Espinosa",
    "vetor": [68.8, 81.2, 27.5, 66.2, 66.2, 70, 33.8, 28.7, 28.7, 83.8, 61.3, 63.7],
    "imagePath": "/personalities/portraits/espinosa.jpg",
    "imageAlt": "Retrato de Baruch Espinosa"
  },
  {
    "id": "mikhail-gorbachev-perestroika",
    "titulo": "Perestroika",
    "autor": "Mikhail Gorbachev",
    "autorId": "mikhail-gorbachev",
    "ano": 1987,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Perestroika é uma obra de Mikhail Gorbachev que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Perestroika para conhecer os argumentos e o contexto de Mikhail Gorbachev e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Perestroika%20Mikhail%20Gorbachev",
    "vetor": [32.5, 71.2, 65, 68.8, 75, 67.5, 70, 67.5, 41.2, 61.3, 42.5, 38.8],
    "imagePath": "/personalities/portraits/mikhail-gorbachev.jpg",
    "imageAlt": "Retrato de Mikhail Gorbachev"
  },
  {
    "id": "max-weber-aeticaprotestanteeoespiritodocapitalismo",
    "titulo": "A Ética Protestante e o Espírito do Capitalismo",
    "autor": "Max Weber",
    "autorId": "max-weber",
    "ano": 1905,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "A Ética Protestante e o Espírito do Capitalismo é uma obra de Max Weber que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Ética Protestante e o Espírito do Capitalismo para conhecer os argumentos e o contexto de Max Weber e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=A%20%C3%89tica%20Protestante%20e%20o%20Esp%C3%ADrito%20do%20Capitalismo%20Max%20Weber",
    "vetor": [26.2, 53.8, 52.5, 33.8, 27.5, 28.7, 40, 40, 70, 73.8, 61.3, 71.2],
    "imagePath": "/personalities/portraits/max-weber.jpg",
    "imageAlt": "Retrato de Max Weber"
  },
  {
    "id": "tony-blair-aterceiravia",
    "titulo": "A Terceira Via",
    "autor": "Tony Blair",
    "autorId": "tony-blair",
    "ano": 1998,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Terceira Via é uma obra de Tony Blair que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Terceira Via para conhecer os argumentos e o contexto de Tony Blair e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Terceira%20Via%20Tony%20Blair",
    "vetor": [33.8, 72.5, 73.8, 60, 30, 30, 48.8, 45, 20, 45, 63.7, 72.5],
    "imagePath": "/personalities/portraits/tony-blair.jpg",
    "imageAlt": "Retrato de Tony Blair"
  },
  {
    "id": "rui-barbosa-oracaoaosmocos",
    "titulo": "Oração aos Moços",
    "autor": "Rui Barbosa",
    "autorId": "rui-barbosa",
    "ano": 1921,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Oração aos Moços é uma obra de Rui Barbosa que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Oração aos Moços para conhecer os argumentos e o contexto de Rui Barbosa e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Ora%C3%A7%C3%A3o%20aos%20Mo%C3%A7os%20Rui%20Barbosa",
    "vetor": [80, 75, 23.8, 67.5, 76.2, 65, 38.8, 50, 61.3, 57.5, 28.7, 65],
    "imagePath": "/personalities/portraits/rui-barbosa.jpg",
    "imageAlt": "Retrato de Rui Barbosa"
  },
  {
    "id": "carlos-lacerda-depoimento",
    "titulo": "Depoimento",
    "autor": "Carlos Lacerda",
    "autorId": "carlos-lacerda",
    "ano": 1977,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Depoimento é uma obra de Carlos Lacerda que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Depoimento para conhecer os argumentos e o contexto de Carlos Lacerda e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Depoimento%20Carlos%20Lacerda",
    "vetor": [52.5, 53.8, 66.2, 32.5, 40, 31.2, 38.8, 32.5, 36.2, 35, 31.2, 70],
    "imagePath": "/personalities/portraits/carlos-lacerda.jpg",
    "imageAlt": "Retrato de Carlos Lacerda"
  },
  {
    "id": "alexandre-de-moraes-direitoconstitucional",
    "titulo": "Direito Constitucional",
    "autor": "Alexandre de Moraes",
    "autorId": "alexandre-de-moraes",
    "ano": 1997,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Direito Constitucional é uma obra de Alexandre de Moraes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Direito Constitucional para conhecer os argumentos e o contexto de Alexandre de Moraes e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Direito%20Constitucional%20Alexandre%20de%20Moraes",
    "vetor": [22.5, 73.8, 72.5, 67.5, 68.8, 60, 52.5, 47.5, 38.8, 57.5, 72.5, 62.5],
    "imagePath": "/personalities/portraits/alexandre-de-moraes.jpg",
    "imageAlt": "Retrato de Alexandre de Moraes"
  },
  {
    "id": "voltaire-tratadosobreatolerancia",
    "titulo": "Tratado sobre a Tolerância",
    "autor": "Voltaire",
    "autorId": "voltaire",
    "ano": 1763,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Tratado sobre a Tolerância é uma obra de Voltaire que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Tratado sobre a Tolerância para conhecer os argumentos e o contexto de Voltaire e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Tratado%20sobre%20a%20Toler%C3%A2ncia%20Voltaire",
    "vetor": [22.5, 25, 27.5, 31.2, 73.8, 72.5, 30, 30, 25, 80, 62.5, 67.5],
    "imagePath": "/personalities/portraits/voltaire.jpg",
    "imageAlt": "Retrato de Voltaire"
  },
  {
    "id": "dostoievski-osdemonios",
    "titulo": "Os Demônios",
    "autor": "Fiódor Dostoiévski",
    "autorId": "dostoievski",
    "ano": 1872,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Os Demônios é uma obra de Fiódor Dostoiévski que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Demônios para conhecer os argumentos e o contexto de Fiódor Dostoiévski e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Dem%C3%B4nios%20Fi%C3%B3dor%20Dostoi%C3%A9vski",
    "vetor": [33.8, 23.8, 52.5, 21.2, 20, 15, 58.8, 65, 73.8, 0, 11.2, 18.8],
    "imagePath": "/personalities/portraits/dostoievski.jpg",
    "imageAlt": "Retrato de Fiódor Dostoiévski"
  },
  {
    "id": "pedagogia-do-oprimido",
    "titulo": "Pedagogia do Oprimido",
    "autor": "Paulo Freire",
    "autorId": "paulo-freire",
    "ano": 1968,
    "vetor": [60, 90, 30, 80, 5, 80, 70, 50, 45, 65, 90, 60],
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Freire critica a educação bancária e propõe uma pedagogia dialógica em que educador e educando aprendem juntos, tomando a alfabetização como leitura crítica do mundo e prática de liberdade.",
    "porque": "Influenciou a educação popular na América Latina e em movimentos de base pelo mundo. O texto é engajado e situado; leia comparando suas propostas com experiências escolares e com debates sobre método, autoridade e avaliação.",
    "ideologias": [
      "socialismo-democratico"
    ],
    "temas": [
      "educação",
      "diálogo",
      "opressão",
      "conscientização"
    ],
    "link": "https://openlibrary.org/search?q=Pedagogia+do+Oprimido+Paulo+Freire",
    "imagePath": "/personalities/portraits/paulo-freire.jpg",
    "imageAlt": "Retrato de Paulo Freire"
  },
  {
    "id": "john-c-calhoun-umadisquisicaosobreogoverno",
    "titulo": "Uma Disquisição sobre o Governo",
    "autor": "John C. Calhoun",
    "autorId": "john-c-calhoun",
    "ano": 1851,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Uma Disquisição sobre o Governo é uma obra de John C. Calhoun que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Uma Disquisição sobre o Governo para conhecer os argumentos e o contexto de John C. Calhoun e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Uma%20Disquisi%C3%A7%C3%A3o%20sobre%20o%20Governo%20John%20C.%20Calhoun",
    "vetor": [90, 43.8, 50, 11.2, 31.2, 35, 17.5, 20, 16.2, 32.5, 5, 45],
    "imagePath": "/personalities/portraits/john-c-calhoun.jpg",
    "imageAlt": "Retrato de John C. Calhoun"
  },
  {
    "id": "jefferson-davis-ascensaoequedadogovernoconfederado",
    "titulo": "Ascensão e Queda do Governo Confederado",
    "autor": "Jefferson Davis",
    "autorId": "jefferson-davis",
    "ano": 1881,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Ascensão e Queda do Governo Confederado é uma obra de Jefferson Davis que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ascensão e Queda do Governo Confederado para conhecer os argumentos e o contexto de Jefferson Davis e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Ascens%C3%A3o%20e%20Queda%20do%20Governo%20Confederado%20Jefferson%20Davis",
    "vetor": [87.5, 41.2, 60, 15, 20, 25, 25, 26.2, 20, 17.5, 3.8, 48.8],
    "imagePath": "/personalities/portraits/jefferson-davis.jpg",
    "imageAlt": "Retrato de Jefferson Davis"
  },
  {
    "id": "thomas-muntzer-sermaoaosprincipes",
    "titulo": "Sermão aos Príncipes",
    "autor": "Thomas Müntzer",
    "autorId": "thomas-muntzer",
    "ano": 1524,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Sermão aos Príncipes é uma obra de Thomas Müntzer que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sermão aos Príncipes para conhecer os argumentos e o contexto de Thomas Müntzer e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Serm%C3%A3o%20aos%20Pr%C3%ADncipes%20Thomas%20M%C3%BCntzer",
    "vetor": [75, 50, 73.8, 45, 21.2, 28.7, 87.5, 76.2, 78.8, 8.8, 17.5, 18.8],
    "imagePath": "/personalities/portraits/thomas-muntzer.jpg",
    "imageAlt": "Retrato de Thomas Müntzer"
  },
  {
    "id": "getulio-vargas-anovapoliticadobrasil",
    "titulo": "A Nova Política do Brasil",
    "autor": "Getúlio Vargas",
    "autorId": "getulio-vargas",
    "ano": 1938,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Nova Política do Brasil é uma obra de Getúlio Vargas que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Nova Política do Brasil para conhecer os argumentos e o contexto de Getúlio Vargas e relacioná-los aos debates políticos atuais.",
    "ideologias": [
      "trabalhismo"
    ],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Nova%20Pol%C3%ADtica%20do%20Brasil%20Get%C3%BAlio%20Vargas",
    "vetor": [40, 60, 75, 30, 40, 35, 75, 65, 60, 45, 40, 55],
    "imagePath": "/personalities/portraits/getulio-vargas.jpg",
    "imageAlt": "Retrato de Getúlio Vargas"
  },
  {
    "id": "reza-pahlavi-windsofchangethefutureofdemocracyiniran",
    "titulo": "Winds of Change: The Future of Democracy in Iran",
    "autor": "Reza Pahlavi",
    "autorId": "reza-pahlavi",
    "ano": 2002,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Winds of Change: The Future of Democracy in Iran é uma obra de Reza Pahlavi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Winds of Change: The Future of Democracy in Iran para conhecer os argumentos e o contexto de Reza Pahlavi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Winds%20of%20Change%3A%20The%20Future%20of%20Democracy%20in%20Iran%20Reza%20Pahlavi",
    "vetor": [28.3, 70.4, 43.7, 61, 37.9, 29.1, 47.2, 40.2, 29.4, 66.7, 66.9, 59.5],
    "imagePath": "/personalities/portraits/reza-pahlavi.jpg",
    "imageAlt": "Retrato de Reza Pahlavi"
  },
  {
    "id": "mohammad-reza-pahlavi-answertohistory",
    "titulo": "Answer to History",
    "autor": "Mohammad Reza Pahlavi",
    "autorId": "mohammad-reza-pahlavi",
    "ano": 1980,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Answer to History é uma obra de Mohammad Reza Pahlavi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Answer to History para conhecer os argumentos e o contexto de Mohammad Reza Pahlavi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Answer%20to%20History%20Mohammad%20Reza%20Pahlavi",
    "vetor": [8, 9, 95.7, 43.3, 30.5, 24.5, 37.5, 82.6, 61, 38.4, 39.3, 71.3],
    "imagePath": "/personalities/portraits/mohammad-reza-pahlavi.jpg",
    "imageAlt": "Retrato de Mohammad Reza Pahlavi"
  },
  {
    "id": "gamal-abdel-nasser-afilosofiadarevolucao",
    "titulo": "A Filosofia da Revolução",
    "autor": "Gamal Abdel Nasser",
    "autorId": "gamal-abdel-nasser",
    "ano": 1954,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Filosofia da Revolução é uma obra de Gamal Abdel Nasser que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Filosofia da Revolução para conhecer os argumentos e o contexto de Gamal Abdel Nasser e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Filosofia%20da%20Revolu%C3%A7%C3%A3o%20Gamal%20Abdel%20Nasser",
    "vetor": [9.2, 29.3, 89.8, 36.7, 32.9, 22.1, 90.5, 92.4, 83.6, 46.4, 39.1, 72.5],
    "imagePath": "/personalities/portraits/gamal-abdel-nasser.jpg",
    "imageAlt": "Retrato de Gamal Abdel Nasser"
  },
  {
    "id": "ernst-junger-otrabalhadordominioefigura",
    "titulo": "O Trabalhador: Domínio e Figura",
    "autor": "Ernst Jünger",
    "autorId": "ernst-junger",
    "ano": 1932,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "O Trabalhador: Domínio e Figura é uma obra de Ernst Jünger que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Trabalhador: Domínio e Figura para conhecer os argumentos e o contexto de Ernst Jünger e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=O%20Trabalhador%3A%20Dom%C3%ADnio%20e%20Figura%20Ernst%20J%C3%BCnger",
    "vetor": [25.6, 34, 29.3, 41, 31.7, 32.9, 61.3, 73.1, 70.5, 58.7, 54.8, 47.6],
    "imagePath": "/personalities/portraits/ernst-junger.jpg",
    "imageAlt": "Retrato de Ernst Jünger"
  },
  {
    "id": "oswald-spengler-prussianismoesocialismo",
    "titulo": "Prussianismo e Socialismo",
    "autor": "Oswald Spengler",
    "autorId": "oswald-spengler",
    "ano": 1919,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Prussianismo e Socialismo é uma obra de Oswald Spengler que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Prussianismo e Socialismo para conhecer os argumentos e o contexto de Oswald Spengler e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Prussianismo%20e%20Socialismo%20Oswald%20Spengler",
    "vetor": [25.6, 15, 73.3, 30.2, 13.8, 15, 42.4, 75.4, 74.4, 64.6, 25, 35.7],
    "imagePath": "/personalities/portraits/oswald-spengler.jpg",
    "imageAlt": "Retrato de Oswald Spengler"
  },
  {
    "id": "muhammad-abduh-risalataltawhid",
    "titulo": "Risalat al-Tawhid",
    "autor": "Muhammad Abduh",
    "autorId": "muhammad-abduh",
    "ano": 1897,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Risalat al-Tawhid é uma obra de Muhammad Abduh que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Risalat al-Tawhid para conhecer os argumentos e o contexto de Muhammad Abduh e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Risalat%20al-Tawhid%20Muhammad%20Abduh",
    "vetor": [27.1, 58.5, 67.5, 51.9, 58.1, 66, 55.6, 64, 46, 8, 20.6, 58.2],
    "imagePath": "/personalities/portraits/muhammad-abduh.jpg",
    "imageAlt": "Retrato de Muhammad Abduh"
  },
  {
    "id": "sayyid-qutb-justicasocialnoisla",
    "titulo": "Justiça Social no Islã",
    "autor": "Sayyid Qutb",
    "autorId": "sayyid-qutb",
    "ano": 1949,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Justiça Social no Islã é uma obra de Sayyid Qutb que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Justiça Social no Islã para conhecer os argumentos e o contexto de Sayyid Qutb e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Justi%C3%A7a%20Social%20no%20Isl%C3%A3%20Sayyid%20Qutb",
    "vetor": [23.2, 35.2, 72.1, 33, 18.6, 29.3, 66.7, 66.2, 65.7, 4.5, 11.3, 50],
    "imagePath": "/personalities/portraits/sayyid-qutb.jpg",
    "imageAlt": "Retrato de Sayyid Qutb"
  },
  {
    "id": "averroes-discursodecisivo",
    "titulo": "Discurso Decisivo",
    "autor": "Averróis",
    "autorId": "averroes",
    "ano": 1179,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Discurso Decisivo é uma obra de Averróis que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Discurso Decisivo para conhecer os argumentos e o contexto de Averróis e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Discurso%20Decisivo%20Averr%C3%B3is",
    "vetor": [25.6, 40, 67.4, 48.3, 45, 36.3, 61.5, 70, 42.5, 12.7, 23, 53.6],
    "imagePath": "/personalities/portraits/averroes.jpg",
    "imageAlt": "Retrato de Averróis"
  },
  {
    "id": "david-ben-gurion-rebirthanddestinyofisrael",
    "titulo": "Rebirth and Destiny of Israel",
    "autor": "David Ben-Gurion",
    "autorId": "david-ben-gurion",
    "ano": 1954,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Rebirth and Destiny of Israel é uma obra de David Ben-Gurion que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Rebirth and Destiny of Israel para conhecer os argumentos e o contexto de David Ben-Gurion e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Rebirth%20and%20Destiny%20of%20Israel%20David%20Ben-Gurion",
    "vetor": [17.6, 68, 71, 20.7, 17.4, 19.8, 78.6, 80.5, 64.5, 52.7, 42.9, 79.6],
    "imagePath": "/personalities/portraits/david-ben-gurion.jpg",
    "imageAlt": "Retrato de David Ben-Gurion"
  },
  {
    "id": "albert-camus-ohomemrevoltado",
    "titulo": "O Homem Revoltado",
    "autor": "Albert Camus",
    "autorId": "albert-camus",
    "ano": 1951,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Homem Revoltado é uma obra de Albert Camus que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Homem Revoltado para conhecer os argumentos e o contexto de Albert Camus e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Homem%20Revoltado%20Albert%20Camus",
    "vetor": [66.4, 88.2, 24.6, 81.2, 76, 57.7, 76.2, 67.4, 31.2, 78.6, 71.7, 33.3],
    "imagePath": "/personalities/portraits/albert-camus.jpg",
    "imageAlt": "Retrato de Albert Camus"
  },
  {
    "id": "abraham-isaac-kook-orot",
    "titulo": "Orot",
    "autor": "Abraham Isaac Kook",
    "autorId": "abraham-isaac-kook",
    "ano": 1920,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Orot é uma obra de Abraham Isaac Kook que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Orot para conhecer os argumentos e o contexto de Abraham Isaac Kook e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Orot%20Abraham%20Isaac%20Kook",
    "vetor": [37.9, 53.7, 50.8, 37.8, 67.6, 57.7, 67.9, 67.4, 56.2, 4.5, 20.8, 46.4],
    "imagePath": "/personalities/portraits/abraham-isaac-kook.jpg",
    "imageAlt": "Retrato de Abraham Isaac Kook"
  },
  {
    "id": "auguste-blanqui-critiquesociale",
    "titulo": "Critique sociale",
    "autor": "Louis Auguste Blanqui",
    "autorId": "auguste-blanqui",
    "ano": 1885,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Critique sociale é uma obra de Louis Auguste Blanqui que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Critique sociale para conhecer os argumentos e o contexto de Louis Auguste Blanqui e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Critique%20sociale%20Louis%20Auguste%20Blanqui",
    "vetor": [19.9, 41.2, 32.6, 58.6, 19.8, 38.8, 87.7, 77, 66.9, 98.8, 61, 77.2],
    "imagePath": "/personalities/portraits/auguste-blanqui.jpg",
    "imageAlt": "Retrato de Louis Auguste Blanqui"
  },
  {
    "id": "mark-carney-values",
    "titulo": "Value(s)",
    "autor": "Mark Carney",
    "autorId": "mark-carney",
    "ano": 2021,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Value(s) é uma obra de Mark Carney que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Value(s) para conhecer os argumentos e o contexto de Mark Carney e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Value(s)%20Mark%20Carney",
    "vetor": [45, 79.9, 44.9, 61, 49.5, 36.4, 47.2, 40.2, 43.7, 59.5, 74, 65.5],
    "imagePath": "/personalities/portraits/mark-carney.jpg",
    "imageAlt": "Retrato de Mark Carney"
  },
  {
    "id": "jimmy-carter-ourendangeredvalues",
    "titulo": "Our Endangered Values",
    "autor": "Jimmy Carter",
    "autorId": "jimmy-carter",
    "ano": 2005,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Our Endangered Values é uma obra de Jimmy Carter que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Our Endangered Values para conhecer os argumentos e o contexto de Jimmy Carter e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Our%20Endangered%20Values%20Jimmy%20Carter",
    "vetor": [64, 81.1, 38.9, 62.9, 60.5, 36.3, 53.2, 49.7, 29.4, 35.7, 47.5, 33.3],
    "imagePath": "/personalities/portraits/jimmy-carter.jpg",
    "imageAlt": "Retrato de Jimmy Carter"
  },
  {
    "id": "olaf-scholz-hoffnungsland",
    "titulo": "Hoffnungsland",
    "autor": "Olaf Scholz",
    "autorId": "olaf-scholz",
    "ano": 2017,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Hoffnungsland é uma obra de Olaf Scholz que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Hoffnungsland para conhecer os argumentos e o contexto de Olaf Scholz e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Hoffnungsland%20Olaf%20Scholz",
    "vetor": [49.8, 82.3, 58, 57.4, 60.5, 42.2, 66.3, 60.4, 28.2, 69, 77.6, 48.8],
    "imagePath": "/personalities/portraits/olaf-scholz.jpg",
    "imageAlt": "Retrato de Olaf Scholz"
  },
  {
    "id": "boris-johnson-unleashed",
    "titulo": "Unleashed",
    "autor": "Boris Johnson",
    "autorId": "boris-johnson",
    "ano": 2024,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Unleashed é uma obra de Boris Johnson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Unleashed para conhecer os argumentos e o contexto de Boris Johnson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Unleashed%20Boris%20Johnson",
    "vetor": [29.5, 75.1, 48.4, 48.1, 35.2, 15, 48.4, 49.7, 21, 52.9, 62.1, 73.7],
    "imagePath": "/personalities/portraits/boris-johnson.jpg",
    "imageAlt": "Retrato de Boris Johnson"
  },
  {
    "id": "pedro-sanchez-manualderesistencia",
    "titulo": "Manual de resistência",
    "autor": "Pedro Sánchez",
    "autorId": "pedro-sanchez",
    "ano": 2019,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Manual de resistência é uma obra de Pedro Sánchez que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Manual de resistência para conhecer os argumentos e o contexto de Pedro Sánchez e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Manual%20de%20resist%C3%AAncia%20Pedro%20S%C3%A1nchez",
    "vetor": [46.2, 74, 50.8, 74, 73.6, 51.8, 66.3, 71.1, 37.7, 77.4, 83.6, 61.9],
    "imagePath": "/personalities/portraits/pedro-sanchez.jpg",
    "imageAlt": "Retrato de Pedro Sánchez"
  },
  {
    "id": "guilherme-ii-da-alemanha-ereignisseundgestaltenausdenjahren18781918",
    "titulo": "Ereignisse und Gestalten aus den Jahren 1878–1918",
    "autor": "Guilherme II da Alemanha",
    "autorId": "guilherme-ii-da-alemanha",
    "ano": 1922,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Ereignisse und Gestalten aus den Jahren 1878–1918 é uma obra de Guilherme II da Alemanha que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ereignisse und Gestalten aus den Jahren 1878–1918 para conhecer os argumentos e o contexto de Guilherme II da Alemanha e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Ereignisse%20und%20Gestalten%20aus%20den%20Jahren%201878%E2%80%931918%20Guilherme%20II%20da%20Alemanha",
    "vetor": [19.7, 9, 84, 8, 7.9, 11.4, 57.8, 75.5, 78.8, 11.7, 7.7, 72.5],
    "imagePath": "/personalities/portraits/guilherme-ii-da-alemanha.jpg",
    "imageAlt": "Retrato de Guilherme II da Alemanha"
  },
  {
    "id": "desmond-tutu-semperdaonaohafuturo",
    "titulo": "Sem perdão não há futuro",
    "autor": "Desmond Tutu",
    "autorId": "desmond-tutu",
    "ano": 1999,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "Sem perdão não há futuro é uma obra de Desmond Tutu que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sem perdão não há futuro para conhecer os argumentos e o contexto de Desmond Tutu e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=Sem%20perd%C3%A3o%20n%C3%A3o%20h%C3%A1%20futuro%20Desmond%20Tutu",
    "vetor": [42.6, 93, 36.5, 89, 90.2, 47, 82.2, 74.6, 46.7, 39.3, 74.9, 35.7],
    "imagePath": "/personalities/portraits/desmond-tutu.jpg",
    "imageAlt": "Retrato de Desmond Tutu"
  },
  {
    "id": "russell-kirk-amentalidadeconservadoradeedmundburkeatseliot",
    "titulo": "A mentalidade conservadora: de Edmund Burke a T. S. Eliot",
    "autor": "Russell Kirk",
    "autorId": "russell-kirk",
    "ano": 1953,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "A mentalidade conservadora: de Edmund Burke a T. S. Eliot é uma obra de Russell Kirk que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A mentalidade conservadora: de Edmund Burke a T. S. Eliot para conhecer os argumentos e o contexto de Russell Kirk e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=A%20mentalidade%20conservadora%3A%20de%20Edmund%20Burke%20a%20T.%20S.%20Eliot%20Russell%20Kirk",
    "vetor": [78.3, 69.2, 49.6, 49.5, 66.9, 55, 37.7, 29.5, 58, 15.1, 13.4, 22.9],
    "imagePath": "/personalities/portraits/russell-kirk.jpg",
    "imageAlt": "Retrato de Russell Kirk"
  },
  {
    "id": "nikita-khrushchev-khrushchevremembers",
    "titulo": "Khrushchev Remembers",
    "autor": "Nikita Khrushchev",
    "autorId": "nikita-khrushchev",
    "ano": 1970,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Khrushchev Remembers é uma obra de Nikita Khrushchev que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Khrushchev Remembers para conhecer os argumentos e o contexto de Nikita Khrushchev e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Khrushchev%20Remembers%20Nikita%20Khrushchev",
    "vetor": [37.8, 40, 85, 59.8, 41.4, 20.8, 90.1, 90.1, 77.6, 97.6, 32.4, 73.7],
    "imagePath": "/personalities/portraits/nikita-khrushchev.jpg",
    "imageAlt": "Retrato de Nikita Khrushchev"
  },
  {
    "id": "sigmund-freud-omalestarnacivilizacao",
    "titulo": "O mal-estar na civilização",
    "autor": "Sigmund Freud",
    "autorId": "sigmund-freud",
    "ano": 1930,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "O mal-estar na civilização é uma obra de Sigmund Freud que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O mal-estar na civilização para conhecer os argumentos e o contexto de Sigmund Freud e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=O%20mal-estar%20na%20civiliza%C3%A7%C3%A3o%20Sigmund%20Freud",
    "vetor": [47.4, 66.8, 40.1, 72.9, 74.8, 58.9, 63.9, 52.1, 43.7, 89.3, 56.2, 57.1],
    "imagePath": "/personalities/portraits/sigmund-freud.jpg",
    "imageAlt": "Retrato de Sigmund Freud"
  },
  {
    "id": "jean-paul-marat-ascadeiasdaescravidao",
    "titulo": "As cadeias da escravidão",
    "autor": "Jean-Paul Marat",
    "autorId": "jean-paul-marat",
    "ano": 1774,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "As cadeias da escravidão é uma obra de Jean-Paul Marat que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler As cadeias da escravidão para conhecer os argumentos e o contexto de Jean-Paul Marat e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=As%20cadeias%20da%20escravid%C3%A3o%20Jean-Paul%20Marat",
    "vetor": [42.6, 71.6, 63.9, 65.7, 53.8, 56.2, 71, 65.2, 52, 41.7, 32.4, 59.4],
    "imagePath": "/personalities/portraits/jean-paul-marat.jpg",
    "imageAlt": "Retrato de Jean-Paul Marat"
  },
  {
    "id": "grigory-zinoviev-leninismointroducaoaoestudodoleninismo",
    "titulo": "Leninismo: introdução ao estudo do leninismo",
    "autor": "Grigory Zinoviev",
    "autorId": "grigory-zinoviev",
    "ano": 1925,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Leninismo: introdução ao estudo do leninismo é uma obra de Grigory Zinoviev que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Leninismo: introdução ao estudo do leninismo para conhecer os argumentos e o contexto de Grigory Zinoviev e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Leninismo%3A%20introdu%C3%A7%C3%A3o%20ao%20estudo%20do%20leninismo%20Grigory%20Zinoviev",
    "vetor": [28.2, 36.4, 81.4, 81.2, 38.8, 42.4, 93.7, 91.3, 71.7, 97.6, 64.5, 79.6],
    "imagePath": "/personalities/portraits/grigory-zinoviev.jpg",
    "imageAlt": "Retrato de Grigory Zinoviev"
  },
  {
    "id": "dante-alighieri-damonarquia",
    "titulo": "Da Monarquia",
    "autor": "Dante Alighieri",
    "autorId": "dante-alighieri",
    "ano": 1313,
    "area": "vida-intelectual",
    "dificuldade": "avancado",
    "resumo": "Da Monarquia é uma obra de Dante Alighieri que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Da Monarquia para conhecer os argumentos e o contexto de Dante Alighieri e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Da%20Monarquia%20Dante%20Alighieri",
    "vetor": [56.8, 28.1, 66, 47.1, 60.5, 48.2, 49.6, 65.2, 41.3, 21, 18.2, 42.9],
    "imagePath": "/personalities/portraits/dante-alighieri.jpg",
    "imageAlt": "Retrato de Dante Alighieri"
  },
  {
    "id": "seneca-sobreaclemencia",
    "titulo": "Sobre a clemência",
    "autor": "Sêneca",
    "autorId": "seneca",
    "ano": 55,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Sobre a clemência é uma obra de Sêneca que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sobre a clemência para conhecer os argumentos e o contexto de Sêneca e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Sobre%20a%20clem%C3%AAncia%20S%C3%AAneca",
    "vetor": [29.2, 42.4, 29.3, 71, 65.2, 36.3, 52, 56.9, 40.1, 35.3, 39.6, 29.8],
    "imagePath": "/personalities/portraits/seneca.jpg",
    "imageAlt": "Retrato de Sêneca"
  },
  {
    "id": "oliver-cromwell-olivercromwellslettersandspeeches",
    "titulo": "Oliver Cromwell's Letters and Speeches",
    "autor": "Oliver Cromwell",
    "autorId": "oliver-cromwell",
    "ano": 1845,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Oliver Cromwell's Letters and Speeches é uma obra de Oliver Cromwell que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Oliver Cromwell's Letters and Speeches para conhecer os argumentos e o contexto de Oliver Cromwell e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Oliver%20Cromwell's%20Letters%20and%20Speeches%20Oliver%20Cromwell",
    "vetor": [48.5, 40, 55.2, 46.1, 54.3, 48.3, 49.4, 57.6, 62.1, 29.5, 45.8, 53.6],
    "imagePath": "/personalities/portraits/oliver-cromwell.jpg",
    "imageAlt": "Retrato de Oliver Cromwell"
  },
  {
    "id": "fernando-haddad-capitalismosuperindustrialcaminhosdiversosdestinocomum",
    "titulo": "Capitalismo superindustrial: caminhos diversos, destino comum",
    "autor": "Fernando Haddad",
    "autorId": "fernando-haddad",
    "ano": 2026,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Capitalismo superindustrial: caminhos diversos, destino comum é uma obra de Fernando Haddad que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Capitalismo superindustrial: caminhos diversos, destino comum para conhecer os argumentos e o contexto de Fernando Haddad e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Capitalismo%20superindustrial%3A%20caminhos%20diversos%2C%20destino%20comum%20Fernando%20Haddad",
    "vetor": [52.1, 79.9, 46, 66.9, 74.8, 44.6, 70.3, 72.2, 57.4, 70.2, 76.4, 60.7],
    "imagePath": "/personalities/portraits/fernando-haddad.jpg",
    "imageAlt": "Retrato de Fernando Haddad"
  },
  {
    "id": "luiz-felipe-ponde-guiapoliticamenteincorretodafilosofia",
    "titulo": "Guia politicamente incorreto da filosofia",
    "autor": "Luiz Felipe Pondé",
    "autorId": "luiz-felipe-ponde",
    "ano": 2012,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Guia politicamente incorreto da filosofia é uma obra de Luiz Felipe Pondé que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Guia politicamente incorreto da filosofia para conhecer os argumentos e o contexto de Luiz Felipe Pondé e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Guia%20politicamente%20incorreto%20da%20filosofia%20Luiz%20Felipe%20Pond%C3%A9",
    "vetor": [58.1, 90.6, 35.3, 56.4, 70, 62.5, 30.6, 24.7, 24.6, 63.4, 46.4, 45.2],
    "imagePath": "/personalities/portraits/luiz-felipe-ponde.jpg",
    "imageAlt": "Retrato de Luiz Felipe Pondé"
  },
  {
    "id": "mark-fisher-realismocapitalistaemaisfacilimaginarofimdomundodoqueofimdocapitalismo",
    "titulo": "Realismo capitalista: É mais fácil imaginar o fim do mundo do que o fim do capitalismo?",
    "autor": "Mark Fisher",
    "autorId": "mark-fisher",
    "ano": 2009,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Realismo capitalista: É mais fácil imaginar o fim do mundo do que o fim do capitalismo? é uma obra de Mark Fisher que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Realismo capitalista: É mais fácil imaginar o fim do mundo do que o fim do capitalismo? para conhecer os argumentos e o contexto de Mark Fisher e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Realismo%20capitalista%3A%20%C3%89%20mais%20f%C3%A1cil%20imaginar%20o%20fim%20do%20mundo%20do%20que%20o%20fim%20do%20capitalismo%3F%20Mark%20Fisher",
    "vetor": [56.9, 91.8, 19.9, 87.1, 86.7, 76.8, 83.4, 73.4, 64.5, 82.1, 84.8, 42.9],
    "imagePath": "/personalities/portraits/mark-fisher.jpg",
    "imageAlt": "Retrato de Mark Fisher"
  },
  {
    "id": "alex-williams-inventarofuturo",
    "titulo": "Inventar o Futuro",
    "autor": "Alex Williams",
    "autorId": "alex-williams",
    "ano": 2015,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Inventar o Futuro é uma obra de Alex Williams que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Inventar o Futuro para conhecer os argumentos e o contexto de Alex Williams e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Inventar%20o%20Futuro%20Alex%20Williams",
    "vetor": [27.1, 84.7, 25.8, 86, 70, 66, 94.1, 85.3, 40.7, 84.5, 70.5, 79.6],
    "imagePath": "/personalities/portraits/alex-williams.jpg",
    "imageAlt": "Retrato de Alex Williams"
  },
  {
    "id": "enrico-berlinguer-austeritaoccasionepertrasformarelitalia",
    "titulo": "Austerità, occasione per trasformare l'Italia",
    "autor": "Enrico Berlinguer",
    "autorId": "enrico-berlinguer",
    "ano": 1977,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Austerità, occasione per trasformare l'Italia é uma obra de Enrico Berlinguer que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Austerità, occasione per trasformare l'Italia para conhecer os argumentos e o contexto de Enrico Berlinguer e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Austerit%C3%A0%2C%20occasione%20per%20trasformare%20l'Italia%20Enrico%20Berlinguer",
    "vetor": [41.4, 88.2, 43.7, 64.5, 72.4, 66, 75, 74.6, 51.4, 66.7, 61, 48.8],
    "imagePath": "/personalities/portraits/enrico-berlinguer.jpg",
    "imageAlt": "Retrato de Enrico Berlinguer"
  },
  {
    "id": "pier-paolo-pasolini-escritoscorsarios",
    "titulo": "Escritos Corsários",
    "autor": "Pier Paolo Pasolini",
    "autorId": "pier-paolo-pasolini",
    "ano": 1975,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Escritos Corsários é uma obra de Pier Paolo Pasolini que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Escritos Corsários para conhecer os argumentos e o contexto de Pier Paolo Pasolini e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Escritos%20Cors%C3%A1rios%20Pier%20Paolo%20Pasolini",
    "vetor": [61.7, 84.7, 27, 73.3, 81.8, 71, 82.2, 75.8, 72.9, 52, 55.1, 16.9],
    "imagePath": "/personalities/portraits/pier-paolo-pasolini.jpg",
    "imageAlt": "Retrato de Pier Paolo Pasolini"
  },
  {
    "id": "per-albin-hansson-demokratitalochuppsatser",
    "titulo": "Demokrati: tal och uppsatser",
    "autor": "Per Albin Hansson",
    "autorId": "per-albin-hansson",
    "ano": 1935,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Demokrati: tal och uppsatser é uma obra de Per Albin Hansson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Demokrati: tal och uppsatser para conhecer os argumentos e o contexto de Per Albin Hansson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Demokrati%3A%20tal%20och%20uppsatser%20Per%20Albin%20Hansson",
    "vetor": [33.1, 74, 52, 41, 66.9, 64.5, 66.3, 75.9, 60.3, 69.4, 29.8, 64.1],
    "imagePath": "/personalities/portraits/per-albin-hansson.jpg",
    "imageAlt": "Retrato de Per Albin Hansson"
  },
  {
    "id": "kalevi-sorsa-kansanvallankysymyksia",
    "titulo": "Kansanvallan kysymyksiä",
    "autor": "Kalevi Sorsa",
    "autorId": "kalevi-sorsa",
    "ano": 1974,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Kansanvallan kysymyksiä é uma obra de Kalevi Sorsa que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Kansanvallan kysymyksiä para conhecer os argumentos e o contexto de Kalevi Sorsa e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Kansanvallan%20kysymyksi%C3%A4%20Kalevi%20Sorsa",
    "vetor": [40.2, 82.3, 50.8, 64.5, 73.6, 69.6, 75.8, 68.8, 47.2, 70.2, 63.3, 53.6],
    "imagePath": "/personalities/portraits/kalevi-sorsa.jpg",
    "imageAlt": "Retrato de Kalevi Sorsa"
  },
  {
    "id": "tage-erlander-tageerlander19401949",
    "titulo": "Tage Erlander 1940–1949",
    "autor": "Tage Erlander",
    "autorId": "tage-erlander",
    "ano": 1973,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Tage Erlander 1940–1949 é uma obra de Tage Erlander que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Tage Erlander 1940–1949 para conhecer os argumentos e o contexto de Tage Erlander e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Tage%20Erlander%201940%E2%80%931949%20Tage%20Erlander",
    "vetor": [30.7, 77.5, 53.2, 57.4, 55, 63.3, 77, 71.1, 29.4, 70.2, 52.6, 64.1],
    "imagePath": "/personalities/portraits/tage-erlander.jpg",
    "imageAlt": "Retrato de Tage Erlander"
  },
  {
    "id": "einar-gerhardsen-tillitsmannen",
    "titulo": "Tillitsmannen",
    "autor": "Einar Gerhardsen",
    "autorId": "einar-gerhardsen",
    "ano": 1931,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Tillitsmannen é uma obra de Einar Gerhardsen que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Tillitsmannen para conhecer os argumentos e o contexto de Einar Gerhardsen e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Tillitsmannen%20Einar%20Gerhardsen",
    "vetor": [29.5, 74, 60.3, 55, 59, 42.4, 82.2, 84.1, 55, 70.2, 38.3, 65.3],
    "imagePath": "/personalities/portraits/einar-gerhardsen.jpg",
    "imageAlt": "Retrato de Einar Gerhardsen"
  },
  {
    "id": "gosta-rehn-fullsysselsattningutaninflationskrifteriurval",
    "titulo": "Full sysselsättning utan inflation: skrifter i urval",
    "autor": "Gösta Rehn",
    "autorId": "gosta-rehn",
    "ano": 1988,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Full sysselsättning utan inflation: skrifter i urval é uma obra de Gösta Rehn que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Full sysselsättning utan inflation: skrifter i urval para conhecer os argumentos e o contexto de Gösta Rehn e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Full%20syssels%C3%A4ttning%20utan%20inflation%3A%20skrifter%20i%20urval%20G%C3%B6sta%20Rehn",
    "vetor": [52.1, 76.3, 35.3, 68.1, 74.8, 57.7, 73.4, 58, 23.4, 71.4, 64.5, 66.5],
    "imagePath": "/personalities/portraits/gosta-rehn.jpg",
    "imageAlt": "Retrato de Gösta Rehn"
  },
  {
    "id": "eduard-limonov-obra",
    "titulo": "Лимонов против Путина",
    "autor": "Eduard Limonov",
    "autorId": "eduard-limonov",
    "ano": 2005,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Лимонов против Путина é uma obra de Eduard Limonov que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Лимонов против Путина para conhecer os argumentos e o contexto de Eduard Limonov e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=%D0%9B%D0%B8%D0%BC%D0%BE%D0%BD%D0%BE%D0%B2%20%D0%BF%D1%80%D0%BE%D1%82%D0%B8%D0%B2%20%D0%9F%D1%83%D1%82%D0%B8%D0%BD%D0%B0%20Eduard%20Limonov",
    "vetor": [24.7, 68.6, 32.6, 24.3, 18.6, 17.4, 80.6, 78.2, 76.4, 73, 59.5, 73.7],
    "imagePath": "/personalities/portraits/eduard-limonov.jpg",
    "imageAlt": "Retrato de Eduard Limonov"
  },
  {
    "id": "nicola-bombacci-perlacostituzionedeisoviet",
    "titulo": "Per la costituzione dei Soviet",
    "autor": "Nicola Bombacci",
    "autorId": "nicola-bombacci",
    "ano": 1920,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Per la costituzione dei Soviet é uma obra de Nicola Bombacci que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Per la costituzione dei Soviet para conhecer os argumentos e o contexto de Nicola Bombacci e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Per%20la%20costituzione%20dei%20Soviet%20Nicola%20Bombacci",
    "vetor": [24.7, 36.4, 62.4, 48.1, 47.4, 45.8, 90.1, 92.5, 64.5, 76.5, 38.1, 57],
    "imagePath": "/personalities/portraits/nicola-bombacci.jpg",
    "imageAlt": "Retrato de Nicola Bombacci"
  },
  {
    "id": "michel-aflaq-fisabilalbath",
    "titulo": "Fi Sabil al-Ba'th",
    "autor": "Michel Aflaq",
    "autorId": "michel-aflaq",
    "ano": 1959,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Fi Sabil al-Ba'th é uma obra de Michel Aflaq que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Fi Sabil al-Ba'th para conhecer os argumentos e o contexto de Michel Aflaq e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Fi%20Sabil%20al-Ba'th%20Michel%20Aflaq",
    "vetor": [37.9, 54.9, 61.5, 39, 42.4, 35.2, 84.6, 85.3, 77.6, 44, 42.7, 59.4],
    "imagePath": "/personalities/portraits/michel-aflaq.jpg",
    "imageAlt": "Retrato de Michel Aflaq"
  },
  {
    "id": "ramiro-ledesma-ramos-discursoasjuventudesdaespanha",
    "titulo": "Discurso às juventudes da Espanha",
    "autor": "Ramiro Ledesma Ramos",
    "autorId": "ramiro-ledesma-ramos",
    "ano": 1935,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Discurso às juventudes da Espanha é uma obra de Ramiro Ledesma Ramos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Discurso às juventudes da Espanha para conhecer os argumentos e o contexto de Ramiro Ledesma Ramos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Discurso%20%C3%A0s%20juventudes%20da%20Espanha%20Ramiro%20Ledesma%20Ramos",
    "vetor": [14, 24.5, 76.7, 25.5, 13.8, 15, 78.1, 85, 87.5, 56.3, 33.3, 77.2],
    "imagePath": "/personalities/portraits/ramiro-ledesma-ramos.jpg",
    "imageAlt": "Retrato de Ramiro Ledesma Ramos"
  },
  {
    "id": "gabriele-dannunzio-cartadocarnaro",
    "titulo": "Carta do Carnaro",
    "autor": "Gabriele D'Annunzio",
    "autorId": "gabriele-dannunzio",
    "ano": 1920,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Carta do Carnaro é uma obra de Gabriele D'Annunzio que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Carta do Carnaro para conhecer os argumentos e o contexto de Gabriele D'Annunzio e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Carta%20do%20Carnaro%20Gabriele%20D'Annunzio",
    "vetor": [62.9, 53.7, 33, 42.1, 12.6, 13.8, 71, 71.9, 57.8, 64.8, 57.4, 71.3],
    "imagePath": "/personalities/portraits/gabriele-dannunzio.jpg",
    "imageAlt": "Retrato de Gabriele D'Annunzio"
  },
  {
    "id": "alain-de-benoist-novadireitanovacultura",
    "titulo": "Nova Direita, Nova Cultura",
    "autor": "Alain de Benoist",
    "autorId": "alain-de-benoist",
    "ano": 1977,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Nova Direita, Nova Cultura é uma obra de Alain de Benoist que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Nova Direita, Nova Cultura para conhecer os argumentos e o contexto de Alain de Benoist e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Nova%20Direita%2C%20Nova%20Cultura%20Alain%20de%20Benoist",
    "vetor": [85.5, 82.3, 28.2, 39.8, 60.5, 69.6, 81, 72.2, 81.2, 52.7, 42.9, 14.5],
    "imagePath": "/personalities/portraits/alain-de-benoist.png",
    "imageAlt": "Retrato de Alain de Benoist"
  },
  {
    "id": "hugh-macdiarmid-adrunkmanlooksatthethistle",
    "titulo": "A Drunk Man Looks at the Thistle",
    "autor": "Hugh MacDiarmid",
    "autorId": "hugh-macdiarmid",
    "ano": 1926,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Drunk Man Looks at the Thistle é uma obra de Hugh MacDiarmid que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Drunk Man Looks at the Thistle para conhecer os argumentos e o contexto de Hugh MacDiarmid e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Drunk%20Man%20Looks%20at%20the%20Thistle%20Hugh%20MacDiarmid",
    "vetor": [72.4, 53.7, 49.6, 65.2, 49.8, 60.1, 53.2, 66.3, 45.5, 46.4, 66.5, 59.4],
    "imagePath": "/personalities/portraits/hugh-macdiarmid.jpg",
    "imageAlt": "Retrato de Hugh MacDiarmid"
  },
  {
    "id": "john-maclean-theirishtragedyscotlandsdisgrace",
    "titulo": "The Irish Tragedy: Scotland's Disgrace",
    "autor": "John Maclean",
    "autorId": "john-maclean",
    "ano": 1920,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "The Irish Tragedy: Scotland's Disgrace é uma obra de John Maclean que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler The Irish Tragedy: Scotland's Disgrace para conhecer os argumentos e o contexto de John Maclean e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=The%20Irish%20Tragedy%3A%20Scotland's%20Disgrace%20John%20Maclean",
    "vetor": [54.5, 68, 29.4, 76.4, 77.6, 75.2, 96, 93.7, 63.3, 90.5, 45.5, 59.4],
    "imagePath": "/personalities/portraits/john-maclean.jpg",
    "imageAlt": "Retrato de John Maclean"
  },
  {
    "id": "james-connolly-labourinirishhistory",
    "titulo": "Labour in Irish History",
    "autor": "James Connolly",
    "autorId": "james-connolly",
    "ano": 1910,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Labour in Irish History é uma obra de James Connolly que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Labour in Irish History para conhecer os argumentos e o contexto de James Connolly e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Labour%20in%20Irish%20History%20James%20Connolly",
    "vetor": [60.5, 92.4, 23, 86.7, 65.7, 52.6, 93.7, 90.1, 66.9, 36.9, 55.8, 47.5],
    "imagePath": "/personalities/portraits/james-connolly.jpg",
    "imageAlt": "Retrato de James Connolly"
  },
  {
    "id": "thomas-carlyle-osheroisocultodosheroiseoheroiconahistoria",
    "titulo": "Os Heróis: O Culto dos Heróis e o Heroico na História",
    "autor": "Thomas Carlyle",
    "autorId": "thomas-carlyle",
    "ano": 1841,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Os Heróis: O Culto dos Heróis e o Heroico na História é uma obra de Thomas Carlyle que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Heróis: O Culto dos Heróis e o Heroico na História para conhecer os argumentos e o contexto de Thomas Carlyle e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Her%C3%B3is%3A%20O%20Culto%20dos%20Her%C3%B3is%20e%20o%20Heroico%20na%20Hist%C3%B3ria%20Thomas%20Carlyle",
    "vetor": [26.8, 21, 66.2, 25.9, 30.5, 43.6, 62.6, 69.5, 70.9, 29.5, 24.4, 26.4],
    "imagePath": "/personalities/portraits/thomas-carlyle.jpg",
    "imageAlt": "Retrato de Thomas Carlyle"
  },
  {
    "id": "hans-adam-ii-oestadonoterceiromilenio",
    "titulo": "O Estado no Terceiro Milênio",
    "autor": "Hans-Adam II",
    "autorId": "hans-adam-ii",
    "ano": 2009,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Estado no Terceiro Milênio é uma obra de Hans-Adam II que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Estado no Terceiro Milênio para conhecer os argumentos e o contexto de Hans-Adam II e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Estado%20no%20Terceiro%20Mil%C3%AAnio%20Hans-Adam%20II",
    "vetor": [78.3, 76.3, 37.7, 43.6, 78.2, 61.4, 18.4, 21.8, 24.4, 30.6, 36, 68.9],
    "imagePath": "/personalities/portraits/hans-adam-ii.jpg",
    "imageAlt": "Retrato de Hans-Adam II"
  },
  {
    "id": "dom-bertrand-psicoseambientalistaosecoterroristasqueremacabarcomoseunegocio",
    "titulo": "Psicose Ambientalista: Os Ecoterroristas Querem Acabar Com o Seu Negócio",
    "autor": "Dom Bertrand",
    "autorId": "dom-bertrand",
    "ano": 2012,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "Psicose Ambientalista: Os Ecoterroristas Querem Acabar Com o Seu Negócio é uma obra de Dom Bertrand que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Psicose Ambientalista: Os Ecoterroristas Querem Acabar Com o Seu Negócio para conhecer os argumentos e o contexto de Dom Bertrand e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=Psicose%20Ambientalista%3A%20Os%20Ecoterroristas%20Querem%20Acabar%20Com%20o%20Seu%20Neg%C3%B3cio%20Dom%20Bertrand",
    "vetor": [47.4, 69.2, 48.4, 30.6, 46, 40, 25.8, 30.7, 43.7, 5.7, 10.1, 47.6],
    "imagePath": "/personalities/portraits/dom-bertrand.jpg",
    "imageAlt": "Retrato de Dom Bertrand"
  },
  {
    "id": "giovanni-giolitti-memoriasdaminhavida",
    "titulo": "Memórias da Minha Vida",
    "autor": "Giovanni Giolitti",
    "autorId": "giovanni-giolitti",
    "ano": 1922,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Memórias da Minha Vida é uma obra de Giovanni Giolitti que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Memórias da Minha Vida para conhecer os argumentos e o contexto de Giovanni Giolitti e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Mem%C3%B3rias%20da%20Minha%20Vida%20Giovanni%20Giolitti",
    "vetor": [11.7, 75.1, 62.7, 22.1, 58.1, 35.1, 58, 68.8, 62.7, 71, 12.2, 65.3],
    "imagePath": "/personalities/portraits/giolitti.jpg",
    "imageAlt": "Retrato de Giovanni Giolitti"
  },
  {
    "id": "juan-bautista-alberdi-basesepontosdepartidaparaaorganizacaopoliticadarepublicaargentina",
    "titulo": "Bases e Pontos de Partida para a Organização Política da República Argentina",
    "autor": "Juan Bautista Alberdi",
    "autorId": "juan-bautista-alberdi",
    "ano": 1852,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Bases e Pontos de Partida para a Organização Política da República Argentina é uma obra de Juan Bautista Alberdi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Bases e Pontos de Partida para a Organização Política da República Argentina para conhecer os argumentos e o contexto de Juan Bautista Alberdi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Bases%20e%20Pontos%20de%20Partida%20para%20a%20Organiza%C3%A7%C3%A3o%20Pol%C3%ADtica%20da%20Rep%C3%BAblica%20Argentina%20Juan%20Bautista%20Alberdi",
    "vetor": [39.9, 50.7, 43.6, 75.7, 87.7, 73.3, 16, 13.5, 11.3, 31.8, 20.6, 78.4],
    "imagePath": "/personalities/portraits/juan-bautista-alberdi.jpg",
    "imageAlt": "Retrato de Juan Bautista Alberdi"
  },
  {
    "id": "rupert-murdoch-agoldenageoffreedom",
    "titulo": "A Golden Age of Freedom",
    "autor": "Rupert Murdoch",
    "autorId": "rupert-murdoch",
    "ano": 2008,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "A Golden Age of Freedom é uma obra de Rupert Murdoch que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Golden Age of Freedom para conhecer os argumentos e o contexto de Rupert Murdoch e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=A%20Golden%20Age%20of%20Freedom%20Rupert%20Murdoch",
    "vetor": [61.7, 79.9, 56.8, 56.7, 31.7, 16.2, 20.8, 12.3, 12.5, 48.4, 32.5, 78.4],
    "imagePath": "/personalities/portraits/rupert-murdoch.jpg",
    "imageAlt": "Retrato de Rupert Murdoch"
  },
  {
    "id": "aldo-rebelo-oquintomovimentopropostasparaumaconstrucaoinacabada",
    "titulo": "O Quinto Movimento: Propostas para uma Construção Inacabada",
    "autor": "Aldo Rebelo",
    "autorId": "aldo-rebelo",
    "ano": 2021,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Quinto Movimento: Propostas para uma Construção Inacabada é uma obra de Aldo Rebelo que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Quinto Movimento: Propostas para uma Construção Inacabada para conhecer os argumentos e o contexto de Aldo Rebelo e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Quinto%20Movimento%3A%20Propostas%20para%20uma%20Constru%C3%A7%C3%A3o%20Inacabada%20Aldo%20Rebelo",
    "vetor": [26, 78.7, 55.6, 44.5, 44.8, 46, 60.1, 74.3, 68.1, 53.9, 39.3, 72.5],
    "imagePath": "/personalities/portraits/aldo-rebelo.jpg",
    "imageAlt": "Retrato de Aldo Rebelo"
  },
  {
    "id": "luiz-philippe-de-orleans-e-braganca-porqueobrasileumpaisatrasado",
    "titulo": "Por que o Brasil é um País Atrasado?",
    "autor": "Luiz Philippe de Orleans e Bragança",
    "autorId": "luiz-philippe-de-orleans-e-braganca",
    "ano": 2017,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Por que o Brasil é um País Atrasado? é uma obra de Luiz Philippe de Orleans e Bragança que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Por que o Brasil é um País Atrasado? para conhecer os argumentos e o contexto de Luiz Philippe de Orleans e Bragança e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Por%20que%20o%20Brasil%20%C3%A9%20um%20Pa%C3%ADs%20Atrasado%3F%20Luiz%20Philippe%20de%20Orleans%20e%20Bragan%C3%A7a",
    "vetor": [77.1, 76.3, 44.9, 34.2, 29.3, 36.4, 17.2, 20.6, 24.4, 23.6, 25.6, 70.1],
    "imagePath": "/personalities/portraits/luiz-philippe-de-orleans-e-braganca.jpg",
    "imageAlt": "Retrato de Luiz Philippe de Orleans e Bragança"
  },
  {
    "id": "tucker-carlson-shipoffoolshowaselfishrulingclassisbringingamericatothebrinkofrevolution",
    "titulo": "Ship of Fools: How a Selfish Ruling Class Is Bringing America to the Brink of Revolution",
    "autor": "Tucker Carlson",
    "autorId": "tucker-carlson",
    "ano": 2018,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Ship of Fools: How a Selfish Ruling Class Is Bringing America to the Brink of Revolution é uma obra de Tucker Carlson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ship of Fools: How a Selfish Ruling Class Is Bringing America to the Brink of Revolution para conhecer os argumentos e o contexto de Tucker Carlson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Ship%20of%20Fools%3A%20How%20a%20Selfish%20Ruling%20Class%20Is%20Bringing%20America%20to%20the%20Brink%20of%20Revolution%20Tucker%20Carlson",
    "vetor": [67.6, 76.3, 35.3, 19.9, 53.8, 59.8, 43.5, 60, 81.2, 26, 17.2, 42.9],
    "imagePath": "/personalities/portraits/tucker-carlson.jpg",
    "imageAlt": "Retrato de Tucker Carlson"
  },
  {
    "id": "ben-shapiro-oladocertodahistoria",
    "titulo": "O Lado Certo da História",
    "autor": "Ben Shapiro",
    "autorId": "ben-shapiro",
    "ano": 2019,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Lado Certo da História é uma obra de Ben Shapiro que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Lado Certo da História para conhecer os argumentos e o contexto de Ben Shapiro e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Lado%20Certo%20da%20Hist%C3%B3ria%20Ben%20Shapiro",
    "vetor": [66.4, 82.3, 37.7, 34, 26.9, 26.9, 14.9, 13.5, 20.8, 23.4, 19.4, 68.9],
    "imagePath": "/personalities/portraits/ben-shapiro.jpg",
    "imageAlt": "Retrato de Ben Shapiro"
  },
  {
    "id": "glenn-greenwald-semlugarparaseesconder",
    "titulo": "Sem Lugar para se Esconder",
    "autor": "Glenn Greenwald",
    "autorId": "glenn-greenwald",
    "ano": 2014,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Sem Lugar para se Esconder é uma obra de Glenn Greenwald que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sem Lugar para se Esconder para conhecer os argumentos e o contexto de Glenn Greenwald e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Sem%20Lugar%20para%20se%20Esconder%20Glenn%20Greenwald",
    "vetor": [65.2, 84.7, 13.9, 80, 78.2, 72.1, 67.9, 46, 36, 76.2, 75.2, 56],
    "imagePath": "/personalities/portraits/glenn-greenwald.jpg",
    "imageAlt": "Retrato de Glenn Greenwald"
  },
  {
    "id": "eduardo-moreira-desigualdadecaminhosparaumasociedademaisjusta",
    "titulo": "Desigualdade & Caminhos para uma Sociedade Mais Justa",
    "autor": "Eduardo Moreira",
    "autorId": "eduardo-moreira",
    "ano": 2019,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Desigualdade & Caminhos para uma Sociedade Mais Justa é uma obra de Eduardo Moreira que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Desigualdade & Caminhos para uma Sociedade Mais Justa para conhecer os argumentos e o contexto de Eduardo Moreira e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Desigualdade%20%26%20Caminhos%20para%20uma%20Sociedade%20Mais%20Justa%20Eduardo%20Moreira",
    "vetor": [34.3, 87, 38.9, 76.4, 68.8, 57.7, 76.2, 72.2, 66.9, 75, 76.4, 56],
    "imagePath": "/personalities/portraits/eduardo-moreira.jpg",
    "imageAlt": "Retrato de Eduardo Moreira"
  },
  {
    "id": "jones-manoel-revolucaoafricanaumaantologiadopensamentomarxista",
    "titulo": "Revolução Africana: Uma Antologia do Pensamento Marxista",
    "autor": "Jones Manoel",
    "autorId": "jones-manoel",
    "ano": 2019,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Revolução Africana: Uma Antologia do Pensamento Marxista é uma obra de Jones Manoel que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Revolução Africana: Uma Antologia do Pensamento Marxista para conhecer os argumentos e o contexto de Jones Manoel e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Revolu%C3%A7%C3%A3o%20Africana%3A%20Uma%20Antologia%20do%20Pensamento%20Marxista%20Jones%20Manoel",
    "vetor": [27, 72.1, 35, 81.2, 52.6, 66.9, 97.2, 92.5, 74, 83.3, 86, 64.1],
    "imagePath": "/personalities/portraits/jones-manoel.jpg",
    "imageAlt": "Retrato de Jones Manoel"
  },
  {
    "id": "alvaro-uribe-naohacausaperdida",
    "titulo": "Não Há Causa Perdida",
    "autor": "Álvaro Uribe",
    "autorId": "alvaro-uribe",
    "ano": 2012,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Não Há Causa Perdida é uma obra de Álvaro Uribe que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Não Há Causa Perdida para conhecer os argumentos e o contexto de Álvaro Uribe e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=N%C3%A3o%20H%C3%A1%20Causa%20Perdida%20%C3%81lvaro%20Uribe",
    "vetor": [28.3, 65.6, 74.6, 39, 23.3, 19.8, 19.6, 30.1, 16, 14, 12.5, 49.9],
    "imagePath": "/personalities/portraits/alvaro-uribe.jpg",
    "imageAlt": "Retrato de Álvaro Uribe"
  },
  {
    "id": "shinzo-abe-rumoaumanacaobela",
    "titulo": "Rumo a uma Nação Bela",
    "autor": "Shinzo Abe",
    "autorId": "shinzo-abe",
    "ano": 2006,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Rumo a uma Nação Bela é uma obra de Shinzo Abe que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Rumo a uma Nação Bela para conhecer os argumentos e o contexto de Shinzo Abe e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Rumo%20a%20uma%20Na%C3%A7%C3%A3o%20Bela%20Shinzo%20Abe",
    "vetor": [14, 63.2, 84.1, 10.4, 32.9, 13.8, 34.1, 50.9, 47.2, 31.9, 11.3, 74.9],
    "imagePath": "/personalities/portraits/shinzo-abe.jpg",
    "imageAlt": "Retrato de Shinzo Abe"
  },
  {
    "id": "jose-carlos-mariategui-seteensaiosdeinterpretacaodarealidadeperuana",
    "titulo": "Sete Ensaios de Interpretação da Realidade Peruana",
    "autor": "José Carlos Mariátegui",
    "autorId": "jose-carlos-mariategui",
    "ano": 1928,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Sete Ensaios de Interpretação da Realidade Peruana é uma obra de José Carlos Mariátegui que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Sete Ensaios de Interpretação da Realidade Peruana para conhecer os argumentos e o contexto de José Carlos Mariátegui e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Sete%20Ensaios%20de%20Interpreta%C3%A7%C3%A3o%20da%20Realidade%20Peruana%20Jos%C3%A9%20Carlos%20Mari%C3%A1tegui",
    "vetor": [67.6, 84.7, 35.3, 75.2, 75.8, 63.8, 88.9, 80.6, 74, 76.2, 77.6, 65.5],
    "imagePath": "/personalities/portraits/jose-carlos-mariategui.jpg",
    "imageAlt": "Retrato de José Carlos Mariátegui"
  },
  {
    "id": "kwame-nkrumah-neocolonialismooultimoestagiodoimperialismo",
    "titulo": "Neocolonialismo, o último estágio do imperialismo",
    "autor": "kwame-nkrumah",
    "autorId": "kwame-nkrumah",
    "ano": 1965,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Neocolonialismo, o último estágio do imperialismo é uma obra de um autor mapeado pelo 12 Axes que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Neocolonialismo, o último estágio do imperialismo para conhecer os argumentos e o contexto de seu autor e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Neocolonialismo%2C%20o%20%C3%BAltimo%20est%C3%A1gio%20do%20imperialismo%20",
    "vetor": null,
    "imagePath": null,
    "imageAlt": "Retrato de kwame-nkrumah"
  },
  {
    "id": "amilcar-cabral-aarmadateoria",
    "titulo": "A Arma da Teoria",
    "autor": "Amílcar Cabral",
    "autorId": "amilcar-cabral",
    "ano": 1966,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Arma da Teoria é uma obra de Amílcar Cabral que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Arma da Teoria para conhecer os argumentos e o contexto de Amílcar Cabral e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Arma%20da%20Teoria%20Am%C3%ADlcar%20Cabral",
    "vetor": [29.5, 72.8, 40.1, 69.3, 56.9, 63.7, 77.4, 75.8, 70.5, 67.9, 71.7, 48.8],
    "imagePath": "/personalities/portraits/amilcar-cabral.jpg",
    "imageAlt": "Retrato de Amílcar Cabral"
  },
  {
    "id": "norodom-sihanouk-mywarwiththecia",
    "titulo": "My War with the CIA",
    "autor": "Norodom Sihanouk",
    "autorId": "norodom-sihanouk",
    "ano": 1973,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "My War with the CIA é uma obra de Norodom Sihanouk que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler My War with the CIA para conhecer os argumentos e o contexto de Norodom Sihanouk e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=My%20War%20with%20the%20CIA%20Norodom%20Sihanouk",
    "vetor": [24.7, 38.8, 75.5, 28.1, 65.1, 71, 65.5, 72.2, 69.3, 23.4, 32.5, 61.9],
    "imagePath": "/personalities/portraits/norodom-sihanouk.jpg",
    "imageAlt": "Retrato de Norodom Sihanouk"
  },
  {
    "id": "abdullah-ii-ourlastbestchancethepursuitofpeaceinatimeofperil",
    "titulo": "Our Last Best Chance: The Pursuit of Peace in a Time of Peril",
    "autor": "Abdullah II da Jordânia",
    "autorId": "abdullah-ii",
    "ano": 2011,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Our Last Best Chance: The Pursuit of Peace in a Time of Peril é uma obra de Abdullah II da Jordânia que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Our Last Best Chance: The Pursuit of Peace in a Time of Peril para conhecer os argumentos e o contexto de Abdullah II da Jordânia e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Our%20Last%20Best%20Chance%3A%20The%20Pursuit%20of%20Peace%20in%20a%20Time%20of%20Peril%20Abdullah%20II%20da%20Jord%C3%A2nia",
    "vetor": [22, 40, 73.3, 46, 53.1, 46, 40.1, 48.5, 29.4, 24.6, 20.6, 66.5],
    "imagePath": "/personalities/portraits/abdullah-ii.jpg",
    "imageAlt": "Retrato de Abdullah II da Jordânia"
  },
  {
    "id": "nasser-al-din-shah-diariosdeviagemaeuropa",
    "titulo": "Diários de Viagem à Europa",
    "autor": "Nasser al-Din Shah Qajar",
    "autorId": "nasser-al-din-shah",
    "ano": 1874,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Diários de Viagem à Europa é uma obra de Nasser al-Din Shah Qajar que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Diários de Viagem à Europa para conhecer os argumentos e o contexto de Nasser al-Din Shah Qajar e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Di%C3%A1rios%20de%20Viagem%20%C3%A0%20Europa%20Nasser%20al-Din%20Shah%20Qajar",
    "vetor": [25.9, 18.6, 71.9, 27, 51.4, 62.1, 32.8, 33.8, 50.2, 10.5, 11.3, 61.9],
    "imagePath": "/personalities/portraits/nasser-al-din-shah.jpg",
    "imageAlt": "Retrato de Nasser al-Din Shah Qajar"
  },
  {
    "id": "conde-de-cavour-discursosparlamentareseescritospoliticos",
    "titulo": "Discursos Parlamentares e Escritos Políticos",
    "autor": "Conde de Cavour",
    "autorId": "conde-de-cavour",
    "ano": 1861,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Discursos Parlamentares e Escritos Políticos é uma obra de Conde de Cavour que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Discursos Parlamentares e Escritos Políticos para conhecer os argumentos e o contexto de Conde de Cavour e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Discursos%20Parlamentares%20e%20Escritos%20Pol%C3%ADticos%20Conde%20de%20Cavour",
    "vetor": [20.9, 59, 61.4, 29, 34, 18.6, 22, 21.8, 14.9, 70.6, 20.2, 77.2],
    "imagePath": "/personalities/portraits/conde-de-cavour.jpg",
    "imageAlt": "Retrato de Conde de Cavour"
  },
  {
    "id": "leopoldo-i-da-toscana-codigoleopoldino",
    "titulo": "Código Leopoldino",
    "autor": "Leopoldo I da Toscana",
    "autorId": "leopoldo-i-da-toscana",
    "ano": 1786,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Código Leopoldino é uma obra de Leopoldo I da Toscana que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Código Leopoldino para conhecer os argumentos e o contexto de Leopoldo I da Toscana e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=C%C3%B3digo%20Leopoldino%20Leopoldo%20I%20da%20Toscana",
    "vetor": [53, 38.8, 43.6, 75.2, 86.7, 79.1, 26.8, 14.7, 11.3, 63.1, 32.4, 56],
    "imagePath": "/personalities/portraits/leopoldo-i-da-toscana.jpg",
    "imageAlt": "Retrato de Leopoldo I da Toscana"
  },
  {
    "id": "luis-ii-da-baviera-diariossecretosecorrespondenciareal",
    "titulo": "Diários Secretos e Correspondência Real",
    "autor": "Luís II da Baviera",
    "autorId": "luis-ii-da-baviera",
    "ano": 1886,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Diários Secretos e Correspondência Real é uma obra de Luís II da Baviera que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Diários Secretos e Correspondência Real para conhecer os argumentos e o contexto de Luís II da Baviera e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Di%C3%A1rios%20Secretos%20e%20Correspond%C3%AAncia%20Real%20Lu%C3%ADs%20II%20da%20Baviera",
    "vetor": [66.1, 44.8, 54.3, 25.9, 66.9, 68.1, 51.8, 63.6, 74, 10.5, 25.6, 27.6],
    "imagePath": "/personalities/portraits/luis-ii-da-baviera.jpg",
    "imageAlt": "Retrato de Luís II da Baviera"
  },
  {
    "id": "frederico-augusto-i-decretoseordenacoesdoreinodasaxonia",
    "titulo": "Decretos e Ordenações do Reino da Saxônia",
    "autor": "Frederico Augusto I da Saxônia",
    "autorId": "frederico-augusto-i",
    "ano": 1818,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Decretos e Ordenações do Reino da Saxônia é uma obra de Frederico Augusto I da Saxônia que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Decretos e Ordenações do Reino da Saxônia para conhecer os argumentos e o contexto de Frederico Augusto I da Saxônia e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Decretos%20e%20Ordena%C3%A7%C3%B5es%20do%20Reino%20da%20Sax%C3%B4nia%20Frederico%20Augusto%20I%20da%20Sax%C3%B4nia",
    "vetor": [24.4, 16.2, 76.9, 26.9, 58.1, 62.5, 54.2, 68.3, 72.9, 18.7, 14.6, 53.4],
    "imagePath": "/personalities/portraits/frederico-augusto-i.jpg",
    "imageAlt": "Retrato de Frederico Augusto I da Saxônia"
  },
  {
    "id": "ferdinando-i-das-duas-sicilias-proclamacoesreaisecartasaopovonapolitano",
    "titulo": "Proclamações Reais e Cartas ao Povo Napolitano",
    "autor": "Ferdinando I das Duas Sicílias",
    "autorId": "ferdinando-i-das-duas-sicilias",
    "ano": 1821,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Proclamações Reais e Cartas ao Povo Napolitano é uma obra de Ferdinando I das Duas Sicílias que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Proclamações Reais e Cartas ao Povo Napolitano para conhecer os argumentos e o contexto de Ferdinando I das Duas Sicílias e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Proclama%C3%A7%C3%B5es%20Reais%20e%20Cartas%20ao%20Povo%20Napolitano%20Ferdinando%20I%20das%20Duas%20Sic%C3%ADlias",
    "vetor": [22, 25.7, 71, 24.7, 44.8, 34, 53, 68.3, 71.7, 10.5, 12.5, 45.2],
    "imagePath": "/personalities/portraits/ferdinando-i-das-duas-sicilias.jpg",
    "imageAlt": "Retrato de Ferdinando I das Duas Sicílias"
  },
  {
    "id": "vitor-emanuel-iii-corpusnummorumitalicorum",
    "titulo": "Corpus Nummorum Italicorum",
    "autor": "Vítor Emanuel III",
    "autorId": "vitor-emanuel-iii",
    "ano": 1910,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Corpus Nummorum Italicorum é uma obra de Vítor Emanuel III que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Corpus Nummorum Italicorum para conhecer os argumentos e o contexto de Vítor Emanuel III e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Corpus%20Nummorum%20Italicorum%20V%C3%ADtor%20Emanuel%20III",
    "vetor": [22, 40, 75.7, 24.5, 32.9, 25.7, 40, 65.9, 72, 31.8, 23, 58.3],
    "imagePath": "/personalities/portraits/vitor-emanuel-iii.jpg",
    "imageAlt": "Retrato de Vítor Emanuel III"
  },
  {
    "id": "cristiano-iv-cartasediariosdecristianoiv",
    "titulo": "Cartas e Diários de Cristiano IV",
    "autor": "Cristiano IV da Dinamarca",
    "autorId": "cristiano-iv",
    "ano": 1648,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Cartas e Diários de Cristiano IV é uma obra de Cristiano IV da Dinamarca que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Cartas e Diários de Cristiano IV para conhecer os argumentos e o contexto de Cristiano IV da Dinamarca e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Cartas%20e%20Di%C3%A1rios%20de%20Cristiano%20IV%20Cristiano%20IV%20da%20Dinamarca",
    "vetor": [29.2, 28.1, 71, 26.9, 19.8, 21, 35.1, 70.7, 65.7, 13.9, 11, 72.5],
    "imagePath": "/personalities/portraits/cristiano-iv.jpg",
    "imageAlt": "Retrato de Cristiano IV da Dinamarca"
  },
  {
    "id": "jorge-i-da-gra-bretanha-cartasdeestadoeinstrucoesministeriais",
    "titulo": "Cartas de Estado e Instruções Ministeriais",
    "autor": "Jorge I da Grã-Bretanha",
    "autorId": "jorge-i-da-gra-bretanha",
    "ano": 1727,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Cartas de Estado e Instruções Ministeriais é uma obra de Jorge I da Grã-Bretanha que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Cartas de Estado e Instruções Ministeriais para conhecer os argumentos e o contexto de Jorge I da Grã-Bretanha e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Cartas%20de%20Estado%20e%20Instru%C3%A7%C3%B5es%20Ministeriais%20Jorge%20I%20da%20Gr%C3%A3-Bretanha",
    "vetor": [66.4, 53.7, 71, 62.6, 29.3, 24.5, 28, 39.8, 58.6, 21, 23, 63],
    "imagePath": "/personalities/portraits/jorge-i-da-gra-bretanha.jpg",
    "imageAlt": "Retrato de Jorge I da Grã-Bretanha"
  },
  {
    "id": "eleftherios-venizelos-apoliticaexternaeofuturodagrecia",
    "titulo": "A Política Externa e o Futuro da Grécia",
    "autor": "Elefthérios Venizélos",
    "autorId": "eleftherios-venizelos",
    "ano": 1917,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Política Externa e o Futuro da Grécia é uma obra de Elefthérios Venizélos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Política Externa e o Futuro da Grécia para conhecer os argumentos e o contexto de Elefthérios Venizélos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Pol%C3%ADtica%20Externa%20e%20o%20Futuro%20da%20Gr%C3%A9cia%20Elefth%C3%A9rios%20Veniz%C3%A9los",
    "vetor": [15.2, 78.7, 69.9, 17.1, 53.1, 15, 49.6, 70, 22.2, 69.5, 47.9, 66.5],
    "imagePath": "/personalities/portraits/eleftherios-venizelos.jpg",
    "imageAlt": "Retrato de Elefthérios Venizélos"
  },
  {
    "id": "sri-aurobindo-avidadivina",
    "titulo": "A Vida Divina",
    "autor": "Sri Aurobindo",
    "autorId": "sri-aurobindo",
    "ano": 1939,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "A Vida Divina é uma obra de Sri Aurobindo que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Vida Divina para conhecer os argumentos e o contexto de Sri Aurobindo e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=A%20Vida%20Divina%20Sri%20Aurobindo",
    "vetor": [42.6, 75.1, 41.3, 66.2, 56.9, 55.3, 69.9, 67.6, 49.6, 28.2, 52.7, 57.1],
    "imagePath": "/personalities/portraits/sri-aurobindo.jpg",
    "imageAlt": "Retrato de Sri Aurobindo"
  },
  {
    "id": "chanakya-arthashastra",
    "titulo": "Arthashastra",
    "autor": "Chanakya",
    "autorId": "chanakya",
    "ano": -300,
    "area": "vida-intelectual",
    "dificuldade": "avancado",
    "resumo": "Arthashastra é uma obra de Chanakya que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Arthashastra para conhecer os argumentos e o contexto de Chanakya e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Arthashastra%20Chanakya",
    "vetor": [23.5, 21, 87.4, 25.9, 22.1, 11.4, 60.1, 85, 75.2, 14, 23.2, 70.1],
    "imagePath": "/personalities/portraits/chanakya.jpg",
    "imageAlt": "Retrato de Chanakya"
  },
  {
    "id": "jawaharlal-nehru-adescobertadaindia",
    "titulo": "A Descoberta da Índia",
    "autor": "Jawaharlal Nehru",
    "autorId": "jawaharlal-nehru",
    "ano": 1946,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Descoberta da Índia é uma obra de Jawaharlal Nehru que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Descoberta da Índia para conhecer os argumentos e o contexto de Jawaharlal Nehru e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Descoberta%20da%20%C3%8Dndia%20Jawaharlal%20Nehru",
    "vetor": [24.8, 83.5, 44.9, 66.9, 67.6, 58.9, 77.4, 77, 81.2, 78.6, 69.3, 76],
    "imagePath": "/personalities/portraits/jawaharlal-nehru.jpg",
    "imageAlt": "Retrato de Jawaharlal Nehru"
  },
  {
    "id": "vd-savarkar-hindutvaquemehindu",
    "titulo": "Hindutva: Quem É Hindu?",
    "autor": "V. D. Savarkar",
    "autorId": "vd-savarkar",
    "ano": 1923,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Hindutva: Quem É Hindu? é uma obra de V. D. Savarkar que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Hindutva: Quem É Hindu? para conhecer os argumentos e o contexto de V. D. Savarkar e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Hindutva%3A%20Quem%20%C3%89%20Hindu%3F%20V.%20D.%20Savarkar",
    "vetor": [22.4, 71.6, 60.3, 23.1, 15, 16.2, 50.6, 73.1, 76.4, 62.2, 31, 74.9],
    "imagePath": "/personalities/portraits/vd-savarkar.jpg",
    "imageAlt": "Retrato de V. D. Savarkar"
  },
  {
    "id": "sukarno-indonesiamenggugat",
    "titulo": "Indonesia Menggugat",
    "autor": "Sukarno",
    "autorId": "sukarno",
    "ano": 1930,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Indonesia Menggugat é uma obra de Sukarno que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Indonesia Menggugat para conhecer os argumentos e o contexto de Sukarno e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Indonesia%20Menggugat%20Sukarno",
    "vetor": [18.7, 36.4, 74.3, 48.3, 34.8, 38.3, 73.2, 75.5, 76.4, 35.3, 34.9, 68.9],
    "imagePath": "/personalities/portraits/sukarno.jpg",
    "imageAlt": "Retrato de Sukarno"
  },
  {
    "id": "amartya-sen-desenvolvimentocomoliberdade",
    "titulo": "Desenvolvimento como Liberdade",
    "autor": "Amartya Sen",
    "autorId": "amartya-sen",
    "ano": 1999,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Desenvolvimento como Liberdade é uma obra de Amartya Sen que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Desenvolvimento como Liberdade para conhecer os argumentos e o contexto de Amartya Sen e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Desenvolvimento%20como%20Liberdade%20Amartya%20Sen",
    "vetor": [55.7, 89.4, 34.1, 83.6, 78.3, 66, 68.7, 59.2, 31.8, 82.1, 75.2, 63.1],
    "imagePath": "/personalities/portraits/amartya-sen.jpg",
    "imageAlt": "Retrato de Amartya Sen"
  },
  {
    "id": "ashoka-oseditosdeashoka",
    "titulo": "Os Editos de Ashoka",
    "autor": "Ashoka",
    "autorId": "ashoka",
    "ano": -250,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "Os Editos de Ashoka é uma obra de Ashoka que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Editos de Ashoka para conhecer os argumentos e o contexto de Ashoka e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Editos%20de%20Ashoka%20Ashoka",
    "vetor": [21.1, 22.1, 73.1, 72.1, 60.5, 47, 64.3, 75.8, 56.2, 28.2, 28.9, 33.3],
    "imagePath": "/personalities/portraits/ashoka.jpg",
    "imageAlt": "Retrato de Ashoka"
  },
  {
    "id": "ibrahim-traore-discursosdarevolucaoesoberanianosahel",
    "titulo": "Discursos da Revolução e Soberania no Sahel",
    "autor": "Ibrahim Traoré",
    "autorId": "ibrahim-traore",
    "ano": 2024,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Discursos da Revolução e Soberania no Sahel é uma obra de Ibrahim Traoré que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Discursos da Revolução e Soberania no Sahel para conhecer os argumentos e o contexto de Ibrahim Traoré e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Discursos%20da%20Revolu%C3%A7%C3%A3o%20e%20Soberania%20no%20Sahel%20Ibrahim%20Traor%C3%A9",
    "vetor": [14, 26.9, 83.8, 56.8, 12.6, 38.8, 84.6, 86.5, 89.5, 47.4, 26.8, 60.6],
    "imagePath": "/personalities/portraits/ibrahim-traore.jpg",
    "imageAlt": "Retrato de Ibrahim Traoré"
  },
  {
    "id": "jean-luc-melenchon-aeradopovo",
    "titulo": "A Era do Povo",
    "autor": "Jean-Luc Mélenchon",
    "autorId": "jean-luc-melenchon",
    "ano": 2014,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "A Era do Povo é uma obra de Jean-Luc Mélenchon que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Era do Povo para conhecer os argumentos e o contexto de Jean-Luc Mélenchon e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Era%20do%20Povo%20Jean-Luc%20M%C3%A9lenchon",
    "vetor": [23.6, 91.8, 31.8, 69.3, 64, 62.5, 85.8, 91.2, 75.2, 83.3, 81.2, 38.1],
    "imagePath": "/personalities/portraits/jean-luc-melenchon.jpg",
    "imageAlt": "Retrato de Jean-Luc Mélenchon"
  },
  {
    "id": "jean-marie-le-pen-memoriasfilhodanacao",
    "titulo": "Memórias: Filho da Nação",
    "autor": "Jean-Marie Le Pen",
    "autorId": "jean-marie-le-pen",
    "ano": 2018,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Memórias: Filho da Nação é uma obra de Jean-Marie Le Pen que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Memórias: Filho da Nação para conhecer os argumentos e o contexto de Jean-Marie Le Pen e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Mem%C3%B3rias%3A%20Filho%20da%20Na%C3%A7%C3%A3o%20Jean-Marie%20Le%20Pen",
    "vetor": [18.8, 72.8, 69.9, 2, 19.3, 37.1, 36.3, 43.3, 90.7, 16.4, 10.1, 47.6],
    "imagePath": "/personalities/portraits/jean-marie-le-pen.jpg",
    "imageAlt": "Retrato de Jean-Marie Le Pen"
  },
  {
    "id": "eric-zemmour-osuicidiofrances",
    "titulo": "O Suicídio Francês",
    "autor": "Éric Zemmour",
    "autorId": "eric-zemmour",
    "ano": 2014,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Suicídio Francês é uma obra de Éric Zemmour que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Suicídio Francês para conhecer os argumentos e o contexto de Éric Zemmour e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Suic%C3%ADdio%20Franc%C3%AAs%20%C3%89ric%20Zemmour",
    "vetor": [15.2, 71.6, 71, 3.2, 22.1, 38.8, 34, 46.9, 87.1, 40.2, 19.6, 65.3],
    "imagePath": "/personalities/portraits/eric-zemmour.jpg",
    "imageAlt": "Retrato de Éric Zemmour"
  },
  {
    "id": "philippe-petain-principiosdarevolucaonacional",
    "titulo": "Princípios da Revolução Nacional",
    "autor": "Philippe Pétain",
    "autorId": "philippe-petain",
    "ano": 1941,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Princípios da Revolução Nacional é uma obra de Philippe Pétain que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Princípios da Revolução Nacional para conhecer os argumentos e o contexto de Philippe Pétain e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Princ%C3%ADpios%20da%20Revolu%C3%A7%C3%A3o%20Nacional%20Philippe%20P%C3%A9tain",
    "vetor": [21.1, 17.4, 85, 5.6, 46.7, 56.2, 57.9, 79, 91.1, 8.1, 6.5, 27.6],
    "imagePath": "/personalities/portraits/philippe-petain.jpg",
    "imageAlt": "Retrato de Philippe Pétain"
  },
  {
    "id": "francois-mitterrand-ogolpedeestadopermanente",
    "titulo": "O Golpe de Estado Permanente",
    "autor": "François Mitterrand",
    "autorId": "francois-mitterrand",
    "ano": 1964,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "O Golpe de Estado Permanente é uma obra de François Mitterrand que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Golpe de Estado Permanente para conhecer os argumentos e o contexto de François Mitterrand e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=O%20Golpe%20de%20Estado%20Permanente%20Fran%C3%A7ois%20Mitterrand",
    "vetor": [36.7, 78.7, 44.9, 50.2, 44.8, 37.6, 70.3, 73.4, 49, 63.1, 50.2, 65.3],
    "imagePath": "/personalities/portraits/francois-mitterrand.jpg",
    "imageAlt": "Retrato de François Mitterrand"
  },
  {
    "id": "jacques-chirac-cadapassodeveserumobjetivomemorias",
    "titulo": "Cada Passo Deve Ser Um Objetivo (Memórias)",
    "autor": "Jacques Chirac",
    "autorId": "jacques-chirac",
    "ano": 2009,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Cada Passo Deve Ser Um Objetivo (Memórias) é uma obra de Jacques Chirac que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Cada Passo Deve Ser Um Objetivo (Memórias) para conhecer os argumentos e o contexto de Jacques Chirac e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Cada%20Passo%20Deve%20Ser%20Um%20Objetivo%20(Mem%C3%B3rias)%20Jacques%20Chirac",
    "vetor": [24.8, 77.5, 58, 38.8, 59.3, 48.2, 54.4, 53.3, 53.2, 62.7, 40.8, 52.4],
    "imagePath": "/personalities/portraits/jacques-chirac.jpg",
    "imageAlt": "Retrato de Jacques Chirac"
  },
  {
    "id": "thomas-malthus-ensaiosobreoprincipiodapopulacao",
    "titulo": "Ensaio sobre o Princípio da População",
    "autor": "Thomas Malthus",
    "autorId": "thomas-malthus",
    "ano": 1798,
    "area": "economia",
    "dificuldade": "avancado",
    "resumo": "Ensaio sobre o Princípio da População é uma obra de Thomas Malthus que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ensaio sobre o Princípio da População para conhecer os argumentos e o contexto de Thomas Malthus e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Ensaio%20sobre%20o%20Princ%C3%ADpio%20da%20Popula%C3%A7%C3%A3o%20Thomas%20Malthus",
    "vetor": [27.1, 63.2, 59.1, 28.1, 53.1, 50.7, 22.2, 27.1, 69.9, 10.3, 9.9, 46.4],
    "imagePath": "/personalities/portraits/thomas-malthus.jpg",
    "imageAlt": "Retrato de Thomas Malthus"
  },
  {
    "id": "paulo-kogos-ominimosobreanarcocapitalismo",
    "titulo": "O Mínimo sobre Anarcocapitalismo",
    "autor": "Paulo Kogos",
    "autorId": "paulo-kogos",
    "ano": 2023,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "O Mínimo sobre Anarcocapitalismo é uma obra de Paulo Kogos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Mínimo sobre Anarcocapitalismo para conhecer os argumentos e o contexto de Paulo Kogos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=O%20M%C3%ADnimo%20sobre%20Anarcocapitalismo%20Paulo%20Kogos",
    "vetor": [92.3, 41.2, 26.9, 22.3, 32.4, 59.8, 0.6, 2.8, 7.7, 4.5, 8.9, 64.1],
    "imagePath": "/personalities/portraits/paulo-kogos.jpg",
    "imageAlt": "Retrato de Paulo Kogos"
  },
  {
    "id": "pim-fortuyn-depuinhopenvanachtjaarpaars",
    "titulo": "De puinhopen van acht jaar Paars",
    "autor": "Pim Fortuyn",
    "autorId": "pim-fortuyn",
    "ano": 2002,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "De puinhopen van acht jaar Paars é uma obra de Pim Fortuyn que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler De puinhopen van acht jaar Paars para conhecer os argumentos e o contexto de Pim Fortuyn e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=De%20puinhopen%20van%20acht%20jaar%20Paars%20Pim%20Fortuyn",
    "vetor": [47.4, 90.6, 35.3, 6.4, 64.5, 49, 19.6, 18.2, 25.6, 77.9, 74, 68.9],
    "imagePath": "/personalities/portraits/pim-fortuyn.jpg",
    "imageAlt": "Retrato de Pim Fortuyn"
  },
  {
    "id": "klaus-schwab-aquartarevolucaoindustrial",
    "titulo": "A Quarta Revolução Industrial",
    "autor": "Klaus Schwab",
    "autorId": "klaus-schwab",
    "ano": 2016,
    "area": "empresariado",
    "dificuldade": "intermediario",
    "resumo": "A Quarta Revolução Industrial é uma obra de Klaus Schwab que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Quarta Revolução Industrial para conhecer os argumentos e o contexto de Klaus Schwab e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "empresariado"
    ],
    "link": "https://openlibrary.org/search?q=A%20Quarta%20Revolu%C3%A7%C3%A3o%20Industrial%20Klaus%20Schwab",
    "vetor": [53.3, 79.9, 50.8, 69.3, 71.2, 53, 48.4, 59.2, 23.4, 76.2, 72.9, 78.4],
    "imagePath": "/personalities/portraits/klaus-schwab.jpg",
    "imageAlt": "Retrato de Klaus Schwab"
  },
  {
    "id": "subcomandante-marcos-nossaarmaeanossapalavra",
    "titulo": "Nossa Arma é a Nossa Palavra",
    "autor": "Subcomandante Marcos",
    "autorId": "subcomandante-marcos",
    "ano": 2001,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Nossa Arma é a Nossa Palavra é uma obra de Subcomandante Marcos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Nossa Arma é a Nossa Palavra para conhecer os argumentos e o contexto de Subcomandante Marcos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Nossa%20Arma%20%C3%A9%20a%20Nossa%20Palavra%20Subcomandante%20Marcos",
    "vetor": [92.6, 97.1, 12.3, 97.9, 83.6, 94.3, 97.2, 88.9, 93.1, 91.7, 94.3, 9.8],
    "imagePath": "/personalities/portraits/subcomandante-marcos.jpg",
    "imageAlt": "Retrato de Subcomandante Marcos"
  },
  {
    "id": "michael-collins-thepathtofreedom",
    "titulo": "The Path to Freedom",
    "autor": "Michael Collins",
    "autorId": "michael-collins",
    "ano": 1922,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "The Path to Freedom é uma obra de Michael Collins que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler The Path to Freedom para conhecer os argumentos e o contexto de Michael Collins e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=The%20Path%20to%20Freedom%20Michael%20Collins",
    "vetor": [47.4, 83.5, 72.2, 28.1, 38.3, 57.4, 67.9, 72.2, 76.4, 31.8, 14.6, 40.5],
    "imagePath": "/personalities/portraits/michael-collins.jpg",
    "imageAlt": "Retrato de Michael Collins"
  },
  {
    "id": "jose-gervasio-artigas-instrucoesdoanoxiii",
    "titulo": "Instruções do Ano XIII",
    "autor": "José Gervasio Artigas",
    "autorId": "jose-gervasio-artigas",
    "ano": 1813,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Instruções do Ano XIII é uma obra de José Gervasio Artigas que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Instruções do Ano XIII para conhecer os argumentos e o contexto de José Gervasio Artigas e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Instru%C3%A7%C3%B5es%20do%20Ano%20XIII%20Jos%C3%A9%20Gervasio%20Artigas",
    "vetor": [89, 82.3, 40.1, 72.4, 37.1, 52.6, 83.4, 82.9, 88.3, 38.1, 41.5, 26.2],
    "imagePath": "/personalities/portraits/jose-gervasio-artigas.jpg",
    "imageAlt": "Retrato de José Gervasio Artigas"
  },
  {
    "id": "costin-vlad-alamariu-bronzeagemindset",
    "titulo": "Bronze Age Mindset",
    "autor": "Costin Vlad Alamariu (BAP)",
    "autorId": "costin-vlad-alamariu",
    "ano": 2018,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Bronze Age Mindset é uma obra de Costin Vlad Alamariu (BAP) que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Bronze Age Mindset para conhecer os argumentos e o contexto de Costin Vlad Alamariu (BAP) e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Bronze%20Age%20Mindset%20Costin%20Vlad%20Alamariu%20(BAP)",
    "vetor": [70.9, 26.9, 30.5, 18.3, 11.4, 31.7, 16, 23, 70.8, 75.3, 32.1, 46.4],
    "imagePath": "/personalities/portraits/costin-vlad-alamariu.jpg",
    "imageAlt": "Retrato de Costin Vlad Alamariu (BAP)"
  },
  {
    "id": "henri-bergson-asduasfontesdamoraledareligiao",
    "titulo": "As Duas Fontes da Moral e da Religião",
    "autor": "Henri Bergson",
    "autorId": "henri-bergson",
    "ano": 1932,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "As Duas Fontes da Moral e da Religião é uma obra de Henri Bergson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler As Duas Fontes da Moral e da Religião para conhecer os argumentos e o contexto de Henri Bergson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=As%20Duas%20Fontes%20da%20Moral%20e%20da%20Religi%C3%A3o%20Henri%20Bergson",
    "vetor": [30.7, 82.3, 36.5, 63.8, 67.6, 53, 48.4, 47.3, 31.8, 53.2, 34.9, 54.8],
    "imagePath": "/personalities/portraits/henri-bergson.jpg",
    "imageAlt": "Retrato de Henri Bergson"
  },
  {
    "id": "campos-sales-dapropagandaapresidencia",
    "titulo": "Da Propaganda à Presidência",
    "autor": "Campos Sales",
    "autorId": "campos-sales",
    "ano": 1908,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Da Propaganda à Presidência é uma obra de Campos Sales que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Da Propaganda à Presidência para conhecer os argumentos e o contexto de Campos Sales e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Da%20Propaganda%20%C3%A0%20Presid%C3%AAncia%20Campos%20Sales",
    "vetor": [64.9, 61.4, 57.9, 35, 70, 66, 20.8, 30.1, 30.3, 61, 15.5, 63],
    "imagePath": "/personalities/portraits/campos-sales.jpg",
    "imageAlt": "Retrato de Campos Sales"
  },
  {
    "id": "rene-guenon-acrisedomundomoderno",
    "titulo": "A Crise do Mundo Moderno",
    "autor": "René Guénon",
    "autorId": "rene-guenon",
    "ano": 1927,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "A Crise do Mundo Moderno é uma obra de René Guénon que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Crise do Mundo Moderno para conhecer os argumentos e o contexto de René Guénon e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=A%20Crise%20do%20Mundo%20Moderno%20Ren%C3%A9%20Gu%C3%A9non",
    "vetor": [67.3, 29.3, 62.6, 28.2, 61, 70.5, 48.3, 60, 82.8, 5.7, 10.1, 7.5],
    "imagePath": "/personalities/portraits/rene-guenon.jpg",
    "imageAlt": "Retrato de René Guénon"
  },
  {
    "id": "antonio-negri-imperio",
    "titulo": "Império",
    "autor": "Antonio Negri",
    "autorId": "antonio-negri",
    "ano": 2000,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Império é uma obra de Antonio Negri que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Império para conhecer os argumentos e o contexto de Antonio Negri e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Imp%C3%A9rio%20Antonio%20Negri",
    "vetor": [83.1, 94.8, 12.3, 96.7, 91.3, 86.4, 93.7, 81.8, 33.6, 97.6, 89.5, 58.3],
    "imagePath": "/personalities/portraits/antonio-negri.jpg",
    "imageAlt": "Retrato de Antonio Negri"
  },
  {
    "id": "francis-fukuyama-ofimdahistoriaeoultimohomem",
    "titulo": "O Fim da História e o Último Homem",
    "autor": "Francis Fukuyama",
    "autorId": "francis-fukuyama",
    "ano": 1992,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "O Fim da História e o Último Homem é uma obra de Francis Fukuyama que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Fim da História e o Último Homem para conhecer os argumentos e o contexto de Francis Fukuyama e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=O%20Fim%20da%20Hist%C3%B3ria%20e%20o%20%C3%9Altimo%20Homem%20Francis%20Fukuyama",
    "vetor": [27.1, 81.1, 36.5, 46.9, 58.1, 45.8, 42.5, 36.6, 28.2, 68.3, 68.1, 57.1],
    "imagePath": "/personalities/portraits/francis-fukuyama.jpg",
    "imageAlt": "Retrato de Francis Fukuyama"
  },
  {
    "id": "oscar-wilde-aalmadohomemsobosocialismo",
    "titulo": "A Alma do Homem sob o Socialismo",
    "autor": "Oscar Wilde",
    "autorId": "oscar-wilde",
    "ano": 1891,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "A Alma do Homem sob o Socialismo é uma obra de Oscar Wilde que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Alma do Homem sob o Socialismo para conhecer os argumentos e o contexto de Oscar Wilde e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=A%20Alma%20do%20Homem%20sob%20o%20Socialismo%20Oscar%20Wilde",
    "vetor": [72.4, 82.9, 8.7, 80.2, 85.3, 73.3, 86.5, 69.9, 27.6, 73.1, 86, 78.4],
    "imagePath": "/personalities/portraits/oscar-wilde.jpg",
    "imageAlt": "Retrato de Oscar Wilde"
  },
  {
    "id": "hg-wells-thenewworldorder",
    "titulo": "The New World Order",
    "autor": "H. G. Wells",
    "autorId": "hg-wells",
    "ano": 1940,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "The New World Order é uma obra de H. G. Wells que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler The New World Order para conhecer os argumentos e o contexto de H. G. Wells e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=The%20New%20World%20Order%20H.%20G.%20Wells",
    "vetor": [23.2, 60.2, 41.2, 82.4, 83.1, 83.9, 96, 88.9, 25.2, 97.6, 90.7, 90.1],
    "imagePath": "/personalities/portraits/hg-wells.jpg",
    "imageAlt": "Retrato de H. G. Wells"
  },
  {
    "id": "bertrand-russell-caminhosparaaliberdade",
    "titulo": "Caminhos para a Liberdade",
    "autor": "Bertrand Russell",
    "autorId": "bertrand-russell",
    "ano": 1918,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Caminhos para a Liberdade é uma obra de Bertrand Russell que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Caminhos para a Liberdade para conhecer os argumentos e o contexto de Bertrand Russell e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Caminhos%20para%20a%20Liberdade%20Bertrand%20Russell",
    "vetor": [66.4, 82.3, 29.4, 76.7, 83.1, 73.2, 71.5, 65, 25.2, 94.5, 78.8, 59.5],
    "imagePath": "/personalities/portraits/bertrand-russell.jpg",
    "imageAlt": "Retrato de Bertrand Russell"
  },
  {
    "id": "herbert-marcuse-ohomemunidimensional",
    "titulo": "O Homem Unidimensional",
    "autor": "Herbert Marcuse",
    "autorId": "herbert-marcuse",
    "ano": 1964,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "O Homem Unidimensional é uma obra de Herbert Marcuse que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Homem Unidimensional para conhecer os argumentos e o contexto de Herbert Marcuse e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=O%20Homem%20Unidimensional%20Herbert%20Marcuse",
    "vetor": [70, 82.9, 21.8, 83.6, 91.3, 88.8, 91.3, 83, 69.3, 78.6, 90.7, 32.1],
    "imagePath": "/personalities/portraits/herbert-marcuse.jpg",
    "imageAlt": "Retrato de Herbert Marcuse"
  },
  {
    "id": "juan-manuel-santos-labatallaporlapaz",
    "titulo": "La batalla por la paz",
    "autor": "Juan Manuel Santos",
    "autorId": "juan-manuel-santos",
    "ano": 2019,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "La batalla por la paz é uma obra de Juan Manuel Santos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler La batalla por la paz para conhecer os argumentos e o contexto de Juan Manuel Santos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=La%20batalla%20por%20la%20paz%20Juan%20Manuel%20Santos",
    "vetor": [35.5, 84.7, 41.3, 71.7, 62.9, 43.4, 50.8, 54.5, 29.4, 47.6, 58.6, 63.1],
    "imagePath": "/personalities/portraits/juan-manuel-santos.jpg",
    "imageAlt": "Retrato de Juan Manuel Santos"
  },
  {
    "id": "zhuangzi-zhuangzi",
    "titulo": "Zhuangzi",
    "autor": "Zhuangzi",
    "autorId": "zhuangzi",
    "ano": -300,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Zhuangzi é uma obra de Zhuangzi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Zhuangzi para conhecer os argumentos e o contexto de Zhuangzi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Zhuangzi%20Zhuangzi",
    "vetor": [81.6, 85.5, 6.5, 76.7, 94.9, 93.6, 47.7, 29.3, 71.7, 64.8, 72.9, 9.9],
    "imagePath": "/personalities/portraits/zhuangzi.jpg",
    "imageAlt": "Retrato de Zhuangzi"
  },
  {
    "id": "lao-tse-taoteching",
    "titulo": "Tao Te Ching",
    "autor": "Lao-Tsé",
    "autorId": "lao-tse",
    "ano": -400,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Tao Te Ching é uma obra de Lao-Tsé que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Tao Te Ching para conhecer os argumentos e o contexto de Lao-Tsé e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Tao%20Te%20Ching%20Lao-Ts%C3%A9",
    "vetor": [82.8, 62.9, 28, 24.5, 97.2, 98.3, 46.5, 29.3, 71.7, 60.3, 53.9, 9.9],
    "imagePath": "/personalities/portraits/lao-tse.jpg",
    "imageAlt": "Retrato de Lao-Tsé"
  },
  {
    "id": "mozi-mozi",
    "titulo": "Mozi",
    "autor": "Mozi",
    "autorId": "mozi",
    "ano": -400,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Mozi é uma obra de Mozi que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Mozi para conhecer os argumentos e o contexto de Mozi e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Mozi%20Mozi",
    "vetor": [23.2, 32.9, 68.6, 71.2, 66.9, 82.4, 66.7, 67.4, 55, 11.9, 39.1, 40.5],
    "imagePath": "/personalities/portraits/mozi.jpg",
    "imageAlt": "Retrato de Mozi"
  },
  {
    "id": "gerrard-winstanley-thelawoffreedominaplatform",
    "titulo": "The Law of Freedom in a Platform",
    "autor": "Gerrard Winstanley",
    "autorId": "gerrard-winstanley",
    "ano": 1652,
    "area": "ativismo",
    "dificuldade": "avancado",
    "resumo": "The Law of Freedom in a Platform é uma obra de Gerrard Winstanley que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler The Law of Freedom in a Platform para conhecer os argumentos e o contexto de Gerrard Winstanley e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=The%20Law%20of%20Freedom%20in%20a%20Platform%20Gerrard%20Winstanley",
    "vetor": [77.1, 94.8, 31.3, 70, 97.2, 91.2, 97.2, 87.7, 71.7, 15.5, 40.3, 19.4],
    "imagePath": "/personalities/portraits/gerrard-winstanley.jpg",
    "imageAlt": "Retrato de Gerrard Winstanley"
  },
  {
    "id": "jean-meslier-memoiredespenseesetsentimentsdejeanmeslier",
    "titulo": "Mémoire des pensées et sentiments de Jean Meslier",
    "autor": "Jean Meslier",
    "autorId": "jean-meslier",
    "ano": 1762,
    "area": "religiao",
    "dificuldade": "avancado",
    "resumo": "Mémoire des pensées et sentiments de Jean Meslier é uma obra de Jean Meslier que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Mémoire des pensées et sentiments de Jean Meslier para conhecer os argumentos e o contexto de Jean Meslier e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=M%C3%A9moire%20des%20pens%C3%A9es%20et%20sentiments%20de%20Jean%20Meslier%20Jean%20Meslier",
    "vetor": [90.2, 96, 18.2, 80, 97.2, 92.4, 98.4, 87.7, 71.7, 98.8, 82.4, 65.5],
    "imagePath": "/personalities/portraits/jean-meslier.jpg",
    "imageAlt": "Retrato de Jean Meslier"
  },
  {
    "id": "etienne-de-la-boetie-discursodaservidaovoluntaria",
    "titulo": "Discurso da Servidão Voluntária",
    "autor": "Étienne de La Boétie",
    "autorId": "etienne-de-la-boetie",
    "ano": 1576,
    "area": "filosofia",
    "dificuldade": "avancado",
    "resumo": "Discurso da Servidão Voluntária é uma obra de Étienne de La Boétie que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Discurso da Servidão Voluntária para conhecer os argumentos e o contexto de Étienne de La Boétie e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Discurso%20da%20Servid%C3%A3o%20Volunt%C3%A1ria%20%C3%89tienne%20de%20La%20Bo%C3%A9tie",
    "vetor": [74.4, 89, 16, 71, 72.4, 72, 28.2, 33, 30.6, 42.5, 28.9, 64.3],
    "imagePath": "/personalities/portraits/etienne-de-la-boetie.jpg",
    "imageAlt": "Retrato de Étienne de La Boétie"
  },
  {
    "id": "william-godwin-umainvestigacaosobreajusticapolitica",
    "titulo": "Uma Investigação sobre a Justiça Política",
    "autor": "William Godwin",
    "autorId": "william-godwin",
    "ano": 1793,
    "area": "ativismo",
    "dificuldade": "avancado",
    "resumo": "Uma Investigação sobre a Justiça Política é uma obra de William Godwin que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Uma Investigação sobre a Justiça Política para conhecer os argumentos e o contexto de William Godwin e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=Uma%20Investiga%C3%A7%C3%A3o%20sobre%20a%20Justi%C3%A7a%20Pol%C3%ADtica%20William%20Godwin",
    "vetor": [96.2, 97.1, 7.5, 86, 98.4, 96, 60.3, 67.5, 27.6, 98.8, 82.4, 72.5],
    "imagePath": "/personalities/portraits/william-godwin.jpg",
    "imageAlt": "Retrato de William Godwin"
  },
  {
    "id": "thomas-spence-therealrightsofman",
    "titulo": "The Real Rights of Man",
    "autor": "Thomas Spence",
    "autorId": "thomas-spence",
    "ano": 1793,
    "area": "vida-intelectual",
    "dificuldade": "avancado",
    "resumo": "The Real Rights of Man é uma obra de Thomas Spence que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler The Real Rights of Man para conhecer os argumentos e o contexto de Thomas Spence e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=The%20Real%20Rights%20of%20Man%20Thomas%20Spence",
    "vetor": [96.2, 98.3, 14.7, 72.9, 96, 96, 84.6, 69.8, 69.3, 67.9, 74, 30],
    "imagePath": "/personalities/portraits/thomas-spence.jpg",
    "imageAlt": "Retrato de Thomas Spence"
  },
  {
    "id": "nestor-makhno-therussianrevolutioninukraine",
    "titulo": "The Russian Revolution in Ukraine",
    "autor": "Néstor Makhno",
    "autorId": "nestor-makhno",
    "ano": 1929,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "The Russian Revolution in Ukraine é uma obra de Néstor Makhno que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler The Russian Revolution in Ukraine para conhecer os argumentos e o contexto de Néstor Makhno e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=The%20Russian%20Revolution%20in%20Ukraine%20N%C3%A9stor%20Makhno",
    "vetor": [96.2, 96, 23, 82.4, 38.3, 71.7, 77, 71, 74, 92.9, 74, 30],
    "imagePath": "/personalities/portraits/nestor-makhno.jpg",
    "imageAlt": "Retrato de Néstor Makhno"
  },
  {
    "id": "elisee-reclus-evolutionrevolutionetlidealanarchique",
    "titulo": "Évolution, révolution et l'idéal anarchique",
    "autor": "Élisée Reclus",
    "autorId": "elisee-reclus",
    "ano": 1891,
    "area": "ativismo",
    "dificuldade": "intermediario",
    "resumo": "Évolution, révolution et l'idéal anarchique é uma obra de Élisée Reclus que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Évolution, révolution et l'idéal anarchique para conhecer os argumentos e o contexto de Élisée Reclus e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "ativismo"
    ],
    "link": "https://openlibrary.org/search?q=%C3%89volution%2C%20r%C3%A9volution%20et%20l'id%C3%A9al%20anarchique%20%C3%89lis%C3%A9e%20Reclus",
    "vetor": [98.6, 97.1, 7.5, 96.7, 98.4, 97.1, 88.9, 71, 31.2, 98.8, 94.3, 39.3],
    "imagePath": "/personalities/portraits/elisee-reclus.jpg",
    "imageAlt": "Retrato de Élisée Reclus"
  },
  {
    "id": "gary-johnson-sevenprinciplesofgoodgovernment",
    "titulo": "Seven Principles of Good Government",
    "autor": "Gary Johnson",
    "autorId": "gary-johnson",
    "ano": 2012,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Seven Principles of Good Government é uma obra de Gary Johnson que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Seven Principles of Good Government para conhecer os argumentos e o contexto de Gary Johnson e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Seven%20Principles%20of%20Good%20Government%20Gary%20Johnson",
    "vetor": [72, 83.1, 12.5, 75.5, 78.8, 87.1, 14.9, 14.7, 12.5, 71.9, 58.6, 70.1],
    "imagePath": "/personalities/portraits/gary-johnson.jpg",
    "imageAlt": "Retrato de Gary Johnson"
  },
  {
    "id": "jordan-bardella-cequejecherche",
    "titulo": "Ce que je cherche",
    "autor": "Jordan Bardella",
    "autorId": "jordan-bardella",
    "ano": 2024,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Ce que je cherche é uma obra de Jordan Bardella que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Ce que je cherche para conhecer os argumentos e o contexto de Jordan Bardella e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Ce%20que%20je%20cherche%20Jordan%20Bardella",
    "vetor": [23.6, 72.8, 67.5, 3.2, 37.6, 49.5, 62.5, 62.4, 74, 53.3, 28, 67.7],
    "imagePath": "/personalities/portraits/jordan-bardella.jpg",
    "imageAlt": "Retrato de Jordan Bardella"
  },
  {
    "id": "santiago-abascal-endefensadeespana",
    "titulo": "En defensa de España",
    "autor": "Santiago Abascal",
    "autorId": "santiago-abascal",
    "ano": 2014,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "En defensa de España é uma obra de Santiago Abascal que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler En defensa de España para conhecer os argumentos e o contexto de Santiago Abascal e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=En%20defensa%20de%20Espa%C3%B1a%20Santiago%20Abascal",
    "vetor": [5.7, 76.3, 59.1, 3.2, 21, 32.9, 27, 27.1, 68.7, 28.3, 4.1, 68.9],
    "imagePath": "/personalities/portraits/santiago-abascal.jpg",
    "imageAlt": "Retrato de Santiago Abascal"
  },
  {
    "id": "graciliano-ramos-memoriasdocarcere",
    "titulo": "Memórias do Cárcere",
    "autor": "Graciliano Ramos",
    "autorId": "graciliano-ramos",
    "ano": 1953,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Memórias do Cárcere é uma obra de Graciliano Ramos que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Memórias do Cárcere para conhecer os argumentos e o contexto de Graciliano Ramos e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Mem%C3%B3rias%20do%20C%C3%A1rcere%20Graciliano%20Ramos",
    "vetor": [28.3, 77.5, 30.6, 75.2, 74.8, 66, 93.7, 85.3, 74, 91.7, 62.1, 67.7],
    "imagePath": "/personalities/portraits/graciliano-ramos.jpg",
    "imageAlt": "Retrato de Graciliano Ramos"
  },
  {
    "id": "euclides-da-cunha-ossertoes",
    "titulo": "Os Sertões",
    "autor": "Euclides da Cunha",
    "autorId": "euclides-da-cunha",
    "ano": 1902,
    "area": "vida-intelectual",
    "dificuldade": "intermediario",
    "resumo": "Os Sertões é uma obra de Euclides da Cunha que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Os Sertões para conhecer os argumentos e o contexto de Euclides da Cunha e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "vida-intelectual"
    ],
    "link": "https://openlibrary.org/search?q=Os%20Sert%C3%B5es%20Euclides%20da%20Cunha",
    "vetor": [23.2, 49.5, 49.5, 23.1, 47.1, 42.4, 67.3, 75.5, 68.1, 88.4, 17.9, 74.9],
    "imagePath": "/personalities/portraits/euclides-da-cunha.jpg",
    "imageAlt": "Retrato de Euclides da Cunha"
  },
  {
    "id": "necmettin-erbakan-adilekonomikduzen",
    "titulo": "Adil Ekonomik Düzen",
    "autor": "Necmettin Erbakan",
    "autorId": "necmettin-erbakan",
    "ano": 1991,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Adil Ekonomik Düzen é uma obra de Necmettin Erbakan que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Adil Ekonomik Düzen para conhecer os argumentos e o contexto de Necmettin Erbakan e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Adil%20Ekonomik%20D%C3%BCzen%20Necmettin%20Erbakan",
    "vetor": [24.8, 66.8, 58, 65.2, 38.8, 42.4, 63.7, 69.5, 80, 8.3, 10.6, 59.4],
    "imagePath": "/personalities/portraits/necmettin-erbakan.jpg",
    "imageAlt": "Retrato de Necmettin Erbakan"
  },
  {
    "id": "shigeru-yoshida-kaisojunen",
    "titulo": "Kaisō Jūnen",
    "autor": "Shigeru Yoshida",
    "autorId": "shigeru-yoshida",
    "ano": 1957,
    "area": "politica",
    "dificuldade": "intermediario",
    "resumo": "Kaisō Jūnen é uma obra de Shigeru Yoshida que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Kaisō Jūnen para conhecer os argumentos e o contexto de Shigeru Yoshida e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=Kais%C5%8D%20J%C5%ABnen%20Shigeru%20Yoshida",
    "vetor": [22.4, 59.7, 74.6, 24.5, 69.8, 48.3, 37.5, 64.8, 56.2, 53.2, 23, 64.1],
    "imagePath": "/personalities/portraits/shigeru-yoshida.jpg",
    "imageAlt": "Retrato de Shigeru Yoshida"
  },
  {
    "id": "raul-prebisch-odesenvolvimentoeconomicodaamericalatinaealgunsdeseusprincipaisproblemas",
    "titulo": "O Desenvolvimento Econômico da América Latina e Alguns de Seus Principais Problemas",
    "autor": "Raúl Prebisch",
    "autorId": "raul-prebisch",
    "ano": 1949,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "O Desenvolvimento Econômico da América Latina e Alguns de Seus Principais Problemas é uma obra de Raúl Prebisch que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Desenvolvimento Econômico da América Latina e Alguns de Seus Principais Problemas para conhecer os argumentos e o contexto de Raúl Prebisch e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=O%20Desenvolvimento%20Econ%C3%B4mico%20da%20Am%C3%A9rica%20Latina%20e%20Alguns%20de%20Seus%20Principais%20Problemas%20Ra%C3%BAl%20Prebisch",
    "vetor": [28.3, 70.4, 46, 63.3, 73.6, 62.5, 67.5, 61.6, 52, 63.1, 63.3, 68.9],
    "imagePath": "/personalities/portraits/raul-prebisch.jpg",
    "imageAlt": "Retrato de Raúl Prebisch"
  },
  {
    "id": "michal-kalecki-teoriadadinamicaeconomica",
    "titulo": "Teoria da Dinâmica Econômica",
    "autor": "Michał Kalecki",
    "autorId": "michal-kalecki",
    "ano": 1954,
    "area": "economia",
    "dificuldade": "intermediario",
    "resumo": "Teoria da Dinâmica Econômica é uma obra de Michał Kalecki que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Teoria da Dinâmica Econômica para conhecer os argumentos e o contexto de Michał Kalecki e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "economia"
    ],
    "link": "https://openlibrary.org/search?q=Teoria%20da%20Din%C3%A2mica%20Econ%C3%B4mica%20Micha%C5%82%20Kalecki",
    "vetor": [27.1, 83.5, 37.7, 74, 76, 63.7, 83.4, 82.9, 69.3, 84.5, 66.9, 67.7],
    "imagePath": "/personalities/portraits/michal-kalecki.jpg",
    "imageAlt": "Retrato de Michał Kalecki"
  },
  {
    "id": "giovanni-gentile-genesiestrutturadellasocieta",
    "titulo": "Genesi e struttura della società",
    "autor": "Giovanni Gentile",
    "autorId": "giovanni-gentile",
    "ano": 1946,
    "area": "filosofia",
    "dificuldade": "intermediario",
    "resumo": "Genesi e struttura della società é uma obra de Giovanni Gentile que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler Genesi e struttura della società para conhecer os argumentos e o contexto de Giovanni Gentile e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "filosofia"
    ],
    "link": "https://openlibrary.org/search?q=Genesi%20e%20struttura%20della%20societ%C3%A0%20Giovanni%20Gentile",
    "vetor": [9.2, 9, 89.8, 21.9, 9, 11.4, 57.9, 85, 84, 46.8, 23.8, 60.6],
    "imagePath": "/personalities/portraits/giovanni-gentile.jpg",
    "imageAlt": "Retrato de Giovanni Gentile"
  },
  {
    "id": "john-adams-adefenceoftheconstitutionsofgovernmentoftheunitedstatesofamerica",
    "titulo": "A Defence of the Constitutions of Government of the United States of America",
    "autor": "John Adams",
    "autorId": "john-adams",
    "ano": 1787,
    "area": "politica",
    "dificuldade": "avancado",
    "resumo": "A Defence of the Constitutions of Government of the United States of America é uma obra de John Adams que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler A Defence of the Constitutions of Government of the United States of America para conhecer os argumentos e o contexto de John Adams e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "politica"
    ],
    "link": "https://openlibrary.org/search?q=A%20Defence%20of%20the%20Constitutions%20of%20Government%20of%20the%20United%20States%20of%20America%20John%20Adams",
    "vetor": [36.3, 54.3, 59, 29.3, 43.1, 56.2, 33, 35.4, 43.7, 23.4, 13.4, 52.4],
    "imagePath": "/personalities/portraits/john-adams.jpg",
    "imageAlt": "Retrato de John Adams"
  },
  {
    "id": "allan-kardec-olivrodosespiritos",
    "titulo": "O Livro dos Espíritos",
    "autor": "Allan Kardec",
    "autorId": "allan-kardec",
    "ano": 1857,
    "area": "religiao",
    "dificuldade": "intermediario",
    "resumo": "O Livro dos Espíritos é uma obra de Allan Kardec que ajuda a compreender debates políticos, sociais e intelectuais de seu tempo.",
    "porque": "Vale ler O Livro dos Espíritos para conhecer os argumentos e o contexto de Allan Kardec e relacioná-los aos debates políticos atuais.",
    "ideologias": [],
    "temas": [
      "religiao"
    ],
    "link": "https://openlibrary.org/search?q=O%20Livro%20dos%20Esp%C3%ADritos%20Allan%20Kardec",
    "vetor": [33.1, 69.2, 47.2, 74.5, 86.7, 67.2, 52, 58, 24.6, 38.9, 18.2, 70.1],
    "imagePath": "/personalities/portraits/allan-kardec.jpg",
    "imageAlt": "Retrato de Allan Kardec"
  }
];
  globalThis.AtlasData = globalThis.AtlasData || {};
  globalThis.AtlasData.livros = livrosOficiais;
})();
