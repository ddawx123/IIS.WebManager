import { Component, Inject, ViewContainerRef, OnInit, AfterContentInit, ViewChild, ViewChildren } from '@angular/core';
import { ModuleUtil } from '../utils/module';
import { OptionsService } from '../main/options.service';
import { HttpClient } from '../common/httpclient';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { CertificatesModuleName, ApplicationPoolsModuleName, WebSitesModuleName, AppPoolModuleReference, WebsitesModuleReference, FilesComponentReference, ComponentReference } from '../main/settings';
import { environment } from '../environments/environment'
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { BreadcrumbService } from 'header/breadcrumbs.service';
import { Breadcrumb, BreadcrumbRoot } from 'header/breadcrumb';
import { VTabsComponent } from 'common/vtabs.component';

const sidebarStyles = `
:host >>> .sidebar > vtabs .vtabs > .items {
    top: ` + (environment.WAC ? 0 : 35) + `px;
}

:host >>> .sidebar > vtabs .vtabs > .content {
    top: 96px;
}

.not-installed {
    text-align: center;
    margin-top: 50px;
}
`

const WebServerBreadcrumb = new Breadcrumb('WebServer', ['/webserver'])

@Component({
    template: `
        <div *ngIf="service.installStatus == 'stopped'" class="not-installed">
            <p>
                Web Server (IIS) is not installed on the machine
                <br/>
                <a href="https://docs.microsoft.com/en-us/iis/install/installing-iis-85/installing-iis-85-on-windows-server-2012-r2" >Learn more</a>
            </p>
        </div>
        <loading *ngIf="!webServer && !failure"></loading>
        <span *ngIf="failure" class="color-error">{{failure}}</span>
        <div *ngIf="webServer">
            <webserver-header [model]="webServer" class="crumb-content" [class.sidebar-nav-content]="_options.active"></webserver-header>
            <div class="sidebar crumb" [class.nav]="_options.active">
                <vtabs *ngIf="webServer" [markLocation]="true" (activate)="_options.refresh()" [defaultTab]="'Web Sites'">
                    <item [name]="'Web Server'" [ico]="'fa fa-wrench'">
                    <context-tab [reference]="webSiteRef"></context-tab>
                    <context-tab [reference]="appPoolRef"></context-tab>
                    <context-tab [reference]="filesRef"></context-tab>
                    <vtabs-item [name]="'General'" [ico]="'fa fa-wrench'">
                        <webserver-general [model]="webServer"></webserver-general>
                    </vtabs-item>
                    <vtabs-item *ngFor="let module of modules" [name]="module.name" [ico]="module.ico">
                        <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
                    </vtabs-item>
                </vtabs>
            </div>
        </div>
    `,
    styles: [ sidebarStyles ]
})
export class WebServerComponent implements OnInit, AfterContentInit {
    webServer: WebServer;
    modules: Array<any> = [];
    failure: string;

    appPoolRef: ComponentReference = AppPoolModuleReference;
    webSiteRef: ComponentReference = WebsitesModuleReference;
    filesRef: ComponentReference = FilesComponentReference;

    @ViewChild(VTabsComponent) vtab: VTabsComponent

    constructor(
        @Inject('Breadcrumb') public breadcrumb: BreadcrumbService,
        @Inject('WebServerService') private _service: WebServerService,
        @Inject('Runtime') private _runtime: Runtime,
        private _http: HttpClient,
        private _options: OptionsService,
        private _notifications: NotificationService,
    ) {}

    ngOnInit() {
        this.server.then(ws => {
            this.webServer = ws;
            ModuleUtil.initModules(this.modules, this.webServer, "webserver");
            ModuleUtil.addModule(this.modules, CertificatesModuleName);
            // HACK: since application pools and web sites are global modules, we don't need them here
            this.modules.splice(this.modules.findIndex(m => m.name == ApplicationPoolsModuleName), 1);
            this.modules.splice(this.modules.findIndex(m => m.name == WebSitesModuleName), 1);
            this._http.head(CertificatesServiceURL, null, false)
                .catch(_ => {
                    this.modules = this.modules.filter(m => m.name != CertificatesModuleName)
                });
            this.breadcrumb.goto(environment.WAC? BreadcrumbRoot : WebServerBreadcrumb)
        })
    }

    ngAfterContentInit() {
        // TODO: select web sites after view init
    }

    get service() {
        return this._service;
    }

    get server(): Promise<WebServer> {
        return new Promise<WebServer>((resolve, reject) => {
            this._service.server.catch(e => {
                if (e instanceof UnexpectedServerStatusError) {
                    this._notifications.confirm(
                        `Start Microsoft IIS Administration API`,
                        `Microsoft IIS Administration API is currently ${e.Status}. Do you want to start the service?`).then(confirmed => {
                        if (confirmed) {
                            var sub = this._runtime.StartIISAdministration().subscribe(
                                _ => {
                                    this._service.server.catch(ex => {
                                        reject(this.failure = `Unable to start Microsoft IIS Administration API Service, error ${ex}`)
                                        throw ex
                                    }).then(s => {
                                        resolve(s)
                                    })
                                },
                                _ => {
                                    reject(this.failure = `Unable to start Microsoft IIS Administration API Service, error: ${e}`)
                                },
                                () => { sub.unsubscribe() },
                            )
                        } else {
                            reject(this.failure = `Web Server Module cannot be initialized. Current Microsoft IIS Administration API Service status: ${e.Status}`)
                        }
                    })
                } else {
                    reject(this.failure = `Unknown error has occurred when trying to initialize Web Server Module: ${e}`)
                }
                throw e
            }).then(ws => {
                resolve(ws)
            })
        })
    }
}
