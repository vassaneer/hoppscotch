import chalk from "chalk"
import { Command } from "commander"
import * as E from "fp-ts/Either"

import { version } from "../package.json"
import { test } from "./commands/test"
import { listCollections } from "./commands/list-collections"
import { listEnvironments } from "./commands/list-environments"
import { listFolders } from "./commands/list-folders"
import { handleError } from "./handlers/error"

const accent = chalk.greenBright

// ─── Program Default Configuration ───────────────────────────────────────────

const CLI_BEFORE_ALL_TXT = `hopp: The ${accent(
  "Hoppscotch"
)} CLI - Version ${version} (${accent(
  "https://hoppscotch.io"
)}) ${chalk.black.bold.bgYellowBright(" ALPHA ")} \n`

const CLI_AFTER_ALL_TXT = `\nFor more help, head on to ${accent(
  "https://docs.hoppscotch.io/documentation/clients/cli/overview"
)}`

const HELP_LINK_TXT = `\nFor help, head on to ${accent(
  "https://docs.hoppscotch.io/documentation/clients/cli/overview#commands"
)}`

const program = new Command()

program
  .name("hopp")
  .version(version, "-v, --ver", "see the current version of hopp-cli")
  .usage("[options or commands] arguments")
  .addHelpText("beforeAll", CLI_BEFORE_ALL_TXT)
  .addHelpText("after", CLI_AFTER_ALL_TXT)
  .configureHelp({
    optionTerm: (option) => accent(option.flags),
    subcommandTerm: (cmd) => accent(cmd.name(), cmd.usage()),
    argumentTerm: (arg) => accent(arg.name()),
  })
  .addHelpCommand(false)
  .showHelpAfterError(true)

program.exitOverride().configureOutput({
  writeErr: (_str) => program.help(),
  outputError: (str, _write) =>
    handleError({ code: "INVALID_ARGUMENT", data: E.toError(str) }),
})

// ─── Command: test ───────────────────────────────────────────────────────────
// Run API requests from a Hoppscotch collection and execute associated
// pre-request scripts and test scripts. Supports both local JSON exports
// and remote workspace collections fetched via a personal access token (PAT).
//
// Usage:
//   hopp test <file_path_or_id> [options]
//
// Examples:
//   hopp test collection.json
//   hopp test collection.json -e env.json
//   hopp test <collection_id> --token pat-xxxx --server https://my-sh.com
//   hopp test collection.json --reporter-junit report.xml
//   hopp test collection.json --iteration-data data.csv --iteration-count 5

program
  .command("test")
  .argument(
    "<file_path_or_id>",
    "path to a local Hoppscotch collection.json export file, " +
      "or a workspace collection ID (requires --token)"
  )
  .option(
    "-e, --env <file_path_or_id>",
    "path to an environment variables JSON file (exported from Hoppscotch), " +
      "or a workspace environment ID (requires --token)"
  )
  .option(
    "-d, --delay <delay_in_ms>",
    "delay in milliseconds between consecutive requests within the collection " +
      "(useful for rate-limited APIs)"
  )
  .option(
    "--token <access_token>",
    "personal access token (PAT) for authenticating with a Hoppscotch workspace; " +
      "required when using workspace collection/environment IDs instead of local files"
  )
  .option(
    "--server <server_url>",
    "base URL of a self-hosted Hoppscotch instance " +
      "(defaults to the Hoppscotch cloud API at https://api.hoppscotch.io)"
  )
  .option(
    "--reporter-junit [path]",
    "generate a JUnit XML test report after the run; " +
      "optionally specify an output file path (defaults to hopp-junit-report.xml)"
  )
  .option(
    "--iteration-count <no_of_iterations>",
    "number of times to repeat the entire collection run " +
      "(each iteration uses the next row from --iteration-data if provided)",
    parseInt
  )
  .option(
    "--iteration-data <file_path>",
    "path to a CSV file for data-driven testing; " +
      "each row provides variable values for one iteration of the collection"
  )
  .option(
    "--legacy-sandbox",
    "use the legacy scripting sandbox instead of the experimental isolated-vm sandbox"
  )
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .description(
    "run requests and tests from a Hoppscotch collection (local file or workspace ID)"
  )
  .addHelpText("after", HELP_LINK_TXT)
  .action(async (pathOrId, options) => {
    const overrides: Record<string, unknown> = {}

    // Choose `hopp-junit-report.xml` as the default value if
    // `reporter-junit` flag is supplied without a value
    if (options.reporterJunit === true) {
      overrides.reporterJunit = "hopp-junit-report.xml"
    }

    const effectiveOptions = { ...options, ...overrides }

    await test(pathOrId, effectiveOptions)()
  })

// ─── Command: list-collections ───────────────────────────────────────────────
// Fetch and display all root-level collections that belong to a
// team/workspace. Requires a valid PAT with access to the target workspace.
//
// Usage:
//   hopp list-collections <team_id> --token <access_token> [--server <url>]
//
// Examples:
//   hopp list-collections clxxxxxxxxx --token pat-xxxx
//   hopp list-collections clxxxxxxxxx --token pat-xxxx --server https://my-sh.com

program
  .command("list-collections")
  .argument(
    "<team_id>",
    "ID of the team/workspace whose root-level collections you want to list"
  )
  .requiredOption(
    "--token <access_token>",
    "personal access token (PAT) for authenticating with the Hoppscotch workspace"
  )
  .option(
    "--server <server_url>",
    "base URL of a self-hosted Hoppscotch instance " +
      "(defaults to the Hoppscotch cloud API at https://api.hoppscotch.io)"
  )
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .description(
    "list all root-level collections in a workspace (requires --token)"
  )
  .addHelpText("after", HELP_LINK_TXT)
  .action(async (teamId, options) => {
    await listCollections(teamId, options)()
  })

// ─── Command: list-environments ──────────────────────────────────────────────
// Fetch and display all environments that belong to a team/workspace.
// Each environment is shown with its ID, name, and variable count.
// Requires a valid PAT with access to the target workspace.
//
// Usage:
//   hopp list-environments <team_id> --token <access_token> [--server <url>]
//
// Examples:
//   hopp list-environments clxxxxxxxxx --token pat-xxxx
//   hopp list-environments clxxxxxxxxx --token pat-xxxx --server https://my-sh.com

program
  .command("list-environments")
  .argument(
    "<team_id>",
    "ID of the team/workspace whose environments you want to list"
  )
  .requiredOption(
    "--token <access_token>",
    "personal access token (PAT) for authenticating with the Hoppscotch workspace"
  )
  .option(
    "--server <server_url>",
    "base URL of a self-hosted Hoppscotch instance " +
      "(defaults to the Hoppscotch cloud API at https://api.hoppscotch.io)"
  )
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .description(
    "list all environments in a workspace (requires --token)"
  )
  .addHelpText("after", HELP_LINK_TXT)
  .action(async (teamId, options) => {
    await listEnvironments(teamId, options)()
  })

// ─── Command: list-folders ───────────────────────────────────────────────────
// Fetch and display all child folders (sub-collections) inside a specific
// collection. Use the collection ID from `list-collections` output.
// Requires a valid PAT with access to the parent collection's workspace.
//
// Usage:
//   hopp list-folders <collection_id> --token <access_token> [--server <url>]
//
// Examples:
//   hopp list-folders clxxxxxxxxx --token pat-xxxx
//   hopp list-folders clxxxxxxxxx --token pat-xxxx --server https://my-sh.com

program
  .command("list-folders")
  .argument(
    "<collection_id>",
    "ID of the parent collection whose child folders (sub-collections) you want to list"
  )
  .requiredOption(
    "--token <access_token>",
    "personal access token (PAT) for authenticating with the Hoppscotch workspace"
  )
  .option(
    "--server <server_url>",
    "base URL of a self-hosted Hoppscotch instance " +
      "(defaults to the Hoppscotch cloud API at https://api.hoppscotch.io)"
  )
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .description(
    "list all folders (sub-collections) inside a collection (requires --token)"
  )
  .addHelpText("after", HELP_LINK_TXT)
  .action(async (collectionId, options) => {
    await listFolders(collectionId, options)()
  })

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

export const cli = async (args: string[]) => {
  try {
    await program.parseAsync(args)
  } catch (e) {}
}
