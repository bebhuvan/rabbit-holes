---
title: Tell your agent to speak to my agent
date: 2026-08-07
type: musings
url: https://rabbitholes.garden/
tags:
  - AI agents
  - Agentic commerce
published: true
draft: false
featured: false
---
*This is a loose, diarrheal stream of thoughts on commerce for AI agents, triggered by Cloudflare’s recent Wallets launch and the other increasingly weird and interesting things being built for an agent-first internet.*

*How sure am I about any of this? Does it really matter?*

The year is 2032.

You wake up in the morning, wave your hand, and there’s a ping. A hologram powers up and your personal assistant, Raju, pops up.

You tell him:

“Hey Raju, I want an avocado, kale, kelp, blueberry, rolled natural oats, egg yolk, high-protein creatine smoothie.”

Yes, this is a real thing.

Raju goes off and orders this monstrosity of a smoothie. And lo and behold, 15 minutes later, a delivery boy is at your doorstep ringing the bell.

You tell Raju to go fetch the smoothie.

Raju asks you to fuck off because he’s a hologram.

But anyways.

The point of this brilliant, admittedly awesome story is that with the rise of AI agents, things are changing, and you can already see glimpses of the future that might be coming.

Of course, the future isn’t predestined. It may not arrive.

If you spend 10 minutes scrolling on Twitter, it’s very easy to come away thinking the entire world is already using AI. Depending on whether you’re an optimist or a pessimist, you’ll then have your own grandiose vision of the glorious AI future or some horrendously depressing version of what is about to happen.

But, as Dave Chappelle once prophetically put it, Twitter is not a real place.

As things stand today, AI adoption, while much faster than most technologies, is still a minority phenomenon. A lot of people don’t really give a shit about AI or haven’t meaningfully used it. This is even more true in emerging and poorer countries.

But among a smaller set of people, particularly tech-first, younger, early-adopter types, usage is increasing rapidly.

And everybody is now creating their own “agents”, their own personal butlers, Alfreds, Jarvises and Fridays, and asking them to “go and do things”.

An agent is basically just a program powered by an LLM that has the ability to use tools and take actions on your behalf.

Think of it as a persistent instance of a large language model that, instead of just answering questions like the web versions of Claude or ChatGPT, can actually do things. It can build things, test things, browse the web, use tools and take a whole host of actions on your behalf.

Now fast-forward three or four years.

Forget AI continuing to improve at some ridiculous pace. Assume it merely keeps progressing at a reasonable pace.

It doesn’t seem implausible to me that a lot more people will have their own personal agents doing a whole variety of things for them compared to today.

Now think about that world.

The problem is that the internet, as it exists today, is designed for humans. It isn’t designed for agents.

You can’t really tell an agent to go order that piece of junk food for you, sign up for some software service and try it out, shop on Amazon on your behalf, send money to somebody, receive money, or do any of these things seamlessly.

There is an insane amount of friction because none of this was built for automated agents.

As things stand today, a human still has to be in the loop.

You have to create the account. Fill out the signup page. Enter your payment details. Enter an OTP. Approve the payment. Copy an API key somewhere. Come back periodically and manage the subscription.

And if soon a lot of people are going to be using agents for everything, this very human-oriented internet simply won’t work.

Companies seem to be sensing this direction of travel, and they are already building things for this agentic future.

One of the first big signals was Google’s **[Agent Payments Protocol, or AP2](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)**.

The entire idea behind AP2 was to create an open standard specifying how payments and payment credentials could be handled by agents using cryptographic mandates.

Because simply handing your credit-card details to some cloud agent and asking it to go and “do things” is probably the stupidest way to lose money.

You’re better off donating it to the Nigerian prince who desperately needs your money to get back to Nigeria so that he can finally send you your inheritance.

AP2 allows you to configure how much money an agent can spend, under what conditions, and for what purpose, and creates cryptographic proof that those permissions were actually authorized.

Then Stripe and OpenAI launched the **[Agentic Commerce Protocol, or ACP](https://stripe.com/blog/developing-an-open-standard-for-agentic-commerce)**.

ACP is a set of tools and standards that allows agents to perform commerce actions, right from browsing catalogues and managing shopping carts to authentication and secure payments.

And Google subsequently launched the **[Universal Commerce Protocol, or UCP](https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/)**.

The problem today is that if you’re building some software tool with multiple API integrations, you might be dealing with different data sources, different catalogues, checkout flows, authentication systems and so on.

What UCP, in principle, attempts to do is standardize all of this so that an agent can easily communicate with a retailer’s backend, discover the products in its catalogue, add products to a cart, check out and so on and so forth.

Several Indian companies have, at least in theory and in PR, claimed to be working on something similar using UPI.

[Razorpay](https://razorpay.com/blog/agentic-payments-and-npci/) has an agentic-payments product built on **[UPI Reserve Pay](https://razorpay.com/blog/upi-reserve-pay/)**, where a user can give one-time consent and establish spending limits. Within those limits, an AI agent can make payments without you having to enter a UPI PIN every single time.

[Pine Labs](https://www.pinelabs.com/media-analyst/the-ai-agent-can-now-pay-pine-labs-launches-p3p-indias-first-agentic-payment-protocol-built-on-upi) claims to have launched its own protocol, **[P3P, or Pine Labs Payment Protocol](https://www.pinelabs.com/docs/online-payments/ai/p3p)**, for agent-to-agent payments over UPI.

The entire intent here is to create tools, standards and protocols that allow agents to handle commerce transactions on behalf of their human overlords in a secure and safe manner.

And then there’s Cloudflare.

Cloudflare has actually been assembling different parts of this puzzle for a while.

Last year, it partnered with Coinbase to launch the **[x402 Foundation](https://blog.cloudflare.com/x402/)**, built around the idea of allowing clients and services to exchange money directly over the web.

It has also been working with Visa and Mastercard on **[securing agentic commerce](https://blog.cloudflare.com/secure-agentic-commerce/)**, particularly the problem of allowing merchants to distinguish legitimate shopping agents from random malicious bots.

Earlier this year, Cloudflare and Stripe showed a system where **[agents can create Cloudflare accounts, buy domains, subscribe to services and obtain API credentials](https://blog.cloudflare.com/agents-stripe-projects/)** without the human having to complete every individual step.

Then, last month, Cloudflare announced its **[Monetization Gateway](https://blog.cloudflare.com/monetization-gateway/)**, which allows websites, APIs, datasets and MCP tools to charge agents directly using x402.

And this week came **[Cloudflare Wallets](https://blog.cloudflare.com/wallets/)**.

This one is particularly interesting because it isn’t necessarily about your agent buying shoes or groceries. It is designed to allow AI agents to go and shop for web services and resources and pay for them.

Let’s say you ask Claude to build some tool for you.

Claude builds it.

But now the tool requires a whole host of different APIs, data sources or web services.

Today, you have to go to different websites, create accounts, purchase credits, create subscriptions, create API keys, and then give those API keys to the AI agent of your choice.

And on top of that, you also have to manage all these subscriptions you created, which is a big nightmare.

What Cloudflare is trying to do with its wallet is make all of this easy and seamless without you having to jump through multiple hoops.

It gives your agent a wallet so that it can go and pay for all of these services itself.

Technically, Wallets is still being rolled out. You can claim a Cloudflare Wallet handle today, while the ability to fund wallets and let agents actually spend from them is coming.

But the architecture is what's interesting.

There will be an Account Wallet controlled by the pathetic human, and Virtual Wallets that can be delegated to agents.

And perhaps what is most important is that Cloudflare Wallets allows you to set up explicit guardrails so that your agent doesn’t go mad, doesn’t go rogue, spend your entire credit-card limit and make you poor.

Which has happened, by the way.

You can create spending caps, merchant allowlists, transaction limits and so on, ensuring that nothing too catastrophic happens.

So instead of giving Claude Code or Codex your credit card and waking up in the morning to discover that your world-class weather or to-do app, explicitly designed for a massive audience of two people, has burnt through ₹30 lakh in API credits, you can avoid this delicious scenario entirely.

You can say:

“Hey agent, here’s a wallet with $100. Go and buy these API services, configure them, here’s what you can spend on, and here’s what you can’t spend on.”

Cloudflare is using x402, which makes payment part of the web request itself. So the agent can request a resource, discover what it costs, pay for it and continue, all without you, the pathetic human, having to be in the loop.

And almost as if Cloudflare was deliberately trying to make the point of this post for me, two days after announcing Wallets it launched **[Kitesurf, what it calls an “agent-first browser”](https://blog.cloudflare.com/kitesurf/)**.

Why does an AI agent need its own browser?

For basically the same reason it needs its own wallet.

The browser is one of the principal interfaces through which humans interact with the internet. Agents increasingly need to navigate the same web, except today they are largely doing so by awkwardly driving browsers built around humans clicking buttons, scrolling pages and filling forms.

Cloudflare says its existing headless-browser product has seen rapid growth because agents often need browsers to complete tasks and sometimes simply cannot complete them without one.

So now Cloudflare is experimenting with a browser designed for the agent itself.

Put all these things together and you can start to see the shape of the world that might be coming.

You have your own personal AI butler, sitting there at your beck and call 24/7.

You tell it to go do X.

And it goes and does X.

Of course, with any technological shift there is always an insane hype cycle where people paint these grandiose pictures of the world to come. More often than not, these predictions fall flat and the people making them end up looking like absolute fucking morons.

So there is every possibility that I am one of those morons.

But I increasingly think that the era AI portends is a real thing.

And my view isn’t based on me shoving the firehose of AI content directly into my brainstem all day.

It’s based mostly on continuously using these tools and repeatedly being surprised at how good they are getting.

The second reason, and this is a more recent one, is China.

We are now at the stage of the AI cycle where the competition isn’t just about capabilities or increasing parameter counts.

It is also about the **price of intelligence**.

And what DeepSeek and the other Chinese labs are doing is a classic example of this.

AI has also become a strategic priority for Xi Jinping and his merry band of communist technocrats.

And given that this is an obvious opportunity for China to narrow the US lead in AI, I don’t see Xi having much desire to cede ground. I also don’t see the Chinese labs stepping back and making life easier for the US labs.

If anything, the relentless price competition from the Chinese labs is starting to put enormous pressure on what everybody else can charge for intelligence.

And the reason this matters is simple: price matters.

A $20 subscription might not mean much to somebody living in the US. It is a very different proposition if you are in India, Africa or Latin America.

And this is precisely why things like Gemini matter.

Even if you think Gemini is a shitty model, the fact that it comes pre-bundled into the Android ecosystem matters. The fact that many Chinese AI apps and services are either free or deeply discounted matters.

All of this is crucial for adoption.

And I want to reiterate that, in terms of adoption, the best available numbers suggest these are still very, very early days.

Now, while it might sound like I’ve become a paid shill of the Chinese Communist Party, shilling the greatness of communist artificial intelligence, I’m writing all of this as dispassionately as possible.

Because depending on which day of the week you ask me about AI, I am apparently either an AI boomer or an AI doomer.

Which probably means I’m neither.

I’m saying all of this from the vantage point of a normie, somebody with absolutely no technical background who happens to use these tools for a variety of things.

And in my experience, despite the mountains and mountains of criticism of these models, despite all the pejorative descriptions of them as stochastic parrots vomiting out the median mediocrity of humanity, despite the idea that they are just obese programs jogging like a patient with severe asthma through latent space trying to predict the next token, and despite the argument that the entire thing is mass piracy and plagiarism on a scale humanity has never seen before because these models hoovered up all the available human knowledge on the internet, I continue to get a phenomenal amount of utility from them.

I’m doing all the things I always wanted to do but couldn’t because I was handicapped by my technical capabilities.

Now I feel like a kid in a candy store.

That being said, there is obviously a grotesque amount of AI hype.

And as shocking as this might sound, AGI is not six months away.

Contrary to the verbal farts that occasionally come out of Sam Altman’s ass, none of this means that every AI company will survive, that all jobs will disappear, or that Sam Altman, Dario Amodei and whoever else will become our new AI overlords as we stare up at frescoes of them surrounded by choirs of silicon angels and GPUs making brrr sounds.

But at the same time, if you actually use these tools, look at their capabilities, and then insist that they are useless, that strikes me as a kind of intellectual dishonesty and intellectual harakiri that I don’t really understand.

It is also increasingly difficult to maintain the position that this is simply another technological fad, one more corpse in the vast graveyard of technologies that were hyped to the moon and then forgotten.

To me, what all of these commerce protocols and tools represent is another signal that companies are betting on the possibility that the internet will eventually have to be designed for an agent-first world rather than a human-first world.

A world in which humans slowly recede into silhouettes in the background while their agents do more and more of the heavy lifting.

And when that happens, software needs a way to have an identity.

It needs a way to spend.

It needs a way to navigate the internet.

And ideally, it needs to do all three without making its owner poor.

I don’t know what the shape of that world will ultimately look like.

I’m neither an astrologer nor a liar.

But I’m kind of excited to find out.

Although, obviously, I’ll be unemployed and part of the permanent underclass.

Even as I sit under the Silk Board flyover with a begging bowl in my arm, waiting for AI-first natives to drop a few coins as alms so that I can fund my addiction to filter coffee and ghee paper masala dosa, I’ll be watching the world unfold.

These AI natives will zip past Silk Board in their AI-powered cars, waving their hands furiously and berating the holographic AI agents floating next to them.

And I’ll look towards Bellandur and see the skyscrapers belonging to Sam Altman and Demis Hassabis towering into the sky.

And just below them will be me.

With my begging bowl.

Except this time I won’t be begging for alms.

I’ll be begging for a few AI tokens.

---

*Disclosure: This post was voice-typed using ChatGPT and cleaned up using it. The thoughts are mine; the edits are ChatGPT’s.*