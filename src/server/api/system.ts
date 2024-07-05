import request from '../request'

export function dbs() {
  return request({
    url: '/dbs',
    method: 'GET',
  })
}
