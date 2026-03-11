import chalk from "chalk"

import { handleError } from "../handlers/error"
import { isHoppCLIError } from "../utils/checks"
import { fetchFromServer, ListCmdOptions } from "../utils/api"

interface CollectionItem {
  id: string
  title: string
  parentID: string | null
  data: string | null
}

/**
 * Lists root-level collections of a team/workspace from the server.
 *
 * @param teamId - The ID of the team/workspace.
 * @param options - The command options containing `token` and optional `server`.
 */
export const listCollections =
  (teamId: string, options: ListCmdOptions) => async () => {
    try {
      const collections = await fetchFromServer<CollectionItem[]>(
        `v1/access-tokens/collections/${teamId}`,
        options
      )

      if (collections.length === 0) {
        console.log(chalk.yellow("No collections found in this workspace."))
        return
      }

      console.log(
        chalk.greenBright.bold(`\nCollections in workspace ${teamId}:\n`)
      )
      console.log(
        chalk.gray("─".repeat(60))
      )

      for (const collection of collections) {
        console.log(
          `  ${chalk.blueBright(collection.id)}  ${chalk.white.bold(collection.title)}`
        )
      }

      console.log(
        chalk.gray("─".repeat(60))
      )
      console.log(
        chalk.gray(`\nTotal: ${collections.length} collection(s)\n`)
      )
    } catch (e) {
      if (isHoppCLIError(e)) {
        handleError(e)
        process.exit(1)
      } else throw e
    }
  }
