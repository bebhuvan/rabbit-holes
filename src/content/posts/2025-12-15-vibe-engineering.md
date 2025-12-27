---
title: "Vibe engineering "
date: 2025-12-15
type: links
tags:
  - AI
published: true
draft: false
featured: false
---
We're moving from [vibe coding to vibe engineering](https://simonwillison.net/2025/Dec/14/justhtml/):

> Turns out it was almost all built by LLMs
> 
> At this point I went looking for some more background information on the library and found Emil’s blog entry about it: How I wrote JustHTML using coding agents:  
>   
> Writing a full HTML5 parser is not a short one-shot problem. I have been working on this project for a couple of months on off-hours.  
>   
> Tooling: I used plain VS Code with Github Copilot in Agent mode. I enabled automatic approval of all commands, and then added a blacklist of commands that I always wanted to approve manually. I wrote an agent instruction that told it to keep working, and don’t stop to ask questions. Worked well!  
>   
> Emil used several different models—an advantage of working in VS Code Agent mode rather than a provider-locked coding agent like Claude Code or Codex CLI. Claude Sonnet 3.7, Gemini 3 Pro and Claude Opus all get a mention.