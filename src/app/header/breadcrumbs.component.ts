import { Component, Inject } from "@angular/core";
import { BreadcrumbService } from "./breadcrumbs.service";
import { Breadcrumb } from "./breadcrumb";

@Component({
    selector: 'breadcrumbs',
    styles: [`
.global-crumbs {
    padding-top: 10px;
    padding-left: 50px;
    font-size: 16px;
    font-weight: bold;
}
`],
    template: `
    <ul class="crumbs sme-focus-zone">
        <li *ngFor="let crumb of crumbs; index as i">
            <a routerLink="{{crumb.routerLink}}" (click)="goto(crumb)">{{crumb.label}}</a><span *ngIf="i != 0"></span>
        </li>
    </ul>
    `,
})
export class BreadcrumbsComponent {
    constructor(
        @Inject('Breadcrumb') private _content: BreadcrumbService,
    ) {}

    public get crumbs(): Breadcrumb[] {
        return this._content.Crumbs
    }

    public goto(position: Breadcrumb) {
        this._content.goto(position)
    }
}
