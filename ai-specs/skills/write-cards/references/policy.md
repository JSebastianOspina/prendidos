# Card Policy

Sources: `docs/prd.md` §5.8, §6.3, §8; App Store Review Guidelines 1.1.4 (no overtly sexual material), 1.4.3 (no encouraging excessive alcohol), 2.5.19 (no hidden features); Google Play sexual-content and alcohol policies. When this file and the PRD disagree, the PRD wins.

**Mechanical rules are enforced in code.** `validateCards` (`src/features/content/validate-cards.ts`) checks IDs, points ranges, 1–3 drinks, required fields per card type, copy length (headline ≤ 45, body ≤ 240 characters in the longest variant), `spicy` only in `friends` categories, banned phrases, and placeholder / variant syntax. This file covers the judgment calls the validator can't make.

## Never, in Any Tier

| Rule                                        | Examples that fail                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| No nudity or underwear exposure             | showing a body part normally covered, stripping layers until underwear      |
| No sexual acts, simulated or described      | simulating sex, moaning, sexual positions, "escena sexual"                  |
| No touching intimate areas                  | butt, chest, groin — grabbing, spanking, licking                            |
| No bodily-fluid contact                     | passing a drink or ice mouth to mouth, licking someone                      |
| No sexual images                            | showing porn, nudes, or "fotos picantes"                                    |
| No insults or stereotypes                   | puss\*, loca, puto, marica as an insult, "masculinidad frágil", "gilipollas" / "pelotudo" as the price of a bad accent. Imitating an accent is fine; mocking the people is not |
| No exposing or hurting people outside the room | reading someone's chats aloud, screenshots of their messages, posting their photo, telling their secrets, sexual or insulting messages (see "Outside the Room" for what is allowed) |
| No drinking beyond the penalty              | sips as part of the dare, tastings, "un trago por cada reacción", fondo blanco |
| No illegal drugs, danger, or law-breaking   | driving, heights, fire, stealing                                            |

## Drinking

- Drinking appears **only** in `penalty.drinks`: 1, 2, or 3. Never in `body`.
- The dare must be fully playable by someone who doesn't drink (they get an alternative penalty if they refuse).
- Never scale drinks with time, reactions, or repetitions. Never "fondo blanco" or finishing a drink.
- Group cards ("Yo nunca", "Todos los que…") say who drinks; the app adds the amount. Max 1–2.

## Drinks by Level

| Level    | `penalty.drinks` |
| -------- | ---------------- |
| `easy`   | 1                |
| `medium` | 1–2              |
| `hard`   | 2–3              |

When rewriting, keep the legacy count if it fits this table; otherwise use the nearest allowed value.

## Consent

Any dare that involves touching or being very close to another player sets `requiresConsent: true`. The app shows the consent rule on the card ("Solo si la otra persona acepta; si no, escoge a otra"), so **don't repeat it in `body`**. Write the body as if the other person already said yes.

- The person who says no is never penalized, and nothing pressures them ("si no quiere, se toman los dos" fails).
- Fixed targets ("la persona de su derecha") fall back to anyone else who accepts. If nobody accepts, the dare counts as completed.
- It applies both ways: when the player touches someone, and when someone touches the player.
- Any touch counts, even a thumb war or a hand massage. Eye contact or sitting near someone without touching does not need it.

## Outside the Room

Calls, voice notes, messages, and social media posts are encouraged: they add embarrassment and variety without touching sexual themes. **The joke is always on the player, never on the person outside.**

| Allowed                                                                                  | Never                                                                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Calling or messaging the ex, the crush, the *culito* / *pétalo*, parents, grandparents, friends, the family group | Contacting someone who blocked the player or asked for no contact — pick someone else     |
| Speakerphone, so the group hears the answer                                              | Sexual content, insults, or pressure aimed at the recipient                                 |
| Harmless lies the player reveals before hanging up ("me voy a vivir a Cartagena")         | Fake emergencies or alarming news (accidents, pregnancy, arrests, money problems), asking for money |
| Posts from the player's own account: stories, statuses, profile photo, bio, a like, a comment | Posting someone absent, or someone present who didn't accept (`requiresConsent: true`)     |
| A time limit before deleting ("no lo borre en 15 minutos") or a temporary change ("1 hora") | Posts that must stay up for good, or anything that can cost a job (bosses, clients, work groups) |
| Letting the group choose the recipient or the text                                       | Minors as recipients                                                                        |

- Set `reachesOutside: true` on these cards. The app then shows the shared rules on the card ("Nunca a quien te bloqueó · sin señal, sin redes o sin respuesta: cuenta como cumplido"), so **don't repeat them in `body`**. Add a specific fallback in `body` only when it is part of the joke ("si no contesta, va en nota de voz").
- Reading aloud the reply to what the player just sent in this dare is fine. Older chats, other people's messages, and naming who reacted to a post are not (say how many reacted instead).
- Outside-the-room dares fit any level. Who is on the other end sets the heat: parents, friends, and family are `standard`; ex, crush, and *culito* with flirting are `spicy`.

## Heat Tiers

`heat` is set per card. `spicy` cards are the **Sin Filtro** layer (PRD §6.4): they only appear when the group turns on the paid, off-by-default switch, and only in `friends` (Amigos) categories. Couple-mode cards (Entre Dos) are always `standard`. Both tiers stay inside "Never" above — `spicy` is **not** a place for content the stores forbid.

| Tier       | Allowed                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `standard` | Flirting by words and looks, compliments, light contact with consent (hug, holding hands, cheek kiss), confessions about crushes and dates, embarrassing phone moments the player controls, performance and absurd comedy, putting on or swapping jackets, caps, glasses, and accessories (nothing comes off the body), sitting close, staring contests, and hugs with consent, calls and posts involving parents, friends, or family |
| `spicy`    | Everything in `standard`, plus: kisses with mutual consent, sensual dancing without touching intimate areas, sitting on a lap or massage of neck/shoulders/hands with consent, removing shoes/socks/jacket/accessories, sexual confessions without graphic detail ("¿con quién?", "¿dónde fue lo más loco?"), innuendo and double meaning, flirty calls or messages to the ex, crush, or *culito*, posts that suggest a romance with someone present |

## Levels

| Level    | Points | Intensity                                                                                     |
| -------- | ------ | --------------------------------------------------------------------------------------------- |
| `easy`   | 1–10   | Anyone does it without thinking twice                                                         |
| `medium` | 11–20  | Makes the player hesitate: an audience, a confession, a bit of flirting                       |
| `hard`   | 21–30  | The one the group screams at: maximum social risk in the tier — eye contact, closeness, confessions, the group judges |

Higher points within a level = harder within that level.
