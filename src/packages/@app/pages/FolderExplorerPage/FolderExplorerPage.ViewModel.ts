// Repositories
import { CollectionRepository } from "@app/repositories/collection.repository";
import { TabRepository } from "@app/repositories/tab.repository";

// Servises
import { CollectionService } from "@app/services/collection.service";

// Types
import type {
  CollectionDocument,
  // CollectionDocument,
  TabDocument,
} from "@app/database/database";

// Utils
import { moveNavigation } from "$lib/utils/helpers";
import {
  Events,
  ItemType,
  // ResponseStatusCode,
  UntrackedItems,
} from "$lib/utils/enums";
// import { invoke } from "@tauri-apps/api/core";
import { v4 as uuidv4 } from "uuid";

// Stores
import type { CollectionItemsDto, Folder, Tab } from "@common/types/workspace";
import type { CreateApiRequestPostBody } from "$lib/utils/dto";
import { InitRequestTab } from "@common/utils";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { notifications } from "@library/ui/toast/Toast";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import { isGuestUserActive } from "$lib/store/auth.store";
// import { generateSampleRequest } from "$lib/utils/sample";
// import type { Folder, Path } from "$lib/utils/interfaces/request.interface";
// import { InitRequestTab } from "@common/utils";

class FolderExplorerPage {
  // Private Repositories
  private collectionRepository = new CollectionRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();

  // Private Services
  private collectionService = new CollectionService();

  constructor() {}

  /**
   *
   * @param _id - Id of the tab going to be updated
   * @param data - Data to be updated on tab
   */
  private updateTab = async (_id: string, data: Tab) => {
    this.tabRepository
      .getTabList()
      .subscribe((tabList) => {
        tabList.forEach((tab) => {
          if (tab.id === _id) {
            this.tabRepository.updateTab(tab?.tabId as string, data);
          }
        });
      })
      .unsubscribe();
  };

  /**
   *
   * @param collectionId - Id of the collection to be fetched
   * @returns - Requested collection
   */
  public getCollection = async (collectionId: string) => {
    return await this.collectionRepository.readCollection(collectionId);
  };

  /**
   *
   * @param collection - Collection in which folder exists
   * @param folderId - Id of folder going to be fetched
   * @returns - Requested Folder
   */
  public getFolder = async (
    collection: CollectionDocument,
    folderId: string,
  ) => {
    let folder: Folder | null = null;
    if (collection) {
      collection.items.forEach((_folder) => {
        if (_folder.id === folderId) {
          folder = _folder;
        }
      });
    }
    return folder;
  };

  /**
   *
   * @returns Observable collection list
   */
  public getCollectionList = async () => {
    return await this.collectionRepository.getCollection();
  };

  /**
   * Handles renaming a folder
   * @param collection :CollectionDocument - the collection in which the folder is saved
   * @param folder : - the folder going to be renamed
   * @param newFolderName :string - the new name of the folder
   */
  public handleRename = async (
    collection: CollectionDocument,
    folder: Folder,
    newFolderName: string,
  ) => {
    if (newFolderName) {
      let userSource = {};
      if (collection.activeSync && folder?.source === "USER") {
        userSource = {
          currentBranch: collection.currentBranch
            ? collection.currentBranch
            : collection.primaryBranch,
          source: "USER",
        };
      }
      let isGuestUser;
      isGuestUserActive.subscribe((value) => {
        isGuestUser = value;
      });
      if (isGuestUser === true) {
        this.updateTab(folder.id, { name: newFolderName });
        const res =
          await this.collectionRepository.readRequestOrFolderInCollection(
            collection.id,
            folder.id,
          );
        res.name = newFolderName;
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          folder.id,
          res,
        );
        notifications.success("Folder renamed successfully!");
        return;
      }
      const response = await this.collectionService.updateFolderInCollection(
        collection.workspaceId,
        collection.id,
        folder.id,
        {
          ...userSource,
          name: newFolderName,
        },
      );

      if (response.isSuccessful) {
        this.updateTab(folder.id, { name: newFolderName });
        this.collectionRepository.updateRequestOrFolderInCollection(
          collection.id,
          folder.id,
          response.data.data,
        );
        notifications.success("Folder renamed successfully!");
      }
    }
  };

  /**
   *
   * @param collection - Collection in which request exists
   * @param folder - Folder in which request exists
   * @param request - Request going to be opened
   */
  public handleOpenRequest = (
    collection: CollectionDocument,
    folder: Folder,
    request: Request,
  ) => {
    const req = new InitRequestTab(request.id, collection.workspaceId);
    const path: Path = {
      workspaceId: collection.workspaceId,
      collectionId: collection.id ?? "",
      folderId: folder?.id,
      folderName: folder?.name,
    };
    req.updateName(request.name);
    req.updateDescription(request.description);
    req.updateBody(request.request?.body);
    req.updateMethod(request.request?.method);
    req.updateUrl(request.request?.url);
    req.updateQueryParams(request.request?.queryParams);
    req.updateAuth(request.request?.auth);
    req.updateHeaders(request.request?.headers);
    req.updatePath(path);

    this.tabRepository.createTab(req.getValue());
    moveNavigation("right");
  };

  /**
   *
   * @param collection - Collection in which request going to be created
   * @param folder - Folder in which request going to be created
   * @returns
   */
  public handleCreateAPIRequest = async (
    collection: CollectionDocument,
    folder: Folder,
  ) => {
    // const sampleRequest = generateSampleRequest(
    //   UntrackedItems.UNTRACKED + uuidv4(),
    //   new Date().toString(),
    // );
    const initRequestTab = new InitRequestTab(
      UntrackedItems.UNTRACKED + uuidv4(),
      collection.workspaceId,
    );

    let userSource = {};
    if (collection.activeSync && folder?.source === "USER") {
      userSource = {
        currentBranch: collection.currentBranch
          ? collection.currentBranch
          : collection.primaryBranch,
        source: "USER",
      };
    }

    const requestObj: CreateApiRequestPostBody = {
      collectionId: collection.id,
      workspaceId: collection.workspaceId,
      ...userSource,
      folderId: folder.id,
      items: {
        name: folder.name,
        type: ItemType.FOLDER,
        items: {
          name: initRequestTab.getValue().name,
          type: initRequestTab.getValue().type,
          description: "",
          request: {
            method: initRequestTab?.getValue()?.property.request.method,
          },
        },
      },
    };
    await this.collectionRepository.addRequestInFolder(
      requestObj.collectionId,
      requestObj.folderId,
      {
        ...requestObj.items.items,
        id: initRequestTab.getValue().id,
      },
    );

    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const res = await this.collectionRepository.readRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        initRequestTab?.getValue().id,
      );

      res.id = uuidv4();
      await this.collectionRepository.updateRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        initRequestTab.getValue().id,
        res,
      );

      initRequestTab.updateId(res.id);
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
        folderId: folder.id,
      });
      initRequestTab.updateIsSave(true);
      // this.handleOpenRequest(collection, folder, sampleRequest);
      await this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
    }

    const response =
      await this.collectionService.addRequestInCollection(requestObj);
    if (response.isSuccessful && response.data.data) {
      const request = response.data.data;

      this.collectionRepository.addRequestInFolder(
        requestObj.collectionId,
        requestObj.folderId,
        request,
      );
      // this.collectionRepository.updateRequestInFolder(
      //   requestObj.collectionId,
      //   requestObj.folderId,
      //   sampleRequest.id,
      //   request,
      // );

      // sampleRequest.id = request.id;
      // sampleRequest.path.workspaceId = collection.workspaceId;
      // sampleRequest.path.collectionId = collection.id;
      // sampleRequest.path.folderId = folder.id;
      // sampleRequest.path.folderName = folder.name;
      // sampleRequest.property.request.save.api = true;
      // sampleRequest.property.request.save.description = true;

      initRequestTab.updateId(request.id);
      initRequestTab.updatePath({
        workspaceId: collection.workspaceId,
        collectionId: collection.id,
        folderId: folder.id,
      });
      initRequestTab.updateIsSave(true);
      // this.handleOpenRequest(collection, folder, sampleRequest);
      this.tabRepository.createTab(initRequestTab.getValue());
      moveNavigation("right");
      MixpanelEvent(Events.ADD_NEW_API_REQUEST, {
        source: "Side Panel Dropdown",
      });
      return;
    } else {
      notifications.error("Failed to create API");
    }
  };

  /**
   *
   * @param tab - Tab in which description will be updated
   * @param newDescription - New description
   */
  public handleUpdateDescription = async (
    tab: TabDocument,
    newDescription: string,
  ) => {
    const updateObj = {};
    updateObj["description"] = newDescription;
    let userSource = {};
    if (tab?.activeSync && tab?.source === "USER") {
      userSource = {
        currentBranch: tab?.currentBranch,
        source: "USER",
      };
    }
    let isGuestUser;
    isGuestUserActive.subscribe((value) => {
      isGuestUser = value;
    });
    if (isGuestUser === true) {
      const res =
        await this.collectionRepository.readRequestOrFolderInCollection(
          tab.path.collectionId,
          tab.path.folderId,
        );
      res.description = newDescription;
      await this.collectionRepository.updateRequestOrFolderInCollection(
        tab.path.collectionId,
        tab.path.folderId,
        res,
      );
      notifications.success("Description updated successfully!");
      return;
    }

    const updateFolderElement =
      await this.collectionService.updateFolderInCollection(
        tab.path.workspaceId,
        tab.path.collectionId,
        tab.path.folderId,
        { ...updateObj, ...userSource },
      );
    if (updateFolderElement.isSuccessful) {
      await this.collectionRepository.updateRequestOrFolderInCollection(
        tab.path.collectionId,
        tab.path.folderId,
        updateFolderElement.data.data,
      );
      notifications.success("Description updated successfully!");
    } else {
      notifications.error("Failed to update description!");
    }
  };

  /**
   *
   * @param collection - Collection in which folder exists
   * @param tab - Tab of the folder
   * @returns - Total number of requests in folder
   */
  public getTotalRequests = async (
    collection: CollectionDocument,
    tab: TabDocument,
  ) => {
    let totalRequests = 0;
    const folder = await this.getFolder(collection, tab.id);
    if (folder?.items) {
      folder.items.forEach((item: CollectionItemsDto) => {
        if (item.type === ItemType.REQUEST) {
          totalRequests++;
        }
      });
    }
    return totalRequests;
  };

  /**
   * Get workspace data through workspace id
   * @param workspaceId - id of workspace
   * @returns - workspace document
   */
  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };
}

export default FolderExplorerPage;
