---
title:  "How we merged several repos into one monolith at Tasq"
date: 2024-04-13T12:43:00
categories:
  - backend
  - tasq
---

At Tasq.io we had several repositories that were loosely connected but lived completely separate lives. Shared logic got copied from one place to another. Dependencies were tracked separately in each repo. CI/CD pipelines had to be maintained for every project on its own. Working across them felt messier than it needed to be, and I ended up leading the effort to pull everything into a single monolith.

It wasn't just a merge job. Looking at those repos closely, a lot of basic things were missing. Unit tests were thin or absent. Code style varied from file to file. The same utility functions existed in more than one place, so fixing a bug often meant hunting for every copy. If we were going to move everything into one repo, we had to clean that up along the way, not after.


#### **Why we made the move**

The pain was practical. When the same helper lived in three repos, a small change meant three pull requests and three chances to miss something. Dependency updates were the same story. You bump a library in one place, forget another, and suddenly two projects are out of sync. Deployments were harder than they should have been too, because each pipeline had its own quirks.

We chose [Polylith](https://polylith.gitbook.io/polylith) for the structure of the monolith. The idea appealed to me because it keeps things modular without forcing you back into separate repositories. Shared code can live once, and applications can still be composed from smaller pieces.


#### **What we walked into**

Before any code moved, the gaps were obvious.

Unit tests were scarce. Without them, I couldn't tell whether something still worked after it landed in the new repo. Code quality was uneven because there was no shared linting or formatting, so readability depended on whoever touched the file last. Duplication was everywhere. Shared functions had drifted apart over time, and updating one version while leaving another behind was a real risk.

So the migration became two jobs at once. Move the code, and raise the bar for what “done” meant.


#### **How Polylith shaped the layout**

Polylith gave us a way to keep the monolith organized without turning it into a pile of folders. Components are reusable modules with business logic. Bases are the layer where components come together into something runnable. Projects are the top-level applications that reuse those components instead of copying them.

That split mattered. We got one repository, but we didn't lose the ability to reason about boundaries.


#### **Pants for builds that didn't drag**

As the monolith grew, full rebuilds and full test runs would have slowed everyone down. [Pants](https://www.pantsbuild.org/) helped there. It builds only what changed, keeps dependencies isolated per module so version conflicts don't spill everywhere, and runs tests against the modules that are actually affected. CI got faster because we stopped paying for work that didn't need to happen.


#### **Making quality automatic**

After the code was in one place, I wanted quality checks to stop depending on memory. I added Black for consistent formatting, Ruff as a fast linter, and Sourcery to catch messy patterns and suggest cleaner ones.

These ran in a GitHub workflow, so every pull request got formatting and linting without someone having to remember to run the tools locally.


#### **Tests, one module at a time**

I didn't try to write a full suite for everything on day one. Before migrating a repository, I added tests around its core behavior, enough that we'd notice if something broke. After migration, those tests became part of the same GitHub workflow as the linting. I also set up coverage tracking so we could see what was still untested instead of guessing.


Looking back, the biggest wins were simple ones. One repo meant less jumping around and fewer places for the same bug to hide. Black, Ruff, and Sourcery kept the style from drifting again. Duplicated helpers got consolidated. Pants kept builds and tests from becoming a bottleneck.

It took longer than a straight copy-paste would have, and it needed a lot of small changes along the way. But we ended up with a monolith that was easier to work in day to day, and a setup that new work could grow into without repeating the same mess.
