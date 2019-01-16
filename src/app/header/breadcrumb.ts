import * as deepEqual from "deep-equal";
import { environment } from "environments/environment";

export class Breadcrumb {
    constructor(
        public label: string,
        public routerLink: string[],
    ) {}

    public similar(crumb: Breadcrumb): boolean {
        return deepEqual(this, crumb)
    }
}

export const BreadcrumbRoot: Breadcrumb = environment.WAC ? new Breadcrumb('IIS Web Server', ['/webserver']) : new Breadcrumb('Home', ['/'])
