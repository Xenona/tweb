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
}}

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
    const newUser: AllUsers[number] = {};

    newUser.user_auth = await this.get('user_auth');
    newUser.state_id = await this.get('state_id');
    newUser.dc1_auth_key = await this.get('dc1_auth_key');
    newUser.dc2_auth_key = await this.get('dc2_auth_key');
    newUser.dc3_auth_key = await this.get('dc3_auth_key');
    newUser.dc4_auth_key = await this.get('dc4_auth_key');
    newUser.dc5_auth_key = await this.get('dc5_auth_key');
    newUser.dc1_server_salt = await this.get('dc1_server_salt');
    newUser.dc2_server_salt = await this.get('dc2_server_salt');
    newUser.dc3_server_salt = await this.get('dc3_server_salt');
    newUser.dc4_server_salt = await this.get('dc4_server_salt');
    newUser.dc5_server_salt = await this.get('dc5_server_salt');
    newUser.auth_key_fingerprint = await this.get('auth_key_fingerprint');

    let currUsers = await this.get('all_users');

    if (!currUsers) {
      currUsers = {};
    }
    currUsers[newUser.user_auth.id] = newUser;

    super.set({all_users: currUsers});

  }

  public async swapUsers(newId: number) {
    
    if (newId === 0) {
      this.delete('user_auth');
      
      this.delete('dc1_auth_key')
      this.delete('dc2_auth_key')
      this.delete('dc3_auth_key')
      this.delete('dc4_auth_key')
      this.delete('dc5_auth_key')
      this.delete('auth_key_fingerprint')
      this.delete('state_id')
    }
    const user: AllUsers[number] = (await this.get('all_users'))[newId];
    console.log("XE USER SWAP", user)
    
    this.set(user);

  }

  public async get<T extends keyof StorageType>(key: T, useCache?: boolean) {
  
    const res = await super.get(key, useCache);
    // console.log("XE GET KEY", key, res)

    return res
  }

  public async set(obj: Partial<StorageType>, onlyLocal?: boolean) {
   
    super.set(obj, onlyLocal);
    
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
