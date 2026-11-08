/**
 * Atlas político — perguntas de arquétipo do teste.
 *
 * As cinco primeiras perguntas e seus efeitos foram reproduzidos do projeto
 * 12 Axes (https://12axes.vercel.app/), de Enzo Xavier Santos, com autorização
 * escrita do autor. A sexta pergunta é opcional e não altera o cálculo dos eixos.
 *
 * Cada efeito é um percentual em direção ao polo esquerdo do eixo no modelo
 * canônico do 12 Axes. O questionário converte esse valor para a régua do Atlas
 * antes de misturá-lo às respostas comuns.
 */
(function () {
  const perguntas = [
    {
      id: "sociedade",
      label: "Sociedade",
      icon: "fa-people-group",
      text: "A sociedade deve se apoiar em quê?",
      options: [
        {
          id: "A",
          text: "Fé, família e tradição da nação",
          effects: { moral: 12, religiao: 20, imigracao: 82 }
        },
        {
          id: "B",
          text: "Costumes e fé, mudando devagar",
          effects: { moral: 32, religiao: 42, imigracao: 60 }
        },
        {
          id: "C",
          text: "Cada um vive como quiser",
          effects: { moral: 55, religiao: 60, imigracao: 40 }
        },
        {
          id: "D",
          text: "Igualdade, diversidade e direitos civis",
          effects: { moral: 80, religiao: 75, imigracao: 20 }
        },
        {
          id: "E",
          text: "Tradição e ordem, sem religião",
          effects: { moral: 25, religiao: 82, imigracao: 65 }
        },
        {
          id: "F",
          text: "Fé a serviço da justiça social",
          effects: { moral: 72, religiao: 25, imigracao: 30 }
        }
      ]
    },
    {
      id: "poder",
      label: "Poder",
      icon: "fa-landmark",
      text: "Como o poder deve ser organizado?",
      options: [
        {
          id: "A",
          text: "Líder ou partido único, centralizado",
          effects: { representacao: 15, estrutura: 18, poder: 85 }
        },
        {
          id: "B",
          text: "Elites decidem, com voto limitado",
          effects: { representacao: 40, estrutura: 38, poder: 65 }
        },
        {
          id: "C",
          text: "Democracia com freios e contrapesos",
          effects: { representacao: 78, estrutura: 45, poder: 42 }
        },
        {
          id: "D",
          text: "Estado mínimo ou nenhum",
          effects: { representacao: 70, estrutura: 88, poder: 12 }
        },
        {
          id: "E",
          text: "Sem Estado, conselhos ou contratos",
          effects: { representacao: 90, estrutura: 95, poder: 8 }
        }
      ]
    },
    {
      id: "economia",
      label: "Economia",
      icon: "fa-coins",
      text: "Quem deve controlar a produção?",
      options: [
        {
          id: "A",
          text: "Produção coletiva e planejada, sem patrões",
          effects: { economia: 92, controle: 92, comercio: 80 }
        },
        {
          id: "B",
          text: "Cooperativas, Estado social e regulação",
          effects: { economia: 76, controle: 66, comercio: 55 }
        },
        {
          id: "C",
          text: "Mercado com regras e rede de proteção",
          effects: { economia: 42, controle: 44, comercio: 42 }
        },
        {
          id: "D",
          text: "Patrões e sindicatos unidos pelo Estado",
          effects: { economia: 65, controle: 84, comercio: 88 }
        },
        {
          id: "E",
          text: "Empresas nacionais protegidas pelo Estado",
          effects: { economia: 38, controle: 60, comercio: 80 }
        },
        {
          id: "F",
          text: "Livre comércio e impostos mínimos",
          effects: { economia: 12, controle: 8, comercio: 12 }
        }
      ]
    },
    {
      id: "mundo",
      label: "Mundo",
      icon: "fa-earth-americas",
      text: "Como o país deve agir no mundo?",
      options: [
        {
          id: "A",
          text: "Potência militar influente",
          effects: { diplomacia: 85, intervencao: 15 }
        },
        {
          id: "B",
          text: "Defesa forte e aliados próximos",
          effects: { diplomacia: 60, intervencao: 40 }
        },
        {
          id: "C",
          text: "Diplomacia antes da força",
          effects: { diplomacia: 30, intervencao: 62 }
        },
        {
          id: "D",
          text: "Armado, mas fora de guerras alheias",
          effects: { diplomacia: 70, intervencao: 80 }
        },
        {
          id: "E",
          text: "Paz e não intervenção, sempre",
          effects: { diplomacia: 8, intervencao: 90 }
        }
      ]
    },
    {
      id: "tecnologia",
      label: "Tecnologia",
      icon: "fa-microchip",
      text: "Qual deve ser o papel da tecnologia?",
      options: [
        {
          id: "A",
          text: "Voltar à natureza, sem indústria",
          effects: { tecnologia: 8 }
        },
        {
          id: "B",
          text: "Natureza acima do progresso",
          effects: { tecnologia: 30 }
        },
        {
          id: "C",
          text: "Equilíbrio entre progresso e natureza",
          effects: { tecnologia: 50 }
        },
        {
          id: "D",
          text: "Tecnologia e indústria como motor",
          effects: { tecnologia: 72 }
        },
        {
          id: "E",
          text: "Acelerar a tecnologia, sem freios",
          effects: { tecnologia: 92 }
        }
      ]
    },
    {
      id: "religiao",
      label: "Religião",
      icon: "fa-hands-praying",
      text: "Você segue alguma religião? Esta resposta é opcional e não altera a pontuação.",
      layout: "tiles",
      options: [
        { id: "cristianismo", text: "Cristianismo", icon: "fa-cross" },
        { id: "judaismo", text: "Judaísmo", icon: "fa-star-of-david" },
        { id: "islamismo", text: "Islamismo", icon: "fa-star-and-crescent" },
        { id: "budismo", text: "Budismo", icon: "fa-dharmachakra" },
        { id: "hinduismo", text: "Hinduísmo", icon: "fa-om" },
        { id: "outra", text: "Outra religião", icon: "fa-place-of-worship" },
        {
          id: "sem-religiao",
          text: "Sem religião, agnóstico ou ateu",
          icon: "fa-circle-half-stroke",
          wide: true
        }
      ]
    }
  ];

  window.KINGS_ARCHETYPE_QUESTIONS = perguntas;
})();
