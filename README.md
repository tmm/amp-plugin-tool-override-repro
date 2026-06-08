# Amp built-in tool interception

Amp plugin `tool.call` hooks should intercept built-in tool calls. This previously worked before Neo for `read_web_page`, but the hook no longer appears to receive that call in current Amp.

## Setup

With Amp installed:

```sh
gh repo clone tmm/amp-plugin-tool-override-repro
cd amp-plugin-tool-override-repro
```

Then confirm the project plugin is active:

```sh
amp plugins list
```

Should see `✓ .amp/plugins/tool-override-repro.ts active`

## Reproduction

Run Amp from this directory:

```sh
amp -x 'Use read_web_page to read https://ampcode.com/manual with objective "extract plugin documentation". If the returned text is exactly TOOL_CALL_INTERCEPTED_BY_PLUGIN, respond with exactly TOOL_CALL_INTERCEPTED_BY_PLUGIN and nothing else; otherwise summarize the result normally.' \
    --log-file ./amp-read-web-page.log
```

Then check logs:

```sh
rg "tool-override-repro|tool.call|read_web_page" ./amp-read-web-page.log
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

The plugin loads and `session.start` fires, but the built-in `read_web_page` is not intercepted (does not return `TOOL_CALL_INTERCEPTED_BY_PLUGIN` and no plugin `tool.call` dispatch appears in the log).

## Sanity Check: Other Tools Still Dispatch Hooks

The old `--take-me-back` flag no longer exists in current Amp, so this repro can no longer compare against the pre-Neo runtime directly.

As a current-runtime sanity check, local executor tools still dispatch plugin hooks. Run:

```sh
amp -x 'Use Bash to run: echo TOOL_EVENT_CHECK. Then report the command output.' \
    --log-file ./amp-bash.log
```

Then check logs:

```sh
rg "tool-override-repro|tool.call|tool.result|Bash" ./amp-bash.log
```

Logs should include `tool.call` and `tool.result` dispatches for `Bash`, for example:

```text
[tool-override-repro] tool.call tool=Bash
[tool-override-repro] tool.result tool=Bash status=done
```

That suggests plugin hook dispatch still works for local executor tools, while `read_web_page` is on a path that bypasses `tool.call` interception.
