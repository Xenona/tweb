import deferredPromise, { CancellablePromise } from "../helpers/cancellablePromise";


export class MultiUserTracker {

  private deferredUsers: CancellablePromise<string>;
  private loadPeersForMenu: CancellablePromise<void>;

  constructor() {
    this.deferredUsers = deferredPromise<string>();
    this.loadPeersForMenu = deferredPromise<void>();

  }

  public async getUsers(): Promise<string> {
    return this.deferredUsers; 
  }

  public resolveUser(user: string) {
    this.deferredUsers.resolve(user)
  }

  public async waitMenuPeers(): Promise<void> {
    return this.loadPeersForMenu;
  }

  public resolveMenuPeers() {
    this.loadPeersForMenu.resolve()
  }
}

const multiUserTracker = new MultiUserTracker()
export default multiUserTracker;
