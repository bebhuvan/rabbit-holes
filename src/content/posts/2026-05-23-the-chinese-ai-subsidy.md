---
title: The Chinese AI subsidy
date: 2026-05-23
type: musings
tags:
  - AI, DeepSeek
published: true
draft: false
featured: false
---
After launching V4 Flash and V4 Pro, DeepSeek was running a limited-period 75% discount on both models until May 30. Today, it announced that the discount is now permanent.  

The current pricing is kind of ridiculous. On the official "DeepSeek API pricing page" ([https://api-docs.deepseek.com/quick_start/pricing](https://api-docs.deepseek.com/quick_start/pricing)), DeepSeek V4 Flash is priced at $0.0028 per million input tokens for cache hits, $0.14 for cache misses, and $0.28 for output tokens. DeepSeek V4 Pro, after the 75% discount, is priced at $0.003625 per million input tokens for cache hits, $0.435 for cache misses, and $0.87 for output tokens.  

This is happening at a time when the pricing of other models, most recently Gemini Flash 3.5, continues to increase. For a lot of use cases, frontier models are becoming prohibitively expensive. For people who are not adopted by Bill Gates, Claude Code, Codex, and API usage from the top frontier labs can get out of reach very quickly.  

I’ve been playing around with DeepSeek V4 Pro and V4 Flash, and they’re really good across a whole lot of use cases. Of course, they are not going to beat the absolute frontier models at everything, but it’s not like they are dramatically far away either. They are reliable enough that, at this pricing, you can use them for a lot of high-volume tasks, and even as backups when you run out of credits or usage limits on Claude Code or OpenAI Codex.

It's not just DeepSeek. When GLM Kimi and other Chinese model families offer near-frontier model capabilities on a wide range of tasks for a fraction of the price.  

For most regular day-to-day coding tasks, they are pretty good.  

I also saw a bunch of posts about Alibaba Qwen cutting prices on several of its models. I still haven’t figured out how to access Alibaba’s models directly through its Model Studio, so I mostly use them through "OpenRouter" ([https://openrouter.ai/](https://openrouter.ai/)). But even Qwen’s models have been really good in my use cases. The main place I’ve used them is in digitization tasks for "Project Akshara" ([https://akshara.ink/](https://akshara.ink/)), where I’m trying to digitize and make old public-domain Indian books readable online.  

I had also used GLM Turbo along with Qwen in a few digitization tasks, and it was promising too. It was a surprisingly capable vision-language model.  

So yes, it’s kind of funny that China is once again making costly things cheaper for the rest of the world. You can now get near-frontier-model-like capabilities for a whole lot of regular use cases at ridiculously low prices.  

The subsidy is not just in the API pricing either. A lot of these Chinese models are also open-weight or open-source. DeepSeek V4 Pro’s weights are available under an MIT license, Qwen has a whole ecosystem of open models, and [Z.ai](http://Z.ai) has open-sourced several GLM models under permissive licenses. If you have the technical ability and the infrastructure, you can download the models and self-host them instead of paying API rent forever.

A lot of the people I follow online, including several companies, are already doing this. They are realizing that for many internal workflows, inference-heavy tasks, document processing, coding assistants, classification, OCR cleanup, customer-support automation, and boring high-volume work, self-hosting a good-enough open model can lead to phenomenal cost savings compared to piping everything through the APIs of the American labs.

I don’t know the full economics here. I don’t know if DeepSeek is losing money, or what the unit economics look like. But as long as these prices are available, I’ll use them.  

Once again, China is leading the race in making expensive things cheap.

I’m also wondering what all of this means for what people lazily call the “global south.” I hate that term, but the point still stands. A lot of poorer countries simply cannot afford to build around the APIs of the American labs.   
  
And I don’t think we have properly thought through the first-order and second-order effects of low-cost Chinese AI models, low-cost Chinese API pricing, and the vast menu of open-source and open-weight Chinese models.  
  
For individuals, small businesses, universities, developers, civil society groups, and even governments in poorer countries, this could be a very big deal. If you can get good-enough AI at a fraction of the cost, or self-host models instead of paying API rent forever, the possibilities increase.

We are already starting to see stories of individuals, small businesses, and governments across Asia and Africa using these models in creative ways. And I suspect this is still very early. We probably haven’t yet internalized what happens when capable AI becomes cheap enough for countries, companies, and people who were never really the target customers of the American frontier labs.