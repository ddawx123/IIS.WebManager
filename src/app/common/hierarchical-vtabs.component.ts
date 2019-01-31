import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Type, OnDestroy } from "@angular/core";
import { Item } from "./vtabs.component";
import { OptionsService } from "main/options.service";
import { ModuleUtil } from "utils/module";

const sidebarStyles = `
:host >>> .sidebar > vtabs .vtabs > .items {
    top: 0px;
}

:host >>> .sidebar > vtabs .vtabs > .content {
    top: 96px;
}

.not-installed {
    text-align: center;
    margin-top: 50px;
}
`

@Component({
    selector: 'hierarchical-vtabs',
    template: `
    <div class="sidebar crumb" [class.nav]="_options.active">
        <vtabs [markLocation]="markLocation" (activate)="_options.refresh()">
            <item *ngIf="generalTabType" [name]="'General'" [ico]="'fa fa-wrench'">
                <template #generalTabContainer></template>
            </item>
            <item *ngFor="let module of modules" [name]="module.name" [ico]="module.ico">
                <dynamic [name]="module.component_name" [module]="module" [data]="module.data"></dynamic>
            </item>
        </vtabs>
    </div>
    `,
    styles: [
        sidebarStyles
    ],
})
export class HierarchicalVTabsComponent implements OnInit, OnDestroy {
    @Input() markLocation: boolean
    @Input() resourceName: string
    @Input() getResource: Promise<any>
    @Input() sideLoadCallback: (modules: Array<any>) => {}
    @Input() generalTabType: Type<any>
    @Output() activate: EventEmitter<Item> = new EventEmitter()
    @ViewChild("generalTabContainer", { read: ViewContainerRef }) container
    @ViewChildren('item') tabList: QueryList<ElementRef>

    modules: Array<any> = []
    generalPage: any

    constructor(
        private resolver: ComponentFactoryResolver,
        private _options: OptionsService,
    ) {}
    
    ngOnInit(): void {
        this.getResource.then(resource => {
            ModuleUtil.initModules(this.modules, resource, this.resourceName)
            this.container.clear()
            const factory = this.resolver.resolveComponentFactory(this.generalTabType)
            this.generalPage = this.container.createComponent(factory)
            this.generalPage.model = resource
            if (this.sideLoadCallback) {
                console.log(`invoking side load callback`)
                this.sideLoadCallback(this.modules)
            }
        })
    }

    ngOnDestroy(): void {
        if (this.generalPage) {
            this.generalPage.destroy()
        }
    }
}
