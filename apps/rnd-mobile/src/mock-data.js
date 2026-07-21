export const SYNTHETIC_PROFILES = Object.freeze([
  {
    id: "p1",
    displayName: "Alex",
    ageBand: "25–34",
    about: "Coffee, hiking, movie nights, and honest communication.",
    alignment: 89,
    intents: ["dating", "movie_night", "cuddles"],
  },
  {
    id: "p2",
    displayName: "Jordan",
    ageBand: "25–34",
    about: "Trade work, live music, fitness, and building things.",
    alignment: 77,
    intents: ["long_term_relationship", "concert_or_event"],
  },
]);

export const SKIN_ITEMS = Object.freeze([
  { id: "neon-orbit", title: "Neon Orbit", type: "Profile skin", price: "$1.99 mock" },
  { id: "coffee-fox", title: "Coffee Fox", type: "Avatar", price: "Free mock" },
  { id: "midnight-chat", title: "Midnight Chat", type: "Chat skin", price: "$0.99 mock" },
]);

export const QUESTIONNAIRE = Object.freeze([
  {
    id: "political_alignment_importance",
    prompt: "How important is political alignment?",
    options: ["Not important", "Somewhat important", "Very important", "Dealbreaker"],
  },
  {
    id: "education_path",
    prompt: "Which education or training path fits you?",
    options: ["College/university", "Trade/apprenticeship", "Self-taught", "A mix"],
  },
  {
    id: "intimacy_style",
    prompt: "Which adult intimacy style sounds most compatible?",
    options: ["Mostly vanilla", "Adventurous", "Kink/BDSM-aware", "Depends on trust"],
  },
]);
