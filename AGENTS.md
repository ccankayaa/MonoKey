# MonoKey Repository Instructions

## Scope and language

- Use `MonoKey` for the product, repository, solution, projects, namespaces, and documentation.
- Write code, namespaces, file names, public contracts, and technical documentation in English.
- Preserve nullable reference types.
- Prefer UTC-based `DateTimeOffset` values for timestamps.
- Async methods should accept a `CancellationToken` when cancellation is meaningful.

## Architecture

- Keep the system as a modular monolith using pragmatic Clean Architecture and vertical slices.
- `MonoKey.Domain` must not reference another project.
- `MonoKey.Application` may reference only `MonoKey.Domain`.
- `MonoKey.Infrastructure` may reference `MonoKey.Application` and `MonoKey.Domain`.
- `MonoKey.Api` may reference `MonoKey.Application` and `MonoKey.Infrastructure`.
- Domain and Application must never reference Infrastructure or Api.
- Public API contracts must not expose Domain entities directly.
- Do not introduce MediatR, microservices, speculative abstractions, or broad refactors without a demonstrated need.

## Security

- Follow `docs/security-model.md` for every vault-related change.
- Never send or store vault encryption keys or decrypted vault content on the backend.
- Never write sensitive content to logs, errors, traces, or telemetry.
- Do not commit secrets, connection strings, or tokens.
- Do not create an active vault endpoint until the cryptographic format is approved.
- Ask for approval before changing the security model or creating a database migration.

## Change discipline

- Preserve user changes and unrelated files.
- Ask before adding a production dependency.
- Do not infer UI dimensions or component behavior; request the relevant Figma frame when UI context is required.
- Backend work does not depend on Figma access.

## Verification

After every application-code change, run:

```text
dotnet format MonoKeyBackend.slnx --verify-no-changes
dotnet build MonoKeyBackend.slnx
dotnet test MonoKeyBackend.slnx
```

Do not treat an empty test suite as a successful test result. Report the discovered and executed test counts separately. Do not ignore security warnings.

At handoff, summarize changed files, decisions, and verification results. Do not commit unless explicitly requested.
