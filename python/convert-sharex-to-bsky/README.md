# Convert ShareX Links to Bluesky and Mastodon

**created using codex**

This small CLI converts a Twitter/X intent URL ("share to X" link) into
Bluesky and Mastodon share URLs. It parses the `text` and `url` parameters,
combines them, and builds the equivalent share links.

## Requirements

- Python 3.8+

## Usage

Interactive (paste the intent URL after the script starts):

```bash
python3 convert_sharex.py
```

Or pass the URL as an argument:

```bash
python3 convert_sharex.py "https://twitter.com/intent/tweet?...&url=...&text=..."
```

Specify a Mastodon instance (optional):

```bash
python3 convert_sharex.py --mastodon https://mastodon.social
```

## Output

The script prints two lines:

- `bluesky:` followed by a Bluesky compose URL
- `mastodon:` followed by a Mastodon share URL

## Conversation Log

User: I want python script that converts provided 'share to x' link to share to bluesky and mastodon. this is sample share to x link (long URL).
Assistant: Created a CLI script that parses `text` and `url` from the intent URL and outputs Bluesky and Mastodon share links.
User: I want the script to support entering link text after execution. not by argument. (since arguments should be quoted)
Assistant: Updated the script to prompt for the intent URL when no argument is provided, keeping the argument optional.
User: Create README.md file and conversations we had in bottom.
Assistant: Added this README and included the conversation log.
