import { NgModule, Component, Input, Output, ViewChild, ViewChildren, forwardRef, ContentChildren, QueryList, OnInit, ElementRef, Renderer, OnDestroy, EventEmitter, Query } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription'

import { DynamicComponent } from './dynamic.component';
import { SectionHelper } from './section.helper';
import { environment } from 'environments/environment';

@Component({
    selector: 'vtabs',
    template: `
        <div class="vtabs sme-focus-zone">
            <ul id="Manage" class="items">
                <ng-container *ngFor="let tab of contexts; let i = index;">
                    <li class="hover-edit"
                        [ngClass]="{active: tab.active}"
                        (keyup.space)="switchContext(i)"
                        (keyup.enter)="switchContext(i)"
                        (click)="switchContext(i)">
                        <i [class]="tab.ico"></i><span class="border-active">{{tab.name}}</span>
                    </li>
                </ng-container>
            </ul>
            <ul id="Operations" class="items">
                <ng-container *ngFor="let tab of tabs; let i = index;">
                    <li #item
                        class="hover-edit"
                        [ngClass]="{active: tab.active}"
                        (keyup.space)="selectItem(i)"
                        (keyup.enter)="selectItem(i)"
                        (click)="selectItem(i)">
                        <i [class]="tab.ico"></i><span class="border-active">{{tab.name}}</span>
                    </li>
                </ng-container>
            </ul>
            <div class="content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
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
export class VTabsComponent implements OnDestroy {
    @Input() markLocation: boolean;
    @Output() activate: EventEmitter<Item> = new EventEmitter();

    contexts: Item[];
    tabs: Item[];

    private _default: string;
    private _selectedIndex = -1;
    private _menuOn: boolean = false;
    private _tabsItems: Array<ElementRef>;
    private _hashCache: Array<string> = [];
    private _sectionHelper: SectionHelper;
    private _subscriptions: Array<Subscription> = [];
    @ViewChildren('item') private _tabList: QueryList<ElementRef>;
    @ContentChildren(forwardRef(() => Item)) its: QueryList<Item>;

    constructor(private _elem: ElementRef,
        private _renderer: Renderer,
        private _activatedRoute: ActivatedRoute,
        private _location: Location,
        private _router: Router) {
        let webServerContext = new Item(this, this._router);
        webServerContext.ico = 'fa fa-server';
        webServerContext.routerLink = ['/webserver'];
        let appPoolContext = new Item(this, this._router);
        appPoolContext.ico = 'fa fa-cogs';
        appPoolContext.routerLink = ['/webserver/application-pools'];
        let websitesContext = new Item(this, this._router);
        websitesContext.ico = 'fa fa-globe';
        websitesContext.routerLink = ['/webserver/web-sites'];
        this.contexts = [
            webServerContext,
            appPoolContext,
            websitesContext,
        ];
        this.tabs = [];
        this._default = this._activatedRoute.snapshot.params["section"];
    }

    public ngAfterViewInit() {
        this._sectionHelper = new SectionHelper(this.tabs.map(t => t.name), this._default, this.markLocation, this._location, this._router);

        this._subscriptions.push(this._sectionHelper.active.subscribe(sec => this.onSectionChange(sec)));

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
        if (this._selectedIndex === -1 && (this.tabs.length === 0 && !this._default || SectionHelper.normalize(tab.name) == this._default)) {
            tab.activate();
            this._selectedIndex = this.tabs.length;
        }

        if (this._sectionHelper) {
            this._sectionHelper.addSection(tab.name);
        }

        this.tabs.push(tab);
    }

    public removeTab(tab: Item) {
        this._sectionHelper.removeSection(tab.name);

        let i = this.tabs.findIndex(item => item == tab);

        if (i != -1) {
            this.tabs.splice(i, 1);
        }
    }

    switchContext(index: number) {
        let tab = this.contexts[index]
        tab.activate()
    }

    private selectItem(index: number) {
        let tab = this.tabs[index];

        if (!tab.routerLink) {
            this._sectionHelper.selectSection(tab.name);
        }
        else {
            tab.activate();
        }
        
        // set input focus to the title element of the newly activated tab
        tab.focusTitle();
    }

    private onSectionChange(section: string) {
        let index = this.tabs.findIndex(t => t.name === section);

        if (index == -1) {
            index = 0;
        }

        this.tabs.forEach(t => t.deactivate());
        this.tabs[index].activate();
        this._selectedIndex = index;
        this.refresh();
        this.activate.emit(this.tabs[index]);
    }

    private showMenu(show: boolean) {
        this._menuOn = (show == null) ? true : show;
    }

    private refresh() {
        if (!this._tabsItems || this._selectedIndex < 0) {
            return;
        }

        this.tabs.forEach(t => { t.visible = true });
    }
}

@Component({
    selector: 'vtabs > item',
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

    @ContentChildren(DynamicComponent) dynamicChildren: QueryList<DynamicComponent>;

    constructor(private _tabs: VTabsComponent, private _router: Router) {
    }

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

    focusTitle() {
        setTimeout(()=>document.getElementById("vtabs-title").focus());
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

export const TABS: any[] = [
    VTabsComponent,
    Item
];

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        TABS
    ],
    declarations: [
        TABS
    ]
})
export class Module { }
