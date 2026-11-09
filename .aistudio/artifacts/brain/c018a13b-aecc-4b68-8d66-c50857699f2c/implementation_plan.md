# Social Share & Link Preview Update (Spel TV)

Update the link preview metadata, OpenGraph tags, Twitter cards, and HTML title so that sharing the application link on WhatsApp, iMessage, Discord, and social media displays the custom title "Spel TV" and description "Interactieve spellen en party tools voor elke gezellige avond".

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and will be applied:
> - **Share Title (`og:title` & `<title>`)**: **Spel TV**
> - **Share Description (`og:description` & `<meta name="description">`)**: **Interactieve spellen en party tools voor elke gezellige avond**

- **Confirmed Decision 1**: Update `index.html` with explicit OpenGraph tags (`og:title`, `og:description`, `og:site_name`, `og:type`), Twitter cards (`twitter:title`, `twitter:description`), and standard HTML metadata.
- **Confirmed Decision 2**: Add Schema.org structured data (JSON-LD) for `WebApplication` matching the Spel TV identity to improve search indexing and link unfurling.

---

## 1. Overview & Core Concept

- **What It Does**: When users share the URL of the app via chat apps (WhatsApp, iMessage, Telegram, Messenger) or social platforms (Discord, Twitter/X, Facebook, LinkedIn), the link unfurls with a rich card preview displaying "Spel TV" as the title and "Interactieve spellen en party tools voor elke gezellige avond" as the description.
- **Target Audience**: Players and friends receiving an invitation link to join the party games or Pub Golf.
- **Key Value**: Professional, inviting, and personalized first impression when forwarding the game link.

---

## 2. User Experience & Visual Design

- **Link Unfurl Card Layout (WhatsApp / iMessage / Discord)**:
  - **Title**: **Spel TV**
  - **Description**: **Interactieve spellen en party tools voor elke gezellige avond**
  - **Site Name**: **Spel TV**
  - **Image / Favicon**: Displays the existing high-resolution party icon asset (`/pwa-512x512.png` / `/apple-touch-icon.png`).
- **Browser Tab**:
  - The browser tab title displays: `Spel TV` (or `Spel TV – Party Games & Tools`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full OpenGraph & Twitter Compatibility**:
  - *Chosen Approach*: Implement both `og:*` and `twitter:*` tags alongside standard `<meta name="description">` in `index.html`.
  - *Why*: WhatsApp, Facebook, and LinkedIn prioritize `og:*`, while Twitter/X and Discord use a combination of `og:*` and `twitter:*`. This ensures uniform link previews across all messenger and social platforms.
- **Decision 2: Schema.org Structured Data**:
  - *Chosen Approach*: Add JSON-LD metadata for a `WebApplication` in `index.html`.
  - *Why*: Enhances modern web crawler recognition and rich link previews.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       index.html                            │
│                                                             │
│   <title>Spel TV</title>                                    │
│   <meta name="description" content="Interactieve..." />     │
│                                                             │
│   <!-- OpenGraph (WhatsApp / iMessage / Socials) -->        │
│   <meta property="og:title" content="Spel TV" />            │
│   <meta property="og:description" content="Interactieve..." │
│   <meta property="og:site_name" content="Spel TV" />        │
│   <meta property="og:type" content="website" />             │
│   <meta property="og:image" content="/pwa-512x512.png" />   │
│                                                             │
│   <!-- Twitter / X Cards -->                                │
│   <meta name="twitter:card" content="summary_large_image" />│
│   <meta name="twitter:title" content="Spel TV" />           │
│   <meta name="twitter:description" content="..." />         │
│   <meta name="twitter:image" content="/pwa-512x512.png" />  │
│                                                             │
│   <!-- Schema.org WebApplication JSON-LD -->                │
│   <script type="application/ld+json"> ... </script>         │
└─────────────────────────────────────────────────────────────┘
```

### Steps for Execution:
1. Update `index.html` with:
   - `<title>Spel TV</title>`
   - `<meta name="description" content="Interactieve spellen en party tools voor elke gezellige avond" />`
   - `<meta property="og:title" content="Spel TV" />`
   - `<meta property="og:description" content="Interactieve spellen en party tools voor elke gezellige avond" />`
   - `<meta property="og:site_name" content="Spel TV" />`
   - `<meta property="og:image" content="/pwa-512x512.png" />`
   - `<meta name="twitter:title" content="Spel TV" />`
   - `<meta name="twitter:description" content="Interactieve spellen en party tools voor elke gezellige avond" />`
   - `<meta name="twitter:image" content="/pwa-512x512.png" />`
   - `<script type="application/ld+json">` for WebApplication structured data.
2. Verify build and lint via `compile_applet` and `lint_applet`.
3. Restart dev server.
