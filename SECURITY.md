# Security policy

## Scope

prismarine-physics executes movement and collision calculations over caller-provided world and entity data. A hostile plugin or malformed world block can cause excessive collision work, numerical instability, memory or CPU denial of service, or unexpected state mutation. The module does not authenticate Minecraft users or servers itself.

## Supported versions

There is no formal long-term security-support matrix for this fork. Security triage starts with current master and the latest published package. Version behavior follows the feature map and registry capabilities in the current tree, including the Java 26.2 and 26.3 paths. Historical behavior is a compatibility target, not a separate security-support promise.

## Reporting a vulnerability

As verified on 2026-09-19, this fork has no enabled GitHub private vulnerability-reporting endpoint. Do not publish malicious world objects, exploit code, private server data, or account information in a public issue.

1. Check the repository GitHub **Security** tab for **Report a vulnerability** and use the private form if it is available.
2. Otherwise use a private contact method listed on the [Misty4119 GitHub profile](https://github.com/Misty4119). If no private route is shown, request one without including exploit details and then send the report privately.
3. Redact tokens, user identifiers, server addresses, private world data, and logs that are not necessary for reproduction.

Include the affected commit/version, world/block shape or input type, minimal reproduction, impact, and runtime environment. No response or remediation time is promised.

For ordinary simulation bugs, use the [public issue tracker](https://github.com/Misty4119/prismarine-physics/issues) with sensitive data removed.
