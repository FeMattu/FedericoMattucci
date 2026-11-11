# Graph Report - src  (2026-11-11)

## Corpus Check
- 121 files · ~30,014 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 650 nodes · 1847 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4157cd5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- repositories/admin.ts
- sidebar.tsx
- Button
- photo-lightbox.tsx
- site-header.tsx
- uploads.ts
- service.ts
- lamda_function.py
- [locale]/page.tsx
- sortable-list.tsx
- projects/[slug]/page.tsx
- ref_next
- index.ts
- [locale]/layout.tsx
- content/photos.ts
- ref_next_intl
- select.tsx
- config.ts
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `Button()` - 51 edges
2. `Badge()` - 24 edges
3. `requireAdmin()` - 20 edges
4. `localize()` - 18 edges
5. `SiteHeader()` - 16 edges
6. `errorMessage()` - 16 edges
7. `Link` - 15 edges
8. `AdminSidebar()` - 14 edges
9. `ResourceForm()` - 14 edges
10. `Input()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ContactForm()` --indirect_call--> `sendContact()`  [INFERRED]
  src/components/home/contact-form.tsx → src/actions/contact.ts
- `SidebarInput()` --calls--> `Input()`  [EXTRACTED]
  src/components/ui/sidebar.tsx → src/components/ui/input.tsx
- `isProjectKey()` --calls--> `isSafeKey()`  [EXTRACTED]
  src/lib/uploads/validate.ts → src/lib/storage/signing.ts
- `authorize()` --calls--> `assertAdmin()`  [EXTRACTED]
  src/actions/admin-site.ts → src/lib/auth/session.ts
- `saveSiteText()` --calls--> `cleanLocalized()`  [EXTRACTED]
  src/actions/admin-site.ts → src/lib/admin/schema.ts

## Import Cycles
- None detected.

## Communities (19 total, 1 thin omitted)

### Community 0 - "repositories/admin.ts"
Cohesion: 0.05
Nodes (58): LanguagesPage(), metadata, DashboardPage(), metadata, metadata, PhotoEditPage(), Props, metadata (+50 more)

### Community 1 - "sidebar.tsx"
Cohesion: 0.06
Nodes (43): AdminLayout(), signOutAction(), signOut, AdminHint(), AdminSidebar(), GROUPS, Props, LevelDots() (+35 more)

### Community 2 - "Button"
Cohesion: 0.09
Nodes (47): addLocale(), authorize(), deleteMessage(), refresh(), saveSiteText(), setLocaleEnabled(), setMessageRead(), ErrorPage() (+39 more)

### Community 3 - "photo-lightbox.tsx"
Cohesion: 0.09
Nodes (33): ConfirmDialog(), Props, Props, PhotoLightbox(), Props, Row(), CommandDialog(), CommandInput() (+25 more)

### Community 4 - "site-header.tsx"
Cohesion: 0.10
Nodes (27): AdminToolbar(), LanguageSwitcher(), SiteHeader(), useActiveSection(), ThemeToggle(), useIsAdmin(), DropdownMenu(), DropdownMenuContent() (+19 more)

### Community 5 - "uploads.ts"
Cohesion: 0.09
Nodes (32): ActionResult, authorize(), registerPhoto(), requestUpload(), storage(), slugBase(), compactExif(), formatExposureSeconds() (+24 more)

### Community 6 - "service.ts"
Cohesion: 0.09
Nodes (29): ContactState, ContactValues, sendContact(), MessagesPage(), metadata, cache, env(), EnvGroup (+21 more)

### Community 7 - "lamda_function.py"
Cohesion: 0.11
Nodes (21): calculate_ev(), dms_to_decimal(), extract_all_metadata(), extract_clean_exif(), format_aperture(), generate_blur_data_url(), get_basic_info(), lambda_handler() (+13 more)

### Community 8 - "[locale]/page.tsx"
Cohesion: 0.14
Nodes (20): HomePage(), Props, revalidate, DetailLink, Props, ContactSection(), icons, Social (+12 more)

### Community 9 - "sortable-list.tsx"
Cohesion: 0.17
Nodes (21): ActionError, authorize(), deleteItem(), duplicateItem(), mapError(), reorderItems(), resolve(), revalidateSite() (+13 more)

### Community 10 - "projects/[slug]/page.tsx"
Cohesion: 0.13
Nodes (23): EducationPage(), generateMetadata(), generateStaticParams(), Props, revalidate, ExperiencePage(), generateMetadata(), generateStaticParams() (+15 more)

### Community 11 - "ref_next"
Cohesion: 0.14
Nodes (12): LoginPage(), signInWithGitHub(), metadata, Props, auth, handlers, signIn, isAdminEmail() (+4 more)

### Community 12 - "index.ts"
Cohesion: 0.18
Nodes (21): generateMetadata(), getHomeContent, HomeContent, labelsFor(), collectTags(), EducationRow, EducationView, ExperienceRow (+13 more)

### Community 13 - "[locale]/layout.tsx"
Cohesion: 0.18
Nodes (9): AdminRootLayout(), metadata, LocaleLayout(), Props, SiteFooter(), ThemeProvider(), Toaster(), TooltipProvider() (+1 more)

### Community 14 - "content/photos.ts"
Cohesion: 0.17
Nodes (14): PhotosPage(), Props, revalidate, PhotoGallery(), toAlbumViews(), getPhotosContent, PhotosContent, cdnUrl() (+6 more)

### Community 15 - "ref_next_intl"
Cohesion: 0.22
Nodes (9): NotFound(), getPathname, redirect, routing, config, hasSessionCookie(), intl, proxy() (+1 more)

### Community 16 - "select.tsx"
Cohesion: 0.22
Nodes (3): SelectContent(), SelectScrollDownButton(), SelectScrollUpButton()

### Community 17 - "config.ts"
Cohesion: 0.28
Nodes (7): defaultLocale, Locale, localeNames, isRecord(), LocalizedList, LocalizedText, missingLocales()

## Knowledge Gaps
- **1 isolated node(s):** `{ GET, POST }`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 180 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button()` connect `Button` to `repositories/admin.ts`, `sidebar.tsx`, `photo-lightbox.tsx`, `site-header.tsx`, `[locale]/page.tsx`, `sortable-list.tsx`, `ref_next`, `content/photos.ts`, `ref_next_intl`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **What connects `{ GET, POST }` to the rest of the system?**
  _1 weakly-connected nodes found - possible missing edges._
- **Should `repositories/admin.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05221518987341772 - nodes in this community are weakly interconnected._
- **Why does `Badge()` connect `[locale]/page.tsx` to `repositories/admin.ts`, `sidebar.tsx`, `Button`, `photo-lightbox.tsx`, `sortable-list.tsx`, `projects/[slug]/page.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `sidebar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05879917184265011 - nodes in this community are weakly interconnected._
- **Why does `localize()` connect `index.ts` to `repositories/admin.ts`, `photo-lightbox.tsx`, `uploads.ts`, `content/photos.ts`, `config.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.09420289855072464 - nodes in this community are weakly interconnected._