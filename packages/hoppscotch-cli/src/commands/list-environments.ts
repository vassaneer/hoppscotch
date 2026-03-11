import chalk from "chalk"

import { handleError } from "../handlers/error"
import { isHoppCLIError } from "../utils/checks"
import { fetchFromServer, ListCmdOptions } from "../utils/api"

interface EnvironmentVariable {
  key: string
  secret: boolean
  initialValue: string
  currentValue: string
}

interface EnvironmentItem {
  id: string
  name: string
  teamID: string
  variables: EnvironmentVariable[] | string
}

/**
 * Lists all environments of a team/workspace from the server.
 *
 * @param teamId - The ID of the team/workspace.
 * @param options - The command options containing `token` and optional `server`.
 */
export const listEnvironments =
  (teamId: string, options: ListCmdOptions) => async () => {
    try {
      const environments = await fetchFromServer<EnvironmentItem[]>(
        `v1/access-tokens/environments/${teamId}`,
        options
      )

      if (environments.length === 0) {
        console.log(chalk.yellow("No environments found in this workspace."))
        return
      }

      console.log(
        chalk.greenBright.bold(`\nEnvironments in workspace ${teamId}:\n`)
      )
      console.log(chalk.gray("─".repeat(60)))

      for (const env of environments) {
        const variables: EnvironmentVariable[] =
          typeof env.variables === "string"
            ? JSON.parse(env.variables)
            : env.variables

        const varCount = variables.length

        console.log(
          `  ${chalk.blueBright(env.id)}  ${chalk.white.bold(env.name)}  ${chalk.gray(`(${varCount} variable${varCount !== 1 ? "s" : ""})`)}`
        )
      }

      console.log(chalk.gray("─".repeat(60)))
      console.log(
        chalk.gray(`\nTotal: ${environments.length} environment(s)\n`)
      )
    } catch (e) {
      if (isHoppCLIError(e)) {
        handleError(e)
        process.exit(1)
      } else throw e
    }
  }
