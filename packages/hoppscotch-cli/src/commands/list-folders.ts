import chalk from "chalk"

import { handleError } from "../handlers/error"
import { isHoppCLIError } from "../utils/checks"
import { fetchFromServer, ListCmdOptions } from "../utils/api"

interface FolderItem {
  id: string
  title: string
  parentID: string | null
  data: string | null
}

/**
 * Lists child folders (sub-collections) inside a given collection from the server.
 *
 * @param collectionId - The ID of the parent collection.
 * @param options - The command options containing `token` and optional `server`.
 */
export const listFolders =
  (collectionId: string, options: ListCmdOptions) => async () => {
    try {
      const folders = await fetchFromServer<FolderItem[]>(
        `v1/access-tokens/collection/${collectionId}/folders`,
        options
      )

      if (folders.length === 0) {
        console.log(
          chalk.yellow("No folders found in this collection.")
        )
        return
      }

      console.log(
        chalk.greenBright.bold(
          `\nFolders in collection ${collectionId}:\n`
        )
      )
      console.log(chalk.gray("─".repeat(60)))

      for (const folder of folders) {
        console.log(
          `  ${chalk.blueBright(folder.id)}  ${chalk.white.bold(folder.title)}`
        )
      }

      console.log(chalk.gray("─".repeat(60)))
      console.log(
        chalk.gray(`\nTotal: ${folders.length} folder(s)\n`)
      )
    } catch (e) {
      if (isHoppCLIError(e)) {
        handleError(e)
        process.exit(1)
      } else throw e
    }
  }
