---
title: How Terence Tao uses AI
date: 2025-10-03
type: practical
tags:
  - AI
published: true
draft: false
featured: false
---
Here's [how the great Terrence Tao uses AI](https://mathstodon.xyz/@tao/115306424727150237). Lot's of takeaways here for us lesser mortals.

> I was able to use an extended conversation with an AI [https://chatgpt.com/share/68ded9b1-37dc-800e-b04c-97095c70eb29](https://chatgpt.com/share/68ded9b1-37dc-800e-b04c-97095c70eb29) to help answer a MathOverflow question [https://mathoverflow.net/questions/501066/is-the-least-common-multiple-sequence-textlcm1-2-dots-n-a-subset-of-t/501125#501125](https://mathoverflow.net/questions/501066/is-the-least-common-multiple-sequence-textlcm1-2-dots-n-a-subset-of-t/501125#501125) . I had already conducted a theoretical analysis suggesting that the answer to this question was negative, but needed some numerical parameters verifying certain inequalities in order to conclusively build a counterexample. Initially I sought to ask AI to supply Python code to search for a counterexample that I could run and adjust myself, but found that the run time was infeasible and the initial choice of parameters would have made the search doomed to failure anyway. I then switched strategies and instead engaged in a step by step conversation with the AI where it would perform heuristic calculations to locate feasible choices of parameters. Eventually, the AI was able to produce parameters which I could then verify separately (admittedly using Python code supplied by the same AI, but this was a simple 29-line program that I could visually inspect to do what was asked, and also provided numerical values in line with previous heuristic predictions).
> 
> Here, the AI tool use was a significant time saver - doing the same task unassisted would likely have required multiple hours of manual code and debugging (the AI was able to use the provided context to spot several mathematical mistakes in my requests, and fix them before generating code). Indeed I would have been very unlikely to even attempt this numerical search without AI assistance (and would have sought a theoretical asymptotic analysis instead).
> 
> I encountered no issues with hallucinations or other AI-generated nonsense. I think the reason for this is that I already had a pretty good idea of what the tedious computational tasks that needed to be performed, and could explain them in detail to the AI in a step-by-step fashion, with each step confirmed in a conversation with the AI before moving on to the next step. After switching strategies to the conversational approach, external validation with Python was only used at the very end, when the AI was able to generate numerical outputs that it claimed to obey the required constraints (which they did).