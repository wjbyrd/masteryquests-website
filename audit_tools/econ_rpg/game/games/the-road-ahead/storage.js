import {restore} from './engine.js';
export const SAVE_KEY='mq.road-ahead.save.v3';
export function load(storage) {try{const raw=storage.getItem(SAVE_KEY);return {run:raw?restore(raw):null,error:null,previous:!raw&&!!storage.getItem('mq.road-ahead.save.v2')};}catch{return {run:null,error:'Your previous save could not be read. You can start a new journey; play works in memory if storage is unavailable.'};}}
export function save(storage,s) {try{storage.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}
