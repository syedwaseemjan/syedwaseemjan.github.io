---
title:  "Docker cut our deploy from eight hours to one"
date: 2017-08-15T12:00:00
categories:
  - backend
  - activecapital
---

At Active Capital IT we run a digital asset management platform for universities, museums, and libraries. People upload large image collections and videos. The app converts formats, builds thumbnails, pulls out metadata, and writes the results to a network mounted drive that all four servers can see. Celery handles that work in the background. Videos go through a separate Kaltura server. We left that part alone for now.

The images are not ordinary web uploads. Collections like these often include formats most engineers rarely see, such as JPEG 2000, BigTIFF, and wavelet formats like MrSID. Some files are several gigabytes. Getting through that work needs a long list of system packages, Python libraries, and C tools that the Python code calls out to. On each server, installing those tools and building some of them with make has been part of a normal release.

#### **Four Ubuntu boxes that drifted apart**

We have four Ubuntu servers under our own care. No cloud. They are not all on the same Ubuntu version. On each box, nginx sits in front of Gunicorn. Traffic reaches the four machines through the front of the stack. The deploy pain is not that front layer. It is keeping the same app and the same native libraries working on four hosts that do not stay identical.

A release meant installing or rebuilding those libraries on every server by hand. Sometimes we typed once into a tool that sent the same commands to more than one host. That saved typing. It did not stop drift. One server might end up with a different library version than another. Something that built on the first box could fail on the third. Sorting that out across four machines could take most of a day. Deploys often meant about eight hours of downtime while we chased those mismatches.

#### **What Docker changed, and what it did not**

We built a Docker image that contains the application code, the Python dependencies, and the native tools the workers need. The same image can run Gunicorn for web traffic or a Celery worker, depending on the process we start. We build that image once, then get it onto each of the four servers so all of them run the same bits.

The network share stays on the host. Each container gets that path mounted in, so web processes and workers still read and write the same files as before. nginx stays on the host as a reverse proxy and forwards to the app process now listening inside the container. The front of the stack still sends traffic to the same four server addresses. Docker did not replace the whole architecture. It stopped each host from being its own install project for the app runtime.

A deploy now means getting the new image onto each server, restarting the app and worker containers, and checking that things still work. That whole window dropped from about eight hours to about one. The hour is not magic from a container restart. It is ordinary release work without four separate fights against apt, make, and mismatched library versions.

#### **The lesson**

If your app depends on a pile of system tools, those tools are part of the release. Install them by hand on every server and the servers will disagree eventually. You pay for that disagreement in downtime.

Putting the runtime in one image does not make the product new. It makes four machines stop telling four different stories about what is installed. On a bare metal stack with a lot of native libraries, that was enough to turn a painful deploy into a much shorter one.
