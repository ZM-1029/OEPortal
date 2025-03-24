export interface rolePermissionResponseI {
    success: boolean
    message: string
    data: rolePermissionListI[]
  }
  
  export interface rolePermissionListI {
    id: number
    formId: number
    form: string
    view: boolean
    add: boolean
    edit: boolean
  }
  