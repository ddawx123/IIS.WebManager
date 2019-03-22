import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { WebServerComponent } from './webserver.component'
import { AppPoolsModule } from './app-pools/app-pools.module'
import { WebSitesModule } from './websites/websites.module'
import { WebAppsModule } from './webapps/webapps.module'
import { VdirsModule } from './vdirs/vdirs.module'

const appRoutes: Routes = [
    { path: 'app-pools', loadChildren: () => AppPoolsModule },
    { path: 'websites', loadChildren: () => WebSitesModule },
    { path: 'webapps', loadChildren: () => WebAppsModule },
    { path: 'vdirs', loadChildren: () => VdirsModule },
    { path: '', component: WebServerComponent },
    { path: ':section', component: WebServerComponent }
]

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ]
})
export class WebServerRoutingModule {}
