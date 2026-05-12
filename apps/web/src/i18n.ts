export type Locale = 'en' | 'es' | 'fr' | 'pt' | 'de';

export type SiteCopy = {
  brandName: string;
  footerDescription: string;
  footerNavigationLabel: string;
  homeLabel: string;
  languageLabel: string;
  nav: {
    community: string;
      guidance: string;
      tracking: string;
  };
  primaryNavigationLabel: string;
  tagline: string;
};

type TranslationBundle = {
  focusAreas: Array<{
    accent: 'blue' | 'gold' | 'green' | 'red';
    description: string;
    title: string;
  }>;
  hero: {
    actionsLabel: string;
    description: string;
    eyebrow: string;
    panelDescription: string;
    panelLabel: string;
    panelTitle: string;
    primaryAction: string;
    secondaryAction: string;
    statusLabel: string;
    title: string;
  };
  sections: {
    guidance: {
      eyebrow: string;
      intro: string;
      title: string;
    };
    tracking: {
      cards: Array<{
        accent: 'blue' | 'gold' | 'green' | 'red';
        description: string;
        title: string;
      }>;
      eyebrow: string;
      intro: string;
      title: string;
    };
  };
  site: SiteCopy;
  stats: Array<{
    label: string;
    value: string;
  }>;
};

export const locales: Array<{ code: Locale; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
  { code: 'pt', label: 'Portugues' },
  { code: 'de', label: 'Deutsch' }
];

export const defaultLocale: Locale = 'en';

export const translations: Record<Locale, TranslationBundle> = {
  en: {
    focusAreas: [
      {
        accent: 'green',
        description: 'Practical steps for reducing exposure risk in homes and workplaces.',
        title: 'Prevention guidance'
      },
      {
        accent: 'red',
        description: 'Clear symptom summaries and response pathways for concerned readers.',
        title: 'Symptoms and response'
      },
      {
        accent: 'blue',
        description: 'Structured reports for locations, case counts, severity, and sources.',
        title: 'Outbreak tracking'
      },
      {
        accent: 'gold',
        description: 'Forum and review foundations for community and expert collaboration.',
        title: 'Community education'
      }
    ],
    hero: {
      actionsLabel: 'Primary actions',
      description:
        'Trustworthy educational content, outbreak awareness, and community support tools for readers and public-health contributors.',
      eyebrow: 'Public health resource',
      panelDescription: 'Navigation, content sections, cards, and responsive grids.',
      panelLabel: 'Foundation',
      panelTitle: 'Component system',
      primaryAction: 'Browse guidance',
      secondaryAction: 'View tracking',
      statusLabel: 'Project status',
      title: 'Hantavirus information and prevention hub'
    },
    sections: {
      guidance: {
        eyebrow: 'Core areas',
        intro: 'Reusable cards establish the first content templates for the project.',
        title: 'Built for clear public-health information'
      },
      tracking: {
        cards: [
          {
            accent: 'blue',
            description:
              'Outbreak reports can use the same card shell for severity, source, and location summaries.',
            title: 'Outbreak overview'
          },
          {
            accent: 'gold',
            description:
              'Review queues can use section headers and compact grid layouts for moderation work.',
            title: 'Review workflow'
          }
        ],
        eyebrow: 'Templates',
        intro: 'The layout supports dashboard-style pages without changing the shell.',
        title: 'Ready for tracking and reporting screens'
      }
    },
    site: {
      brandName: 'Hantavirus Hub',
      footerDescription: 'Educational content, outbreak awareness, and community support.',
      footerNavigationLabel: 'Footer navigation',
      homeLabel: 'Hantavirus home',
      languageLabel: 'Language',
      nav: {
        community: 'Community',
        guidance: 'Guidance',
        tracking: 'Tracking'
      },
      primaryNavigationLabel: 'Primary navigation',
      tagline: 'Public health resource'
    },
    stats: [
      { label: 'Content types', value: '5' },
      { label: 'Core workflows', value: '4' },
      { label: 'Responsive layouts', value: 'Ready' }
    ]
  },
  es: {
    focusAreas: [
      {
        accent: 'green',
        description: 'Pasos practicos para reducir el riesgo de exposicion en hogares y lugares de trabajo.',
        title: 'Guia de prevencion'
      },
      {
        accent: 'red',
        description: 'Resúmenes claros de sintomas y rutas de respuesta para lectores preocupados.',
        title: 'Sintomas y respuesta'
      },
      {
        accent: 'blue',
        description: 'Informes estructurados de ubicaciones, casos, gravedad y fuentes.',
        title: 'Seguimiento de brotes'
      },
      {
        accent: 'gold',
        description: 'Bases para foros y revision que apoyan la colaboracion comunitaria y experta.',
        title: 'Educacion comunitaria'
      }
    ],
    hero: {
      actionsLabel: 'Acciones principales',
      description:
        'Contenido educativo confiable, conciencia sobre brotes y herramientas de apoyo para lectores y colaboradores de salud publica.',
      eyebrow: 'Recurso de salud publica',
      panelDescription: 'Navegacion, secciones de contenido, tarjetas y cuadriculas adaptables.',
      panelLabel: 'Base',
      panelTitle: 'Sistema de componentes',
      primaryAction: 'Ver guia',
      secondaryAction: 'Ver seguimiento',
      statusLabel: 'Estado del proyecto',
      title: 'Centro de informacion y prevencion del hantavirus'
    },
    sections: {
      guidance: {
        eyebrow: 'Areas clave',
        intro: 'Las tarjetas reutilizables establecen las primeras plantillas de contenido del proyecto.',
        title: 'Creado para informacion clara de salud publica'
      },
      tracking: {
        cards: [
          {
            accent: 'blue',
            description:
              'Los informes de brotes pueden usar la misma tarjeta para resumir gravedad, fuente y ubicacion.',
            title: 'Resumen de brotes'
          },
          {
            accent: 'gold',
            description:
              'Las colas de revision pueden usar encabezados de seccion y cuadriculas compactas para moderacion.',
            title: 'Flujo de revision'
          }
        ],
        eyebrow: 'Plantillas',
        intro: 'El diseno admite paginas tipo tablero sin cambiar la estructura principal.',
        title: 'Listo para pantallas de seguimiento e informes'
      }
    },
    site: {
      brandName: 'Hantavirus Hub',
      footerDescription: 'Contenido educativo, conciencia sobre brotes y apoyo comunitario.',
      footerNavigationLabel: 'Navegacion del pie',
      homeLabel: 'Inicio de Hantavirus',
      languageLabel: 'Idioma',
      nav: {
        community: 'Comunidad',
        guidance: 'Guia',
        tracking: 'Seguimiento'
      },
      primaryNavigationLabel: 'Navegacion principal',
      tagline: 'Recurso de salud publica'
    },
    stats: [
      { label: 'Tipos de contenido', value: '5' },
      { label: 'Flujos clave', value: '4' },
      { label: 'Disenos adaptables', value: 'Listo' }
    ]
  },
  fr: {
    focusAreas: [
      {
        accent: 'green',
        description: 'Mesures pratiques pour reduire le risque d exposition a la maison et au travail.',
        title: 'Guide de prevention'
      },
      {
        accent: 'red',
        description: 'Syntheses claires des symptomes et parcours de reponse pour les lecteurs inquiets.',
        title: 'Symptomes et reponse'
      },
      {
        accent: 'blue',
        description: 'Rapports structures sur les lieux, les cas, la gravite et les sources.',
        title: 'Suivi des foyers'
      },
      {
        accent: 'gold',
        description: 'Bases de forum et de revue pour la collaboration communautaire et experte.',
        title: 'Education communautaire'
      }
    ],
    hero: {
      actionsLabel: 'Actions principales',
      description:
        'Contenu educatif fiable, veille sur les foyers et outils de soutien pour les lecteurs et les contributeurs en sante publique.',
      eyebrow: 'Ressource de sante publique',
      panelDescription: 'Navigation, sections de contenu, cartes et grilles responsives.',
      panelLabel: 'Base',
      panelTitle: 'Systeme de composants',
      primaryAction: 'Voir les conseils',
      secondaryAction: 'Voir le suivi',
      statusLabel: 'Etat du projet',
      title: 'Centre d information et de prevention du hantavirus'
    },
    sections: {
      guidance: {
        eyebrow: 'Domaines cles',
        intro: 'Des cartes reutilisables etablissent les premiers modeles de contenu du projet.',
        title: 'Concu pour une information claire de sante publique'
      },
      tracking: {
        cards: [
          {
            accent: 'blue',
            description:
              'Les rapports de foyers peuvent utiliser la meme carte pour resumer gravite, source et lieu.',
            title: 'Apercu des foyers'
          },
          {
            accent: 'gold',
            description:
              'Les files de revue peuvent utiliser des titres de section et des grilles compactes pour la moderation.',
            title: 'Flux de revue'
          }
        ],
        eyebrow: 'Modeles',
        intro: 'La mise en page prend en charge des pages de tableau de bord sans changer la structure.',
        title: 'Pret pour les ecrans de suivi et de rapport'
      }
    },
    site: {
      brandName: 'Hantavirus Hub',
      footerDescription: 'Contenu educatif, veille sur les foyers et soutien communautaire.',
      footerNavigationLabel: 'Navigation du pied de page',
      homeLabel: 'Accueil Hantavirus',
      languageLabel: 'Langue',
      nav: {
        community: 'Communaute',
        guidance: 'Conseils',
        tracking: 'Suivi'
      },
      primaryNavigationLabel: 'Navigation principale',
      tagline: 'Ressource de sante publique'
    },
    stats: [
      { label: 'Types de contenu', value: '5' },
      { label: 'Parcours cles', value: '4' },
      { label: 'Mises en page responsives', value: 'Pret' }
    ]
  },
  pt: {
    focusAreas: [
      {
        accent: 'green',
        description: 'Passos praticos para reduzir risco de exposicao em casas e locais de trabalho.',
        title: 'Guia de prevencao'
      },
      {
        accent: 'red',
        description: 'Resumos claros de sintomas e caminhos de resposta para leitores preocupados.',
        title: 'Sintomas e resposta'
      },
      {
        accent: 'blue',
        description: 'Relatorios estruturados de locais, casos, gravidade e fontes.',
        title: 'Monitoramento de surtos'
      },
      {
        accent: 'gold',
        description: 'Bases de forum e revisao para colaboracao da comunidade e de especialistas.',
        title: 'Educacao comunitaria'
      }
    ],
    hero: {
      actionsLabel: 'Acoes principais',
      description:
        'Conteudo educativo confiavel, consciencia sobre surtos e ferramentas de apoio para leitores e colaboradores de saude publica.',
      eyebrow: 'Recurso de saude publica',
      panelDescription: 'Navegacao, secoes de conteudo, cards e grades responsivas.',
      panelLabel: 'Base',
      panelTitle: 'Sistema de componentes',
      primaryAction: 'Ver guia',
      secondaryAction: 'Ver monitoramento',
      statusLabel: 'Status do projeto',
      title: 'Central de informacao e prevencao sobre hantavirus'
    },
    sections: {
      guidance: {
        eyebrow: 'Areas principais',
        intro: 'Cards reutilizaveis criam os primeiros modelos de conteudo do projeto.',
        title: 'Feito para informacao clara de saude publica'
      },
      tracking: {
        cards: [
          {
            accent: 'blue',
            description:
              'Relatorios de surtos podem usar o mesmo card para resumir gravidade, fonte e local.',
            title: 'Visao geral de surtos'
          },
          {
            accent: 'gold',
            description:
              'Filas de revisao podem usar cabecalhos de secao e grades compactas para moderacao.',
            title: 'Fluxo de revisao'
          }
        ],
        eyebrow: 'Modelos',
        intro: 'O layout apoia paginas de painel sem mudar a estrutura principal.',
        title: 'Pronto para telas de monitoramento e relatorio'
      }
    },
    site: {
      brandName: 'Hantavirus Hub',
      footerDescription: 'Conteudo educativo, consciencia sobre surtos e apoio comunitario.',
      footerNavigationLabel: 'Navegacao do rodape',
      homeLabel: 'Inicio do Hantavirus',
      languageLabel: 'Idioma',
      nav: {
        community: 'Comunidade',
        guidance: 'Guia',
        tracking: 'Monitoramento'
      },
      primaryNavigationLabel: 'Navegacao principal',
      tagline: 'Recurso de saude publica'
    },
    stats: [
      { label: 'Tipos de conteudo', value: '5' },
      { label: 'Fluxos principais', value: '4' },
      { label: 'Layouts responsivos', value: 'Pronto' }
    ]
  },
  de: {
    focusAreas: [
      {
        accent: 'green',
        description: 'Praktische Schritte zur Senkung des Expositionsrisikos zu Hause und am Arbeitsplatz.',
        title: 'Leitfaden zur Vorbeugung'
      },
      {
        accent: 'red',
        description: 'Klare Zusammenfassungen von Symptomen und Reaktionswegen fur besorgte Leser.',
        title: 'Symptome und Reaktion'
      },
      {
        accent: 'blue',
        description: 'Strukturierte Berichte zu Orten, Fallzahlen, Schweregrad und Quellen.',
        title: 'Ausbruchsverfolgung'
      },
      {
        accent: 'gold',
        description: 'Grundlagen fur Forum und Prufung zur Zusammenarbeit mit Community und Fachleuten.',
        title: 'Community-Bildung'
      }
    ],
    hero: {
      actionsLabel: 'Wichtige Aktionen',
      description:
        'Verlassliche Bildungsinhalte, Ausbruchsbewusstsein und Hilfswerkzeuge fur Leser und Mitwirkende im Gesundheitswesen.',
      eyebrow: 'Ressource fur offentliche Gesundheit',
      panelDescription: 'Navigation, Inhaltsbereiche, Karten und responsive Raster.',
      panelLabel: 'Basis',
      panelTitle: 'Komponentensystem',
      primaryAction: 'Leitfaden ansehen',
      secondaryAction: 'Verfolgung ansehen',
      statusLabel: 'Projektstatus',
      title: 'Informations- und Vorbeugungszentrum fur Hantavirus'
    },
    sections: {
      guidance: {
        eyebrow: 'Kernbereiche',
        intro: 'Wiederverwendbare Karten bilden die ersten Inhaltsvorlagen des Projekts.',
        title: 'Gebaut fur klare Informationen zur offentlichen Gesundheit'
      },
      tracking: {
        cards: [
          {
            accent: 'blue',
            description:
              'Ausbruchsberichte konnen dieselbe Karte fur Schweregrad, Quelle und Ort verwenden.',
            title: 'Ausbruchsubersicht'
          },
          {
            accent: 'gold',
            description:
              'Prufwarteschlangen konnen Abschnittstitel und kompakte Raster fur Moderation nutzen.',
            title: 'Prufablauf'
          }
        ],
        eyebrow: 'Vorlagen',
        intro: 'Das Layout unterstutzt Dashboard-Seiten ohne Anderung der Shell.',
        title: 'Bereit fur Verfolgungs- und Berichtseiten'
      }
    },
    site: {
      brandName: 'Hantavirus Hub',
      footerDescription: 'Bildungsinhalte, Ausbruchsbewusstsein und Community-Unterstutzung.',
      footerNavigationLabel: 'Fusszeilennavigation',
      homeLabel: 'Hantavirus Startseite',
      languageLabel: 'Sprache',
      nav: {
        community: 'Community',
        guidance: 'Leitfaden',
        tracking: 'Verfolgung'
      },
      primaryNavigationLabel: 'Hauptnavigation',
      tagline: 'Ressource fur offentliche Gesundheit'
    },
    stats: [
      { label: 'Inhaltstypen', value: '5' },
      { label: 'Kernablaufe', value: '4' },
      { label: 'Responsive Layouts', value: 'Bereit' }
    ]
  }
};

export function resolveLocale(value: string | null | undefined): Locale {
  return locales.some((locale) => locale.code === value)
    ? (value as Locale)
    : defaultLocale;
}

export function getInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const stored = window.localStorage.getItem('hantavirus-locale');
  if (stored) {
    return resolveLocale(stored);
  }

  return resolveLocale(window.navigator.language.slice(0, 2));
}

export function storeLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('hantavirus-locale', locale);
  }
}
