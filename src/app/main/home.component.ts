import { Component } from '@angular/core';
import { OptionsService } from './options.service';
import {
    ComponentReference,
    WebSiteListComponentName,
    FilesComponentName,
    MonitoringComponentName
 } from '../main/settings'

@Component({
    styles: [`
        .sidebar .home::before {content: "\\f015";}

        :host >>> .sidebar > vtabs .items:before {
            content: "";
        }

        :host >>> .sidebar > vtabs .items {
            top: 35px;
        }

        :host >>> .sidebar > vtabs .content {
            margin-top: 10px;
        }
    `],
    template: `
        <div>
            <div class="sidebar" [class.nav]="options.active">
                <vtabs [markLocation]="true" (activate)="options.refresh()">
                    <vtabs-item [name]="'Web Sites'" [ico]="'fa fa-globe'">
                        <dynamic [name]="'WebSiteListComponent'" [module]="WebSiteListComponentReference"></dynamic>
                    </vtabs-item>
                    <vtabs-item [name]="'Web Server'" [ico]="'fa fa-server'" [routerLink]="['/webserver']"></vtabs-item>
                    <vtabs-item [name]="'Files'" [ico]="'fa fa-files-o'">
                        <dynamic [name]="'FilesComponent'" [module]="FilesComponentReference"></dynamic>
                    </vtabs-item>
                    <vtabs-item [name]="'Monitoring'" [ico]="'fa fa-medkit'">
                        <dynamic [name]="'MonitoringComponent'" [module]="MonitoringComponentReference"></dynamic>
                    </vtabs-item>
                </vtabs>
            </div>
        </div>
    `
})
export class HomeComponent {
    WebSiteListComponentReference = new ComponentReference("WebSiteListComponent", null, WebSiteListComponentName, null, null)
    FilesComponentReference = new ComponentReference("FilesComponent", null, FilesComponentName, null, null)
    MonitoringComponentReference = new ComponentReference("MonitoringComponent", null, MonitoringComponentName, null, null)
    constructor(private _options: OptionsService) {
    }

    get options() {
        return this._options;
    }
}
