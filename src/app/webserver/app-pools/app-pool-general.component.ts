
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {ApplicationPool} from './app-pool';


@Component({
    selector: 'app-pool-general',
    template: `
        <tabs>
            <tab [name]="'Settings'">
                <fieldset>
                    <label>Name</label>
                    <input autofocus class="form-control name" type="text" [(ngModel)]="model.name" (modelChanged)="onModelChanged()" required throttle />
                </fieldset>
                <fieldset>
                    <label>Auto Start</label>
                    <switch class="block" [(model)]="model.auto_start" (modelChanged)="onModelChanged()">{{model.auto_start ? "On" : "Off"}}</switch>
                </fieldset>
                <fieldset>
                    <identity [model]="model.identity" (modelChanged)="onModelChanged()"></identity>
                </fieldset>
                <fieldset>
                    <label>Pipeline</label>
                    <enum [(model)]="model.pipeline_mode" (modelChanged)="onModelChanged()">
                        <field name="Integrated" value="integrated"></field>
                        <field name="Classic" value="classic"></field>
                    </enum>
                </fieldset>
                <fieldset>
                    <label>.NET Framework</label>
                    <enum  [(model)]="model.managed_runtime_version" (modelChanged)="onModelChanged()">
                        <field name="3.5" value="v2.0"></field>
                        <field name="4.x" value="v4.0"></field>
                        <field name="None" value=""></field>
                    </enum>
                </fieldset>
            </tab>
            <tab [name]="'Process'">
                <process-model [model]="model" (modelChanged)="onModelChanged()"></process-model>
                <process-orphaning [model]="model.process_orphaning" (modelChanged)="onModelChanged()"></process-orphaning>
            </tab>
            <tab [name]="'Fail Protection'">
                <rapid-fail-protection [model]="model.rapid_fail_protection" (modelChanged)="onModelChanged()"></rapid-fail-protection>
            </tab>
            <tab [name]="'Recycling'">
                <recycling [model]="model.recycling" (modelChanged)="onModelChanged()"></recycling>
            </tab>
            <tab [name]="'Limits'">
                <fieldset>
                    <label>Request Queue Length</label>
                    <div class="validation-container">
                        <input class="form-control" type="number" [(ngModel)]="model.queue_length" throttle (modelChanged)="onModelChanged()" />
                    </div>
                </fieldset>
                <cpu [model]="model.cpu" (modelChanged)="onModelChanged()"></cpu>
            </tab>
        </tabs>
    `
})
export class AppPoolGeneralComponent {
    @Input()
    model: ApplicationPool;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        // Bubble up model changed event to parent
        this.modelChanged.emit(null);
    }
}
