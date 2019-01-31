import {Component, Inject} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {DiffUtil} from '../../utils/diff';
import {WebApp} from './webapp';
import {WebAppsService} from './webapps.service';
import { BreadcrumbService } from 'header/breadcrumbs.service';
import { OptionsService } from 'main/options.service';

@Component({
    template: `
        <not-found *ngIf="notFound"></not-found>
        <loading *ngIf="!(app || notFound)"></loading>
        <div *ngIf="app">
            <webapp-header [model]="app" class="crumb-content" [class.sidebar-nav-content]="_options.active"></webapp-header>
            <hierarchical-vtabs [markLocation]="true" [resourceName]="'webapp'" [getResource]="getResource"></hierarchical-vtabs>
        </div>
    `,
    styles: [`
        :host >>> .sidebar > vtabs .vtabs > .items {
            top: 35px;
        }
        :host >>> .sidebar > vtabs .vtabs > .content {
            top: 96px;
        }
    `]
})
export class WebAppComponent {
    id: string;
    app: WebApp;
    notFound: boolean;
    private _original: any;

    getResource = this._service.get(this.id).then(app => {
        this.setApp(app)
        return app
    }).catch(s => {
        if (s && s.status == '404') {
            this.notFound = true;
        }
    })


    constructor(
        @Inject('Breadcrumb') public breadcrumb: BreadcrumbService,
        @Inject("WebAppsService") private _service: WebAppsService,
        private _route: ActivatedRoute,
        private _options: OptionsService,
        private _router: Router,
    ) {
        this.id = this._route.snapshot.params["id"];
    }

    onModelChanged() {
        if (!this.app) {
            return;
        }

        //
        // Track model changes
        var changes = DiffUtil.diff(this._original, this.app);

        if (Object.keys(changes).length > 0) {
            var id = this.app.id;

            this._service.update(this.app, changes).then(app => {
                if (id != app.id) {
                    //
                    // Refresh if the Id has changed
                    this._router.navigate(['/WebServer/WebApps/WebApp', { id: app.id }]);
                }
                else {
                    this.setApp(app);
                }
            });
        }
    }

    private setApp(app: WebApp) {
        this.app = app;
        this._original = JSON.parse(JSON.stringify(app));
    }
}
