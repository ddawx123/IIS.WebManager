import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/src/providers/angulartics2-ga';

import { Module as BModel } from '../common/bmodel';
import { Module as NotFound } from '../common/notfound.component';
import { Module as CheckBox } from '../common/checkbox.component';
import { Module as Dynamic } from '../common/dynamic.component';
import { Module as VTabs } from '../common/vtabs.component';
import { Module as AutoFocus } from '../common/focus';
import { Module as Tooltip } from '../common/tooltip.component';
import { Module as Enum } from '../common/enum.component';
import { Module as Selector } from '../common/selector';

import { HttpClient } from '../common/httpclient';
import { NotificationService } from '../notification/notification.service';
import { LoadingService } from '../notification/loading.service';
import { VersionService } from '../versioning/version.service';
import { ServerAnalyticService } from '../webserver/server-analytic.service';
import { ConnectService } from '../connect/connect.service';
import { LoggerFactory } from '../diagnostics/logger';
import { OptionsService } from './options.service';

import { AppComponent } from './app.component';

import { HomeComponent } from './home.component';
import { ConnectComponent } from '../connect/connect.component';
import { ConnectionPickerComponent } from '../connect/connection-picker.component';
import { GetComponent } from './get.component';
import { HeaderComponent } from '../header/header.component';
import { BreadcrumbsComponent } from '../header/breadcrumbs.component';
import { SettingsMenuComponent } from '../settings/settings-menu.component';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationIndicator } from '../notification/notification-indicator';
import { InformationComponent } from '../notification/information.component';
import { ModalComponent } from '../notification/modal.component';
import { NewVersionNotificationComponent } from '../versioning/new-version-notification.component';

import { FilesService } from '../files/files.service';
import { WebServerService } from '../webserver/webserver.service';
import { AppPoolsService } from '../webserver/app-pools/app-pools.service';
import { WebSitesService } from '../webserver/websites/websites.service';
import { WindowService } from './window.service';
import { FilesModule } from '../files/files.module';
import { MonitoringModule } from '../webserver/monitoring/monitoring.module';
import { WebSitesModule } from '../webserver/websites/websites.module';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AppRoutingModule } from './app-routing.module';
import { StandardRuntime } from '../runtime/runtime';
import { BreadcrumbService } from 'header/breadcrumbs.service';

var moduleImports: any[] =  [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    Angulartics2Module.forRoot(),
    BModel,
    NotFound,
    CheckBox,
    Dynamic,
    VTabs,
    AutoFocus,
    Tooltip,
    Enum,
    Selector,
    WebSitesModule,
    FilesModule,
    MonitoringModule,
    AngularFontAwesomeModule
]

@NgModule({
    imports: moduleImports,
    declarations: [
        AppComponent,
        HomeComponent,
        ConnectComponent,
        ConnectionPickerComponent,
        GetComponent,
        HeaderComponent,
        BreadcrumbsComponent,
        SettingsMenuComponent,
        NotificationComponent,
        NotificationIndicator,
        ModalComponent,
        InformationComponent,
        NewVersionNotificationComponent,
    ],
    providers: [
        HttpClient,
        NotificationService,
        LoadingService,
        WindowService,
        VersionService,
        ServerAnalyticService,
        ConnectService,
        LoggerFactory,
        OptionsService,
        Angulartics2GoogleAnalytics,
        { provide: "Breadcrumb", useClass: BreadcrumbService },
        { provide: "WebServerService", useClass: WebServerService },
        { provide: "WebSitesService", useClass: WebSitesService },
        { provide: "AppPoolsService", useClass: AppPoolsService },
        { provide: "FilesService", useClass: FilesService },
        { provide: "Runtime", useClass: StandardRuntime }
    ]
})
export class BootstrapModule{}