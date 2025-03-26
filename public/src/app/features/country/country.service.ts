import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  apiurl:string="";
  constructor(private _httpclient:HttpClient) {
    this.apiurl=environment.apiUrl
   }
   
  getAllCountry():Observable<any>
  {
    return this._httpclient.get<any>(this.apiurl+"api/Product/GetCountry")
  }
  getAllCountryTaxes(id:number):Observable<any>
  {
    return this._httpclient.get<any>(this.apiurl+"api/Product/GetTaxByCountry?countryId="+id)
  }

  AddCountryTaxes(data:any):Observable<any>
  {
    return this._httpclient.post<any>(this.apiurl+"api/Product/AddTax",data)
  }
  UpdateCountryTaxes(data:any):Observable<any>
  {
    return this._httpclient.patch<any>(this.apiurl+"api/Product/UpdateTax",data)
  }
  GetTaxesBytaxId(Id:any):Observable<any>
  {
    return this._httpclient.get<any>(this.apiurl+"api/Product/GetTaxByTaxId?taxId="+Id)
  }
}
