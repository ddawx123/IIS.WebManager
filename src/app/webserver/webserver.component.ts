import { Component, Inject, Type } from '@angular/core';
import { ModuleUtil } from '../utils/module';
import { HttpClient } from '../common/httpclient';
import { WebServer } from './webserver';
import { WebServerService } from './webserver.service';
import { ComponentReference, FilesComponentName, CertificatesModuleName, ApplicationPoolsModuleName, WebSitesModuleName } from '../main/settings';
import { CertificatesServiceURL } from 'certificates/certificates.service';
import { UnexpectedServerStatusError } from 'error/api-error';
import { NotificationService } from 'notification/notification.service';
import { Runtime } from 'runtime/runtime';
import { BreadcrumbService } from 'header/breadcrumbs.service';
import { environment } from 'environments/environment';
import { Breadcrumb, BreadcrumbRoot } from 'header/breadcrumb';
import { OptionsService } from 'main/options.service';
import { WebServerGeneralComponent } from './webserver-general.component';

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
            <hierarchical-vtabs [markLocation]="true" [resourceName]="'webserver'" [getResource]="getResource" [sideLoadCallback]="sideLoadCallback" [generalTabType]="generalTabType"></hierarchical-vtabs>
        </div>
    `
})
export class WebServerComponent {
    generalTabType: Type<WebServerGeneralComponent>;
    webServer: WebServer;
    failure: string;
    getResource = this.server.then(ws => (this.webServer = ws))
    sideLoadCallback = (modules: Array<any>) => {
        ModuleUtil.addModule(modules, CertificatesModuleName);
        // HACK: changing UI without changing API
        modules.splice(modules.findIndex(m => m.name == ApplicationPoolsModuleName), 1)
        modules.splice(modules.findIndex(m => m.name == WebSitesModuleName), 1)
        // Insert files global module after application pools
        let index = modules.findIndex(m => m.name.toLocaleLowerCase() == "application pools") + 1;
        modules.splice(index, 0, new ComponentReference("Files", "fa fa-files-o", FilesComponentName, "files", "/api/files/{id}"));
        this._http.head(CertificatesServiceURL, null, false)
            .catch(_ => {
                modules.splice(modules.findIndex(m => m.name == CertificatesModuleName), 1)
            });
    }

    constructor(
        @Inject('Breadcrumb') public breadcrumb: BreadcrumbService,
        @Inject('WebServerService') private _service: WebServerService,
        @Inject('Runtime') private _runtime: Runtime,
        private _http: HttpClient,
        private _notifications: NotificationService,
        private _options: OptionsService,
    ) {
        if (environment.WAC) {
            breadcrumb.goto(BreadcrumbRoot)
        } else {
            breadcrumb.goto(WebServerBreadcrumb)
        }
    }

    get service() {
        return this._service;
    }

    get server(): Promise<WebServer> {
        return new Promise<WebServer>((resolve, reject) => {
            this._service.server.catch(e => {
                if (e instanceof UnexpectedServerStatusError) {
                    this._notifications.confirm(
                        `Start IIS Administration API`,
                        `IIS Administration API is currently ${e.Status}. Do you want to start the service?`).then(confirmed => {
                        if (confirmed) {
                            var sub = this._runtime.StartIISAdministration().subscribe(
                                _ => {
                                    this._service.server.catch(ex => {
                                        reject(this.failure = `Unable to start IIS Administration API Service, error ${ex}`)
                                        throw ex
                                    }).then(s => {
                                        resolve(s)
                                    })
                                },
                                _ => {
                                    reject(this.failure = `Unable to start IIS Administration API Service, error: ${e}`)
                                },
                                () => { sub.unsubscribe() },
                            )
                        } else {
                            reject(this.failure = `Web Server Module cannot be initialized. Current IIS Administration API Service status: ${e.Status}`)
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
