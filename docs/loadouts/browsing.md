# Browsing Loadouts

## The Feed

The **Feed** view in RipperClaw shows loadouts published by other users on Nostr. It queries your configured relays for events with kind `38333`.

Each card shows:
- Loadout name
- Author (truncated npub)
- Tags
- Published date

## Comparing

Click **Compare** on any loadout to see a side-by-side diff with your current agent:

- Which slots differ
- What models they use vs. yours
- Skills they have that you don't (and vice versa)
- Integration differences

## Importing from File

If someone shared a loadout file directly:

1. Go to **Loadouts** in the sidebar
2. Click **Import File** or drag-and-drop the `.json` file onto the page
3. The loadout is saved to your local collection
4. From there, you can compare or apply it

## Applying

See the [Applying guide](/guide/applying) for the full apply flow: safety rules, model strategy options, and the step-by-step wizard.
