import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanybanklistService {

  apiurl:string="";
     constructor(private _httpclient:HttpClient) {
       this.apiurl=environment.apiUrl
      }
      
     GetAllBankDetail():Observable<any>
     {
       return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetAllBankDeatils")
     }
     getAllCompany():Observable<any>
     {
       return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetAll")
     }
  
     getCompanyBankId(id:any):Observable<any>
     {
       return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetBankDeatilById/"+id)
     }
  
     addCompanyBank(data:any):Observable<any>
     {
       return this._httpclient.post<any>(this.apiurl+"api/CompanyProfile/AddBankDeatils",data)
     }
     updateCompanyBank(data:any):Observable<any>
     {
       return this._httpclient.put<any>(this.apiurl+"api/CompanyProfile/UpdateBankDeatils/"+data.id,data)
     }
}
