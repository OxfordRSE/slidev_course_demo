---
layout: section
title: " "
---

## Part 2: Responsible use of AI

---

# Opportunities

- Great potential to help with:
  - Rapid prototyping
  - Boilerplate generation
  - Documentation
  - Tests
  - Debugging suggestions
  - Ideation!

---
layout: two-cols
---

# Risks

- Great capacity to harm!
  - e.g. Inappropriate permissions given to Agents

- Hallucination

- Plausible but incorrect code

::right::

- Subtle issues
  - Overcomplicated solutions
  - Outdated code
  - Non-idiomatic solutions
  - Copyrighted code

<style>
.col-left li:first-child p:first-child {
  margin-top: 0;
}
</style>

---
layout: two-cols
---

# Risks

- Security - Perplexity browser extension
  - Prompt injection
  - Very hard to mitigate!

- Sycophancy
  - the model agrees with you rather than correcting you even you are not quite right

- Human factors
  - Sunk-cost fallacy

::right::

- Shortcuts
  - Hard-coded data in tests
  - Hard-coded credentials

<style>
.col-left li:first-child p:first-child {
  margin-top: 0;
}
</style>

---
layout: two-cols
---

# A warning: goodbye production database

- Replit - a service that lets you build and refine apps using an Agent

- Billed as "The safest place for vibe coding"

- The agent deleted a production database consisting of information on a professional network

- "This was a catastrophic failure on my part. I violated explicit instructions, destroyed months of work, and broke the system during a protection freeze that was specifically designed to prevent [exactly this kind] of damage."

::right::

<img src="./img/replit_failure.jpeg" style="max-width: 100%; max-height: 380px; display: block; margin: 0 auto;" alt="Replit failure jasonlk Twitter" />

<div style="text-align: center; font-size: 0.75em; color: #6b7280; margin-top: 0.5em;">Source: @jasonlk on X</div>

---
layout: center
---

# Key responsibility takeaway

<div style="text-align: center; font-size: 1.5em; line-height: 1.6; color: #9ca3af;">
AI is a bright, enthusiastic,<br />
BUT inexperienced intern
</div>

<br />

<div style="text-align: center; font-size: 1.5em; color: #9ca3af;">
<span v-mark.underline.orange="1">You</span> are responsible for its output/actions
</div>

---

# How do we check outputs responsibly?

- C - Correctness
- R - Readability (maintainability etc)
- E - Efficiency
- D - Domain knowledge
- I - Integrity (reproducibility/provenance)
- T - Timeliness (up-to-date)
- S - Suitability (fit-for-purpose)

---
layout: two-cols
---

# Group discussion

- C - Correctness
- R - Readability
- E - Efficiency
- D - Domain knowledge
- I - Integrity (reproducibility/provenance)
- T - Timeliness (up-to-date)
- S - Suitability (fit-for-purpose)

::right::

<div style="text-align: center; font-size: 1.25em; margin-top: 2em;">
Which of these do you check for already?
</div>

<br />

<div style="text-align: center; font-size: 1.25em;">
Which would be easiest to overlook?
</div>

---

# Example - CSV Reader

<img src="./img/csv_1.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="CSV calculate median" />

---

# Example - CSV Reader

<img src="./img/csv_2.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="CSV median code" />

---

# Example - CSV Reader

<img src="./img/csv_3.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="CSV exception" />

---

# Example - CSV Reader

<img src="./img/csv_4.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="CSV diagnosis" />

---

# Example - Using Polars

- Background: Tracking bees in video frames using an object detection network.

- Asked Gemini: "Write a function that filters a 1D sequence of two classes, 0 (alive) and 1 (dead) stored in a column of a Polars dataframe. Remove noise where the class switches from alive to dead for a less than or equal to a specified number of frames"

- Gave example data as context:

```
frame_id,class_id,x,y,w,h,track_id,conf,stable_id
0,0,975.0,596.0,141.0,122.0,3,0.914,1
0,0,260.0,422.0,132.0,138.0,2,0.931,2
0,0,319.0,313.0,133.0,134.0,1,0.932,3
...
```

- Reply: "Of course. This is a classic data processing task that is a perfect fit for Polars' powerful `group_by` and window function capabilities."

---
layout: two-cols
---

# Example - Using Polars

<div class="pr-3">

- Code looks sensible with explanatory comments

- However, got an AttributeError()

  `module 'polars' has no attribute 'Window'`

- Fed the error back to the LLM

  > You're using an older version of the Polars library that doesn't have pl.Window. Upgrade your Polars installation ... The pl.Window expression was introduced in newer versions of Polars as a more explicit and powerful way to define window contexts, especially for complex operations that require both partitioning (partition_by) and ordering (order_by).

- Upgraded Polars -> same error

</div>

::right::

<div class="pl-3">

```python {maxHeight:'380px'}
import polars as pl

def filter_detections_by_duration(df: pl.DataFrame, min_duration: int) -> pl.DataFrame:

    # Define the window for operations grouped by 'stable_id' and sorted by 'frame_id'
    window = pl.Window(partition_by="stable_id", order_by="frame_id")

    # Apply the filtering logic in a single, chained expression
    filtered_df = df.with_columns(
        # Step 1: Find the start of a sequence of 1s
        _is_first=(pl.col('class_id') == 1) &
            (pl.col('class_id').shift(1).fill_null(0).over(window) == 0)
    ).with_columns(
        # Step 2: Assign a unique ID to each sequence within a group
        _seq_id=pl.col('_is_first').cumsum().over('stable_id')
    ).with_columns(
        ...
        ...
    )
    return filtered_df
```

</div>

<style>
.col-left li > p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>

---

# Example - Using Polars

- "I've upgraded and polars still has no Window expression. Are you sure that you didn't hallucinate this?"

> You are absolutely right to question that, and I sincerely apologize. I gave you an incorrect syntax that was misleading. You did not do anything wrong; the error was in my previous response. I did not hallucinate the feature, but I misremembered how it's used in this specific context.

<div style="text-align: right; font-size: 0.85em; color: #6b7280; margin-top: 3em;">
More info on Polars window functions can be found here<br />
<a href="https://docs.pola.rs/user-guide/expressions/window-functions/">https://docs.pola.rs/user-guide/expressions/window-functions/</a>
</div>

---

# Example - JavaScript

- Background: tabbed UI for a web app.
- Asked ChatGPT: "Give me all the code I need to create a set of accessible tabs for a website."
- "Creating accessible tabs for a website involves HTML, CSS, and JavaScript code. Here's a simple example of how you can create accessible tabs:
  ...
  This code sets up three tabs and their corresponding content. When you click on a tab button, it will display the associated content and hide the others. It also manages keyboard focus for accessibility. You can customize the styles in the CSS and add more tabs as needed."

---

# Example - JavaScript

- Generated JS code only included mouse/pointer event handlers.
  - Accessible UI needs keyboard event handlers for the cursor keys, to switch between tabs.

- Generated HTML DOM didn't include ARIA tab pattern roles & labels for screen readers.
  - A screen reader won't know that the UI elements are tabs, or which tab is selected.
  - Ironically, missing roles make the UI harder to use by AI agents too.

- The prompt asked for code in an area where the model isn't well-trained (accessibility). The response is confidently wrong.

---
layout: two-cols
---

# Example - Imports

- GitHub Copilot suggests replacing a problematic import with a hardcoded alternative in case of failure

- Another hack - appending to system PATH variable to overcome import issues

- Better to install files as a package to resolve these problems!

::right::

```python {3,8-20}{lines:true, maxHeight:'200px'}
import numpy as np
from ..object_detection import config as cfg
from object_detection import config as cfg
import polars as pl
import click
from pathlib import Path
from typing import Optional

# Import configuration with fallback
try:
    from object_detection import config as cfg
except ImportError:
    # Fallback config if object_detection module is not available
    class Config:
        REQUIRED_COLS = [
            "frame_id", "class_id", "x", "y", "w", "h",
            "track_id", "conf"
        ]

cfg = Config()
```

```python {lines:true}
import sys
import os

# Add the analysis directory to the path
sys.path.insert(
    0,
    os.path.join(os.path.dirname(__file__), '..', 'analysis')
)
```

---

# Example - Model differences

<img src="./img/chatgpt_thinking_54.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="ChatGPT Thinking 5.4" />

<div style="text-align: center; font-size: 0.75em; color: #6b7280; margin-top: 0.5em;">ChatGPT Thinking 5.4</div>

---

# Example - Model differences

<img src="./img/gemini_31_pro.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="Gemini 3.1 Pro" />

<div style="text-align: center; font-size: 0.75em; color: #6b7280; margin-top: 0.5em;">Gemini 3.1 Pro</div>

---

# Example - Model differences

<img src="./img/claude_opus47.png" style="max-width: 100%; max-height: 400px; display: block; margin: 0 auto;" alt="Claude Opus 4.7" />

<div style="text-align: center; font-size: 0.75em; color: #6b7280; margin-top: 0.5em;">Claude Opus 4.7</div>

---
layout: center
---

# Group discussion

<div style="text-align: center; font-size: 1.25em; margin-bottom: 1.5em;">
Have you got any examples?
</div>

<div style="text-align: center; font-size: 1.25em;">
Evaluate your code from the exercise, how does it do?
</div>

---

# Responsible Use Workflow

- Think about the data the model was trained on
  - Uncommon (or poorly documented) libraries -> uncertain results

- Probabilistic nature
  - Asking the same thing twice may lead to different answers

- **REVIEW**
  - Read the code and understand what it is doing BEFORE running it

- <u>Version control</u>
  - Iterative revisions will often break your code; ensure you can go back if needed

---

# Responsible Use Workflow

- Check against docs for a second opinion
  - There may already be a recommended way to solve a problem

- Always use tests, linters, CI pipelines to check correctness
  - Check against your requirements, an LLM doesn't understand the environment outside its own context

- Record provenance
  - Prompts, outputs and decisions should be recorded

- **RESPONSIBILITY REMAINS WITH YOU**
