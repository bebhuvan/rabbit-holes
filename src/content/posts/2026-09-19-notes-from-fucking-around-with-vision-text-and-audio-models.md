---
title: Notes From Fucking Around With Vision, Text, and Audio Models
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
The bulk of my vibe-coding experiments over the last few months have involved audio and vision, so I’ve ended up trying an unreasonable number of multimodal models.

This is a small guide based entirely on what I’ve actually used.

If you have a project where you need vision capabilities for text extraction, models for bulk text transformation, or audio models for speech-to-text workflows — recording yourself, transcribing audio, cleaning it up, voice journaling, whatever — these are the models I’ve found useful.

Vision

If the documents you’re trying to digitise are modern, and the text is modern English, I think most of the current multimodal models will work perfectly fine.

At that point, the more interesting question is cost.

If you’re processing thousands of pages, cost stops being an abstract number on a pricing page rather quickly.

The newest model that looks especially promising to me is DeepSeek V4.1 Flash. It has native vision capabilities and is ridiculously cheap.

Gemini 3.1 Flash-Lite and 3.5 Flash-Lite are also very cheap and have been pretty reliable for me. The Qwen Flash family is another reasonable option; Qwen 3.7 Flash in particular looks promising. GLM 5.3 Flash is another candidate worth trying.

The reason I keep recommending Flash-family models is simple: they are really, really cheap.

If you need a workhorse model for a heavy workload, this matters enormously. Once you start sending thousands or tens of thousands of pages through larger models, the costs can become prohibitive, to put it lightly.

The slightly more expensive Gemini Flash models have also been very good. Gemini 3.6 Flash, 3.7 Flash and 3.8 Flash are all worth trying.

My recommendation here is not particularly complicated: if you’re extracting text from ordinary modern PDFs, start cheap. You probably don’t need the smartest model on earth to read a clean page of English.

Old books are where things become annoying.

I have a weird interest in digitising very old books, which is what I do with "Akshara" ([https://akshara.ink/](https://akshara.ink/)), and I’ve also been digitising "old collections of letters" ([https://paperlanterns.ink/](https://paperlanterns.ink/)). I have wasted enough dollars on this particular obsession to have opinions.

There is no single “best” model.

Of everything I’ve tested, the Gemini Flash family has been the most consistently accurate and reliable on degraded historical material, with Gemini Pro occasionally being useful when the page is particularly nasty.

Gemini has one extremely irritating problem, though: recitation blocks.

Every now and then it will simply refuse to extract text from a page because some safety filter or other dumb thing has decided that reproducing the contents of a 120-year-old book is apparently a threat to civilisation.

When that happens, Qwen is a decent backup. You may sacrifice some accuracy, but it usually gets the job done.

In terms of pure accuracy on the old material I’ve worked with, Gemini generally ranks above Qwen. On some books, though, it’s more or less a wash.

I would be much more careful with DeepSeek for historical text extraction.

In my experiments, it has a tendency to aggressively modernise the text. Archaic spellings quietly become modern spellings, which is exactly what you don’t want if your objective is faithful digitisation.

Qwen sometimes has a similar problem.

I’ve also tested Kimi and GLM Turbo for digitising old books. They’re reasonable backup models, but I wouldn’t use them as the primary model for this kind of work.

The broader problem I’ve found with a lot of the Chinese models is that there isn’t one predictable failure mode. There are several. Some aggressively modernise archaic spellings. Some are bad at preserving old punctuation. Some flatten or drop diacritics. And with older Indian books, transliteration can become its own little disaster: a book may use an older or idiosyncratic Sanskrit transliteration system, and the model will quietly “correct” it into something resembling modern IAST. That is useful if you want normalised text, but disastrous if what you’re trying to produce is a faithful transcription of the original page.

With modern documents, I think this distinction matters much less. If you’re dealing with reasonably clean contemporary PDFs, pretty much all the major vision models seem to land in roughly the same neighbourhood for ordinary text extraction.

Which brings me back to cost.

For heavy workloads, I generally wouldn’t use frontier models unless there is some specific reason you need them. The cost gets prohibitive very quickly, and for straightforward document extraction the Flash models usually get the job done.

There are also slightly hacky ways to make large jobs cheaper. It’s worth watching for API discounts, temporary pricing, and places such as OpenRouter or OpenCode, where new or even unreleased anonymous models sometimes appear before their formal release. If you have one enormous job to run, these things can make a surprisingly large difference.

I also experimented with some of the newer Qwen models through Qwen Cloud. The underlying models can be quite good, but I’ve had enough reliability problems with the API that I wouldn’t currently build a large unattended workflow around it without fallbacks.

So, roughly speaking: for normal PDFs, use the cheap Flash models and save your money. For horrible old books, Gemini remains my first choice, with Qwen and some of the other Chinese models as backups when Gemini decides it has moral objections to OCR.

My experience here is admittedly skewed. My main vision use case is unusually stupid: digitising old books and letter collections.

I also briefly started another project where I wanted to extract the text from a very large collection of PDFs. That experiment ran into the obvious problem fairly quickly: cost. It has therefore taken a back seat.

Text

The same logic applies to bulk text workflows.

If your job is summarisation, rewriting, extraction, classification, text generation, or some other task you need to perform hundreds or thousands of times, I think we’ve reached the point where pretty much any decent Flash model will get the job done.

I ran one experiment where I would take raw stock-exchange filings and transform them almost instantly into publishable news about the companies involved.

For that workflow, I used DeepSeek Flash and Xiaomi MiMo V2.5 quite a bit. Both were perfectly decent, but DeepSeek Flash became my preferred model.

Its prose is surprisingly good.

Obviously, if your benchmark is that every paragraph emerging from your API should sound like Shakespeare or Hemingway, then by all means spend money on the frontier models.

For the rest of us, “pretty good” is often more than good enough.

And if “pretty good” is your requirement, Flash models make a lot more sense. They’re dirt cheap, they’re fast, and once the workload gets large enough the difference in cost becomes absurd. Frontier models very quickly become prohibitively expensive when you’re calling them thousands of times for relatively mundane text transformations.

This also gives you another way to structure audio workflows.

You don’t necessarily need one multimodal model to do everything.

If, for whatever reason, you prefer to keep transcription and editing separate, you can use a very cheap ASR or speech-to-text model — Microsoft MAI-Transcribe-2, OpenAI GPT-Transcribe, or something similar — purely to produce the raw transcript.

Then run that transcript through a second cheap model such as DeepSeek V4.1 Flash, GLM 5.3 Flash or Gemini 3.5 Flash-Lite to remove filler, fix obvious transcription debris, restructure it, rewrite it, summarise it, or do whatever other transformation you need.

For a heavy workflow, that combination can make much more economic sense than throwing a frontier model at every stage of the pipeline.

Audio

I’ve taken heavily to voice typing.

In fact, because I write regularly, I’ve almost stopped manually typing. Pressing all those disgusting little keys on a computer now seems terribly archaic to me.

Voice dictation also seems to unlock a slightly different form of writing.

I don’t think it is a one-for-one replacement for the traditional, disgusting form of writing where you sit there pressing keys. But a lot of what I write consists of fleeting thoughts, observations and small musings, and for that, voice typing works perfectly.

A lot of my writing is also exploratory. I’m often trying to work through an idea without knowing where it is going. I’m perfectly happy to put the half-baked version somewhere first and refine it later.

Voice works exceptionally well for this.

The workflow I’ve fallen into is basically: capture everything first — raw ideas, unfinished thoughts, digressions, repetitions, whatever — and worry about turning it into writing later.

You can think of your phone as one of those little Dictaphones or handheld voice recorders journalists used to carry around.

ChatGPT works perfectly well for this. Gemini is a close second.

But if you want to build your own app, which I have done for myself, things get more interesting.

One approach is to use a multimodal model that can listen to the audio and do the transcription, cleanup and structuring in one pass.

The Gemini Flash and Flash-Lite families are very good at this.

You can give the model the audio and tell it: transcribe this accurately, remove filler and accidental repetition, clean up the speech debris, and return a structured version.

And it works surprisingly well.

This is especially useful if you don’t particularly care about preserving the raw transcript. You speak for five or ten minutes and what comes back is already reasonably close to usable writing.

If you need an alternative or backup to Gemini for this sort of workflow, the Qwen Omni Flash family also looks promising. It can take audio directly, understand it, and return cleaned or structured text without requiring a separate ASR step.

The other approach is what I prefer when I want to preserve all my raw thoughts in their original ugliness.

In that case, use a dedicated transcription model — ASR, Automatic Speech Recognition, speech-to-text, whatever terminology you prefer — and keep transcription separate from editing.

Gemini 3.5 Transcribe has worked very well for me.

Microsoft MAI-Transcribe-2 came out recently. I’ve tested it a little and it seems promising, and it’s very cheap.

OpenAI’s GPT-Transcribe family is also worth trying. There is also GPT-4o Transcribe Diarize, which can identify different speakers in a conversation.

Qwen’s ASR models are also decent and reliable.

Grok Voice Transcribe 2 came out literally as I was writing the original version of this note. I haven’t properly tested it yet, so I have no useful opinion about its accuracy, but the pricing is absurdly cheap.

At prices like these, transcription itself is rapidly becoming something you barely need to think about.

I know people whose workflow is basically recording meetings, generating transcripts and then turning those into notes or summaries. If speaker recognition matters, look for transcription models that support speaker diarisation — identifying who spoke when. Some of the newer Transcribe models now have this built in.

One recurring failure mode with audio models is unusual vocabulary.

Indian names, technical terms, acronyms and model names can get mangled surprisingly often. Qwen, for example, seems to be a weirdly difficult word for transcription models. Even very good systems will confidently produce some other spelling.

A better prompt usually helps.

And if the transcription system supports custom vocabulary, keyword hints, hotwords, or phrase boosting — different providers use different terminology — give it the troublesome names and domain-specific words in advance. It can make a noticeable difference.

And then there is the third option: don’t send the audio anywhere at all.

I’ve also been running local speech models on my laptop, mostly OpenAI’s Whisper and NVIDIA’s Parakeet family of models.

My use case, again, is voice typing.

I built myself a little desktop app called "Yawp" ([https://github.com/bebhuvan/yawp](https://github.com/bebhuvan/yawp)) — or, more accurately, Claude Code and Codex built it for me because I was too lazy to type.

It works only on Linux.

The workflow is basically similar to Wispr Flow: press and hold a button, speak, release it, and the app transcribes what I said and pastes the text into whatever input surface I’m currently using.

It works reasonably well.

My testing methodology is not particularly scientific. I have been too lazy to buy a microphone, so I either shout at my laptop from about 50–60 centimetres away or lean over and speak like a moron directly into its microphone.

The accuracy is therefore a little lower than I’d like, but I suspect that particular problem is solved less by a new model than by me spending some money on a microphone.

Right now the workflow is press, hold, record, transcribe, paste.

I haven’t yet tried live-streaming the text as I speak, the way Wispr Flow does. That’s probably my next experiment.

If your workflow involves transcribing a lot of audio and you want to do it cheaply — or effectively for free once you already own the hardware — local models are absolutely worth looking at.

Whisper remains an obvious option. NVIDIA’s Parakeet family is another strong option, especially if you care about speed or want to experiment with streaming.

Cohere also has an open-source transcription model called Cohere Transcribe. I haven’t tested it yet, but it looks promising enough to add to the list.

As I finished writing this post, "Qwen 3.8 Omni Flash" ([https://qwen.ai/blog?id=qwen3.8-omni-flash](https://qwen.ai/blog?id=qwen3.8-omni-flash)) came out. It looks like another promising model for multimodal and audio workflows, but I haven’t tested it yet, so I don’t have a useful opinion on it beyond that.

And for people who actually know what they’re doing technically, there is an enormous open-source ecosystem here, both for audio and vision.

If you are technically savvy, I suspect you can get these models to do a whole lot more than anything I’m describing here. I am a complete non-technoob. There are probably things you can build with these models that I can’t even dream of.

Languages

One giant caveat: I’ve barely tested any of this with non-English speech.

English is the primary language in which I write, so almost all my experience is with English audio.

I did one brief Kannada experiment using a Qwen Omni model.

It failed miserably.

That is nowhere near enough testing to make some grand pronouncement about multilingual transcription, so I won’t. If your primary workflow is Kannada, Hindi, Tamil, Telugu, or anything else, assume none of my audio recommendations have been tested properly for your use case.

The part I still find crazy

The thing that still blows my mind is that all of this is possible in 2026.

I have absolutely no technical skills. I don’t mean that in the fake “haha I’m not technical” sense where somebody then casually writes Python. I barely know Excel.

And yet I can get Claude Code, Codex and these models to build utilities, desktop apps and workflows for me that I actually use.

That is fucking crazy.

People keep having these endless AGI-this, AGI-that, ghanta-loda debates, and I think a lot of it misses the much more interesting thing happening in front of us.

To say AGI is here would obviously be misleading.

But for normies, in terms of practical utility, some threshold was crossed a while ago. For me, Claude Sonnet 4 was probably around the point where that became obvious.

I think most people dramatically underestimate how useful these tools can be because they’re using the wrong frame to think about them.

Or they haven’t experimented enough.

Or they’re listening to some mouth-breathing idiot with very strong opinions about LLMs who last seriously used one two years ago.

I’ve been fucking around with these tools heavily for a long time now, and I still keep finding ridiculous amounts of utility in them.

They’ve become deeply embedded in a lot of what I do, both at work and outside it. A bunch of things I do today simply would not have been possible for me without them.

Which is why it always surprises me when people are still debating in the abstract whether LLMs are “useful.”

And hearing “they’re just next-token predictors” or “stochastic parrots” used as some sort of devastating argument in 2026 boggles my mind.

Okay. And?

If the stochastic parrot can transcribe my voice, clean up the transcript, read a 120-year-old book, turn a stock-exchange filing into a news item, write code, build me a Linux desktop app and help me run a dozen weird side projects, I’m not entirely sure what argumentative work the phrase “stochastic parrot” is supposed to be doing anymore.

The one thing I highly recommend is: use these tools heavily.

Not just the web chat boxes.

Get a subscription to Claude Code or Codex. Fuck around. Build something stupid. Try automating some annoying thing you do every week. Give it a project you’ve wanted to build for years but never had the technical ability to start.

You’ll be surprised not only by how much you can do, but by the kind of things you can suddenly do.

Especially if your brain has not completely died and you still have an imaginative streak — if you’ve always had a pile of silly online side projects you wanted to build — this feels like a golden age of side projects.

There has never been a better time to fuck around and find out.

These tools are really, really, really good.

If you’re not using them, I think you’re missing out.

Links

Vision and general-purpose models

- "DeepSeek V4.1 Flash — announcement" ([https://deepseek.com/en/news/deepseek-v4-1-flash/](https://deepseek.com/en/news/deepseek-v4-1-flash/))
- "Gemini 3.1 Flash-Lite — announcement" ([https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/))
- "Gemini 3.5 Flash — Google I/O announcement" ([https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/))
- "Gemini 3.6 Flash and 3.5 Flash-Lite — announcement" ([https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/))
- "Gemini 3.7 Flash — announcement" ([https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/))
- "Gemini 3.8 Flash — announcement" ([https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/))
- "Qwen 3.7 Flash — model page" ([https://www.alibabacloud.com/help/en/model-studio/qwen3-7-flash](https://www.alibabacloud.com/help/en/model-studio/qwen3-7-flash))
- "Qwen 3.8 Omni Flash — announcement" ([https://qwen.ai/blog?id=qwen3.8-omni-flash](https://qwen.ai/blog?id=qwen3.8-omni-flash))
- "GLM 5.3 Flash — announcement" ([https://autoclaw.z.ai/blog/model/glm-5.3-flash/](https://autoclaw.z.ai/blog/model/glm-5.3-flash/))
- "Xiaomi MiMo V2.5 — official release page" ([https://platform.xiaomimimo.com/docs/en-US/news/v2.5-tts-release](https://platform.xiaomimimo.com/docs/en-US/news/v2.5-tts-release))

Audio and transcription

- "OpenAI GPT-Transcribe — model page" ([https://developers.openai.com/api/docs/models/gpt-transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe))
- "OpenAI GPT-4o Transcribe — model page" ([https://developers.openai.com/api/docs/models/gpt-4o-transcribe](https://developers.openai.com/api/docs/models/gpt-4o-transcribe))
- "OpenAI GPT-4o Transcribe Diarize — model page" ([https://developers.openai.com/api/docs/models/gpt-4o-transcribe-diarize](https://developers.openai.com/api/docs/models/gpt-4o-transcribe-diarize))
- "Microsoft MAI-Transcribe-2 — announcement" ([https://microsoft.ai/news/mai-transcribe-2-is-the-fastest-most-accurate-and-cheapest-speech-recognition-model-in-the-world/](https://microsoft.ai/news/mai-transcribe-2-is-the-fastest-most-accurate-and-cheapest-speech-recognition-model-in-the-world/))
- "Grok Voice Transcribe 2 — announcement" ([https://x.ai/news/grok-voice-transcribe-2](https://x.ai/news/grok-voice-transcribe-2))
- "OpenAI Whisper — announcement" ([https://openai.com/index/whisper/](https://openai.com/index/whisper/))
- "NVIDIA Parakeet ASR — introduction" ([https://developer.nvidia.com/blog/?p=80564](https://developer.nvidia.com/blog/?p=80564))
- "Cohere Transcribe — announcement" ([https://cohere.com/blog/transcribe](https://cohere.com/blog/transcribe))
- "Qwen Omni — documentation" ([https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-omni](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-omni))

Disclaimer

This note was voice typed using ChatGPT. I also used ChatGPT to clean up my raw notes, structure them, edit them, and fact-check model names and links.