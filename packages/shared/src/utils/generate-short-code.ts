const COLORS = [
  "czerwony",
  "niebieski",
  "zielony",
  "zolty",
  "fioletowy",
  "pomaranczowy",
  "rozowy",
  "brazowy",
  "szary",
  "czarny",
  "bialy",
  "turkusowy",
  "zloty",
  "srebrny",
  "granatowy",
  "bordowy",
  "bezowy",
  "oliwkowy",
  "karmazynowy",
  "lazurowy",
];

const ANIMALS = [
  "bobr",
  "zubr",
  "los",
  "dzik",
  "lis",
  "wilk",
  "niedzwiedz",
  "jelen",
  "sarna",
  "borsuk",
  "wydra",
  "zajac",
  "wiewiorka",
  "jez",
  "bocian",
  "orzel",
  "sokol",
  "sowa",
  "kruk",
  "zuraw",
  "bazant",
  "szczupak",
  "sum",
  "rys",
  "zmija",
];

const ACTIVITIES = [
  "skacze",
  "biega",
  "spiewa",
  "tanczy",
  "plywa",
  "lata",
  "spi",
  "je",
  "gra",
  "czyta",
  "gotuje",
  "rysuje",
  "ryczy",
  "warczy",
  "nurkuje",
  "chodzi",
  "weszy",
  "drzemie",
];

const pick = (arr: string[]): string => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const generateShortCode = (): string => {
  return `${pick(COLORS)}-${pick(ANIMALS)}-${pick(ACTIVITIES)}`;
};

export { generateShortCode };
