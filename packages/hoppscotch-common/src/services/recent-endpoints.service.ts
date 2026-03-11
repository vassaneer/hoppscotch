import { Container, Service } from "dioc"
import { ref, watch } from "vue"
import { RESTTabService } from "./tab/rest"
import { PersistenceService, STORE_KEYS } from "./persistence"
import { HoppRESTRequest } from "@hoppscotch/data"
import { HoppRESTSaveContext } from "~/helpers/rest/document"

export type RecentEndpoint = {
  request: HoppRESTRequest
  id: string
  collectionID?: string
  teamID?: string
  lastOpened: number
  saveContext?: HoppRESTSaveContext
}

export class RecentEndpointsService extends Service {
  public static readonly ID = "RECENT_ENDPOINTS_SERVICE"

  private restTabService = this.bind(RESTTabService)
  private persistenceService = this.bind(PersistenceService)

  public recentEndpoints = ref<RecentEndpoint[]>([])

  constructor(c: Container) {
    super(c)
  }

  override onServiceInit() {
    this.loadFromPersistence()

    watch(
      () => this.restTabService.currentTabID.value,
      (tabID) => {
        if (tabID) {
          const tab = this.restTabService.getTabRef(tabID).value
          if (tab && tab.document.type === "request") {
            this.addRecentEndpoint(
              tab.document.request,
              tab.id,
              tab.document.saveContext
            )
          }
        }
      }
    )
  }

  private async loadFromPersistence() {
    const cached = await this.persistenceService.getNullable<RecentEndpoint[]>(
      STORE_KEYS.RECENT_ENDPOINTS
    )
    if (cached) {
      this.recentEndpoints.value = cached
    }
  }

  private async saveToPersistence() {
    await this.persistenceService.set(
      STORE_KEYS.RECENT_ENDPOINTS,
      this.recentEndpoints.value
    )
  }

  private addRecentEndpoint(
    request: HoppRESTRequest,
    id: string,
    saveContext?: HoppRESTSaveContext
  ) {
    const recent: RecentEndpoint = {
      request: JSON.parse(JSON.stringify(request)),
      id,
      saveContext,
      collectionID:
        saveContext?.originLocation === "team-collection"
          ? saveContext.collectionID
          : undefined,
      teamID:
        saveContext?.originLocation === "team-collection"
          ? saveContext.teamID
          : undefined,
      lastOpened: Date.now(),
    }

    const index = this.recentEndpoints.value.findIndex(
      (e) =>
        e.id === id ||
        (e.request.endpoint === request.endpoint &&
          e.request.method === request.method &&
          e.request.name === request.name)
    )

    if (index !== -1) {
      this.recentEndpoints.value.splice(index, 1)
    }

    this.recentEndpoints.value.unshift(recent)

    // Keep only last 10
    if (this.recentEndpoints.value.length > 10) {
      this.recentEndpoints.value.pop()
    }

    this.saveToPersistence()
  }
}
