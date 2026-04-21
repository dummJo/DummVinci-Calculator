export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  // ── Da Vinci ────────────────────────────────────────────────────────────────
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Obstacles cannot crush me. Every obstacle yields to stern resolve.", author: "Leonardo da Vinci" },
  { text: "Where the spirit does not work with the hand, there is no art.", author: "Leonardo da Vinci" },

  // ── Einstein ─────────────────────────────────────────────────────────────────
  { text: "If you can't explain it simply, you don't understand it well enough.", author: "Albert Einstein" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "The difference between genius and stupidity is that genius has its limits.", author: "Albert Einstein" },
  { text: "Anyone who has never made a mistake has never tried anything new.", author: "Albert Einstein" },
  { text: "Two things are infinite: the universe and human stupidity — and I'm not sure about the universe.", author: "Albert Einstein" },
  { text: "The definition of insanity is doing the same thing and expecting different results.", author: "Albert Einstein" },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein" },
  { text: "Reality is merely an illusion, albeit a very persistent one.", author: "Albert Einstein" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },

  // ── Tesla ────────────────────────────────────────────────────────────────────
  { text: "If you only knew the magnificence of the 3, 6, and 9, then you would have a key to the universe.", author: "Nikola Tesla" },
  { text: "The scientists of today think deeply instead of clearly.", author: "Nikola Tesla" },
  { text: "Of all things, I liked books best.", author: "Nikola Tesla" },
  { text: "Be alone, that is the secret of invention; be alone, that is when ideas are born.", author: "Nikola Tesla" },
  { text: "Our virtues and our failings are inseparable.", author: "Nikola Tesla" },
  { text: "The present is theirs; the future, for which I really worked, is mine.", author: "Nikola Tesla" },
  { text: "I don't care that they stole my idea. I care that they don't have any of their own.", author: "Nikola Tesla" },

  // ── Engineering sarcasm ──────────────────────────────────────────────────────
  { text: "It's not a bug, it's an undocumented feature.", author: "Anonymous Engineer" },
  { text: "I don't care if it works on your machine. We're not shipping your machine.", author: "Sarcastic Lead" },
  { text: "Testing is for people who don't trust their own code. I don't test.", author: "Overconfident Dev" },
  { text: "If it's not broken, add more features until it is.", author: "Product Manager" },
  { text: "The best documentation is code so clear it needs none. We never achieve this.", author: "Sarcastic Architect" },
  { text: "Move fast and break things. Preferably not in production.", author: "Startup Gospel" },
  { text: "Works on my machine — ship it.", author: "Junior Dev, 2009" },
  { text: "A good engineer is someone who can do for one dollar what any fool can do for two.", author: "Old Engineering Proverb" },
  { text: "Any sufficiently advanced bug is indistinguishable from a feature.", author: "Rich Kulawiec" },
  { text: "The most dangerous phrase in engineering: we've always done it this way.", author: "Sarcastic QA" },

  // ── Industry legends ─────────────────────────────────────────────────────────
  { text: "Real artists ship.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "If you think your users are idiots, only idiots will use it.", author: "Linus Torvalds" },
  { text: "I choose a lazy person to do a hard job — they'll find the easy way.", author: "Bill Gates" },
  { text: "Execution is everything.", author: "Jeff Bezos" },
  { text: "Work like hell. If others put in 40 hours, put in 80.", author: "Elon Musk" },
  { text: "The best code is no code at all.", author: "Jeff Atwood" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
];

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
