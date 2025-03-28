
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BussinessService {

  apiurl:string=""
  constructor(private http:HttpClient) { 
    this.apiurl=environment.apiUrl
  }

  getService():Observable<any>
  {
   return  this.http.get<any>(this.apiurl+"api/Product/GetServiceList")
  }
  getServicebybussinessId(id:any):Observable<any>
  {
   return  this.http.get<any>(this.apiurl+"api/Product/GetAllServiceTermsCOnditions?serviceId="+id)
  }
  getAllCountry():Observable<any>
  {
    return this.http.get<any>(this.apiurl+"api/Product/GetCountry")
  }
  AddCountryTermandCondition(data:any):Observable<any>{
    return this.http.post<any>(this.apiurl+"api/Product/AddCountryTermsCondition",data)
  }
  UpdateCountryTermsCondition(data:any):Observable<any>{
    return this.http.put<any>(this.apiurl+"api/Product/UpdateCountryTermsCondition?id="+data.id,data)
  }

  GetCountryTermsConditionById(data:any):Observable<any>{
    return this.http.get<any>(this.apiurl+"api/Product/GetCountryTermsConditionById?conditionId="+data)
  }
  
}
