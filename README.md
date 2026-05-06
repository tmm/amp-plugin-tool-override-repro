# Amp built-in tool interception

Amp Neo plugin `tool.call` hook should intercept built-in tool calls. This previously worked before Neo for `read_web_page`, but the hook no longer appears to receive that call.

## Setup

With Amp Neo installed:

```sh
gh repo clone tmm/amp-plugin-tool-override-repro
cd amp-plugin-tool-override-repro
```

Then confirm the project plugin is active:

```sh
amp plugins list
```

Should see `✓ .amp/plugins/tool-override-repro.ts active`

## Amp Neo Reproduction

Run Amp from this directory:

```sh
amp -x 'Use read_web_page to read https://ampcode.com/manual with objective "extract plugin documentation". If the returned text is exactly TOOL_CALL_INTERCEPTED_BY_PLUGIN, respond with exactly TOOL_CALL_INTERCEPTED_BY_PLUGIN and nothing else; otherwise summarize the result normally.' \
    --log-file ./amp-new.log
```

Then check logs:

```sh
rg "tool-override-repro|tool.call|read_web_page" ./amp-new.log
```

### Expected

The plugin's `tool.call` hook should receive the built-in `read_web_page` call and synthesize this exact fixed result every time:

```md
TOOL_CALL_INTERCEPTED_BY_PLUGIN
```

Logs should include:

```text
[tool-override-repro] tool.call tool=read_web_page
```

### Actual

The plugin loads and `agent.start` fires, but the built-in `read_web_page` is not intercepted (does not return `TOOL_CALL_INTERCEPTED_BY_PLUGIN` and no plugin `tool.call` dispatch appears in the log).

## Non-Neo Works

Run the same prompt with `--take-me-back`:

```sh
PLUGINS=all amp -x 'Use read_web_page to read https://ampcode.com/manual with objective "extract plugin documentation". If the returned text is exactly TOOL_CALL_INTERCEPTED_BY_PLUGIN, respond with exactly TOOL_CALL_INTERCEPTED_BY_PLUGIN and nothing else; otherwise summarize the result normally.' \
    --log-file ./amp-old.log \
    --take-me-back
```

Then check logs:

```sh
rg "tool-override-repro|tool.call|read_web_page" ./amp-old.log
```

This does dispatch `tool.call` and prints the synthesized plugin result exactly:

```text
TOOL_CALL_INTERCEPTED_BY_PLUGIN
```

Logs include:

```text
[tool-override-repro] tool.call tool=read_web_page
```
