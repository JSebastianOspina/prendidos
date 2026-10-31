---
description: Trial of the write-cards skill writing 12 new cards after adding outside-the-room dares (calls, messages, social media) and the mechanics catalogue — output, review notes, and the skill fixes it triggered.
alwaysApply: false
---

# Trial: New Cards with Outside-the-Room Dares

**Question:** with calls, messages, and social media allowed (PRD §6.3), and a catalogue of dare families (`ai-specs/skills/write-cards/references/mechanics.md`), does the skill write varied, fun cards without sexual themes?

**Method:** a fresh agent with the skill wrote 12 new `la-previa` challenges: 6 `standard`, 6 `spicy`, 4 per level, at least 4 reaching outside the room and 2 closeness dares. Fun scores are one reviewer's judgment.

## Output

| Headline                     | Dare (short)                                                                                       | Tier · level | Family      | Fun |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | ------------ | ----------- | --- |
| Consúltele a la experiencia  | Call a grandparent on speaker and ask for their best trick to flirt at a party                     | S · e        | Calls       | ★4  |
| Pulgares en guerra           | Thumb war while holding eye contact; whoever looks away or laughs loses                            | S · e        | Closeness   | ★3  |
| Autocorrect time             | Type "Familia, hoy aprendí que" in the family group, let autocomplete add 8 words, send it          | S · m        | **New**     | ★5  |
| Dé la charla, pues           | 15-second story giving a serious motivational talk on a topic the group picks; 30 minutes up       | S · m        | Social      | ★4  |
| Llegó la serenata            | Call family or a friend the group picks and sing them a ballad chorus, no explaining until they react | S · h      | Calls       | ★5  |
| Momento chismoso de la noche | Everyone points at whoever knows your worst story; they tell it and you can't deny it              | S · h        | **New**     | ★5  |
| Uy parce, sin contexto       | Send your crush only 👀, 🔥, or 😏 (group picks); read the reply aloud                                | SF · e       | Messages    | ★4  |
| Manos a la obra              | 30-second hand massage, eyes locked, in silence                                                    | SF · e       | Closeness   | ★3  |
| Se calentó esta historia     | Story with the cheesiest song and "usted sabe quién es"; 20 minutes up                             | SF · m       | Social      | ★4  |
| Radio time                   | Read your last message to your crush or ex in a late-night radio voice; the group votes            | SF · m       | Phone       | ★5  |
| Uyy pana, de malas           | Group picks ex or crush; call on speaker and ask "¿qué fue lo primero que le gustó de mí?"          | SF · h       | Calls       | ★5  |
| Se puso seria la vuelta      | Selfie kissing someone's cheek, posted with the caption *they* write; 20 minutes up                | SF · h       | Social      | ★5  |

Average ★4.4. Nothing sexual, every card doable sober, gender-safe throughout, 2 mechanics invented outside the catalogue.

## Review Notes

- **Best:** the call and social cards. The group choosing the contact or the text gives `hard` cards real stakes without any touch.
- **Weakest:** the two touch-light closeness cards (thumb war, hand massage) — fine fillers, not memorable.
- **Borderline:** "Se calentó esta historia" originally asked the player to say who replied; that names outsiders. The skill now says to count reactions instead of naming them.

## Skill Fixes from This Run

| Gap the agent reported                                         | Fix                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Fallback and "blocked contact" rules don't fit a ~35-word body | New `reachesOutside` flag: the app shows the shared outside-contact rules, like `requiresConsent` |
| "Read the reply aloud" vs "never read others' chats" is vague  | Replies to what the player sent in this dare are fine; older chats and naming reactors are not |
| Does a thumb war need consent?                                 | Any touch does; eye contact alone doesn't                                            |
| `sourceLegacyId` and emoji for new cards                       | `null` for new cards; emoji only when they are the object of the dare                |

These fixes were not re-tested.
