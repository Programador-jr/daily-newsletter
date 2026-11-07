/**
 * Retratos dos presidentes do Brasil, salvos em /presidents/portraits.
 * As imagens vêm do Wikimedia Commons (domínio público ou Creative Commons);
 * cada entrada guarda a página do arquivo, a autoria e a licença para o crédito.
 */
(function () {
  const presidentPortraits = {
    "Deodoro da Fonseca": {
      "src": "/presidents/portraits/deodoro-da-fonseca.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Deodoro_da_Fonseca_(1889).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Floriano Peixoto": {
      "src": "/presidents/portraits/floriano-peixoto.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Floriano_Peixoto_(1891).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Prudente de Morais": {
      "src": "/presidents/portraits/prudente-de-morais.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Prudentedemorais.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Campos Sales": {
      "src": "/presidents/portraits/campos-sales.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Campos_Sales.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Rodrigues Alves": {
      "src": "/presidents/portraits/rodrigues-alves.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Rodrigues_Alves_3.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Afonso Pena": {
      "src": "/presidents/portraits/afonso-pena.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Afonso_Pena.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Nilo Peçanha": {
      "src": "/presidents/portraits/nilo-pecanha.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Nilo_Pe%C3%A7anha_02.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Hermes da Fonseca": {
      "src": "/presidents/portraits/hermes-da-fonseca.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Hermes_da_Fonseca_(1910).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Venceslau Brás": {
      "src": "/presidents/portraits/venceslau-bras.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Venceslau_Br%C3%A1s.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Delfim Moreira": {
      "src": "/presidents/portraits/delfim-moreira.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Delfim_Moreira_(1918).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Epitácio Pessoa": {
      "src": "/presidents/portraits/epitacio-pessoa.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Epitacio_Pessoa_(1919).jpg",
      "creator": "Governo do Brasil/Musso",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Artur Bernardes": {
      "src": "/presidents/portraits/artur-bernardes.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Artur_Bernardes_(1922).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Washington Luís": {
      "src": "/presidents/portraits/washington-luis.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Washington_Lu%C3%ADs_(foto).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Junta Governativa Provisória de 1930": {
      "src": "/presidents/portraits/junta-governativa-provisoria-de-1930.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Osvaldo_Aranha_com_a_Junta_Governativa_(2).jpg",
      "creator": "Autoria não identificada",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "O Cruzeiro, 8 de novembro de 1930, reproduzido na Hemeroteca Digital Brasileira",
      "sourceUrl": "https://memoria.bn.gov.br/DocReader/003581/1838"
    },
    "Getúlio Vargas": {
      "src": "/presidents/portraits/getulio-vargas.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Getulio_Vargas_(1930).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "José Linhares": {
      "src": "/presidents/portraits/jose-linhares.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Jose_Linhares.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Eurico Gaspar Dutra": {
      "src": "/presidents/portraits/eurico-gaspar-dutra.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:GASPARDUTRA.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Café Filho": {
      "src": "/presidents/portraits/cafe-filho.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Cafe_Filho.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Carlos Luz": {
      "src": "/presidents/portraits/carlos-luz.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:CarlosLuz.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Nereu Ramos": {
      "src": "/presidents/portraits/nereu-ramos.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Presidente_Nereu_Ramos.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Juscelino Kubitschek": {
      "src": "/presidents/portraits/juscelino-kubitschek.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Juscelino_Kubitschek_in_1956.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www.gov.br/planalto/pt-br/conheca-a-presidencia/acervo/galeria-de-presidentes"
    },
    "Jânio Quadros": {
      "src": "/presidents/portraits/janio-quadros.png",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Janio_Quadros.png",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Ranieri Mazzilli": {
      "src": "/presidents/portraits/ranieri-mazzilli.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Ranieri_Mazzilli_(1961).jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "João Goulart": {
      "src": "/presidents/portraits/joao-goulart.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:MO_63.2240.2_-_Photograph_of_Jo%C3%A3o_Goulart_President_of_the_Republic_of_Brazil.jpg",
      "creator": "Brazilian Government. Donated to the United States Government.",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "jfklibrary.org",
      "sourceUrl": "https://www.jfklibrary.org/asset-viewer/archives/JFKSG/JFKSG-MO-1963-2240-2/JFKSG-MO-1963-2240-2"
    },
    "Humberto Castelo Branco": {
      "src": "/presidents/portraits/humberto-castelo-branco.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Humberto_Castelo_Branco,_presidente_do_Brasil,_1964.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Artur da Costa e Silva": {
      "src": "/presidents/portraits/artur-da-costa-e-silva.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Costa_e_Silva.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Junta Militar": {
      "src": "/presidents/portraits/junta-militar.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Junta_militar_de_1969.jpg",
      "creator": "Agência Nacional, today Agência Brasil",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
      "sourceLabel": "",
      "sourceUrl": ""
    },
    "Emílio Garrastazu Médici": {
      "src": "/presidents/portraits/emilio-garrastazu-medici.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Garrastazu_m%C3%A9dici.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "Ernesto Geisel": {
      "src": "/presidents/portraits/ernesto-geisel.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Ernesto_Geisel.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "João Figueiredo": {
      "src": "/presidents/portraits/joao-figueiredo.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Jo%C3%A3o_Figueiredo,_presidente_do_Brasil,_1979.jpg",
      "creator": "Governo do Brasil",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "Galeria de Presidentes",
      "sourceUrl": "https://www2.planalto.gov.br/presidencia/galeria-de-presidentes"
    },
    "José Sarney": {
      "src": "/presidents/portraits/jose-sarney.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Jose_sarney.jpg",
      "creator": "Antonio Cruz/Agência Brasil",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
      "sourceLabel": "Agência Brasil [1]",
      "sourceUrl": "https://www.agenciabrasil.gov.br/media/imagens/2007/01/01/1621ac79.jpg/view"
    },
    "Fernando Collor": {
      "src": "/presidents/portraits/fernando-collor.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Fernando_Collor_1992_B%26W.jpg",
      "creator": "Ubirajara Dettimar",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
      "sourceLabel": "Agência Brasil / EBC",
      "sourceUrl": ""
    },
    "Itamar Franco": {
      "src": "/presidents/portraits/itamar-franco.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Itamar_Franco.jpg",
      "creator": "Radiobrás",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
      "sourceLabel": "Arquivo Nacional do Brasil [1]",
      "sourceUrl": "https://www.portalan.arquivonacional.gov.br/Media/Presidentes.pdf"
    },
    "Fernando Henrique Cardoso": {
      "src": "/presidents/portraits/fernando-henrique-cardoso.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Fernando_Henrique_Cardoso_(1999).jpg",
      "creator": "Agência Brasil",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
      "sourceLabel": "Official photo from Brazilian Government, second term of FHC, current under public domain: [1]",
      "sourceUrl": "https://www.planalto.gov.br/Infger_07/presidentes/gale.htm"
    },
    "Luiz Inácio Lula da Silva": {
      "src": "/presidents/portraits/luiz-inacio-lula-da-silva.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_(2023%E2%80%932027).jpg",
      "creator": "Palácio do Planalto from Brasilia, Brasil",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "sourceLabel": "Foto Oficial do Presidente da República, Luiz Inácio Lula da Silva",
      "sourceUrl": "https://www.flickr.com/photos/palaciodoplanalto/52715235994/"
    },
    "Dilma Rousseff": {
      "src": "/presidents/portraits/dilma-rousseff.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Dilma_Rousseff_-_foto_oficial_2011-01-09_2_(cropped).jpg",
      "creator": "Roberto Stuckert Filho/Presidência da República",
      "license": "CC BY 3.0 br",
      "licenseUrl": "https://creativecommons.org/licenses/by/3.0/br/deed.en",
      "sourceLabel": "Agência Brasil",
      "sourceUrl": ""
    },
    "Michel Temer": {
      "src": "/presidents/portraits/michel-temer.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Michel_Temer_(foto_oficial).jpg",
      "creator": "Beto Barata/PR",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
      "sourceLabel": "This image has been extracted from another file",
      "sourceUrl": ""
    },
    "Jair Bolsonaro": {
      "src": "/presidents/portraits/jair-bolsonaro.jpg",
      "fileUrl": "https://commons.wikimedia.org/wiki/File:Presidente_Jair_Messias_Bolsonaro.jpg",
      "creator": "US Embassy Brasília",
      "license": "Public domain",
      "licenseUrl": "",
      "sourceLabel": "https://www.flickr.com/photos/embaixadaeua-brasil/44751487210/",
      "sourceUrl": "https://www.flickr.com/photos/embaixadaeua-brasil/44751487210/"
    }
  };

  globalThis.PresidentPortraits = Object.freeze(presidentPortraits);
})();
