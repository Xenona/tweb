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
  all_users: string,
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

  currentUserId: number;
  users: AllUsers = {}
  cache: {partObj: any, onlyLocal: boolean}[];
  
  constructor() {
    super();

    this.get('user_auth').then((userAuth) => {

      if (userAuth) {
        this.currentUserId = userAuth.id;
        
        this.copyUserFromStorage(); 
      }
        
    })
  }

  public async copyUserFromStorage() {
    // @ts-ignore
    this.users[this.currentUserId] = {};

    (this.users[this.currentUserId] as AllUsers[number]).user_auth = await this.get('user_auth');
    (this.users[this.currentUserId] as AllUsers[number]).state_id = await this.get('state_id');
    (this.users[this.currentUserId] as AllUsers[number]).dc1_auth_key = await this.get('dc1_auth_key');
    (this.users[this.currentUserId] as AllUsers[number]).dc2_auth_key = await this.get('dc2_auth_key');
    (this.users[this.currentUserId] as AllUsers[number]).dc3_auth_key = await this.get('dc3_auth_key');
    (this.users[this.currentUserId] as AllUsers[number]).dc4_auth_key = await this.get('dc4_auth_key');
    (this.users[this.currentUserId] as AllUsers[number]).dc5_auth_key = await this.get('dc5_auth_key');
    (this.users[this.currentUserId] as AllUsers[number]).dc1_server_salt = await this.get('dc1_server_salt');
    (this.users[this.currentUserId] as AllUsers[number]).dc2_server_salt = await this.get('dc2_server_salt');
    (this.users[this.currentUserId] as AllUsers[number]).dc3_server_salt = await this.get('dc3_server_salt');
    (this.users[this.currentUserId] as AllUsers[number]).dc4_server_salt = await this.get('dc4_server_salt');
    (this.users[this.currentUserId] as AllUsers[number]).dc5_server_salt = await this.get('dc5_server_salt');
    (this.users[this.currentUserId] as AllUsers[number]).auth_key_fingerprint = await this.get('auth_key_fingerprint');

    super.set({all_users: JSON.stringify(this.users)});

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
    const user: AllUsers[number] = JSON.parse(await this.get('all_users'))[newId];

    
    this.set(user);

    this.currentUserId = user.user_auth.id;

  }

  public async get<T extends keyof StorageType>(key: T, useCache?: boolean) {
  
    const res = await super.get(key, useCache);
    console.log("XE GET KEY", key, res)

    return res
  }

  public async set(obj: Partial<StorageType>, onlyLocal?: boolean) {
   
    super.set(obj, onlyLocal);
    
    let userAuth = obj['user_auth'];

    if (userAuth) {
      this.currentUserId = userAuth.id;
      await this.copyUserFromStorage() 
    }

    console.log("XE STORAGE SET USERS   ", this.users, obj  )
    return Promise.resolve();
  }
}

const sessionStorage = new SessionStorage();



MOUNT_CLASS_TO.appStorage = sessionStorage;
export default sessionStorage;
