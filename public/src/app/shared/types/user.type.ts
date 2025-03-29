export type userListResponseI = userListI[]

export interface userListI {
  id: number
  name: string
  email: string
  role: string
  createdOn: string
  isActive: boolean
}
