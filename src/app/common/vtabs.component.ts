import { Module as Dynamic } from '../common/dynamic.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs'
import { DynamicComponent } from './dynamic.component';
import { SectionHelper } from './section.helper';
import { environment } from 'environments/environment';
import { ComponentReference } from 'main/settings';
import { LoggerFactory, Logger, LogLevel } from 'diagnostics/logger';

@Component({
    selector: 'vtabs',
    template: `
        <div class="vtabs sme-focus-zone">
            <ul class="items">
                <li class="divider">IIS</li>
                <li #item
                    class="hover-edit"
                    *ngFor="let tab of contexts"
                    [ngClass]="{active: tab.active}"
                    (keyup.space)="selectItem(tab)"
                    (keyup.enter)="selectItem(tab)"
                    (click)="selectItem(tab)">
                    <i [class]="tab.ico"></i><span class="border-active">{{tab.name}}</span>
                </li>
                <li class="divider">{{contextName}} PROPERTIES</li>
                <li #item
                    class="hover-edit"
                    *ngFor="let tab of contents"
                    [ngClass]="{active: tab.active}"
                    (keyup.space)="selectItem(tab)"
                    (keyup.enter)="selectItem(tab)"
                    (click)="selectItem(tab)">
                    <i [class]="tab.ico"></i><span class="border-active">{{tab.name}}</span>
                </li>
            </ul>
            <div class="content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .divider {
            width: 100%;
            border-bottom: 1px solid #000;
            line-height: 0.1em;
        }

        .content {
            min-width: 320px;
        }

        li:focus {
            outline-style: dashed;
            outline-color: #000;
            outline-width: 2px;
            outline-offset: -2px;
            text-decoration: underline;
        }
    `],
    host: {
        '(window:resize)': 'refresh()'
    }
})
export class VTabsComponent implements AfterViewInit, OnDestroy {
    @Input() markLocation: boolean;
    @Input() defaultTab: string;
    @Input() contextName: string
    @Output() activate: EventEmitter<Item> = new EventEmitter();

    contexts: Item[] = [];
    contents: Item[] = [];
    tabs: Item[] = [];

    private _default: string;
    private _selectedIndex = -1;
    private _tabsItems: Array<ElementRef>;
    private _sectionHelper: SectionHelper;
    private _subscriptions: Array<Subscription> = [];
    private logger: Logger;
    @ViewChildren('item') private _tabList: QueryList<ElementRef>;
    @ContentChildren(forwardRef(() => Item)) its: QueryList<Item>;

    constructor(
        private loggerFactory: LoggerFactory,
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _router: Router,
    ) {
        this.logger = loggerFactory.Create(this);
        this.tabs = [];
        this._default = this._activatedRoute.snapshot.params["section"];
    }

    public ngAfterViewInit() {
        this._sectionHelper = new SectionHelper(this.tabs.map(t => t.name), this.defaultTab ? this.defaultTab : this._default, this.markLocation, this._location, this._router);
        this._subscriptions.push(this._sectionHelper.subscribe(sec => this.onSectionChange(sec)));
        this._subscriptions.push(this.its.changes.subscribe(change => {
            let arr: Array<Item> = change.toArray();
            arr.forEach(item => {
                if (!this.tabs.find(t => t == item)) {
                    this.addTab(item);
                }
            });
        }));

        this._tabsItems = this._tabList.toArray();
        window.setTimeout(() => {
            this.refresh();
        }, 1);

        let contentIndex = 0;
        if (this._default) {
            let index = this.tabs.firstIndex(t => SectionHelper.normalize(t.name) == this._default);
            if (index < 0) {
                this.logger.log(LogLevel.ERROR, `Unable to locate index for default tab ${this._default}`);
            } else {
                contentIndex = index;
            }
        }
        this._selectedIndex = this.contexts.length + contentIndex;
        this.tabs[this._selectedIndex].activate();
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => {
            (<any>sub).unsubscribe();
        });

        if (this._sectionHelper != null) {
            this._sectionHelper.dispose();
            this._sectionHelper = null;
        }
    }

    public addTab(tab: Item) {
        if (this._sectionHelper) {
            this._sectionHelper.addSection(tab.name);
        }

        if (tab.isContext) {
            this.tabs.splice(this.contexts.length, 0, tab)
            this.contexts.push(tab);
        } else {
            this.tabs.push(tab);
            this.contents.push(tab);
        }
    }

    public removeTab(tab: Item) {
        this._sectionHelper.removeSection(tab.name);

        let i = this.tabs.findIndex(item => item == tab);

        if (i != -1) {
            this.tabs.splice(i, 1);
        }
    }

    selectItem(tab: Item) {
        if (!tab.routerLink) {
            this._sectionHelper.selectSection(tab.name);
        }
        else {
            tab.activate();
        }
        // set input focus to the title element of the newly activated tab
        setTimeout(()=>document.getElementById("vtabs-title").focus());
    }

    private onSectionChange(section: string) {
        if (section) {
            let index = this.tabs.findIndex(t => t.name === section);

            if (index < 0) {
                this.logger.log(LogLevel.ERROR, `Invalid section: ${section}`)
                index = 0;
            }
    
            this.tabs.forEach(t => t.deactivate());
            this.tabs[index].activate();
            this._selectedIndex = index;
            this.refresh();
            this.activate.emit(this.tabs[index]);
        } else {
            this.logger.log(LogLevel.WARN, `Empty section: ${section}`)
        }
    }

    private refresh() {
        if (!this._tabsItems || this._selectedIndex < 0) {
            return;
        }
        this.tabs.forEach(t => { t.visible = true });
    }
}

@Component({
    selector: 'vtabs-item',
    template: `
        <div *ngIf="!(!active)">
            <span id="vtabs-title" [tabindex]="isWAC() ? -1 : 0"></span>
            <h1 class="border-active">
                <span>{{name}}</span>
            </h1>
            <ng-content></ng-content>
        </div>
    `,
    styles: [`
        h1 {
            margin: 0;
            padding: 0;
            margin-bottom: 30px;
            line-height: 34px;
            font-size: 18px;
            border-bottom-style: dotted;
            border-bottom-width: 1px;
        }

        span:focus {
            outline-style: dashed;
            outline-color: #000;
            outline-width: 2px;
            outline-offset: -2px;
            text-decoration: underline;
        }
    `],
})
export class Item implements OnInit, OnDestroy {
    @Input() name: string;
    @Input() ico: string = "";
    @Input() visible: boolean = true;
    @Input() active: boolean;
    @Input() routerLink: Array<any>;
    @Input() isContext: boolean;

    @ContentChildren(DynamicComponent) dynamicChildren: QueryList<DynamicComponent>;

    constructor(private _tabs: VTabsComponent, private _router: Router) {}

    ngOnInit() {
        this._tabs.addTab(this);
    }

    private isWAC() {
        return environment.WAC;
    }
    
    activate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.activate());
        }

        if (this.routerLink) {
            this._router.navigate(this.routerLink);
        }

        this.active = true;
    }

    deactivate() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.deactivate());
        }

        this.active = false;
    }

    ngOnDestroy() {
        if (this.dynamicChildren) {
            this.dynamicChildren.forEach(child => child.deactivate());
            this.dynamicChildren.forEach(child => child.destroy());
        }
        this._tabs.removeTab(this);
    }
}


@Component({
    selector: 'context-tab',
    template: `
    <vtabs-item [name]="reference.name" [ico]="reference.ico" [isContext]="true">
        <dynamic [name]="reference.component_name" [module]="reference"></dynamic>
    </vtabs-item>
`})
export class ContextTabComponent {
    @Input() reference: ComponentReference;
}

export const TABS: any[] = [
    ContextTabComponent,
    VTabsComponent,
    Item,
];

@NgModule({
    imports: [
        FormsModule,
        Dynamic,
        CommonModule,
    ],
    exports: [
        TABS,
    ],
    declarations: [
        TABS,
    ]
})
export class Module { }
