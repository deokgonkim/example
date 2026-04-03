# Responsive Layout and Full-Screen Picker Plan

## Summary

Make the TUI adapt cleanly to narrow terminals, especially 80x24.

Chosen defaults:

- Switch from side-by-side panes to stacked panes below 100 columns.
- In stacked mode, show channel/messages pane first and thread pane second.
- Keep the message-view area at 20 rows, split as `8` rows for channel/messages and `11` rows for thread.
- Use a compact key legend in narrow mode so footer text does not clip pane borders.
- Extend the channel picker to use the full available terminal area and support scrolling/windowing.

## Implementation Changes

- In `src/ui/App.tsx`, add terminal-width-aware layout selection with a single 100-column breakpoint constant.
- Keep existing behavior in wide mode, but in narrow mode:
  - change the message view from left/right panes to stacked top/bottom panes
  - keep focus handling unchanged (`Tab` still switches panes, arrows still act on the focused pane)
  - preserve the pinned selected root message and scrollable thread replies
- Size narrow message view explicitly:
  - top channel/messages pane height `8`
  - bottom thread pane height `11`
  - remove row-layout assumptions like `width="50%"` and `marginLeft={1}` in narrow mode
- Update footer/help rendering:
  - wide mode keeps the fuller legend
  - narrow mode uses a compact legend that fits inside 80 columns
- Extend picker behavior to full-screen style instead of content-sized rendering:
  - picker box should expand to available width
  - picker height should scale to the available terminal height budget rather than only the number of visible rows
  - channel rows should be windowed/scrollable so long channel lists remain usable on 80x24
  - preserve the current highlighted channel and clamp the visible picker window around the current selection
  - keep `Enter` behavior unchanged for opening the highlighted channel
- Apply the compact help-text treatment to picker mode too, so picker footer text does not break layout on narrow terminals.

## Test Plan

- Add layout/helper tests covering:
  - widths below 100 columns use stacked message layout
  - widths at or above 100 columns keep side-by-side layout
  - narrow layout preserves pane order as channel/messages then thread
  - narrow mode selects the compact key legend
- Add picker windowing tests covering:
  - long channel lists are sliced to a visible window
  - moving picker selection updates the visible window correctly
  - selection clamps correctly at list boundaries
  - returning to picker preserves or restores the highlighted current channel
- Verify visually against an 80x24 terminal target:
  - message view borders remain fully visible
  - picker uses the full screen area cleanly
  - footer/help text no longer causes clipping
- Run existing tests to ensure no regressions in picker navigation, thread scrolling helpers, and message rendering.

## Public Interface / Behavior Changes

- No Slack API or CLI changes.
- User-visible behavior changes:
  - message view automatically reflows on narrow terminals
  - picker uses a full-screen style layout with scrolling/windowing
  - footer key help becomes shorter in narrow mode

## Assumptions

- "Full-screen picker behavior" means using the available terminal area, not opening a separate modal or alternate screen.
- The existing overall message-view height remains fixed at 20 rows for now.
- 80x24 is the target minimum layout to optimize for.
- Picker and message view should both favor stable, windowed rendering over wrapping long lists beyond the visible viewport.
