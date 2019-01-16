import * as deepEqual from "deep-equal";
import { Injectable } from "@angular/core";
import { Breadcrumb, BreadcrumbRoot } from "./breadcrumb";

@Injectable()
export class BreadcrumbService {
    Crumbs: Breadcrumb[] = [ BreadcrumbRoot ]

    goto(last: Breadcrumb) {
        let found = this.Crumbs.findIndex(c => last.similar(c))
        if (found >= 0) {
            this.Crumbs.length = found
        }
        this.Crumbs.push(last)
    }
}
