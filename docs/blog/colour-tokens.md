---
title: Teaching My Blog to See More Colour
date: 2026-11-01
description: A small markdown plugin that turns a hex code into a clickable copy-paste token
tags: ["meta", "design", "vitepress"]
---

# Teaching My Blog to See Colour

I write about design fairly often and one main problem I keep running into when writing sentences like "the accent is `#e8cb91` and the ink is `#0f172a`" is that rereading them later gives absolutely no idea what those colours actually look like.

Hex codes are precise and somewhat unmemorable, So this site now renders any hex codes written in backticks as a colour token: it shows the colour itself, picks a legible text tint for it, and copies to your clipboard when clicked. Hover one and it lifts slightly 😎.

## Why this needed more than a component

The obvious idea is "wrap it in a Vue component and be done" but that didn't work...

By the time Vue is rendering, VitePress has already turned my markdown into HTML. A code span like `` `#e8cb91` `` is no longer a string by then it's a finished `<code>` element in a render tree. No component can reach back and rewrite it because there's nothing left to rewrite. The token has to be transformed **before** HTML exists, which means reaching into the markdown compiler itself.

The work is split cleanly in two:

- **A markdown plugin** finds hex codes in the token stream and swaps them for a component tag. It knows nothing about clicks or hovers.
- **A Vue component** owns everything that's interactive; the clipboard call, the hover lift and the "Copied!" tooltip (using my cool new [Frontend Component Library](lotus-library.jdlanyon.dev) btw).

Detection occurs at build time with the behaviour at runtime. I already do this for ordinary `[links](https://example.com)` where a plugin just rewrites them into `<GlitchLink>` so they get the hover glitch for free 🧠🎮.

## The rule is deliberately narrow

Only a code span that is *entirely* a hex code becomes a token. Three, six or
eight digits, only. That constraint does a lot of quiet work:

- A URL fragment like `https://example.com/#foo` stays a plain code span because it isn't only a hex code. The guard runs on the whole token, not a substring - `` `the ink is #0f172a` `` stays plain too, a trade-off that's fine for now tbh.

```css
  --primary: #e8cb91;
```

- Inside a link, hex codes stay as code. `` [`#e8cb91`](https://example.com) `` is not a colour token, because a clickable button nested inside an anchor is invalid HTML and behaves badly for keyboard and screen-reader users.

## The legibility problem

A colour token that shows a colour is, by definition, sometimes unreadable. `#f5f0e1` as text on a near-white page basically disappears, same with `#161616` on a near-black page.

Rather than let authors worry about it, the plugin computes each colour's relative luminance at build time, the same W3C formula browsers use, tagging the token `light` or `dark`. CSS then does the rest per theme.

- Colours that already contrast on the page are printed in their own colour.
- Colours that would vanish are pulled toward the opposite end of the scale,
  just enough to read, while still obviously being that colour.

The result is that every colour below stays readable in both light and dark mode, without me thinking about it while writing.

`#e8cb91` `#7a5230` `#f5f0e1` `#161616` `#ff0000` `#2d6a4f` `#1d3557` `#e63946` `#a8dadc` `#457b9d` `#ffbe0b` `#8338ec` `#06d6a0`

here's a pastel spectrum :>

`#ffadad` `#ffd6a5` `#fdffb6` `#caffbf` `#9bf6ff` `#a0c4ff` `#bdb2ff` `#ffc6ff`

And the deeper end of the same idea, for contrast:

`#e63946` `#f4a261` `#e9c46a` `#2a9d8f` `#264653` `#6d597a` `#3d405b`

A warm-to-cool sweep gradient:

`#f94144` `#f3722c` `#f8961e` `#f9c74f` `#90be6d` `#43aa8b` `#577590`

## What this unlocks

Colour is one of those things that's difficult to describe verbally yet trivial to show.
I'll definitely be using this in future posts, if this feels small that's because it is, but it's  exactly the kind of small thing worth implementing for the fun of it.
