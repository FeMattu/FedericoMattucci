# Content mapping: where each piece of content comes from

The database is seeded by `prisma/seed.ts` from `prisma/seed-data.ts`. The source is your updated LaTeX CV
(`CV-LaTex/CV.tex`) plus the contact links of the previous site (`public/data/contacts.json`). Nothing is invented:
what the CV does not say is left empty and editable from `/admin`.

The seed is **idempotent and create-only**: every row is created with `upsert` and an empty `update`, so running it
again never overwrites anything you changed in the admin. (Verified: a manual edit survived a second run.)

Italian texts are translations of the CV wording; the English texts are the CV wording itself.

## CV.tex -> database

| CV.tex section / line                                   | Stored as                                              | Seed key / slug                                   |
| ------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------- |
| Header: name                                            | fixed in the hero                                      | -                                                 |
| Header: location "Lucca, Italy"                         | `SiteText`                                             | `hero.location`                                   |
| Header: e-mail, phone                                   | `SocialLink` (`email`, `phone`)                        | -                                                 |
| Header: LinkedIn                                        | `SocialLink` (`linkedin`)                              | -                                                 |
| Professional Summary                                    | `SiteText`                                             | `about.bio`                                       |
| (derived) role line                                     | `SiteText`                                             | `hero.role`                                       |
| Certifications & Interests: Interests                   | `SiteText`                                             | `about.interests`                                 |
| Education: MSc Computer Science - AI (Sep 2026 - now)   | `Education`                                            | `unipi-msc-computer-science-ai`                   |
| Education: BSc Computer Science (+ thesis, Erasmus+)    | `Education` (thesis and Erasmus+ as highlights)        | `unipi-bsc-computer-science`                      |
| Education: I.T.I. E. Fermi (2018 - 2023)                | `Education`                                            | `iti-fermi-it-telecommunications`                 |
| Work: JEVIS - IT Senior Associate (Feb 2026 - now)      | `Experience`                                           | `jevis-it-senior-associate`                       |
| Work: JEVIS - IT Deputy Head (Sep 2025 - Feb 2026)      | `Experience`                                           | `jevis-it-deputy-head`                            |
| Work: JEVIS - IT Junior Associate (Apr - Sep 2025)      | `Experience`                                           | `jevis-it-junior-associate`                       |
| Work: Hastega (Demcode Srl SB), Jun - Nov 2024          | `Experience`                                           | `hastega-full-stack-developer`                    |
| Work: Freelance Web Developer & Consultant              | `Experience` (clients named in the text)               | `freelance-web-developer`                         |
| Work: TFP Watch, Sep 2023 - Jun 2026                    | `Experience`                                           | `tfp-watch-social-media-photographer`             |
| Certifications: IELTS 6.5                               | `Certification`                                        | `ielts-6-5`                                       |
| Certifications: BLSD                                    | `Certification`                                        | `blsd`                                            |
| Certifications: Workplace Health & Safety (D.Lgs. 81/2008) | `Certification`                                     | `workplace-safety-d-lgs-81-2008`                  |
| Technical Skills: Programming Languages                 | `SkillCategory` + `Skill`                              | `programming-languages-*`                         |
| Technical Skills: Frameworks & Libraries                | `SkillCategory` + `Skill`                              | `frameworks-libraries-*`                          |
| Technical Skills: DevOps & Tools                        | `SkillCategory` + `Skill`                              | `devops-tools-*`                                  |
| Technical Skills: Networking                            | `SkillCategory` + `Skill`                              | `networking-*`                                    |
| Technical Skills: Spoken Languages (Italian, English)   | `SkillCategory` "Languages" + `Skill`                  | `spoken-languages-italiano`, `-english`           |
| Freelance clients: Ethibit Srl, EIS Versilia, AGB Design | `Project` **drafts** (title only, hidden)             | `ethibit`, `eis-versilia`, `agb-design`           |

## Other sources

| Content                                  | Source                                                              | Notes                                                     |
| ---------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| GitHub, Instagram links                  | `public/data/contacts.json` of the previous site (tracking parameters removed) | `SocialLink`                           |
| Profile photo (round, in the hero)       | S3 `profile/profile.jpg`, the photo of the previous site            | `SiteText` `hero.avatar`; replace it from *Site texts -> Profile photo* |
| Photos (15)                              | S3 bucket `portfolio/` + the Lambda sidecar JSON next to each image | `npm run photos:import` (create-only; folders become albums) |

## Deliberately left empty (fill in from `/admin`)

- **Skill levels** and years of experience: the CV does not rate skills, so no dots are shown until you set a level.
- **Project details** (summary, screenshots, links, technologies) for Ethibit, EIS Versilia and AGB Design. They are
  saved as drafts; publish them once they are filled in.
- **CV download**: add the link in *Site texts -> CV download link* (per language) and the "Download CV" button appears.
- **Photo titles, descriptions, alt texts, places and tags**: 4 of the 15 photos have no metadata sidecar in S3, so they
  have no size or EXIF yet (they use a 3:2 box until you re-upload them).
- **Hobbies** from the old site (technology, cooking, sports, travel): not in the CV, so not seeded. They can be added
  as site texts or a new section if you want them back.

## Previous-site content not carried over

`public/languages/*.json` (old UI strings and descriptions) and `public/data/*.json` were the previous content source.
The new UI strings live in `src/i18n/messages/{it,en}.json` and all content in the database.
