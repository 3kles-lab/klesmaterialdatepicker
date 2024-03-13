<!--[![pipeline status](http://gitlab.3kles.local/angular/klesmaterialdatepicker/badges/master/pipeline.svg)](http://gitlab.3kles.local/angular/klesmaterialdatepicker/-/commits/master)-->

# @3kles/kles-material-datepicker

**kles-material-datepicker** is a component library to build `Material Angular Form` to select a date.

## Changelog

Check out the [changelog](./CHANGELOG.md) to check all the latest changes.

## Models

### Interfaces

- <b>KlesMatDatepickerControl</b> -> Interface to set a control associated with a date picker

### Components

- <b>KlesMatDatepicker\<D></b> -> Component to create a date picker

## Install

### npm

```
npm install @3kles/kles-material-datepicker --save
```

## How to use

In the module
```javascript
import { KlesMaterialDatepickerModule } from '@3kles/kles-material-datepicker';
...
@NgModule({
    imports: [
        KlesMaterialDatepickerModule,
        ...
    ]
    ...
})
```

Check the [`documentation`](https://doc.3kles-consulting.com/#/material/datepicker) to use component and directive.

## Tests

```
npm install
npm test
```
## License

[`MIT`](./LICENSE.md)
