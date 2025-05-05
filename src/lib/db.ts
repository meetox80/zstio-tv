import Database from 'better-sqlite3'
import type { _Users } from '../types/db'

const _Db = new Database('users.db')

_Db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`)

const _GetUserByUsername = _Db.prepare('SELECT * FROM users WHERE username = ?')
const _CreateUser = _Db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')

export function GetUserByUsername(username: string): _Users | null {
  return _GetUserByUsername.get(username) as _Users | null
}

export function CreateUser(username: string, password: string): void {
  _CreateUser.run(username, password)
}

export default _Db 