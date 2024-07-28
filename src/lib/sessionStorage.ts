/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import type {AppInstance} from './mtproto/singleInstance';
import type {UserAuth} from './mtproto/mtproto_config';
import type {DcId} from '../types';
import {MOUNT_CLASS_TO} from '../config/debug';
import LocalStorageController from './localStorage';
import { User } from '../layer';

export type AllUsers = {
  [key: number]: {
    user_auth: UserAuth,
    state_id: number,
    dc1_auth_key: string,
    dc2_auth_key: string,
    dc3_auth_key: string,
    dc4_auth_key: string,
    dc5_auth_key: string,
    dc1_server_salt: string,
    dc2_server_salt: string,
    dc3_server_salt: string,
    dc4_server_salt: string,
    dc5_server_salt: string,
    auth_key_fingerprint: string,
    user_info?: User,
  }
}

const UserSpecificKeys = [ 'user_auth' ,
                                'state_id' ,
                                'dc1_auth_key' ,
                                'dc2_auth_key' ,
                                'dc3_auth_key' ,
                                'dc4_auth_key' ,
                                'dc5_auth_key' ,
                                'dc1_server_salt' ,
                                'dc2_server_salt' ,
                                'dc3_server_salt' ,
                                'dc4_server_salt' ,
                                'dc5_server_salt' ,
                                'auth_key_fingerprint']

type StorageType = {
  dc: DcId,
  user_auth: UserAuth,
  state_id: number,
  dc1_auth_key: string,
  dc2_auth_key: string,
  dc3_auth_key: string,
  dc4_auth_key: string,
  dc5_auth_key: string,
  dc1_server_salt: string,
  dc2_server_salt: string,
  dc3_server_salt: string,
  dc4_server_salt: string,
  dc5_server_salt: string,
  auth_key_fingerprint: string,
  server_time_offset: number,
  all_users: AllUsers,
  next_user: string,
  xt_instance: AppInstance,
  kz_version: 'K' | 'Z',
  tgme_sync: {
    canRedirect: boolean,
    ts: number
  },
  k_build: number
}
                                
export class SessionStorage extends LocalStorageController<StorageType> {

  users: AllUsers = {}
  cache: {partObj: any, onlyLocal: boolean}[];
  
  constructor() {
    super();
    // this.get('all_users').then(users => {

    //   if (users) {
    //     this.users = (users);
    //   }
    // });
  }

  public async deleteUser(id: number) {
    const prevUsers = await sessionStorage.get('all_users');
    delete prevUsers[parseInt(id.toString())];
    await this.set({
      'all_users': prevUsers
    })
  }

  public async copyUserFromStorage() {
    // @ts-ignore
    const userUpdate: AllUsers[number] = {};

    userUpdate.user_auth = await this.get('user_auth');
    userUpdate.state_id = await this.get('state_id');
    userUpdate.dc1_auth_key = await this.get('dc1_auth_key');
    userUpdate.dc2_auth_key = await this.get('dc2_auth_key');
    userUpdate.dc3_auth_key = await this.get('dc3_auth_key');
    userUpdate.dc4_auth_key = await this.get('dc4_auth_key');
    userUpdate.dc5_auth_key = await this.get('dc5_auth_key');
    userUpdate.dc1_server_salt = await this.get('dc1_server_salt');
    userUpdate.dc2_server_salt = await this.get('dc2_server_salt');
    userUpdate.dc3_server_salt = await this.get('dc3_server_salt');
    userUpdate.dc4_server_salt = await this.get('dc4_server_salt');
    userUpdate.dc5_server_salt = await this.get('dc5_server_salt');
    userUpdate.auth_key_fingerprint = await this.get('auth_key_fingerprint');

    let currUsers = await this.get('all_users');

    if (!currUsers) {
      currUsers = {};
    }
    currUsers[userUpdate.user_auth.id] = Object.assign(
      currUsers[userUpdate.user_auth.id] ?? {},
      userUpdate,
    );

    await super.set({all_users: currUsers});
  }

  public async getAccountUsers() {
    // return [] as User[];
    const users = await this.get('all_users');
    return Object.values(users)
      .map(e=> {
        const d = e.user_info ?? { _: "userEmpty", id: 0 };
        d.id = e.user_auth.id;
        return d
    })
  }

  public async updateSelfInfo(user: User) {
    const users = await this.get('all_users');
    if(user.id in users) {
      users[user.id as number].user_info = user;
    } else {
      console.warn("No user locally found")
    }
    await this.set({ all_users: users })
  }

  public async swapUsers(newId: number) {
    
    await this.delete('user_auth');
      
    await this.delete('dc1_auth_key')
    await this.delete('dc2_auth_key')
    await this.delete('dc3_auth_key')
    await this.delete('dc4_auth_key')
    await this.delete('dc5_auth_key')
    await this.delete('dc1_server_salt');
    await this.delete('dc2_server_salt');
    await this.delete('dc3_server_salt');
    await this.delete('dc4_server_salt');
    await this.delete('dc5_server_salt');
    await this.delete('auth_key_fingerprint')
    await this.delete('state_id')
    
    const user: AllUsers[number] = (await this.get('all_users'))[newId];
    console.log("XE USER SWAP", user)
    
    await this.set(user);
  }

  public async get<T extends keyof StorageType>(key: T, useCache?: boolean) {
  
    const res = await super.get(key, useCache);
    // console.log("XE GET KEY", key, res)

    return res
  }

  public async set(obj: Partial<StorageType>, onlyLocal?: boolean) {
    await super.set(obj, onlyLocal);
    
    let userAuth = obj['user_auth'];

    if (userAuth) {
      await this.copyUserFromStorage() 
    }

    return Promise.resolve();
  }

}

const sessionStorage = new SessionStorage();



MOUNT_CLASS_TO.appStorage = sessionStorage;
export default sessionStorage;
