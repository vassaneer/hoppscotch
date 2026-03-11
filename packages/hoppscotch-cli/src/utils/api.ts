import axios, { AxiosError } from "axios"

import { error } from "../types/errors"

export type ListCmdOptions = {
  token: string
  server?: string
}

/**
 * Makes an authenticated GET request to the Hoppscotch server API.
 *
 * @param endpoint - The API path relative to the server URL (e.g., "v1/access-tokens/collections/:id").
 * @param options - The command options containing the access token and optional server URL.
 * @returns The response data from the server.
 * @throws HoppCLIError on authentication or connection failures.
 */
export const fetchFromServer = async <T>(
  endpoint: string,
  options: ListCmdOptions
): Promise<T> => {
  const { token, server } = options
  const resolvedServerUrl = server || "https://api.hoppscotch.io"
  const separator = resolvedServerUrl.endsWith("/") ? "" : "/"
  const url = `${resolvedServerUrl}${separator}${endpoint}`

  try {
    const { data, headers } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!headers["content-type"]?.includes("application/json")) {
      throw new AxiosError("INVALID_CONTENT_TYPE")
    }

    return data as T
  } catch (err) {
    if (err instanceof AxiosError) {
      const axiosErr: AxiosError<{
        reason?: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "INVALID_ID"
        message: string
        statusCode: number
      }> = err

      const errReason = axiosErr.response?.data?.reason

      if (errReason) {
        throw error({
          code: errReason,
          data: ["TOKEN_EXPIRED", "TOKEN_INVALID"].includes(errReason)
            ? token
            : endpoint,
        })
      }

      if (axiosErr.code === "ECONNREFUSED") {
        throw error({
          code: "SERVER_CONNECTION_REFUSED",
          data: resolvedServerUrl,
        })
      }

      if (
        axiosErr.message === "INVALID_CONTENT_TYPE" ||
        axiosErr.code === "ERR_INVALID_URL" ||
        axiosErr.code === "ENOTFOUND" ||
        axiosErr.code === "ERR_BAD_REQUEST" ||
        axiosErr.response?.status === 404
      ) {
        throw error({ code: "INVALID_SERVER_URL", data: resolvedServerUrl })
      }
    }

    throw error({ code: "UNKNOWN_ERROR", data: err })
  }
}
