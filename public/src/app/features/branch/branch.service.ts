import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  apiurl:string=""
  constructor( private _httpclient:HttpClient) {
    this.apiurl=environment.apiUrl
   }


   GetAllBranches():Observable<any>
     {
       return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetAllBranches")
     }
     getAllCompany():Observable<any>
     {
       return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetAll")
     }
  
     getCompanyBranchId(id:any):Observable<any>
     {
       return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetBranchById/"+id)
     }
  
     addCompanyBranch(data:any):Observable<any>
     {
       return this._httpclient.post<any>(this.apiurl+"api/CompanyProfile/AddBranch",data)
     }
     updateCompanyBranch(data:any):Observable<any>
     {
       return this._httpclient.put<any>(this.apiurl+"api/CompanyProfile/UpdateBranch/"+data.id,data)
     }
  
}
