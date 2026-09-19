---
title: Notes from messing around with vision, text, and audio models
date: 2026-09-19
type: musings
tags:
  - "Multimodal models "
  - "Audio models "
  - "Large language models "
  - "AI "
  - "Vision language models "
published: true
draft: false
featured: false
---
The bulk of my vibe-coding experiments over the last few months have involved audio and video, or rather audio and vision, and I’ve been experimenting pretty heavily with multimodal models.

So this is just a small guide based on what I’ve used.

If you have some project where you need vision capabilities for text extraction, or models for speech-to-text workflows — recording voice, transcribing audio, cleaning up audio, voice journaling, whatever — some of this might be useful.

Most of this is based on actually using these models in different workflows for months, rather than looking at benchmarks. And my use cases are also slightly weird, especially when it comes to vision.

## Vision

If the documents you’re trying to digitise are modern, and they involve modern English, I think pretty much all the major vision models will work.

At that point, the more important question is cost.

If you have a heavy workload, cost becomes a problem very, very quickly.

The newer [DeepSeek Flash model](https://api-docs.deepseek.com/) seem very promising here. It has vision capabilities and it's ridiculously cheap.

The [Gemini Flash-Lite family](https://ai.google.dev/gemini-api/docs/models) is also very cheap and has been pretty reliable for me. The [Qwen Flash family](https://www.alibabacloud.com/help/en/model-studio/vision-model) is reasonably reliable. Qwen 3.7 Flash in particular seems promising. GLM 5.3 Flash is another one worth trying.

The reason I keep mentioning Flash models is simply that they are really, really cheap.

If you need a workhorse model for a heavy workload, that matters much more than people realise. If you start throwing thousands or tens of thousands of pages at frontier models, the cost gets prohibitive, to put it lightly.

The Gemini Flash family is slightly costlier but also very good.

So if your use case is basically extracting text from normal modern PDFs, my recommendation is: start cheap. You almost certainly don’t need the smartest model on earth to read a clean PDF.

Old books are where all of this becomes annoying.

I have a weird interest in digitising very old books, which is what I do with [Akshara](https://akshara.ink/), and I’ve also been digitising [old collections of letters](https://paperlanterns.ink/).

I have wasted enough dollars on this particular problem to have opinions.

There is no best model.

Of all the models I’ve tested, the Gemini Flash family has probably been the most consistently accurate and reliable for old books, and occasionally Gemini Pro is useful if the page is particularly horrible.

The big problem with Gemini is recitation blocks.

Every now and then Gemini will simply refuse to extract the text from a page because it has triggered some safety filter or some other dumb and stupid thing. So you end up with a model refusing to reproduce a page from a 120-year-old book.

In those cases, Qwen is a reasonable backup. You will sometimes sacrifice some accuracy, but it gets the job done.

In terms of accuracy, Gemini generally ranks much higher than Qwen for the material I work with. But with some books it is more or less a wash.

I would not use DeepSeek as my primary model for old books.

It has a tendency to aggressively modernise the text. Archaic spellings become modern spellings and things like that, which is obviously terrible if the entire point is to preserve what was actually printed on the page.

Qwen has a similar problem sometimes.

I’ve also tested Kimi and GLM Turbo for old books. They’re reasonable backups. I wouldn’t use them as my primary models.

The broader problem I’ve found with a lot of these Chinese models is that there isn’t one failure pattern. There are several.

Some models modernise the text. Some are bad at preserving old punctuation. Some are bad at archaic spellings. Some flatten or drop diacritics. With old Indian books, transliteration itself can become a problem because the book may be using some older or idiosyncratic Sanskrit transliteration scheme and the model will helpfully “correct” it into something resembling modern IAST.

Which is useful if you want normalised text.

It is a disaster if you want a faithful transcription.

They also fail differently, which makes this more annoying. One model may preserve the spelling but screw up the punctuation. Another may preserve the page structure but quietly modernise words. Another may start dropping diacritics.

So if your requirement is digitising genuinely old documents, you need to test these things properly rather than assuming “OCR accuracy” is one number.

For modern documents, I think this distinction matters much less.

If the PDF is clean and contemporary, pretty much all the major vision models are going to be in the same broad neighbourhood. At that point I would optimise for cost.

And for heavy workloads I really would not recommend frontier models unless you have a very specific reason to use them. The cost becomes silly. Flash models usually get the job done.

You can also do hacky things around pricing. Keep an eye out for API discounts, temporary free models, OpenRouter, OpenCode, and so on. Sometimes there are new or anonymous unreleased models floating around and if you have some huge one-off workload you can abuse these things while they last.

I also tried some of the newer Qwen models through Qwen Cloud. The models themselves can be quite good. The API, at least in my experience, has been unreliable enough that I would not build some enormous unattended workflow around it without fallbacks.

So, more or less: for normal PDFs, use the cheap Flash models and save your money.

For horrible old books, Gemini is still my first choice, and Qwen and some of the other Chinese models are useful backups when Gemini suddenly develops moral objections to OCR.

My experience here is obviously skewed because my main use case for vision is unusually stupid: digitising old books and old letter collections.

I also briefly started another project where I wanted to extract the text from a gigantic collection of PDFs. I very quickly discovered that this was going to become expensive, so that project has taken a back seat.

## Text

The same thing is true for text.

If your workflow involves a lot of summarisation, rewriting, extraction, text generation, classification, whatever, I think at this point pretty much any decent Flash model will get the job done.

I was running an experiment where I would take raw stock-exchange filings and transform them into almost instantaneous news stories about the companies involved.

For that, I used DeepSeek Flash and Xiaomi MiMo V2.5 quite a bit.

Both were perfectly decent.

I particularly like DeepSeek Flash. Its prose capabilities are surprisingly good.

If your benchmark for prose is Shakespeare or Hemingway, then sure, use the frontier models.

But if your benchmark is “pretty good”, which I think covers most bulk text-generation workflows, then the Flash models are more than enough.

And they’re dirt cheap.

Once you’re calling a model thousands and thousands of times, this difference matters. The frontier models become prohibitively expensive for things that are frankly not difficult enough to justify them.

This also means you don’t necessarily need one multimodal model to own your entire audio workflow.

If you prefer keeping transcription and editing separate, use a cheap ASR model — [Microsoft MAI-Transcribe-2](https://microsoft.ai/models/mai-transcribe-2/), [OpenAI GPT-Transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe), whatever — to create the raw transcript.

Then pass the transcript through something cheap like DeepSeek Flash, GLM Flash or Gemini Flash-Lite to clean it up, remove filler, structure it, rewrite it, summarise it, whatever you need.

For heavy workloads, this can be much, much cheaper.

## Audio

I’ve taken heavily to voice typing.

In fact, because I write regularly, I’ve almost stopped manually typing. Typing now feels slightly archaic to me. Pressing all those disgusting keys on a computer. Horrible.

But I also think voice typing unlocks a slightly different kind of writing.

It is not necessarily a one-for-one replacement for the regular disgusting form of writing where you sit in front of a keyboard.

A lot of my writing is very short form: fleeting thoughts, observations, musings. Voice typing is perfect for that.

A lot of my writing is also exploratory. I’m trying to work through an idea without necessarily knowing what the idea is yet. I’m perfectly fine putting out the half-baked thought first and then refining it later.

Voice works very well for that too.

The workflow that makes sense to me is: capture everything first.

Raw ideas, unfinished thoughts, repetitions, weird digressions, whatever.

Then worry about turning it into writing later.

Basically, your phone becomes one of those little Dictaphones journalists used to carry around.

ChatGPT works perfectly fine for this. Gemini is a close second.

But if you want to build your own app, which I have done for myself, there are a few different ways to do it.

One is to just use a multimodal model that can take the audio directly and do transcription, cleanup and structuring in one pass.

The Gemini Flash and Flash-Lite models are very good at this.

You can basically tell Gemini: listen to this, transcribe it correctly, remove filler and repetitions and all the other speech debris, and give me a cleaned-up post.

It works really well.

If you don’t care about keeping the raw transcript, this is probably the easiest workflow.

If you want a backup to Gemini for this sort of thing, the [Qwen Omni family](https://www.alibabacloud.com/help/en/model-studio/models) seems promising too. It can take the audio, understand it, and give you the transformed text in one pass.

The other option is to keep the raw transcription and the editing workflow completely separate.

I actually like doing this because sometimes I want all my raw thoughts preserved in their original ugliness.

Then you just use an ASR model — Automatic Speech Recognition, speech-to-text, whatever you want to call it.

Gemini 3.5 Transcribe has worked very well for me.

Microsoft MAI-Transcribe-2 came out recently. I tested it a little. Seems promising. Very cheap.

OpenAI’s GPT-Transcribe family is also worth trying.

There is also GPT-4o Transcribe Diarize if your use case involves multiple speakers.

[Qwen’s ASR models](https://www.alibabacloud.com/help/en/model-studio/models) are decent and reliable.

Grok Voice Transcribe 2 came out literally while I was writing the original version of this note. I haven’t tested it properly yet, so I have no opinion on the accuracy, but again it is dirt cheap.

And at these prices, transcription itself is increasingly not something you need to spend too much time worrying about.

I know people whose entire use case is recording meetings and then turning the meetings into transcripts, notes and summaries.

If you have multiple speakers, look for **speaker diarisation**, which is basically the model figuring out who spoke when. Some of these transcription models have it built in now.

Another failure pattern worth mentioning is vocabulary.

Very specific words can get mangled repeatedly. Indian words, names, technical jargon, model names.

For some reason Qwen itself is a good example. Q-W-E-N. Alibaba’s Qwen.

A surprising number of transcription systems manage to get that wrong.

A better prompt often fixes some of this.

And depending on the ASR system, you may also have things called **custom vocabulary**, **hotwords**, **keyword hints**, **phrase boosting**, etc. The terminology varies, but the idea is basically the same: give the transcription model a list of weird words it should expect to hear.

If your workflow has a lot of specialised vocabulary, use that.

And then there is the third option: run everything locally.

I’ve also used local speech models on my laptop, mostly OpenAI’s Whisper and [NVIDIA’s Parakeet family](https://docs.nvidia.com/nemo/speech/nightly/asr/featured_models.html).

Again, my use case is voice typing.

I built myself a little desktop app called [Yawp](https://github.com/bebhuvan/yawp).

Or rather Claude Code and Codex built it for me because I was too lazy to type.

It works only on Linux.

The workflow is basically similar to Wispr Flow: press and hold a button, speak, let go, and it transcribes the audio and pastes the text into whatever input surface I’m using.

It works reasonably well.

I should point out that my testing setup here is idiotic.

I have been too lazy to buy a proper microphone, so from about 50–60 centimetres away I either shout at my laptop or I lean over and speak like a moron directly into the built-in microphone.

So the accuracy is a little lower than I would like.

I strongly suspect this is a microphone problem rather than some deep indictment of speech recognition.

Right now the workflow is press, hold, record, transcribe, paste.

I haven’t tried live streaming the text while I’m speaking, similar to Wispr Flow.

That’s probably the next experiment.

If your workflow involves transcribing a lot of audio and you want to do it for cheap or almost free, local audio models are absolutely worth trying.

[Whisper](https://openai.com/index/whisper/) is the obvious one.

NVIDIA Parakeet is another.

Cohere also has an open-source model called [Cohere Transcribe](https://docs.cohere.com/docs/transcribe). I haven’t tested it, but it seems promising.

And as I finished writing this post, [Qwen 3.8 Omni Flash](https://qwen.ai/blog?id=qwen3.8-omni-flash) came out. It looks like another promising multimodal/audio model.

I have not tested it yet, so I have no useful opinion beyond that.

Also, for people who actually know what they’re doing technically, there is an enormous open-source ecosystem here, both for audio and vision.

If you’re technically savvy, you can probably get these models to do a whole lot more than anything I’ve described here.

I am a complete non-technoob.

There are probably things you can build with all of this that I can’t even dream of.

## Languages

One giant caveat to everything I’ve said about audio: I have barely tested any of this with non-English speech.

English is the primary language in which I write, so almost all my experience is English.

I did one brief test in Kannada using a Qwen Omni model.

It failed miserably.

That is obviously nowhere near enough testing for me to make some grand statement about multilingual transcription.

So if your primary workflow is Kannada, Hindi, Tamil, Telugu, or some other language, assume none of my audio recommendations have been properly tested for your use case.

## The part I still find crazy

The other thing I keep coming back to is how fucking crazy it is that all of this is possible in 2026.

I have absolutely no technical skills.

And I don’t mean this in the fake tech-bro sense where somebody says “I’m not technical” and then starts casually writing Python.

I barely know Excel.

And somehow I am getting these coding tools to build desktop apps, utilities, little workflows, websites, whatever random thing I feel like making.

That is insane.

I know people keep having AGI-this, AGI-that, ghanta-loda debates about all of this.

To say AGI is here would obviously be misleading.

But I also think that for normies some threshold was crossed a while ago. For me it was probably around Claude Sonnet 4.

And I think a lot of people are dramatically underestimating the utility of these tools because they are using the wrong frames to think about them.

Or they’re simply not experimenting enough.

Or they are listening to some mouth-breathing idiot with a very confident opinion about LLMs.

Even though I have been fucking around with these things heavily, I still keep finding an insane amount of utility in them.

They have become a deep part of a lot of things I do, both at work and outside work.

A lot of the things I do now simply would not have been possible for me without them.

Which is why it continues to surprise me when people have these utterly idiotic debates about whether LLMs are useful.

And I still hear “they’re just next-token predictors” or “stochastic parrots” thrown around as if that settles something.

In 2026 this boggles my mind.

Okay, sure. It is a stochastic parrot.

The stochastic parrot transcribes my voice, cleans up my notes, reads 120-year-old books, helps me digitise old letters, turns stock-exchange filings into news, writes code, builds me a Linux desktop app and lets me make all sorts of weird side projects that I would otherwise have absolutely no ability to build.

At some point I stop caring about the insult.

The one thing I would highly recommend is: use these tools heavily.

And not just the chat websites.

Get Claude Code. Get Codex. Fuck around.

Build something stupid.

Automate something annoying.

Take one of those side projects you’ve had sitting in your head for five years because you never knew how to build it and just try.

You’ll be surprised by how much you can do.

But I think the more interesting surprise is the *kind* of things you suddenly realise you can do.

Especially if you haven’t allowed your brain to die and you still have an imaginative streak, this is a golden age for side projects.

There has probably never been a better time to fuck around and find out.

These tools are really, really, really good.

If you’re not using them, I think you’re missing out.

## Links

### Vision and general-purpose models

- [DeepSeek V4.1 Flash — announcement](https://deepseek.com/en/news/deepseek-v4-1-flash/)
- [Gemini 3.1 Flash-Lite — announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/)
- [Gemini 3.5 Flash — Google I/O announcement](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/)
- [Gemini 3.6 Flash and 3.5 Flash-Lite — announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/)
- [Gemini 3.7 Flash — announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/)
- [Gemini 3.8 Flash — announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/)
- [Qwen 3.7 Flash — model page](https://www.alibabacloud.com/help/en/model-studio/qwen3-7-flash)
- [Qwen 3.8 Omni Flash — announcement](https://qwen.ai/blog?id=qwen3.8-omni-flash)
- [GLM 5.3 Flash — announcement](https://autoclaw.z.ai/blog/model/glm-5.3-flash/)
- [Xiaomi MiMo V2.5 — official release page](https://platform.xiaomimimo.com/docs/en-US/news/v2.5-tts-release)

### Audio and transcription

- [OpenAI GPT-Transcribe — model page](https://developers.openai.com/api/docs/models/gpt-transcribe)
- [OpenAI GPT-4o Transcribe — model page](https://developers.openai.com/api/docs/models/gpt-4o-transcribe)
- [OpenAI GPT-4o Transcribe Diarize — model page](https://developers.openai.com/api/docs/models/gpt-4o-transcribe-diarize)
- [Microsoft MAI-Transcribe-2 — announcement](https://microsoft.ai/news/mai-transcribe-2-is-the-fastest-most-accurate-and-cheapest-speech-recognition-model-in-the-world/)
- [Grok Voice Transcribe 2 — announcement](https://x.ai/news/grok-voice-transcribe-2)
- [OpenAI Whisper — announcement](https://openai.com/index/whisper/)
- [NVIDIA Parakeet ASR — introduction](https://developer.nvidia.com/blog/?p=80564)
- [Cohere Transcribe — announcement](https://cohere.com/blog/transcribe)
- [Qwen Omni — documentation](https://www.alibabacloud.com/help/en/model-studio/models)

## Disclaimer

This note was voice typed using ChatGPT. I also used ChatGPT to clean up the raw notes, structure them, edit them, and fact-check model names and links.