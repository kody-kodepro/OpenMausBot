// Off a team, with features.asksViaChief on: what a bot asks the person in a conversation they are not in (work handed
// on, a routine, an outside event) reaches their Chief of Staff instead of a notification, and the Chief raises it in its
// own chat with them. A question the person answers there goes back through the Chief (question-routing.ts reads their
// own line as their answer). An approval, a sign-in or a password only the person can give: the Chief says where it waits
// and never gives it. A Chief's own asks, a room's, and an ask in a conversation the person is in stay where they are.
// On a Team Cloud the person's inbox routes asks (person-inbox.ts), so this never runs there.
import type { Notification, NotifyKind } from "../../shared/notification.ts";
import { quoteInNote } from "../peer-provenance.ts";
import { redactSecretsInText } from "../redact.ts";
import type { Message } from "../store.ts";

export const ASKS_THREAD_TITLE = "Waiting on you";

/** The notifications that are a bot asking the person for something they can give from a chat. */
export const ASKS_VIA_CHIEF: ReadonlySet<NotifyKind> = new Set(["question", "approval", "sign-in", "secret"]);

/** The person wrote the line this conversation's turn answers: they are in it, so its asks stay with them there. */
export function personInConversation(path: readonly Pick<Message, "role" | "peerAsk" | "relayed" | "via">[]): boolean {
  const last = path.findLast((line) => line.role === "user");
  return Boolean(last && !last.peerAsk && !last.relayed && last.via !== "api");
}

export function routesViaChief(notification: Pick<Notification, "kind" | "forPerson" | "groupId">, at: {
  enabled: boolean; team: boolean; routine: boolean; handedOn: boolean; personHere: boolean;
}): boolean {
  if (!at.enabled || at.team || notification.forPerson || notification.groupId || !ASKS_VIA_CHIEF.has(notification.kind)) return false;
  return at.routine || at.handedOn || !at.personHere;
}

/** The Chief's line in its notices chat, about the conversation that waits. */
export function askChip(botName: string, notification: Pick<Notification, "kind" | "body" | "title">): string {
  return `${botName} is waiting on you: ${redactSecretsInText(notification.body || notification.title).slice(0, 180)}`;
}

/** What starts the Chief's turn: what waits, where, and what the Chief may and may not do about it. */
export function askText(botName: string, title: string, notification: Pick<Notification, "kind" | "body" | "title">): string {
  const asked = quoteInNote(notification.body || notification.title, 600);
  const where = `in its conversation "${quoteInNote(title, 120)}"`;
  if (notification.kind === "question") {
    return `[OpenMausBot: @${botName} has a question for the person ${where}: ${asked}. Ask them in your own words here, in your chat with them. `
      + `When they answer, pass their reply to @${botName} with coordinate_bots, quoting their line whole; it carries on. Don't answer it yourself, `
      + "and don't guess for them. If it asks for a password, a code, a payment or a sign-in, tell them where it waits instead.]";
  }
  const what = notification.kind === "approval" ? "an approval" : notification.kind === "secret" ? "a password or key" : "a sign-in";
  return `[OpenMausBot: @${botName} is waiting on the person for ${what} ${where}: ${asked}. Only the person can give it, on the card in that conversation. `
    + "Tell them here, in one or two lines, what it is and where it waits. Never ask them to send you a password, code or card number, and don't try to give it yourself.]";
}
