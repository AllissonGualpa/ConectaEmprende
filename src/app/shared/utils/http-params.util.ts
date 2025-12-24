import { HttpParams } from "@angular/common/http";

export class HttpParamsUtil {

    static cleanParams(params: any): HttpParams {

        let httpParams = new HttpParams();

        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined) {
            httpParams = httpParams.set(key, value);
            }
        });

        return httpParams;
    }

}
