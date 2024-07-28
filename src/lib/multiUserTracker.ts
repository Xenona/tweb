import deferredPromise, {CancellablePromise} from '../helpers/cancellablePromise';
import rootScope from './rootScope';
import sessionStorage from './sessionStorage';

export class MultiUserTracker {
  private deferredUsers: CancellablePromise<string>;
  private loadPeersForMenu: CancellablePromise<void>;

  constructor() {
    this.deferredUsers = deferredPromise<string>();
    this.loadPeersForMenu = deferredPromise<void>();
    rootScope.addEventListener('user_auth', () => {
      const a = () => {
        rootScope.managers.appUsersManager.getSelf().then((e) => {
          if(e) {
            sessionStorage.updateSelfInfo(e)
          } else {
            setTimeout(a, 1000)
          }
        })
      }
      setTimeout(a, 1000)
    })
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
