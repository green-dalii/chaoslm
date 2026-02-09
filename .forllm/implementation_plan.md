# Fix DeepSeek Reasoning & Add Temperature Control

The user reports that `deepseek-reasoner` returns blank responses and requested a temperature slider in the setup UI.

## User Review Required

> [!IMPORTANT]
> `deepseek-reasoner` does not support the `temperature` parameter. I will ensure that if this model is selected, the temperature setting is ignored or set to the provider's default to avoid API errors.

## Proposed Changes

### LLM Adapters
#### [MODIFY] [generic-adapter.ts](file:///Users/greener/project/chaoslm/src/lib/llm-adapters/generic-adapter.ts)
- Add `temperature` parameter to `chatStream`.
- Ensure `temperature` is passed to the OpenAI client.

### Conductor Logic
#### [MODIFY] [use-conductor.ts](file:///Users/greener/project/chaoslm/src/hooks/use-conductor.ts)
- Extract `temperature` from the `currentAgent` config.
- Pass `temperature` in the payload to `/api/chat`.
- Add a special check: If `modelId` is `deepseek-reasoner`, do not send `temperature` (or send `undefined`).

### API Routes
#### [MODIFY] [route.ts](file:///Users/greener/project/chaoslm/src/app/api/chat/route.ts)
- Accept `temperature` in the request body.
- Pass it to the provider's `chatStream`.

### Frontend Setup UI
#### [MODIFY] [page.tsx](file:///Users/greener/project/chaoslm/src/app/setup/page.tsx) (SetupScreen)
- Add a slider for `temperature` (0.0 to 2.0, default 1.0) in the agent configuration modal/form.
- Ensure the state is saved to the agent object.

## Verification Plan

### Automated Tests
- Manual verification via UI.
- Use `curl` to test `/api/chat` with temperature and `deepseek-reasoner`.

### Manual Verification
1. Add an agent with `deepseek-reasoner`.
2. Start a debate and verify thinking content appears AND the final answer appears.
3. Check the setup page, adjust temperature for an agent, and verify it persists and is sent in the API request.
