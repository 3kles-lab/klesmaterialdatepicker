import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [],
})
export class AppComponent {

  form: FormGroup;
  constructor() {
    this.form = new FormGroup({
      date: new FormControl()
    })

    this.form.valueChanges.subscribe((value) => console.log('form value change!', value))
  }
}
