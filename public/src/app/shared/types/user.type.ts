export type userListResponseI = {
  success: true,
  message: string,
  data:userListI[]
}

export interface userListI {
  id: number
  name: string
  email: string
  role: string
  createdOn: string
  isActive: boolean
}
