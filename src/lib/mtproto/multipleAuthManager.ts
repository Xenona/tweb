import { User } from "../../layer";
import rootScope from "../rootScope";
import { ApiManager } from "./apiManager";

export class MultipleAuthManager {
  
  loginedUsers: User[] = []
  isLoggingAgain: boolean = false;

  constructor() {
    // super()
    setInterval(() => {
      console.log("XE accounts", {users: this.loginedUsers, logAgain: this.isLoggingAgain }  )
    }, 10000)
    // rootScope.managers.apiManager.logOut()
  }



  public safelyPushUser(user: User) {
    console.log("XE",user, this.loginedUsers.some(existingUser => existingUser.id === user.id))
    if (!this.loginedUsers.some(existingUser => existingUser.id === user.id)) {
      this.loginedUsers.push(user);
    } 
  }
}

const multipleAuthManager = new MultipleAuthManager();
export default multipleAuthManager;
