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

**Disclosure:** I dictated most of this into ChatGPT and used it heavily to clean up the voice notes, organise the post, do research, verify claims, add links and fine-tune the language. The argument, opinions and occ

The [preview version](https://api-docs.deepseek.com/news/news260424/) of DeepSeek V4 Flash launched recently, and if the benchmarks are to be believed, it’s one of the better open-weight models in its class. DeepSeek’s own evaluations suggest that its reasoning capabilities come close to V4 Pro and that it performs on par with Pro on simpler agentic tasks, although there is still a gap on more difficult tasks.

I haven’t used it extensively for coding, so I can’t really say much about that. But I was using it for a few language-related tasks and was pleasantly surprised.

And this is just another demonstration of how far the Chinese AI labs have come. It’s also a demonstration of the fact that they seem to possess some wizard-like abilities, because DeepSeek V4 is dirt cheap. At the time of writing, the [pricing](https://api-docs.deepseek.com/quick_start/pricing/) for V4 Flash is $0.14 per million uncached input tokens, $0.0028 per million cached input tokens and $0.28 per million output tokens.

A cursory scroll through Twitter will show users saying that even though they are using the API pretty much the entire day, they are hardly burning a dollar or two. Compare that with the likes of Claude or Codex, where you can pretty much run through an entire week’s worth of usage limits remarkably quickly. Of course, individual usage varies, and comparing metered API pricing with subscription usage limits is not exactly apples to apples. But the broader point remains: the pricing is ridiculous.

And if you take a step back and think about just the past few months alone, the dramatic reduction in the prices of DeepSeek’s models was something of a watershed moment in the AI race. It opened up a viable alternative to the US models for a lot of people, and this was not merely one of those benchmark moments where everybody marvels at a model for two days and then moves on. People actually started using it.

You could see the increase in [OpenRouter’s data](https://openrouter.ai/blog/insights/deepseek-v4-adoption/). DeepSeek roughly doubled its share of token volume between January and June 2026 and had become the platform’s leading model provider by mid-May. OpenRouter is obviously not representative of the entire AI market, but it’s a reasonable proxy for what developers using model routers are experimenting with and deploying.

Then Xiaomi followed suit. Most normies probably don’t even know that Xiaomi has language models, let alone some fairly decent ones. It cut its prices dramatically and priced its models roughly on par with DeepSeek.

Then came the [GLM](https://z.ai/blog/glm-5) moment, which was quickly followed by the [Kimi](https://www.moonshot.ai/) moment. And let us not forget the relentless stream of models that Qwen has been launching, many of which are genuinely good for a whole variety of specific use cases. All of these are open-weight models.

And then there is the fact that pretty much the entire self-hosting phenomenon today—or, at the very least, the exciting edge of it—is essentially a Chinese phenomenon, because most of the good and interesting open-weight models are now Chinese.

Yes, you can point to a few viable Western or other white-people alternatives, like GPT-OSS, Mistral, Llama and a handful of others. But genuinely, who gives a shit about those models? Or, to put it somewhat more precisely, how many of them are actually setting the pace right now?

The fact that China started well behind the US companies in the modern AI race and is now competitive in several areas—and, by some estimates, only months behind at parts of the frontier—is a ridiculous achievement.

But looking at the AI race purely in terms of whether the US or China is winning is to miss the point. Depending on the day of the week, the best model and the leaderboards change. The classic illustration of this is Gemini. People widely appreciated Gemini 3 when it launched, and then look at Gemini now. Nobody seems to care all that much about its models. A model tops a few leaderboards, everybody on Twitter declares that one lab has won, and two weeks later the entire discourse resets itself.

What is actually interesting is that, in a way, the Chinese labs are democratizing almost frontier-grade intelligence for almost free. The API pricing is dirt cheap and most of these models are open-weight. Of course, if you want to host one of the larger models yourself, considering GPU prices, it will still cost you a pretty penny. Open weights do not mean that computing power has magically become free.

Whether the low prices are because Chinese labs are subsidizing the cost or because they have genuinely had technical breakthroughs, I don’t know. It’s probably some combination of the two. But regardless of where it comes from, this surplus accrues to the benefit of the rest of the world.

The other thing that people miss is that not every use case requires a frontier model like Opus or Fable. The vast majority of tasks for most people are mundane, and even the cheaper models will get the job done.

Take a business, for example. The bulk of the tasks where AI is typically useful are procedural and incredibly boring: digitising documents, cleaning up and organising data, writing advertising copy, generating basic graphics, translating and transliterating text, classifying information and doing all sorts of other verifiable tasks. Not every business is trying to build AGI. Most businesses are trying to clean up an Excel sheet, make sense of a pile of invoices, answer customer queries and produce a half-decent advertisement without hiring an agency.

And for individuals, not everybody is coding a SaaS replacement or vibe-coding a replacement for Google, Amazon or Adobe. The vast majority of use cases are much more ordinary: using an LLM as a replacement for search, asking basic questions, getting help with writing, or asking for advice—life, financial, personal, health and so on. These are basically generic queries. The LLM is filling the role of a butler, if you will.

Even if you take more legitimate or socially consequential use cases—education, healthcare or governments—you still don’t always need frontier-grade models. An older model was trained on enormous amounts of the collective knowledge that humanity has put online, which means that for many basic educational tasks, even a cheap model can be much better than what many students currently have access to, especially in poorer countries.

This is not a statement about the model being a perfect teacher. It will hallucinate. It will confidently say stupid things. It needs verification and supervision. But compare it not with the best teacher in an expensive private school. Compare it with no teacher, an overworked teacher handling sixty children, or a textbook that the student cannot understand. That is the relevant comparison.

A cursory Google search throws up numerous stories about entrepreneurs in frontier and emerging economies using AI to build tools and solutions across agriculture, healthcare and education. Enterprising individuals are also using large language models to build small businesses.

The World Bank has been documenting the rise of what it calls [“Small AI”](https://blogs.worldbank.org/en/voices/small-ai-big-impact-harnessing-artificial-intelligence-for-development): affordable and context-specific systems designed around particular local problems and the very real constraints of cost, computing power and connectivity. This is not merely another name for smaller language models; the term includes narrower systems that can run on ordinary devices without giant computing clusters.

And if the best available surveys are to be believed, the anxiety about AI in many of these poorer countries is almost the exact opposite of the anxiety in richer countries. A [UNDP survey](https://www.undp.org/arab-states/press-releases/human-development-progress-slows-35-year-low-according-un-development-programme-report), for example, found that 70% of respondents in countries with low or medium levels of human development expected AI to increase their productivity, while roughly two-thirds expected to use it in education, healthcare or work within a year.

In richer countries, much of the discourse is about whether AI will take away jobs, hollow out professions, destroy creative work and allow a small number of companies to capture all the economic value. These are legitimate concerns. But in many poorer countries, the starting point is different: can this help me learn something I otherwise could not learn? Can this help me start a business, translate something or help a farmer identify a disease? Can it allow a tiny company to perform work that would otherwise require five people?

And because these countries and their entrepreneurs cannot pay for giant clusters of GPUs, they are extracting as much juice as possible out of smaller models, especially the likes of Qwen, Gemma and others. Sure, these may all be scattered examples, but my sense is that the stories are not scattered; they are being underreported. And if enterprising people in poorer countries are already extracting so much value out of smaller models, imagine what happens if AI progress continues and the small models keep getting better.

I think this will lead to a sort of economic surplus that may never be fully captured in economic aggregates. If you look only at GDP, unemployment and productivity statistics, AI so far looks like something of a nothing burger. Or, at the very least, its effects are not yet dramatically visible in the broad numbers. But underneath, I think there is a gathering storm.

A tiny entrepreneur saving four hours a day may not show up as some dramatic increase in national productivity. A small business avoiding the need to hire an external vendor may not meaningfully move GDP. A student getting a difficult concept explained in their own language certainly won’t. But speak to individuals using these tools, entrepreneurs building with them, companies using them to save costs and improve their processes, and students who now have access to explanations, translations and tutoring they previously did not. Underneath the aggregates, the technology is already proving to be remarkably transformative.

None of this is to say that there are no downsides. The models hallucinate, encode biases and expand the possibilities for fraud, surveillance, misinformation and a whole variety of other delightful human activities. These risks already exist, but the models transform the surface area over which they can be transmitted, making some of them cheaper, faster and easier to scale.

That is serious. But if you weigh the benefits against the harms, I still think these models are a net positive, especially for poorer countries, because the comparison cannot always be between an imperfect AI system and some ideal human institution that works beautifully. In many cases, the comparison is between an imperfect AI system and no access at all.

And this is why the politics around open-weight models matters so much.

There are already rumblings in the US about restricting the use of Chinese open-weight models. And [Reuters reported](https://www.marketscreener.com/news/beijing-is-looking-curbing-overseas-access-china-s-top-ai-models-sources-say-ce7f5edbd08bf321) in July that Chinese officials had discussed potentially limiting overseas access to some advanced future models. No policy has been announced, and Reuters could not establish what any restriction would look like.

I don’t know how the future will unfold, and I genuinely hope China does not put the brakes on Chinese labs releasing open-weight models. Because the [Fable and Mythos episode](https://www.anthropic.com/news/redeploying-fable-5) was a sign of things to come.

In June 2026, after a report that Fable’s safeguards could be bypassed in certain cybersecurity tasks, the US government applied export controls to Claude Fable 5 and Mythos 5. The directive required Anthropic to restrict access by foreign nationals inside and outside the US. Because it took effect immediately and Anthropic had no reliable way to verify nationality in real time, the company suspended both models for everybody. The controls were lifted on June 30. Fable was subsequently restored globally, while Mythos initially returned only for a set of approved US organisations.

What this showed is that there is already a thin layer of nationalisation over AI. Sure, the labs are private companies that can choose their models, pricing, availability and policies, but they are still at the whims and mercy of the governments of the countries in which they operate. Given the capricious nature of modern politics, betting on continued availability—or on rational logic triumphing over political priorities, national-security concerns and plain old self-interested politics—would be a mistake.

There is the risk that the AI companies themselves jack up prices, change usage limits, discontinue models or stop serving a particular country or category of user. But on top of that, there is political risk. The AI race has become a battle between China and the US, and there is already plenty of acrimony between the two countries. US labs accuse Chinese companies of distilling American models. Anthropic, for example, has [accused](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) DeepSeek, Moonshot and MiniMax of conducting industrial-scale extraction campaigns against Claude.

US policymakers worry about Chinese models becoming embedded in American companies and infrastructure. American labs also face the uncomfortable possibility that cheap Chinese open-weight models may undercut their businesses. Meanwhile, China may eventually decide that its best models are strategic assets and that giving them away to the rest of the world is not in its interest.

So the strange window we have today—where almost frontier-grade intelligence is available extremely cheaply through APIs and, in many cases, freely as open weights—may not last forever.

And this is the larger importance of the Chinese models. The fact that they are cheap, and that organisations can self-host them, puts a sort of floor and ceiling on the economics of AI. A floor, because chips, energy, infrastructure and talent are not free. But also a ceiling, because if proprietary labs make their APIs too expensive or their policies too restrictive, there is now a reasonably capable alternative that companies and countries can turn to.

Open weights create an outside option. Once an organisation has legally downloaded the weights and has the infrastructure to run them, losing access to the original API or repository does not necessarily make the model disappear. Intelligence delivered as a centrally controlled service, on the other hand, can be withdrawn overnight—not merely because a company changes its pricing or policies, but because a government somewhere decides that you should no longer have access to it.

That, to my mind, is the real importance of open weights. It is not merely that the models are cheaper. It is that they can be downloaded, adapted and hosted without requiring permanent permission from a distant corporation or state.

For all the noise about benchmarks and which model is number one this week, perhaps the more important question is not whether the US or China is winning. It is who gets access to useful intelligence, at what price, and on whose permission.

For the moment, Chinese open-weight models have radically widened that access. They have made capabilities that were, until recently, available only through expensive Western APIs cheap, downloadable and adaptable enough to be used in places where a few dollars still matter. There is no guarantee that this window will remain open.

The most consequential divide in AI may therefore not ultimately be between the United States and China. It may be between those who have cheap, durable and sovereign access to intelligence—and those who can use it only for as long as a company or government permits them to.
