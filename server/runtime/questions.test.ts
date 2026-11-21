import { describe, expect, it } from "vitest";
import { personOnly, personSecret } from "./questions.ts";

describe("personOnly", () => {
  it("knows which of the person's own accounts, mailboxes or logins to use is theirs to say, in English and German", () => {
    for (const question of [
      // As a bot asked it on a real day, and a teammate answered it for the person.
      "Which email account should be connected — Gmail (person@example.test) or another provider?",
      "Which of your accounts should I send from?",
      "Which mailbox do you mean, the office one or the shop?",
      "Which login should I use for the supplier portal?",
      "Which Gmail or Outlook account should I send from?",
      "Welches E-Mail-Konto soll ich verbinden?",
      "Welches Postfach meinst du?",
      "Welchen Login soll ich für das Portal nehmen?",
    ]) expect(personOnly(question), question).toBe(true);
  });

  it("leaves to a bot what it can decide", () => {
    for (const question of ["CSV or Excel?", "Which region should I deploy to?", "Which format should the report use?", "Welche Formulierung?",
      "Which section of the account statement should I summarise first?", "Welchen Teil des Kontoauszugs soll ich zusammenfassen?"]) expect(personOnly(question), question).toBe(false);
  });
});

describe("personSecret", () => {
  it("is a sign-in, a code, a secret or a payment, which stays the person's even when they tell a bot", () => {
    for (const question of ["What's the password for the portal?", "Which verification code did you get?", "Please sign in to the bank portal", "Can you log in to Stripe for me?",
      "Paste the API key", "Should I pay the invoice?", "Soll ich die Rechnung bezahlen?", "Wie lautet das Passwort?"]) expect(personSecret(question), question).toBe(true);
  });

  it("is not a choice of which of the person's accounts or logins to use", () => {
    for (const question of ["Which FuZion login or user ID does Kody use?", "Which login should I use?", "Which email account should be connected — Gmail or another provider?"])
      expect(personSecret(question), question).toBe(false);
  });
});
