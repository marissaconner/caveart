import { QueryResult } from 'pg'
import translator from '../languages/translate'
const t = translator.translate
import PoolConnection from './connection'

export const auth = {
  createNewUser: async function (email: string, passwordHash: string) {
    const pool = await PoolConnection.get().connect()
    const sql = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id
    `
    const values = [email, passwordHash]
    const result = await pool
      .query(sql, values)
        .then((data: QueryResult<any>) => {
          return data.rows[0]
        })
        .catch((err: Error) => {
          return { error: t('createNewUserError') }
        })
    pool.release()
    return result
  },
  getUserByCredentials: async function (email: string, passwordHash: string) {
    const pool = await PoolConnection.get().connect()
    const sql = 'SELECT id FROM users WHERE email=$1 AND password=$2'
    const values = [email, passwordHash]
    const result = await pool
      .query(sql, values)
        .then((data: QueryResult<any>) => {
          if (data.rows.length === 1) {
            return data.rows[0]
          }
          return { error: t('noSuchUser') }
        })
        .catch((err: Error) => {
          return { error: t('noSuchUser') }
        })
    pool.release()
    return result
  },
  updateUserSession: async function (userId: number, sessionHash: string) {
    const pool = await PoolConnection.get().connect()
    const sql = `
      UPDATE users
      SET
      session_hash=$1
      WHERE
      id =$2
    `
    const values = [sessionHash, userId]
    const result = await pool
      .query(sql, values)
        .then(() => {
          return { hash: sessionHash }
        })
        .catch((err: Error) => {
          return { error: t('errorUpdatingSession') }
        })
    pool.release()
    return result
  },
  confirmUserSession: async function (sessionHash: string, id: number) {
    const pool = await PoolConnection.get().connect()
    const sql = `
      SELECT id
      FROM users
      WHERE
      session_hash=$1
      AND
      id=$2
    `
    const values = [sessionHash, id]
    const result = await pool
      .query(sql, values)
        .then((data: QueryResult<any>) => {
          if (data.rows.length === 1) {
            return data.rows[0]
          }
          return { error: t('noSuchUser') }
        })
        .catch((err: Error) => {
          return { error: t('invalidSession') }
        })
      pool.release()
      return result
  },
  clearUserSession: async function (sessionHash: string, id: number) {
    const pool = await PoolConnection.get().connect()
    const sql = `UPDATE users SET session_hash = null WHERE id = $2 AND session_hash = $1`
    const values = [sessionHash, id]
    const result = await pool
      .query(sql, values)
        .then(() => {
          return { error: false }
        })
        .catch((err: Error) => {
          return { error: t('errorOnLogOut') }
        })
      pool.release()
      return result
  },

  isAuthor: async function (comic: number | string, author: number) {
    const pool = await PoolConnection.get().connect()
    const sql = `SELECT 1 FROM comics WHERE (id = $1 OR subdomain = '$1') AND author = $2`
    const result = await pool
      .query(sql, [comic, author])
      .then((data: QueryResult<any>) => {
        return !!data.rows[0]
      })
      .catch((err: Error) => {
        return { error: err.message }
      })
    pool.release()
    return result
  },
}

export default auth