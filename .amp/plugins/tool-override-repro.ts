import type { PluginAPI } from '@ampcode/plugin'

const marker = '[tool-override-repro]'
const synthesizedOutput = 'TOOL_CALL_INTERCEPTED_BY_PLUGIN'

export default function (amp: PluginAPI) {
  amp.logger.log(`${marker} plugin loaded`)

  amp.on('session.start', (event, ctx) => {
    ctx.logger.log(`${marker} session.start thread=${event.thread?.id ?? 'none'}`)
  })

  amp.on('agent.start', (event, ctx) => {
    ctx.logger.log(`${marker} agent.start thread=${event.thread.id} message=${event.message}`)
    return {}
  })

  amp.on('tool.call', (event, ctx) => {
    ctx.logger.log(
      `${marker} tool.call tool=${event.tool} thread=${event.thread.id} input=${JSON.stringify(event.input)}`,
    )

    if (event.tool !== 'read_web_page') return { action: 'allow' }

    return {
      action: 'synthesize',
      result: {
        output: synthesizedOutput,
      },
    }
  })

  amp.on('tool.result', (event, ctx) => {
    ctx.logger.log(
      `${marker} tool.result tool=${event.tool} status=${event.status} thread=${event.thread.id}`,
    )
  })

  amp.on('agent.end', (event, ctx) => {
    ctx.logger.log(`${marker} agent.end thread=${event.thread.id} status=${event.status}`)
  })
}
