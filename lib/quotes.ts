export const QUOTES = [
  "\"Simplicity is the ultimate sophistication.\" — Leonardo da Vinci",
  "\"Move fast and break things.\" — Zuckerberg",
  "\"Real artists ship.\" — Steve Jobs",
  "\"Work like hell. 80-100 hour weeks.\" — Elon Musk",
  "\"I choose a lazy person to do a hard job.\" — Bill Gates",
  "\"If it's not a little bit broken, you're not trying hard enough.\" — Sarcastic CEO",
  "\"I don't care if it works on your machine.\" — Sarcastic Lead",
  "\"Execution is everything.\" — Jeff Bezos",
  "\"Stay hungry, stay foolish.\" — Steve Jobs",
  "\"It's not a bug, it's a feature.\" — Anonymous Engineer",
  "\"If you think your users are idiots, only idiots will use it.\" — Linus Torvalds",
  "\"Done is better than perfect.\" — Sheryl Sandberg",
  "\"Testing is for people who don't trust their own code.\" — Sarcastic Founder",
  "\"The best code is no code at all.\" — Elon Musk",
  "\"Talk is cheap. Show me the code.\" — Linus Torvalds",
];

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
