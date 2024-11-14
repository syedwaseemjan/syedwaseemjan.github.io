---
layout: post
title:  "Bringing Structure to Our Pull Request Process: How I Developed PR Guidelines for My Team at Tasq"
date:   2023-06-11 11:30:00
categories: backend
---

When I joined Tasq, the engineering team had yet to adopt a consistent pull request (PR) workflow. Many developers were pushing changes directly to the main branch without PRs, while others created PRs without descriptions, context, or reviews. This approach left little visibility into changes for the rest of the team, made it difficult to understand the intent behind updates, and often led to unnoticed bugs or misalignments with project goals.

Seeing this gap in our process, I set out to develop a comprehensive set of PR guidelines. These would ensure each PR was crafted thoughtfully, reviewed carefully, and documented thoroughly. In this post, I’ll share the guidelines I established, the challenges they addressed, and the improvements we saw as a result.

### 1. **Identifying the Problem: A Lack of Structure and Visibility**

Before implementing these guidelines, our team faced several challenges:

- **No Standard Process**: Some developers pushed changes without PRs, and even when PRs were created, there was no consistency. Many PRs lacked descriptions of the problem, how to test the solution, and reasoning behind the changes.
- **Limited Collaboration**: Without a clear process, changes were often made in isolation. Other developers were left in the dark regarding recent modifications, impacting both project visibility and collaboration.
- **Quality Control Issues**: The absence of structured reviews led to frequent issues with code quality. Without a second set of eyes, bugs and stylistic inconsistencies were harder to catch, resulting in more work later to clean up issues.

To address these issues, I developed a set of PR guidelines that would instill a culture of transparency, consistency, and collaboration within our team.

### 2. **Creating a Clear, Visual PR Workflow**

To provide structure from start to finish, I mapped out a **PR Workflow** with distinct stages that were easy to follow and track:

- **Stage 1: Code** – Developers start by drafting their PRs, which gives them a chance to refine their work before it’s ready for formal review.
- **Stage 2: Review** – This stage focuses on feedback and iteration. Developers go through both peer and sentinel reviews (more on these below) to ensure the code is in good shape.
- **Stage 3: Pre-Merge** – In this stage, any last non-code tasks (documentation updates, migration scripts) are finalized.
- **Merged** – The PR is closed and changes are merged, with all necessary checks in place.

To make this process visible to everyone, each PR is labeled according to its current stage, so team members can quickly identify where a PR stands in the pipeline.

### 3. **Introducing Checklists for Consistency and Quality Assurance**

One of the first improvements was adding structured checklists in GitHub. Each checklist serves a specific purpose:

- **Peer Review** and **Code Review Checklists** help reviewers focus on important areas, such as code clarity, functionality, and alignment with acceptance criteria.
- **Testing Checklist** prompts developers and reviewers to verify test coverage, ensuring that each PR meets our testing standards before it’s approved.
- **Pre-Merge Checklist** reminds developers to complete any final tasks before merging. This is especially helpful for documentation and migration scripts, which were often overlooked in the previous workflow.

By implementing these checklists, I created a unified process that team members could easily follow, significantly raising the baseline quality of our PRs and minimizing the chance of missed steps.

### 4. **Detailed Code Review Guidelines to Elevate Quality and Collaboration**

Given the earlier lack of visibility and feedback, I introduced **Sentinel** and **Peer Review** guidelines to define expectations for both reviewers and PR owners:

- **Sentinel Review**: Conducted by senior engineers with merge access, sentinel reviews provide a thorough quality check to ensure alignment with best practices and project standards. Only after a sentinel review can a PR move beyond the review stage, helping maintain a consistent standard across all code.
- **Peer Review**: This encourages collaborative review by less experienced engineers who don’t have merge access. Peer reviews became an essential opportunity for learning, sharing knowledge, and improving code quality without slowing down the process.

The code review guidelines also defined five main goals: **Quality**, **Appropriateness**, **Acceptance Criteria**, **Learning**, and **Documentation**. By grounding reviews in these principles, we aligned our team on what constitutes a “good” code review, shifting our culture to value thoughtful, quality-driven feedback.

### 5. **Implementing Labels for Enhanced Tracking and Transparency**

To ensure PRs were easy to track and understand at a glance, I implemented a labeling system that clearly identifies each PR’s state and requirements:

- **Documentation Required**, **Documentation Complete**
- **Peer Reviewed**, **Peer Tested**
- **QA Approved**, **Sentinel Approved**

Each label has specific permissions, with only relevant team members (like QA or a sentinel) able to apply them. These labels guide the progression of PRs from **Stage 1: Code** through **Stage 3: Pre-Merge**, providing visibility at every step and helping to avoid bottlenecks.

### 6. **Transitioning from Gitflow to Trunk-Based Development**

As we worked to improve our PR process, we realized our branching strategy also needed optimization. Previously, we followed the Gitflow model, but the team faced significant challenges with long-lived branches. These branches often caused delays and merge conflicts that became difficult to manage, adding unnecessary overhead and reducing our ability to release updates quickly.

To address this, we transitioned to a **trunk-based development** model. Trunk-based development encourages shorter-lived branches and frequent, small merges to the main branch. This change had several key benefits:

- **Reduced Merge Conflicts**: By merging code more frequently, we minimized the risk of conflicts piling up. Developers integrated their work continuously, catching issues early and reducing the time spent resolving complex conflicts.
- **Faster Release Cycle**: The trunk-based model streamlined our release process. Instead of managing multiple long-lived feature branches, we had a continuous flow of smaller updates, allowing us to deploy more frequently and reliably.
- **Improved Team Collaboration**: With fewer long-lived branches, developers worked closer to the main branch, promoting visibility and enabling a more collaborative review process. The team could see changes sooner, providing quicker feedback and keeping everyone aligned.

For a deeper dive into the advantages of trunk-based development versus Gitflow, check out [this article from CircleCI](https://circleci.com/blog/trunk-vs-feature-based-dev/).

### 7. **Best Practices for Effective PRs**

I introduced a set of best practices to guide developers in creating high-quality pull requests:

- **Clear Descriptions**: Each PR should have a well-structured description that explains the problem it addresses, the approach taken to solve it, and steps for testing. This way, every team member can quickly understand the intent and scope of a change.
- **Clean Commits**: Developers were encouraged to use concise, meaningful commit messages. This change ensured a more navigable commit history and made it easier to trace specific updates if issues arose later.
- **Right-Sized PRs**: We emphasized the importance of keeping PRs to manageable sizes. Atomic, focused changes make PRs easier to review, reducing the likelihood of issues slipping through due to overwhelming complexity.

By enforcing these best practices, we ensured every PR was prepared thoughtfully, contributing to a more transparent, reliable workflow.

### 8. **Code Review Etiquette and Responsibility of PR Owners**

To foster a collaborative, positive review culture, I included etiquette guidelines for reviewers and PR owners:

- **Reviewers**: Encouraged to provide constructive, courteous feedback, explaining “why” behind suggestions to make reviews a learning experience. This helped keep reviews productive and respectful, especially for junior team members.
- **PR Owners**: Developers were encouraged to perform self-reviews before submitting a PR, enhancing code quality from the start. PR owners were also reminded to welcome feedback, ask questions, and seek clarification if necessary, promoting open communication.


Implementing these PR guidelines and transitioning to trunk-based development brought substantial improvements to our workflow. With clear stages, structured checklists, consistent labels, and a simplified release process, we saw a marked improvement in both code quality and collaboration. 

These guidelines have helped us create a culture of transparency, responsibility, and continuous learning—values that make our team stronger and our code more resilient.
