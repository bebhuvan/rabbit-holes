---
title: China’s AI gift to the world
date: 2026-08-02
type: musings
url: https://rabbitholes.garden/
tags:
  - AI
  - China
published: true
draft: false
featured: false
---
**What is this?** A rambling, status-post-shaped voice note.

**How sure am I?** Reasonably sure about the broad argument. Much less sure about how the technology, economics and geopolitics will unfold from here.

**Disclosure:** I dictated most of this into ChatGPT and used it heavily to clean up the voice notes, organise the post, do research, verify claims, add links and fine-tune the language. The argument and the opinions are all mine. 

![](/images/xi.png)

The newer version of [DeepSeek V4 Flash](https://api-docs.deepseek.com/news/news260424/) launched recently, and if the benchmarks are to be believed, it's one of the better models in its class. In a lot of specific contexts, it seems on par with some of the better frontier models in the category.

I haven't used it extensively for coding, so I can't say much about that. But I was using it for a few language-related tasks and was pleasantly surprised.

This is just another demonstration of how far the Chinese AI labs have come. It's also a demonstration that they seem to possess some wizard-like abilities, because [DeepSeek V4 is dirt cheap](https://openrouter.ai/deepseek/deepseek-v4-flash).

A cursory scroll through Twitter will show users saying that even though they're on the API pretty much the entire day, they're hardly burning a dollar or two. Compare that with the likes of [Claude](https://www.anthropic.com/pricing) or [Codex](https://openai.com/codex/), where you can run through an entire week's worth of usage limits remarkably quickly. Individual usage varies, of course, and screenshots of API bills aren't scientific evidence. But the broader point is undeniable: the pricing is ridiculous.

If you take a step back, the dramatic reduction in DeepSeek's prices over the past few months was something of a watershed moment in the AI race. It opened up a viable alternative to the US models for a lot of people. And this was not one of those benchmark moments where everybody marvels at a new model for two days and moves on. People actually started using these models. You could see the spectacular increase in adoption in [OpenRouter's data](https://openrouter.ai/state-of-ai) — obviously not representative of the entire AI market, but a reasonable proxy for what developers are experimenting with and deploying.

Then [Xiaomi followed suit](https://mimo.mi.com/docs/en-US/updates/model). Most normies probably don't even know Xiaomi has language models, let alone some fairly decent ones. It cut prices dramatically and priced its models roughly on par with DeepSeek.

Then came the [GLM](https://z.ai/) moment, quickly followed by the [Kimi](https://www.moonshot.ai/) moment. And let's not forget the relentless stream of models [Qwen](https://qwenlm.github.io/) keeps launching, many of them genuinely good for specific use cases.

All of these are open-weight models.

Which means pretty much the entire self-hosting phenomenon today — or at least the exciting edge of it — is essentially a Chinese phenomenon, because most of the good open-weight models are now Chinese. Yes, you can point to a few viable Western alternatives: [GPT-OSS](https://openai.com/open-models/), [Mistral](https://mistral.ai/models), [Llama](https://www.llama.com/), a handful of others. But genuinely, who gives a shit about those models? Or, to put it more precisely: how many of them are actually setting the pace right now?

China started well behind the US in the modern AI race and is now either on par in some areas or, at worst, a few months behind at the frontier. That's a ridiculous achievement.

But I also think looking at the AI race purely in terms of whether the US or China is winning misses the point. Depending on the day of the week, the best model changes and the [leaderboards](https://artificialanalysis.ai/leaderboards/models) change. The classic illustration is [Gemini](https://deepmind.google/models/gemini/). People widely appreciated Gemini 3 when it launched. And look at Gemini now — nobody seems to care all that much. This happens constantly. A model launches, tops a few leaderboards, Twitter declares one lab has won, and two weeks later another model launches and the discourse resets.

What's actually interesting is that, in a way, the Chinese labs are democratizing almost frontier-grade intelligence for almost free. Almost free, because the API pricing is dirt cheap and most of these models are open-weight. If you want to host one of the larger models yourself, GPU prices mean it'll still cost you a pretty penny — open weights don't make compute magically free. But the API pricing is extraordinarily cheap. Whether that's because Chinese labs are subsidizing the cost or because they've had genuine technical breakthroughs, I don't know. Probably some combination of the two. Either way, the surplus accrues to the rest of the world.

The other thing people miss: not every use case requires a frontier model like [Opus](https://www.anthropic.com/claude/opus) or [Fable](https://en.wikipedia.org/wiki/Claude_Mythos).

The vast majority of tasks for most people are mundane, and cheaper models get the job done. Take a business. The bulk of the tasks where AI is typically useful are procedural and incredibly boring — digitising documents, cleaning up data, translating text. Not every business is trying to build AGI. Most businesses are trying to clean up an Excel sheet, make sense of a pile of invoices, answer customer queries, and produce a half-decent advertisement without hiring an agency.

Same for individuals. Not everybody is vibe-coding a replacement for Google or Adobe. Most use cases are much more ordinary: using an LLM as a replacement for search, asking basic questions, getting help with writing, asking for advice — life, financial, personal, health. Generic queries, basically. The LLM is filling the role of a butler, if you will.

Even the more consequential use cases — teaching, healthcare, government — don't always need frontier-grade models. Every model, even an older one, was trained on an enormous chunk of humanity's collective online knowledge. Which means that for many basic educational tasks, even a cheap model can be far better than what many students currently have access to, especially in poorer countries.

This is not a claim that the model is a perfect teacher. It will hallucinate. It will confidently say stupid things. It needs verification and supervision.

But compare it not with the best teacher in an expensive private school. Compare it with no teacher, an overworked teacher handling sixty children, or a textbook the student cannot understand.

That is the relevant comparison.

A cursory Google search throws up plenty of stories about entrepreneurs in emerging economies using AI across [agriculture, healthcare and education](https://openknowledge.worldbank.org/entities/publication/3336ab04-35ec-577a-b4d2-4935711ffdd1). And if the [best available surveys](https://hai.stanford.edu/ai-index/2025-ai-index-report) are to be believed, the anxiety about AI in many of these poorer countries is almost the exact opposite of the anxiety in richer ones. People there don't necessarily think of AI as a threat. They think of it as an opportunity.

In richer countries, the discourse is about whether AI will take jobs, hollow out professions, destroy creative work, let a handful of companies capture all the value. Legitimate concerns, all of them. But in many poorer countries the starting point is different. Can this help me learn something I otherwise couldn't? Can it help me start a business? Translate something? Help a farmer identify a disease? Let a tiny company do work that would otherwise require five people?

Because these countries and their entrepreneurs are constrained by what they can pay, they're extracting as much juice as possible out of smaller models — [Qwen](https://qwenlm.github.io/), [Gemma](https://ai.google.dev/gemma), the like. Sure, these may all be scattered examples. But my sense is the stories aren't scattered. They're underreported.

And if enterprising people in poorer countries are already extracting this much value out of small models, imagine what happens as the small models keep getting better. I think this leads to a sort of economic surplus that may never show up in the aggregates.

If you look only at GDP, unemployment and productivity statistics, AI so far looks like something of a nothing burger. But underneath, I think there's a gathering storm. A tiny entrepreneur saving four hours a day doesn't show up in the productivity statistics. Neither does the small business that avoids hiring an external vendor, or the student who finally gets a difficult concept explained in her own language. But these things are real, and the easiest way to see that is to stop looking at the aggregates and talk to people instead — the entrepreneurs building with these tools, the companies quietly cutting costs with them, the students who now have tutoring they previously didn't.

None of this means there are no downsides. The models hallucinate. They encode biases. They make fraud, surveillance and misinformation cheaper and easier to scale. I don't want to underplay that. But most of these risks already exist; what the models change is the surface area over which they travel. On balance, I still think these models are a net positive, especially for poorer countries — because the honest comparison there is rarely between an imperfect AI system and some beautifully functioning human institution. It's between an imperfect AI system and nothing.

Which is why the politics of open weights matters. There are already rumblings about the [US wanting to curtail adoption of Chinese models](https://www.ft.com/content/3e9e7e69-08c5-4c31-af50-f7d057815946), and reports that [China itself may withhold its frontier models or limit overseas access to them](https://www.reuters.com/world/beijing-is-looking-curbing-overseas-access-chinas-top-ai-models-sources-say-2026-07-07/). I don't know how this unfolds. I genuinely hope China doesn't put the brakes on its labs.

Because the [Fable episode](https://www.reuters.com/technology/us-blocks-foreign-access-anthropics-most-advanced-ai-models-axios-reports-2026-06-13/) was a glimpse of the future: there is already a thin layer of nationalisation over AI. The labs are private companies, sure — they pick their models, their pricing, their policies. But they operate at the mercy of their governments, and modern politics is capricious. Betting on continued availability would be a mistake. Betting on rationality winning out over national-security paranoia or plain self-interested politics would be a bigger one.

The risks run in both directions. The companies themselves can jack up prices, change limits, discontinue models, or decide they no longer want your country as a customer. And governments can do it for them. US labs accuse Chinese companies of [distilling American models](https://www.reuters.com/world/asia-pacific/chinese-military-researchers-tap-us-ai-models-train-defence-systems-2026-07-31/); American policymakers worry about Chinese models embedded in their infrastructure; American labs face the uncomfortable possibility that cheap Chinese open weights undercut their businesses. Meanwhile China may eventually decide its best models are strategic assets, and that giving them away to the world was never in its interest.

So the strange window we have today — almost frontier-grade intelligence, extremely cheap through APIs, often free as open weights — may not last.

That's the real importance of the Chinese models. Cheap and self-hostable, they put both a floor and a ceiling on the economics of AI. A floor, because intelligence still has a minimum cost: chips, energy, infrastructure and talent aren't free. A ceiling, because if the proprietary labs get too expensive, too restrictive, or too degraded, there's now a reasonably capable alternative everyone can turn to. That outside option disciplines the whole market.

And it matters beyond economics. Intelligence delivered as a centrally controlled service can be withdrawn overnight — not just because a company changes its pricing or decides your use case violates some policy, but because a government somewhere decides you shouldn't have it. A model you've downloaded can't be taken back. It needs no permanent permission from a distant corporation or state.

So for all the noise about benchmarks and who's number one this week, the question worth asking is who gets access to useful intelligence, at what price, and on whose permission. Chinese open-weight models have, for now, radically widened that access — capabilities that until recently sat behind expensive Western APIs are now cheap, downloadable and usable in places where a few dollars still matter. There is no guarantee the window stays open.

The most consequential divide in AI may not end up being between the US and China at all. It may be between people who have cheap, durable and sovereign access to intelligence — and people who have it only for as long as someone else permits.