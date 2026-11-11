# Graph Report - src  (2026-11-11)

## Corpus Check
- 23 files · ~4,276 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 116 nodes · 251 edges · 7 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `17a5c578`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- layout.tsx
- [locale]/page.tsx
- metadata.py
- getIcon
- lamda_function.py
- image/route.ts
- json

## God Nodes (most connected - your core abstractions)
1. `Link` - 15 edges
2. `getIcon()` - 15 edges
3. `HomePage()` - 8 edges
4. `Header()` - 8 edges
5. `extract_clean_exif()` - 7 edges
6. `extract_clean_exif()` - 7 edges
7. `S3Image()` - 6 edges
8. `SocialButton()` - 6 edges
9. `Logo()` - 6 edges
10. `extract_all_metadata()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Contact()` --calls--> `Link`  [EXTRACTED]
  src/app/[locale]/contacts/page.tsx → src/i18n/navigation.ts
- `SocialLinks()` --calls--> `SocialButton()`  [EXTRACTED]
  src/app/[locale]/contacts/page.tsx → src/components/SocialButton.tsx
- `HomePage()` --calls--> `Link`  [EXTRACTED]
  src/app/[locale]/page.tsx → src/i18n/navigation.ts
- `HomePage()` --calls--> `getIcon()`  [EXTRACTED]
  src/app/[locale]/page.tsx → src/utils/IconMap.tsx
- `S3Image()` --calls--> `getIcon()`  [EXTRACTED]
  src/components/S3image.tsx → src/utils/IconMap.tsx

## Import Cycles
- None detected.

## Communities (7 total, 0 thin omitted)

### Community 0 - "layout.tsx"
Cohesion: 0.18
Nodes (14): metadata, RootLayout(), Footer(), Header(), LanguageSelector(), Logo(), getPathname, Link (+6 more)

### Community 1 - "[locale]/page.tsx"
Cohesion: 0.15
Nodes (13): HobbieCard(), HomePage(), LanguageTag(), Portfolio(), Gallery(), GalleryProps, ImageMetadataResponse, Props (+5 more)

### Community 2 - "metadata.py"
Cohesion: 0.18
Nodes (9): calculate_ev(), dms_to_decimal(), extract_all_metadata(), extract_clean_exif(), format_aperture(), generate_blur_data_url(), get_basic_info(), parse_fraction() (+1 more)

### Community 3 - "getIcon"
Cohesion: 0.21
Nodes (12): Contact(), ContactList(), Contacts(), SocialLinks(), DarkModeToggle(), ThemeContext, useTheme(), DPIIcon() (+4 more)

### Community 4 - "lamda_function.py"
Cohesion: 0.23
Nodes (9): calculate_ev(), dms_to_decimal(), extract_all_metadata(), extract_clean_exif(), format_aperture(), generate_blur_data_url(), get_basic_info(), parse_fraction() (+1 more)

### Community 5 - "image/route.ts"
Cohesion: 0.21
Nodes (7): generateSignedUrl(), GET(), getAltFromKey(), privateKey, GET(), listAllObjects(), s3

### Community 6 - "json"
Cohesion: 0.40
Nodes (3): lambda_handler(), save_metadata_to_json(), save_metadata_to_json()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getIcon()` connect `getIcon` to `layout.tsx`, `[locale]/page.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Link` connect `layout.tsx` to `[locale]/page.tsx`, `getIcon`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `S3Image()` connect `[locale]/page.tsx` to `getIcon`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._