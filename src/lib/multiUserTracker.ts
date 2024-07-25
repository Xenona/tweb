import deferredPromise, { CancellablePromise } from "../helpers/cancellablePromise";


export class MultiUserTracker {

  deferredUsers: CancellablePromise<string>;

  constructor() {
    this.deferredUsers = deferredPromise<string>();

    
  }

  public async getUsers(): Promise<string> {
    return this.deferredUsers; 
  }

  public resolveUser(user: string) {
    console.error("XE AAAAAA TIS SHOULD BE CALLED INCEONCEONCE");
     
    return this.deferredUsers.resolve(user)
  }

}

const multiUserTracker = new MultiUserTracker()
export default multiUserTracker;
