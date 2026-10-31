# Card Policy

Sources: `docs/prd.md` §5.8, §6.3, §8; App Store Review Guidelines 1.1.4 (no overtly sexual material), 1.4.3 (no encouraging excessive alcohol), 2.5.19 (no hidden features); Google Play sexual-content and alcohol policies. When this file and the PRD disagree, the PRD wins.

## Never, in Any Tier

| Rule                                        | Examples that fail                                                          |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| No nudity or underwear exposure             | showing a body part normally covered, stripping layers until underwear      |
| No sexual acts, simulated or described      | simulating sex, moaning, sexual positions, "escena sexual"                  |
| No touching intimate areas                  | butt, chest, groin — grabbing, spanking, licking                            |
| No bodily-fluid contact                     | passing a drink or ice mouth to mouth, licking someone                      |
| No sexual images                            | showing porn, nudes, or "fotos picantes"                                    |
| No insults or stereotypes                   | puss\*, loca, puto, marica as an insult, "masculinidad frágil", "gilipollas" / "pelotudo" as the price of a bad accent. Imitating an accent is fine; mocking the people is not |
| No people outside the room                  | reading someone's chats aloud, posting another person's photo, sexual or insulting messages to anyone |
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

## Heat Tiers

`heat` is set per card. `spicy` cards are the **Sin Filtro** layer (PRD §6.4): they only appear when the group turns on the paid, off-by-default switch, and only in `friends` (Amigos) categories. Couple-mode cards (Entre Dos) are always `standard`. Both tiers stay inside "Never" above — `spicy` is **not** a place for content the stores forbid.

| Tier       | Allowed                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `standard` | Flirting by words and looks, compliments, light contact with consent (hug, holding hands, cheek kiss), confessions about crushes and dates, embarrassing phone moments the player controls, performance and absurd comedy, putting on or swapping jackets, caps, glasses, and accessories (nothing comes off the body) |
| `spicy`    | Everything in `standard`, plus: kisses with mutual consent, sensual dancing without touching intimate areas, sitting on a lap or massage of neck/shoulders/hands with consent, removing shoes/socks/jacket/accessories, sexual confessions without graphic detail ("¿con quién?", "¿dónde fue lo más loco?"), innuendo and double meaning |

## Levels

| Level    | Points | Intensity                                                                                     |
| -------- | ------ | --------------------------------------------------------------------------------------------- |
| `easy`   | 1–10   | Anyone does it without thinking twice                                                         |
| `medium` | 11–20  | Makes the player hesitate: an audience, a confession, a bit of flirting                       |
| `hard`   | 21–30  | The one the group screams at: maximum social risk in the tier — eye contact, closeness, confessions, the group judges |

Higher points within a level = harder within that level.
