import { User } from "../../layer";
import rootScope from "../rootScope";
import { ApiManager } from "./apiManager";

export class MultipleAuthManager {
  
  loginedUsers: User[] = []
  isLoggingAgain: boolean = false;

  constructor() {
    
  }



  public safelyPushUser(user: User) {
    console.log("XE",user, this.loginedUsers.some(existingUser => existingUser.id === user.id))
    if (!this.loginedUsers.some(existingUser => existingUser.id === user.id)) {
      this.loginedUsers.push(user);
    } 
  }
}
