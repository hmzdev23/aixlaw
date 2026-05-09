export type Locale = "en" | "fr";

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "fr"];

export const translations = {
  en: {
    nav: {
      cockpit: "Cockpit",
      warRoom: "War Room",
      architect: "Architect",
      signIn: "Sign in",
    },
    hero: {
      badge: "Spellbook Challenge — Hackathon 2026",
      headline: "Your first enterprise deal shouldn't be your last lesson.",
      subhead:
        "Gambit gives founders, GCs, and deal teams a negotiation co-pilot: Ghost opponent modelling, game-tree analysis, multi-regime compliance, and a full execution arc — start to signed.",
      cta1: "Enter Cockpit",
      cta2: "Watch arc",
    },
    personas: {
      sarah: "Sarah Chen — COO",
      marc: "Marc Tremblay — GC",
      initech: "Initech Procurement",
    },
    modes: {
      cockpit: "Cockpit",
      warRoom: "War Room",
      architect: "Architect",
    },
    cockpit: {
      redlinePile: "Redline Pile",
      evalBar: "Deal Score",
      ghost: "Opponent Ghost",
      gameTree: "Game Tree",
      walkaway: "Walkaway Line",
      compliance: "Compliance",
      playBestLine: "Play Best Line",
      trueSight: "TrueSight",
      timeline: "Execution Timeline",
    },
    compliance: {
      osfi: "OSFI B-13",
      pipeda: "PIPEDA",
      law25: "Law 25",
      pia: "Privacy Impact Assessment",
    },
  },
  fr: {
    nav: {
      cockpit: "Poste de Pilotage",
      warRoom: "Salle de Guerre",
      architect: "Architecte",
      signIn: "Connexion",
    },
    hero: {
      badge: "Défi Spellbook — Hackathon 2026",
      headline: "Votre première grande transaction ne devrait pas être votre dernière leçon.",
      subhead:
        "Gambit offre aux fondateurs, juristes et équipes de deal un co-pilote de négociation : modélisation Ghost, analyse d'arbre de jeu, conformité multi-régime et exécution complète.",
      cta1: "Entrer dans le Cockpit",
      cta2: "Voir l'arc",
    },
    personas: {
      sarah: "Sarah Chen — COO",
      marc: "Marc Tremblay — CJ",
      initech: "Initech Approvisionnement",
    },
    modes: {
      cockpit: "Cockpit",
      warRoom: "Salle de Guerre",
      architect: "Architecte",
    },
    cockpit: {
      redlinePile: "Pile de Redlines",
      evalBar: "Score de Deal",
      ghost: "Ghost Adversaire",
      gameTree: "Arbre de Jeu",
      walkaway: "Ligne de Rupture",
      compliance: "Conformité",
      playBestLine: "Jouer la Meilleure Ligne",
      trueSight: "TrueSight",
      timeline: "Chronologie d'Exécution",
    },
    compliance: {
      osfi: "OSFI B-13",
      pipeda: "LPRPDE",
      law25: "Loi 25",
      pia: "Évaluation des facteurs relatifs à la vie privée",
    },
  },
} as const;

export type TranslationKey = typeof translations.en;
