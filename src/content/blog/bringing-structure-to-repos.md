---
title:  "Getting our pull requests under control at Tasq"
date: 2023-06-11T11:30:00
categories:
  - backend
---

When I joined Tasq, there was no shared way of shipping code. Some people pushed straight to main. Others opened pull requests with no description, no testing notes, and no real review. You often found out about a change only after it was already live, and bugs that a second pair of eyes would have caught slipped through.

I wrote a set of **PR guidelines** so the team had one clear path from writing code to merging it. This is what that looked like and what changed after we started using it.


#### **What was going wrong**

The problems were ordinary ones, but they stacked up.

PRs were inconsistent. Many had no note on what broke, how it was fixed, or how to test it. People worked in isolation, so the rest of the team had little idea what was landing. Reviews were light or missing, which meant quality issues and style drift showed up late, when they cost more to fix.

I wanted something simple enough that people would actually follow it, not a binder of process nobody opens.


#### **A workflow you can see**

I mapped the life of a PR into a few stages and made each one visible with labels.

**Code** is where you draft the PR and clean it up before asking for a formal look. **Review** is where peer and sentinel feedback happens. **Pre-Merge** is for the last non-code work, things like docs or migration scripts. **Merged** means it is done and the checks are complete.

Labeling each PR by stage meant anyone could open the board and see where work sat without chasing people on Slack.


#### **Checklists so steps stop getting skipped**

I added checklists in GitHub so the same questions got asked every time.

There was a **peer review** and **code review** checklist covering clarity, behavior, and acceptance criteria. A **testing** checklist pushed for real coverage before approval. A **pre-merge** checklist caught the boring stuff we used to forget, especially documentation and migrations.

None of this was clever. It just made the baseline harder to miss.


#### **Peer review and sentinel review**

Reviews needed clearer roles, so I split them.

A **sentinel review** came from a senior engineer with merge access. That was the quality gate. A PR did not leave the review stage without it. A **peer review** came from engineers without merge access. That kept juniors in the loop, spread knowledge, and caught issues early without blocking the merge path.

I also wrote down what a good review was aiming for. **Quality**, **appropriateness**, **acceptance criteria**, **learning**, and **documentation**. Having those five written down stopped reviews from becoming either rubber stamps or endless style debates.


#### **Labels for tracking**

Beyond the stage labels, each PR carried status labels so progress was obvious at a glance.

**Documentation Required** and **Documentation Complete**. **Peer Reviewed** and **Peer Tested**. **QA Approved** and **Sentinel Approved**.

Only the right people could apply certain labels. QA owned their approval. Sentinels owned theirs. That cut down on confusion about whether something was actually ready.


#### **Moving off Gitflow**

While we were fixing PRs, the branching model started to look wrong too. We were on **Gitflow**, and long-lived branches were slowing us down. Merge conflicts piled up, and releases dragged.

We moved to **trunk-based development**. Branches lived shorter. Merges to main happened more often and in smaller chunks.

Merge conflicts got smaller and showed up earlier. Releases got simpler because we were not juggling a pile of feature branches. People also saw each other's work sooner, which made reviews more useful. If you want the deeper comparison, [CircleCI has a solid write-up](https://circleci.com/blog/trunk-vs-feature-based-dev/).


#### **What we asked of every PR**

A few habits did most of the work.

Write a clear description of the problem, the approach, and how to test it. Keep commit messages short and useful so history stays readable. Keep PRs small enough that a reviewer can actually finish them. Big PRs look productive and then hide bugs.

I also wrote a short note on tone. Reviewers should explain why a change matters, not just what to change. PR owners should self-review first, then treat feedback as something to talk through, not something to defend against.


#### **What changed**

After the guidelines and the move to trunk-based development, the day to day felt different. PRs had context. Reviews had a purpose. Merges were smaller and less scary. The team spent less time asking where something stood and more time improving the code itself.

The useful part for me was learning that process only works when it is visible, light, and owned by the people using it. You do not need a heavyweight system. You need enough structure that shipping stops depending on who happens to be careful that week.
