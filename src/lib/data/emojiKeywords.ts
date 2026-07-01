// Keyword -> emoji lookup used to auto-suggest an icon from whatever
// someone types (custom or library name). Keys are matched as whole words
// against a lowercased, punctuation-stripped version of the name.
export const EMOJI_KEYWORDS: Record<string, string> = {
  // food & hosting
  chef: "🧑‍🍳", cook: "🧑‍🍳", cooking: "🧑‍🍳", baker: "🧑‍🍳", baking: "🧑‍🍳",
  foodie: "🍜", host: "🍽️", hostess: "🍽️", bartender: "🍸", coffee: "☕", tea: "🍵",
  wine: "🍷", grill: "🔥", brunch: "🥞",

  // travel & adventure
  traveller: "✈️", traveler: "✈️", travel: "✈️", jetsetter: "✈️", explorer: "🧭",
  adventurer: "🏕️", backpacker: "🎒", hiker: "🥾", hiking: "🥾", camper: "🏕️",
  wanderer: "🗺️", roadtrip: "🚗", pilot: "🛫", sailor: "⛵",

  // people & family roles
  mom: "🤱", mommy: "🤱", mother: "🤱", dad: "🧑‍🍼", daddy: "🧑‍🍼", father: "🧑‍🍼",
  parent: "👪", grandma: "👵", grandpa: "👴", sibling: "🧑‍🤝‍🧑", auntie: "👩", uncle: "👨",
  bestie: "🫶", friend: "🫂",

  // work & craft
  planner: "🗓️", organizer: "🗂️", coder: "🧑‍💻", developer: "🧑‍💻", programmer: "🧑‍💻",
  designer: "🎨", artist: "🎨", painter: "🖌️", photographer: "📸", writer: "✍️",
  author: "📖", teacher: "🧑‍🏫", mentor: "🎓", student: "🎓", scientist: "🔬",
  researcher: "🔬", doctor: "🩺", nurse: "🩺", lawyer: "⚖️", engineer: "🛠️",
  builder: "🛠️", mechanic: "🔧", gardener: "🌱", farmer: "🌾", musician: "🎸",
  singer: "🎤", dancer: "💃", dj: "🎧", gamer: "🎮", streamer: "🎥",

  // personality & vibe
  calm: "🧘", chaos: "🌪️", chaotic: "🌪️", funny: "😂", comedian: "😂",
  kind: "🫶", caring: "🫶", gentle: "🕊️", wise: "🦉", leader: "🚀",
  captain: "⚓", cheerleader: "📣", listener: "👂", advisor: "🧭",
  romantic: "💞", dreamer: "🌙", thinker: "🧠", protector: "🛡️", guardian: "🛡️",

  // hobbies
  reader: "📚", bookworm: "📚", gymrat: "🏋️", fitness: "🏋️", yoga: "🧘",
  runner: "🏃", athlete: "🏆", cyclist: "🚴", swimmer: "🏊", chessplayer: "♟️",
  petlover: "🐾", dog: "🐶", cat: "🐱", plantparent: "🪴", fashionista: "👗",
  shopper: "🛍️", flowers: "🌻",
};

const KEYWORD_ENTRIES = Object.entries(EMOJI_KEYWORDS);

/** Pulls up to `max` emoji out of a name by matching known keywords —
 * "Chef & Travel Planner" -> ["🧑‍🍳", "✈️"]. Falls back to [] if nothing matches. */
export function suggestEmojisForName(name: string, max = 2): string[] {
  const normalized = name.toLowerCase().replace(/[^a-z\s]/g, " ");
  const words = new Set(normalized.split(/\s+/).filter(Boolean));

  const matches: string[] = [];
  for (const [keyword, emoji] of KEYWORD_ENTRIES) {
    if (matches.length >= max) break;
    if (words.has(keyword) && !matches.includes(emoji)) {
      matches.push(emoji);
    }
  }

  // Fall back to substring matching for compound words (e.g. "travelling").
  if (matches.length === 0) {
    for (const [keyword, emoji] of KEYWORD_ENTRIES) {
      if (matches.length >= max) break;
      if (normalized.includes(keyword) && !matches.includes(emoji)) {
        matches.push(emoji);
      }
    }
  }

  return matches;
}
