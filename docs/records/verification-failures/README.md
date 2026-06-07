# Verification Failures

Record failed commands that future agents should understand.

Each record should include:

- Date
- Command
- Short failure summary
- Suspected cause
- Follow-up status

## 2026-06-07 - npm publish 0.9.2 OTP interruption

- Command: `npm publish --access public`
- Short failure summary: npm returned `EOTP` and reported that the operation
  requires a one-time password from the authenticator.
- Suspected cause: npm treated the package publish as a sensitive write action
  requiring account 2FA. The Codex-run shell did not complete an interactive
  browser/passkey or OTP flow.
- Follow-up status: the npm registry later showed `@nobodyjack/jkit@0.9.2` as
  published, but its tarball has a different shasum and file count from the
  later local root-entry package. The root-entry release must use a later
  version, starting with `0.9.3`.
