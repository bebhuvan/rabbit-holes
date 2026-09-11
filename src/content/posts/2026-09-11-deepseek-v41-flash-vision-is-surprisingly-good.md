---
title: DeepSeek V4.1 Flash Vision is surprisingly good
date: 2026-09-11
type: musings
url: https://www.deepseek.com/en/news/deepseek-v4-1-flash/
tags:
  - "AI "
  - "Digitization "
  - Vision language models
published: true
draft: false
featured: false
---
I was just testing DeepSeek V4.1 Flash on a bunch of vision tasks with old book pages, and it’s not bad at all.

It had issues with some Sanskrit type and diacritic-heavy text, but it still managed reasonably well. And considering the cost, it’s pretty impressive. During off-peak hours, the API is dirt cheap.

That means its vision capabilities should be really useful for modern documents and PDFs, where it can chew through large volumes of material at ridiculously low cost.

DeepSeek currently prices its V4 Flash vision API like this, per 1 million tokens:

Rate| Input, cache hit| Input, cache miss| Output
Off-peak| $0.007| $0.22| $0.66
Peak| $0.014| $0.44| $1.32

Peak hours are 01:00–04:00 and 06:00–10:00 UTC, Monday through Friday. Everything else is off-peak, at half the peak rate.

Images are converted into tokens and billed as input. DeepSeek says images use up to 384 tokens each, which makes the economics particularly interesting for large-scale document processing.

I think this makes DeepSeek V4.1 Flash a viable model for large-scale digitization projects. It’s cheap enough that workloads involving tens or hundreds of thousands of pages start looking much more realistic.

I’m a little excited about this because I’ve had a bunch of large-scale digitization project ideas sitting around, and costs like these make some of them much more viable.

"DeepSeek API documentation" (https://api-docs.deepseek.com/)

"DeepSeek API pricing" (https://api-docs.deepseek.com/quick_start/pricing/)