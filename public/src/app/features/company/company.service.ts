import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

 apiurl:string="";
   constructor(private _httpclient:HttpClient) {
     this.apiurl=environment.apiUrl
    }
    
   getAllCompany():Observable<any>
   {
     return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetAll")
   }
   getCompanyProfileById(id:any):Observable<any>
   {
     return this._httpclient.get<any>(this.apiurl+"api/CompanyProfile/GetById/"+id)
   }

   addCompanyProfile(data:any):Observable<any>
   {
     return this._httpclient.post<any>(this.apiurl+"api/CompanyProfile/Add",data)
   }
   updateCompanyProfile(data:any):Observable<any>
   {
     return this._httpclient.put<any>(this.apiurl+"api/CompanyProfile/Update/"+data.id,data)
   }
   
}
