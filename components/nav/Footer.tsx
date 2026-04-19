"use client";
import { useEffect, useState } from "react";

const QUOTES = [
  "\"Simplicity is the ultimate sophistication.\" — Leonardo da Vinci",
  "\"Move fast and break things.\" — Mark Zuckerberg",
  "\"Real artists ship.\" — Steve Jobs",
  "\"Work like hell. 80-100 hour weeks increase the odds of success.\" — Elon Musk",
  "\"I choose a lazy person to do a hard job, because they find an easy way.\" — Bill Gates",
  "\"If it's not a little bit broken, you're not trying hard enough.\" — Sarcastic CEO",
  "\"I don't care if it works on your machine, we're not shipping your machine.\" — Sarcastic Lead",
  "\"Execution is everything.\" — Jeff Bezos",
  "\"Stay hungry, stay foolish.\" — Steve Jobs",
  "\"It's not a bug, it's a feature.\" — Anonymous Engineer",
  "\"If you think your users are idiots, only idiots will use it.\" — Linus Torvalds",
  "\"Done is better than perfect.\" — Sheryl Sandberg",
  "\"Testing is for people who don't trust their own code.\" — Sarcastic Founder",
  "\"The best code is no code at all.\" — Elon Musk",
  "\"Talk is cheap. Show me the code.\" — Linus Torvalds",
];

export default function Footer() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Pick a random quote on mount
    const random = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(random);
  }, []);

  return (
    <footer style={{
      marginTop: 48,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      color: "var(--muted-soft)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      paddingBottom: 32,
      opacity: quote ? 1 : 0,
      transition: "opacity 0.5s ease",
    }}>
      <div style={{ marginBottom: 4, color: "var(--accent)", opacity: 0.6 }}>
        ◈ Managed by dummJo.
      </div>
      <div>{quote}</div>
    </footer>
  );
}
