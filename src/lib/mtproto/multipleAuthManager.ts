import {User} from '../../layer';
import rootScope from '../rootScope';
import {ApiManager} from './apiManager';

export class MultipleAuthManager {
  loginedUsers: User[] = []
  isLoggingAgain: boolean = false;

  constructor() {

  }


  public safelyPushUser(user: User) {
    if(!this.loginedUsers.some(existingUser => existingUser.id === user.id)) {
      this.loginedUsers.push(user);
    }
  }
}
