import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { DynamicComponent } from "./dynamic.component";

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
    ],
    exports: [
        DynamicComponent,
    ],
    declarations: [
        DynamicComponent,
    ]
})
export class Module { }
