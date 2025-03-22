export type getMenuMasterI = {
  message:string
success:boolean
data:getMenuMasterListI[]
}

export interface getMenuMasterListI {
  id: number
  name: string
  navigateUrl: string
  iconClass: string
  sequence: number
  displayArea: number
}
